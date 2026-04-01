# PolTem - API & Backend

PolTem, araştırmacıların anket oluşturabileceği ve kullanıcı katılım verilerinin yönetildiği merkezi API servisidir.

## 🚀 Özellikler

- **Survey Management:** Anket oluşturma, onaylama ve تعديل المبالغ.
- **CSV Matching:** Google Forms verilerini sistemle eşleştirme.
- **Bank Payment Export:** Onaylanan katılımlar için IBAN listesi oluşturma.
- **Identity & Auth:** Supabase Auth entegrasyonu.

## 🛠️ Teknolojiler

- **Backend:** NestJS
- **ORM:** Prisma
- **Database:** Supabase (PostgreSQL)

## 📦 Kurulum

1. `npm install`
2. `.env` dosyasını oluşturun (Supabase URL, Key).
3. `npx prisma generate`
4. `npm run start:dev`

## 📄 API Dokümantasyonu

Uygulama çalışırken `http://localhost:3005/api` adresinden Swagger dokümantasyonuna ulaşabilirsiniz.

---
*Not: Admin Dashboard bu depoya dahil değildir.*
