import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trash2, Award, Layers, ArrowRight } from 'lucide-react';

export default function QuizAnime({ sections, onDeleteSection, isAdmin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Intestazione Sezione */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Quiz Anime</h1>
              <p className="text-xs text-slate-400">Scegli una categoria e inizia il test</p>
            </div>
          </div>
          
          <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
            Sezioni totali: <strong className="text-indigo-400 font-bold">{sections?.length || 0}</strong>
          </span>
        </div>

        {/* Griglia Sezioni Quiz */}
        {!sections || sections.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl backdrop-blur-sm">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Nessuna sezione quiz trovata</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Accedi come Admin per aggiungere la prima sezione con file Word (.docx).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="group relative bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {section.category || 'Anime General'}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteSection(section.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Elimina Sezione"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-1">
                    {section.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6">
                    {section.description || 'Nessuna descrizione disponibile per questa sezione.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{section.questions_count || 0} Domande</span>
                  </div>

                  <Link
                    to={`/section/${section.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 group-hover:shadow-indigo-500/30 transition-all cursor-pointer"
                  >
                    <span>Esplora</span>
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