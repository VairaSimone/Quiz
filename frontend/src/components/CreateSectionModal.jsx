import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function CreateSectionModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [wordFile, setWordFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Esegui la logica di invio o chiamata API qui...
    
    // Reset dello stato locale
    setTitle('');
    setCategory('');
    setDescription('');
    setWordFile(null);

    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Glow Decorativo top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/60">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Crea Nuova Sezione Quiz
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Input Titolo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Titolo Sezione
            </label>
            <input
              type="text"
              required
              placeholder="es. Naruto Shippuden - Arca Akatsuki"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition focus:outline-none"
            />
          </div>

          {/* Input Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoria / Genere
            </label>
            <input
              type="text"
              required
              placeholder="es. Shonen, Seinen, Isekai..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition focus:outline-none"
            />
          </div>

          {/* Input Descrizione */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrizione
            </label>
            <textarea
              rows={3}
              placeholder="Breve introduzione al contenuto del quiz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition focus:outline-none resize-none"
            />
          </div>

          {/* Area File Upload Word (.docx) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Documento Domande (.docx)
            </label>
            <label className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
              wordFile 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/40 hover:bg-slate-800/80'
            }`}>
              <input
                type="file"
                accept=".docx"
                onChange={(e) => setWordFile(e.target.files[0])}
                className="hidden"
              />
              {wordFile ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="truncate max-w-[240px]">{wordFile.name}</span>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-7 h-7 text-indigo-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-300">
                    Clicca per caricare il file Word
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Formato accetto: .docx</p>
                </div>
              )}
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              Crea Sezione
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}