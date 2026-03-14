import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private supabaseService: SupabaseService,
    ) { }

    async login(loginDto: LoginDto) {
        const client = this.supabaseService.getClient();

        const { data, error } = await client.auth.signInWithPassword({
            email: loginDto.email,
            password: loginDto.password,
        });

        if (error || !data.session) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Return the Supabase JWT directly
        return {
            access_token: data.session.access_token,
        };
    }
}

