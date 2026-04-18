
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectSchema() {
  try {
    const tables = ['surveys', 'submissions'];
    for (const table of tables) {
      console.log(`--- Table: ${table} ---`);
      const columns = await prisma.$queryRawUnsafe<any[]>(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        AND table_schema = 'public'
      `);
      console.log(JSON.stringify(columns, null, 2));
    }
  } catch (error) {
    console.error('Error inspecting schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSchema();
