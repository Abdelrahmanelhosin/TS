import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    constructor(
        private supabaseService: SupabaseService,
        private prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] || request.headers['Authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            // Verify token directly with Supabase
            const { data, error } = await this.supabaseService.getClient().auth.getUser(token);

            if (error || !data?.user) {
                throw new UnauthorizedException(`Invalid or expired token: ${error?.message || 'Unknown'}`);
            }

            // Get profile with role - selecting only needed fields to avoid hangs on complex enums
            const profile = await this.prisma.profiles.findUnique({
                where: { id: data.user.id },
                select: { id: true, role: true }
            });

            if (!profile) {
                throw new UnauthorizedException('Profile not found in database');
            }

            // Attach user info to request
            console.log(`Guard processing: User ID: ${data.user.id}, Email: ${data.user.email}, Role: ${profile.role}`);
            
            request.user = {
                userId: data.user.id,
                email: data.user.email,
                role: profile.role,
                is_researcher: (profile.role as any) === 'researcher' || (profile.role as any) === 'admin',
            };

            return true;
        } catch (err: any) {
            console.error('SupabaseAuthGuard Error:', err.message || err);
            if (err instanceof UnauthorizedException) throw err;
            throw new UnauthorizedException(`Verification failed: ${err.message || err}`);
        }
    }
}
