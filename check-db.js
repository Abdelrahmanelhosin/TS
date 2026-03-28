const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== ALL TABLES IN PUBLIC SCHEMA ===');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(JSON.stringify(tables, null, 2));

  } catch (e) {
    console.error('Database Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
