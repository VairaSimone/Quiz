import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import API from '../api/client';
import Toast from './Toast';

export default function EditQuestionModal({ isOpen, onClose, question, onQuestionUpdated }) {
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [level, setLevel] = useState('MEDIO');
  const [type, setType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText || '');
      setCorrectAnswer(question.correctAnswer || '');
      setLevel(question.level || 'MEDIO');
      setType(question.type || 'MULTIPLE_CHOICE');
      setOptions(question.options?.map(o => o.text) || []);
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.put(`/quiz/questions/${question.id}`, {
        questionText,
        correctAnswer,
        level,
        type,
        options: type === 'MULTIPLE_CHOICE' ? options.filter(o => o.trim() !== '') : []
      });
      onQuestionUpdated();
      onClose();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Errore durante la modifica della domanda', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 relative text-white max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-bold mb-4">Modifica Domanda</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Testo Domanda</label>
              <textarea
                required
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Livello</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                >
                  <option value="FACILE">FACILE</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="DIFFICILE">DIFFICILE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tipologia</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none"
                >
                  <option value="MULTIPLE_CHOICE">Risposta Multipla</option>
                  <option value="SHORT_ANSWER">Risposta Aperta</option>
                  <option value="BOOLEAN">Vero / Falso</option>
                  <option value="WHO_SAID">Chi l'ha detto?</option>
                </select>
              </div>
            </div>

            {type === 'MULTIPLE_CHOICE' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-400">Opzioni di Risposta</label>
                  <button type="button" onClick={addOption} className="text-xs text-indigo-400 hover:underline">+ Aggiungi</button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                      />
                      <button type="button" onClick={() => removeOption(idx)} className="text-red-400 text-xs hover:text-red-300">Rimuovi</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Risposta Corretta</label>
              <input
                type="text"
                required
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-400 font-medium"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Annulla</button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}