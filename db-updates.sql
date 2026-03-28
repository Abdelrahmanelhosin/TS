-- 1. survey_status_enum
ALTER TABLE surveys ALTER COLUMN status DROP DEFAULT;
-- Convert to text first to safely handle any values like 'draft'
ALTER TABLE surveys ALTER COLUMN status TYPE text USING status::text;
-- Clean up data to be compatible with new enum
UPDATE surveys SET status = 'pending' WHERE status NOT IN ('pending', 'active', 'paused', 'completed', 'rejected');
-- Remove old survey_status type index/name if it exists
DROP TYPE IF EXISTS survey_status CASCADE;
DROP TYPE IF EXISTS survey_status_enum CASCADE;
CREATE TYPE survey_status_enum AS ENUM ('pending', 'active', 'paused', 'completed', 'rejected');
ALTER TABLE surveys ALTER COLUMN status TYPE survey_status_enum USING status::survey_status_enum;
ALTER TABLE surveys ALTER COLUMN status SET DEFAULT 'pending'::survey_status_enum;

-- 2. turkey_city_enum
ALTER TABLE surveys ALTER COLUMN target_city DROP DEFAULT;
DROP TYPE IF EXISTS turkey_city_enum CASCADE;
CREATE TYPE turkey_city_enum AS ENUM (
  'adana', 'adıyaman', 'afyonkarahisar', 'ağrı', 'amasya', 'ankara', 'antalya', 'artvin', 'aydın', 'balıkesir',
  'bilecik', 'bingöl', 'bitlis', 'bolu', 'burdur', 'bursa', 'çanakkale', 'çankırı', 'çorum', 'denizli',
  'diyarbakır', 'edirne', 'elazığ', 'erzincan', 'erzurum', 'eskişehir', 'gaziantep', 'giresun', 'gümüşhane', 'hakkari',
  'hatay', 'ısparta', 'mersin', 'istanbul', 'izmir', 'kars', 'kastamonu', 'kayseri', 'kırklareli', 'kırşehir',
  'kocaeli', 'konya', 'kütahya', 'malatya', 'manisa', 'kahramanmaraş', 'mardin', 'muğla', 'muş', 'nevşehir',
  'niğde', 'ordu', 'rize', 'sakarya', 'samsun', 'siirt', 'sinop', 'sivas', 'tekirdağ', 'tokat',
  'trabzon', 'tunceli', 'şanlıurfa', 'uşak', 'van', 'yozgat', 'zonguldak', 'aksaray', 'bayburt', 'karaman',
  'kırıkkale', 'batman', 'şırnak', 'bartın', 'ardahan', 'ığdır', 'yalova', 'karabük', 'kilis', 'osmaniye', 'düzce'
);
ALTER TABLE surveys 
  ALTER COLUMN target_city TYPE turkey_city_enum[] 
  USING (
    CASE 
      WHEN target_city IS NULL OR TRIM(target_city::text) = '' THEN '{}'::turkey_city_enum[]
      ELSE ARRAY[LOWER(REPLACE(REPLACE(target_city::text, 'İ', 'i'), 'I', 'ı'))::turkey_city_enum]
    END
  );

-- 3. age_group_enum
ALTER TABLE surveys ALTER COLUMN target_age_group DROP DEFAULT;
DROP TYPE IF EXISTS age_group_enum CASCADE;
CREATE TYPE age_group_enum AS ENUM ('18-24', '25-34', '35-44', '45-54', '55+', 'hepsi');
ALTER TABLE surveys 
  ALTER COLUMN target_age_group TYPE age_group_enum[] 
  USING (
    CASE 
      WHEN target_age_group IS NULL OR TRIM(target_age_group::text) = '' THEN '{}'::age_group_enum[]
      ELSE ARRAY[TRIM(target_age_group::text)::age_group_enum]
    END
  );

-- 4. education_level_type
DROP TYPE IF EXISTS education_level_type CASCADE;
CREATE TYPE education_level_type AS ENUM (
  'İlkokul', 'Ortaokul', 'Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'
);

UPDATE public.profiles SET education_level = 'Yüksek Lisans' WHERE education_level = 'Yuksek Lisans';
ALTER TABLE public.profiles 
  ALTER COLUMN education_level TYPE education_level_type 
  USING education_level::text::education_level_type;

-- target_education enum for surveys
ALTER TABLE surveys ALTER COLUMN target_education DROP DEFAULT;
DROP TYPE IF EXISTS education_level_enum CASCADE;
CREATE TYPE education_level_enum AS ENUM (
  'ilkokul', 'ortaokul', 'lise', 'onlisans', 'lisans', 'yuksek_lisans', 'doktora'
);
ALTER TABLE surveys 
  ALTER COLUMN target_education TYPE education_level_enum[] 
  USING (
    CASE 
      WHEN target_education IS NULL OR TRIM(target_education::text) = '' THEN '{}'::education_level_enum[]
      ELSE ARRAY[REPLACE(LOWER(REPLACE(target_education::text, 'İ', 'i')), ' ', '_')::education_level_enum]
    END
  );

-- 5. target_position / position_enum array
ALTER TABLE surveys ALTER COLUMN target_position DROP DEFAULT;
DROP TYPE IF EXISTS position_enum CASCADE;
CREATE TYPE position_enum AS ENUM (
  'hepsi', 'girisimci_isletme_sahibi', 'ust_duzey_yonetici', 'orta_duzey_yonetici', 'alt_duzey_yonetici_takim_lideri', 'calisan'
);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS target_position position_enum[] DEFAULT '{}';


-- 6. occupation
ALTER TABLE public.surveys ALTER COLUMN target_occupation DROP DEFAULT;
DROP TYPE IF EXISTS occupation_enum CASCADE;
CREATE TYPE occupation_enum AS ENUM (
  'Akademisyen', 'Öğretmen', 'Doktor', 'Diş hekimi', 'Hemşire', 'Eczacı', 'Psikolog', 'Avukat', 'Hakim', 'Polis', 'Asker', 'Mühendis', 'Mimar', 'Muhasebeci / Mali müşavir', 'Yazılımcı / Bilişim uzmanı', 'Bankacılık / Finans uzmanı', 'İnsan kaynakları uzmanı', 'Satış / Pazarlama / Halkla İlişkiler', 'Teknisyen / Tekniker / Tasarımcı', 'Serbest meslek', 'Esnaf', 'Çiftçi', 'İşçi', 'Diğer'
);
ALTER TABLE public.surveys 
  ALTER COLUMN target_occupation TYPE occupation_enum[] 
  USING (
    CASE 
      WHEN target_occupation IS NOT NULL THEN ARRAY[target_occupation::text]::occupation_enum[]
      ELSE NULL 
    END
  );
ALTER TABLE public.surveys ALTER COLUMN target_occupation SET DEFAULT '{}';

-- 7. marital_status_enum array
ALTER TABLE surveys ALTER COLUMN target_marital_status DROP DEFAULT;
DROP TYPE IF EXISTS marital_status_enum CASCADE;
CREATE TYPE marital_status_enum AS ENUM ('evli', 'bekar', 'belirtmek_istemiyor');
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS target_marital_status marital_status_enum[] DEFAULT '{}';

-- 8. child_count_enum array
ALTER TABLE surveys DROP COLUMN IF EXISTS target_child_count;
DROP TYPE IF EXISTS child_count_enum CASCADE;
CREATE TYPE child_count_enum AS ENUM ('0', '1', '2', '3', '4', '5+');
ALTER TABLE surveys ADD COLUMN target_child_count child_count_enum[] DEFAULT '{}';


-- 9. sector_enum array
ALTER TABLE public.surveys ALTER COLUMN target_sector DROP DEFAULT;
DROP TYPE IF EXISTS sector_enum CASCADE;
CREATE TYPE sector_enum AS ENUM (
  'Özel sektör', 'Kamu sektörü', 'İşletme sahibi / Esnaaf / Zanaatkâr / Kendi işi'
);
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS target_sector sector_enum[];
ALTER TABLE public.surveys ALTER COLUMN target_sector SET DEFAULT '{}';


-- 10. employment_status_enum array
ALTER TABLE public.surveys ALTER COLUMN target_employment_status DROP DEFAULT;
DROP TYPE IF EXISTS employment_status_enum CASCADE;
CREATE TYPE employment_status_enum AS ENUM (
  'Çalışıyor', 'Çalışmıyor', 'Öğrenci', 'Emekli', 'Ev Hanımı'
);
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS target_employment_status employment_status_enum[];
ALTER TABLE public.surveys ALTER COLUMN target_employment_status SET DEFAULT '{}';


-- 11. income_range_enum array
ALTER TABLE public.surveys ALTER COLUMN target_household_income DROP DEFAULT;
DROP TYPE IF EXISTS income_range_enum CASCADE;
CREATE TYPE income_range_enum AS ENUM (
  '0 - 40.000 TL', '40.001 - 80.000 TL', '80.001 - 120.000 TL', '120.001 - 160.000 TL', '160.001 TL ve üzeri'
);
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS target_household_income income_range_enum[];
ALTER TABLE public.surveys ALTER COLUMN target_household_income SET DEFAULT '{}';


-- 12. gender_enum
ALTER TABLE public.surveys ALTER COLUMN target_gender DROP DEFAULT;
DROP TYPE IF EXISTS gender_enum CASCADE;
CREATE TYPE gender_enum AS ENUM ('erkek', 'kadın');
ALTER TABLE public.surveys 
  ALTER COLUMN target_gender TYPE gender_enum 
  USING (
    CASE 
      WHEN target_gender = 'erkek' THEN 'erkek'::gender_enum
      WHEN target_gender = 'kadın' THEN 'kadın'::gender_enum
      ELSE NULL 
    END
  );


-- 13. Profiles Additional fields updates
alter table public.profiles
  add column if not exists marital_status text,
  add column if not exists child_count integer,
  add column if not exists child_count_not_specified boolean not null default false;

alter table public.profiles drop constraint if exists profiles_marital_status_check;
alter table public.profiles add constraint profiles_marital_status_check check (marital_status is null or marital_status in ('Evli', 'Bekar', 'Belirtmek istemiyorum'));

alter table public.profiles drop constraint if exists profiles_child_count_check;
alter table public.profiles add constraint profiles_child_count_check check (child_count is null or child_count >= 0);

DROP TYPE IF EXISTS household_income_level CASCADE;
create type public.household_income_level as enum (
  '0 - 40.000 TL', '40.001 - 80.000 TL', '80.001 - 120.000 TL', '120.001 - 160.000 TL', '160.001 TL ve üzeri'
);
alter table public.profiles add column if not exists household_income public.household_income_level;


alter table public.profiles drop constraint if exists profiles_occupation_check;
update public.profiles set occupation = trim(occupation);
update public.profiles set occupation = 'Öğrenci' where occupation in ('Ogrenci', 'ogrenci', 'Öğrenci');
update public.profiles set occupation = 'Ev Hanımı' where occupation in ('Ev Hanimi', 'Ev hanimi', 'ev hanimi', 'Ev Hanımı');
update public.profiles set occupation = 'Çalışıyor' where occupation in ('Calisiyor', 'Çalışıyor');
update public.profiles set occupation = 'Çalışmıyor' where occupation in ('Calismiyor', 'Çalışmıyor');
update public.profiles set occupation = null where occupation in ('Belirtmek istemiyorum', '');

alter table public.profiles add constraint profiles_occupation_check check (
    occupation is null or occupation in (
      'Çalışıyor', 'Çalışmıyor', 'Öğrenci', 'Emekli', 'Ev Hanımı', 'Akademisyen', 'Öğretmen', 'Doktor', 'Diş hekimi', 'Hemşire', 'Eczacı', 'Psikolog', 'Avukat', 'Hakim', 'Polis', 'Asker', 'Mühendis', 'Mimar', 'Muhasebeci / Mali müşavir', 'Yazılımcı / Bilişim uzmanı', 'Bankacılık / Finans uzmanı', 'İnsan kaynakları uzmanı', 'Satış / Pazarlama personeli', 'Reklam / Halkla İlişkiler Uzmanı', 'Satış / Pazarlama / Halkla İlişkiler', 'Grafik tasarımcı', 'Serbest meslek', 'Esnaf', 'Çiftçi', 'İşçi', 'Diğer'
    )
);

alter table public.profiles add column if not exists sector_type text, add column if not exists position text;
alter table public.profiles drop constraint if exists profiles_sector_type_check;
alter table public.profiles add constraint profiles_sector_type_check check (
    sector_type is null or sector_type in (
      'Özel sektör', 'Kamu sektörü', 'İşletme sahibi / Esnaf / Zanaatkâr / Kendi işi', 'İşletme sahibi / Esnaaf / Zanaatkâr / Kendi işi'
    )
);

alter table public.profiles drop constraint if exists profiles_position_check;
alter table public.profiles add constraint profiles_position_check check (
    position is null or position in (
      'Girişimci / İşletme sahibi', 'Üst düzey yönetici', 'Orta düzey yönetici', 'Alt düzey yönetici / Takım lideri', 'Çalışan'
    )
);

ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS video_conference_optin BOOLEAN DEFAULT false;
