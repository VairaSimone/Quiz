import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Timer, Trophy, RotateCcw, Home, XCircle, Sparkles,
  CheckCircle2, Eye, Zap, Image as ImageIcon, FastForward, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API, { SERVER_URL } from '../api/client';

export default function GuessCharacter() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // Stati Generali
  const [selectedMode, setSelectedMode] = useState(null); // 'classic' | 'reverse' | 'blur' | 'timeattack' | 'audio'
  const [audioLang, setAudioLang] = useState('jp'); // 'jp' o 'it'
  const [shuffledCharacters, setShuffledCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(60); // Per Time Attack
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Opzioni per la Modalità Inversa (4 immagini)
  const [imageOptions, setImageOptions] = useState([]);

  // Feedback visivo e stato risposta
  const [feedback, setFeedback] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Helper per calcolare il tempo di ciascuna modalità
  const getRoundTime = (mode) => {
    if (mode === 'reverse') return 5;
    if (mode === 'classic') return 10;
    return 15; // blur o audio
  };

  // Selezione della modalità
  const handleSelectMode = async (mode, lang = 'jp') => {
    if (mode === 'audio') {
      setAudioLang(lang);
      try {
        // Passiamo la lingua come parametro all'API
        const res = await API.get(`/quiz/audio?lang=${lang}`);
        setShuffledCharacters(res.data.data.sort(() => 0.5 - Math.random()));
      } catch (e) {
        console.error(e);
      }
    }
    setSelectedMode(mode);
    setTimeLeft(getRoundTime(mode));
  };

  // Effetti Sonori con Web Audio API
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (e) {
      console.error("Audio Error:", e);
    }
  };

  // Caricamento Personaggi dal Backend (Per le modalità non audio)
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await API.get('/quiz/characters');
        setShuffledCharacters(response.data.data.sort(() => 0.5 - Math.random()));
      } catch (error) {
        console.error("Errore caricamento personaggi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const currentFile = shuffledCharacters[currentIndex];

  // Helper: Estrae solo il primo nome prima dello spazio
  const getFirstName = (fileName) => {
    if (!fileName) return '';
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    return nameWithoutExt.trim().split(/\s+/)[0];
  };

  // Generatore di 4 opzioni per la Modalità Inversa
  useEffect(() => {
    if (selectedMode === 'reverse' && currentFile && shuffledCharacters.length >= 4) {
      const decoys = shuffledCharacters.filter(f => f !== currentFile);
      const randomDecoys = [...decoys].sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [currentFile, ...randomDecoys].sort(() => 0.5 - Math.random());
      setImageOptions(options);
    }
  }, [currentIndex, selectedMode, currentFile, shuffledCharacters]);

  // Auto-focus per input di testo
  useEffect(() => {
    if (selectedMode && selectedMode !== 'reverse' && !isAnswering && !gameOver) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, isAnswering, gameOver, selectedMode]);

  // Timer per Modalità Classica (10s), Reverse (5s) e Blur/Audio (15s)
  useEffect(() => {
    if (!selectedMode || selectedMode === 'timeattack' || gameOver || !currentFile || isAnswering) return;

    if (timeLeft === 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver, currentFile, isAnswering, selectedMode]);

  // Timer Globale per Time Attack (60 secondi in totale)
  useEffect(() => {
    if (selectedMode !== 'timeattack' || gameOver) return;

    if (globalTimeLeft === 0) {
      playSound('gameover');
      setGameOver(true);
      confetti({ particleCount: 150, spread: 80 });
      return;
    }

    const timer = setInterval(() => setGlobalTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [globalTimeLeft, gameOver, selectedMode]);

  const handleTimeOut = () => {
    setIsAnswering(true);
    playSound('error');
    const firstName = getFirstName(currentFile);
    setFeedback({ status: 'error', text: `Tempo scaduto! Era ${firstName}` });

    setTimeout(() => {
      setFeedback(null);
      setIsAnswering(false);
      processWrongAnswer();
    }, 1500);
  };

  const processWrongAnswer = () => {
    setHearts(prev => {
      const updated = prev - 1;
      if (updated <= 0) {
        playSound('gameover');
        setGameOver(true);
      } else {
        nextCharacter();
      }
      return updated;
    });
  };

  const nextCharacter = () => {
    setUserInput('');
    setTimeLeft(getRoundTime(selectedMode));
    if (currentIndex + 1 < shuffledCharacters.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameOver(true);
      playSound('success');
      confetti({ particleCount: 150, spread: 80 });
    }
  };

  // Risposta per Modalità Testuali
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const firstName = getFirstName(currentFile);
    const isCorrect = userInput.trim().toLowerCase() === firstName.toLowerCase();

    if (isCorrect) {
      playSound('success');
      const gainedScore = selectedMode === 'blur' ? Math.max(10, timeLeft * 2) : 10;
      setScore(prev => prev + gainedScore);
      setFeedback({ status: 'success', text: `Esatto! È ${firstName}! (+${gainedScore} pt)` });

      setTimeout(() => {
        setFeedback(null);
        setIsAnswering(false);
        nextCharacter();
      }, 1000);
    } else {
      playSound('error');
      if (selectedMode === 'timeattack') {
        setFeedback({ status: 'error', text: `Sbagliato! Era ${firstName}` });
        setTimeout(() => {
          setFeedback(null);
          setIsAnswering(false);
          nextCharacter();
        }, 800);
      } else {
        setFeedback({ status: 'error', text: `Sbagliato! Era ${firstName}` });
        setTimeout(() => {
          setFeedback(null);
          setIsAnswering(false);
          processWrongAnswer();
        }, 1500);
      }
    }
  };

  // Helper per calcolare l'indizio dinamico sul nome
  function getHintText(fileName, timeLeft, totalTime) {
    if (!fileName || totalTime <= 0) return '';
    const firstName = (fileName.substring(0, fileName.lastIndexOf('.')) || fileName).trim().split(/\s+/)[0];
    const cleanName = firstName.trim();
    const len = cleanName.length;
    const ratio = timeLeft / totalTime;

    if (ratio > 0.6) return null; // Nessun indizio nella prima fase del timer

    if (ratio > 0.3) {
      // Rivelazione lunghezza
      const blanks = cleanName.split('').map(() => '_').join(' ');
      return `💡 Indizio: ${len} lettere (${blanks})`;
    }

    // Rivelazione prima lettera + lettere ad indici fissi
    const revealed = cleanName.split('').map((char, i) => {
      if (i === 0 || i % 3 === 0) return char.toUpperCase();
      return '_';
    }).join(' ');

    return `💡 Indizio: ${len} lettere (${revealed})`;
  }

  // Risposta per Modalità Inversa (Click Immagine)
  const handleImageClick = (selectedFile) => {
    if (isAnswering) return;
    setIsAnswering(true);

    const firstName = getFirstName(currentFile);
    if (selectedFile === currentFile) {
      playSound('success');
      setScore(prev => prev + 10);
      setFeedback({ status: 'success', text: `Corretto!` });
      setTimeout(() => {
        setFeedback(null);
        setIsAnswering(false);
        nextCharacter();
      }, 1000);
    } else {
      playSound('error');
      setFeedback({ status: 'error', text: `Sbagliato! Quella non era ${firstName}` });
      setTimeout(() => {
        setFeedback(null);
        setIsAnswering(false);
        processWrongAnswer();
      }, 1500);
    }
  };

  // Pulsante Salta (Solo Time Attack)
  const handleSkip = () => {
    if (isAnswering) return;
    setUserInput('');
    nextCharacter();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-400">
        <Sparkles className="w-8 h-8 animate-spin" />
        <span className="ml-2 font-medium">Caricamento personaggi...</span>
      </div>
    );
  }

  // --- SCHERMATA SELEZIONE MODALITÀ ---
  if (!selectedMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2 text-indigo-400">Scegli Modalità di Gioco</h1>
          <p className="text-slate-400 text-sm">Metterai alla prova la tua conoscenza su {shuffledCharacters.length} personaggi!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectMode('classic')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-6 rounded-2xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Modalità Classica</h2>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded">10s per foto</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">3 cuori a disposizione. Guarda la foto e scrivi il nome del personaggio.</p>
          </button>

          <button
            onClick={() => handleSelectMode('reverse')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-6 rounded-2xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:scale-110 transition">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Trova l'Immagine</h2>
                <span className="text-[10px] font-bold bg-amber-950 text-amber-400 px-2 py-0.5 rounded">5s per foto</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Ti viene mostrato il nome in alto: seleziona l'immagine corretta tra le 4 proposte.</p>
          </button>

          <button
            onClick={() => handleSelectMode('blur')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-6 rounded-2xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:scale-110 transition">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Blur Challenge</h2>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded">15s per foto</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">L'immagine parte molto sfocata. Più velocemente indovini, più punti ottieni!</p>
          </button>

          <button
            onClick={() => handleSelectMode('timeattack')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500 p-6 rounded-2xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Time Attack 60s</h2>
                <span className="text-[10px] font-bold bg-rose-950 text-rose-400 px-2 py-0.5 rounded">60s totali</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">Niente vite! Hai 60 secondi totali per indovinare più personaggi possibili con tasto Salta.</p>
          </button>

          {/* Card Audio Modificata per Lingua */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left transition group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl group-hover:scale-110 transition">
                🎧
              </div>
              <div>
                <h2 className="text-lg font-bold">Anime Audio Quiz</h2>
                <span className="text-[10px] font-bold bg-purple-950 text-purple-400 px-2 py-0.5 rounded">15s per traccia</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">Ascolta l'audio e scrivi il nome del personaggio a cui appartiene.</p>
            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => handleSelectMode('audio', 'jp')}
                className="flex-1 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                🇯🇵 JP
              </button>
              <button
                onClick={() => handleSelectMode('audio', 'it')}
                className="flex-1 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                🇮🇹 IT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SCHERMATA GAME OVER ---
  if (gameOver) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          {hearts > 0 || selectedMode === 'timeattack' ? (
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-extrabold mb-1">
            {hearts > 0 || selectedMode === 'timeattack' ? 'Partita Finita!' : 'Game Over'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">Punteggio finale: <span className="text-indigo-400 font-bold">{score} pt</span></p>

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

  // Calcolo livello sfocatura per la Blur Challenge
  const currentBlur = selectedMode === 'blur' ? Math.max(0, (timeLeft / 15) * 20) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Tasto per cambiare modalità */}
      <button
        onClick={() => setSelectedMode(null)}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Cambia Modalità
      </button>

      {/* Header Statistiche */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 shadow-lg">
        {selectedMode === 'timeattack' ? (
          <span className="text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
            Time Attack Blitz
          </span>
        ) : (
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-6 h-6 transition-colors duration-300 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
            ))}
          </div>
        )}

        <div className="text-xl font-black text-indigo-400">Score: {score}</div>

        <div className={`flex items-center gap-2 font-bold ${(selectedMode === 'timeattack' ? globalTimeLeft : timeLeft) <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
          }`}>
          <Timer className="w-5 h-5" />
          {selectedMode === 'timeattack' ? `${globalTimeLeft}s` : `${timeLeft}s`}
        </div>
      </div>

      {/* Area di Gioco */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">

        {selectedMode === 'reverse' ? (
          <h2 className="text-2xl font-black text-white mb-6">
            Chi è <span className="text-indigo-400 underline">{getFirstName(currentFile)}</span>?
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-white mb-4">Chi è questo personaggio?</h2>
        )}

        {/* 1. Modalità Inversa (4 Foto) */}
        {selectedMode === 'reverse' ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {imageOptions.map((fileOpt, idx) => (
              <button
                key={idx}
                disabled={isAnswering}
                onClick={() => handleImageClick(fileOpt)}
                className="bg-slate-950/80 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl p-2 h-40 flex items-center justify-center transition cursor-pointer overflow-hidden disabled:opacity-50"
              >
                <img
                  src={`${SERVER_URL}/static/characters/${encodeURIComponent(fileOpt)}`}
                  alt="Opzione"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </button>
            ))}
          </div>
        ) : selectedMode === 'audio' ? (
          /* 2. Nuova Modalità Audio - Inclusa la Lingua nel Path */
          <div className="w-full h-64 bg-slate-950/80 rounded-2xl border-2 border-purple-500/40 p-6 mb-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-4 right-4 text-xs font-bold bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
              {audioLang === 'jp' ? '🇯🇵 JP' : '🇮🇹 IT'}
            </div>
            <div className="text-4xl mb-4 animate-bounce">🎵</div>
            {currentFile && (
              <audio
                key={currentFile}
                src={`${SERVER_URL}/static/audio/${audioLang}/${encodeURIComponent(currentFile)}`}
                autoPlay
                controls
                className="w-full"
              />
            )}
          </div>
        ) : (
          /* 3. Modalità Classica / Blur / Time Attack */
          <div className={`w-full h-80 bg-slate-950/80 rounded-2xl border-2 p-3 mb-6 flex items-center justify-center overflow-hidden relative transition-all duration-300 ${feedback?.status === 'success' ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' :
              feedback?.status === 'error' ? 'border-rose-500 shadow-lg shadow-rose-500/20' :
                'border-slate-800'
            }`}>
            <img
              src={`${SERVER_URL}/static/characters/${encodeURIComponent(currentFile)}`}
              alt="Indovina il personaggio"
              style={{ filter: `blur(${currentBlur}px)` }}
              className="max-h-full max-w-full object-contain rounded-lg drop-shadow-md transition-all duration-300"
            />
          </div>
        )}

        {/* Suggerimento Dinamico */}
        {(() => {
          const roundTime = getRoundTime(selectedMode);
          const hint = getHintText(currentFile, selectedMode === 'timeattack' ? globalTimeLeft : timeLeft, roundTime);
          return hint && !isAnswering ? (
            <div className="mb-4 py-2 px-4 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-indigo-300 text-xs font-mono font-bold tracking-wider animate-pulse text-center">
              {hint}
            </div>
          ) : null;
        })()}

        {/* Banner Feedback */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-xl text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${feedback.status === 'success'
            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
            }`}>
            {feedback.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Input Form */}
        {selectedMode !== 'reverse' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              disabled={isAnswering}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Scrivi solo il nome..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-lg font-bold focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isAnswering || !userInput.trim()}
                className="flex-grow bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Indovina
              </button>

              {selectedMode === 'timeattack' && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isAnswering}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold px-5 py-4 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <FastForward className="w-5 h-5" /> Salta
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}