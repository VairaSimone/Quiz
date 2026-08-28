import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';

import Navbar from './components/Navbar';
import CreateSectionModal from './components/CreateSectionModal';
import CreateStoryModal from './components/CreateStoryModal';
import Toast from './components/Toast';

import Home from './pages/Home';
import QuizAnime from './pages/QuizAnime';
import SectionDetail from './pages/SectionDetail';
import QuizPlay from './pages/QuizPlay';
import StoriesList from './pages/StoriesList';
import StoryDetail from './pages/StoryDetail';
import GuessCharacter from './pages/GuessCharacter';
import MultiplayerLobby from './pages/MultiplayerLobby';
import MultiplayerPlay from './pages/MultiplayerPlay';
import BackgroundMusic from './components/BackgroundMusic';
import CharacterQuestions from './pages/CharacterQuestions';

export default function App() {
  // Password di default uguale a quella Admin (o personalizzabile)
  const SITE_PASSWORD = import.meta.env.PASSWORD || 'Asami200202';

  // Stato di autenticazione globale per l'accesso al sito
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sitePassword') === SITE_PASSWORD || localStorage.getItem('adminPassword') === SITE_PASSWORD;
  });
  const [sitePassInput, setSitePassInput] = useState('');
  const [passError, setPassError] = useState(false);

  // Stato Admin preesistente
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [adminPasswordModal, setAdminPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Modali di creazione
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  const [sections, setSections] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Gestione sblocco sito
  const handleSiteLoginSubmit = (e) => {
    e.preventDefault();
    if (sitePassInput === SITE_PASSWORD) {
      localStorage.setItem('sitePassword', sitePassInput);
      // Salva anche come password admin nel client se vuoi che sblocchi tutto
      localStorage.setItem('adminPassword', sitePassInput);
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminPassword');
      showToast('Modalità Admin disattivata', 'error');
    } else {
      setAdminPasswordModal(true);
    }
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (!passwordInput) return;

    localStorage.setItem('adminPassword', passwordInput);
    localStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
    setPasswordInput('');
    setAdminPasswordModal(false);
    showToast('Modalità Admin attivata!', 'success');
  };

  const handleDeleteSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
    showToast('Sezione eliminata', 'error');
  };

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // --- SCHERMATA DI BLOCCAGGIO (GATE PASSSWORD) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2">Accesso Riservato</h1>
          <p className="text-slate-400 text-sm mb-6">
            Inserisci la password per accedere e iniziare a giocare.
          </p>

          <form onSubmit={handleSiteLoginSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password di accesso..."
                value={sitePassInput}
                onChange={(e) => setSitePassInput(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition ${
                  passError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                }`}
                autoFocus
              />
              {passError && (
                <p className="text-rose-400 text-xs font-semibold mt-2 text-left">
                  Password errata. Riprova!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              Sblocca Sito
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- APPLICAZIONE NORMALE ---
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <BackgroundMusic />
        <Navbar 
          isAdmin={isAdmin}
          onToggleAdmin={handleAdminToggle}
          onOpenCreateSection={() => setIsCreateSectionOpen(true)}
          onOpenCreateStory={() => setIsCreateStoryOpen(true)}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/quizzes" 
              element={
                <QuizAnime 
                  sections={sections} 
                  onDeleteSection={handleDeleteSection} 
                  isAdmin={isAdmin} 
                />
              } 
            />
            <Route path="/admin/stories" element={<StoriesList isAdmin={isAdmin} />} />
            <Route path="/admin/section/:id" element={<SectionDetail isAdmin={isAdmin} />} />
            <Route path="/section/:id" element={<SectionDetail isAdmin={isAdmin} />} />
            <Route path="/play/:id" element={<QuizPlay />} />
            <Route path="/stories" element={<StoriesList refreshTrigger={refreshTrigger} isAdmin={isAdmin} />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/guess-character" element={<GuessCharacter />} />
            <Route path="/multiplayer" element={<MultiplayerLobby />} />
            <Route path="/multiplayer-play" element={<MultiplayerPlay />} />
            <Route path="/domande-personaggio" element={<CharacterQuestions />} />
          </Routes>
        </main>

        {/* Modal Password Admin */}
        {adminPasswordModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Accesso Amministratore</h3>
              <p className="text-sm text-slate-400 mb-4">
                Inserisci la password per sbloccare la creazione di quiz e storie.
              </p>
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Password Admin..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminPasswordModal(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Conferma
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modale Creazione Sezione Quiz */}
        <CreateSectionModal 
          isOpen={isCreateSectionOpen}
          onClose={() => setIsCreateSectionOpen(false)} 
          onSuccess={() => {
            setIsCreateSectionOpen(false);
            triggerRefresh();
            showToast('Sezione Quiz creata con successo!');
          }} 
        />

        {/* Modale Creazione Racconto */}
        <CreateStoryModal 
          isOpen={isCreateStoryOpen}
          onClose={() => setIsCreateStoryOpen(false)} 
          onSuccess={() => {
            setIsCreateStoryOpen(false);
            triggerRefresh();
            showToast('Racconto creato con successo!');
          }} 
        />

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: '' })} 
        />
      </div>
    </Router>
  );
}