import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  Gamepad2, 
  BookOpen, 
  Users, 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  isAdmin, 
  onToggleAdmin, 
  onOpenCreateSection, 
  onOpenCreateStory 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Quiz Anime', path: '/quizzes', icon: Gamepad2 },
    { name: 'Racconti', path: '/stories', icon: BookOpen },
    { name: 'Indovina Personaggio', path: '/guess-character', icon: UserCheck },
    { name: 'Multiplayer', path: '/multiplayer', icon: Users },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-white tracking-wide">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Wonderful Hub
            </span>
          </Link>

          {/* Navigazione Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Sezione Admin Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-indigo-500/30">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
                
                <button
                  onClick={onOpenCreateSection}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Quiz
                </button>

                <button
                  onClick={onOpenCreateStory}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Storia
                </button>

                <button
                  onClick={onToggleAdmin}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 text-xs font-medium transition cursor-pointer"
                >
                  Esci
                </button>
              </div>
            ) : (
              <button
                onClick={onToggleAdmin}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                Accedi Admin
              </button>
            )}
          </div>

          {/* Toggle Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive(link.path)
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 space-y-2">
            {isAdmin ? (
              <>
                <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 mb-2">
                  <span className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Modalità Admin Attiva
                  </span>
                  <button onClick={onToggleAdmin} className="text-rose-400 hover:underline">Esci</button>
                </div>
                <button
                  onClick={() => { onOpenCreateSection(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Nuovo Quiz
                </button>
                <button
                  onClick={() => { onOpenCreateStory(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Nuova Storia (VN)
                </button>
              </>
            ) : (
              <button
                onClick={() => { onToggleAdmin(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700"
              >
                <ShieldAlert className="w-4 h-4" /> Accedi come Admin
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}