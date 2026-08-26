import React from 'react';
import { Link } from 'react-router-dom';
import { Play, FileText, Trash2, Settings } from 'lucide-react';
import { SERVER_URL } from '../api/client';

export default function SectionCard({ section, onDelete, isAdmin }) {
  const imageUrl = section.coverImage 
    ? `${section.coverImage}`
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60';

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition flex flex-col shadow-lg">
      <div className="relative h-48 w-full overflow-hidden group">
        <img 
          src={imageUrl} 
          alt={section.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
        />
        {isAdmin && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(section.id);
            }}
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Elimina sezione"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {section.description || 'Nessuna descrizione.'}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1 font-semibold text-indigo-400">
            <FileText className="w-4 h-4" />
            {section._count?.questions || 0} Domande
          </span>
        </div>

        {/* Pulsanti differenziati tra Utente Normale e Admin */}
        {isAdmin ? (
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/admin/section/${section.id}`}
              className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium py-2 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              Gestisci
            </Link>
            <Link
              to={`/play/${section.id}`}
              className={`flex items-center justify-center gap-1 text-sm font-medium py-2 rounded-lg transition ${
                (section._count?.questions || 0) > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Play className="w-4 h-4" />
              Gioca
            </Link>
          </div>
        ) : (
          <Link
            to={`/play/${section.id}`}
            className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition ${
              (section._count?.questions || 0) > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Gioca Ora
          </Link>
        )}
      </div>
    </div>
  );
}