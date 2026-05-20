/**
 * AIAnalyticsView Component
 * Extracted from AdminDashboard.js → renderAIAnalytics()
 * Uses DashboardContext for all shared state.
 */
import React from 'react';
import { Brain, ListTodo, Zap, MessageSquare, Send, RotateCcw, Sparkles } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function AIAnalyticsView() {
  const {
    surveys,
    aiReport,
    aiLoading,
    aiChatMessages,
    aiChatInput,
    setAiChatInput,
    handleAnalyzeAI,
    handleAiChatSend,
    setActiveView,
    fetchSurveyDetails,
    handleAnalyzeSurveyAI,
  } = useDashboard();

  return (
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
}
