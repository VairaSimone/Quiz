import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import API from '../api/client';
import Toast from './Toast';

export default function CreateSectionModal({ isOpen, onClose, onSectionCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ message: 'Inserisci un titolo per la sezione!', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      setLoading(true);
      await API.post('/sections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setCoverImage(null);
      setPreview(null);
      onSectionCreated();
      onClose();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Errore durante la creazione della sezione', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-4">Crea Nuova Sezione Anime</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Titolo Anime *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Naruto Shippuden"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Descrizione</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve introduzione..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Immagine Copertina</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer transition text-sm">
                  <Upload className="w-4 h-4" />
                  <span>Scegli Foto</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {preview && (
                  <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-indigo-500" />
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition">Annulla</button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Salvataggio...' : 'Crea Sezione'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}