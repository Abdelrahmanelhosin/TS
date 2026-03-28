const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== LATEST SURVEYS (TARGETING) ===');
    const surveys = await prisma.surveys.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
          id: true,
          title: true,
          status: true,
          target_gender: true,
          target_age_group: true,
          target_city: true,
          target_education: true,
          target_employment_status: true,
          target_sector: true,
          target_position: true,
          target_income: true,
          target_marital_status: true,
          target_child_count: true
      }
    });
    console.log(JSON.stringify(surveys, null, 2));

    console.log('\n=== LATEST PROFILES (DEMOGRAPHICS) ===');
    const profiles = await prisma.profiles.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      select: {
          id: true,
          full_name: true,
          gender: true,
          age_group: true,
          city: true,
          education_level: true,
          work_status: true,
          sector_type: true,
          household_income: true,
          marital_status: true,
          children_count: true
      }
    });
    console.log(JSON.stringify(profiles, null, 2));

  } catch (e) {
    console.error('Database Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
