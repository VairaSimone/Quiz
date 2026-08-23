import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/client';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home, Sparkles, Play, Layers, Zap, User, Award, Shield } from 'lucide-react';
import Toast from '../components/Toast';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gameStarted, setGameStarted] = useState(false);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  // Gamification e Nickname
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSectionInfo = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/sections/${id}`);
        setTotalQuestionsCount(res.data.data.questions.length);
      } catch (err) {
        setToast({ message: 'Errore nel caricamento della sezione!', type: 'error' });
        setTimeout(() => navigate('/'), 1500);
      } finally {
        setLoading(false);
      }
    };
    fetchSectionInfo();
  }, [id, navigate]);

  const startQuiz = async (limitParam) => {
    if (!playerName.trim()) {
      setToast({ message: 'Inserisci un nickname prima di giocare!', type: 'error' });
      return;
    }
    localStorage.setItem('playerName', playerName.trim());

    try {
      setLoading(true);
      const res = await API.get(`/quiz/sections/${id}/play?limit=${limitParam}`);
      setQuestions(res.data.data);
      setGameStarted(true);
    } catch (err) {
      setToast({ message: 'Errore nell\'avvio del quiz!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (answerText) => {
    if (isAnswered) return;
    setSelectedAnswer(answerText);
    validateAnswer(answerText);
  };

  const handleShortAnswerSubmit = (e) => {
    e.preventDefault();
    if (isAnswered || !shortAnswerInput.trim()) return;
    setSelectedAnswer(shortAnswerInput.trim());
    validateAnswer(shortAnswerInput.trim());
  };

  const validateAnswer = (userAns) => {
    setIsAnswered(true);
    const normalizedUser = userAns.toLowerCase().trim();
    const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase().trim();
    const correct = normalizedUser === normalizedCorrect || normalizedCorrect.includes(normalizedUser);

    setIsCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShortAnswerInput('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    try {
      await API.post(`/quiz/sections/${id}/results`, {
        score: score,
        totalQuestions: questions.length,
        playerName: playerName.trim() || 'Anonimo'
      });
    } catch (err) {
      console.error('Errore nel salvataggio del risultato:', err);
    }
  };

  // Helper per assegnare i badge basati sulla percentuale di accuratezza
  const getBadge = (percentage) => {
    if (percentage === 100) {
      return { title: 'Leggenda Anime', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Trophy };
    } else if (percentage >= 80) {
      return { title: 'Maestro Otaku', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: Award };
    } else if (percentage >= 50) {
      return { title: 'Otaku Apprendista', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Shield };
    } else {
      return { title: 'Novizio Anime', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: User };
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Caricamento in corso...</div>;

  // SCHERMATA 1: Selezione Modalità e Inserimento Profilo Utente
  if (!gameStarted) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold mb-2">Preparati al Quiz</h1>
          <p className="text-slate-400 text-sm mb-6">
            Domande disponibili in questa sezione: <span className="text-indigo-400 font-bold">{totalQuestionsCount}</span>
          </p>

          {/* Profilo Nickname */}
          <div className="mb-8 text-left bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" /> Il tuo Nickname Giocatore *
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Inserisci il tuo nome..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-4">
            {totalQuestionsCount >= 15 && (
              <button
                onClick={() => startQuiz('15')}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 p-5 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl group-hover:scale-110 transition">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Partita Rapida</div>
                    <div className="text-xs text-slate-400">15 domande estratte a caso</div>
                  </div>
                </div>
                <Play className="w-5 h-5 text-indigo-400" />
              </button>
            )}

            <button
              onClick={() => startQuiz('all')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 p-5 rounded-2xl flex items-center justify-between text-left transition cursor-pointer shadow-lg shadow-indigo-600/20 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 text-white p-3 rounded-xl group-hover:scale-110 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">Tutte le Domande</div>
                  <div className="text-xs text-indigo-100">
                    Tutte le {totalQuestionsCount} domande mescolate
                  </div>
                </div>
              </div>
              <Play className="w-5 h-5 text-white fill-current" />
            </button>
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // SCHERMATA FINALE: Risultati + Badge Gamification
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const badge = getBadge(percentage);
    const BadgeIcon = badge.icon;

    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
          <h1 className="text-3xl font-extrabold mb-1">Quiz Completato!</h1>
          <p className="text-slate-400 text-sm mb-4">Ottimo lavoro <span className="text-white font-bold">{playerName}</span>!</p>

          {/* Badge sbloccato */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold mb-6 ${badge.color}">
            <BadgeIcon className="w-4 h-4" />
            <span>BADGE: {badge.title}</span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-black text-indigo-400 mb-2">{score} / {questions.length}</div>
            <div className="text-sm font-semibold text-slate-300">Accuratezza: {percentage}%</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition text-sm cursor-pointer">
              <RotateCcw className="w-4 h-4" /> Rigioca
            </button>
            <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold transition text-sm cursor-pointer">
              <Home className="w-4 h-4" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isInputAnswer = currentQuestion.type === 'SHORT_ANSWER' || 
    (currentQuestion.type !== 'BOOLEAN' && (!currentQuestion.options || currentQuestion.options.length === 0));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between text-slate-400 text-sm">
        <span className="font-bold text-indigo-400">Domanda {currentIndex + 1} di {questions.length}</span>
        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold">Punti: {score}</span>
      </div>

      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
        <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-6">
        <div className="flex gap-2 mb-4">
          <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded-full uppercase">{currentQuestion.type}</span>
          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">{currentQuestion.level}</span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug">{currentQuestion.questionText}</h2>

        {isInputAnswer ? (
          <form onSubmit={handleShortAnswerSubmit} className="space-y-4">
            <input
              type="text"
              disabled={isAnswered}
              value={shortAnswerInput}
              onChange={(e) => setShortAnswerInput(e.target.value)}
              placeholder="Scrivi la tua risposta qui..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
            />
            {!isAnswered && (
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition cursor-pointer">Invia Risposta</button>
            )}
          </form>
        ) : currentQuestion.type === 'BOOLEAN' ? (
          <div className="grid grid-cols-2 gap-4">
            {['Vero', 'Falso'].map((opt) => (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl font-bold border transition text-center cursor-pointer ${
                  selectedAnswer === opt
                    ? isCorrect ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {currentQuestion.options?.map((opt) => {
              const isSelected = selectedAnswer === opt.text;
              let btnStyle = 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-indigo-500';

              if (isAnswered) {
                if (isSelected) {
                  btnStyle = isCorrect ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white';
                } else if (opt.text.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-800 text-emerald-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt.text)}
                  className={`w-full p-4 rounded-xl font-medium text-left border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {isAnswered && (
          <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
            isCorrect ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}>
            {isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
            <div>
              <div className="font-bold text-sm">{isCorrect ? 'Risposta Esatta!' : 'Risposta Errata!'}</div>
              {!isCorrect && (
                <div className="text-xs mt-0.5">Risposta corretta: <span className="underline font-bold">{currentQuestion.correctAnswer}</span></div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAnswered && (
        <button
          onClick={handleNextQuestion}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{currentIndex + 1 < questions.length ? 'Prossima Domanda' : 'Vedi Risultati'}</span>
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}