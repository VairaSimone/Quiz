import React, { useState } from 'react';
import { X, Upload, FileJson } from 'lucide-react';
import API from '../api/client';
import Toast from './Toast';

export default function CreateStoryModal({ isOpen, onClose, onStoryCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleJsonChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      setJsonFile(file);
    } else {
      setToast({ message: 'Seleziona un file JSON valido!', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Controllo e richiesta automatica della password Admin se mancante
    let adminPassword = localStorage.getItem('adminPassword');
    if (!adminPassword) {
      adminPassword = prompt('Inserisci la password Admin per caricare il racconto:');
      if (!adminPassword) return;
      localStorage.setItem('adminPassword', adminPassword);
    }

    if (!title.trim()) {
      setToast({ message: 'Inserisci un titolo per il racconto!', type: 'error' });
      return;
    }
    if (!jsonFile) {
      setToast({ message: 'Carica il file JSON estratto da Telegram!', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('jsonFile', jsonFile);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      setLoading(true);
await API.post('/stories', formData);
      setTitle('');
      setDescription('');
      setCoverImage(null);
      setJsonFile(null);
      setPreview(null);
      onStoryCreated();
      onClose();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminPassword');
        setToast({ message: 'Password Admin errata o scaduta. Riprova il caricamento.', type: 'error' });
      } else {
        setToast({ message: err.response?.data?.message || 'Errore nella creazione del racconto', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-bold mb-4">Carica Nuovo Racconto Telegram</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Titolo Racconto *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. WK suisei"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Descrizione</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve introduzione alla storia..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">File JSON Telegram *</label>
              <div className="border border-dashed border-slate-700 rounded-xl p-3 text-center bg-slate-950/50">
                <input type="file" accept=".json" onChange={handleJsonChange} id="jsonInput" className="hidden" />
                <label htmlFor="jsonInput" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300">
                  <FileJson className="w-5 h-5" />
                  <span>{jsonFile ? jsonFile.name : 'Seleziona file .json'}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Copertina (Opzionale)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold border border-slate-700">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Scegli Copertina</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {preview && (
                  <img src={preview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-indigo-500" />
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">Annulla</button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {loading ? 'Salvataggio...' : 'Crea Racconto'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}