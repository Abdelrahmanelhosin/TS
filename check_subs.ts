import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get ALL submissions with their user_ids
  const subs = await prisma.$queryRawUnsafe<any[]>(
    `SELECT sub.id, sub.user_id, sub.survey_id, sub.status::text as status, sub.reject_reason, sub.metadata,
            u.email 
     FROM public.submissions sub 
     JOIN auth.users u ON sub.user_id = u.id 
     ORDER BY sub.created_at DESC
     LIMIT 10`
  );
  
  console.log('=== ALL SUBMISSIONS ===');
  for (const s of subs) {
    console.log(`  user_id: "${s.user_id}"`);
    console.log(`  email: "${s.email}"`);
    console.log(`  status: ${s.status}`);
    console.log(`  reject_reason: ${s.reject_reason}`);
    console.log(`  metadata: ${JSON.stringify(s.metadata)}`);
    console.log(`  survey_id: ${s.survey_id}`);
    console.log('  ---');
  }

  // Now show what the CSV IDs look like for comparison
  console.log('\n=== EXPECTED CSV IDS (user_ids from DB) ===');
  for (const s of subs) {
    console.log(`  "${s.user_id}" -> ${s.email}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
