import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  X,
  Bell,
  Menu,
  ChevronRight,
  User,
  Calendar,
  Clock,
  Coins,
  Link as LinkIcon,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  History,
  Download,
  ShieldCheck,
  ArrowUpRight,
  LogOut,
  Eye,
  EyeOff,
  Globe,
  Key,
  Upload,
  CheckSquare
} from 'lucide-react';

const API_BASE_URL = 'https://powers-influenced-mpegs-productive.trycloudflare.com';

const RECENT_ACTIVITIES = [
  { id: 1, type: 'approve', user: 'Admin', target: 'Araştırma Onaylandı', time: '2 saat önce' },
  { id: 2, type: 'reject', user: 'Admin', target: 'Araştırma Reddedildi', time: '5 saat önce' },
  { id: 3, type: 'new_user', user: 'Yeni Kullanıcı', target: 'Kayıt Oldu', time: '12 saat önce' },
];

const STATUS_CONFIG = {
  draft: {
    label: 'İnceleme Aşamasında',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    dot: 'bg-orange-500',
    icon: AlertCircle,
  },
  active: {
    label: 'Onaylandı',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  paused: {
    label: 'Reddedildi',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  completed: {
    label: 'Tamamlandı',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    dot: 'bg-purple-500',
    icon: CheckSquare,
  },
};

/* ================================================================
   صفحة تسجيل الدخول - Premium Login
   ================================================================ */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token);
      } else {
        setError('Token alınamadı.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Sunucuya bağlanılamadı. Backend çalıştığından emin olun (port 3005).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-950 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            PolTem<span className="text-orange-500 italic">.</span>
          </h1>
          <p className="text-slate-500 font-bold mt-3 text-xs uppercase tracking-[4px]">
            Yönetici Kontrol Paneli
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur-xl rounded-[32px] border border-slate-800/50 p-10 shadow-2xl space-y-6"
        >
          {/* Welcome text */}
          <div className="text-center mb-2">
            <h2 className="text-xl font-black text-white">Hoş Geldiniz 👋</h2>
            <p className="text-sm text-slate-500 mt-1">Devam etmek için giriş yapın</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block">
              E-posta Adresi
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@poltem.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-slate-700 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block">
              Şifre
            </label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder:text-slate-700 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-orange-500/50 disabled:to-orange-600/50 text-white font-black rounded-2xl shadow-2xl shadow-orange-500/20 transition-all transform active:scale-[0.98] text-sm tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Giriş yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800/50">
            <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
              PolTem Araştırma Platformu • 2024
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}


function UsersPage({ token }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (roleFilter) params.set('role', roleFilter);
      params.set('take', '100');
      const res = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        if (userDetails && userDetails.id === userId) setUserDetails({ ...userDetails, role: newRole });
      }
    } catch (err) {
      console.error('Error assigning role:', err);
    }
  };

  const handleResearcherToggle = async (userId, currentVal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/research-permission`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_researcher: !currentVal }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_researcher: !currentVal } : u)));
        if (userDetails && userDetails.id === userId) setUserDetails({ ...userDetails, is_researcher: !currentVal });
      }
    } catch (err) {
      console.error('Error toggling researcher:', err);
    }
  };

  useEffect(() => { fetchUsers(); }, [searchQuery, roleFilter]);

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = { ADMIN: 0, researcher: 0, user: 0 };
    users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [users]);

  const ROLE_COLORS = {
    ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
    researcher: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    user: 'bg-slate-700/30 text-slate-400 border-slate-700',
  };

  const ROLE_CARD_STYLES = {
    ADMIN: { gradient: 'from-red-500 to-rose-600', icon: ShieldCheck, bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-500', label: 'Yöneticiler' },
    researcher: { gradient: 'from-blue-500 to-indigo-600', icon: FileText, bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-500', label: 'Araştırmacılar' },
    user: { gradient: 'from-slate-500 to-slate-600', icon: User, bg: 'bg-slate-500/5', border: 'border-slate-600/20', text: 'text-slate-400', label: 'Kullanıcılar' },
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesRole;
    });
  }, [users, roleFilter]);

  return (
    <div className="space-y-6">
      {/* ─── Role Stats Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROLE_CARD_STYLES).map(([role, style]) => {
          const RoleIcon = style.icon;
          const count = roleCounts[role] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const isActive = roleFilter === role;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
              className={`bg-slate-900 rounded-3xl border p-6 transition-all text-left group hover:shadow-lg ${
                isActive ? `${style.border} shadow-lg ring-1 ring-offset-0 ring-offset-slate-950` : 'border-slate-800 hover:border-slate-700'
              }`}
              style={isActive ? { boxShadow: `0 0 30px rgba(0,0,0,0.3)` } : {}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${style.bg} ${style.text} transition-transform group-hover:scale-110`}>
                  <RoleIcon className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${ROLE_COLORS[role]}`}>
                  %{percentage}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500">{style.label}</p>
              <p className="text-3xl font-black text-white mt-1">{count}</p>
              {isActive && (
                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${style.gradient}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Search & Filter Header ─── */}
      <div className="bg-slate-900 rounded-[32px] border border-slate-800 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-orange-500 text-white text-xs font-black rounded-full shadow-lg shadow-orange-500/20">
              {filteredUsers.length}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Kullanıcı Yönetimi</h2>
              <p className="text-sm text-slate-500 font-bold mt-1">
                {roleFilter 
                  ? `${ROLE_CARD_STYLES[roleFilter]?.label || roleFilter} gösteriliyor` 
                  : `Toplam ${total} kayıtlı kullanıcı`}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="İsim, E-posta veya Telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none w-64 transition-all"
              />
            </div>
            {roleFilter && (
              <button
                onClick={() => setRoleFilter('')}
                className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-400 hover:text-white hover:border-orange-500/30 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Filtreyi Temizle
              </button>
            )}
          </div>
        </div>

        {/* ─── Role Tabs ─── */}
        <div className="flex space-x-2 overflow-x-auto pt-2">
          {[
            { id: '', label: 'Tümü', count: total },
            { id: 'ADMIN', label: 'Yöneticiler', count: roleCounts.ADMIN },
            { id: 'researcher', label: 'Araştırmacılar', count: roleCounts.researcher },
            { id: 'user', label: 'Kullanıcılar', count: roleCounts.user },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                roleFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── User Cards Grid ─── */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Yükleniyor...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900 rounded-[32px] border border-slate-800 py-20 text-center">
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg">Kullanıcı bulunamadı.</p>
          <p className="text-slate-600 text-sm mt-1">Arama kriterlerinizi değiştirin veya filtreyi temizleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.user;
            const roleStyle = ROLE_CARD_STYLES[u.role] || ROLE_CARD_STYLES.user;
            return (
              <div
                key={u.id}
                onClick={() => { setSelectedUser(u); fetchUserDetails(u.id); }}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 hover:border-orange-500/30 hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${roleStyle.gradient} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                    {(u.full_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                      {u.full_name || 'İsimsiz Kullanıcı'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{u.email || u.phone || '—'}</p>
                    {u.phone && u.email && (
                      <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">{u.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${rc}`}>
                        {u.role === 'ADMIN' ? 'Yönetici' : u.role === 'researcher' ? 'Araştırmacı' : 'Kullanıcı'}
                      </span>
                      {u.is_researcher && u.role !== 'researcher' && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider bg-green-500/10 text-green-500 border-green-500/20">
                          Araştırmacı
                        </span>
                      )}
                      {u.is_active === false && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider bg-red-500/10 text-red-500 border-red-500/20">
                          Pasif
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── User Detail Slide-Over ─── */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" style={{ zIndex: 60 }} onClick={() => { setSelectedUser(null); setUserDetails(null); }} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-l border-slate-800 flex flex-col" style={{ zIndex: 70 }}>
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${(ROLE_CARD_STYLES[selectedUser.role] || ROLE_CARD_STYLES.user).gradient} flex items-center justify-center text-white font-black text-2xl shadow-2xl`}>
                  {(selectedUser.full_name || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{selectedUser.full_name || 'İsimsiz'}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedUser.email || selectedUser.phone || '—'}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold">Yükleniyor...</p>
                </div>
              ) : userDetails ? (
                <>
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Durum</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${userDetails.is_active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {userDetails.is_active !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kayıt Tarihi</p>
                      <p className="text-sm font-bold text-white">{new Date(userDetails.created_at || Date.now()).toLocaleDateString('tr-TR')}</p>
                    </div>
                    {userDetails.email && (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 col-span-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-posta</p>
                        <p className="text-sm font-bold text-white">{userDetails.email}</p>
                      </div>
                    )}
                    {userDetails.phone && (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefon</p>
                        <p className="text-sm font-bold text-white">{userDetails.phone}</p>
                      </div>
                    )}
                    {userDetails.gender && (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cinsiyet</p>
                        <p className="text-sm font-bold text-white">{userDetails.gender}</p>
                      </div>
                    )}
                    {userDetails.city && (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Şehir</p>
                        <p className="text-sm font-bold text-white">{userDetails.city}</p>
                      </div>
                    )}
                    {userDetails.age && (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Yaş</p>
                        <p className="text-sm font-bold text-white">{userDetails.age}</p>
                      </div>
                    )}
                  </div>

                  {/* Role Management */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-orange-500" /> Rol Yönetimi
                    </h4>
                    <div className="flex gap-3">
                      {[
                        { role: 'user', label: 'Kullanıcı' },
                        { role: 'researcher', label: 'Araştırmacı' },
                        { role: 'ADMIN', label: 'Yönetici' },
                      ].map(({ role, label }) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(userDetails.id, role)}
                          className={`flex-1 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${userDetails.role === role
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Researcher Toggle */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-500" /> Araştırma İzni
                    </h4>
                    <button
                      onClick={() => handleResearcherToggle(userDetails.id, userDetails.is_researcher)}
                      className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${userDetails.is_researcher
                          ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                    >
                      {userDetails.is_researcher ? '✓ Araştırma İzni Var — Kaldırmak İçin Tıkla' : '✕ Araştırma İzni Yok — Vermek İçin Tıkla'}
                    </button>
                  </div>

                  {/* User's Surveys */}
                  {userDetails.surveys && userDetails.surveys.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <ClipboardList className="w-5 h-5 text-orange-500" /> Araştırmaları ({userDetails.surveys.length})
                      </h4>
                      <div className="space-y-3">
                        {userDetails.surveys.map((s) => {
                          const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.draft;
                          return (
                            <div key={s.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                              <p className="font-bold text-white text-sm">{s.title}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold">{s.reward_amount || '—'} TL</span>
                                <span className="text-[10px] text-slate-600 font-bold">• {s.estimated_time || '—'} Dk</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================
   صفحة سجل الأمان
   ================================================================ */
function LogsPage() {
  const logs = [
    { id: 1, action: 'Giriş Yapıldı', user: 'admin@poltem.com', ip: '192.168.1.1', time: new Date().toLocaleString('tr-TR'), type: 'login' },
    { id: 2, action: 'Araştırma Onaylandı', user: 'admin@poltem.com', target: 'Tüketici Davranışları Anketi', time: new Date(Date.now() - 3600000).toLocaleString('tr-TR'), type: 'approve' },
    { id: 3, action: 'Rol Değiştirildi', user: 'admin@poltem.com', target: 'user → researcher', time: new Date(Date.now() - 7200000).toLocaleString('tr-TR'), type: 'role' },
    { id: 4, action: 'Araştırma Reddedildi', user: 'admin@poltem.com', target: 'Çalışan Memnuniyeti Anketi', time: new Date(Date.now() - 86400000).toLocaleString('tr-TR'), type: 'reject' },
    { id: 5, action: 'Yeni Kullanıcı Kaydı', user: 'system', target: 'ahmet@example.com', time: new Date(Date.now() - 172800000).toLocaleString('tr-TR'), type: 'new_user' },
  ];

  const LOG_ICONS = {
    login: { icon: User, color: 'text-blue-500 bg-blue-500/5' },
    approve: { icon: CheckCircle2, color: 'text-green-500 bg-green-500/5' },
    reject: { icon: XCircle, color: 'text-red-500 bg-red-500/5' },
    role: { icon: ShieldCheck, color: 'text-orange-500 bg-orange-500/5' },
    new_user: { icon: Users, color: 'text-purple-500 bg-purple-500/5' },
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500"><CheckCircle2 className="w-6 h-6" /></div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Çevrimiçi</span>
          </div>
          <p className="text-sm font-bold text-slate-500">API Sunucusu</p>
          <p className="text-xl font-black text-white mt-1">Aktif ✓</p>
        </div>
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500"><CheckCircle2 className="w-6 h-6" /></div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Bağlı</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Veritabanı</p>
          <p className="text-xl font-black text-white mt-1">PostgreSQL</p>
        </div>
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500"><ShieldCheck className="w-6 h-6" /></div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Aktif</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Supabase Auth</p>
          <p className="text-xl font-black text-white mt-1">JWT + ECC</p>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <History className="w-6 h-6 text-orange-500" /> İşlem Geçmişi
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-1">Son yönetici işlemleri</p>
        </div>
        <div className="divide-y divide-slate-800/30">
          {logs.map((log) => {
            const logStyle = LOG_ICONS[log.type] || LOG_ICONS.login;
            const LogIcon = logStyle.icon;
            return (
              <div key={log.id} className="px-8 py-6 flex items-center gap-6 hover:bg-slate-800/20 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-orange-500/30 transition-colors ${logStyle.color}`}>
                  <LogIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{log.action}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{log.user}</span>
                    {log.target && (
                      <>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] text-slate-600 truncate">{log.target}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-500">{log.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   لوحة التحكم الرئيسية
   ================================================================ */
export default function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [editReward, setEditReward] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvMatchResult, setCsvMatchResult] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, totalUsers: 0, totalResearchers: 0,
    chartData: { platforms: [], statuses: [] }
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setFetchError('');
      const [resAll, resStats] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/surveys/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/surveys/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resAll.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        return;
      }
      if (resAll.status === 403) {
        let errorMsg = 'Bilinmeyen Hata';
        try { const errData = await resAll.json(); errorMsg = errData.message || JSON.stringify(errData); } catch (e) { }
        setFetchError(`Yetki Hatası (403): ${errorMsg}`);
        return;
      }

      if (resAll.ok) {
        setResearches(await resAll.json());
        setFetchError('');
      } else {
        setFetchError(`Sunucu hatası: ${resAll.status}`);
      }

      if (resStats.ok) {
        setStats(await resStats.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFetchError('Backend sunucusuna bağlanılamadı. Port 3005 aktif mi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Polling for notifications
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/admin/surveys/stats`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async res => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            throw new Error('Unauthorized');
          }
          return res.json();
        })
        .then(newStats => {
          setStats((prevStats) => {
            if (newStats.pending > prevStats.pending) {
              const diff = newStats.pending - prevStats.pending;
              addToast(`📥 ${diff} yeni araştırma inceleme bekliyor!`, 'info');
            }
            return newStats;
          });
        })
        .catch(() => { });
    }, 30000); // 30 seconds polling
    return () => clearInterval(interval);
  }, [token]);

  const filteredResearches = useMemo(() => {
    return researches.filter((r) => {
      const matchesStatus = statusTab === 'all' || r.status === statusTab;
      const matchesSearch =
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.users?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [researches, statusTab, searchQuery]);

  const handleAction = async (status) => {
    if (!selectedResearch) return;
    try {
      let action = 'approve';
      if (status === 'paused') action = 'reject';
      if (status === 'draft') action = 'restore';
      if (status === 'completed') action = 'complete';

      const response = await fetch(`${API_BASE_URL}/admin/surveys/${selectedResearch.id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          note: adminNote,
          ...(action === 'approve' && {
            reward_amount: editReward ? parseFloat(editReward) : undefined,
            estimated_time: editDuration ? parseInt(editDuration) : undefined
          })
        }),
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        return;
      }
      
      if (response.ok) {
        setResearches((prev) =>
          prev.map((r) => (r.id === selectedResearch.id ? { ...r, status } : r))
        );
        setSelectedResearch(null);
        setAdminNote('');
        fetchData(); // refresh stats immediately
      } else {
        alert('İşlem başarısız oldu.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Show login if no token
  if (!token) {
    return <LoginPage onLogin={(t) => setToken(t)} />;
  }

  const SidebarItem = ({ icon: Icon, label, viewId }) => {
    const isActive = activeView === viewId;
    return (
      <button
        onClick={() => { setActiveView(viewId); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
            ? 'bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20 shadow-lg shadow-orange-500/5'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-orange-500/30">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                PolTem<span className="text-orange-500 italic">.</span>
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
            <div className="mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Ana Menü</div>
            <SidebarItem icon={BarChart3} label="Kontrol Paneli" viewId="overview" />
            <SidebarItem icon={ClipboardList} label="Araştırma İnceleme" viewId="reviews" />
            <SidebarItem icon={Users} label="Kullanıcı Yönetimi" viewId="users" />
            <div className="mt-10 mb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Sistem</div>
            <SidebarItem icon={ShieldCheck} label="Güvenlik & Log" viewId="logs" />
          </div>

          <div className="p-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black">AD</div>
                <div className="truncate flex-1">
                  <p className="text-sm font-bold text-white truncate">Admin PolTem</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Super Admin</p>
                </div>
                <button onClick={handleLogout} title="Çıkış Yap" className="text-slate-500 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
            <h1 className="text-xl font-black text-white">
              {activeView === 'overview' ? 'Kontrol Paneli' : activeView === 'reviews' ? 'İnceleme Havuzu' : activeView === 'users' ? 'Kullanıcı Yönetimi' : 'Güvenlik & Log'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">Sistem Aktif</span>
            </div>
            <button className="p-2.5 text-slate-400 hover:text-orange-500 bg-slate-800 rounded-full transition-all border border-slate-700 relative">
              <Bell className="w-5 h-5" />
              {stats.pending > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 border-2 border-slate-900 rounded-full"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Error Banner */}
            {fetchError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{fetchError}</p>
                  <button onClick={fetchData} className="mt-3 text-xs font-bold bg-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all">Tekrar Dene</button>
                </div>
              </div>
            )}

            {/* ═══════ OVERVIEW ═══════ */}
            {activeView === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Toplam Araştırma', value: stats.total, icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { title: 'Bekleyen Onay', value: stats.pending, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { title: 'Onaylananlar', value: stats.approved, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { title: 'Reddedilenler', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all cursor-default">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-40 transition-opacity`}></div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-lg">
                          <TrendingUp className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-slate-900 rounded-[32px] border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                      <div>
                        <h3 className="text-xl font-black text-white">Platform Dağılımı & Analizi</h3>
                        <p className="text-sm text-slate-500 font-bold mt-1">Araştırmaların kullanıldığı platformlara göre dağılımı (Gerçek zamanlı)</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute"></span>
                        <span className="w-2 h-2 rounded-full bg-green-500 relative"></span>
                        <span className="text-xs font-bold text-slate-300">Canlı Veri</span>
                      </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                      {stats.chartData?.platforms?.length > 0 ? (
                        stats.chartData.platforms.map((item, index) => {
                          const percentage = Math.round((item._count.id / stats.total) * 100) || 0;
                          return (
                            <div key={index} className="space-y-3 p-4 rounded-2xl bg-slate-800/20 hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-700/50">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-white flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                  {item.platform || 'Bilinmiyor'}
                                </span>
                                <div className="flex items-center gap-4">
                                  <span className="text-slate-400 font-medium">{item._count.id} Adet</span>
                                  <span className="font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">%{percentage}</span>
                                </div>
                              </div>
                              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-1000 ease-out relative overflow-hidden"
                                  style={{ width: `${percentage}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl">
                          <p className="text-slate-500 font-bold">Veri bulunamadı.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="bg-slate-900 rounded-[32px] border border-slate-800 p-8">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-500" /> Son İşlemler
                    </h3>
                    <div className="space-y-6">
                      {RECENT_ACTIVITIES.map((act) => (
                        <div key={act.id} className="flex gap-4 group cursor-default">
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-slate-800 transition-colors group-hover:border-orange-500/30 ${act.type === 'approve' ? 'text-green-500 bg-green-500/5' : act.type === 'reject' ? 'text-red-500 bg-red-500/5' : 'text-blue-500 bg-blue-500/5'
                            }`}>
                            {act.type === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : act.type === 'reject' ? <XCircle className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                              {act.user} <span className="text-slate-500 font-medium">→ {act.target}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{act.time}</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveView('reviews')} className="w-full mt-10 py-4 rounded-2xl border border-slate-800 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                      Tüm Geçmişi Gör
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ REVIEWS ═══════ */}
            {activeView === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-slate-800 space-y-6 bg-slate-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-orange-500 text-white text-xs font-black rounded-full shadow-lg shadow-orange-500/20">LIVE</div>
                        <h2 className="text-2xl font-black text-white tracking-tight">İnceleme Havuzu</h2>
                      </div>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Araştırma veya E-posta Ara..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-11 pr-6 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pt-2">
                      {[
                        { id: 'all', label: 'Tümü', count: stats.total },
                        { id: 'draft', label: 'İnceleme Aşamasında', count: stats.pending },
                        { id: 'active', label: 'Onaylananlar', count: stats.approved },
                        { id: 'paused', label: 'Reddedilenler', count: stats.rejected },
                        { id: 'completed', label: 'Tamamlananlar', count: stats.completed || 0 },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setStatusTab(tab.id)}
                          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${statusTab === tab.id
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                        >
                          {tab.label}
                          {tab.count !== undefined && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${statusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    {loading ? (
                      <div className="py-20 text-center text-slate-500 font-medium">Yükleniyor...</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">
                            <th className="px-6 py-4">Araştırma Bilgisi</th>
                            <th className="px-6 py-4">Ödül / Süre</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">Detay</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                          {filteredResearches.length > 0 ? (
                            filteredResearches.map((research) => {
                              const cfg = STATUS_CONFIG[research.status] || STATUS_CONFIG.draft;
                              return (
                                <tr key={research.id} className="group hover:bg-slate-800/30 transition-all cursor-pointer" onClick={() => { setSelectedResearch(research); setAdminNote(''); setEditReward(research.reward_amount || ''); setEditDuration(research.estimated_time || research.estimated_duration || ''); }}>
                                  <td className="px-6 py-6">
                                    <div className="font-bold text-white group-hover:text-orange-400 transition-colors">{research.title}</div>
                                    <div className="text-xs text-slate-500 font-medium mt-1">{research.users?.email || '—'}</div>
                                  </td>
                                  <td className="px-6 py-6">
                                    <div className="text-sm font-black text-white">{research.reward_amount || '—'} TL</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{research.estimated_time || research.estimated_duration || '—'} Dk</div>
                                  </td>
                                  <td className="px-6 py-6">
                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${cfg.color}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                      {cfg.label}
                                    </span>
                                  </td>
                                  <td className="px-6 py-6 text-right">
                                    <button className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-400 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all">
                                      <ChevronRight className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr><td colSpan="4" className="px-6 py-16 text-center text-slate-500 font-medium">Bu kategoriye ait sonuç bulunamadı.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ USER MANAGEMENT ═══════ */}
            {activeView === 'users' && (
              <UsersPage token={token} />
            )}

            {/* ═══════ SECURITY & LOGS ═══════ */}
            {activeView === 'logs' && (
              <LogsPage />
            )}

          </div>
        </div>
      </main>

      {/* ─── DETAIL SLIDE-OVER ─── */}
      {selectedResearch && (
        <>
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" style={{ zIndex: 60 }} onClick={() => setSelectedResearch(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-l border-slate-800 flex flex-col" style={{ zIndex: 70 }}>
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Detaylı İnceleme</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedResearch.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedResearch(null)} className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              <div className="space-y-4">
                {STATUS_CONFIG[selectedResearch.status] && (
                  <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-black border uppercase tracking-widest ${STATUS_CONFIG[selectedResearch.status].color}`}>
                    {STATUS_CONFIG[selectedResearch.status].label}
                  </span>
                )}
                <h3 className="text-3xl font-black text-white leading-tight">{selectedResearch.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-orange-500" /> {selectedResearch.users?.email || 'Bilinmiyor'}</div>
                  <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" /> {new Date(selectedResearch.created_at || Date.now()).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="flex items-center gap-3 text-slate-500 mb-3"><Coins className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Ödül Miktarı</span></div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={editReward} onChange={(e) => setEditReward(e.target.value)} className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xl font-black text-white focus:outline-none focus:border-orange-500" placeholder="0" />
                    <span className="text-orange-500 text-lg italic mt-1">TL</span>
                  </div>
                </div>
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <div className="flex items-center gap-3 text-slate-500 mb-3"><Clock className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Tahmini Süre</span></div>
                  <div className="flex items-center gap-2">
                     <input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xl font-black text-white focus:outline-none focus:border-orange-500" placeholder="0" />
                     <span className="text-slate-500 text-sm font-bold mt-1">Dk</span>
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedResearch.id}/update`, {
                      method: 'PATCH',
                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        reward_amount: editReward ? parseFloat(editReward) : undefined,
                        estimated_time: editDuration ? parseInt(editDuration) : undefined,
                      }),
                    });
                    if (res.ok) {
                      setResearches((prev) => prev.map((r) => r.id === selectedResearch.id ? { ...r, reward_amount: editReward ? parseFloat(editReward) : r.reward_amount, estimated_time: editDuration ? parseInt(editDuration) : r.estimated_time } : r));
                      addToast('Ödül ve süre başarıyla güncellendi!');
                    } else {
                      addToast('Güncelleme başarısız oldu.', 'error');
                    }
                  } catch (err) {
                    console.error('Update error:', err);
                    addToast('Güncelleme sırasında hata oluştu.', 'error');
                  }
                }}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl shadow-xl shadow-orange-500/10 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                💾 Ödül ve Süre Değişikliklerini Kaydet
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-orange-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform</p>
                    <p className="text-sm font-bold text-white">{selectedResearch.platform || 'Google Forms'}</p>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center"><Key className="w-5 h-5 text-orange-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tamamlanma Kodu</p>
                    <p className="text-sm font-bold text-white">{selectedResearch.completion_code || '—'}</p>
                  </div>
                </div>
              </div>

              {selectedResearch.description && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-500" /> Açıklama
                  </h4>
                  <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 text-slate-300 text-sm leading-relaxed italic">
                    "{selectedResearch.description}"
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" /> Hedef Kitle Kriterleri
                </h4>
                <div className="flex flex-wrap gap-3">
                  <div className="px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2 uppercase">Cinsiyet:</span> {selectedResearch.target_gender || 'Hepsi'}</div>
                  <div className="px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2 uppercase">Yaş Grubu:</span> {selectedResearch.target_age_group || 'Hepsi'}</div>
                  <div className="px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2 uppercase">Şehir:</span> {selectedResearch.target_city || 'Hepsi'}</div>
                  <div className="px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2 uppercase">Eğitim:</span> {selectedResearch.target_education || 'Hepsi'}</div>
                  {selectedResearch.target_occupation && (
                    <div className="px-5 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-300"><span className="text-slate-500 mr-2 uppercase">Meslek:</span> {selectedResearch.target_occupation}</div>
                  )}
                </div>
              </div>

              {selectedResearch.survey_link && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-orange-500" /> Araştırma Formu Bağlantısı
                  </h4>
                  <a href={selectedResearch.survey_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-slate-950 rounded-3xl border border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5 text-sm font-bold text-orange-500 transition-all group shadow-inner">
                    <span className="truncate">{selectedResearch.survey_link}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </a>
                </div>
              )}

              <div className="space-y-6 pt-10 border-t border-slate-800">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Yönetici Değerlendirme Notu</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none h-32"
                    placeholder="Onay veya ret sebebi buraya yazılır..."
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  {selectedResearch.status !== 'active' && selectedResearch.status !== 'completed' && (
                    <button onClick={() => handleAction('active')} className="flex-1 py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-2xl shadow-green-900/20 transition-all transform active:scale-95">
                      ✓ Onayla
                    </button>
                  )}
                  {selectedResearch.status !== 'paused' && selectedResearch.status !== 'completed' && (
                    <button onClick={() => handleAction('paused')} className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-2xl shadow-red-900/20 transition-all transform active:scale-95">
                      ✕ Reddet
                    </button>
                  )}
                  {selectedResearch.status === 'active' && (
                    <button onClick={() => handleAction('completed')} className="flex-1 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-2xl shadow-purple-900/20 transition-all transform active:scale-95">
                      ✓ Anketi Tamamla
                    </button>
                  )}
                  {selectedResearch.status !== 'draft' && selectedResearch.status !== 'completed' && (
                    <button onClick={() => handleAction('draft')} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all transform active:scale-95">
                      ↩ Geri Al
                    </button>
                  )}
                </div>

                {/* ─── CSV Matching Section ─── */}
                {(selectedResearch.status === 'active' || selectedResearch.status === 'completed') && (
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <Upload className="w-5 h-5 text-orange-500" /> CSV Eşleştirme
                    </h4>
                    <p className="text-xs text-slate-500">Google Forms'dan dışa aktarılan CSV/Excel dosyasını yükleyerek submission verilerinizle eşleştirin.</p>
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
                        <div className="py-4 border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-2xl text-center text-sm font-bold text-slate-400 hover:text-orange-400 transition-all">
                          {csvFile ? `📄 ${csvFile.name}` : '📂 CSV Dosyası Seç'}
                        </div>
                      </label>
                      <button
                        disabled={!csvFile || csvLoading}
                        onClick={async () => {
                          if (!csvFile) return;
                          setCsvLoading(true);
                          setCsvMatchResult(null);
                          try {
                            const text = await csvFile.text();
                            const lines = text.split('\n').filter(l => l.trim());
                            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
                            const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('e-posta') || h.includes('mail'));
                            const idIdx = headers.findIndex(h => h.includes('unique') || h.includes('id') || h.includes('kod'));
                            const rows = lines.slice(1).map(line => {
                              const cols = line.split(',').map(c => c.trim().replace(/["']/g, ''));
                              return {
                                ...(emailIdx >= 0 ? { email: cols[emailIdx] } : {}),
                                ...(idIdx >= 0 ? { unique_id: cols[idIdx] } : {}),
                              };
                            }).filter(r => r.email || r.unique_id);
                            const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedResearch.id}/match-csv`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ rows }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCsvMatchResult(data);
                              addToast(`Eşleştirme tamamlandı: ${data.matched?.length || 0} eşleşti, ${data.unmatchedCsv?.length || 0} eşleşmedi`);
                            } else {
                              addToast('CSV eşleştirme başarısız oldu.', 'error');
                            }
                          } catch (err) {
                            console.error('CSV error:', err);
                            addToast('CSV dosyası okunamadı.', 'error');
                          } finally {
                            setCsvLoading(false);
                          }
                        }}
                        className="px-6 py-4 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black rounded-2xl transition-all transform active:scale-95"
                      >
                        {csvLoading ? '⏳' : '🔍'} Eşleştir
                      </button>
                    </div>

                    {/* Match Results */}
                    {csvMatchResult && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-green-500">{csvMatchResult.matched?.length || 0}</p>
                            <p className="text-[10px] font-black text-green-500/60 uppercase tracking-widest">Eşleşti ✓</p>
                          </div>
                          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-red-500">{csvMatchResult.unmatchedCsv?.length || 0}</p>
                            <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">CSV'de Yok</p>
                          </div>
                          <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-orange-500">{csvMatchResult.unmatchedSubmissions?.length || 0}</p>
                            <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest">Sistemde Yok</p>
                          </div>
                        </div>

                        {csvMatchResult.matched?.length > 0 && (
                          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-800">
                              <h5 className="text-xs font-black text-green-500 uppercase tracking-widest">✓ Eşleşen Kayıtlar</h5>
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/30">
                              {csvMatchResult.matched.map((m, i) => (
                                <div key={i} className="px-4 py-3 flex items-center justify-between text-xs">
                                  <span className="text-white font-bold">{m.csv?.email || m.csv?.unique_id || '—'}</span>
                                  <span className="text-green-500 font-black">✓ Eşleşti</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Payment Table Section ─── */}
                {(selectedResearch.status === 'active' || selectedResearch.status === 'completed') && (
                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <Download className="w-5 h-5 text-orange-500" /> Ödeme Tablosu
                    </h4>
                    <button
                      disabled={paymentLoading}
                      onClick={async () => {
                        setPaymentLoading(true);
                        try {
                          const res = await fetch(`${API_BASE_URL}/admin/surveys/${selectedResearch.id}/payment-table`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setPaymentData(data);
                          } else {
                            addToast('Ödeme tablosu alınamadı.', 'error');
                          }
                        } catch (err) {
                          console.error('Payment table error:', err);
                          addToast('Ödeme tablosu hatası.', 'error');
                        } finally {
                          setPaymentLoading(false);
                        }
                      }}
                      className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-orange-500/30 font-black rounded-2xl text-sm text-slate-400 hover:text-white transition-all"
                    >
                      {paymentLoading ? '⏳ Yükleniyor...' : '📋 Ödeme Tablosunu Getir'}
                    </button>

                    {paymentData && paymentData.rows?.length > 0 && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-800">
                                  <th className="px-4 py-3">Ad Soyad</th>
                                  <th className="px-4 py-3">TC No</th>
                                  <th className="px-4 py-3">Banka</th>
                                  <th className="px-4 py-3">IBAN</th>
                                  <th className="px-4 py-3">Hesap Adı</th>
                                  <th className="px-4 py-3">Tutar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/30">
                                {paymentData.rows.map((row, i) => (
                                  <tr key={i} className="hover:bg-slate-800/20">
                                    <td className="px-4 py-3 text-white font-bold">{row.full_name}</td>
                                    <td className="px-4 py-3 text-slate-400">{row.tc_identity_number}</td>
                                    <td className="px-4 py-3 text-slate-400">{row.bank_name}</td>
                                    <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{row.iban}</td>
                                    <td className="px-4 py-3 text-slate-400">{row.full_name_bank}</td>
                                    <td className="px-4 py-3 text-orange-500 font-black">{row.reward_amount} TL</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const headers = ['Ad Soyad', 'TC No', 'Banka Adı', 'IBAN', 'Hesap Adı Soyadı', 'Tutar (TL)'];
                            const csvContent = [
                              headers.join(','),
                              ...paymentData.rows.map(r => [
                                `"${r.full_name}"`, `"${r.tc_identity_number}"`, `"${r.bank_name}"`,
                                `"${r.iban}"`, `"${r.full_name_bank}"`, r.reward_amount
                              ].join(','))
                            ].join('\n');
                            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `odeme_tablosu_${selectedResearch.title?.replace(/\s+/g, '_') || 'anket'}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                            addToast('Excel dosyası indirildi!');
                          }}
                          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-2xl shadow-green-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" /> Excel Olarak İndir
                        </button>
                      </div>
                    )}
                    {paymentData && paymentData.rows?.length === 0 && (
                      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 text-center">
                        <p className="text-slate-500 font-bold">Henüz onaylanmış katılım bulunmuyor.</p>
                        <p className="text-xs text-slate-600 mt-1">Submission'lar "approved" durumunda olmalıdır.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification Container */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-4 bg-slate-900 border ${toast.type === 'error' ? 'border-red-500' : 'border-orange-500'} shadow-2xl shadow-black p-4 rounded-2xl w-80 translate-x-0 transition-transform duration-300 pointer-events-auto`}>
            <div className={`w-10 h-10 ${toast.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'} rounded-xl flex items-center justify-center shrink-0`}>
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-sm font-bold text-white flex-1">{toast.message}</p>
            <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} className="text-slate-500 hover:text-white p-1 bg-slate-800 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
