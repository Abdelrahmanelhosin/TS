const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixConstraintAndSeed() {
  console.log('🔄 Step 1: Dropping strict status constraint...');
  try {
    // Drop the constraint that restricts statuses
    await prisma.$executeRawUnsafe('ALTER TABLE public.surveys DROP CONSTRAINT IF EXISTS surveys_status_check;');
    console.log('✅ Constraint dropped successfully!');
  } catch(e) {
    console.log('⚠️ Could not drop constraint, it might not exist:', e.message);
  }

  console.log('\n🔍 Step 2: Finding admin user...');
  const admins = await prisma.profiles.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  if (!admins || admins.length === 0) {
    console.error('❌ No ADMIN user found!');
    return;
  }
  const creatorId = admins[0].id;
  console.log(`✅ Found admin user: ${creatorId}`);

  console.log('\n📝 Step 3: Inserting 5 test surveys...');
  const surveys = [
    {
      creator_id: creatorId,
      title: 'Tüketici Davranışları ve Online Alışveriş Anketi',
      description: 'Online alışveriş alışkanlıklarını ve tüketici tercihlerini inceleyen kapsamlı araştırma.',
      status: 'draft',
      survey_link: 'https://forms.google.com/survey-1',
      completion_code: 'POLTEM2024A',
      platform: 'Google Forms',
      target_gender: 'Hepsi',
      target_age_group: '18-34',
      reward_amount: 50,
      estimated_time: 10,
      target_city: 'İstanbul',
      target_education: 'Üniversite',
    },
    {
      creator_id: creatorId,
      title: 'Sosyal Medya Kullanımı ve Psikolojik Etkileri',
      description: 'Sosyal medya platformlarının gençler üzerindeki psikolojik etkilerini araştıran çalışma.',
      status: 'active',
      survey_link: 'https://forms.google.com/survey-2',
      completion_code: 'POLTEM2024B',
      platform: 'Google Forms',
      target_gender: 'Hepsi',
      target_age_group: '18-25',
      reward_amount: 75,
      estimated_time: 15,
      target_city: 'Ankara',
      target_education: 'Hepsi',
    },
    {
      creator_id: creatorId,
      title: 'Çalışan Memnuniyeti ve Uzaktan Çalışma Anketi',
      description: 'Uzaktan çalışma döneminde çalışan memnuniyetini ölçen araştırma.',
      status: 'paused',
      survey_link: 'https://forms.google.com/survey-3',
      completion_code: 'POLTEM2024C',
      platform: 'Google Forms',
      target_gender: 'Hepsi',
      target_age_group: '25-45',
      reward_amount: 30,
      estimated_time: 8,
      target_city: 'Hepsi',
      target_education: 'Hepsi',
    },
  ];

  let insertedCount = 0;
  for (const survey of surveys) {
    await prisma.surveys.create({ data: survey });
    insertedCount++;
  }

  console.log(`✅ Successfully inserted ${insertedCount} surveys!`);
  console.log('\n🎉 Done! Refresh the admin dashboard to see the data.');
  
  await prisma.$disconnect();
}

fixConstraintAndSeed().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
