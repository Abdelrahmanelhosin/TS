import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // You can also use SUPABASE_JWT_SECRET if you added it, but for now fallback to the same key or what Supabase gives.
            // Supabase uses the Project JWT Secret which you can find in Settings -> API.
            secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET', 'super-secret-default-key-123'),
        });
    }

    async validate(payload: any) {
        // Find user profile to get their role, since Supabase JWT doesn't map to our custom 'profiles.role' string automatically the same way
        const profile = await this.prisma.profiles.findUnique({
            where: { id: payload.sub }
        });

        if (!profile) {
            throw new UnauthorizedException('Profile not found for this user token');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: profile.role,
            is_researcher: profile.is_researcher
        };
    }
}

