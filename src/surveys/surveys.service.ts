import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
    constructor(private prisma: PrismaService) { }

    async create(createSurveyDto: CreateSurveyDto, creator_id: string) {
        return this.prisma.surveys.create({
            data: {
                ...createSurveyDto,
                creator_id,
                status: 'pending',
            } as any,
        });
    }

    async findAllApproved() {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                s.*,
                s.status::text as status,
                s.target_education::text[] as target_education,
                s.target_occupation::text[] as target_occupation,
                s.target_marital_status::text[] as target_marital_status,
                s.target_child_count::text[] as target_child_count,
                s.target_position::text[] as target_position,
                s.target_age_group::text[] as target_age_group,
                s.target_employment_status::text[] as target_employment_status,
                s.target_sector::text[] as target_sector,
                s.target_income::text[] as target_income,
                s.target_gender::text[] as target_gender,
                s.target_city::text[] as target_city,
                u.email as creator_email
            FROM public.surveys s
            JOIN auth.users u ON s.creator_id = u.id
            WHERE s.status = 'active'
        `);
        return surveys.map(s => ({ ...s, users: { email: s.creator_email }, participants: [] }));
    }

    async findAllForUser(userId: string) {
        const profile = await this.prisma.profiles.findUnique({
            where: { id: userId }
        });

        if (!profile) return [];

        const p = profile as any;
        const conditions: any[] = [];

        // Helper to add condition: match if user has attribute AND it's in survey targets, OR if survey has no target (empty array)
        // We also check for 'hepsi' (all) option for some enums

        // 1. Gender
        if (p.gender) {
            conditions.push({
                OR: [
                    { target_gender: { has: p.gender } },
                    { target_gender: { isEmpty: true } }
                ]
            });
        } else {
            conditions.push({ target_gender: { isEmpty: true } });
        }

        // 2. Age Group (Derived from birth_date)
        if (p.birth_date) {
            const birth = new Date(p.birth_date);
            const age = new Date().getFullYear() - birth.getFullYear();
            let ageGroup: string | null = null;
            if (age >= 18 && age <= 24) ageGroup = 'V18_24';
            else if (age >= 25 && age <= 34) ageGroup = 'V25_34';
            else if (age >= 35 && age <= 44) ageGroup = 'V35_44';
            else if (age >= 45 && age <= 54) ageGroup = 'V45_54';
            else if (age >= 55) ageGroup = 'ustu';

            if (ageGroup) {
                conditions.push({
                    OR: [
                        { target_age_group: { has: ageGroup as any } },
                        { target_age_group: { has: 'hepsi' as any } },
                        { target_age_group: { isEmpty: true } }
                    ]
                });
            }
        }

        // 3. Location (City)
        if (p.city) {
            conditions.push({
                OR: [
                    { target_city: { has: p.city } },
                    { target_city: { isEmpty: true } }
                ]
            });
        }

        // 4. Education
        if (p.education_level) {
            conditions.push({
                OR: [
                    { target_education: { has: p.education_level } },
                    { target_education: { has: 'hepsi' as any } },
                    { target_education: { isEmpty: true } }
                ]
            });
        }

        // 5. Employment/Work Status
        if (p.work_status) {
            conditions.push({
                OR: [
                    { target_employment_status: { has: p.work_status } },
                    { target_employment_status: { isEmpty: true } }
                ]
            });
        }

        // 6. Marital Status
        if (p.marital_status) {
            conditions.push({
                OR: [
                    { target_marital_status: { has: p.marital_status } },
                    { target_marital_status: { isEmpty: true } }
                ]
            });
        }

        // 7. Child Count
        if (p.children_count) {
            conditions.push({
                OR: [
                    { target_child_count: { has: p.children_count } },
                    { target_child_count: { isEmpty: true } }
                ]
            });
        }

        // 8. Income
        if (p.household_income) {
            conditions.push({
                OR: [
                    { target_income: { has: p.household_income } },
                    { target_income: { isEmpty: true } }
                ]
            });
        }

        // 9. Nationality
        if (p.nationality) {
            conditions.push({
                OR: [
                    { target_nationality: { has: p.nationality } },
                    { target_nationality: { isEmpty: true } }
                ]
            });
        }

        // 10. Occupation
        if (p.occupation) {
            conditions.push({
                OR: [
                    { target_occupation: { has: p.occupation } },
                    { target_occupation: { isEmpty: true } }
                ]
            });
        }

        // 11. Sector
        if (p.sector_type) {
            conditions.push({
                OR: [
                    { target_sector: { has: p.sector_type } },
                    { target_sector: { isEmpty: true } }
                ]
            });
        }

        // 12. Position
        if (p.position) {
            conditions.push({
                OR: [
                    { target_position: { has: p.position } },
                    { target_position: { isEmpty: true } }
                ]
            });
        }

        return this.prisma.surveys.findMany({
            where: {
                status: 'active',
                AND: conditions.length > 0 ? conditions : undefined
            },
            include: {
                users: {
                    select: { email: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async findPending() {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                s.*,
                s.status::text as status,
                s.target_education::text[] as target_education,
                s.target_occupation::text[] as target_occupation,
                s.target_marital_status::text[] as target_marital_status,
                s.target_child_count::text[] as target_child_count,
                s.target_position::text[] as target_position,
                s.target_age_group::text[] as target_age_group,
                s.target_employment_status::text[] as target_employment_status,
                s.target_sector::text[] as target_sector,
                s.target_income::text[] as target_income,
                s.target_gender::text[] as target_gender,
                s.target_city::text[] as target_city,
                u.email as creator_email,
                (SELECT COUNT(*)::int FROM public.submissions sub WHERE sub.survey_id = s.id) as participant_count
            FROM public.surveys s
            JOIN auth.users u ON s.creator_id = u.id
            WHERE s.status = 'pending'
        `);

        return surveys.map(s => ({
            ...s,
            users: { email: s.creator_email },
            _count: { submissions: s.participant_count },
            participants: [] // Ensure frontend doesn't crash on .map()
        }));
    }

    async findAllForAdmin() {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                s.*,
                s.status::text as status,
                s.target_education::text[] as target_education,
                s.target_occupation::text[] as target_occupation,
                s.target_marital_status::text[] as target_marital_status,
                s.target_child_count::text[] as target_child_count,
                s.target_position::text[] as target_position,
                s.target_age_group::text[] as target_age_group,
                s.target_employment_status::text[] as target_employment_status,
                s.target_sector::text[] as target_sector,
                s.target_income::text[] as target_income,
                s.target_gender::text[] as target_gender,
                s.target_city::text[] as target_city,
                u.email as creator_email,
                (SELECT COUNT(*)::int FROM public.submissions sub WHERE sub.survey_id = s.id) as participant_count
            FROM public.surveys s
            JOIN auth.users u ON s.creator_id = u.id
            ORDER BY s.created_at DESC
        `);

        return surveys.map(s => ({
            ...s,
            users: { email: s.creator_email },
            _count: { submissions: s.participant_count },
            participants: [] // Ensure frontend doesn't crash on .map()
        }));
    }

    async getStats() {
        const [total, pending, approved, rejected, completed, totalUsers, totalResearchers] = await Promise.all([
            this.prisma.surveys.count(),
            this.prisma.surveys.count({ where: { status: 'pending' as any } }),
            this.prisma.surveys.count({ where: { status: 'active' as any } }),
            this.prisma.surveys.count({ where: { status: 'paused' as any } }),
            this.prisma.surveys.count({ where: { status: 'completed' as any } }),
            this.prisma.profiles.count(),
            this.prisma.profiles.count({ where: { role: 'researcher' } }),
        ]);

        const platformDataGroups = await this.prisma.surveys.groupBy({
            by: ['platform'],
            _count: { id: true }
        });

        const statusDataGroups = await this.prisma.surveys.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        return {
            total, pending, approved, rejected, completed, totalUsers, totalResearchers,
            chartData: {
                platforms: platformDataGroups,
                statuses: statusDataGroups
            }
        };
    }

    async getRecentPending() {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                s.*,
                s.status::text as status,
                s.target_education::text[] as target_education,
                s.target_occupation::text[] as target_occupation,
                s.target_marital_status::text[] as target_marital_status,
                s.target_child_count::text[] as target_child_count,
                s.target_position::text[] as target_position,
                s.target_age_group::text[] as target_age_group,
                s.target_employment_status::text[] as target_employment_status,
                s.target_sector::text[] as target_sector,
                s.target_income::text[] as target_income,
                s.target_gender::text[] as target_gender,
                s.target_city::text[] as target_city,
                u.email as creator_email
            FROM public.surveys s
            JOIN auth.users u ON s.creator_id = u.id
            WHERE s.status = 'pending'
            ORDER BY s.created_at DESC
            LIMIT 10
        `);
        return surveys.map(s => ({ ...s, users: { email: s.creator_email }, participants: [] }));
    }

    async findOne(id: string) {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                s.*,
                s.status::text as status,
                s.target_education::text[] as target_education,
                s.target_occupation::text[] as target_occupation,
                s.target_marital_status::text[] as target_marital_status,
                s.target_child_count::text[] as target_child_count,
                s.target_position::text[] as target_position,
                s.target_age_group::text[] as target_age_group,
                s.target_employment_status::text[] as target_employment_status,
                s.target_sector::text[] as target_sector,
                s.target_income::text[] as target_income,
                s.target_gender::text[] as target_gender,
                s.target_city::text[] as target_city,
                u.email as creator_email,
                (SELECT COUNT(*)::int FROM public.submissions sub WHERE sub.survey_id = s.id) as submission_count
            FROM public.surveys s
            JOIN auth.users u ON s.creator_id = u.id
            WHERE s.id = $1::uuid
        `, id);

        if (!surveys || surveys.length === 0) throw new NotFoundException('Survey not found');
        
        const survey = surveys[0];

        // Get submissions separately
        // Get submissions separately via Raw SQL to avoid Prisma sync issues
        const submissions = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                sub.id, sub.user_id, sub.survey_id, sub.status::text as status, 
                sub.updated_at, sub.metadata, sub.created_at,
                u.email as "userEmail"
            FROM public.submissions sub
            JOIN auth.users u ON sub.user_id = u.id
            WHERE sub.survey_id = $1::uuid
            ORDER BY sub.updated_at DESC
            LIMIT 50
        `, id);

        const mappedSubmissions = submissions.map(sub => ({
            ...sub,
            users: { email: sub.userEmail }
        }));

        return {
            ...survey,
            users: { email: survey.creator_email },
            submissions: mappedSubmissions,
            _count: { submissions: survey.submission_count },
            participants: mappedSubmissions.map(sub => ({
                userId: sub.user_id,
                date: sub.updated_at,
                status: sub.status
            }))
        };
    }

    async findByResearcher(creator_id: string) {
        return this.prisma.surveys.findMany({ where: { creator_id } });
    }

    async update(id: string, updateSurveyDto: UpdateSurveyDto, creator_id: string) {
        const survey = await this.findOne(id);
        if (survey.creator_id !== creator_id) {
            throw new ForbiddenException('You can only update your own surveys');
        }
        return this.prisma.surveys.update({
            where: { id },
            data: updateSurveyDto as any,
        });
    }

    async remove(id: string, creator_id: string) {
        const survey = await this.findOne(id);
        if (survey.creator_id !== creator_id) {
            throw new ForbiddenException('You can only delete your own surveys');
        }
        return this.prisma.surveys.delete({ where: { id } });
    }

    async adminUpdate(id: string, reward_amount?: number, estimated_time?: number) {
        await this.findOne(id);
        const data: any = {};
        if (reward_amount !== undefined) data.reward_amount = reward_amount;
        if (estimated_time !== undefined) data.estimated_time = estimated_time;

        return this.prisma.surveys.update({
            where: { id },
            data,
        });
    }

    async approve(id: string, updateData?: any) {
        await this.findOne(id);

        const data: any = { status: 'active' };

        // Basic fields
        if (updateData?.reward_amount !== undefined) data.reward_amount = updateData.reward_amount;
        if (updateData?.estimated_time !== undefined) data.estimated_time = updateData.estimated_time;
        if (updateData?.title) data.title = updateData.title;
        if (updateData?.description) data.description = updateData.description;
        if (updateData?.survey_link) data.survey_link = updateData.survey_link;
        if (updateData?.platform) data.platform = updateData.platform;
        if (updateData?.total_cost !== undefined) data.total_cost = updateData.total_cost;
        if (updateData?.target_audience !== undefined) data.target_audience = updateData.target_audience;

        // Parse demographic fields gracefully strings -> arrays
        // "hepsi" means "all" = no filter, so we store an empty array
        const toArray = (val: any) => {
            if (!val) return undefined;
            
            const normalize = (v: any): string => {
                if (typeof v !== 'string') return v;
                const s = v.trim();
                // Fix for Turkish 'İ' which becomes 'i\u0307' in standard toLowerCase()
                let lower = s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
                lower = lower.replace(/\u0307/g, ''); // strip out combining dots just in case
                
                // Gender
                if (lower === 'erkek') return 'erkek';
                if (lower === 'kadın' || lower === 'kadin') return 'kadin';
                
                // Age group
                if (s === '18-24') return 'V18_24';
                if (s === '25-34') return 'V25_34';
                if (s === '35-44') return 'V35_44';
                if (s === '45-54') return 'V45_54';
                if (s === '55+') return 'ustu';
                
                // Education
                if (s === 'İlkokul' || lower === 'ilkokul') return 'ilkokul';
                if (s === 'Ortaokul' || lower === 'ortaokul') return 'ortaokul';
                if (s === 'Lise' || lower === 'lise') return 'lise';
                if (s === 'Önlisans' || lower === 'onlisans' || lower === 'önlisans') return 'onlisans';
                if (s === 'Lisans' || lower === 'lisans') return 'lisans';
                if (s === 'Yüksek Lisans' || lower === 'yüksek lisans' || lower === 'yuksek lisans') return 'yuksek_lisans';
                if (s === 'Doktora' || lower === 'doktora') return 'doktora';
                
                // Marital Status
                if (s === 'Evli' || lower === 'evli') return 'evli';
                if (s === 'Bekar' || lower === 'bekar') return 'bekar';
                if (lower.includes('istemiyor')) return 'belirtmek_istemiyor';

                // Work Status
                if (s === 'Çalışıyor' || lower === 'çalışıyor' || lower === 'calisiyor') return 'calisiyor';
                if (s === 'Çalışmıyor' || lower === 'çalışmıyor' || lower === 'calismiyor') return 'calismiyor';
                if (s === 'Öğrenci' || lower === 'öğrenci' || lower === 'ogrenci') return 'ogrenci';
                if (s === 'Emekli' || lower === 'emekli') return 'emekli';
                if (lower.includes('hanımı') || lower.includes('hanimi')) return 'ev_hanimi';

                // Income (maps to income_enum)
                if (s.includes('0 - 40.000')) return 'I0_40000';
                if (s.includes('40.001 - 80.000')) return 'I40001_80000';
                if (s.includes('80.001 - 120.000')) return 'I80001_120000';
                if (s.includes('120.001 - 160.000')) return 'I120001_160000';
                if (lower.includes('160.001') && lower.includes('üzeri')) return 'uzeri';


                // Child count
                if (s === '0') return 'C0';
                if (s === '1') return 'C1';
                if (s === '2') return 'C2';
                if (s === '3') return 'C3';
                if (s === '4') return 'C4';
                if (s === '5+') return 'C5_plus';

                // Position (MUST come before Sector - "Girişimci / İşletme Sahibi" contains "işletme sahibi" too)
                if (lower.includes('girişimci') || lower.includes('girisimci')) return 'girisimci_isletme_sahibi';
                if (lower.includes('üst düzey') || lower.includes('ust duzey')) return 'ust_duzey_yonetici';
                if (lower.includes('orta düzey') || lower.includes('orta duzey')) return 'orta_duzey_yonetici';
                if (lower.includes('takım lideri') || lower.includes('takim lideri')) return 'alt_duzey_yonetici_takim_lideri';
                if (lower === 'çalışan' || lower === 'calisan') return 'calisan';

                // Sector (after Position to avoid collision with "Girişimci / İşletme Sahibi")
                if (lower.includes('özel sektör') || lower.includes('ozel sektor')) return 'ozel_sektor';
                if (lower.includes('kamu sektörü') || lower.includes('kamu sektoru')) return 'kamu_sektoru';
                if ((lower.includes('işletme sahibi') || lower.includes('isletme sahibi')) && (lower.includes('esnaf') || lower.includes('zanaatk') || lower.includes('kendi'))) return 'isletme_sahibi_esnaf_zanaatkar_kendi_isi';

                // Occupation
                if (s === 'Akademisyen') return 'akademisyen';
                if (s === 'Öğretmen') return 'ogretmen';
                if (s === 'Doktor') return 'doktor';
                if (s === 'Diş Hekimi') return 'dis_hekimi';
                if (s === 'Hemşire') return 'hemsire';
                if (s === 'Eczacı') return 'eczaci';
                if (s === 'Psikolog') return 'psikolog';
                if (s === 'Avukat') return 'avukat';
                if (s === 'Hakim') return 'hakim';
                if (s === 'Polis') return 'polis';
                if (s === 'Asker') return 'asker';
                if (s === 'Mühendis') return 'muhendis';
                if (s === 'Mimar') return 'mimar';
                if (s.includes('Muhasebeci')) return 'muhasebeci_mali_musavir';
                if (s.includes('Yazılımcı')) return 'yazilimci_bilisim_uzmani';
                if (s.includes('Bankacılık')) return 'bankacilik_finans_uzmani';
                if (s.includes('İnsan Kaynakları')) return 'insan_kaynaklari_uzmani';
                if (s.includes('Satış')) return 'satis_pazarlama_halkla_iliskiler';
                if (s.includes('Teknisyen')) return 'teknisyen_tekniker_tasarimci';
                if (s === 'Serbest Meslek') return 'serbest_meslek';
                if (s === 'Esnaf') return 'esnaf';
                if (s === 'Çiftçi') return 'ciftci';
                if (s === 'İşçi') return 'isci';
                if (s === 'Diğer') return 'diger';

                // Nationality
                if (s === 'T.C.' || lower === 'tc' || lower === 't.c.') return 'T_R';
                if (lower === 'diğer' || lower === 'diger') return 'Diger';

                // Fallback for cities and others: normalize Turkish characters
                let normalized = lower.replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
                
                // Strip any remaining spaces or non-word chars if it's supposed to be an enum (like cities)
                // Actually, enum keys like 'kahramanmaras' don't have spaces.
                return normalized;
            };

            if (Array.isArray(val)) {
                // Filter out 'hepsi' - it means "all" so we use empty array
                const filtered = val
                    .map(v => normalize(v))
                    .filter((v: string) => v !== 'hepsi');
                return filtered.length === 0 ? [] : filtered;
            }
            if (typeof val === 'string') {
                const s = normalize(val);
                if (s === 'hepsi') return [];
                return [s];
            }
            return undefined;
        };

        if (updateData?.target_gender) data.target_gender = toArray(updateData.target_gender);
        if (updateData?.target_age_group) data.target_age_group = toArray(updateData.target_age_group);
        if (updateData?.target_city) data.target_city = toArray(updateData.target_city);
        if (updateData?.target_education) data.target_education = toArray(updateData.target_education);
        if (updateData?.target_occupation) data.target_occupation = toArray(updateData.target_occupation);
        if (updateData?.target_sector) data.target_sector = toArray(updateData.target_sector);
        if (updateData?.target_position) data.target_position = toArray(updateData.target_position);
        if (updateData?.target_income) data.target_income = toArray(updateData.target_income);
        if (updateData?.target_nationality) data.target_nationality = toArray(updateData.target_nationality);

        // Handle both old and new frontend field names
        const workStatus = updateData?.target_employment_status || updateData?.target_work_status;
        if (workStatus) data.target_employment_status = toArray(workStatus);

        const maritalStatus = updateData?.target_marital_status || updateData?.target_marital;
        if (maritalStatus) data.target_marital_status = toArray(maritalStatus);

        const childCount = updateData?.target_child_count || updateData?.target_children;
        if (childCount) data.target_child_count = toArray(childCount);

        return this.prisma.surveys.update({
            where: { id },
            data,
        });
    }

    async reject(id: string) {
        await this.findOne(id);
        return this.prisma.surveys.update({
            where: { id },
            data: { status: 'paused' },
        });
    }

    async restore(id: string) {
        await this.findOne(id);
        return this.prisma.surveys.update({
            where: { id },
            data: { status: 'pending' as any },
        });
    }

    async complete(id: string) {
        await this.findOne(id);
        return this.prisma.surveys.update({
            where: { id: id },
            data: { status: 'completed' },
        });
    }

    private async findUserByParticipantCode(code: string) {
        if (!code) return null;
        const cleaned = String(code).trim();

        // 1. Global Search: Try to find any existing submission with this unique_id in metadata
        // Using raw query for JSON path to avoid Prisma engine limitations with JSON filtering
        const globalMatches: any[] = await this.prisma.$queryRaw`
            SELECT s.*, p.full_name, p.phone, p.tc_identity_number
            FROM public.submissions s
            JOIN public.profiles p ON s.user_id = p.id
            WHERE s.metadata->>'unique_id' = ${cleaned}
            AND (s.metadata->>'shadow' IS NULL OR s.metadata->>'shadow' = 'false')
            LIMIT 1
        `;

        if (globalMatches && globalMatches.length > 0) {
            const match = globalMatches[0];
            return {
                id: match.user_id,
                full_name: match.full_name,
                phone: match.phone,
                tc_identity_number: match.tc_identity_number
            };
        }

        // 2. Fallback: Try match by TC Identity Number
        const profileByTC = await this.prisma.profiles.findFirst({
            where: { tc_identity_number: cleaned },
            include: { users: { select: { email: true } } }
        });
        if (profileByTC) return profileByTC;

        // 3. Fallback: Try match by Phone
        const profileByPhone = await this.prisma.profiles.findFirst({
            where: { phone: cleaned },
            include: { users: { select: { email: true } } }
        });
        if (profileByPhone) return profileByPhone;

        return null;
    }

    async getSubmissions(surveyId: string) {
        await this.findOne(surveyId);
        const subs = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                sub.*, sub.status::text as status,
                u.email,
                p.full_name, p.phone, p.tc_identity_number, p.bank_name::text as bank_name, p.iban, p.full_name_bank
            FROM public.submissions sub
            JOIN auth.users u ON sub.user_id = u.id
            LEFT JOIN public.profiles p ON sub.user_id = p.id
            WHERE sub.survey_id = $1::uuid
            ORDER BY sub.updated_at DESC
        `, surveyId);

        return subs.map(s => ({
            ...s,
            users: {
                email: s.email,
                profiles: {
                    full_name: s.full_name,
                    phone: s.phone,
                    tc_identity_number: s.tc_identity_number,
                    bank_name: s.bank_name,
                    iban: s.iban,
                    full_name_bank: s.full_name_bank
                }
            }
        }));
    }

    async updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected') {
        const submission = await this.prisma.submissions.findUnique({
            where: { id: submissionId }
        });

        if (submission) {
            const scoreChange = status === 'approved' ? 5 : -10;
            await this.prisma.profiles.update({
                where: { id: submission.user_id },
                data: {}
            });
        }

        const updated = await this.prisma.submissions.update({
            where: { id: submissionId },
            data: { status }
        });

        if (status === 'approved' && submission) {
            await this.checkSurveyCompletion(submission.survey_id);
        }

        return updated;
    }

    async matchCSV(surveyId: string, csvRows: { unique_id?: string, email?: string }[]) {
        const submissions = await this.getSubmissions(surveyId);

        const matched = [];
        const unmatchedCsv = [];

        for (const sub of submissions) {
            const trustScore = (sub as any).users?.profiles?.trust_score ?? 100;
            // const res = await this.aiService.analyzeCampaign(surveyId); // Assuming aiService is available
            // Just placeholder for auto-close check
        }

        for (const row of csvRows) {
            const match = submissions.find((s: any) => {
                if (row.unique_id && (s as any).unique_id) return (s as any).unique_id === row.unique_id;
                if (row.email && (s as any).users?.email) return (s as any).users.email.toLowerCase() === row.email.toLowerCase();
                return false;
            });
            if (match) {
                matched.push({ csv: row, submission: match });
            } else {
                unmatchedCsv.push(row);
            }
        }

        for (const m of matched) {
            await this.prisma.submissions.update({
                where: { id: m.submission.id },
                data: { status: 'approved' }
            });
            await this.prisma.profiles.update({
                where: { id: (m.submission as any).user_id },
                data: {}
            });
        }

        if (matched.length > 0) {
            await this.checkSurveyCompletion(surveyId);
        }

        const matchedIds = new Set(matched.map(m => m.submission.id));
        const unmatchedSubmissions = (submissions as any[]).filter(s => !matchedIds.has(s.id));

        return { matched, unmatchedCsv, unmatchedSubmissions };
    }

    async getPaymentTable(surveyId: string) {
        const surveys = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT id, title, reward_amount::text as reward_amount, total_cost::text as total_cost
            FROM public.surveys WHERE id = $1::uuid
        `, surveyId);
        
        if (!surveys || surveys.length === 0) throw new NotFoundException('Survey not found');
        const survey = surveys[0];

        const subs = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT 
                sub.*, sub.status::text as status,
                sub.payement_status::text as "paymentStatus",
                u.email,
                p.full_name, p.tc_identity_number, p.bank_name::text as bank_name, p.iban, p.full_name_bank, p.role::text as role
            FROM public.submissions sub
            LEFT JOIN auth.users u ON sub.user_id = u.id
            LEFT JOIN public.profiles p ON sub.user_id = p.id
            WHERE sub.survey_id = $1::uuid AND sub.status = 'approved'
        `, surveyId);

        return {
            survey_title: survey.title,
            reward_amount: survey.reward_amount,
            rows: subs.map((s: any) => {
                const metadata = (s.metadata as any) || {};
                const isShadow = metadata.shadow === true || metadata.new_shadow === true;
                const participantCode = metadata.unique_id || '';

                return {
                    full_name: isShadow ? `Guest (Code: ${participantCode})` : (s.full_name || s.full_name_bank || s.email || '—'),
                    tc_identity_number: isShadow ? '—' : (s.tc_identity_number || '—'),
                    bank_name: isShadow ? '—' : (s.bank_name || '—'),
                    iban: isShadow ? '—' : (s.iban || '—'),
                    full_name_bank: isShadow ? '—' : (s.full_name_bank || '—'),
                    email: isShadow ? '—' : (s.email || '—'),
                    reward_amount: survey.reward_amount,
                    is_shadow: isShadow,
                    participant_code: participantCode
                };
            })
        };
    }

    async validateAdvancedCSV(surveyId: string, rows: any[], rules: any[]) {
        console.log(`Starting Advanced Validation for survey ${surveyId} with ${rows.length} rows`);
        const survey = await this.prisma.surveys.findUnique({ where: { id: surveyId } });
        if (!survey) throw new Error('Survey not found');

        const submissions = await this.getSubmissions(surveyId);
        const results = { approved: 0, rejected: 0, skipped: 0, imported: 0, flaggedRows: [] as any[] };
        const seenIds = new Set<string>();

        for (const row of rows) {
            const uniqueId = row.unique_id || row['Unique ID'] || row['ID'] || row['Katılımcı Kodu'];
            if (!uniqueId) {
                console.log('Skipping row: No uniqueId found', row);
                results.skipped++;
                continue;
            }

            let submission = (submissions as any[]).find(s => String(s.unique_id || s.metadata?.unique_id || '').trim() === String(uniqueId).trim());

            if (!submission) {
                try {
                    const realUser = await this.findUserByParticipantCode(uniqueId);
                    const userId = realUser ? realUser.id : survey.creator_id;
                    const isShadow = !realUser;

                    console.log(`Importing ${isShadow ? 'shadow' : 'linked'} participant: ${uniqueId}`);
                    submission = await this.prisma.submissions.create({
                        data: {
                            survey_id: surveyId,
                            user_id: userId,
                            status: 'pending',
                            metadata: {
                                unique_id: uniqueId,
                                imported: true,
                                shadow: isShadow,
                                new_shadow: isShadow, // Tag specifically for UI classification
                                raw_data: row
                            }
                        }
                    });
                    results.imported++;
                } catch (e) {
                    console.error(`Import failed for ${uniqueId}:`, e.message);
                    results.skipped++;
                    continue;
                }
            }

            let isFlagged = false;
            let messages = [];

            for (const rule of rules) {
                if (rule.type === 'equality') {
                    const rowVal = String(row[rule.column] || '').trim().toLowerCase();
                    const expectedVal = String(rule.value || '').trim().toLowerCase();
                    if (rowVal !== expectedVal) {
                        isFlagged = true;
                        messages.push(rule.message || `${rule.column} mismatch`);
                    }
                } else if (rule.type === 'contradiction') {
                    const isContradiction = rule.conditions.every((cond: any) => {
                        const rowVal = String(row[cond.column] || '').trim().toLowerCase();
                        const targetVal = String(cond.value || '').trim().toLowerCase();
                        return cond.operator === '==' ? rowVal === targetVal : rowVal !== targetVal;
                    });
                    if (isContradiction) {
                        isFlagged = true;
                        messages.push(rule.message || 'Contradiction');
                    }
                } else if (rule.type === 'range') {
                    const rowVal = parseFloat(row[rule.column]);
                    if (isNaN(rowVal) || rowVal < rule.min || rowVal > rule.max) {
                        isFlagged = true;
                        messages.push(rule.message || `${rule.column} out of range`);
                    }
                }
            }

            const status = isFlagged ? 'rejected' : 'approved';

            // Local duplicate detection (seenIds)
            let finalStatus = status;
            if (finalStatus === 'approved') {
                if (seenIds.has(uniqueId)) {
                    finalStatus = 'rejected';
                    messages.push('MÜKERRER (Duplicate in CSV)');
                } else {
                    seenIds.add(uniqueId);
                }
            }

            await this.prisma.submissions.update({
                where: { id: submission.id },
                data: {
                    status: finalStatus as any,
                    metadata: {
                        ...(submission.metadata as any || {}),
                        unique_id: uniqueId,
                        validation_errors: messages
                    }
                }
            });

            if (finalStatus === 'approved') results.approved++;
            else {
                results.rejected++;
                results.flaggedRows.push({ ...row, _error: messages.join(', ') });
            }
        }

        if (results.approved > 0) {
            await this.checkSurveyCompletion(surveyId);
        }

        return results;
    }

    async validateCSVAnswers(surveyId: string, rows: any[], idCol: string, ansCol: string, correctVal: string) {
        const submissions = await this.getSubmissions(surveyId);
        const results = { approved: 0, rejected: 0, skipped: 0 };

        for (const row of rows) {
            const uniqueId = row[idCol];
            const userAnswer = row[ansCol];

            if (!uniqueId) continue;

            const submission = (submissions as any[]).find(s => s.unique_id === uniqueId);
            if (!submission) {
                results.skipped++;
                continue;
            }

            const status = String(userAnswer).trim().toLowerCase() === String(correctVal).trim().toLowerCase()
                ? 'approved'
                : 'rejected';

            await this.prisma.submissions.update({
                where: { id: submission.id },
                data: { status }
            });

            await this.prisma.profiles.update({
                where: { id: submission.user_id },
                data: {}
            });

            if (status === 'approved') results.approved++;
            else results.rejected++;
        }

        if (results.approved > 0) {
            await this.checkSurveyCompletion(surveyId);
        }

        return results;
    }

    private async checkSurveyCompletion(surveyId: string) {
        const survey = await this.prisma.surveys.findUnique({
            where: { id: surveyId }
        });

        if (!survey || !(survey as any).target_audience || survey.status === 'completed') return;

        const approvedCount = await this.prisma.submissions.count({
            where: { survey_id: surveyId, status: 'approved' }
        });

        if (approvedCount >= (survey as any).target_audience) {
            await this.prisma.surveys.update({
                where: { id: surveyId },
                data: { status: 'completed' }
            });
        }
    }
}

