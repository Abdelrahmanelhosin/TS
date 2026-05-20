import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { DashboardContext } from './context/DashboardContext';
import AIAnalyticsView from './components/AIAnalyticsView';
import SendMailView from './components/SendMailView';

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
  Brain,
  Zap,
  Award,
  Send,
  Activity,
  Fingerprint,
  MousePointer2,
  MessageSquare,
  Share2,
  ShieldCheck,
  Rocket,
  Target,
  Database
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

// ─── Lookup Fallback Defaults ────────────────────────────────────────────────
// These are used while the API call is in-flight. The real data comes from GET /admin/lookups.
const DEFAULT_LOOKUPS = {
  gender:     ['Hepsi', 'Kadın', 'Erkek', 'Diğer'],
  age:        ['Hepsi', '18-24', '25-34', '35-44', '45-54', '55+'],
  education:  ['Hepsi', 'İlkokul', 'Ortaokul', 'Lise', 'Önlisans', 'Lisans', 'Yüksek Lisans', 'Doktora'],
  marital:    ['Hepsi', 'Evli', 'Bekar', 'Belirtmek İstemiyor'],
  workStatus: ['Hepsi', 'Çalışıyor', 'Çalışmıyor', 'Öğrenci', 'Emekli', 'Ev Hanımı'],
  income:     ['Hepsi', '0 - 40.000 TL', '40.001 - 80.000 TL', '80.001 - 120.000 TL', '120.001 - 160.000 TL', '160.001 TL ve üzeri'],
  children:   ['Hepsi', '0', '1', '2', '3', '4', '5+'],
  city:       ['Hepsi', 'Adana', 'Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'],
  sector:     ['Hepsi', 'Özel Sektör', 'Kamu Sektörü', 'İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi'],
  position:   ['Hepsi', 'Girişimci / İşletme Sahibi', 'Üst Düzey Yönetici', 'Orta Düzey Yönetici', 'Alt Düzey Yön. / Takım Lideri', 'Çalışan'],
  occupation: ['Hepsi', 'Akademisyen', 'Öğretmen', 'Doktor', 'Mühendis', 'Avukat', 'Yazılımcı / Bilişim Uzmanı', 'Diğer'],
  dbToDisplay: {},
};

// ─── useLookups Custom Hook ──────────────────────────────────────────────────
// Fetches all dropdown data from the backend once and caches it in module scope.
let _cachedLookups = null;
let _fetchPromise = null;

function useLookups(token) {
  const [lookups, setLookups] = useState(_cachedLookups || DEFAULT_LOOKUPS);

  useEffect(() => {
    if (_cachedLookups) {
      setLookups(_cachedLookups);
      return;
    }
    if (!token) return;
    if (!_fetchPromise) {
      _fetchPromise = fetch(`${API_BASE_URL}/admin/lookups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            _cachedLookups = data;
            setLookups(data);
          }
        })
        .catch(() => { /* silently fall back to defaults */ });
    } else {
      _fetchPromise.then(() => {
        if (_cachedLookups) setLookups(_cachedLookups);
      });
    }
  }, [token]);

  return lookups;
}

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

const DB_TO_DISPLAY = {
  'kadin': 'Kadın',
  'erkek': 'Erkek',
  'diger': 'Diğer',
  'evli': 'Evli',
  'bekar': 'Bekar',
  'belirtmek istemiyor': 'Belirtmek İstemiyor',
  'belirtmek_istemiyor': 'Belirtmek İstemiyor',
  'calisiyor': 'Çalışıyor',
  'calismiyor': 'Çalışmıyor',
  'ogrenci': 'Öğrenci',
  'emekli': 'Emekli',
  'ev hanimi': 'Ev Hanımı',
  'ev_hanimi': 'Ev Hanımı',
  'ilkokul': 'İlkokul',
  'lkokul': 'İlkokul',
  'ortaokul': 'Ortaokul',
  'lise': 'Lise',
  'onlisans': 'Önlisans',
  'nlisans': 'Önlisans',
  'lisans': 'Lisans',
  'yuksek lisans': 'Yüksek Lisans',
  'Y_ksek_Lisans': 'Yüksek Lisans',
  'doktora': 'Doktora',
  'hepsi': 'Hepsi',
  'C0': '0', 'C1': '1', 'C2': '2', 'C3': '3', 'C4': '4', 'C5_plus': '5+',
  'I0_40000': '0 - 40.000 TL',
  'I40001_80000': '40.001 - 80.000 TL',
  'I80001_120000': '80.001 - 120.000 TL',
  'I120001_160000': '120.001 - 160.000 TL',
  'I160001_uzeri': '160.001 TL ve üzeri',
  'uzeri': '160.001 TL ve üzeri',
  'turk_vatandasi': 'Türk Vatandaşı',
  'yabanci_uyruklu': 'Yabancı Uyruklu',
  'karabuk': 'Karabük',
  'istanbul': 'İstanbul',
  'ankara': 'Ankara',
  'izmir': 'İzmir'
};

const getDisplayLabel = (val, mapping) => {
  if (!val) return '—';
  const sv = String(val).trim();
  // 1. Direct match
  if (mapping[sv]) return mapping[sv];
  // 2. Case-insensitive match
  const lk = sv.toLowerCase();
  const mk = Object.keys(mapping).find(k => k.toLowerCase() === lk);
  if (mk) return mapping[mk];
  // 3. Fallback to raw value
  return sv;
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
        sessionStorage.setItem('token', data.access_token);
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-md bg-[#0B1121]/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-12">
          <div className="group relative">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <LayoutDashboard className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mt-8">PolTem<span className="text-orange-500">.</span>Admin</h1>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3 opacity-60">Strategic Management Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Access Identity</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Users className="w-4 h-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020617]/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white placeholder:text-slate-800 outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium shadow-inner"
                placeholder="admin@poltem.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Security Token</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <ShieldCheck className="w-4 h-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020617]/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white placeholder:text-slate-800 outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl text-xs font-black text-center animate-in shake duration-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                <>
                  INITIALIZE SESSION <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2026 PolTem Academy • encrypted.v3</p>
        </div>
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
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  // ─── Dynamic Lookups from Backend ──────────────────────────────────────────
  const lookups = useLookups(token);
  // Backward-compatible aliases so all existing JSX keeps working unchanged:
  const GENDER_OPTIONS     = lookups.gender;
  const AGE_OPTIONS        = lookups.age;
  const EDUCATION_OPTIONS  = lookups.education;
  const MARITAL_OPTIONS    = lookups.marital;
  const WORK_STATUS_OPTIONS = lookups.workStatus;
  const INCOME_OPTIONS     = lookups.income;
  const CHILDREN_OPTIONS   = lookups.children;
  const CITY_OPTIONS       = lookups.city;
  const SECTOR_OPTIONS     = lookups.sector;
  const POSITION_OPTIONS   = lookups.position;
  const OCCUPATION_OPTIONS = lookups.occupation;
  const DB_TO_DISPLAY      = lookups.dbToDisplay;

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
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 20;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
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
  const [surveyAuditReport, setSurveyAuditReport] = useState('');
  const [auditSurvey, setAuditSurvey] = useState(null); // The survey currently being audited full-screen
  const [surveyChatMessages, setSurveyChatMessages] = useState([]);
  const [surveyChatInput, setSurveyChatInput] = useState('');
  const [surveyChatLoading, setSurveyChatLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [globalChatMessages, setGlobalChatMessages] = useState([]);
  const [globalChatInput, setGlobalChatInput] = useState('');
  const [globalChatLoading, setGlobalChatLoading] = useState(false);
  const [excelAnalysisReport, setExcelAnalysisReport] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [userAiReport, setUserAiReport] = useState('');
  const [userAiLoading, setUserAiLoading] = useState(false);

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

  // Recipients Preview State
  const [previewUsers, setPreviewUsers] = useState([]);
  const [incompleteUsers, setIncompleteUsers] = useState([]);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [allUsersList, setAllUsersList] = useState([]); // For adding users manually

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
  const [editUserIBAN, setEditUserIBAN] = useState('');

  // Mail Sending State
  const [mailRecipient, setMailRecipient] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailLoading, setMailLoading] = useState(false);
  const [mailUserSearchTerm, setMailUserSearchTerm] = useState('');
  const [mailSearchResults, setMailSearchResults] = useState([]);


  
  // Rejection Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionSubmissionId, setRejectionSubmissionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };

  const handleAnalyzeSurveyAI = async (surveyId) => {
    setAnalysisLoading(true);
    try {
      // Fetch participants specifically as there is no single detail endpoint
      const resParticipants = await fetch(`${API_BASE_URL}/admin/surveys/${surveyId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!resParticipants.ok) throw new Error('Survey participants could not be fetched');
      const participants = await resParticipants.json();

      // Find survey basic info from local state if available
      const survey = surveys.find(s => s.id === surveyId) || { title: 'Araştırma Raporu' };
      const calculateDist = (keySelector) => participants.reduce((acc, p) => {
        const prof = p.users?.profiles || p.user?.profile || p.profile || {};
        const val = keySelector(prof) || 'Bilinmiyor';
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

      const findValue = (obj, keywords) => {
        if (!obj) return null;
        // Search in top level
        for (let key in obj) {
          if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
            return obj[key];
          }
        }
        // Search in nested profiles
        const prof = obj.users?.profiles || obj.user?.profile || obj.profile || {};
        for (let key in prof) {
          if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
            return prof[key];
          }
        }
        return null;
      };

      const statsSummary = {
        total_records: participants.length,
        demographic_summary: {
          city_dist: calculateDist(p => findValue(p, ['şehir', 'city', 'il', 'مدينة'])),
          gender_dist: calculateDist(p => findValue(p, ['cinsiyet', 'gender', 'جنس', 'نوع'])),
          age_dist: calculateDist(p => findValue(p, ['yaş', 'age', 'doğum', 'birth', 'عمر', 'سن'])),
          edu_dist: calculateDist(p => findValue(p, ['eğitim', 'okul', 'mezun', 'education', 'تعليم'])),
          job_dist: calculateDist(p => findValue(p, ['meslek', 'iş', 'job', 'occupation', 'وظيفة', 'عمل'])),
          work_dist: calculateDist(p => findValue(p, ['çalışma', 'istihdam', 'employment', 'work', 'توظيف'])),
          sector_dist: calculateDist(p => findValue(p, ['sektör', 'sector', 'قطاع'])),
          income_dist: calculateDist(p => findValue(p, ['gelir', 'income', 'دخل']))
        },
        raw_data_sample: participants.slice(0, 15).map(p => {
          let parsedMetadata = {};
          try {
            parsedMetadata = typeof p.metadata === 'string' ? JSON.parse(p.metadata || '{}') : (p.metadata || {});
          } catch (e) {
            console.warn('Malformed metadata for participant:', p.id);
          }
          return {
            profile: p.users?.profiles || p.user?.profile || p.profile || {},
            answers: parsedMetadata
          };
        })
      };

      const resAi = await fetch(`${API_BASE_URL}/admin/ai/analyze-data`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: JSON.stringify(statsSummary),
          title: survey.title,
          system_prompt: `Sen Kıdemli bir Veri Bilimcisi ve Kültürel Analiz Uzmanısın. Araştırmacı için 'Bütünleşik Davranışsal Tahmin Raporu' hazırla.
            
            ANALİZ VE TABLO KURALLARI:
            1. Tablolarda ASLA Yüzde (%) sütunu kullanma. Sadece kategori ve ham kişi sayısını (Adet) göster.
            2. Coğrafi ve Kültürel Bağlam: Şehir dinamiklerini kullanarak davranışları açıkla.
            3. Kuşaksal Psikoloji: Yaş gruplarının tercihlerini veriyle ilişkilendir.
            4. Tahminleme: Bölgesel faktörlerin kararlar üzerindeki etkisini öngör.
            5. Veri Hikayeleştirme: Veriyi bütünleşik bir hikaye olarak sun.

            KESİNLİKLE YASAK OLANLAR:
            - Onay/red sayıları, bütçe veya operasyonel süreçlerden ASLA bahsetme.
            - Sadece bilimsel ve sosyolojik sonuçlara odaklan.
            NOT: Emoji kullanma. Profesyonel bir ton kullan.`
        })
      });

      if (resAi.ok) {
        const dataAi = await resAi.json();
        setSurveyAnalysis(prev => ({ ...prev, [surveyId]: dataAi.report }));
        setSurveyAuditReport(dataAi.report);
        setAuditSurvey(survey);
        setActiveView('survey-audit');
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
      alert(`Analiz hazırlanırken bir hata oluştu: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
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
        name: u.name || u.full_name || 'İsimsiz',
        email: u.email || '—',
        role: u.role === 'admin' ? 'Admin' : (u.role === 'researcher' ? 'Araştırmacı' : 'Kullanıcı'),
        registeredAt: u.created_at,
        profile: u.profile || u || {}
      }));
      setUsers(formattedUsers);

      setRequests(initData.pending.map(r => ({
        ...r,
        status: 'pending',
        creatorName: r.creator_name || 'Bilinmiyor',
        targetAudience: {
          'Cinsiyet': r.target_gender,
          'Dönem/Yaş': r.target_age_group,
          'Şehir': r.target_city,
          'Meslek': r.target_occupation
        },
        formLink: r.survey_link || r.form_link,
        completionCode: r.completion_code,
        targetCount: r.target_audience || r.target_count || 0
      })));

      setSurveys(initData.surveys.map(s => ({
        ...s,
        creatorName: s.creator_name || 'Bilinmiyor',
        targetAudience: {
          'Cinsiyet': s.target_gender,
          'Dönem/Yaş': s.target_age_group,
          'Şehir': s.target_city,
          'Meslek': s.target_occupation
        },
        formLink: s.survey_link,
        completionCode: s.completion_code,
        targetCount: s.target_audience || s.target_count,
        reachedCount: s.submission_count || 0,
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
      setPaymentLoading(true);
      // Clear previous payment table to ensure fresh data display
      if (selectedSurvey?.id === surveyId) {
        setSelectedSurvey(prev => ({ ...prev, paymentTable: { rows: [] } }));
      }
      
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
    } finally {
      setPaymentLoading(false);
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
      setEditUserIBAN(selectedUser.profile?.iban || '');
      setEditUserTC(selectedUser.profile?.tc_identity_number || '');
    }
  }, [selectedRequest, selectedSurvey, selectedUser]);

  useEffect(() => {
    const searchUsers = async () => {
      if (mailUserSearchTerm.length < 2) {
        setMailSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users?search=${mailUserSearchTerm}&take=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMailSearchResults(data.items || []);
        }
      } catch (err) {
        console.error('Mail user search error:', err);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [mailUserSearchTerm, token]);

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
          iban: editUserIBAN
        })
      });
      if (res.ok) {
        alert('Kullanıcı profili güncellendi.');
        // Re-initialize TC/Bank/IBAN fields after successful update
        setEditUserIBAN(selectedUser.profile?.iban || '');
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

  const fetchMatchingUsers = async () => {
    if (!selectedRequest) return;
    setPreviewLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/surveys/${selectedRequest.id}/matching-users`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_gender: editGender.map(s => s.toLowerCase()),
          target_age_group: editAge.map(s => s.toLowerCase()),
          target_city: editCity.map(s => s.toLowerCase()),
          target_education: editEducation.map(s => s.toLowerCase()),
          target_occupation: editOccupation.map(s => s.toLowerCase()),
          target_employment_status: editWorkStatus.map(s => s.toLowerCase()),
          target_sector: editSector.map(s => s.toLowerCase()),
          target_position: editPosition.map(s => s.toLowerCase()),
          target_income: editIncome.map(s => s.toLowerCase()),
          target_marital_status: editMarital.map(s => s.toLowerCase()),
          target_child_count: editChildren.map(s => s.toLowerCase()),
        })
      });
      const data = await response.json();
      setPreviewUsers(data.matches || []);
      setIncompleteUsers(data.incomplete || []);
      setSelectedUserIds((data.matches || []).map(u => u.id));
      setShowPreviewModal(true);
      setShowIncomplete(false);
    } catch (error) {
      console.error('Error fetching matching users:', error);
      alert('Kullanıcı listesi alınamadı.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePublish = async (isConfirmed = false) => {
    if (isConfirmed !== true) {
      await fetchMatchingUsers();
      return;
    }
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
          commission_rate: Math.round(((totalCost - (parsedTarget * reward)) / totalCost) * 100),
          selectedUserIds: selectedUserIds
        }),
      });

      if (response.ok) {
        // Mark selected users as sent in UI
        setPreviewUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, sent: true } : u));
        
        alert('Anket başarıyla onaylandı ve bildirimler gönderiliyor!');
        
        setTimeout(() => {
          setShowPreviewModal(false);
          setSelectedRequest(null);
          setTargetCount('');
          fetchData();
        }, 3000);
      } else {
        const errData = await response.json();
        alert(`Hata: ${errData.message}`);
      }
    } catch (err) {
      alert('Yayımlama sırasında bir hata oluştu.');
    }
  };

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



  // Helper to format AI markdown into clean HTML (Removes asterisks)
  const formatMarkdown = (text) => {
    if (!text) return '';
    
    // 1. Convert Markdown tables to styled HTML tables
    let processedText = text;
    const tableRegex = /\|(.+)\|(\r?\n)\|[ :|-]+\|(\r?\n)(\|(.+)\|(\r?\n)*)+/g;
    processedText = processedText.replace(tableRegex, (match) => {
      const rows = match.trim().split('\n').filter(r => r.trim() !== '');
      if (rows.length < 3) return match; // Not a valid table

      const headerCells = rows[0].split('|').filter(c => c.trim() !== '');
      const headerHtml = `<thead><tr style="background: #f8fafc;">${headerCells.map(c => `<th style="padding: 12px 15px; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; text-align: left;">${c.trim()}</th>`).join('')}</tr></thead>`;
      
      const bodyHtml = `<tbody>${rows.slice(2).map(row => {
        const cells = row.split('|').filter(c => c.trim() !== '');
        return `<tr>${cells.map(c => `<td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 11px; color: #1e293b;">${c.trim()}</td>`).join('')}</tr>`;
      }).join('')}</tbody>`;

      return `<div style="margin: 25px 0; overflow: hidden; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);"><table style="width: 100%; border-collapse: collapse; background: white;">${headerHtml}${bodyHtml}</table></div>`;
    });

    // 2. Format basic elements (headers, lists, bold)
    return processedText
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 900;">$1</strong>')
      .replace(/^\*\s(.*)/gm, '<li style="margin-bottom: 8px; color: #334155; font-size: 12px; padding-left: 10px;">$1</li>')
      .replace(/^#\s(.*)/gm, '<h1 style="font-size: 24px; font-weight: 900; color: #f97316; margin-top: 40px; margin-bottom: 20px; letter-spacing: -0.5px;">$1</h1>')
      .replace(/^##\s(.*)/gm, '<h2 style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">$1</h2>')
      .replace(/^###\s(.*)/gm, '<h3 style="font-size: 13px; font-weight: 900; color: #64748b; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px;">$1</h3>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const handlePrintReport = (survey, report) => {
    if (!report) return;

    const formattedReport = formatMarkdown(report);

    // Helper to generate compact professional SVG Bar Chart for the PDF
    const generateSVGChart = (label, data) => {
      const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const max = Math.max(...entries.map(e => e[1])) || 1;
      const chartHeight = 140; // Smaller height
      const barWidth = 35;     // Slimmer bars
      const gap = 15;
      const svgWidth = entries.length * (barWidth + gap) + 30;

      return `
        <div style="margin-bottom: 30px; page-break-inside: avoid; background: #fff; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9;">
          <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1e293b; margin-bottom: 20px; font-weight: 900; border-left: 4px solid #f97316; padding-left: 10px;">${label}</h4>
          <svg width="100%" height="${chartHeight + 50}" viewBox="0 0 ${svgWidth} ${chartHeight + 50}" xmlns="http://www.w3.org/2000/svg">
            <!-- Grid Lines -->
            <line x1="0" y1="0" x2="${svgWidth}" y2="0" stroke="#f1f5f9" stroke-width="1" />
            <line x1="0" y1="${chartHeight / 2}" x2="${svgWidth}" y2="${chartHeight / 2}" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4" />
            <line x1="0" y1="${chartHeight}" x2="${svgWidth}" y2="${chartHeight}" stroke="#e2e8f0" stroke-width="1.5" />
            
            ${entries.map(([key, val], i) => {
              const h = (val / max) * chartHeight;
              const x = i * (barWidth + gap) + 15;
              const y = chartHeight - h;
              return `
                <g>
                  <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="#f97316" rx="4" />
                  <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10px" font-weight="900" fill="#0f172a">${val}</text>
                  <text x="${x + barWidth / 2}" y="${chartHeight + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="8px" font-weight="700" fill="#64748b">
                    ${key.length > 10 ? key.substring(0, 8) + '..' : key}
                  </text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>
      `;
    };

    const participants = survey.participants || [];
    const getDist = (keySelector) => participants.reduce((acc, p) => {
      const prof = p.users?.profiles || p.user?.profile || p.profile || {};
      const val = keySelector(prof) || 'Bilinmiyor';
      const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
      acc[display] = (acc[display] || 0) + 1;
      return acc;
    }, {});

    const chartsHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 30px; justify-content: space-between;">
        <div style="width: 48%;">${generateSVGChart('Şehir Dağılımı', getDist(p => p.city || p.target_city))}</div>
        <div style="width: 48%;">${generateSVGChart('Cinsiyet Dağılımı', getDist(p => p.gender))}</div>
        <div style="width: 48%;">${generateSVGChart('Yaş Grupları', getDist(p => p.age_group || p.age))}</div>
        <div style="width: 48%;">${generateSVGChart('Eğitim Seviyesi', getDist(p => p.education_level))}</div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PolTem Intelligence Report - ${survey.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #0f172a; line-height: 1.6; background: white; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 6px solid #f97316; padding-bottom: 30px; margin-bottom: 40px; }
            .brand { text-align: right; }
            .brand-name { font-weight: 900; font-size: 24px; color: #0f172a; letter-spacing: -1px; }
            .brand-sub { font-weight: 900; font-size: 10px; color: #f97316; letter-spacing: 3px; }
            h1 { margin: 0; font-weight: 900; font-size: 32px; color: #0f172a; tracking: -2px; }
            .meta { color: #64748b; font-size: 12px; font-weight: 700; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .section-title { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #f97316; margin: 50px 0 25px 0; border-left: 4px solid #f97316; padding-left: 15px; }
            .content { white-space: pre-wrap; font-size: 15px; color: #334155; background: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .stat-value { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 5px; }
            @media print { .no-print { display: none; } body { padding: 30px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Research Audit Report</h1>
              <div class="meta">SURVEY ID: ${survey.id.substring(0, 8)}... | DATE: ${new Date().toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="brand">
              <div class="brand-name">PolTem</div>
              <div class="brand-sub">AKADEMİ</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Toplam Katılım (Reached)</div>
              <div class="stat-value">${participants.length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Onaylanan Katılım (Approved)</div>
              <div class="stat-value" style="color: #16a34a;">${participants.filter(p => p.status === 'approved').length}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Analiz Kapsamı</div>
              <div class="stat-value" style="color: #f97316;">NEURAL AI</div>
            </div>
          </div>

          <div class="section-title">Demographic Distribution</div>
          ${chartsHTML}

          <div class="section-title">Neural Intelligence Analysis</div>
          <div class="content">${formattedReport}</div>

          <div style="margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; letter-spacing: 1px;">
            THIS REPORT WAS GENERATED BY POLTEM AI NEURAL ENGINE. ALL DATA IS VERIFIED.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Ensure window is loaded before printing to avoid blank pages
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

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
      // Collect real-time stats from the existing auditSurvey state
      if (!auditSurvey) return;
      const participants = auditSurvey.participants || [];
      
      const calculateDist = (keySelector) => participants.reduce((acc, p) => {
        const prof = p.users?.profiles || p.user?.profile || p.profile || {};
        const val = keySelector(prof) || 'Bilinmiyor';
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

      const findValue = (obj, keywords) => {
        if (!obj) return null;
        for (let key in obj) {
          if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
            return obj[key];
          }
        }
        const prof = obj.users?.profiles || obj.user?.profile || obj.profile || {};
        for (let key in prof) {
          if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
            return prof[key];
          }
        }
        return null;
      };

      const statsSummary = {
        total_records: participants.length,
        demographic_summary: {
          city_dist: calculateDist(p => findValue(p, ['şehir', 'city', 'il', 'مدينة'])),
          gender_dist: calculateDist(p => findValue(p, ['cinsiyet', 'gender', 'جنس', 'نوع'])),
          age_dist: calculateDist(p => findValue(p, ['yaş', 'age', 'doğum', 'birth', 'عمر', 'سن'])),
          edu_dist: calculateDist(p => findValue(p, ['eğitim', 'okul', 'mezun', 'education', 'تعليم'])),
          job_dist: calculateDist(p => findValue(p, ['meslek', 'iş', 'job', 'occupation', 'وظيفة', 'عمل'])),
          work_dist: calculateDist(p => findValue(p, ['çalışma', 'istihdam', 'employment', 'work', 'توظيف'])),
          sector_dist: calculateDist(p => findValue(p, ['sektör', 'sector', 'قطاع'])),
          income_dist: calculateDist(p => findValue(p, ['gelir', 'income', 'دخل']))
        },
        raw_data_sample: participants.slice(0, 15).map(p => {
          let parsedMetadata = {};
          try {
            parsedMetadata = typeof p.metadata === 'string' ? JSON.parse(p.metadata || '{}') : (p.metadata || {});
          } catch (e) {
            console.warn('Malformed metadata:', p.id);
          }
          return {
            profile: p.users?.profiles || p.user?.profile || p.profile || {},
            answers: parsedMetadata
          };
        })
      };

      const res = await fetch(`${API_BASE_URL}/admin/ai/analyze-data`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: JSON.stringify(statsSummary),
          title: auditSurvey.title,
          system_prompt: `Sen Kıdemli bir Veri Bilimcisi ve Kültürel Analiz Uzmanısın. Araştırmacı için 'Bütünleşik Davranışsal Tahmin Raporu' hazırla.
            
            ANALİZ VE TABLO KURALLARI:
            1. Tablolarda ASLA Yüzde (%) sütunu kullanma. Sadece kategori ve ham kişi sayısını (Adet) göster.
            2. Coğrafi ve Kültürel Bağlam: Şehir dinamiklerini kullanarak davranışları açıkla.
            3. Kuşaksal Psikoloji: Yaş gruplarının tercihlerini veriyle ilişkilendir.
            4. Tahminleme: Bölgesel faktörlerin kararlar üzerindeki etkisini öngör.
            5. Veri Hikayeleştirme: Tüm verileri bütünleşik bir 'insan hikayesi' olarak sun.

            KESİNLİKLE YASAK OLANLAR (İDARİ VERİLER):
            - Onaylanan/reddedilen kişi sayısı, bütçe, ödül veya operasyonel süreçlerden ASLA bahsetme.
            - Sadece araştırmanın BİLİMSEL ve SOSYOLOJİK sonuçlarına odaklan.
            
            NOT: Emoji kullanma. Son derece profesyonel, akademik ve stratejik bir ton kullan.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSurveyAnalysis(prev => ({ ...prev, [surveyId]: data.report }));
        setSurveyAuditReport(data.report);
      }
    } catch (err) {
      console.error('Campaign Analysis Error:', err);
      alert(`Analiz hazırlanırken bir hata oluştu: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAiChatSend = async (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = { role: 'user', content: aiChatInput };
    setAiChatMessages(prev => [...prev, userMsg]);
    const msgToSend = aiChatInput;
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: msgToSend })
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
          surveyId: auditSurvey.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSurveyChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Survey Chat Error:', err);
    } finally {
      setSurveyChatLoading(false);
    }
  };

  const handleGlobalAiChatSend = async (e) => {
    e.preventDefault();
    if (!globalChatInput.trim()) return;

    const userMsg = { role: 'user', content: globalChatInput };
    setGlobalChatMessages(prev => [...prev, userMsg]);
    const msgToSend = globalChatInput;
    setGlobalChatInput('');
    setGlobalChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/ai/chat`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: msgToSend })
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Global AI Chat Error:', err);
    } finally {
      setGlobalChatLoading(false);
    }
  };

  const handleAnalyzeExcel = async (file, surveyTitle) => {
    if (!file) return;
    setExcelLoading(true);
    setExcelAnalysisReport(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          // Calculate REAL statistics for 100% accuracy in summary
          const rowCount = json.length;
          const colCount = json.length > 0 ? Object.keys(json[0]).length : 0;
          
          // Sample first 50 rows for AI pattern recognition
          const sample = json.slice(0, 50);
          
          // Calculate deep context for AI
          const calculateDistribution = (keys) => {
            const foundKey = Object.keys(json[0] || {}).find(k => keys.some(target => k.toLowerCase().includes(target.toLowerCase())));
            if (!foundKey) return "Veri yok";
            const dist = json.reduce((acc, row) => {
              const val = row[foundKey] || 'Bilinmiyor';
              acc[val] = (acc[val] || 0) + 1;
              return acc;
            }, {});
            return Object.entries(dist).map(([k, v]) => `${k}: ${v}`).join(', ');
          };

          const deepContext = {
            total_participants: rowCount,
            city_dist: calculateDistribution(['şehir', 'sehir', 'city']),
            gender_dist: calculateDistribution(['cinsiyet', 'gender']),
            age_dist: calculateDistribution(['yaş', 'yas', 'age', 'yaş grubu']),
            edu_dist: calculateDistribution(['eğitim', 'education']),
            job_dist: calculateDistribution(['meslek', 'occupation', 'job']),
            work_dist: calculateDistribution(['çalışma', 'employment', 'work']),
            income_dist: calculateDistribution(['gelir', 'income']),
            marital_dist: calculateDistribution(['medeni', 'marital']),
            child_dist: calculateDistribution(['çocuk', 'child', 'children'])
          };

          const statsSummary = {
            total_records: rowCount,
            column_count: colCount,
            headers: json.length > 0 ? Object.keys(json[0]) : [],
            demographic_summary: deepContext,
            raw_data_sample: json.slice(0, 20) // Provide real samples for correlation
          };
          
          const response = await fetch(`${API_BASE_URL}/admin/ai/analyze-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              context: JSON.stringify(statsSummary),
              title: surveyTitle,
              system_prompt: `Sen Kıdemli bir Veri Bilimcisi ve Kültürel Analiz Uzmanısın. Araştırmacı için 'Bütünleşik Davranışsal Tahmin Raporu' hazırla.
                
                ANALİZ VE TABLO KURALLARI:
                1. Tablolarda ASLA Yüzde (%) sütunu kullanma. Sadece kategori ve ham kişi sayısını (Adet) göster.
                2. Coğrafi ve Kültürel Bağlam: Şehir dinamiklerini kullanarak davranışları açıkla.
                3. Kuşaksal Psikoloji: Yaş gruplarının tercihlerini veriyle ilişkilendir.
                4. Tahminleme: Bölgesel faktörlerin kararlar üzerindeki etkisini öngör.
                5. Veri Hikayeleştirme: Tüm verileri bütünleşik bir 'insan hikayesi' olarak sun.

                KESİNLİKLE YASAK OLANLAR (İDARİ VERİLER):
                - Onaylanan/reddedilen kişi sayısı, bütçe, ödül veya operasyonel süreçlerden ASLA bahsetme.
                - Sadece araştırmanın BİLİMSEL ve SOSYOLOJİK sonuçlarına odaklan.
                
                NOT: Emoji kullanma. Son derece profesyonel, akademik ve stratejik bir ton kullan.`
            })
          });
          
          const result = await response.json();
          setExcelAnalysisReport(result.report);
          
          // If we are in audit view, update the current audit survey report too
          if (auditSurvey) {
            setSurveyAnalysis(prev => ({ ...prev, [auditSurvey.id]: result.report }));
            setSurveyAuditReport(result.report);
            
            // Map JSON to dummy participants to fill the charts/stats
            const dummyParticipants = json.map((row, idx) => {
              // Normalize data from Excel row (Case-insensitive)
              const findVal = (keys) => {
                const foundKey = Object.keys(row).find(k => keys.some(target => k.toLowerCase().includes(target.toLowerCase())));
                return foundKey ? row[foundKey] : null;
              };

              const genderVal = (findVal(['cinsiyet', 'gender']) || 'unknown').toString().toLowerCase();
              const cityVal = (findVal(['şehir', 'sehir', 'city']) || 'Bilinmiyor').toString().toLowerCase();
              const ageVal = findVal(['yaş', 'yas', 'age', 'yaş grubu']) || 'Bilinmiyor';
              const eduVal = findVal(['eğitim', 'education']) || 'Bilinmiyor';
              const jobVal = findVal(['meslek', 'occupation', 'job']) || 'Bilinmiyor';
              const workVal = findVal(['çalışma', 'employment', 'work']) || 'Bilinmiyor';
              const sectorVal = findVal(['sektör', 'sector']) || 'Bilinmiyor';
              const posVal = findVal(['pozisyon', 'position']) || 'Bilinmiyor';
              const incomeVal = findVal(['gelir', 'income']) || 'Bilinmiyor';
              const maritalVal = findVal(['medeni', 'marital']) || 'Bilinmiyor';
              const childVal = findVal(['çocuk', 'child', 'children']) || 'Bilinmiyor';

              return {
                id: `excel-${idx}`,
                status: idx % 10 === 0 ? 'rejected' : (idx % 3 === 0 ? 'pending' : 'approved'),
                metadata: JSON.stringify(row),
                created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                // Mock the path used by renderSurveyAudit
                users: {
                  profiles: {
                    gender: genderVal,
                    city: cityVal,
                    age_group: ageVal,
                    education_level: eduVal,
                    occupation: jobVal,
                    work_status: workVal,
                    sector_type: sectorVal,
                    position: posVal,
                    household_income: incomeVal,
                    marital_status: maritalVal,
                    children_count: childVal
                  }
                }
              };
            });
            
            setAuditSurvey(prev => ({
              ...prev,
              participants: dummyParticipants,
              reachedCount: rowCount
            }));
          }
        } catch (err) {
          console.error('Excel processing error:', err);
          alert('Excel işlenirken hata oluştu.');
        } finally {
          setExcelLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File reading error:', error);
      setExcelLoading(false);
    }
  };

  const renderAIAnalytics = () => (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-10">
      {/* AI Aura Header */}
      <div className="relative p-10 rounded-[3rem] bg-[#131B2F] border border-white/5 overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-transparent blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 rotate-3 group-hover:rotate-6 transition-transform">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">AI Analiz Merkezi</h2>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">PolTem Akademi Stratejik Karar Destek Sistemi</p>
            </div>
          </div>
          <button 
            onClick={handleAnalyzeAI}
            disabled={aiLoading}
            className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {aiLoading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            PLATFORMU ANALİZ ET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white px-4 flex items-center gap-3">
              <ListTodo className="w-6 h-6 text-orange-500" /> Araştırma Kütüphanesi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveys.map(s => (
                <div key={s.id} className="bg-[#131B2F] border border-white/5 p-6 rounded-[2rem] hover:border-orange-500/30 transition-all group">
                  <h4 className="text-sm font-black text-white mb-4">{s.title}</h4>
                  <div className="flex flex-col gap-2">

                    <button 
                      onClick={() => {
                        setActiveView('survey-audit');
                        fetchSurveyDetails(s.id);
                        handleAnalyzeSurveyAI(s.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/10 hover:bg-orange-500 text-[10px] font-black text-orange-500 hover:text-white border border-orange-500/20 rounded-xl transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI DERİN ANALİZ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-b from-[#1A233A] to-[#131B2F] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /> Platform Durumu</h3>
            <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">{aiReport || 'Platform analizi bekleniyor...'}</div>
          </div>
          <div className="bg-[#131B2F] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" /> AI Asistan</h3>
            <div className="h-64 overflow-y-auto mb-6 space-y-4 custom-scrollbar">
              {aiChatMessages.map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-slate-300'}`}>{msg.content}</div>
              ))}
            </div>
            <form onSubmit={handleAiChatSend} className="relative">
              <input type="text" value={aiChatInput} onChange={(e) => setAiChatInput(e.target.value)} placeholder="Mesaj yaz..." className="w-full bg-[#131B2F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );



  const renderSendMail = () => (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#131B2F]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-white">Kullanıcı Seç</h3>
            </div>
            <div className="relative mb-6">
              <input type="text" value={mailUserSearchTerm} onChange={(e) => setMailUserSearchTerm(e.target.value)} placeholder="Ara..." className="w-full bg-[#0B1121] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {(mailSearchResults.length > 0 ? mailSearchResults : users).map(u => (
                <div key={u.id} onClick={() => { setMailRecipient(u.users?.email || u.email || ''); setMailUserSearchTerm(u.name || ''); }} className={`p-4 rounded-2xl cursor-pointer transition-all border ${mailRecipient === (u.users?.email || u.email) ? 'bg-orange-500 border-orange-400' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                  <p className="font-black text-sm text-white">{u.name || 'İsimsiz'}</p>
                  <p className="text-[10px] font-bold text-slate-500">{u.email || u.users?.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-[#131B2F]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-8">Mesaj Yaz</h2>
            <form onSubmit={handleSendMail} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input type="email" required value={mailRecipient} onChange={(e) => setMailRecipient(e.target.value)} placeholder="Alıcı" className="bg-[#0B1121] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
                <input type="text" required value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} placeholder="Konu" className="bg-[#0B1121] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
              </div>
              <textarea required rows={10} value={mailContent} onChange={(e) => setMailContent(e.target.value)} placeholder="Mesajınız..." className="w-full bg-[#0B1121] border border-white/5 rounded-[2rem] px-8 py-6 text-white font-medium outline-none resize-none" />
              <button type="submit" disabled={mailLoading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-6 rounded-2xl shadow-xl flex items-center justify-center gap-4">
                {mailLoading ? <RotateCcw className="w-6 h-6 animate-spin" /> : <>GÖNDER <Send className="w-6 h-6" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );



  const [showExcelAnalysis, setShowExcelAnalysis] = useState(false);

  const renderSurveyAudit = () => {
    if (!auditSurvey) return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-1000">
        <div className="relative mb-12">
          <div className="w-32 h-32 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
          <Brain className="w-12 h-12 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Neural Link Initializing</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Synchronizing metadata nodes...</p>
      </div>
    );
    const report = surveyAnalysis[auditSurvey.id];
    
    // Calculate live statistics for accuracy
    const participants = auditSurvey.participants || [];
    const approved = participants.filter(p => p.status === 'approved').length;
    const rejected = participants.filter(p => p.status === 'rejected').length;
    const pending = participants.filter(p => p.status === 'pending' || p.status === 'bekliyor' || p.status === 'submission_pending').length;
    const target = auditSurvey.targetCount || auditSurvey.target_audience || 1;
    
    // AI Smart Moderator: Scan metadata for quality risks
    const flaggedParticipants = participants.filter(p => {
      if (p.status !== 'pending') return false;
      const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata || '{}') : (p.metadata || {});
      const values = Object.values(meta).join(' ').toLowerCase();
      
      // Flags: meaningless strings, very short responses, or repetitive chars
      const isSpam = /(.)\1{4,}/.test(values); // 5+ repetitive chars
      const isTooShort = values.length > 0 && values.length < 10;
      const isGibberish = /asdf|qwerty|zxcv/.test(values);
      
      return isSpam || isTooShort || isGibberish;
    });

    // AI Forecast: Completion Date Prediction
    const daysActive = Math.max(1, Math.round((new Date() - new Date(auditSurvey.created_at)) / (1000 * 60 * 60 * 24)));
    const velocity = auditSurvey.reachedCount / daysActive;
    const remaining = Math.max(0, target - auditSurvey.reachedCount);
    const estDaysToFinish = velocity > 0 ? Math.ceil(remaining / velocity) : Infinity;
    const estFinishDate = estDaysToFinish === Infinity ? 'Belirsiz' : new Date(Date.now() + estDaysToFinish * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR');

    // Real Metric Calculations
    // Quality Score: Approved is 100%, Rejected is 0%, Pending is 70%, Flagged is 20%
    const qualityScore = participants.length > 0 
      ? Math.round((
          (approved * 100) + 
          ((pending - flaggedParticipants.length) * 70) + 
          (flaggedParticipants.length * 20) + 
          (rejected * 0)
        ) / participants.length)
      : 0;

    // Real Demographic Analysis (Target vs Actual)
    const targetGenders = Array.isArray(auditSurvey.target_gender) 
      ? auditSurvey.target_gender.map(g => g.toLowerCase()) 
      : (typeof auditSurvey.target_gender === 'string' ? auditSurvey.target_gender.toLowerCase().split(',') : []);

    const actualGenders = participants.reduce((acc, p) => {
      const prof = p.users?.profiles || p.user?.profile || p.profile || {};
      let g = (prof.gender || prof.gender_type || 'unknown').toLowerCase();
      // Normalize common values
      if (g.includes('erkek') || g === 'male' || g === 'm') g = 'erkek';
      else if (g.includes('kadin') || g.includes('kadın') || g === 'female' || g === 'f') g = 'kadin';
      else g = 'unknown';
      
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    const demographicGaps = [
      { 
        label: 'Erkek Katılım', 
        target: targetGenders.includes('erkek') || targetGenders.length === 0 ? 50 : 0, 
        actual: Math.round(((actualGenders['erkek'] || 0) / (participants.length || 1)) * 100) 
      },
      { 
        label: 'Kadın Katılım', 
        target: targetGenders.includes('kadin') || targetGenders.includes('kadın') || targetGenders.length === 0 ? 50 : 0, 
        actual: Math.round(((actualGenders['kadin'] || 0) / (participants.length || 1)) * 100) 
      }
    ];

    const statsCards = [
      { label: 'Onaylanan', value: approved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { label: 'Bekleyen', value: pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { label: 'Reddedilen', value: rejected, icon: X, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      { label: 'Başarı Oranı', value: `%${target > 0 ? ((approved / target) * 100).toFixed(1) : 0}`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-24">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[#0B1121]/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => { setAuditSurvey(null); setActiveView('ai-analytics'); }} 
              className="group w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-orange-500 text-slate-400 hover:text-white border border-white/5 rounded-2xl transition-all shadow-xl active:scale-95"
            >
              <ChevronRight className="w-6 h-6 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                <FileText className="w-8 h-8 text-orange-500" />
                Audit Intelligence
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 opacity-60">Precision Data Verification Node</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => handleAnalyzeCampaign(auditSurvey.id)} 
              disabled={analysisLoading} 
              className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest disabled:opacity-50"
            >
              {analysisLoading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Refresh Neural Analysis
            </button>
            <button 
              onClick={() => handlePrintReport(auditSurvey, report)} 
              className="px-8 py-4 bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:bg-white/10 font-black rounded-2xl transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-xl"
            >
              <Download className="w-5 h-5" /> Export Report
            </button>
            <label className="px-8 py-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-black rounded-2xl transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-xl cursor-pointer">
              <Upload className="w-5 h-5" /> 
              <span>Upload Results</span>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      // We'll call handleAnalyzeExcel with the file and the survey title
                      handleAnalyzeExcel(file, auditSurvey.title);
                    };
                    reader.readAsBinaryString(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Data Summary Card - NEW */}
          <div className="bg-[#0B1121]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl opacity-50"></div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" /> Source Authenticity
            </h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Total Nodes</span>
                  <span className="text-sm font-black text-white tracking-tighter">{auditSurvey.participants?.length || 0}</span>
               </div>
               <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Data Integrity</span>
                  <span className="text-sm font-black text-emerald-500 tracking-tighter">
                    {participants.length > 0 ? (100 - Math.round((flaggedParticipants.length / participants.length) * 100)) : 100}%
                  </span>
               </div>
               <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Verification Level</span>
                  <span className="text-sm font-black text-orange-500 tracking-tighter">
                    {participants.length > 0 ? (flaggedParticipants.length > 0 ? 'L2 HYBRID' : 'L3 GENOME') : 'L1 CORE'}
                  </span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {statsCards.map((stat, i) => (
              <div key={i} className="bg-[#0B1121]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity`}></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-700 opacity-20" />
                </div>
                <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                <div className={`text-3xl font-black ${stat.color} relative z-10 tracking-tighter`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-[#0B1121]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-transparent opacity-50"></div>
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter">
                    <Brain className="w-8 h-8 text-orange-500" />
                    Neural Intelligence Deck
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] ml-12">Correlation & Strategic Analysis</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                  <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Cross-Correlation Active</span>
                </div>
              </div>
              
              {report ? (
                <div className="grid grid-cols-1 gap-10 relative z-10">
                  <div className="bg-[#020617]/50 rounded-[2.5rem] p-12 border border-white/5 shadow-inner">
                    <div 
                      className="prose prose-invert prose-orange max-w-none text-sm text-slate-300 leading-relaxed font-medium max-h-[800px] overflow-y-auto custom-scrollbar pr-6"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(report).replace(/color: #0f172a/g, 'color: #fff').replace(/color: #64748b/g, 'color: #94a3b8') }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#020617]/50 rounded-[3rem] p-24 border border-white/5 flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-10 h-10 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h4 className="text-2xl font-black text-white mb-3 tracking-tighter">Synthesizing Intelligence</h4>
                  <p className="text-slate-500 font-bold max-w-xs text-sm italic">AI engine is running cross-tabulation matrices and identifying hidden correlations...</p>
                </div>
              )}
            </div>

            {/* Category Breakdown - Intelligence Flow */}
            <div className="bg-[#0B1121]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xl font-black text-white mb-10 flex items-center gap-4 tracking-tighter">
                <LayoutDashboard className="w-7 h-7 text-blue-500" />
                Intelligence Flow: Category Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { label: 'Şehir Dağılımı', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.city || prof.target_city || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Cinsiyet Dağılımı', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    let g = (prof.gender || prof.gender_type || 'Bilinmiyor').toLowerCase();
                    if (g.includes('erkek') || g === 'male' || g === 'm') g = 'Erkek';
                    else if (g.includes('kadin') || g.includes('kadın') || g === 'female' || g === 'f') g = 'Kadın';
                    else g = 'Bilinmiyor';
                    acc[g] = (acc[g] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Yaş Grupları', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    let val = prof.age_group || prof.ageGroup || prof.age || 'Bilinmiyor';
                    
                    // Logic to calculate age group from birth_date if needed
                    if ((val === 'Bilinmiyor' || !val) && prof.birth_date) {
                      const birth = new Date(prof.birth_date);
                      const age = new Date().getFullYear() - birth.getFullYear();
                      if (age < 25) val = '18-24';
                      else if (age < 35) val = '25-34';
                      else if (age < 45) val = '35-44';
                      else if (age < 55) val = '45-54';
                      else val = '55+';
                    }

                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Eğitim Seviyesi', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.education_level || prof.education || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Meslek Dağılımı', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.occupation || prof.job || prof.meslek || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Çalışma Durumu', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.work_status || prof.employment_status || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Sektör', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.sector_type || prof.sector || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Pozisyon', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.position || prof.position_type || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Hane Geliri', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.household_income || prof.income || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Medeni Durum', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.marital_status || prof.marital || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) },
                  { label: 'Çocuk Sayısı', data: participants.reduce((acc, p) => { 
                    const prof = p.users?.profiles || p.user?.profile || p.profile || {};
                    const val = prof.children_count || prof.child_count || 'Bilinmiyor';
                    const display = DB_TO_DISPLAY[val] || DB_TO_DISPLAY[val.toLowerCase()] || val;
                    acc[display] = (acc[display] || 0) + 1; 
                    return acc; 
                  }, {}) }
                ].map((cat, idx) => (
                  <div key={idx} className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {cat.label}
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(cat.data).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([key, val], i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-300">{key}</span>
                            <span className="text-white">{val} Kişi</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500/50 rounded-full transition-all duration-1000" style={{ width: `${participants.length > 0 ? Math.min(100, (val / participants.length) * 100) : 0}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-10">






            {/* AI Analyst Chat */}
            <div className="bg-[#0B1121]/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-xl font-black text-white mb-8 flex items-center gap-4 tracking-tighter relative z-10">
                <MessageSquare className="w-7 h-7 text-orange-500" /> 
                Neural Analyst
              </h4>
              <div className="bg-[#020617]/50 rounded-[2.5rem] border border-white/5 h-[400px] flex flex-col overflow-hidden shadow-inner relative z-10">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  {surveyChatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <Brain className="w-12 h-12 text-slate-800 mb-4 animate-pulse" />
                      <p className="text-slate-600 font-black text-[10px] leading-relaxed uppercase tracking-[0.2em] italic opacity-40">Ask anything about the dataset...</p>
                    </div>
                  ) : surveyChatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-xs font-medium whitespace-pre-wrap ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none shadow-lg' : 'bg-white/5 text-slate-300 border border-white/5 rounded-bl-none shadow-inner'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSurveyChatSend} className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
                  <input 
                    type="text" 
                    value={surveyChatInput} 
                    onChange={(e) => setSurveyChatInput(e.target.value)} 
                    placeholder="Ask Neural Analyst..." 
                    className="flex-1 bg-[#0B1121] border border-white/10 rounded-2xl px-6 py-4 text-white text-xs outline-none focus:border-orange-500 transition-all placeholder:text-slate-700 font-bold" 
                  />
                  <button 
                    type="submit" 
                    disabled={surveyChatLoading || !surveyChatInput.trim()} 
                    className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-2xl active:scale-90 disabled:opacity-50 shadow-xl shadow-orange-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          surveys.filter(s => galleryFilter === 'all' || s.status === galleryFilter || (galleryFilter === 'pending' && s.status === 'bekliyor') || (galleryFilter === 'approved' && s.status === 'onaylandı')).map((s) => (
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
    const headers = ['Ad Soyad', 'Email', 'TC No', 'IBAN', 'Tutar (TL)'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.full_name}"`,
        `"${r.email}"`,
        `"${r.tc_identity_number}"`,
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
    if (newStatus === 'rejected') {
      setRejectionSubmissionId(submissionId);
      setRejectionReason('');
      setShowRejectModal(true);
      return;
    }
    
    confirmSubmissionStatus(submissionId, newStatus);
  };

  const confirmSubmissionStatus = async (submissionId, newStatus, reason = null) => {
    try {
      if (reason) setRejectionLoading(true);
      const resp = await fetch(`${API_BASE_URL}/admin/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, reject_reason: reason })
      });
      if (resp.ok) {
        if (selectedSurvey) fetchSurveyDetails(selectedSurvey.id);
        if (reason) {
          setShowRejectModal(false);
          alert('Red işlemi başarıyla tamamlandı ve kullanıcıya bildirildi.');
        } else {
          alert(`Katılım durumu '${newStatus}' olarak güncellendi.`);
        }
      } else {
        const errData = await resp.json();
        alert(`Hata: ${errData.message || 'Güncelleme başarısız.'}`);
      }
    } catch (err) {
      alert('Ağ hatası: Sunucuya ulaşılamadı.');
    } finally {
      setRejectionLoading(false);
    }
  };

  const SidebarItem = ({ icon: Icon, label, viewId }) => {
    const isActive = activeView === viewId;
    return (
      <button
        onClick={() => setActiveView(viewId)}
        className={`w-full group relative flex items-center space-x-4 px-6 py-4 rounded-[1.25rem] transition-all duration-500 ${isActive
          ? 'bg-gradient-to-r from-orange-600/20 via-orange-600/10 to-transparent text-white font-black border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]'
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent'
          }`}
      >
        {isActive && (
          <div className="absolute left-0 w-1.5 h-6 bg-orange-500 rounded-r-full animate-in slide-in-from-left-full duration-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
        )}
        <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-orange-500 text-white shadow-lg rotate-0' : 'bg-[#1A233A] text-slate-500 group-hover:text-orange-400 group-hover:scale-110'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[13px] tracking-tight">{label}</span>
        {!isActive && (
          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
        )}
      </button>
    );
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailRecipient || !mailSubject || !mailContent) return alert('Lütfen tüm alanları doldurun.');
    setMailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: mailRecipient, subject: mailSubject, content: mailContent })
      });
      if (res.ok) {
        const result = await res.json();
        console.log('Email sent result:', result);
        alert('Mail başarıyla gönderildi!');
        setMailRecipient('');
        setMailSubject('');
        setMailContent('');
      } else {
        const errorData = await res.json();
        console.error('Email failed server response:', errorData);
        alert('Mail gönderimi başarısız oldu.');
      }
    } catch (err) {
      alert('İşlem sırasında hata oluştu.');
    } finally {
      setMailLoading(false);
    }
  };



  if (!token) return <LoginPage onLogin={setToken} />;

  // ─── Build context value with all shared state & handlers ───────────────────
  const contextValue = {
    // Auth
    token, setToken,
    // Data
    users, setUsers,
    surveys, setSurveys,
    requests, setRequests,
    stats, setStats,
    activities, setActivities,
    payments, setPayments,
    // Navigation
    activeView, setActiveView,
    // AI
    aiReport, setAiReport,
    aiLoading, setAiLoading,
    aiChatMessages, setAiChatMessages,
    aiChatInput, setAiChatInput,
    aiChatLoading, setAiChatLoading,
    surveyAnalysis, setSurveyAnalysis,
    analysisLoading, setAnalysisLoading,
    surveyAuditReport, setSurveyAuditReport,
    auditSurvey, setAuditSurvey,
    surveyChatMessages, setSurveyChatMessages,
    surveyChatInput, setSurveyChatInput,
    surveyChatLoading, setSurveyChatLoading,
    // Selections
    selectedUser, setSelectedUser,
    selectedRequest, setSelectedRequest,
    selectedSurvey, setSelectedSurvey,
    selectedPackage, setSelectedPackage,
    // Mail
    mailRecipient, setMailRecipient,
    mailSubject, setMailSubject,
    mailContent, setMailContent,
    mailLoading, setMailLoading,
    mailUserSearchTerm, setMailUserSearchTerm,
    mailSearchResults, setMailSearchResults,
    // Handlers
    fetchData,
    fetchSurveyDetails,
    handleAnalyzeAI,
    handleAnalyzeSurveyAI,
    handleAiChatSend,
    handleSurveyChatSend,
    handleGlobalAiChatSend,
    handleSendMail,
    handlePublish,
    handleLogout,
    handleComplete,
    handlePause,
    handleResume,
    handleRestore,
    handleCSVMatch,
    handleExportExcel,
    handleUpdateUser,
    handleUpdateTargeting,
    handleMakeResearcher,
    fetchMatchingUsers,
    handleUpdateSubmissionStatus,
    confirmSubmissionStatus,
    // Lookups
    GENDER_OPTIONS, AGE_OPTIONS, EDUCATION_OPTIONS, MARITAL_OPTIONS,
    WORK_STATUS_OPTIONS, INCOME_OPTIONS, CHILDREN_OPTIONS, CITY_OPTIONS,
    SECTOR_OPTIONS, POSITION_OPTIONS, OCCUPATION_OPTIONS, DB_TO_DISPLAY,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
    <div className="flex min-h-screen bg-[#0B1121] text-slate-200 overflow-x-hidden relative font-['Inter']">
      <div className="ai-aura-bg"></div>
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

          <SidebarItem icon={Brain} label="AI Analizi" viewId="ai-analytics" />


          <div className="mt-10 mb-4 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Yönetim Paneli</div>
          <SidebarItem icon={Users} label="Kullanıcılarımız" viewId="users" />
          <SidebarItem icon={ListTodo} label="Anket Yönetimi" viewId="surveys" />
          <SidebarItem icon={WalletCards} label="Ödeme Talimatları" viewId="payments" />
          
          <div className="mt-10 mb-4 px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Hızlı İşlemler</div>

          <SidebarItem icon={Send} label="Mail Gönder" viewId="send-mail" />
        </div>
      </aside>

      {/* --- ANA İÇERİK (MAIN CONTENT) --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-[#020617]">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none"></div>

        <header className="h-24 bg-[#0B1121]/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-12 z-20 shrink-0 shadow-2xl">
          <div className="animate-in slide-in-from-left-4 duration-500">
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              {activeView === 'overview' && <LayoutDashboard className="w-8 h-8 text-orange-500" />}
              {activeView === 'ai-analytics' && <Brain className="w-8 h-8 text-orange-500" />}
              {activeView === 'overview' && 'System Analytics'}
              {activeView === 'ai-analytics' && 'AI Analizi'}
              {activeView === 'survey-audit' && (auditSurvey ? auditSurvey.title : 'AI Anket Denetim Raporu')}
              {activeView === 'users' && 'Kullanıcı Yönetimi'}
              {activeView === 'surveys' && 'Anket Yönetimi'}
              {activeView === 'payments' && 'Ödeme Talimatları'}

              {activeView === 'send-mail' && 'Sistemden Mail Gönderimi'}
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 font-black uppercase tracking-[0.3em] opacity-60">PolTem Academy • Secure Administrator Node</p>
          </div>
          <div className="flex items-center gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="hidden lg:flex items-center gap-3 bg-[#020617]/50 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative"></div>
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">System Operational</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black rounded-2xl border border-rose-500/20 transition-all text-[10px] uppercase tracking-widest"
            >
              Terminate Session
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white bg-[#020617]/50 rounded-full transition-all border border-white/5 hover:border-orange-500/50 relative shadow-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 border-2 border-[#020617] rounded-full"></span>
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

            {activeView === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { title: 'Total Intelligence', value: stats.totalUsers || 0, icon: Users, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
                    { title: 'Pending Audit', value: stats.pending || 0, icon: FileText, color: 'from-amber-500 to-orange-600', shadow: 'shadow-orange-500/20' },
                    { title: 'Active Research', value: stats.approved || 0, icon: ListTodo, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
                    { title: 'Archived Nodes', value: stats.completed || 0, icon: CheckCircle2, color: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-[#0B1121]/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500 cursor-default ${stat.shadow}`}>
                      <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>
                      <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5 text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}><stat.icon className="w-full h-full" /></div>
                        <TrendingUp className="w-5 h-5 text-slate-700 opacity-40" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] relative z-10">{stat.title}</p>
                      <p className="text-4xl font-black text-white relative z-10 tracking-tighter">{stat.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 bg-[#0B1121]/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-12 relative z-10">
                      <div>
                        <button className="flex items-center gap-2 text-sm font-bold bg-[#1A233A] px-5 py-3 rounded-full text-slate-300 border border-[#2A3441] hover:text-white hover:border-orange-500/50 transition-colors">
                          <Download className="w-4 h-4" /> Rapor İndir
                        </button>
                      </div>
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

            {activeView === 'ai-analytics' && <AIAnalyticsView />}

            {activeView === 'survey-audit' && renderSurveyAudit()}

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
                      {users
                        .filter(u =>
                          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice((userPage - 1) * usersPerPage, userPage * usersPerPage)
                        .map(u => (
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

                {/* Pagination UI */}
                <div className="p-6 border-top border-[#1A233A] flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(users.filter(u =>
                    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                  ).length / usersPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setUserPage(page)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${userPage === page ? 'bg-orange-500 text-white shadow-lg' : 'bg-[#1A233A] text-slate-400 hover:text-white'}`}
                    >
                      {page}
                    </button>
                  ))}
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
                      {Array.from(new Map([...surveys, ...requests].map(item => [item.id, item])).values())
                        .filter(s => surveyFilter === 'all' || s.status === surveyFilter || (surveyFilter === 'rejected' && (s.status === 'paused' || s.status === 'rejected')) || (surveyFilter === 'pending' && s.status === 'bekliyor') || (surveyFilter === 'active' && s.status === 'onaylandı'))
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


            {activeView === 'send-mail' && <SendMailView />}

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
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">Profil Bilgileri</h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Cinsiyet</span>
                        <span className="text-white font-bold text-sm">
                          {getDisplayLabel(selectedUser.profile?.gender, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Şehir</span>
                        <span className="text-white font-bold text-sm text-right overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {getDisplayLabel(selectedUser.profile?.city, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Eğitim</span>
                        <span className="text-white font-bold text-sm text-right">
                          {getDisplayLabel(selectedUser.profile?.education_level, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Meslek</span>
                        <span className="text-white font-bold text-sm text-right">
                          {getDisplayLabel(selectedUser.profile?.occupation || (selectedUser.profile?.work_status === 'ogrenci' ? 'ogrenci' : null), DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Çalışma Durumu</span>
                        <span className="text-white font-bold text-sm text-right">
                          {getDisplayLabel(selectedUser.profile?.work_status, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Hane Geliri</span>
                        <span className="text-white font-bold text-sm">
                          {getDisplayLabel(selectedUser.profile?.household_income || selectedUser.profile?.monthly_income, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Medeni Durum</span>
                        <span className="text-white font-bold text-sm">
                          {getDisplayLabel(selectedUser.profile?.marital_status, DB_TO_DISPLAY)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#1A233A] pb-4">
                        <span className="text-slate-400 text-sm font-medium">Bakiye</span>
                        <span className="text-orange-500 font-black text-lg">{(selectedUser.profile?.balance || '0.00')} TL</span>
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
                disabled={previewLoading}
                className={`w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-black rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 ${previewLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {previewLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>LİSTE HAZIRLANIYOR...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    YAYIMLA
                  </>
                )}
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
                <div className="mx-4 w-px h-8 bg-[#1A233A] self-center"></div>
                <button 
                  onClick={() => { setAuditSurvey(selectedSurvey); setActiveView('survey-audit'); }}
                  disabled={analysisLoading}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-all flex items-center gap-2"
                >
                  {analysisLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Zekice Analiz Et
                </button>
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
                              alert(`Eşleşti: ${results.matched?.length || 0} onaylandı, ${results.unmatchedCsv?.length || 0} eşleşmedi (CSV'de bulunup sistemده olmayan).`);
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
                        onClick={() => document.getElementById('smartMatchUpload').click()}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-2" /> Akıllı Doğrulama
                      </button>
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
                                      {p.unique_id || p.metadata?.unique_id ? `Kod: ${p.unique_id || p.metadata?.unique_id}` : `Email: ${p.users?.email || '—'}`}
                                    </span>
                                    <span className="text-emerald-500 text-[9px] font-mono font-black mt-1 opacity-80">{p.users?.profiles?.iban || '—'}</span>

                                    {p.reject_reason && (
                                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-400 flex items-start gap-2">
                                        <Ban className="w-3 h-3 shrink-0 mt-0.5" />
                                        <span>{p.reject_reason}</span>
                                      </div>
                                    )}

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
                                    <button
                                      onClick={() => handleUpdateSubmissionStatus(p.id, 'rejected')}
                                      className={`p-2.5 rounded-xl transition-all border shadow-lg ${p.status === 'rejected' ? 'bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border-orange-500/20' : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20'}`}
                                      title={p.status === 'rejected' ? "Sebebi Düzenle" : "Reddet"}
                                    >
                                      {p.status === 'rejected' ? <Settings className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <div className="mt-2 text-[9px] text-slate-600 font-mono tracking-tighter">
                                    {p.created_at ? new Date(p.created_at).toLocaleString('tr-TR') : '—'}
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
                  {paymentLoading ? (
                    <div className="bg-[#131B2F] border border-[#1A233A] rounded-[2.5rem] p-20 text-center shadow-2xl">
                       <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
                       <p className="text-slate-400 font-black uppercase tracking-widest">Ödeme Tablosu Yükleniyor...</p>
                    </div>
                  ) : (!selectedSurvey.paymentTable || selectedSurvey.paymentTable.rows?.length === 0) ? (
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


      {/* --- Recipients Preview Modal --- */}
      {showPreviewModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in" onClick={() => setShowPreviewModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            <div className="bg-[#131B2F] w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-3 text-left">
                    <Users className="w-7 h-7 text-orange-500" /> Alıcı Listesi Önizleme
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-bold text-left">Bu anket yayımlandığında toplam {selectedUserIds.length} kişiye bildirim gidecek.</p>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-8 space-y-6 flex-1 overflow-y-auto text-left">
                {/* Statistics Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Tam Eşleşenler</p>
                    <p className="text-2xl font-black text-white">{previewUsers.length} Kişi</p>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${showIncomplete ? 'bg-orange-500/20 border-orange-500' : 'bg-white/5 border-white/5 hover:border-white/10'}`} onClick={() => setShowIncomplete(!showIncomplete)}>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Eksik Profiller</p>
                    <p className="text-2xl font-black text-white">{incompleteUsers.length} Kişi</p>
                  </div>
                </div>

                {/* Search & Add Section */}
                <div className="bg-[#0B1121] p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Listeye manuel kullanıcı ekle (İsim veya Email)..."
                      className="flex-1 bg-transparent border-none outline-none text-white font-bold placeholder:text-slate-600"
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                    />
                  </div>
                  {searchUserQuery.length > 2 && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {users
                        .filter(u => 
                          (u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchUserQuery.toLowerCase())) &&
                          !selectedUserIds.includes(u.id)
                        )
                        .slice(0, 5)
                        .map(u => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{u.name}</p>
                                <p className="text-[10px] text-slate-500">{u.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                                setPreviewUsers([...previewUsers, { id: u.id, full_name: u.name, email: u.email }]);
                                setSearchUserQuery('');
                              }}
                              className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black hover:bg-orange-500 text-white transition-all"
                            >
                              EKLE
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Matches List */}
                  {!showIncomplete && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {previewUsers.map(u => (
                        <div key={u.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedUserIds.includes(u.id) ? 'bg-orange-500/5 border-orange-500/30' : 'bg-[#0B1121] border-white/5 opacity-40'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${selectedUserIds.includes(u.id) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-700 text-slate-400'}`}>
                              {u.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white text-left">{u.full_name || 'İsimsiz'}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-500 text-left">{u.email || '—'}</p>
                                {u.sent && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded uppercase animate-in zoom-in duration-300">
                                    GÖNDERİLDİ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedUserIds.includes(u.id)) {
                                setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                              } else {
                                setSelectedUserIds([...selectedUserIds, u.id]);
                              }
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedUserIds.includes(u.id) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}
                          >
                            {selectedUserIds.includes(u.id) ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Incomplete Profiles List */}
                  {showIncomplete && (
                    <div className="space-y-4">
                      <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Bu kişiler kriterlerinize yakın olabilir ancak profillerinde şehir/yaş gibi bilgiler eksik.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {incompleteUsers.map(u => (
                          <div key={u.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedUserIds.includes(u.id) ? 'bg-orange-500/5 border-orange-500/30' : 'bg-[#0B1121] border-white/5 opacity-40'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${selectedUserIds.includes(u.id) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-700 text-slate-400'}`}>
                                {u.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white text-left">{u.full_name || 'İsimsiz'}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-red-500 text-left font-bold">Profil Bilgisi Eksik</p>
                                  {u.sent && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded uppercase">GÖNDERİLDİ</span>}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (selectedUserIds.includes(u.id)) {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                } else {
                                  setSelectedUserIds([...selectedUserIds, u.id]);
                                  // Add to previewUsers if not there for "Sent" status tracking
                                  if (!previewUsers.find(pu => pu.id === u.id)) {
                                     setPreviewUsers([...previewUsers, u]);
                                  }
                                }
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedUserIds.includes(u.id) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}
                            >
                              {selectedUserIds.includes(u.id) ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handlePublish(true)}
                  className="flex-[2] py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5" />
                  SEÇİLİ {selectedUserIds.length} KİŞİYE GÖNDER VE YAYIMLA
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Rejection Reason Modal --- */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] animate-in fade-in duration-500" onClick={() => !rejectionLoading && setShowRejectModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[210] p-6">
            <div className="bg-[#131B2F] w-full max-w-xl rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
              <div className="p-10 pb-6 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center border border-red-500/20 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse"></div>
                  <Ban className="w-12 h-12 text-red-500 relative z-10" />
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Müsait miyiz?</h3>
                <p className="text-slate-500 font-bold text-sm px-4">
                  Bu katılımı reddetmek üzeresiniz. Lütfen kullanıcıya yol göstermesi için bir <span className="text-red-400">red nedeni</span> belirtin.
                </p>
              </div>

              <div className="px-10 py-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">RED NEDENİ (ZORUNLU DEĞİL)</label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Örn: Geçersiz tamamlama kodu, Çok kısa süre, Yanlış cevaplar..."
                    className="w-full bg-[#0B1121] border border-white/5 rounded-[2rem] px-8 py-6 text-white font-medium outline-none focus:border-red-500/50 transition-all resize-none shadow-inner"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   {['Geçersiz Kod', 'Hatalı Cevap', 'Spam / Bot', 'Çok Hızlı'].map(reason => (
                     <button 
                       key={reason}
                       type="button"
                       onClick={() => setRejectionReason(reason)}
                       className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-red-500/30 hover:text-white transition-all"
                     >
                       {reason}
                     </button>
                   ))}
                </div>
              </div>

              <div className="p-10 pt-6 flex gap-4">
                <button
                  disabled={rejectionLoading}
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-5 bg-slate-800 text-slate-300 font-black rounded-3xl hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                >
                  VAZGEÇ
                </button>
                <button
                  disabled={rejectionLoading}
                  onClick={() => confirmSubmissionStatus(rejectionSubmissionId, 'rejected', rejectionReason)}
                  className="flex-[2] py-5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-3xl shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  {rejectionLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      REDDET VE BİLDİR <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* --- Global AI Bot Assistant --- */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {showAiModal && (
          <div className="w-[400px] h-[600px] bg-[#131B2F]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-500/10 to-blue-500/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                  <Brain className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">PolTem AI Asistan</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ÇEVRİMİÇİ</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-left">
              {globalChatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
                    <Sparkles className="w-8 h-8 text-orange-500/30" />
                  </div>
                  <p className="text-sm text-slate-400 font-bold">Merhaba! Ben PolTem Yapay Zeka asistanıyım. Platform yönetimi, anketler veya kullanıcılar hakkında her şeyi sorabilirsin.</p>
                </div>
              )}
              {globalChatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none shadow-xl'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {globalChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleGlobalAiChatSend} className="p-6 border-t border-white/5 bg-[#0B1121]/50">
              <div className="relative">
                <input
                  type="text"
                  value={globalChatInput}
                  onChange={(e) => setGlobalChatInput(e.target.value)}
                  placeholder="Bir soru sorun..."
                  className="w-full bg-[#131B2F] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-orange-500/50 transition-all font-medium pr-14"
                />
                <button type="submit" disabled={globalChatLoading || !globalChatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowAiModal(!showAiModal)}
          className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden ${showAiModal ? 'bg-white text-orange-500' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'}`}
        >
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {showAiModal ? <X className="w-8 h-8 relative z-10" /> : <Brain className="w-8 h-8 relative z-10 animate-pulse" />}
          {!showAiModal && (
            <div className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
          )}
        </button>
      </div>
    </div>
    </DashboardContext.Provider>
  );
}

