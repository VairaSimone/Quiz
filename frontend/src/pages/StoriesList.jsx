import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { SERVER_URL } from '../api/client';
import CreateStoryModal from '../components/CreateStoryModal';
import { BookOpen, PlusCircle, Trash2, Sparkles, MessageSquare } from 'lucide-react';

export default function StoriesList({ isAdmin }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determina se l'utente è un Admin verificando anche il localStorage
  const hasAdminAuth = isAdmin || Boolean(localStorage.getItem('adminPassword'));

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/stories');
      setStories(res.data.data);
    } catch (err) {
      console.error('Errore durante il recupero dei racconti:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Sei sicuro di voler eliminare questo racconto?')) return;
    try {
      await API.delete(`/stories/${id}`);
      setStories(stories.filter(s => s.id !== id));
    } catch (err) {
      alert('Errore durante l\'eliminazione del racconto');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-400">
        <Sparkles className="w-8 h-8 animate-spin" />
        <span className="ml-2 font-medium">Caricamento racconti...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-white">Racconti & Storie</h1>
            <p className="text-slate-400 text-sm">Conversazioni Telegram da leggere in formato chat.</p>
          </div>
        </div>

        {hasAdminAuth && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold transition text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuovo Racconto</span>
          </button>
        )}
      </div>

      {stories.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-lg mb-1 font-semibold text-slate-300">Nessun racconto presente.</p>
          <p className="text-xs text-slate-500">I racconti caricati dall'amministratore appariranno qui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => {
            const cover = story.coverImage 
              ? `${SERVER_URL}${story.coverImage}`
              : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';

            return (
              <div key={story.id} className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col overflow-hidden shadow-xl group">
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img src={cover} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  {hasAdminAuth && (
                    <button
                      onClick={(e) => handleDelete(story.id, e)}
                      className="absolute top-3 right-3 bg-rose-600/90 hover:bg-rose-600 text-white p-2 rounded-full transition cursor-pointer"
                      title="Elimina racconto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-3 leading-relaxed">
                    {story.description || 'Nessuna descrizione.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/stories/${story.id}`}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Leggi Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStoryCreated={fetchStories}
      />
    </div>
  );
}