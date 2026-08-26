import React, { useState, useEffect } from 'react';
import API from '../api/client';
import SectionCard from '../components/SectionCard';
import { Sparkles, Library, ShieldCheck } from 'lucide-react';

export default function QuizAnime({ refreshTrigger, isAdmin }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await API.get('/sections');
      setSections(response.data.data);
    } catch (err) {
      console.error('Errore nel caricamento delle sezioni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [refreshTrigger]);

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa sezione e tutte le sue domande?')) return;
    try {
      await API.delete(`/sections/${id}`);
      setSections(sections.filter(s => s.id !== id));
    } catch (err) {
      alert('Errore durante la cancellazione della sezione');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-400">
        <Sparkles className="w-8 h-8 animate-spin" />
        <span className="ml-2 font-medium">Caricamento Quiz Wonderful...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Library className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            {isAdmin ? 'Pannello Amministrazione' : 'Scegli un Quiz Anime'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isAdmin 
              ? 'Gestisci sezioni, carica file Word e modifica domande.' 
              : 'Seleziona il tuo anime preferito e metti alla prova la tua conoscenza!'}
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-lg mb-2">Nessuna sezione anime creata finora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(section => (
            <SectionCard 
              key={section.id} 
              section={section} 
              onDelete={handleDeleteSection} 
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}