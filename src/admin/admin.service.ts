import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers(skip: number = 0, take: number = 10, search?: string, role?: string) {
        let whereClause = '';
        const params: any[] = [];

        if (search) {
            whereClause += ` AND (p.full_name ILIKE $1 OR p.phone ILIKE $2 OR u.email ILIKE $3)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            whereClause += ` AND p.role = $${params.length + 1}`;
            params.push(role);
        }

        const users = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                p.id, p.full_name, p.phone, p.iban, p.full_name_bank, p.tc_identity_number,
                p.balance::text as balance,
                p.created_at, p.updated_at, p.birth_date, p.video_conference_optin, p.email_verified,
                p.education_level::text as education_level,
                p.household_income::text as household_income,
                p.marital_status::text as marital_status,
                p.children_count::text as children_count,
                p.sector_type::text as sector_type,
                p.work_status::text as work_status,
                p.role::text as role,
                p.bank_name::text as bank_name,
                p.occupation::text as occupation,
                p.city::text as city,
                p.gender::text as gender,
                p.nationality::text as nationality,
                p.position::text as position,
                u.email
            FROM public.profiles p
            JOIN auth.users u ON p.id = u.id
            WHERE 1=1 ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ${take} OFFSET ${skip}
        `, ...params);

        const totalCountRes = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT COUNT(*)::int as count FROM public.profiles p 
            JOIN auth.users u ON p.id = u.id
            WHERE 1=1 ${whereClause}
        `, ...params);

        const items = users.map(u => ({
            ...u,
            users: { email: u.email }
        }));

        return { items, total: totalCountRes[0]?.count || 0 };
    }

    async getUserDetails(id: string) {
        const profiles = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                p.id, p.full_name, p.phone, p.iban, p.full_name_bank, p.tc_identity_number,
                p.balance::text as balance,
                p.created_at, p.updated_at, p.birth_date, p.video_conference_optin, p.email_verified,
                p.education_level::text as education_level,
                p.household_income::text as household_income,
                p.marital_status::text as marital_status,
                p.children_count::text as children_count,
                p.sector_type::text as sector_type,
                p.work_status::text as work_status,
                p.role::text as role,
                p.bank_name::text as bank_name,
                p.occupation::text as occupation,
                p.city::text as city,
                p.gender::text as gender,
                p.nationality::text as nationality,
                p.position::text as position,
                u.email
            FROM public.profiles p
            JOIN auth.users u ON p.id = u.id
            WHERE p.id = $1::uuid
        `, id);

        if (!profiles || profiles.length === 0) throw new NotFoundException('User profile not found');
        const profile = {
            ...profiles[0],
            users: { email: profiles[0].email }
        };

        const userSurveys = await this.prisma.surveys.findMany({
            where: { creator_id: id }
        });

        return { ...profile, surveys: userSurveys };
    }

    async assignRole(id: string, role: string) {
        return this.prisma.$executeRawUnsafe(`
            UPDATE public.profiles SET role = $1::user_role WHERE id = $2::uuid
        `, role, id);
    }

    async setResearchPermission(id: string, is_researcher: boolean) {
        const role = is_researcher ? 'researcher' : 'user';
        return this.assignRole(id, role);
    }

    async getDashboardInit() {
        // Multi-query optimization for dashboard speed
        const [stats, pendingRes, recentSrv, allSurveys, usersRes, usersListRes] = await Promise.all([
            // Stats
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT status::text as status, count(*)::int as count 
                FROM public.surveys GROUP BY status
            `),
            // Pending Surveys for Approval
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT 
                    s.id, s.title, s.description, s.survey_link, s.completion_code,
                    s.platform::text as platform, s.reward_amount::text as reward_amount,
                    s.estimated_time, s.total_cost::text as total_cost, s.status::text as status,
                    s.created_at, s.creator_id, s.target_audience,
                    array_to_json(s.target_gender) as target_gender, array_to_json(s.target_age_group) as target_age_group,
                    array_to_json(s.target_city) as target_city, array_to_json(s.target_occupation) as target_occupation,
                    array_to_json(s.target_education) as target_education, array_to_json(s.target_employment_status) as target_employment_status,
                    array_to_json(s.target_sector) as target_sector, array_to_json(s.target_position) as target_position,
                    array_to_json(s.target_marital_status) as target_marital_status, array_to_json(s.target_child_count) as target_child_count,
                    s.target_income, s.duration::text as duration, s.video_conference_optin,
                    u.email as creator_email, p.full_name as creator_name
                FROM public.surveys s
                JOIN auth.users u ON s.creator_id = u.id
                JOIN public.profiles p ON s.creator_id = p.id
                WHERE s.status = 'pending'
                ORDER BY s.created_at DESC LIMIT 20
            `),
            // Recent Surveys for Activities
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT s.id, s.title, s.status::text as status, s.created_at, p.full_name as user_name
                FROM public.surveys s
                JOIN public.profiles p ON s.creator_id = p.id
                ORDER BY s.created_at DESC LIMIT 10
            `),
            // All Surveys - explicit columns only (no s.* to avoid enum casting issues)
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT 
                    s.id, s.title, s.description, s.survey_link, s.completion_code,
                    s.platform::text as platform, s.reward_amount::text as reward_amount,
                    s.estimated_time, s.total_cost::text as total_cost, s.status::text as status,
                    s.created_at, s.creator_id, s.target_audience,
                    array_to_json(s.target_gender) as target_gender, array_to_json(s.target_age_group) as target_age_group,
                    array_to_json(s.target_city) as target_city, array_to_json(s.target_occupation) as target_occupation,
                    array_to_json(s.target_education) as target_education, array_to_json(s.target_employment_status) as target_employment_status,
                    array_to_json(s.target_sector) as target_sector, array_to_json(s.target_position) as target_position,
                    array_to_json(s.target_marital_status) as target_marital_status, array_to_json(s.target_child_count) as target_child_count,
                    s.target_income, s.duration::text as duration, s.video_conference_optin,
                    p.full_name as creator_name,
                    (SELECT count(*)::int FROM public.submissions sub WHERE sub.survey_id = s.id) as submission_count
                FROM public.surveys s
                JOIN public.profiles p ON s.creator_id = p.id
                ORDER BY s.created_at DESC LIMIT 50
            `),
            // User counts
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT count(*)::int as count FROM public.profiles
            `),
            // User list summary (first page)
            this.prisma.$queryRawUnsafe<any[]>(`
                SELECT 
                    p.id, p.full_name, p.phone, p.role::text as role,
                    p.created_at, p.updated_at, p.balance::text as balance,
                    p.iban, p.bank_name::text as bank_name,
                    p.tc_identity_number, p.city::text as city,
                    p.gender::text as gender, p.occupation::text as occupation,
                    u.email
                FROM public.profiles p
                JOIN auth.users u ON p.id = u.id
                ORDER BY p.created_at DESC LIMIT 20
            `)
        ]);

        const formattedStats = {
            total: stats.reduce((acc, curr) => acc + curr.count, 0),
            pending: stats.find(s => s.status === 'pending')?.count || 0,
            approved: stats.find(s => s.status === 'active')?.count || 0,
            completed: stats.find(s => s.status === 'completed')?.count || 0,
            rejected: stats.find(s => s.status === 'rejected')?.count || 0,
            totalUsers: usersRes[0]?.count || 0
        };

        return {
            stats: formattedStats,
            pending: pendingRes.map(p => ({ 
                ...p, 
                users: { email: p.creator_email, profiles: { full_name: p.creator_name } } 
            })),
            surveys: allSurveys.map(s => ({
                ...s,
                users: { profiles: { full_name: s.creator_name } },
                _count: { submissions: s.submission_count }
            })),
            users: {
                items: usersListRes.map(u => ({ ...u, users: { email: u.email } })),
                total: usersRes[0]?.count || 0
            },
            activities: recentSrv.map(s => ({
                id: s.id,
                type: s.status === 'active' ? 'approve' : (s.status === 'completed' ? 'payout' : 'new_request'),
                user: s.user_name || 'Sistem',
                target: s.title,
                time: s.created_at
            }))
        };
    }
}
