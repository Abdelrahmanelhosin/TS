import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
console.log('Client keys:', Object.keys(client));
console.log('Client options keys:', Object.keys((client as any)._options || {}));
