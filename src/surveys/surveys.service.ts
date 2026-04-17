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
            },
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

        // Filter logic:
        // 1. Status must be 'active'
        // 2. For each criteria: either 'hepsi' is present in the target array OR the profile value matches an entry in the target array OR the target array is empty
        return this.prisma.surveys.findMany({
            where: {
                status: 'active',
                AND: [
                    { OR: [{ target_age_group: { has: 'hepsi' } }, { target_age_group: { has: (profile as any).age_group } }, { target_age_group: { isEmpty: true } }] }, // Birth date calculation logic can be added if needed
                    { OR: [{ target_city: { has: 'hepsi' } }, { target_city: { has: (profile as any).city } }, { target_city: { isEmpty: true } }] },
                    { OR: [{ target_education: { has: (profile as any).education_level } }, { target_education: { isEmpty: true } }] },
                    { OR: [{ target_employment_status: { has: (profile as any).work_status } }, { target_employment_status: { isEmpty: true } }] },
                    { OR: [{ target_sector: { path: '$', string_contains: 'ozel_sektor' } }, { target_sector: { equals: [] } }, { target_sector: { equals: null } }] as any },
                    { OR: [{ target_income: { path: '$', string_contains: '0_40000' } }, { target_income: { equals: [] } }, { target_income: { equals: null } }] as any },
                    { OR: [{ target_marital_status: { has: (profile as any).marital_status } }, { target_marital_status: { isEmpty: true } }] },
                    { OR: [{ target_child_count: { has: (profile as any).children_count } }, { target_child_count: { isEmpty: true } }] }
                ]
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
            data: updateSurveyDto,
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

        // Parse demographic fields gracefully strings -> arrays
        // "hepsi" means "all" = no filter, so we store an empty array
        const toArray = (val: any) => {
            if (!val) return undefined;
            if (Array.isArray(val)) {
                // Filter out 'hepsi' - it means "all" so we use empty array
                const filtered = val.filter((v: string) => v.toLowerCase() !== 'hepsi');
                return filtered.length === 0 ? [] : filtered;
            }
            if (typeof val === 'string') {
                if (val.toLowerCase() === 'hepsi') return [];
                return [val];
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
            const match = submissions.find(s => {
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
            rows: subs.map(s => {
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

        if (!survey || !(survey as any).target_count || survey.status === 'completed') return;

        const approvedCount = await this.prisma.submissions.count({
            where: { survey_id: surveyId, status: 'approved' }
        });

        if (approvedCount >= (survey as any).target_count) {
            await this.prisma.surveys.update({
                where: { id: surveyId },
                data: { status: 'completed' }
            });
        }
    }
}

