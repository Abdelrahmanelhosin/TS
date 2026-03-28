const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const profile = await prisma.profiles.findFirst();
    if (profile) {
      console.log('Profile columns found:', Object.keys(profile));
    } else {
      console.log('No profiles found in DB.');
    }
  } catch (e) {
    console.error('Prisma Error Details:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
