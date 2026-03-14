/**
 * =====================================================
 * سكريبت إنشاء حساب الأدمن الأول
 * شغّله مرة واحدة بس:
 *   node create-admin.js
 * =====================================================
 */

const SUPABASE_URL = 'https://zcqguwshcnmowggjfcys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWd1d3NoY25tb3dnZ2pmY3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYzNDcwNSwiZXhwIjoyMDg2MjEwNzA1fQ.y-xnk340F9ryXF4ewCnDjLCwAgt93SIjgzqGcs252cg';

// =====================================================
// غير الإيميل والباسورد دول زي ما أنت عاوز
// =====================================================
const ADMIN_EMAIL = 'admin@poltem.com';
const ADMIN_PASSWORD = 'Admin@PolTem2024!';
// =====================================================

async function createAdmin() {
  console.log('🚀 Creating admin user...');

  // 1. إنشاء المستخدم في Supabase Auth
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,   // تأكيد الإيميل تلقائياً
    }),
  });

  const userData = await createRes.json();

  if (!createRes.ok || !userData.id) {
    console.error('❌ Failed to create auth user:', userData);
    return;
  }

  const userId = userData.id;
  console.log(`✅ Auth user created! ID: ${userId}`);

  // 2. تحديث الروول في جدول profiles
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ role: 'ADMIN' }),
    }
  );

  if (profileRes.ok || profileRes.status === 204) {
    console.log('✅ Role set to ADMIN in profiles table!');
  } else {
    const profileErr = await profileRes.text();
    console.warn('⚠️  Could not update profile role (may not exist yet):', profileErr);
    console.log('ℹ️  Try manually setting role=ADMIN in Supabase > Table Editor > profiles > row:', userId);
  }

  console.log('\n========================================');
  console.log('🎉 Admin account ready!');
  console.log('📧 Email:   ', ADMIN_EMAIL);
  console.log('🔑 Password:', ADMIN_PASSWORD);
  console.log('========================================\n');
}

createAdmin().catch(console.error);
