# PolTem - Araştırma ve Anket Platformu

PolTem, araştırmacıların anket oluşturabileceği, kullanıcıların bu anketlere katılarak ödül kazanabileceği kapsamlı bir web platformudur.

## 🚀 Özellikler

- **Admin Paneli:** Kullanıcı yönetimi, anket onaylama/reddetme, istatistik takibi.
- **Araştırmacı Portalı:** Yeni anket oluşturma, hedef kitle belirleme, CSV matching ile doğrulama.
- **Kullanıcı Sistemi:** Profil yönetimi, anketlere katılım, ödül bakiye takibi.
- **CSV Matching:** Google Forms vb. platformlardan gelen verileri sistemdeki katılım kayıtlarıyla eşleştirme.
- **Ödeme Tablosu:** Onaylanan katılımlar için otomatik bankا (IBAN) ödeme listesi oluşturma.

## 🛠️ Teknolojiler

- **Backend:** NestJS, Prisma ORM, Supabase (PostgreSQL).
- **Frontend:** React.js, TailwindCSS, Lucide-React.
- **Identity & Auth:** Supabase Auth.

## 📦 Kurulum

### 1. Backend

1. `npm install`
2. `.env` dosyasını oluşturun (Supabase URL, Key و غيره).
3. `npx prisma generate`
4. `npm run start:dev`

### 2. Admin Dashboard

1. `cd admin-dashboard`
2. `npm install`
3. `AdminDashboard.js` içindeki `API_BASE_URL` değişkenini güncelleyin.
4. `npm start`

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
