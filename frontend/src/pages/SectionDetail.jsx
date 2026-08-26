import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API, { SERVER_URL } from '../api/client';
import EditQuestionModal from '../components/EditQuestionModal';
import { Upload, FileText, Play, Trash2, ArrowLeft, Trophy, CheckCircle, Edit3 } from 'lucide-react';

export default function SectionDetail() {
  const { id } = useParams();
  const [section, setSection] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      const [resSection, resLeaderboard] = await Promise.all([
        API.get(`/sections/${id}`),
        API.get(`/quiz/sections/${id}/leaderboard`)
      ]);
      setSection(resSection.data.data);
      setLeaderboard(resLeaderboard.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData();
  }, [id]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.docx')) {
      setFile(selected);
      setUploadStatus(null);
    } else {
      alert('Seleziona un file valido con estensione .docx');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('docxFile', file);

    try {
      setUploading(true);
      const res = await API.post(`/quiz/sections/${id}/upload-docx`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus(`Successo! Importate ${res.data.count} domande.`);
      setFile(null);
      fetchSectionData();
    } catch (err) {
      alert(err.response?.data?.message || 'Errore nell\'upload del file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSingleQuestion = async (qId) => {
    if (!window.confirm('Eliminare questa specifica domanda?')) return;
    try {
      await API.delete(`/quiz/questions/${qId}`);
      fetchSectionData();
    } catch (err) {
      alert('Errore durante l\'eliminazione della domanda');
    }
  };

  const handleClearQuestions = async () => {
    if (!window.confirm('Vuoi rimuovere TUTTE le domande salvate per questa sezione?')) return;
    try {
      await API.delete(`/quiz/sections/${id}/questions`);
      fetchSectionData();
    } catch (err) {
      alert('Errore nello svuotamento delle domande');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Caricamento in corso...</div>;
  if (!section) return <div className="text-center py-20 text-red-400">Sezione non trovata!</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
<Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
  <ArrowLeft className="w-4 h-4" /> Torna al Pannello Admin
</Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-5">
          <img 
            src={section.coverImage ? `${SERVER_URL}${section.coverImage}` : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600'} 
            alt={section.title}
            className="w-24 h-24 rounded-xl object-cover border border-slate-700" 
          />
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">{section.title}</h1>
            <p className="text-slate-400 text-sm">{section.description || 'Nessuna descrizione.'}</p>
            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-indigo-400">
<span>{section.questions?.length || 0} domande registrate</span>
            </div>
          </div>
        </div>

    <Link
  to={`/play/${section.id}`}
  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
    (section.questions?.length || 0) > 0 
      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' 
      : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
  }`}
>
          <Play className="w-5 h-5 fill-current" />
          Avvia Quiz
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modulo Upload + Classifica */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Carica file Word (.docx)
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition">
                <input type="file" accept=".docx" onChange={handleFileChange} id="docxInput" className="hidden" />
                <label htmlFor="docxInput" className="cursor-pointer block">
                  <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <span className="text-sm font-medium text-slate-300 block">
                    {file ? file.name : 'Seleziona un file Word'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">Formato .docx supportato</span>
                </label>
              </div>

              {uploadStatus && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {uploadStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition text-sm cursor-pointer"
              >
                {uploading ? 'Parsing in corso...' : 'Importa Domande'}
              </button>
            </form>
          </div>

          {/* Leaderboard Migliori Punteggi */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Classifica High Scores
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-500">Nessuna partita registrata.</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((res, rank) => (
                  <div key={res.id} className="flex justify-between items-center bg-slate-800/50 px-3 py-2 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">#{rank + 1}</span>
                      <span className="text-slate-300">{new Date(res.playedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-indigo-400">{res.score} / {res.totalQuestions} pt</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista Domande con Modifica ed Eliminazione Singola */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
<h2 className="text-xl font-bold text-white">Domande Presenti ({section.questions?.length || 0})</h2>
{(section.questions?.length || 0) > 0 && (
                <button
                  onClick={handleClearQuestions}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" /> Svuota tutto
                </button>
              )}
            </div>

{(!section.questions || section.questions.length === 0) ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                Nessuna domanda caricata. Utilizza il pannello di sinistra per caricare un documento Word.
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {section.questions.map((q, idx) => (
                  <div key={q.id} className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 relative group">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-400">Domanda {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                          {q.type}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          q.level === 'FACILE' ? 'bg-emerald-950 text-emerald-400' :
                          q.level === 'MEDIO' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {q.level}
                        </span>
                        
                        {/* Azioni Modifica e Cancella */}
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="text-slate-400 hover:text-indigo-400 p-1"
                          title="Modifica Domanda"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingleQuestion(q.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                          title="Elimina Domanda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-white text-sm font-medium mb-3">{q.questionText}</p>

                    {q.options?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {q.options.map(opt => (
                          <div key={opt.id} className="bg-slate-900/50 px-2.5 py-1.5 rounded text-xs text-slate-300 border border-slate-800">
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/30 px-3 py-1.5 rounded border border-emerald-900/40">
                      Risposta corretta: {q.correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditQuestionModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        question={editingQuestion}
        onQuestionUpdated={fetchSectionData}
      />
    </div>
  );
}