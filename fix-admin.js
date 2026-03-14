require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();

async function fixLogin() {
  console.log('🔄 Checking Supabase Login...');
  const email = 'admin@poltem.com';
  const password = 'Admin@PolTem2024!';

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authErr) {
    console.error('❌ Supabase Error:', authErr.message);
    if(authErr.message.includes('Invalid login credentials')) {
        console.log('  ⚠️ YOU NEED TO RESET THIS PASSWORD IN THE SUPABASE DASHBOARD!');
    }
  } else {
    console.log('✅ Supabase Login SUCCESS! User ID:', authData.user.id);
    
    // Check if the role is ADMIN
    const profile = await prisma.profiles.findUnique({ where: { id: authData.user.id } });
    
    if (profile?.role !== 'ADMIN') {
      console.log('⚠️ Warning: The user does NOT have the ADMIN role in the database. Updating now...');
      await prisma.profiles.upsert({
        where: { id: authData.user.id },
        update: { role: 'ADMIN', full_name: 'Admin Poltem' },
        create: { id: authData.user.id, role: 'ADMIN', full_name: 'Admin Poltem' }
      });
      console.log('✅ ROLE UPDATED TO ADMIN! You can now log in to the dashboard! 🎉');
    } else {
      console.log('✅ The role is already ADMIN. Everything is completely perfect!');
    }
  }

  await prisma.$disconnect();
}

fixLogin();
