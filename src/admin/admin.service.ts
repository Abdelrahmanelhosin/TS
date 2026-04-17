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
}
