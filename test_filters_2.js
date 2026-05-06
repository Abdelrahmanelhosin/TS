const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("=== ALL ACTIVE SURVEYS ===");
    const activeSurveys = await prisma.surveys.findMany({
        where: { status: 'active' },
        select: { id: true, title: true, target_gender: true }
    });
    console.log(JSON.stringify(activeSurveys, null, 2));

    console.log("=== FEMALE USERS ===");
    const femaleUsers = await prisma.profiles.findMany({
        where: { gender: 'kadin' },
        select: { id: true, gender: true },
        take: 1
    });
    console.log("Female user:", femaleUsers[0]);

    if (femaleUsers.length > 0) {
        const p = femaleUsers[0];
        const conditions = [];
        if (p.gender) conditions.push({ OR: [{ target_gender: { has: p.gender } }, { target_gender: { isEmpty: true } }] });
        else conditions.push({ target_gender: { isEmpty: true } });

        const matchedForFemale = await prisma.surveys.findMany({
            where: { status: 'active', AND: conditions },
            select: { id: true, title: true, target_gender: true }
        });
        console.log("Matched for Female:", JSON.stringify(matchedForFemale, null, 2));
    }

    console.log("=== MALE USERS ===");
    const maleUsers = await prisma.profiles.findMany({
        where: { gender: 'erkek' },
        select: { id: true, gender: true },
        take: 1
    });
    console.log("Male user:", maleUsers[0]);

    if (maleUsers.length > 0) {
        const p = maleUsers[0];
        const conditions = [];
        if (p.gender) conditions.push({ OR: [{ target_gender: { has: p.gender } }, { target_gender: { isEmpty: true } }] });
        else conditions.push({ target_gender: { isEmpty: true } });

        const matchedForMale = await prisma.surveys.findMany({
            where: { status: 'active', AND: conditions },
            select: { id: true, title: true, target_gender: true }
        });
        console.log("Matched for Male:", JSON.stringify(matchedForMale, null, 2));
    }
}
test().catch(console.error).finally(() => prisma.$disconnect());
