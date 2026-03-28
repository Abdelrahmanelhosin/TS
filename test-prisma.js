const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Prisma Queries ---');
  
  try {
    console.log('1. Testing profiles.findFirst()...');
    const profile = await prisma.profiles.findFirst();
    console.log('Profiles OK');
  } catch (e) {
    console.error('Profiles Error:', e.message);
  }

  try {
    console.log('\n2. Testing surveys.findFirst()...');
    const survey = await prisma.surveys.findFirst();
    console.log('Surveys OK');
  } catch (e) {
    console.error('Surveys Error:', e.message);
  }

  try {
    console.log('\n3. Testing submissions.findFirst()...');
    const submission = await prisma.submissions.findFirst();
    console.log('Submissions OK');
  } catch (e) {
    console.error('Submissions Error:', e.message);
  }
}

main()
  .catch(e => console.error('Script Error:', e))
  .finally(() => prisma.$disconnect());
