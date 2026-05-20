/**
 * PolTem Platform — Centralized Lookup Constants
 * All UI dropdown options and DB-to-display label mappings live here.
 * This is the single source of truth; the frontend fetches these via GET /admin/lookups.
 */

export const GENDER_OPTIONS = ['Hepsi', 'Kadın', 'Erkek', 'Diğer'];

export const AGE_OPTIONS = ['Hepsi', '18-24', '25-34', '35-44', '45-54', '55+'];

export const EDUCATION_OPTIONS = [
  'Hepsi', 'İlkokul', 'Ortaokul', 'Lise', 'Önlisans', 'Lisans',
  'Yüksek Lisans', 'Doktora',
];

export const MARITAL_OPTIONS = ['Hepsi', 'Evli', 'Bekar', 'Belirtmek İstemiyor'];

export const WORK_STATUS_OPTIONS = [
  'Hepsi', 'Çalışıyor', 'Çalışmıyor', 'Öğrenci', 'Emekli', 'Ev Hanımı',
];

export const INCOME_OPTIONS = [
  'Hepsi',
  '0 - 40.000 TL',
  '40.001 - 80.000 TL',
  '80.001 - 120.000 TL',
  '120.001 - 160.000 TL',
  '160.001 TL ve üzeri',
];

export const CHILDREN_OPTIONS = ['Hepsi', '0', '1', '2', '3', '4', '5+'];

export const CITY_OPTIONS = [
  'Hepsi', 'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara',
  'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis',
  'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin',
  'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin',
  'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun',
  'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli',
  'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt',
  'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır',
  'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce',
];

export const SECTOR_OPTIONS = [
  'Hepsi',
  'Özel Sektör',
  'Kamu Sektörü',
  'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi',
];

export const POSITION_OPTIONS = [
  'Hepsi',
  'Girişimci / İşletme Sahibi',
  'Üst Düzey Yönetici',
  'Orta Düzey Yönetici',
  'Alt Düzey Yön. / Takım Lideri',
  'Çalışan',
];

export const OCCUPATION_OPTIONS = [
  'Hepsi', 'Akademisyen', 'Öğretmen', 'Doktor', 'Diş Hekimi', 'Hemşire',
  'Eczacı', 'Psikolog', 'Avukat', 'Hakim', 'Polis', 'Asker', 'Mühendis',
  'Mimar', 'Muhasebeci / Mali Müşavir', 'Yazılımcı / Bilişim Uzmanı',
  'Bankacılık / Finans Uzmanı', 'İnsan Kaynakları Uzmanı',
  'Satış / Pazarlama / H.İlişkiler', 'Teknisyen / Tekniker / Tasarımcı',
  'Serbest Meslek', 'Esnaf', 'Çiftçi', 'İşçi', 'Diğer',
];

/**
 * DB enum value → UI display label mapping
 * The database stores ASCII snake_case values; the UI needs Turkish display labels.
 */
export const DB_TO_DISPLAY: Record<string, string> = {
  // gender_type
  erkek: 'Erkek', kadin: 'Kadın', diger: 'Diğer',
  // age_group_enum (Prisma mapped identifiers)
  a18_24: '18-24', a25_34: '25-34', a35_44: '35-44', a45_54: '45-54', a55_ustu: '55+',
  '18_24': '18-24', '25_34': '25-34', '35_44': '35-44', '45_54': '45-54', '55_ustu': '55+',
  // sector_enum (raw DB values)
  ozel_sektor: 'Özel Sektör',
  kamu_sektoru: 'Kamu Sektörü',
  isletme_sahibi_esnaf_zanaatkar_kendi_isi: 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi',
  // sector_enum_type (profiles - Prisma identifiers)
  Ozel_sektor: 'Özel Sektör',
  Kamu_sektoru: 'Kamu Sektörü',
  Isletme_sahibi_Esnaf_Zanaatkar: 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi',
  // position_type
  girisimci_isletme_sahibi: 'Girişimci / İşletme Sahibi',
  ust_duzey_yonetici: 'Üst Düzey Yönetici',
  orta_duzey_yonetici: 'Orta Düzey Yönetici',
  alt_duzey_yonetici_takim_lideri: 'Alt Düzey Yön. / Takım Lideri',
  calisan: 'Çalışan',
  // marital_status
  evli: 'Evli', bekar: 'Bekar', belirtmek_istemiyor: 'Belirtmek İstemiyor',
  // child_count_enum
  c0: '0', c1: '1', c2: '2', c3: '3', c4: '4', c5_plus: '5+',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5+': '5+',
  // income_enum
  '0_40000': '0 - 40.000 TL', '40001_80000': '40.001 - 80.000 TL',
  '80001_120000': '80.001 - 120.000 TL', '120001_160000': '120.001 - 160.000 TL',
  '160001_uzeri': '160.001 TL ve üzeri',
  'I0_40000': '0 - 40.000 TL', 'I40001_80000': '40.001 - 80.000 TL',
  'I80001_120000': '80.001 - 120.000 TL', 'I120001_160000': '120.001 - 160.000 TL',
  'I160001_uzeri': '160.001 TL ve üzeri',
  'i0_40000': '0 - 40.000 TL', 'i40001_80000': '40.001 - 80.000 TL',
  'i80001_120000': '80.001 - 120.000 TL', 'i120001_160000': '120.001 - 160.000 TL',
  'i160001_uzeri': '160.001 TL ve üzeri',
  // household_income_level
  'TL_0_40000': '0 - 40.000 TL', 'TL_40001_80000': '40.001 - 80.000 TL',
  'TL_80001_120000': '80.001 - 120.000 TL', 'TL_120001_160000': '120.001 - 160.000 TL',
  'TL_ve__zeri': '160.001 TL ve üzeri',
  'l0_40000': '0 - 40.000 TL', 'l40001_80000': '40.001 - 80.000 TL',
  'l80001_120000': '80.001 - 120.000 TL', 'l120001_160000': '120.001 - 160.000 TL',
  'l160001_uzeri': '160.001 TL ve üzeri',
  'uzeri': '160.001 TL ve üzeri',
  // work_status
  calisiyor: 'Çalışıyor', calismiyor: 'Çalışmıyor', ogrenci: 'Öğrenci',
  ev_hanimi: 'Ev Hanımı', emekli: 'Emekli',
  Calisiyor: 'Çalışıyor', Calismiyor: 'Çalışmıyor', Ogrenci: 'Öğrenci', Ev_Hanimi: 'Ev Hanımı',
  // education_level_type
  Ilkokul: 'İlkokul', Ortaokul: 'Ortaokul', Lise: 'Lise', Onlisans: 'Önlisans',
  Lisans: 'Lisans', Yuksek_Lisans: 'Yüksek Lisans', Doktora: 'Doktora',
  ilkokul: 'İlkokul', ortaokul: 'Ortaokul', lise: 'Lise', onlisans: 'Önlisans',
  lisans: 'Lisans', yuksek_lisans: 'Yüksek Lisans', doktora: 'Doktora',
  // occupation_enum
  akademisyen: 'Akademisyen', ogretmen: 'Öğretmen', doktor: 'Doktor',
  dis_hekimi: 'Diş Hekimi', hemsire: 'Hemşire', eczaci: 'Eczacı', psikolog: 'Psikolog',
  avukat: 'Avukat', hakim: 'Hakim', polis: 'Polis', asker: 'Asker', muhendis: 'Mühendis',
  mimar: 'Mimar', muhasebeci_mali_musavir: 'Muhasebeci / Mali Müşavir',
  yazilimci_bilisim_uzmani: 'Yazılımcı / Bilişim Uzmanı',
  bankacilik_finans_uzmani: 'Bankacılık / Finans Uzmanı',
  insan_kaynaklari_uzmani: 'İnsan Kaynakları Uzmanı',
  satis_pazarlama_halkla_iliskiler: 'Satış / Pazarlama / H.İlişkiler',
  teknisyen_tekniker_tasarimci: 'Teknisyen / Tekniker / Tasarımcı',
  serbest_meslek: 'Serbest Meslek', esnaf: 'Esnaf', ciftci: 'Çiftçi', isci: 'İşçi',
  // city (DB stores lowercase ASCII)
  adana: 'Adana', adiyaman: 'Adıyaman', afyonkarahisar: 'Afyonkarahisar',
  agri: 'Ağrı', amasya: 'Amasya', ankara: 'Ankara', antalya: 'Antalya',
  artvin: 'Artvin', aydin: 'Aydın', balikesir: 'Balıkesir', bilecik: 'Bilecik',
  bingol: 'Bingöl', bitlis: 'Bitlis', bolu: 'Bolu', burdur: 'Burdur', bursa: 'Bursa',
  canakkale: 'Çanakkale', cankiri: 'Çankırı', corum: 'Çorum', denizli: 'Denizli',
  diyarbakir: 'Diyarbakır', edirne: 'Edirne', elazig: 'Elazığ', erzincan: 'Erzincan',
  erzurum: 'Erzurum', eskisehir: 'Eskişehir', gaziantep: 'Gaziantep', giresun: 'Giresun',
  gumushane: 'Gümüşhane', hakkari: 'Hakkari', hatay: 'Hatay', isparta: 'Isparta',
  mersin: 'Mersin', istanbul: 'İstanbul', izmir: 'İzmir', kars: 'Kars',
  kastamonu: 'Kastamonu', kayseri: 'Kayseri', kirklareli: 'Kırklareli',
  kirsehir: 'Kırşehir', kocaeli: 'Kocaeli', konya: 'Konya', kutahya: 'Kütahya',
  malatya: 'Malatya', manisa: 'Manisa', kahramanmaras: 'Kahramanmaraş', mardin: 'Mardin',
  mugla: 'Muğla', mus: 'Muş', nevsehir: 'Nevşehir', nigde: 'Niğde', ordu: 'Ordu',
  rize: 'Rize', sakarya: 'Sakarya', samsun: 'Samsun', siirt: 'Siirt', sinop: 'Sinop',
  sivas: 'Sivas', tekirdag: 'Tekirdağ', tokat: 'Tokat', trabzon: 'Trabzon',
  tunceli: 'Tunceli', sanliurfa: 'Şanlıurfa', usak: 'Uşak', van: 'Van',
  yozgat: 'Yozgat', zonguldak: 'Zonguldak', aksaray: 'Aksaray', bayburt: 'Bayburt',
  karaman: 'Karaman', kirikkale: 'Kırıkkale', batman: 'Batman', sirnak: 'Şırnak',
  bartin: 'Bartın', ardahan: 'Ardahan', igdir: 'Iğdır', yalova: 'Yalova',
  karabuk: 'Karabük', kilis: 'Kilis', osmaniye: 'Osmaniye', duzce: 'Düzce',
  hepsi: 'Hepsi',
};

/** Returns the full lookup payload sent to the frontend */
export function buildLookupsPayload() {
  return {
    gender: GENDER_OPTIONS,
    age: AGE_OPTIONS,
    education: EDUCATION_OPTIONS,
    marital: MARITAL_OPTIONS,
    workStatus: WORK_STATUS_OPTIONS,
    income: INCOME_OPTIONS,
    children: CHILDREN_OPTIONS,
    city: CITY_OPTIONS,
    sector: SECTOR_OPTIONS,
    position: POSITION_OPTIONS,
    occupation: OCCUPATION_OPTIONS,
    dbToDisplay: DB_TO_DISPLAY,
  };
}
