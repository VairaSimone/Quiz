import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, ArrowRight, Clock, BookMarked, Sparkles } from 'lucide-react';

export default function StoriesList({ stories, onDeleteStory, isAdmin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">

        {/* Header Sezione & Contatore */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <BookMarked className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Catalogo Storie</h2>
              <p className="text-xs text-slate-400">Scegli un'avventura e inizia a leggere</p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
            Storie disponibili: <strong className="text-purple-400 font-bold">{stories?.length || 0}</strong>
          </span>
        </div>

        {/* Griglia Storie / Visual Novel */}
        {!stories || stories.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Nessun racconto presente</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Gli amministratori possono aggiungere una nuova storia interattiva tramite il pulsante nella barra di navigazione.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between overflow-hidden"
              >
                {/* Glow decorativo al passaggio del mouse */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Badge & Azioni Admin */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {story.genre || 'Visual Novel'}
                    </span>

                    {isAdmin && onDeleteStory && (
                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Elimina Storia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Titolo e Descrizione */}
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6">
                    {story.description || 'Nessuna sinossi disponibile per questo racconto.'}
                  </p>
                </div>

                {/* Footer della Card */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>{story.estimated_read_time || '~5 min'}</span>
                  </div>

                  <Link
                    to={`/story/${story.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/20 group-hover:shadow-purple-500/30 transition-all cursor-pointer"
                  >
                    <span>Leggi</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}