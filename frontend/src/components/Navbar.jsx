import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, PlusCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function Navbar({ onOpenCreateModal }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300">
            <Gamepad2 className="w-8 h-8" />
            <span>Quiz Wonderful</span>
          </Link>
          {isAdmin && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ADMIN MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Nuovo pulsante visibile a tutti per la modalità Indovina PG */}
          <Link 
            to="/guess-character" 
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-indigo-400 font-medium transition"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Indovina PG</span>
          </Link>

          <div className="w-px h-6 bg-slate-700 mx-1"></div> {/* Separatore visivo */}

          {isAdmin ? (
            <>
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nuova Sezione</span>
              </button>
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-white underline ml-2"
              >
                Esci da Admin
              </Link>
            </>
          ) : (
            <Link
              to="/admin"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Area Riservata
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}