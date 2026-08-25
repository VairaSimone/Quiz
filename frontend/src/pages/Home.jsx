import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, BookOpen, UserCheck, Users, Sparkles, ArrowRight, MessageSquare, Volume2 } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Quiz & Citazioni',
      description: 'Metti alla prova quanto conosci le storie e le citazioni iconiche dei nostri personaggi.',
      icon: Gamepad2,
      path: '/quizzes',
      badge: 'Lore Quiz',
      color: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/50',
      iconColor: 'text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500'
    },
    {
      title: 'Visual Novel Telegram',
      description: 'Leggi i racconti interattivi scritti nel nostro gruppo Telegram con scenari e immagini.',
      icon: BookOpen,
      path: '/stories',
      badge: 'Storie & VN',
      color: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      btnBg: 'bg-purple-600 hover:bg-purple-500'
    },
    {
      title: 'Indovina il Personaggio',
      description: 'Riconosci l’OC (Original Character) dalla foto sgranata o da un dettaglio della sua lore.',
      icon: UserCheck,
      path: '/guess-character',
      badge: 'OC Minigame',
      color: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-500'
    },
    {
      title: 'Multiplayer Live PvP',
      description: 'Crea una stanza e sfida in tempo reale a chi risponde più velocemente!',
      icon: Users,
      path: '/multiplayer',
      badge: 'Sfida Live',
      color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Banner Principale Personalizzato */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-8 sm:p-12 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-left">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                <MessageSquare className="w-3.5 h-3.5" /> Wonderful Hub
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Le nostre storie, <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  i nostri Personaggi.
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                L'archivio interattivo per i nostri racconti Telegram. Gioca ai quiz sulle citazioni dei personaggi, indovina chi l'ha detto o rileggi i nostri capitoli preferiti.
              </p>
            </div>

            {/* Badge Info veloce */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Audio Vocali</div>
                  <div className="text-sm font-bold text-white">Integrati nei Quiz</div>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Personaggi Salvati</div>
                  <div className="text-sm font-bold text-white">100+ OC</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Griglia delle Modalità */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group relative rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${item.borderColor} flex flex-col justify-between overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 ${item.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                  <Link
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${item.btnBg}`}
                  >
                    <span>Gioca ORA</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}