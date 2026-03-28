const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('🔍 Checking Database...');
  
  // 1. Find or fix ADMIN
  const adminProfile = await prisma.profiles.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminProfile) {
    console.log('❌ No ADMIN found! Please run "node create-admin.js" first.');
    return;
  }
  console.log(`✅ Found Admin: ${adminProfile.full_name || 'Admin'} (${adminProfile.id})`);

  // 2. Seed Surveys if empty
  const surveyCount = await prisma.surveys.count();
  if (surveyCount === 0) {
    console.log('📝 Seeding test surveys...');
    await prisma.surveys.createMany({
      data: [
        {
          creator_id: adminProfile.id,
          title: 'Genel Memnuniyet Anketi',
          description: 'Hizmet kalitemizi ölçmek için kısa bir anket.',
          status: 'draft',
          survey_link: 'https://forms.google.com/test1',
          completion_code: 'TEST123',
          reward_amount: 50,
          target_count: 100,
          reached_count: 45
        },
        {
          creator_id: adminProfile.id,
          title: 'Yeni Ürün Geri Bildirimi',
          description: 'Yeni özellikler hakkındaki düşünceleriniz.',
          status: 'draft',
          survey_link: 'https://forms.google.com/test2',
          completion_code: 'FEEDBACK',
          reward_amount: 25,
          target_count: 50,
          reached_count: 0
        }
      ]
    });
    console.log('✅ Test surveys added!');
  } else {
    console.log(`✅ Database already has ${surveyCount} surveys.`);
  }

  // 3. Check stats
  const stats = {
    totalUsers: await prisma.profiles.count(),
    pending: await prisma.surveys.count({ where: { status: 'draft' } }),
    approved: await prisma.surveys.count({ where: { status: 'active' } }),
    completed: await prisma.surveys.count({ where: { status: 'completed' } })
  };
  console.log('\n📊 Current Stats in Database:');
  console.table(stats);

  console.log('\n🚀 Everything looks ready! Refresh your dashboard.');
}

fix().catch(e => {
  console.error('❌ Error:', e);
}).finally(() => prisma.$disconnect());
