const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFilters() {
    console.log("🚀 Starting Comprehensive Filter Verification...");

    // 1. Fetch a target profile
    const profile = await prisma.profiles.findFirst({
        where: { NOT: { birth_date: null } },
        include: { users: true }
    });

    if (!profile) {
        console.log("❌ No profile with birth_date found for testing.");
        return;
    }

    console.log(`👤 Testing with Profile: ${profile.full_name} (${profile.id})`);
    console.log(`   - Gender: ${profile.gender}`);
    console.log(`   - Birth Date: ${profile.birth_date}`);
    console.log(`   - City: ${profile.city}`);
    console.log(`   - Income: ${profile.household_income}`);
    console.log(`   - Nationality: ${profile.nationality}`);

    // Calculate Age Group (Replicating app logic)
    const birth = new Date(profile.birth_date);
    const age = new Date().getFullYear() - birth.getFullYear();
    let ageGroup = null;
    if (age >= 18 && age <= 24) ageGroup = 'V18_24';
    else if (age >= 25 && age <= 34) ageGroup = 'V25_34';
    else if (age >= 35 && age <= 44) ageGroup = 'V35_44';
    else if (age >= 45 && age <= 54) ageGroup = 'V45_54';
    else if (age >= 55) ageGroup = 'ustu';
    console.log(`   - Calculated Age: ${age} -> Group: ${ageGroup}`);

    // 2. Build Query conditions (Replicating SurveysService.findAllForUser)
    const p = profile;
    const conditions = [];

    if (p.gender) conditions.push({ OR: [{ target_gender: { has: p.gender } }, { target_gender: { isEmpty: true } }] });
    
    if (ageGroup) {
        conditions.push({ 
            OR: [
                { target_age_group: { has: ageGroup } }, 
                { target_age_group: { has: 'hepsi' } }, 
                { target_age_group: { isEmpty: true } }
            ] 
        });
    }

    if (p.city) {
        conditions.push({ 
            OR: [
                { target_city: { has: p.city } }, 
                { target_city: { isEmpty: true } }
            ] 
        });
    }

    if (p.household_income) {
        conditions.push({ 
            OR: [
                { target_income: { has: p.household_income } }, 
                { target_income: { isEmpty: true } }
            ] 
        });
    }

    if (p.nationality) {
        conditions.push({ 
            OR: [
                { target_nationality: { has: p.nationality } }, 
                { target_nationality: { isEmpty: true } }
            ] 
        });
    }

    console.log("\n🔍 Running Query with full demographic conditions...");
    
    const surveys = await prisma.surveys.findMany({
        where: {
            status: 'active',
            AND: conditions.length > 0 ? conditions : undefined
        },
        select: {
            id: true,
            title: true,
            target_gender: true,
            target_age_group: true,
            target_income: true,
            target_nationality: true
        }
    });

    console.log(`✅ Found ${surveys.length} matching surveys.`);
    
    // 3. Validation Logic
    surveys.forEach(s => {
        let match = true;
        
        // Match Gender
        if (s.target_gender.length > 0 && p.gender && !s.target_gender.includes(p.gender)) {
            console.log(`  ❌ MISMATCH in Gender for survey: ${s.title}`);
            match = false;
        }

        // Match Age
        if (s.target_age_group.length > 0 && ageGroup && !s.target_age_group.includes(ageGroup) && !s.target_age_group.includes('hepsi')) {
            console.log(`  ❌ MISMATCH in Age Group for survey: ${s.title}`);
            match = false;
        }

        // Match Income
        if (s.target_income.length > 0 && p.household_income && !s.target_income.includes(p.household_income)) {
            console.log(`  ❌ MISMATCH in Income for survey: ${s.title}`);
            match = false;
        }

        if (match) {
            console.log(`  ⭐ Survey "${s.title}" matches correctly.`);
        }
    });

    console.log("\n🏁 Verification Complete.");
}

verifyFilters()
    .catch(err => console.error("❌ Error during verification:", err))
    .finally(() => prisma.$disconnect());
