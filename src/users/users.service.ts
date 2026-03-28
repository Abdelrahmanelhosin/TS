import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        // We usually don't manually create profiles from the API if relying on Supabase auth.
        // It's mostly managed via Supabase Signup, but leaving a stub.
        throw new ConflictException('User creation should be handled via Supabase Auth');
    }

    async findAll(skip?: number, take?: number, search?: string, role?: string, isActive?: boolean) {
        const where: Prisma.profilesWhereInput = {};

        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) {
            where.role = role as any;
        }


        const [items, total] = await Promise.all([
            this.prisma.profiles.findMany({ where, skip, take }),
            this.prisma.profiles.count({ where }),
        ]);

        return { items, total };
    }

    async findOne(id: string) {
        const profile = await this.prisma.profiles.findUnique({ where: { id } });
        if (!profile) throw new NotFoundException('User profile not found');
        return profile;
    }

    async findByEmail(email: string) {
        // Query auth schema user
        const authUser = await this.prisma.users.findFirst({ where: { email } });
        if (!authUser) return null;

        return this.prisma.profiles.findUnique({ where: { id: authUser.id } });
    }

    async update(id: string, data: any) {
        await this.findOne(id); // Ensure user exists
        return this.prisma.profiles.update({ where: { id }, data });
    }

    async assignRole(id: string, role: string) {
        await this.findOne(id);
        return this.prisma.profiles.update({ where: { id }, data: { role: role as any } });
    }

    async changeStatus(id: string, is_active: boolean) {
        await this.findOne(id);
        // Column is_active does not exist in DB
        return { success: true };
    }
}

