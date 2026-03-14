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
                status: 'PENDING',
            },
        });
    }

    async findAllApproved() {
        return this.prisma.surveys.findMany({
            where: { status: 'APPROVED' },
            include: {
                users: {
                    select: { email: true }
                }
            }
        });
    }

    async findPending() {
        return this.prisma.surveys.findMany({
            where: { status: 'PENDING' },
            include: {
                users: {
                    select: { email: true }
                }
            }
        });
    }

    async findAllForAdmin() {
        return this.prisma.surveys.findMany({
            include: {
                users: {
                    select: { email: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async getStats() {
        const [total, pending, approved, rejected, completed, totalUsers, totalResearchers] = await Promise.all([
            this.prisma.surveys.count(),
            this.prisma.surveys.count({ where: { status: 'draft' } }),
            this.prisma.surveys.count({ where: { status: 'active' } }),
            this.prisma.surveys.count({ where: { status: 'paused' } }),
            this.prisma.surveys.count({ where: { status: 'completed' } }),
            this.prisma.profiles.count(),
            this.prisma.profiles.count({ where: { is_researcher: true } }),
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
        return this.prisma.surveys.findMany({
            where: { status: 'draft' },
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
                users: {
                    select: { email: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const survey = await this.prisma.surveys.findUnique({ where: { id } });
        if (!survey) throw new NotFoundException('Survey not found');
        return survey;
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

    async approve(id: string, reward_amount?: number, estimated_time?: number) {
        await this.findOne(id);
        const data: any = { status: 'active' };
        if (reward_amount !== undefined) data.reward_amount = reward_amount;
        if (estimated_time !== undefined) data.estimated_time = estimated_time;

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
            data: { status: 'draft' },
        });
    }

    async complete(id: string) {
        await this.findOne(id);
        return this.prisma.surveys.update({
            where: { id },
            data: { status: 'completed' },
        });
    }

    async getSubmissions(surveyId: string) {
        await this.findOne(surveyId);
        return this.prisma.submissions.findMany({
            where: { survey_id: surveyId },
            include: {
                users: {
                    select: {
                        email: true,
                        profiles: {
                            select: {
                                full_name: true,
                                phone: true,
                                tc_identity_number: true,
                                bank_name: true,
                                iban: true,
                                full_name_bank: true,
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async matchCSV(surveyId: string, csvRows: { unique_id?: string, email?: string }[]) {
        const submissions = await this.getSubmissions(surveyId);
        
        const matched = [];
        const unmatchedCsv = [];
        
        for (const row of csvRows) {
            const match = submissions.find(s => {
                if (row.unique_id && s.unique_id) return s.unique_id === row.unique_id;
                if (row.email && s.users?.email) return s.users.email.toLowerCase() === row.email.toLowerCase();
                return false;
            });
            if (match) {
                matched.push({ csv: row, submission: match });
            } else {
                unmatchedCsv.push(row);
            }
        }

        const matchedIds = new Set(matched.map(m => m.submission.id));
        const unmatchedSubmissions = submissions.filter(s => !matchedIds.has(s.id));

        return { matched, unmatchedCsv, unmatchedSubmissions };
    }

    async getPaymentTable(surveyId: string) {
        const survey = await this.findOne(surveyId);
        const submissions = await this.prisma.submissions.findMany({
            where: { survey_id: surveyId, status: 'approved' },
            include: {
                users: {
                    select: {
                        email: true,
                        profiles: {
                            select: {
                                full_name: true,
                                tc_identity_number: true,
                                bank_name: true,
                                iban: true,
                                full_name_bank: true,
                            }
                        }
                    }
                }
            }
        });

        return {
            survey_title: survey.title,
            reward_amount: survey.reward_amount,
            rows: submissions.map(s => ({
                full_name: s.users?.profiles?.full_name || '—',
                tc_identity_number: s.users?.profiles?.tc_identity_number || '—',
                bank_name: s.users?.profiles?.bank_name || '—',
                iban: s.users?.profiles?.iban || '—',
                full_name_bank: s.users?.profiles?.full_name_bank || '—',
                email: s.users?.email || '—',
                reward_amount: survey.reward_amount,
            }))
        };
    }
}

