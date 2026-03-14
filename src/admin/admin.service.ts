import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers(skip?: number, take?: number, search?: string, role?: string, isActive?: boolean) {
        const where: any = {};

        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (isActive !== undefined) {
            where.is_active = isActive;
        }

        const [users, total] = await Promise.all([
            this.prisma.profiles.findMany({ where, skip, take }),
            this.prisma.profiles.count({ where }),
        ]);

        return { items: users, total };
    }

    async getUserDetails(id: string) {
        // Find profile and related auth user data
        const profile = await this.prisma.profiles.findUnique({
            where: { id },
        });
        if (!profile) throw new NotFoundException('User profile not found');

        // Find surveys created by this user
        const userSurveys = await this.prisma.surveys.findMany({
            where: { creator_id: id }
        });

        return { ...profile, surveys: userSurveys };
    }

    async assignRole(id: string, role: string) {
        const profile = await this.prisma.profiles.findUnique({ where: { id } });
        if (!profile) throw new NotFoundException('User profile not found');
        return this.prisma.profiles.update({ where: { id }, data: { role } });
    }

    async setResearchPermission(id: string, is_researcher: boolean) {
        const profile = await this.prisma.profiles.findUnique({ where: { id } });
        if (!profile) throw new NotFoundException('User profile not found');
        return this.prisma.profiles.update({ where: { id }, data: { is_researcher } });
    }
}
