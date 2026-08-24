import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, PlusCircle, ShieldCheck, Image as ImageIcon, Users, BookOpen } from 'lucide-react';
import API from '../api/client';

export default function Navbar({ onOpenCreateModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin') || Boolean(localStorage.getItem('adminPassword'));

  const handleAdminAccess = async (e) => {
    e.preventDefault();
    
    const storedPassword = localStorage.getItem('adminPassword');
    if (storedPassword) {
      navigate('/admin');
      return;
    }

    const inputPassword = prompt('Inserisci la password Admin:');
    if (!inputPassword) return;

    try {
      localStorage.setItem('adminPassword', inputPassword);
      await API.post('/quiz/admin/verify');
      navigate('/admin');
    } catch (err) {
      localStorage.removeItem('adminPassword');
      alert('Password errata!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 text-xl font-bold text-indigo-400 hover:text-indigo-300">
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
          <Link to={isAdmin ? "/admin/stories" : "/stories"} className="flex items-center gap-2 text-sm text-slate-300 hover:text-indigo-400 font-medium transition">
            <BookOpen className="w-4 h-4" />
            <span>Racconti</span>
          </Link>
          <Link to="/guess-character" className="flex items-center gap-2 text-sm text-slate-300 hover:text-indigo-400 font-medium transition">
            <ImageIcon className="w-4 h-4" />
            <span>Indovina PG</span>
          </Link>
          <Link to="/multiplayer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-indigo-400 font-medium transition">
            <Users className="w-4 h-4" />
            <span>Multiplayer</span>
          </Link>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          {isAdmin ? (
            <>
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nuova Sezione</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-white underline ml-2 cursor-pointer"
              >
                Esci da Admin
              </button>
            </>
          ) : (
            <button
              onClick={handleAdminAccess}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              Area Riservata
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}