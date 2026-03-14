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
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            // Verify token directly with Supabase
            const { data, error } = await this.supabaseService.getClient().auth.getUser(token);

            if (error || !data?.user) {
                console.error('Supabase auth.getUser error:', error);
                throw new UnauthorizedException(`Invalid or expired token: ${error?.message || 'Unknown'}`);
            }

            // Get profile with role
            const profile = await this.prisma.profiles.findUnique({
                where: { id: data.user.id },
            });

            if (!profile) {
                throw new UnauthorizedException('Profile not found');
            }

            // Attach user info to request
            request.user = {
                userId: data.user.id,
                email: data.user.email,
                role: profile.role,
                is_researcher: profile.is_researcher,
            };

            return true;
        } catch (err: any) {
            console.error('SupabaseAuthGuard Exception:', err);
            if (err instanceof UnauthorizedException) throw err;
            throw new UnauthorizedException(`Token verification failed: ${err.message || err}`);
        }
    }
}
