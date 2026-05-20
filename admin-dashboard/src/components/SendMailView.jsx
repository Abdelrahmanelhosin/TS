/**
 * SendMailView Component
 * Extracted from AdminDashboard.js → renderSendMail()
 * Uses DashboardContext for all shared state.
 */
import React from 'react';
import { Users, Search, Send, RotateCcw } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function SendMailView() {
  const {
    users,
    mailRecipient, setMailRecipient,
    mailSubject, setMailSubject,
    mailContent, setMailContent,
    mailLoading,
    mailUserSearchTerm, setMailUserSearchTerm,
    mailSearchResults,
    handleSendMail,
  } = useDashboard();

  return (
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
              <input
                type="text"
                value={mailUserSearchTerm}
                onChange={(e) => setMailUserSearchTerm(e.target.value)}
                placeholder="Ara..."
                className="w-full bg-[#0B1121] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {(mailSearchResults.length > 0 ? mailSearchResults : users).map(u => (
                <div
                  key={u.id}
                  onClick={() => { setMailRecipient(u.users?.email || u.email || ''); setMailUserSearchTerm(u.name || ''); }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${mailRecipient === (u.users?.email || u.email) ? 'bg-orange-500 border-orange-400' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
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
                <input
                  type="email" required
                  value={mailRecipient}
                  onChange={(e) => setMailRecipient(e.target.value)}
                  placeholder="Alıcı"
                  className="bg-[#0B1121] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none"
                />
                <input
                  type="text" required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Konu"
                  className="bg-[#0B1121] border border-white/5 rounded-2xl px-6 py-4 text-white font-bold outline-none"
                />
              </div>
              <textarea
                required rows={10}
                value={mailContent}
                onChange={(e) => setMailContent(e.target.value)}
                placeholder="Mesajınız..."
                className="w-full bg-[#0B1121] border border-white/5 rounded-[2rem] px-8 py-6 text-white font-medium outline-none resize-none"
              />
              <button
                type="submit"
                disabled={mailLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-6 rounded-2xl shadow-xl flex items-center justify-center gap-4"
              >
                {mailLoading ? <RotateCcw className="w-6 h-6 animate-spin" /> : <>GÖNDER <Send className="w-6 h-6" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
