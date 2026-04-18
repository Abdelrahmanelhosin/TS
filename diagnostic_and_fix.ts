
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullDiagnostic() {
  console.log('🚀 Starting Full System Diagnostic...\n');

  try {
    // 1. Check Survey Columns
    console.log('--- Checking Surveys Columns ---');
    const surveyCols = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'surveys' AND table_schema = 'public'
    `);
    const sNames = surveyCols.map(c => c.column_name);
    console.log(`Names found: ${sNames.join(', ')}`);
    console.log(`target_audience exists: ${sNames.includes('target_audience') ? '✅' : '❌'}`);
    console.log(`target_count exists: ${sNames.includes('target_count') ? '✅' : '❌'}`);

    // 2. Check Submission Columns
    console.log('\n--- Checking Submissions Columns ---');
    const subCols = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'submissions' AND table_schema = 'public'
    `);
    const subNames = subCols.map(c => c.column_name);
    console.log(`Names found: ${subNames.join(', ')}`);
    console.log(`payement_status exists: ${subNames.includes('payement_status') ? '✅' : '❌'}`);
    console.log(`started_at exists: ${subNames.includes('started_at') ? '✅' : '❌'}`);

    // 3. Stats Check
    console.log('\n--- System Stats ---');
    const surveyCount = await prisma.$queryRawUnsafe<any[]>(`SELECT count(*) FROM public.surveys`);
    const submissionCount = await prisma.$queryRawUnsafe<any[]>(`SELECT count(*) FROM public.submissions`);
    console.log(`Total Surveys: ${surveyCount[0].count}`);
    console.log(`Total Submissions: ${submissionCount[0].count}`);

    // 4. Pending Surveys
    const pending = await prisma.$queryRawUnsafe<any[]>(`SELECT id, title FROM public.surveys WHERE status = 'pending' LIMIT 5`);
    console.log(`\nPending Surveys (${pending.length}):`);
    pending.forEach(s => console.log(`- ${s.title} (${s.id})`));

  } catch (error) {
    console.error('\n❌ DIAGNOSTIC ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n--- Diagnostic Complete ---');
  }
}

fullDiagnostic();
