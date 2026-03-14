import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({});
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('Database connected successfully');
        } catch (e) {
            console.warn('Could not connect to database on startup. Application is running in "Offline" mode (Swagger still available).');
        }
    }
}
