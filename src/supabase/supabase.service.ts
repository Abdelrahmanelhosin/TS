import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.warn('Supabase URL or Service Role Key is missing. Supabase client may not function correctly.');
        }

        this.supabase = createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseServiceRoleKey || 'placeholder-key'
        );
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
