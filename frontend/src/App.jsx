import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SectionDetail from './pages/SectionDetail';
import QuizPlay from './pages/QuizPlay';
import CreateSectionModal from './components/CreateSectionModal';
import GuessCharacter from './pages/GuessCharacter';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSectionCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />
        <main className="flex-grow">
          <Routes>
            {/* Rotte Pubbliche */}
            <Route path="/" element={<Home isAdmin={false} refreshTrigger={refreshTrigger} />} />
            <Route path="/play/:id" element={<QuizPlay />} />
            <Route path="/guess-character" element={<GuessCharacter />} />

            {/* Rotte Admin */}
            <Route path="/admin" element={<Home isAdmin={true} refreshTrigger={refreshTrigger} />} />
            <Route path="/admin/section/:id" element={<SectionDetail />} />
          </Routes>
        </main>

        <CreateSectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSectionCreated={handleSectionCreated}
        />
      </div>
    </BrowserRouter>
  );
}