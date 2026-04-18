
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubmissions() {
  try {
    console.log('--- Checking Submission Statuses ---');
    const stats = await prisma.$queryRawUnsafe<any[]>(`
      SELECT status::text, payement_status::text, count(*)::int 
      FROM public.submissions 
      GROUP BY status, payement_status
    `);
    console.log(JSON.stringify(stats, null, 2));

    const samples = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, survey_id, status::text, payement_status::text 
      FROM public.submissions 
      LIMIT 5
    `);
    console.log('\nSamples:', JSON.stringify(samples, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubmissions();
