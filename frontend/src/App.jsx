import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [adminPasswordModal, setAdminPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Modali di creazione
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  // Stato fittizio/fetch per le sezioni
  const [sections, setSections] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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
  {/* Pagina Principale Hub */}
  <Route path="/" element={<Home />} />

  {/* Pagina Quiz Separata */}
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

  {/* Rotte Admin e Dettagli Sezione */}
  <Route path="/admin/stories" element={<StoriesList isAdmin={isAdmin} />} />
  <Route path="/admin/section/:id" element={<SectionDetail isAdmin={isAdmin} />} />
  <Route path="/section/:id" element={<SectionDetail isAdmin={isAdmin} />} />

  {/* Altre Rotte */}
  <Route path="/play/:id" element={<QuizPlay />} />
  <Route path="/stories" element={<StoriesList refreshTrigger={refreshTrigger} isAdmin={isAdmin} />} />
  <Route path="/story/:id" element={<StoryDetail />} />
  <Route path="/guess-character" element={<GuessCharacter />} />
  <Route path="/multiplayer" element={<MultiplayerLobby />} />
  <Route path="/multiplayer-play" element={<MultiplayerPlay />} />
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