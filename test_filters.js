const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("Fetching a profile (female)...");
    const profile = await prisma.profiles.findFirst({
        where: { gender: 'kadin' }
    });

    if (!profile) {
        console.log("No female profile found.");
        return;
    }
    
    console.log("Female profile found:", profile.id, profile.gender);
    
    // Simulate findAllForUser conditions for this user
    const p = profile;
    const conditions = [];

    if (p.gender) conditions.push({ OR: [{ target_gender: { has: p.gender } }, { target_gender: { isEmpty: true } }] });
    else conditions.push({ target_gender: { isEmpty: true } });

    console.log("Querying surveys with conditions:", JSON.stringify(conditions, null, 2));

    const surveys = await prisma.surveys.findMany({
        where: {
            status: 'active',
            AND: conditions
        },
        select: { id: true, title: true, target_gender: true }
    });

    console.log("Returned surveys:", surveys);
    
    console.log("\n--- Checking actual survey data of a known 'erkek' survey ---");
    const erkekSurvey = await prisma.surveys.findFirst({
         where: { target_gender: { has: 'erkek' } },
         select: { id: true, title: true, target_gender: true, status: true }
    });
    console.log("Erkek survey:", erkekSurvey);
}

test().catch(console.error).finally(() => prisma.$disconnect());
