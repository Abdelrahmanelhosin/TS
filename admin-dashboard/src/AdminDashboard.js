import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  Users,
  FileText,
  ListTodo,
  WalletCards,
  Upload,
  Search,
  CheckCircle2,
  X,
  PauseCircle,
  StopCircle,
  ChevronRight,
  Calculator,
  AlertCircle,
  TrendingUp,
  History,
  Download,
  BarChart3,
  UserCircle,
  ArrowRight,
  Sparkles,
  Bell,
  RotateCcw,
  PlayCircle,
  FileUp,
  Clock,
  Ban,
  Check,
  Settings,
  // Brain,
  // Zap,
  Award,
  Send
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

const GENDER_OPTIONS = ['Hepsi', 'Kadın', 'Erkek', 'Diğer'];
const AGE_OPTIONS = ['Hepsi', '18-24', '25-34', '35-44', '45-54', '55+'];
const EDUCATION_OPTIONS = ['Hepsi', 'İlkokul', 'Ortaokul', 'Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'];
const MARITAL_OPTIONS = ['Hepsi', 'Evli', 'Bekar', 'Belirtmek İstemiyor'];
const WORK_STATUS_OPTIONS = ['Hepsi', 'Çalışıyor', 'Çalışmıyor', 'Öğrenci', 'Emekli', 'Ev Hanımı'];
const INCOME_OPTIONS = ['Hepsi', '0 - 40.000 TL', '40.001 - 80.000 TL', '80.001 - 120.000 TL', '120.001 - 160.000 TL', '160.001 TL ve üzeri'];
const CHILDREN_OPTIONS = ['Hepsi', '0', '1', '2', '3', '4', '5+'];
const CITY_OPTIONS = ['Hepsi', 'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırikkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'];
const SECTOR_OPTIONS = ['Hepsi', 'Özel Sektör', 'Kamu Sektörü', 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi'];
const POSITION_OPTIONS = ['Hepsi', 'Girişimci / İşletme Sahibi', 'Üst Düzey Yönetici', 'Orta Düzey Yönetici', 'Alt Düzey Yön. / Takım Lideri', 'Çalışan'];
const OCCUPATION_OPTIONS = ['Hepsi', 'Akademisyen', 'Öğretmen', 'Doktor', 'Diş Hekimi', 'Hemşire', 'Eczacı', 'Psikolog', 'Avukat', 'Hakim', 'Polis', 'Asker', 'Mühendis', 'Mimar', 'Muhasebeci / Mali Müşavir', 'Yazılımcı / Bilişim Uzmanı', 'Bankacılık / Finans Uzmanı', 'İnsan Kaynakları Uzmanı', 'Satış / Pazarlama / H.İlişkiler', 'Teknisyen / Tekniker / Tasarımcı', 'Serbest Meslek', 'Esnaf', 'Çiftçi', 'İşçi', 'Diğer'];

// DB enum value → UI display label mapping
// The database stores ASCII snake_case values, but the UI needs Turkish display labels
const DB_TO_DISPLAY = {
  // gender_type
  erkek: 'Erkek', kadin: 'Kadın', diger: 'Diğer',
  // age_group_enum (Prisma mapped identifiers)
  a18_24: '18-24', a25_34: '25-34', a35_44: '35-44', a45_54: '45-54', a55_ustu: '55+',
  '18_24': '18-24', '25_34': '25-34', '35_44': '35-44', '45_54': '45-54', '55_ustu': '55+',
  // sector_enum (raw DB values from SQL)
  ozel_sektor: 'Özel Sektör', kamu_sektoru: 'Kamu Sektörü', isletme_sahibi_esnaf_zanaatkar_kendi_isi: 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi',
  // sector_enum_type (profiles - Prisma identifiers)
  Ozel_sektor: 'Özel Sektör', Kamu_sektoru: 'Kamu Sektörü', Isletme_sahibi_Esnaf_Zanaatkar: 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi',
  // position_type
  girisimci_isletme_sahibi: 'Girişimci / İşletme Sahibi', ust_duzey_yonetici: 'Üst Düzey Yönetici', orta_duzey_yonetici: 'Orta Düzey Yönetici', alt_duzey_yonetici_takim_lideri: 'Alt Düzey Yön. / Takım Lideri', calisan: 'Çalışan',
  // marital_status_type / marital_status_enum
  evli: 'Evli', bekar: 'Bekar', belirtmek_istemiyor: 'Belirtmek İstemiyor',
  // child_count_enum (Prisma mapped + raw DB values)
  c0: '0', c1: '1', c2: '2', c3: '3', c4: '4', c5_plus: '5+',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5+': '5+',
  // income_enum (raw DB values from SQL)
  '0_40000': '0 - 40.000 TL', '40001_80000': '40.001 - 80.000 TL', '80001_120000': '80.001 - 120.000 TL', '120001_160000': '120.001 - 160.000 TL', '160001_uzeri': '160.001 TL ve üzeri',
  // income_enum (Prisma mapped identifiers - surveys)
  i0_40000: '0 - 40.000 TL', i40001_80000: '40.001 - 80.000 TL', i80001_120000: '80.001 - 120.000 TL', i120001_160000: '120.001 - 160.000 TL', i160001_uzeri: '160.001 TL ve üzeri',
  // household_income_level (Prisma mapped identifiers - profiles)
  l0_40000: '0 - 40.000 TL', l40001_80000: '40.001 - 80.000 TL', l80001_120000: '80.001 - 120.000 TL', l120001_160000: '120.001 - 160.000 TL', l160001_uzeri: '160.001 TL ve üzeri',
  // work_status (raw DB values)
  calisiyor: 'Çalışıyor', calismiyor: 'Çalışmıyor', ogrenci: 'Öğrenci', ev_hanimi: 'Ev Hanımı', emekli: 'Emekli',
  Calisiyor: 'Çalışıyor', Calismiyor: 'Çalışmıyor', Ogrenci: 'Öğrenci', Ev_Hanimi: 'Ev Hanımı',
  // education_level_type (raw DB / Prisma identifiers)
  Ilkokul: 'İlkokul', Ortaokul: 'Ortaokul', Lise: 'Lise', Onlisans: 'Önlisans', Lisans: 'Lisans', Yuksek_Lisans: 'Yüksek Lisans', Doktora: 'Doktora',
  ilkokul: 'İlkokul', ortaokul: 'Ortaokul', lise: 'Lise', onlisans: 'Önlisans', lisans: 'Lisans', yuksek_lisans: 'Yüksek Lisans', doktora: 'Doktora',
  // occupation_enum (raw DB values)
  akademisyen: 'Akademisyen', ogretmen: 'Öğretmen', doktor: 'Doktor', dis_hekimi: 'Diş Hekimi', hemsire: 'Hemşire', eczaci: 'Eczacı', psikolog: 'Psikolog', avukat: 'Avukat', hakim: 'Hakim', polis: 'Polis', asker: 'Asker', muhendis: 'Mühendis', mimar: 'Mimar', muhasebeci_mali_musavir: 'Muhasebeci / Mali Müşavir', yazilimci_bilisim_uzmani: 'Yazılımcı / Bilişim Uzmanı', bankacilik_finans_uzmani: 'Bankacılık / Finans Uzmanı', insan_kaynaklari_uzmani: 'İnsan Kaynakları Uzmanı', satis_pazarlama_halkla_iliskiler: 'Satış / Pazarlama / H.İlişkiler', teknisyen_tekniker_tasarimci: 'Teknisyen / Tekniker / Tasarımcı', serbest_meslek: 'Serbest Meslek', esnaf: 'Esnaf', ciftci: 'Çiftçi', isci: 'İşçi',
  // city (DB stores lowercase ASCII)
  adana: 'Adana', adiyaman: 'Adıyaman', afyonkarahisar: 'Afyonkarahisar', agri: 'Ağrı', amasya: 'Amasya', ankara: 'Ankara', antalya: 'Antalya', artvin: 'Artvin', aydin: 'Aydın', balikesir: 'Balıkesir',
  bilecik: 'Bilecik', bingol: 'Bingöl', bitlis: 'Bitlis', bolu: 'Bolu', burdur: 'Burdur', bursa: 'Bursa', canakkale: 'Çanakkale', cankiri: 'Çankırı', corum: 'Çorum', denizli: 'Denizli',
  diyarbakir: 'Diyarbakır', edirne: 'Edirne', elazig: 'Elazığ', erzincan: 'Erzincan', erzurum: 'Erzurum', eskisehir: 'Eskişehir', gaziantep: 'Gaziantep', giresun: 'Giresun', gumushane: 'Gümüşhane', hakkari: 'Hakkari',
  hatay: 'Hatay', isparta: 'Isparta', mersin: 'Mersin', istanbul: 'İstanbul', izmir: 'İzmir', kars: 'Kars', kastamonu: 'Kastamonu', kayseri: 'Kayseri', kirklareli: 'Kırklareli', kirsehir: 'Kırşehir',
  kocaeli: 'Kocaeli', konya: 'Konya', kutahya: 'Kütahya', malatya: 'Malatya', manisa: 'Manisa', kahramanmaras: 'Kahramanmaraş', mardin: 'Mardin', mugla: 'Muğla', mus: 'Muş', nevsehir: 'Nevşehir',
  nigde: 'Niğde', ordu: 'Ordu', rize: 'Rize', sakarya: 'Sakarya', samsun: 'Samsun', siirt: 'Siirt', sinop: 'Sinop', sivas: 'Sivas', tekirdag: 'Tekirdağ', tokat: 'Tokat',
  trabzon: 'Trabzon', tunceli: 'Tunceli', sanliurfa: 'Şanlıurfa', usak: 'Uşak', van: 'Van', yozgat: 'Yozgat', zonguldak: 'Zonguldak', aksaray: 'Aksaray', bayburt: 'Bayburt', karaman: 'Karaman',
  kirikkale: 'Kırikkale', batman: 'Batman', sirnak: 'Şırnak', bartin: 'Bartın', ardahan: 'Ardahan', igdir: 'Iğdır', yalova: 'Yalova', karabuk: 'Karabük', kilis: 'Kilis', osmaniye: 'Osmaniye', duzce: 'Düzce',
  hepsi: 'Hepsi',
};

const STATUS_MAP = {
  'active': { label: 'YAYINDA', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'completed': { label: 'TAMAMLANDI', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'paused': { label: 'DONDURULDU', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  'pending': { label: 'BEKLEMEDE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'draft': { label: 'TASLAK', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'rejected': { label: 'REDDEDİLDİ', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'bekliyor': { label: 'BEKLEMEDE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'onaylandı': { label: 'ONAYLANDI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
};

const MultiSelect = ({ selected = [], options = [], onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (opt) => {
    const isHepsi = opt.toLowerCase() === 'hepsi';
    if (isHepsi) {
      onChange(['hepsi']);
    } else {
      let next = selected.filter(s => s.toLowerCase() !== 'hepsi');
      if (next.includes(opt)) {
        next = next.filter(s => s !== opt);
      } else {
        next = [...next, opt];
      }
      if (next.length === 0) next = ['hepsi'];
      onChange(next);
    }
  };

  return (
    <div className="relative space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[46px] w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-2 py-2 text-white text-xs outline-none focus:border-orange-500 font-black cursor-pointer flex flex-wrap gap-1 items-center"
      >
        {selected.length === 0 || selected.some(s => s.toLowerCase() === 'hepsi') ? (
          <span className="px-2 py-1 text-slate-500">Hepsi</span>
        ) : (
          selected.map(s => (
            <span key={s} className="bg-orange-500/20 text-orange-500 px-2 py-1 rounded-lg flex items-center gap-1 border border-orange-500/30">
              {s}
              <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); toggleOption(s); }} />
            </span>
          ))
        )}
        <div className="ml-auto pr-2">
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full max-h-60 bg-[#1A233A] border border-[#2A3441] rounded-xl overflow-y-auto shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-200">
          <div
            onClick={() => { toggleOption('hepsi'); setIsOpen(false); }}
            className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-bold ${selected.some(s => s.toLowerCase() === 'hepsi') ? 'bg-orange-500 text-white' : 'hover:bg-white/5 text-slate-300'}`}
          >
            Hepsi
          </div>
          {options.filter(o => o !== 'Hepsi').map(opt => (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-bold flex items-center justify-between ${selected.includes(opt) ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-white/5 text-slate-300'}`}
            >
              {opt}
              {selected.includes(opt) && <Check className="w-3 h-3" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SingleSelect = ({ selected, options = [], onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[46px] w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 font-black cursor-pointer flex items-center justify-between transition-all"
      >
        <span className={!selected || (typeof selected === 'string' && selected.toLowerCase() === 'hepsi') ? 'text-slate-500' : 'text-white'}>
          {selected || 'Seçiniz'}
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[110] mt-1 w-full max-h-60 bg-[#1A233A] border border-[#2A3441] rounded-xl overflow-y-auto shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-200">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-bold ${selected === opt ? 'bg-orange-500 text-white' : 'hover:bg-white/5 text-slate-300'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token);
      } else {
        setError(data.message || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-[#131B2F]/50 backdrop-blur-xl border border-[#1A233A] rounded-[2.5rem] p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 rotate-3 group transition-transform hover:rotate-6">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">PolTem<span className="text-orange-500">.</span>Admin</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Yönetim Paneline Giriş</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">E-posta Adresi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B1121] border border-[#1A233A] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/30 transition-all text-sm font-medium"
              placeholder="admin@poltem.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B1121] border border-[#1A233A] rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/30 transition-all text-sm font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
              <>
                Giriş Yap <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MOCK DATA (Veritabanı Simülasyonu) ---

const MOCK_USERS = [
  {
    id: 'USR-101', name: 'Ahmet Yılmaz', role: 'Kullanıcı', email: 'ahmet@mail.com', registeredAt: '2026-01-15',
    profile: {
      medeniDurum: 'Evli',
      cocukSayisi: '2',
      gelir: '80.001 – 120.000 TL',
      calismaDurumu: 'Çalışıyor',
      sektor: 'Özel sektör',
      pozisyon: 'Orta düzey yönetici',
      meslek: 'Mühendis'
    }
  },
  {
    id: 'USR-102', name: 'Ayşe Demir', role: 'Araştırmacı', email: 'ayse@uni.edu.tr', registeredAt: '2026-02-20',
    profile: {
      medeniDurum: 'Bekar',
      cocukSayisi: '0',
      gelir: '160.001 TL ve üzeri',
      calismaDurumu: 'Çalışıyor',
      sektor: 'Kamu sektörü',
      pozisyon: 'Çalışan',
      meslek: 'Akademisyen'
    }
  },
  {
    id: 'USR-103', name: 'Mehmet Can', role: 'Kullanıcı', email: 'mehmet@mail.com', registeredAt: '2026-03-05',
    profile: {
      medeniDurum: 'Belirtmek istemiyor',
      cocukSayisi: 'Belirtmek istemiyor',
      gelir: '0 – 40.000 TL',
      calismaDurumu: 'Öğrenci'
    }
  },
];

const MOCK_SURVEY_REQUESTS = [
  {
    id: 'REQ-001',
    creatorId: 'USR-102',
    creatorName: 'Ayşe Demir',
    title: 'Tüketici Alışkanlıkları',
    description: 'X kuşağı alışveriş alışkanlıkları üzerine akademik bir çalışma.',
    targetAudience: {
      'Yaş Grubu': '18-35 Yaş',
      'Cinsiyet': 'Kadın',
      'Şehir': 'İstanbul',
      'Medeni Durum': 'Evli',
      'Çalışma Durumu': 'Çalışıyor',
      'Aylık Gelir': '80.001 – 120.000 TL'
    },
    formLink: 'https://forms.google.com/xyz',
    completionCode: 'POLTEM-8821',
    status: 'draft',
    date: '2026-03-16'
  },
  {
    id: 'REQ-002',
    creatorId: 'USR-105',
    creatorName: 'Dr. Ali Vefa',
    title: 'Uzaktan Eğitim Verimliliği',
    description: 'Üniversite öğrencilerinin uzaktan eğitim platformlarına yaklaşımı.',
    targetAudience: {
      'Çalışma Durumu': 'Öğrenci',
      'Yaş Grubu': '18-24 Yaş',
      'Şehir': 'Tüm Türkiye'
    },
    formLink: 'https://forms.google.com/abc',
    completionCode: 'POLTEM-9932',
    status: 'draft',
    date: '2026-03-17'
  }
];

const MOCK_PUBLISHED_SURVEYS = [
  {
    id: 'SRV-001',
    creatorId: 'USR-108',
    creatorName: 'Kariyer Merkezi',
    title: 'Yeni Mezun İstihdamı',
    description: 'Sektörel beklentiler.',
    targetAudience: {
      'Çalışma Durumu': 'Çalışmıyor / Öğrenci',
      'Yaş Grubu': '22-28 Yaş',
      'Eğitim': 'Lisans Mezunu'
    },
    formLink: 'https://forms.google.com/123',
    completionCode: 'POLTEM-1111',
    package: 'Paket 1 (0-4dk)',
    status: 'active',
    targetCount: 500,
    reachedCount: 342,
    participants: [
      { userId: 'USR-101', date: '2026-03-15 14:30' },
      { userId: 'USR-103', date: '2026-03-15 15:45' }
    ]
  },
  {
    id: 'SRV-002',
    creatorId: 'USR-110',
    creatorName: 'Finans Ar-Ge',
    title: 'Kripto Para Eğilimleri',
    description: 'Yatırımcı risk algısı.',
    targetAudience: {
      'Cinsiyet': 'Erkek',
      'Yaş Grubu': '25-45 Yaş',
      'Aylık Gelir': '120.001 TL ve üzeri'
    },
    formLink: 'https://forms.google.com/crypto',
    completionCode: 'POLTEM-2222',
    package: 'Paket 3 (10-14dk)',
    status: 'completed',
    targetCount: 200,
    reachedCount: 200,
    participants: [
      { userId: 'USR-201', date: '2026-03-10 09:15' },
      { userId: 'USR-202', date: '2026-03-10 11:20' }
    ]
  }
];

const PACKAGES = [
  { id: 1, name: '0-4 dk', price: 27, cost: 20 },
  { id: 2, name: '5-9 dk', price: 34, cost: 25 },
  { id: 3, name: '10-14 dk', price: 40, cost: 30 },
  { id: 4, name: '15-19 dk', price: 47, cost: 35 },
];

const MOCK_PAYMENT_INSTRUCTIONS = [
  { name: 'Ahmet Yılmaz', tc: '12345678901', bank: 'Ziraat Bankası', accountName: 'Ahmet Yılmaz', iban: 'TR12 0001 0000 0000 0000 0000 01', amount: 20 },
  { name: 'Mehmet Can', tc: '98765432109', bank: 'Garanti BBVA', accountName: 'Mehmet Can', iban: 'TR34 0006 0000 0000 0000 0000 02', amount: 25 },
];

const RECENT_ACTIVITIES = [
  { id: 1, type: 'approve', user: 'Admin Sarah', target: 'SRV-001 Yayına Alındı', time: '2 saat önce' },
  { id: 2, type: 'new_user', user: 'Mehmet Can', target: 'Yeni Kayıt', time: '5 saat önce' },
  { id: 3, type: 'payout', user: 'Sistem', target: 'Ödeme Tablosu Üretildi', time: '1 gün önce' },
];

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('overview');
  const [surveyFilter, setSurveyFilter] = useState('all'); // all, pending, active, completed, rejected
  const [validationRules, setValidationRules] = useState([]);
  const [isAddingRule, setIsAddingRule] = useState(false);

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);
  const [targetCount, setTargetCount] = useState('');
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [surveyAnalysis, setSurveyAnalysis] = useState({}); // { [id]: report }
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [auditSurvey, setAuditSurvey] = useState(null); // The survey currently being audited full-screen
  const [surveyChatMessages, setSurveyChatMessages] = useState([]);
  const [surveyChatInput, setSurveyChatInput] = useState('');
  const [surveyChatLoading, setSurveyChatLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('all');

  // Approval Edit States
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editPlatform, setEditPlatform] = useState('Google Forms');
  const [editGender, setEditGender] = useState(['Hepsi']);
  const [editAge, setEditAge] = useState(['Hepsi']);
  const [editCity, setEditCity] = useState(['Hepsi']);
  const [editEducation, setEditEducation] = useState(['Hepsi']);
  const [editOccupation, setEditOccupation] = useState(['Hepsi']);
  const [editWorkStatus, setEditWorkStatus] = useState(['Hepsi']);
  const [editSector, setEditSector] = useState(['Hepsi']);
  const [editPosition, setEditPosition] = useState(['Hepsi']);
  const [editIncome, setEditIncome] = useState(['Hepsi']);
  const [editMarital, setEditMarital] = useState(['Hepsi']);
  const [editChildren, setEditChildren] = useState(['Hepsi']);

  const [customReward, setCustomReward] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [useCustomPricing, setUseCustomPricing] = useState(false);

  // Edit Modes
  const [isEditingSurvey, setIsEditingSurvey] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // User Edit States
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserCity, setEditUserCity] = useState('');
  const [editUserEducation, setEditUserEducation] = useState('');
  const [editUserOccupation, setEditUserOccupation] = useState('');
  const [editUserWorkStatus, setEditUserWorkStatus] = useState('');
  const [editUserSector, setEditUserSector] = useState('');
  const [editUserPosition, setEditUserPosition] = useState('');
  const [editUserIncome, setEditUserIncome] = useState('');
  const [editUserMarital, setEditUserMarital] = useState('');
  const [editUserChildren, setEditUserChildren] = useState('');
  const [editUserTC, setEditUserTC] = useState('');
  const [editUserBank, setEditUserBank] = useState('');
  const [editUserIBAN, setEditUserIBAN] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const initRes = await fetch(`${API_BASE_URL}/admin/init`, { headers });
      const initData = await initRes.json();

      if (!initRes.ok) {
        let msg = 'API Error';
        if (initRes.status === 401) msg = 'Oturum geçersiz veya yetkiniz yok (401)';
        else msg = initData.message || `Error (${initRes.status})`;

        setError(`Veri alınamadı: ${msg}. Lütfen ADMİN yetkiniz olduğundan emin olun.`);
        setLoading(false);
        return;
      }

      const formattedUsers = initData.users.items.map(u => ({
        id: u.id,
        name: u.full_name || u.full_name_bank || u.users?.email || 'İsimsiz',
        email: u.users?.email || '—',
        role: u.role === 'admin' ? 'Admin' : (u.role === 'researcher' ? 'Araştرمacı' : 'Kullanıcı'),
        registeredAt: u.created_at,
        profile: u || {}
      }));
      setUsers(formattedUsers);

      setRequests(initData.pending.map(r => ({
        ...r,
        creatorName: r.users?.profiles?.full_name || 'Bilinmiyor',
        targetAudience: r.target_audience || {},
        formLink: r.survey_link || r.form_link,
        completionCode: r.completion_code
      })));

      setSurveys(initData.surveys.map(s => ({
        ...s,
        creatorName: s.users?.profiles?.full_name || 'Bilinmiyor',
        targetAudience: {
          'Cinsiyet': s.target_gender,
          'Dönem/Yaş': s.target_age_group,
          'Şehir': s.target_city,
          'Meslek': s.target_occupation
        },
        formLink: s.survey_link,
        completionCode: s.completion_code,
        targetCount: s.target_audience || s.target_count,
        reachedCount: s._count?.submissions || 0,
        participants: []
      })));

      setStats(initData.stats);
      setActivities(initData.activities);
      setError('');
    } catch (err) {
      console.error('FetchData Error:', err);
      setError(`Veri senkronizasyon hatası: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const parseFileToJson = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          const normalized = json.map(row => {
            const newRow = { ...row };
            const codeKey = Object.keys(row).find(k => 
              k.toLowerCase().includes('katılımcı') || 
              k.toLowerCase().includes('kod') || 
              k.toLowerCase() === 'id' || 
              k.toLowerCase() === 'unique_id' ||
              k.toLowerCase().includes('participant')
            );
            if (codeKey) newRow['unique_id'] = String(row[codeKey]).trim();
            return newRow;
          });
          resolve(normalized);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const fetchSurveyDetails = async (surveyId, forceUpdateSelected = false) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [res, pRes, payRes] = await Promise.all([
        fetch(`${API_BASE_URL}/surveys/${surveyId}`, { headers }),
        fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/participants`, { headers }),
        fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/payment-table`, { headers })
      ]);

      const data = await res.json();
      const pData = await pRes.json().catch(() => []);
      const payData = await payRes.json().catch(() => []);

      const enriched = {
        ...data,
        participants: Array.isArray(pData) ? pData : (Array.isArray(data.participants) ? data.participants : []),
        paymentTable: (payData && payData.rows) ? payData : { rows: [] },
        reachedCount: data._count?.submissions || 0
      };
      setAuditSurvey(enriched);
      setSurveys(prev => prev.map(s => s.id === surveyId ? enriched : s));
      if (forceUpdateSelected || selectedSurvey?.id === surveyId) {
        setSelectedSurvey(enriched);
      }
    } catch (err) {
      console.error('Survey Details Error:', err);
    }
  };

  useEffect(() => {
    if (activeView === 'ai-analytics') {
      fetchAiHistory();
    }
    if (activeView === 'survey-audit' && auditSurvey) {
      setSurveyChatMessages([]); // Reset previous chat
      if (!surveyAnalysis[auditSurvey.id]) {
        handleAnalyzeCampaign(auditSurvey.id);
      }
      fetchSurveyChatHistory(auditSurvey.id);
    }
  }, [activeView, auditSurvey]);

  useEffect(() => {
    const normalizeArray = (val, options) => {
      if (!val) return ['Hepsi'];
      const values = Array.isArray(val) ? val : [val];
      if (values.length === 0) return ['Hepsi'];

      const matches = values
        .map(v => {
          if (!v) return null;
          const sv = String(v).trim();
          if (sv.toLowerCase() === 'hepsi') return null;
          // 1. DB_TO_DISPLAY map (exact)
          if (DB_TO_DISPLAY[sv]) return DB_TO_DISPLAY[sv];
          // 2. DB_TO_DISPLAY (case-insensitive)
          const lk = sv.toLowerCase();
          const mk = Object.keys(DB_TO_DISPLAY).find(k => k.toLowerCase() === lk);
          if (mk) return DB_TO_DISPLAY[mk];
          // 3. Direct match against options
          const dm = options.find(opt => opt.toLowerCase().trim() === lk);
          if (dm) return dm;
          return null;
        })
        .filter(m => m);

      return matches.length > 0 ? matches : ['Hepsi'];
    };

    const normalizeSingle = (val, options) => {
      if (!val) return 'Hepsi';
      const sv = String(val).trim();
      if (sv.toLowerCase() === 'hepsi') return 'Hepsi';
      // 1. DB_TO_DISPLAY map (exact)
      if (DB_TO_DISPLAY[sv]) return DB_TO_DISPLAY[sv];
      // 2. DB_TO_DISPLAY (case-insensitive)
      const lk = sv.toLowerCase();
      const mk = Object.keys(DB_TO_DISPLAY).find(k => k.toLowerCase() === lk);
      if (mk) return DB_TO_DISPLAY[mk];
      // 3. Direct match against options
      const dm = options.find(opt => opt.toLowerCase().trim() === lk);
      if (dm) return dm;
      return 'Hepsi';
    };

    if (selectedRequest) {
      setEditTitle(selectedRequest.title || '');
      setEditDescription(selectedRequest.description || '');
      setEditLink(selectedRequest.formLink || '');
      setEditPlatform(selectedRequest.platform || 'Google Forms');

      setEditGender(normalizeArray(selectedRequest.target_gender || selectedRequest.gender, GENDER_OPTIONS));
      setEditAge(normalizeArray(selectedRequest.target_age_group || selectedRequest.age_group, AGE_OPTIONS));
      setEditCity(normalizeArray(selectedRequest.target_city || selectedRequest.city, CITY_OPTIONS));
      setEditEducation(normalizeArray(selectedRequest.target_education || selectedRequest.education, EDUCATION_OPTIONS));
      setEditOccupation(normalizeArray(selectedRequest.target_occupation || selectedRequest.occupation, OCCUPATION_OPTIONS));
      setEditSector(normalizeArray(selectedRequest.target_sector || selectedRequest.sector, SECTOR_OPTIONS));
      setEditPosition(normalizeArray(selectedRequest.target_position || selectedRequest.position, POSITION_OPTIONS));
      setEditWorkStatus(normalizeArray(selectedRequest.target_employment_status || selectedRequest.target_work_status || selectedRequest.work_status, WORK_STATUS_OPTIONS));
      setEditIncome(normalizeArray(selectedRequest.target_income || selectedRequest.monthly_income, INCOME_OPTIONS));
      setEditMarital(normalizeArray(selectedRequest.target_marital_status || selectedRequest.target_marital || selectedRequest.marital_status, MARITAL_OPTIONS));
      setEditChildren(normalizeArray(selectedRequest.target_child_count || selectedRequest.target_children || selectedRequest.children_count, CHILDREN_OPTIONS));

      setTargetCount(selectedRequest.target_audience || selectedRequest.target_count || '');
      setUseCustomPricing(false);

      const reward = selectedRequest.reward_amount ? Number(selectedRequest.reward_amount) : null;
      let pkg = PACKAGES[0];
      if (reward) {
        const matchingPkg = PACKAGES.find(p => p.price === reward);
        if (matchingPkg) {
          pkg = matchingPkg;
          setCustomReward('');
          setCustomTime('');
        } else {
          pkg = { id: 'custom', name: 'Özel Şartlar', price: reward, cost: reward * 0.74 };
          setCustomReward(reward.toString());
          setCustomTime(selectedRequest.estimated_time?.toString() || '');
        }
      } else {
        setCustomReward('');
        setCustomTime('');
      }
      setSelectedPackage(pkg);
    } else if (selectedSurvey) {
      // Aktif Anket Düzenleme Başlangıç Değerleri
      setEditTitle(selectedSurvey.title || '');
      setEditDescription(selectedSurvey.description || '');
      setEditGender(normalizeArray(selectedSurvey.target_gender, GENDER_OPTIONS));
      setEditAge(normalizeArray(selectedSurvey.target_age_group || selectedSurvey.target_age, AGE_OPTIONS));
      setEditCity(normalizeArray(selectedSurvey.target_city, CITY_OPTIONS));
      setEditEducation(normalizeArray(selectedSurvey.target_education || selectedSurvey.target_education_level, EDUCATION_OPTIONS));
      setEditOccupation(normalizeArray(selectedSurvey.target_occupation, OCCUPATION_OPTIONS));
      setEditWorkStatus(normalizeArray(selectedSurvey.target_employment_status || selectedSurvey.target_work_status, WORK_STATUS_OPTIONS));
      setEditSector(normalizeArray(selectedSurvey.target_sector, SECTOR_OPTIONS));
      setEditPosition(normalizeArray(selectedSurvey.target_position, POSITION_OPTIONS));
      setEditIncome(normalizeArray(selectedSurvey.target_income || selectedSurvey.target_household_income, INCOME_OPTIONS));
      setEditMarital(normalizeArray(selectedSurvey.target_marital_status || selectedSurvey.target_marital, MARITAL_OPTIONS));
      setEditChildren(normalizeArray(selectedSurvey.target_child_count || selectedSurvey.target_children, CHILDREN_OPTIONS));
    } else if (selectedUser) {
      // Kullanıcı Profili Düzenleme Başlangıç Değerleri
      setEditUserName(selectedUser.name || '');
      setEditUserPhone(selectedUser.phone || '');
      setEditUserCity(normalizeSingle(selectedUser.profile?.city, CITY_OPTIONS));
      setEditUserEducation(normalizeSingle(selectedUser.profile?.education_level, EDUCATION_OPTIONS));
      setEditUserOccupation(normalizeSingle(selectedUser.profile?.occupation, OCCUPATION_OPTIONS));
      setEditUserWorkStatus(normalizeSingle(selectedUser.profile?.work_status, WORK_STATUS_OPTIONS));
      setEditUserSector(normalizeSingle(selectedUser.profile?.sector_type, SECTOR_OPTIONS));
      setEditUserIncome(normalizeSingle(selectedUser.profile?.household_income, INCOME_OPTIONS));
      setEditUserMarital(normalizeSingle(selectedUser.profile?.marital_status, MARITAL_OPTIONS));
      setEditUserChildren(normalizeSingle(selectedUser.profile?.children_count, CHILDREN_OPTIONS));
      setEditUserBank(selectedUser.profile?.bank_name || '');
      setEditUserIBAN(selectedUser.profile?.iban || '');
      setEditUserTC(selectedUser.profile?.tc_identity_number || '');
    }
  }, [selectedRequest, selectedSurvey, selectedUser]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: editUserName,
          phone: editUserPhone,
          city: editUserCity === 'Hepsi' ? 'hepsi' : editUserCity,
          education_level: editUserEducation === 'Hepsi' ? 'hepsi' : editUserEducation,
          occupation: editUserOccupation === 'Hepsi' ? 'hepsi' : editUserOccupation,
          work_status: editUserWorkStatus === 'Hepsi' ? 'hepsi' : editUserWorkStatus,
          sector_type: editUserSector === 'Hepsi' ? 'hepsi' : editUserSector,
          household_income: editUserIncome === 'Hepsi' ? 'hepsi' : editUserIncome,
          marital_status: editUserMarital === 'Hepsi' ? 'hepsi' : editUserMarital,
          children_count: editUserChildren === 'Hepsi' ? 'hepsi' : editUserChildren,
          tc_identity_number: editUserTC,
          bank_name: editUserBank,
          iban: editUserIBAN
        })
      });
      if (res.ok) {
        alert('Kullanıcı profili güncellendi.');
        // Re-initialize TC/Bank/IBAN fields after successful update
        setEditUserIBAN(selectedUser.profile?.iban || '');
        setEditUserBank(selectedUser.profile?.bank_name || '');
        setEditUserTC(selectedUser.profile?.tc_identity_number || '');
        setIsEditingUser(false);
        fetchData();
        // Refresh selected user
        const updatedUser = await (await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } })).json();
        setSelectedUser(updatedUser);
      } else {
        alert('Güncelleme başarısız.');
      }
    } catch (err) {
      alert('Hata oluştu.');
    }
  };

  const handleUpdateTargeting = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedSurvey.id}/approve`, { // Reuse approve endpoint for update
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          target_gender: editGender.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_age_group: editAge.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_city: editCity.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_education: editEducation.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_occupation: editOccupation.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_employment_status: editWorkStatus.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_sector: editSector.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_position: editPosition.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_income: editIncome.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_marital_status: editMarital.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_child_count: editChildren.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
        })
      });
      if (res.ok) {
        alert('Hedefleme kriterleri güncellendi.');
        setIsEditingSurvey(false);
        fetchData();
      } else {
        alert('Güncelleme başarısız.');
      }
    } catch (err) {
      alert('Hata oluştu.');
    }
  };

  const handleMakeResearcher = async (userId, isResearcher) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/research-permission`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_researcher: isResearcher })
      });
      if (res.ok) {
        alert(isResearcher ? 'Kullanıcı Araştırmacı yapıldı.' : 'Araştırmacı yetkisi kaldırıldı.');
        fetchData();
      } else {
        alert('İşlem başarısız.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    }
  };

  const handlePublish = async () => {
    if (!targetCount || parseInt(targetCount) <= 0) return alert('Lütfen geçerli bir hedef sayısı girin.');

    const packagePrice = selectedPackage.price;
    const packageCost = selectedPackage.cost || (packagePrice * 0.74);
    const packageTime = parseInt(selectedPackage.name.match(/\d+/)?.[0]) || 5;

    // Selling price is what researcher pays per person
    const sellingPrice = useCustomPricing ? (parseFloat(customReward) || packagePrice) : packagePrice;

    // Reward amount is what participant receives (internal cost)
    const reward = useCustomPricing ? (sellingPrice * (packageCost / packagePrice)) : packageCost;

    const parsedTime = useCustomPricing ? (parseInt(customTime) || packageTime) : packageTime;
    const parsedTarget = parseInt(targetCount) || 0;

    const totalCost = parsedTarget * sellingPrice;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/surveys/${selectedRequest.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reward_amount: reward,
          estimated_time: parsedTime,
          target_audience: parsedTarget,
          target_gender: editGender.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_age_group: editAge.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_city: editCity.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_education: editEducation.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_occupation: editOccupation.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_employment_status: editWorkStatus.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_sector: editSector.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_position: editPosition.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_income: editIncome.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_marital_status: editMarital.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          target_child_count: editChildren.map(s => s.toLowerCase() === 'hepsi' ? 'hepsi' : s),
          survey_link: editLink,
          title: editTitle,
          description: editDescription,
          platform: editPlatform,
          total_cost: totalCost,
          commission_rate: Math.round(((totalCost - (parsedTarget * reward)) / totalCost) * 100)
        }),
      });

      if (response.ok) { // Changed res to response to match variable name
        // Hedef sayısını da güncelleyelim (Ayrı bir endpoint ise oraya da istek atılabilir)
        // Mevcut API'de approve içinde reward ve time var, target_audience schema'da var mı bakılmalı
        alert('Anket başarıyla onaylandı ve yayımlandı!');
        setSelectedRequest(null);
        setTargetCount('');
        fetchData();
      } else {
        const errData = await response.json(); // Changed res to response
        alert(`Hata: ${errData.message}`);
      }
    } catch (err) {
      alert('Yayımlama sırasında bir hata oluştu.');
    }
  };

  /*
  const handleAnalyzeAI = async () => {
    setAiLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/analyze`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.text();
        setAiReport(data);
        setActiveView('ai-analytics');
      } else {
        const err = await res.json();
        alert(`Analiz hatası: ${err.message}`);
      }
    } catch (err) {
      alert('AI sunucusuna bağlanılamadı.');
    } finally {
      setAiLoading(false);
    }
  };
  */


  const handlePrintReport = (survey, report) => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PolTem Araştırma Raporu - ${survey.title}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1a233a; line-height: 1.6; }
            .header { border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { margin: 0; color: #f97316; font-size: 28px; }
            .meta { color: #64748b; font-size: 14px; margin-top: 5px; }
            .content { white-space: pre-wrap; font-size: 16px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="float: right; font-weight: bold; color: #f97316;">POLTEM AKADEMİ</div>
            <h1>Araştırma Denetim Raporu</h1>
            <div class="meta">Anket: ${survey.title} | Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
          </div>
          <div class="content">${report}</div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /*
  const fetchAiHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiChatMessages(data);
      }
    } catch (err) {}
  };

  const fetchSurveyChatHistory = async (surveyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat/history?surveyId=${surveyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveyChatMessages(data);
      }
    } catch (err) {
      console.error('Fetch Survey History Error:', err);
    }
  };

  const handleAnalyzeCampaign = async (surveyId) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/analyze-survey/${surveyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.text();
        setSurveyAnalysis(prev => ({ ...prev, [surveyId]: data }));
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAiChatSend = async (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = { role: 'user', content: aiChatInput };
    setAiChatMessages(prev => [...prev, userMsg]);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: aiChatInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Chat Error:', err);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleSurveyChatSend = async (e) => {
    e.preventDefault();
    if (!surveyChatInput.trim() || !auditSurvey) return;

    const userMsg = { role: 'user', content: surveyChatInput };
    setSurveyChatMessages(prev => [...prev, userMsg]);
    const currentInput = surveyChatInput;
    setSurveyChatInput('');
    setSurveyChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: currentInput,
          surveyId: auditSurvey.id      // (Neutralized AI function)
        })
      });
      // const data = await res.json();
      // if (res.ok) {
      //   setSurveyChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      // }
    } catch (err) {
      console.error('Survey Chat Error:', err);
    } finally {
      setSurveyChatLoading(false);
    }
  };
  */

  const renderAIChat = () => null;
  const renderAIAnalytics = () => null;
  const renderSurveyAudit = () => null;

  const renderDashboardGallery = () => (
    <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
      <div className="flex items-center justify-between border-b border-[#1A233A] pb-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white flex items-center gap-4">
            Araştırma Denetim Galerisi
          </h3>
          <p className="text-slate-500 font-medium text-sm">Her bir araştırmanın derinlemesine analizine ve detaylarına buradan ulaşın.</p>
        </div>
        <div className="px-5 py-2 bg-[#1A233A] rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-[#2A3441]">
          Toplam: {surveys.length} Araştırma
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#0B1121] border border-[#1A233A] rounded-2xl w-fit">
        {[
          { id: 'all', label: 'Hepsi' },
          { id: 'active', label: 'Aktif' },
          { id: 'completed', label: 'Tamamlandı' },
          { id: 'pending', label: 'İncelemede' },
          { id: 'draft', label: 'Taslak' },
          { id: 'approved', label: 'Onaylandı' }
        ].map((status) => {
          const count = status.id === 'all'
            ? surveys.length
            : surveys.filter(s => s.status === status.id ||
              (status.id === 'pending' && s.status === 'bekliyor') ||
              (status.id === 'approved' && s.status === 'onaylandı')
            ).length;

          return (
            <button
              key={status.id}
              onClick={() => setGalleryFilter(status.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${galleryFilter === status.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {status.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${galleryFilter === status.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {surveys.filter(s =>
          galleryFilter === 'all' ||
          s.status === galleryFilter ||
          (galleryFilter === 'pending' && s.status === 'bekliyor') ||
          (galleryFilter === 'approved' && s.status === 'onaylandı')
        ).length === 0 ? (
          <div className="col-span-full py-20 bg-[#131B2F] border border-[#1A233A] rounded-[3rem] text-center border-dashed">
            <FileText className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Bu kategoride herhangi bir araştırma bulunamadı.</p>
          </div>
        ) : (
          surveys.filter(s => galleryFilter === 'all' || s.status === galleryFilter).map((s) => (
            <div
              key={s.id}
              onClick={() => { setSelectedSurvey(s); fetchSurveyDetails(s.id, true); }}
              className="group relative bg-[#131B2F] border border-[#1A233A] rounded-[3rem] p-8 hover:border-orange-500/50 hover:bg-[#1A233A]/20 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between h-[340px] shadow-lg hover:shadow-orange-500/10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] group-hover:bg-orange-500/10 transition-all" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/10 transition-all" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${(STATUS_MAP[s.status] || STATUS_MAP['draft']).color}`}>
                    {(STATUS_MAP[s.status] || STATUS_MAP['draft']).label}
                  </div>
                  <div className="w-10 h-10 bg-[#0B1121] rounded-2xl flex items-center justify-center border border-[#1A233A] group-hover:border-orange-500/50 transition-colors">
                    <Sparkles className="w-5 h-5 text-slate-600 group-hover:text-orange-500" />
                  </div>
                </div>
                <h4 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight">
                  {s.title}
                </h4>
                <div className="flex items-center gap-3 mt-4">
                  <div className="px-3 py-1 bg-[#0B1121] rounded-lg text-[10px] text-slate-400 font-bold border border-[#1A233A]">
                    {s.package}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" /> {s.reachedCount} / {s.targetCount}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-auto pt-6 border-t border-[#1A233A]/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Analiz Hazır</span>
                  <span className="text-white font-black text-sm">{Math.round(((s.reachedCount || 0) / (s.targetCount || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#0B1121] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.round(((s.reachedCount || 0) / (s.targetCount || 1)) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <span className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    DENETİMİ AÇ <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleComplete = async (surveyId) => {
    if (!window.confirm('Bu anketi tamamlanmış olarak işaretlemek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Anket tamamlandı.');
        setSelectedSurvey(null);
        fetchData();
      }
    } catch (err) {
      alert('İşlem hatası.');
    }
  };

  const handlePause = async (surveyId) => {
    if (!window.confirm('Bu anketi dondurmak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Anket donduruldu (Duraklatıldı).');
        setSelectedSurvey(null);
        fetchData();
      }
    } catch (err) {
      alert('İşlem hatası.');
    }
  };

  const handleRestore = async (surveyId) => {
    if (!window.confirm('Bu anketi tekrar taslak/istek aşamasına döndürmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Anket tekrar "İstekler" listesine gönderildi.');
        setSelectedSurvey(null);
        fetchData();
      }
    } catch (err) {
      alert('İşlem hatası.');
    }
  };

  const handleResume = async (surveyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // No updates, just triggers 'active' status
      });
      if (res.ok) {
        alert('Anket tekrar yayına alındı!');
        setSelectedSurvey(null);
        fetchData();
      }
    } catch (err) {
      alert('İşlem hatası.');
    }
  };

  const fetchPaymentTable = async (surveyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/payment-table`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments((data && data.rows && Array.isArray(data.rows)) ? data.rows.map(r => ({
          name: r.full_name,
          tc: r.tc_identity_number,
          bank: r.bank_name,
          accountName: r.full_name_bank,
          iban: r.iban,
          amount: data.reward_amount
        })) : []);
      }
    } catch (err) {
      alert('Ödeme tablosu çekilemedi.');
    }
  };

  const handleCSVMatch = async (surveyId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      // Skip header, assuming UniqueID, Email format
      const rows = lines.slice(1).map(line => {
        const parts = line.split(',');
        return { unique_id: parts[0]?.trim(), email: parts[1]?.trim() };
      }).filter(r => r.unique_id || r.email);

      try {
        const res = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/match-csv`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rows })
        });
        if (res.ok) {
          const result = await res.json();
          alert(`Eşleştirme Sonucu:\n- Eşleşen: ${result.matched?.length || 0}\n- Eşleşmeyen: ${result.unmatchedCsv?.length || 0}`);
          fetchSurveyDetails(surveyId);
        } else {
          alert('Eşleştirme işlemi başarısız oldu.');
        }
      } catch (err) {
        alert('Eşleştirme sırasında bir hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (selectedSurvey) {
      fetchPaymentTable(selectedSurvey.id);
      alert('E-Tablo işlendi, ödeme listesi güncellendi.');
    } else {
      setPayments(MOCK_PAYMENT_INSTRUCTIONS);
      alert('Örnek ödeme tablosu yüklendi.');
    }
  };

  const handleExportExcel = (surveyTitle, rows) => {
    if (!rows || rows.length === 0) return alert('Dışa aktarılacak veri bulunamadı.');

    // CSV formatı (Excel uyumlu utf-8 bom ile)
    const headers = ['Ad Soyad', 'Email', 'TC No', 'Banka', 'Hesap Sahibi', 'IBAN', 'Tutar (TL)'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.full_name}"`,
        `"${r.email}"`,
        `"${r.tc_identity_number}"`,
        `"${r.bank_name}"`,
        `"${r.full_name_bank}"`,
        `"${r.iban}"`,
        r.reward_amount
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${surveyTitle || 'Anket'}_odeme_listesi.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [detailTab, setDetailTab] = useState('analysis'); // 'analysis' or 'payment'

  const handleUpdateSubmissionStatus = async (submissionId, newStatus) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (resp.ok) {
        if (selectedSurvey) fetchSurveyDetails(selectedSurvey.id);
        alert(`Katılım durumu '${newStatus}' olarak güncellendi.`);
      } else {
        const errData = await resp.json();
        alert(`Hata: ${errData.message || 'Güncelleme başarısız.'}`);
      }
    } catch (err) {
      alert('Ağ hatası: Sunucuya ulaşılamadı.');
    }
  };

  const SidebarItem = ({ icon: Icon, label, viewId }) => {
    const isActive = activeView === viewId;
    return (
      <button
        onClick={() => setActiveView(viewId)}
        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/5 text-orange-500 font-bold border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
          : 'text-slate-400 hover:bg-[#1A233A] hover:text-slate-200 border border-transparent'
          }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
        <span>{label}</span>
      </button>
    );
  };

  if (!token) return <LoginPage onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-[#0B1121] flex font-sans text-slate-200 selection:bg-orange-500/30">

      {/* --- YAN MENÜ (SIDEBAR) --- */}
      <aside className="w-72 bg-[#0B1121] border-r border-[#1A233A] flex flex-col z-10 shrink-0 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-orange-500/5 blur-[50px] pointer-events-none"></div>

        <div className="h-24 flex items-center px-8 border-b border-[#1A233A] shrink-0 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-xl font-black italic tracking-tighter text-white">PT</span>
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight leading-none text-white">PolTem</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">AKADEMİ</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2 relative z-10">
          <div className="mb-4 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Analitik</div>
          <SidebarItem icon={BarChart3} label="Kontrol Paneli" viewId="overview" />
          {/* <SidebarItem icon={Brain} label="AI Analizi" viewId="ai-analytics" /> */}

          <div className="mt-10 mb-4 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Yönetim Paneli</div>
          <SidebarItem icon={Users} label="Kullanıcılarımız" viewId="users" />
          <SidebarItem icon={ListTodo} label="Anket Yönetimi" viewId="surveys" />
          <SidebarItem icon={WalletCards} label="Ödeme Talimatları" viewId="payments" />
        </div>
      </aside>

      {/* --- ANA İÇERİK (MAIN CONTENT) --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <header className="h-24 bg-[#0B1121]/80 backdrop-blur-xl border-b border-[#1A233A] flex items-center justify-between px-10 z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activeView === 'overview' && 'Sistem Analitiği ve Özeti'}
              {/* {activeView === 'ai-analytics' && 'Yapay Zeka Platform Analizi'} */}
              {activeView === 'users' && 'Kullanıcı Yönetimi'}
              {activeView === 'surveys' && 'Anket Yönetimi'}
              {activeView === 'payments' && 'Ödeme Talimatı Tablosu'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">PolTem Akademi Yönetim Paneli</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-[#1A233A] px-5 py-2.5 rounded-full border border-[#2A3441] shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs font-bold text-slate-300 tracking-wider">SİSTEM AKTİF</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl border border-rose-500/20 transition-all text-xs"
            >
              Çıkış Yap
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white bg-[#1A233A] rounded-full transition-all border border-[#2A3441] hover:border-orange-500/50 relative shadow-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 border-2 border-[#0B1121] rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/30 rounded-[2.5rem] flex items-center gap-4 text-rose-500 animate-in shake duration-500">
                <AlertCircle className="w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-black text-lg">Hata Oluştu</h4>
                  <p className="text-sm font-bold opacity-80">{error}</p>
                </div>
                <button onClick={fetchData} className="ml-auto px-6 py-2 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-colors">Yenile</button>
              </div>
            )}

            {/* --- SAYFA 0: KONTROL PANELİ (ANALİTİK) --- */}
            {activeView === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Toplam Kullanıcı', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-400' },
                    { title: 'Bekleyen İstekler', value: stats.pending || 0, icon: FileText, color: 'text-amber-400' },
                    { title: 'Aktif Anketler', value: stats.approved || 0, icon: ListTodo, color: 'text-emerald-400' },
                    { title: 'Tamamlanan', value: stats.completed || 0, icon: CheckCircle2, color: 'text-purple-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#131B2F] rounded-[2rem] p-8 border border-[#1A233A] shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-all cursor-default">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className={`p-4 rounded-2xl bg-[#1A233A] border border-[#2A3441] ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon className="w-6 h-6" /></div>
                      </div>
                      <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider relative z-10">{stat.title}</p>
                      <p className="text-4xl font-black text-white relative z-10">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* AI Hızlı Analiz Kartı */}
                {/* <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] group-hover:bg-orange-500/10 transition-all"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-[#1A233A] rounded-2xl border border-orange-500/30 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                      <Brain className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Yapay Zeka Destekli Analiz</h3>
                      <p className="text-sm text-slate-400 font-bold mt-1">Platform büyüme verilerini ve trendleri saniyeler içinde analiz edin.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('ai-analytics')}
                    className="px-10 py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-3 relative z-10"
                  >
                    <Sparkles className="w-5 h-5" /> Analiz Merkezine Git
                  </button>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#131B2F] rounded-[2.5rem] border border-[#1A233A] p-10 shadow-xl">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-white">Anket Katılım Trendleri</h3>
                        <p className="text-sm text-slate-400 font-bold mt-1">Haftalık platform etkileşimi</p>
                      </div>
                      <button className="flex items-center gap-2 text-sm font-bold bg-[#1A233A] px-5 py-3 rounded-full text-slate-300 border border-[#2A3441] hover:text-white hover:border-orange-500/50 transition-colors">
                        <Download className="w-4 h-4" /> Rapor İndir
                      </button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4">
                      {(stats.chartData?.platforms || [0, 0, 0, 0, 0, 0, 0]).map((item, i) => {
                        const val = typeof item === 'number' ? item : (item._count?.id || 0);
                        const label = item.platform || ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr'][i];
                        const max = Math.max(...(stats.chartData?.platforms?.map(p => p._count?.id) || [100]));
                        const height = max > 0 ? (val / max) * 100 : 0;

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="w-full relative flex items-end justify-center">
                              <div className="w-full bg-[#1A233A] rounded-full h-48 absolute bottom-0"></div>
                              <div
                                className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-full relative z-10 transition-all duration-1000 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                style={{ height: `${height}%` }}
                              >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                                  {val}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate w-full text-center">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#131B2F] rounded-[2.5rem] border border-[#1A233A] p-10 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                      <History className="w-6 h-6 text-orange-500" /> Son Aktiviteler
                    </h3>
                    <div className="space-y-8">
                      {activities.map((act) => (
                        <div key={act.id} className="flex gap-4 group cursor-default">
                          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border transition-colors ${act.type === 'approve' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50' :
                            act.type === 'payout' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/50' :
                              'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50'
                            }`}>
                            {act.type === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : act.type === 'payout' ? <WalletCards className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-bold text-white truncate">
                              {act.user} <span className="text-slate-400 font-medium">{'->'} {act.target}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{act.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-10 py-4 rounded-2xl border border-[#2A3441] bg-[#1A233A] text-sm font-bold text-slate-300 hover:text-white hover:border-orange-500/50 transition-all">
                      Tüm Geçmişi Gör
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* {activeView === 'ai-analytics' && renderAIAnalytics()} */}

            {/* SAYFA 1: KULLANICILAR */}
            {activeView === 'users' && (
              <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] overflow-hidden animate-in fade-in shadow-2xl">
                <div className="p-8 border-b border-[#1A233A] bg-[#131B2F]/50 flex justify-between items-center">
                  <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <Users className="w-6 h-6 text-orange-500" />
                    Kullanıcılarımız
                  </h2>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex items-center bg-[#0B1121] border border-[#2A3441] rounded-full p-1 shadow-inner">
                      <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                      <input
                        type="text"
                        placeholder="Kullanıcı Ara..."
                        className="bg-transparent border-none text-white px-4 py-2 outline-none placeholder:text-slate-500 text-sm font-medium w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-[#1A233A] rounded-2xl">
                      <tr>
                        <th className="px-8 py-5 first:rounded-l-2xl">ID</th>
                        <th className="px-8 py-5">Ad Soyad</th>
                        <th className="px-8 py-5">Email</th>
                        <th className="px-8 py-5">Rol</th>
                        <th className="px-8 py-5 text-right last:rounded-r-2xl">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A233A]">
                      {users.filter(u =>
                        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(u => (
                        <tr key={u.id} className="hover:bg-[#1A233A]/50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(u)}>
                          <td className="px-8 py-6 font-mono text-slate-400 text-sm">{u.id}</td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-orange-400 transition-colors">{u.name}</span>
                              <div className={`flex items-center gap-1 mt-1 text-[9px] font-black ${(u.trust_score || 100) >= 80 ? 'text-emerald-500' :
                                (u.trust_score || 100) >= 50 ? 'text-orange-500' :
                                  'text-red-500'
                                }`}>
                                <Sparkles className="w-2.5 h-2.5" />

                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-slate-400 text-sm">{u.email}</td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'Araştırmacı' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-[#1A233A] text-slate-300 border border-[#2A3441]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {u.role !== 'Araştırmacı' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMakeResearcher(u.id, true); }}
                                  className="text-[10px] font-black bg-[#1A233A] hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all border border-[#2A3441] hover:border-transparent uppercase tracking-wider shadow-lg"
                                >
                                  Araştırmacı Yap
                                </button>
                              )}
                              <button className="p-2.5 bg-[#1A233A] border border-[#2A3441] rounded-xl group-hover:border-orange-500/50 transition-colors">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SAYFA: UNIFIED ANKET YÖNETİMİ */}
            {activeView === 'surveys' && (
              <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] overflow-hidden animate-in fade-in shadow-2xl">
                <div className="p-8 border-b border-[#1A233A] bg-[#131B2F]/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                      <ListTodo className="w-6 h-6 text-orange-500" />
                      Anket Yönetimi
                    </h2>
                    <div className="flex bg-[#0B1121] p-1 rounded-xl border border-[#1A233A]">
                      {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'pending', label: 'Beklemede' },
                        { id: 'active', label: 'Yayında' },
                        { id: 'completed', label: 'Bitti' },
                        { id: 'rejected', label: 'İptal' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setSurveyFilter(tab.id)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${surveyFilter === tab.id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-[#1A233A] rounded-2xl">
                      <tr>
                        <th className="px-8 py-5 first:rounded-l-2xl">Oluşturan</th>
                        <th className="px-8 py-5">Anket Detayı</th>
                        <th className="px-8 py-5">Hedef / Ulaşılan</th>
                        <th className="px-8 py-5">Durum</th>
                        <th className="px-8 py-5 text-right last:rounded-r-2xl">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A233A]">
                      {[...surveys, ...requests]
                        .filter(s => surveyFilter === 'all' || s.status === surveyFilter)
                        .map(s => (
                          <tr key={s.id} className="hover:bg-[#1A233A]/50 transition-colors cursor-pointer group" onClick={() => {
                            if (s.status === 'pending') {
                              setSelectedRequest(s);
                            } else {
                              setSelectedSurvey(s);
                              fetchSurveyDetails(s.id, true);
                            }
                          }}>
                            <td className="px-8 py-6">
                              <div className="font-bold text-slate-200">{s.creatorName}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                                {new Date(s.created_at).toLocaleDateString('tr-TR')}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-bold text-white group-hover:text-orange-400 transition-colors text-lg">{s.title}</div>
                              <div className="text-sm text-slate-400 mt-1 font-medium truncate max-w-xs">{s.description}</div>
                            </td>
                            <td className="px-8 py-6 font-mono">
                              {s.status === 'pending' ? (
                                <span className="text-slate-500 italic">Onay Bekliyor</span>
                              ) : (
                                <>
                                  <span className="font-black text-orange-400">{s.reachedCount || 0}</span> <span className="text-slate-500 text-sm">/ {s.targetCount || s.target_audience}</span>
                                </>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${(STATUS_MAP[s.status] || STATUS_MAP['active']).color}`}>
                                {(STATUS_MAP[s.status] || STATUS_MAP['active']).label}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                className="p-3 bg-[#1A233A] border border-[#2A3441] rounded-xl group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-colors"
                              >
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'survey-audit' && renderSurveyAudit()}

            {/* SAYFA 6: ÖDEME TALİMATLARI */}
            {activeView === 'payments' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[100px] pointer-events-none"></div>
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black text-white">Ödeme Talimatları</h2>
                        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs flex items-center gap-2">
                          <WalletCards className="w-4 h-4 text-orange-500" /> Araştırmalara Göre Otomatik Ödeme Listeleri
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {surveys.filter(s => s.status === 'completed' || s.reachedCount > 0).map(s => (
                        <div key={s.id} className="bg-[#0B1121] border border-[#2A3441] rounded-[2rem] p-6 hover:border-orange-500/50 transition-all group overflow-hidden relative">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                              <h4 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors">{s.title}</h4>
                              <div className="flex gap-4 items-center">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${(STATUS_MAP[s.status] || STATUS_MAP['active']).color}`}>
                                  {(STATUS_MAP[s.status] || STATUS_MAP['active']).label}
                                </span>
                                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {s.reachedCount} Katılımcı
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => { setSelectedSurvey(s); fetchSurveyDetails(s.id, true); setDetailTab('payment'); }}
                              className="px-6 py-3 bg-orange-500/10 group-hover:bg-orange-500 text-orange-500 group-hover:text-white font-black rounded-xl transition-all border border-orange-500/30 group-hover:border-transparent text-xs uppercase tracking-widest shadow-lg flex items-center gap-2"
                            >
                              <History className="w-4 h-4" /> Ödeme Tablosunu Gör
                            </button>
                          </div>
                        </div>
                      ))}
                      {surveys.filter(s => s.status === 'completed' || s.reachedCount > 0).length === 0 && (
                        <div className="text-center py-20 bg-[#0B1121] border border-[#1A233A] rounded-[2rem]">
                          <WalletCards className="w-16 h-16 text-slate-700 mx-auto mb-6 opacity-20" />
                          <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Henüz ödeme bekleyen katılım yok</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* --- KULLANICI PROFİLİ DETAY PANELİ (SLIDE-OVER) --- */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-[#0B1121]/80 backdrop-blur-md z-[60] animate-in fade-in" onClick={() => setSelectedUser(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#131B2F] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[70] border-l border-[#1A233A] flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-[#1A233A] bg-[#131B2F]/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <UserCircle className="w-6 h-6 text-orange-500" />
                {isEditingUser ? 'Profili Düzenle' : 'Kullanıcı Profili'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingUser(!isEditingUser)}
                  className={`p-2.5 rounded-xl transition-all border ${isEditingUser ? 'bg-orange-500 text-white border-orange-600 shadow-lg' : 'text-slate-400 hover:text-white bg-[#1A233A] border-[#2A3441]'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedUser(null)} className="p-2.5 text-slate-400 hover:text-white bg-[#1A233A] rounded-xl transition-all border border-[#2A3441]"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {isEditingUser ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-4 bg-[#0B1121] p-6 rounded-[2rem] border border-[#1A233A]">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Ad Soyad</label>
                      <input type="text" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 font-black h-[46px]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Telefon</label>
                      <input type="text" value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} className="w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 font-black h-[46px]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-[#0B1121] p-6 rounded-[2rem] border border-[#1A233A]">
                    <SingleSelect label="Şehir" selected={editUserCity} options={CITY_OPTIONS} onChange={setEditUserCity} />
                    <SingleSelect label="Eğitim" selected={editUserEducation} options={EDUCATION_OPTIONS} onChange={setEditUserEducation} />
                    <SingleSelect label="Meslek" selected={editUserOccupation} options={OCCUPATION_OPTIONS} onChange={setEditUserOccupation} />
                    <SingleSelect label="Çalışma Durumu" selected={editUserWorkStatus} options={WORK_STATUS_OPTIONS} onChange={setEditUserWorkStatus} />
                    <SingleSelect label="Sektör" selected={editUserSector} options={SECTOR_OPTIONS} onChange={setEditUserSector} />
                    <SingleSelect label="Gelir" selected={editUserIncome} options={INCOME_OPTIONS} onChange={setEditUserIncome} />
                    <SingleSelect label="Medeni Durum" selected={editUserMarital} options={MARITAL_OPTIONS} onChange={setEditUserMarital} />
                    <SingleSelect label="Çocuk Sayısı" selected={editUserChildren} options={CHILDREN_OPTIONS} onChange={setEditUserChildren} />
                  </div>

                  <button
                    onClick={handleUpdateUser}
                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5" /> PROFİLİ GÜNCELLE
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#1A233A] border-2 border-orange-500 rounded-3xl flex items-center justify-center text-4xl font-black text-orange-500 mx-auto mb-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-1 leading-tight">{selectedUser.name}</h3>
                    <p className="text-slate-400 font-medium">{selectedUser.email}</p>
                    <div className="mt-4 flex justify-center">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#1A233A] text-slate-300 border border-[#2A3441]">
                        ID: {selectedUser.id}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0B1121] border border-[#1A233A] rounded-[2rem] p-8 space-y-4 shadow-inner text-left">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">Profil ve Banka Bilgileri</h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Cinsiyet</span>
                        <span className="text-white font-bold text-sm">
                          {DB_TO_DISPLAY[selectedUser.profile?.gender] || selectedUser.profile?.gender || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Şehir</span>
                        <span className="text-white font-bold text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {DB_TO_DISPLAY[selectedUser.profile?.city] || selectedUser.profile?.city || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Eğitim</span>
                        <span className="text-white font-bold text-sm text-right">
                          {DB_TO_DISPLAY[selectedUser.profile?.education_level] || selectedUser.profile?.education_level || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Meslek</span>
                        <span className="text-white font-bold text-sm text-right">
                          {DB_TO_DISPLAY[selectedUser.profile?.occupation] || selectedUser.profile?.occupation || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Hane Geliri</span>
                        <span className="text-white font-bold text-sm">
                          {DB_TO_DISPLAY[selectedUser.profile?.household_income] || selectedUser.profile?.household_income || selectedUser.profile?.monthly_income || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Medeni Durum</span>
                        <span className="text-white font-bold text-sm">
                          {DB_TO_DISPLAY[selectedUser.profile?.marital_status] || selectedUser.profile?.marital_status || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Bakiye</span>
                        <span className="text-orange-500 font-black text-lg">{selectedUser.profile?.balance || '0.00'} TL</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">Hızlı İşlemler</h4>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleMakeResearcher(selectedUser.id, selectedUser.role !== 'Araştırmacı')}
                    className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-500 font-bold rounded-2xl transition-all text-xs"
                  >
                    {selectedUser.role === 'Araştırmacı' ? 'Araştırmacı Yetkisini Kaldır' : 'Araştırmacı Yetkisi Ver'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- SAYFA 3: ANKET İSTEĞİ DETAY PANELİ (YAYIMLAMA EKRANI) --- */}
      {selectedRequest && (
        <>
          <div className="fixed inset-0 bg-[#0B1121]/80 backdrop-blur-sm z-[60] animate-in fade-in" onClick={() => setSelectedRequest(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#131B2F] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[70] border-l border-[#1A233A] flex flex-col animate-in slide-in-from-right duration-500">

            <div className="p-8 border-b border-[#1A233A] flex justify-between items-center bg-[#131B2F]/50">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <FileText className="w-7 h-7 text-orange-500" /> Anket Yayımla
              </h2>
              <button onClick={() => setSelectedRequest(null)} className="p-3 text-slate-400 hover:text-white bg-[#1A233A] rounded-xl transition-all border border-[#2A3441]"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Anket Bilgileri Özeti */}
              <div className="bg-[#0B1121] border border-[#1A233A] rounded-[2rem] p-8 space-y-6 shadow-inner text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Anket Adı (Düzenlenebilir)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500 transition-all font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Detayı</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-[#131B2F] border border-[#1A233A] rounded-xl px-4 py-3 text-slate-300 text-sm outline-none focus:border-orange-500 transition-all min-h-[100px] font-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelect
                    label="Cinsiyet"
                    selected={editGender}
                    options={GENDER_OPTIONS}
                    onChange={setEditGender}
                  />
                  <MultiSelect
                    label="Yaş Grubu"
                    selected={editAge}
                    options={AGE_OPTIONS}
                    onChange={setEditAge}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelect
                    label="Şehir"
                    selected={editCity}
                    options={CITY_OPTIONS}
                    onChange={setEditCity}
                  />
                  <MultiSelect
                    label="Eğitim"
                    selected={editEducation}
                    options={EDUCATION_OPTIONS}
                    onChange={setEditEducation}
                  />
                </div>

                <div className="mb-4">
                  <MultiSelect
                    label="Meslek (Ana Dal)"
                    selected={editOccupation}
                    options={OCCUPATION_OPTIONS}
                    onChange={setEditOccupation}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelect
                    label="Çalışma Durumu"
                    selected={editWorkStatus}
                    options={WORK_STATUS_OPTIONS}
                    onChange={setEditWorkStatus}
                  />
                  <MultiSelect
                    label="Sektör"
                    selected={editSector}
                    options={SECTOR_OPTIONS}
                    onChange={setEditSector}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelect
                    label="Pozisyon"
                    selected={editPosition}
                    options={POSITION_OPTIONS}
                    onChange={setEditPosition}
                  />
                  <MultiSelect
                    label="Aylık Hane Geliri"
                    selected={editIncome}
                    options={INCOME_OPTIONS}
                    onChange={setEditIncome}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MultiSelect
                    label="Medeni Durum"
                    selected={editMarital}
                    options={MARITAL_OPTIONS}
                    onChange={setEditMarital}
                  />
                  <MultiSelect
                    label="Çocuk Sayısı"
                    selected={editChildren}
                    options={CHILDREN_OPTIONS}
                    onChange={setEditChildren}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#131B2F] p-4 rounded-2xl border border-[#1A233A]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Form Linki</label>
                    <input
                      type="text"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      className="w-full bg-[#0B1121] border border-[#1A233A] rounded-xl px-4 py-2 text-blue-400 text-xs font-bold outline-none focus:border-orange-500 font-black"
                    />
                  </div>
                  <div className="bg-[#131B2F] p-4 rounded-2xl border border-[#1A233A]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Platform</label>
                    <input
                      type="text"
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value)}
                      className="w-full bg-[#0B1121] border border-[#1A233A] rounded-xl px-4 py-2 text-orange-500 text-xs font-bold outline-none focus:border-orange-500 font-black"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <WalletCards className="w-4 h-4 text-orange-500" /> Paket Tanımla (Dakika/TL)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PACKAGES.map(pkg => (
                      <label
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPackage.id === pkg.id ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-[#0B1121] border-[#1A233A] hover:border-[#2A3441]'}`}
                      >
                        <div className="flex-1">
                          <span className="font-bold text-white block mb-1">{pkg.name}</span>
                          <span className="font-black text-orange-500 text-lg">{pkg.price} TL</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPackage.id === pkg.id ? 'border-orange-500' : 'border-slate-600'}`}>
                          {selectedPackage.id === pkg.id && <div className="w-3 h-3 bg-orange-500 rounded-full"></div>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Özel Tutar & Süre Opsiyonel */}
                <div className="bg-[#131B2F] border border-[#1A233A] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${useCustomPricing ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Özel Tutar & Süre</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Paket fiyatı dışına çıkmak için aktif et</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseCustomPricing(!useCustomPricing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-orange-500/30 ${useCustomPricing ? 'bg-orange-500' : 'bg-[#2A3441]'
                        }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useCustomPricing ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${useCustomPricing ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Özel Tutar (TL)</label>
                      <input
                        type="number"
                        value={customReward}
                        onChange={(e) => setCustomReward(e.target.value)}
                        className="w-full bg-[#0B1121] border border-[#1A233A] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 font-black h-[46px]"
                        placeholder={selectedPackage.price.toString()}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 font-black">Özel Süre (Dk)</label>
                      <input
                        type="number"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full bg-[#0B1121] border border-[#1A233A] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 font-black h-[46px]"
                        placeholder={(parseInt(selectedPackage.name.match(/\d+/)?.[0]) || 5).toString()}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-black">
                    <Users className="w-4 h-4 text-orange-500 font-black" /> Hedef Katılımcı Sayısı
                  </label>
                  <input
                    type="number"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    placeholder="Örn: 500"
                    className="w-full bg-[#0B1121] border-2 border-[#1A233A] rounded-2xl p-6 text-white text-2xl font-black outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-600 font-black"
                  />
                </div>

                <div className="bg-gradient-to-br from-[#1A233A] to-[#0B1121] border border-[#2A3441] rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px]"></div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400 px-2">
                      <span>Birim Katılımcı Fiyatı</span>
                      <span>{(useCustomPricing ? (parseFloat(customReward) || selectedPackage.price) : selectedPackage.price).toLocaleString()} TL</span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400 px-2">
                      <span>Katılımcı Sayısı</span>
                      <span>{parseInt(targetCount) || 0} Kişi</span>
                    </div>

                    <div className="h-px bg-[#2A3441] w-full my-4"></div>

                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 flex items-center justify-center gap-2">
                      <Calculator className="w-3 h-3 text-orange-500" />
                      TOPLAM ÖDENECEK TUTAR
                    </p>

                    <p className="text-6xl font-black text-white text-center">
                      {(parseInt(targetCount) * (useCustomPricing ? (parseFloat(customReward) || selectedPackage.price) : selectedPackage.price) || 0).toLocaleString()} <span className="text-orange-500 text-3xl">TL</span>
                    </p>
                  </div>

                  <div className="mt-6 inline-block w-full bg-[#0B1121]/50 border border-[#2A3441] px-4 py-3 rounded-xl relative z-10 text-center">
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.1em]">
                      📄 Belirtilen tutar haricinde ek bir hizmet bedeli yoktur
                    </p>
                  </div>

                  {/* Yönetici Detayları (Sadece Admin Görür) */}
                  <div className="mt-8 pt-8 border-t border-[#2A3441] space-y-3 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yönetici Detayları (Kâr Analizi)</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>KDV Matrahı (KDV'siz)</span>
                      <span>{((parseInt(targetCount) * (useCustomPricing ? (parseFloat(customReward) || selectedPackage.price) : selectedPackage.price) || 0) / 1.2).toLocaleString(undefined, { maximumFractionDigits: 1 })} TL</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Hesaplanan KDV (%20)</span>
                      <span>{((parseInt(targetCount) * (useCustomPricing ? (parseFloat(customReward) || selectedPackage.price) : selectedPackage.price) || 0) * (20 / 120)).toLocaleString(undefined, { maximumFractionDigits: 1 })} TL</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-orange-500/80">
                      <span>Net Kâr (Tahmini)</span>
                      <span className="font-black">
                        {(() => {
                          const total = (parseInt(targetCount) * (useCustomPricing ? (parseFloat(customReward) || selectedPackage.price) : selectedPackage.price) || 0);
                          const cost = (parseInt(targetCount) * (useCustomPricing ? (parseFloat(customReward) * (selectedPackage.cost / selectedPackage.price)) : selectedPackage.cost) || 0);
                          const netProfit = (total / 1.2) - cost;
                          return netProfit.toLocaleString(undefined, { maximumFractionDigits: 1 });
                        })()} TL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-[#1A233A] bg-[#131B2F]/50">
              <button
                onClick={handlePublish}
                className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-black rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                YAYIMLA
              </button>
              <p className="text-xs text-center text-slate-500 mt-4 font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> Butona basıldığında katılımcılarımıza bildirim emaili olarak gönderilecek.
              </p>
            </div>
          </div>
        </>
      )}

      {selectedSurvey && (
        <>
          <div className="fixed inset-0 bg-[#0B1121]/80 backdrop-blur-sm z-[60] animate-in fade-in" onClick={() => setSelectedSurvey(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#131B2F] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[70] border-l border-[#1A233A] flex flex-col animate-in slide-in-from-right duration-500">

            <div className="p-8 border-b border-[#1A233A] flex justify-between items-center bg-[#131B2F]/50">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-2 font-black">
                  <ListTodo className="w-6 h-6 text-orange-500 font-black" /> Anket Yönetimi
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border font-black ${(STATUS_MAP[selectedSurvey.status] || STATUS_MAP['active']).color}`}>
                    DURUM: {(STATUS_MAP[selectedSurvey.status] || STATUS_MAP['active']).label}
                  </span>
                  <span className="text-slate-500 text-[9px] font-bold font-mono">ID: {selectedSurvey.id}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingSurvey(!isEditingSurvey)}
                  className={`p-3 rounded-xl transition-all border ${isEditingSurvey ? 'bg-orange-500 text-white border-orange-600 shadow-lg' : 'text-slate-400 hover:text-white bg-[#1A233A] border-[#2A3441]'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button onClick={() => fetchSurveyDetails(selectedSurvey.id)} className="p-3 text-orange-400 hover:text-white bg-orange-500/10 rounded-xl transition-all border border-orange-500/20 font-black"><TrendingUp className="w-5 h-5" /></button>
                <button onClick={() => setSelectedSurvey(null)} className="p-3 text-slate-400 hover:text-white bg-[#1A233A] rounded-xl transition-all border border-[#2A3441] font-black"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {isEditingSurvey ? (
                <div className="bg-[#0B1121] border border-[#1A233A] rounded-[2rem] p-8 space-y-6 shadow-inner text-left">
                  <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4">HEDEFLEME KRİTERLERİNİ DÜZENLE</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <MultiSelect label="Cinsiyet" selected={editGender} options={GENDER_OPTIONS} onChange={setEditGender} />
                    <MultiSelect label="Yaş Grubu" selected={editAge} options={AGE_OPTIONS} onChange={setEditAge} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MultiSelect label="Şehir" selected={editCity} options={CITY_OPTIONS} onChange={setEditCity} />
                    <MultiSelect label="Eğitim" selected={editEducation} options={EDUCATION_OPTIONS} onChange={setEditEducation} />
                  </div>
                  <MultiSelect label="Meslek" selected={editOccupation} options={OCCUPATION_OPTIONS} onChange={setEditOccupation} />
                  <div className="grid grid-cols-2 gap-4">
                    <MultiSelect label="Çalışma Durumu" selected={editWorkStatus} options={WORK_STATUS_OPTIONS} onChange={setEditWorkStatus} />
                    <MultiSelect label="Sektör" selected={editSector} options={SECTOR_OPTIONS} onChange={setEditSector} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MultiSelect label="Pozisyon" selected={editPosition} options={POSITION_OPTIONS} onChange={setEditPosition} />
                    <MultiSelect label="Gelir" selected={editIncome} options={INCOME_OPTIONS} onChange={setEditIncome} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MultiSelect label="Medeni Durum" selected={editMarital} options={MARITAL_OPTIONS} onChange={setEditMarital} />
                    <MultiSelect label="Çocuk Sayısı" selected={editChildren} options={CHILDREN_OPTIONS} onChange={setEditChildren} />
                  </div>

                  <button
                    onClick={handleUpdateTargeting}
                    className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    HEDEFLEMEYİ GÜNCELLE
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-6 leading-tight">{selectedSurvey.title}</h3>

                    {/* Güncel Hedef Kitle (Dinamik Etiketler) */}
                    <div className="mb-8">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Cinsiyet', val: selectedSurvey.target_gender },
                          { label: 'Yaş', val: selectedSurvey.target_age_group },
                          { label: 'Şehir', val: selectedSurvey.target_city },
                          { label: 'Eğitim', val: selectedSurvey.target_education },
                          { label: 'Meslek', val: selectedSurvey.target_occupation },
                          { label: 'Çalışma', val: selectedSurvey.target_employment_status },
                          { label: 'Sektör', val: selectedSurvey.target_sector },
                          { label: 'Pozisyon', val: selectedSurvey.target_position },
                          { label: 'Gelir', val: selectedSurvey.target_income },
                          { label: 'Medeni', val: selectedSurvey.target_marital_status },
                          { label: 'Çocuk', val: selectedSurvey.target_child_count }
                        ].map(item => Array.isArray(item.val) && item.val.length > 0 && !item.val.every(v => v && String(v).toLowerCase() === 'hepsi') && (
                          <span key={item.label} className="px-3 py-1.5 bg-[#1A233A] border border-[#2A3441] rounded-lg text-[11px] font-bold text-slate-300">
                            <span className="text-slate-500 mr-1 uppercase tracking-wider text-[9px]">{item.label}:</span>
                            <span className="text-orange-400">{item.val.join(', ')}</span>
                          </span>
                        ))}
                        {/* Eğer her şey Hepsi ise tek bir etiket göster */}
                        {!([
                          selectedSurvey.target_gender, selectedSurvey.target_age_group, selectedSurvey.target_city,
                          selectedSurvey.target_education, selectedSurvey.target_occupation, selectedSurvey.target_employment_status,
                          selectedSurvey.target_sector, selectedSurvey.target_position, selectedSurvey.target_income,
                          selectedSurvey.target_marital_status, selectedSurvey.target_child_count
                        ].some(val => Array.isArray(val) && val.length > 0 && !val.every(v => v && String(v).toLowerCase() === 'hepsi'))) && (
                            <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[11px] font-bold text-orange-400">
                              GENEL HEDEFLEME (HEPSİ)
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-[#0B1121] border border-[#1A233A] rounded-[2rem] p-6 text-center shadow-inner">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Hedef Sayı</p>
                        <p className="text-4xl font-black text-slate-300">{selectedSurvey.target_audience || selectedSurvey.target_count || selectedSurvey.targetCount || '—'}</p>
                      </div>
                      <div className="bg-[#0B1121] border border-orange-500/30 rounded-[2rem] p-6 text-center relative overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                        <div className="absolute inset-0 bg-orange-500/10"></div>
                        <p className="text-[11px] font-black text-orange-500/70 uppercase tracking-[0.2em] mb-2 relative z-10">Ulaşılan Sayı</p>
                        <p className="text-4xl font-black text-orange-500 relative z-10">{selectedSurvey.reachedCount}</p>
                      </div>
                    </div>

                    {/* Finansal Özet */}
                    <div className="bg-gradient-to-br from-[#1A243A] to-[#0B1121] border border-[#2A3441] rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 blur-[40px]"></div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                        <WalletCards className="w-4 h-4 text-emerald-500" /> Finansal Özet (30% Komisyon Dahil)
                      </h4>
                      <div className="grid grid-cols-3 gap-4 relative z-10">
                        <div className="text-center p-4 bg-[#0B1121] border border-[#1A233A] rounded-2xl">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Katılımcı Payı</p>
                          <p className="text-sm font-black text-white">{selectedSurvey.reward_amount} TL</p>
                        </div>
                        <div className="text-center p-4 bg-[#0B1121] border border-[#1A233A] rounded-2xl">
                          <p className="text-[8px] font-black text-orange-500/70 uppercase mb-1">Sistem Payı (%30)</p>
                          <p className="text-sm font-black text-orange-400">{selectedSurvey.total_cost ? Math.round(selectedSurvey.total_cost * 0.3) : '—'}</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Toplam Maliyet</p>
                          <p className="text-sm font-black text-emerald-400">{selectedSurvey.total_cost ? Math.round(selectedSurvey.total_cost) : '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tabs */}
              <div className="flex bg-[#0B1121]/50 p-1.5 rounded-2xl border border-[#1A233A] mb-8 w-fit">
                <button
                  onClick={() => setDetailTab('analysis')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${detailTab === 'analysis' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Katılımcı Analizi
                </button>
                <button
                  onClick={() => setDetailTab('payment')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${detailTab === 'payment' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Ödeme Listesi ({selectedSurvey.paymentTable?.rows?.length || 0})
                </button>
                {/* <div className="mx-4 w-px h-8 bg-[#1A233A] self-center"></div>
                <button 
                  onClick={() => handleAnalyzeCampaign(selectedSurvey.id)}
                  disabled={analysisLoading}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-2"
                >
                  {analysisLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Zekice Analiz Et
                </button> */}
              </div>

              {detailTab === 'analysis' && (
                <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-500 shadow-2xl mb-10">
                  <div className="p-8 border-b border-[#1A233A] bg-[#131B2F]/50 flex justify-between items-center">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                      <Users className="w-5 h-5 text-orange-500" />
                      Anketi Dolduranlar (Kullanıcı Tablosu)
                    </h4>
                    <div className="flex gap-3">
                      <input
                        type="file"
                        id="csvMatchUpload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            const dataRows = await parseFileToJson(file);
                            const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedSurvey.id}/match-csv`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ rows: dataRows })
                            });

                            if (res.ok) {
                              const results = await res.json();
                              alert(`Eşleşti: ${results.matched?.length || 0} onaylandı, ${results.unmatchedCsv?.length || 0} eşleşmedi (CSV'de bulunup sistemde olmayan).`);
                              fetchSurveyDetails(selectedSurvey.id);
                            }
                          } catch (err) { 
                            alert('Dosya okuma veya eşleştirme hatası.'); 
                          }
                          e.target.value = '';
                        }}
                      />
                      <input
                        type="file"
                        id="smartMatchUpload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const colId = prompt('Benzersiz ID sütun adı (örn: Unique ID):', 'Unique ID');
                          const colAns = prompt('Cevapların olduğu sütun adı (örn: Question Header):', 'Answer');
                          const correctVal = prompt('Doğru cevap değeri (örn: 4):', '4');

                          if (colId && colAns && correctVal) {
                            try {
                              const dataRows = await parseFileToJson(file);
                              const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedSurvey.id}/validate-csv`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ rows: dataRows, idCol: colId, ansCol: colAns, correctVal })
                              });
                              if (res.ok) {
                                const results = await res.json();
                                alert(`Akıllı Doğrulama: ${results.approved} onaylandı, ${results.rejected} reddedildi.`);
                                fetchSurveyDetails(selectedSurvey.id);
                              }
                            } catch (err) { 
                              alert('Doğrulama hatası أو ملف غير صالح.'); 
                            }
                          }
                          e.target.value = '';
                        }}
                      />
                      <button
                        onClick={() => {
                          const ruleType = prompt('Kural Tipi (equality, contradiction, range):', 'equality');
                          if (!ruleType) return;

                          let newRule = { type: ruleType, message: '' };
                          if (ruleType === 'equality') {
                            newRule.column = prompt('Kontrol edilecek sütun adı:');
                            newRule.value = prompt('Beklenen değer:');
                            newRule.message = prompt('Hata mesajı (opsiyonel):') || `${newRule.column} hatalı`;
                          } else if (ruleType === 'contradiction') {
                            const col1 = prompt('1. Sütun:');
                            const val1 = prompt('1. Sütun Değeri:');
                            const col2 = prompt('2. Sütun:');
                            const val2 = prompt('2. Sütun Değeri:');
                            newRule.conditions = [
                              { column: col1, value: val1, operator: '==' },
                              { column: col2, value: val2, operator: '==' }
                            ];
                            newRule.message = prompt('Hata mesajı:') || 'Çelişkili cevaplar';
                          } else if (ruleType === 'range') {
                            newRule.column = prompt('Sayısal sütun adı:');
                            newRule.min = parseFloat(prompt('Minimum değer:'));
                            newRule.max = parseFloat(prompt('Maximum değer:'));
                            newRule.message = prompt('Hata mesajı:') || 'Nalı dışı değer';
                          }

                          if (newRule.column || newRule.conditions) {
                            setValidationRules([...validationRules, newRule]);
                            alert('Kural eklendi. Şimdi CSV yükleyerek bu kuralları uygulayabilirsiniz.');
                          }
                        }}
                        className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 ml-2" /> Kural Ekle ({validationRules.length})
                      </button>
                      <button
                        onClick={() => {
                          if (validationRules.length === 0) return alert('Lütfen önce en az bir kural ekleyin.');
                          document.getElementById('advancedMatchUpload').click();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20"
                      >
                        <Sparkles className="w-4 h-4 ml-2" /> Gelişmiş Doğrulama
                      </button>
                      <input
                        type="file"
                        id="advancedMatchUpload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          try {
                            const dataRows = await parseFileToJson(file);
                            const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedSurvey.id}/validate-advanced`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ rows: dataRows, rules: validationRules })
                            });
                            if (res.ok) {
                              const results = await res.json();
                              alert(`Analiz Tamamlandı:\n- Onaylanan: ${results.approved}\n- Reddedilen: ${results.rejected}\n- Yeni İçe Aktarılan: ${results.imported}\n- Atlanan: ${results.skipped}\n\nNot: ${results.rejected} kişi kural ihlali nedeniyle reddedildi.`);
                              fetchSurveyDetails(selectedSurvey.id);
                            }
                          } catch (err) {
                            alert('Doğrulama hatası.');
                          }
                          e.target.value = '';
                        }}
                      />
                      <button
                        onClick={() => document.getElementById('csvMatchUpload').click()}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                      >
                        <FileUp className="w-4 h-4 ml-2" /> CSV ile Eşleştir
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#0B1121] border border-[#1A233A] rounded-3xl overflow-hidden max-h-[400px] overflow-y-auto shadow-inner">
                    <table className="w-full text-left">
                      <thead className="bg-[#1A233A] sticky top-0 z-20 border-b border-[#2A3441]">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Katılımcı / Kalite Analizi</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A233A]">
                        {selectedSurvey.participants?.map((p, i) => {
                          const start = p.started_at ? new Date(p.started_at) : null;
                          const end = p.created_at ? new Date(p.created_at) : null;
                          let durationMin = 0;
                          if (start && end) durationMin = (end - start) / (1000 * 60);
                          const isTooFast = durationMin > 0 && durationMin < (selectedSurvey.estimated_time || 5) * 0.4;

                          return (
                            <React.Fragment key={p.id || i}>
                              <tr className="hover:bg-[#131B2F] transition-colors font-black border-b border-[#1A233A]/50 last:border-0 relative group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black tracking-tighter ${isTooFast ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'}`}>
                                      <Clock className="w-3 h-3" />
                                      {durationMin > 0 ? `${Math.round(durationMin * 10) / 10} DK` : '—'}
                                      {isTooFast && <AlertCircle className="w-3 h-3 animate-pulse" />}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-tighter font-black border ${p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                                      p.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                                        'bg-orange-500/20 text-orange-400 border-orange-500/20'
                                      }`}>
                                      {p.status}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-white font-bold text-sm font-black leading-tight">
                                        {p.metadata?.shadow ? 'External Guest' : (p.users?.profiles?.full_name || 'İsimsiz')}
                                      </span>

                                      {/* Classification Badges */}
                                      {!p.metadata?.shadow && p.users?.profiles?.full_name ? (
                                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-[4px] text-[7px] font-black uppercase tracking-tighter shadow-sm">Verified Member</span>
                                      ) : p.status === 'approved' ? (
                                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-[4px] text-[7px] font-black uppercase tracking-tighter shadow-sm">Verified Guest</span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 bg-slate-500/10 text-slate-500 border border-slate-500/10 rounded-[4px] text-[7px] font-black uppercase tracking-tighter opacity-60">Guest</span>
                                      )}

                                      {p.metadata?.imported && (
                                        <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-[4px] text-[7px] font-black uppercase tracking-tighter shadow-sm">CSV Import</span>
                                      )}

                                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black border ${(p.users?.profiles?.trust_score || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        (p.users?.profiles?.trust_score || 0) >= 50 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                          'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        <Sparkles className="w-2 h-2" />
                                        {p.users?.profiles?.trust_score || 100}
                                      </div>
                                    </div>
                                    <span className="text-slate-500 text-[10px] font-black mt-0.5">
                                      {p.metadata?.shadow ? `Kod: ${p.unique_id || p.metadata?.unique_id || '—'}` : (p.users?.email || '—')}
                                    </span>
                                    <span className="text-emerald-500 text-[9px] font-mono font-black mt-1 opacity-80">{p.users?.profiles?.iban || '—'}</span>

                                    {p.metadata?.validation_errors && p.metadata.validation_errors.length > 0 && (
                                      <div className="mt-1 text-[8px] text-red-400 font-bold leading-tight bg-red-400/5 p-1 rounded border border-red-400/10">
                                        {p.metadata.validation_errors.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    {p.metadata && Object.keys(p.metadata).length > 0 && (
                                      <button
                                        onClick={() => {
                                          const el = document.getElementById(`meta-${p.id}`);
                                          el.classList.toggle('hidden');
                                        }}
                                        className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20"
                                        title="Sayfa Detaylarını Gör"
                                      >
                                        <TrendingUp className="w-4 h-4" />
                                      </button>
                                    )}
                                    {p.status !== 'approved' && (
                                      <button
                                        onClick={() => handleUpdateSubmissionStatus(p.id, 'approved')}
                                        className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-lg"
                                        title="Onayla"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                    {p.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleUpdateSubmissionStatus(p.id, 'rejected')}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg"
                                        title="Reddet"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-2 text-[9px] text-slate-600 font-mono tracking-tighter">
                                    {new Date(p.created_at).toLocaleString('tr-TR')}
                                  </div>
                                </td>
                              </tr>
                              <tr id={`meta-${p.id}`} className="hidden bg-[#0F172A] border-b border-[#1A233A]/50">
                                <td colSpan="2" className="px-8 py-4">
                                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Sayfa Bazlı Davranış Analizi</div>
                                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                                    {Object.entries(p.metadata || {})
                                      .filter(([key, val]) => typeof val !== 'object' && key !== 'raw_data' && key !== 'validation_errors')
                                      .map(([key, val]) => (
                                        <div key={key} className="flex justify-between p-2 bg-[#1A233A]/50 rounded-lg border border-[#2A3441]">
                                          <span className="text-slate-500">{key}:</span>
                                          <span className="text-orange-400 font-black">{val} sn</span>
                                        </div>
                                      ))}
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                        {(!selectedSurvey.participants || selectedSurvey.participants.length === 0) && (
                          <tr>
                            <td colSpan="2" className="px-6 py-10 text-center text-slate-500 text-sm font-bold uppercase tracking-widest font-black">Henüz katılım yok</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === 'payment' && (
                <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                  {(!selectedSurvey.paymentTable || selectedSurvey.paymentTable.rows?.length === 0) ? (
                    <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] p-20 text-center shadow-2xl">
                      <WalletCards className="w-20 h-20 text-slate-700 mx-auto mb-6 opacity-20" />
                      <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">Henüz Onaylanmış Katılımcı Yok</h4>
                      <p className="text-slate-600 max-w-md mx-auto font-black leading-relaxed">
                        Ödeme listesinin oluşması için katılımcıları "Katılımcı Analizi" sekmesinden onaylamanız gerekmektedir.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-[#1A233A] bg-[#131B2F]/50 flex justify-between items-center">
                        <h4 className="text-xl font-black text-white flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 font-black" />
                          Onaylanan Katılımcılar ve Ödeme Listesi
                        </h4>
                        <button
                          onClick={() => handleExportExcel(selectedSurvey.title, selectedSurvey.paymentTable?.rows)}
                          className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                          <Download className="w-5 h-5" /> Excel'e Aktar (İndir)
                        </button>
                      </div>
                      <div className="p-2">
                        <table className="w-full text-left">
                          <thead className="bg-[#1A233A] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <tr>
                              <th className="px-6 py-5 first:rounded-l-2xl">Ad Soyad</th>
                              <th className="px-6 py-5">TC No</th>
                              <th className="px-6 py-5">Banka</th>
                              <th className="px-6 py-5">Hesap Sahibi</th>
                              <th className="px-6 py-5">IBAN</th>
                              <th className="px-6 py-5 text-right last:rounded-r-2xl">Tutar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1A233A]">
                            {(selectedSurvey.paymentTable?.rows || []).map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#1A233A]/30 transition-colors group">
                                <td className="px-6 py-6">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="text-white font-bold text-xs font-black">{row.full_name}</div>
                                    {row.is_shadow && (
                                      <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-[4px] text-[7px] font-black uppercase tracking-tighter shadow-sm">Verified Guest</span>
                                    )}
                                  </div>
                                  <div className="text-slate-500 text-[9px] font-black">{row.email}</div>
                                </td>
                                <td className="px-6 py-6 font-mono text-slate-400 text-xs font-black">{row.tc_identity_number}</td>
                                <td className="px-6 py-6 text-slate-300 text-[11px] font-black">{row.bank_name}</td>
                                <td className="px-6 py-6 text-slate-300 text-[11px] font-black">{row.full_name_bank}</td>
                                <td className="px-6 py-6">
                                  <div className={`text-emerald-500 font-mono text-[11px] font-black group-hover:scale-105 transition-transform origin-left ${row.is_shadow ? 'opacity-20' : ''}`}>{row.iban}</div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                  <span className="px-3 py-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl font-black text-xs whitespace-nowrap">
                                    {row.reward_amount} TL
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex items-start gap-4 text-left font-black">
                <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5 font-black" />
                <p className="text-sm text-slate-300 font-medium leading-relaxed font-black">
                  Anket hedef kitleye ulaştığında girişler kapatılacak. Farklı bir nedenden dondurma veya sonlandırmak istenebilir.
                </p>
              </div>

            </div>

            <div className="p-8 border-t border-[#1A233A] bg-[#131B2F]/50 flex flex-wrap gap-4">
              {/* RESTORE BUTTON - Always available for active/paused/completed */}
              <button
                onClick={() => handleRestore(selectedSurvey.id)}
                className="flex-[1_1_100%] sm:flex-1 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-[11px] shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                İsteklere/Taslağa Döndür
              </button>

              {selectedSurvey.status === 'active' && (
                <button
                  onClick={() => handlePause(selectedSurvey.id)}
                  className="flex-1 py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-[11px] shadow-lg"
                >
                  <PauseCircle className="w-4 h-4" />
                  Dondur
                </button>
              )}

              {selectedSurvey.status === 'paused' && (
                <button
                  onClick={() => handleResume(selectedSurvey.id)}
                  className="flex-1 py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-[11px] shadow-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  Devam Et
                </button>
              )}

              {selectedSurvey.status !== 'completed' && (
                <button
                  onClick={() => handleComplete(selectedSurvey.id)}
                  className="flex-1 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-[11px] shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tamamla
                </button>
              )}
            </div>
          </div>
        </>
      )}


    </div>
  );
}
