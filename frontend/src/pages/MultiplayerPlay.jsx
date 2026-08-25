import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../api/socket';
import { SERVER_URL } from '../api/client';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Flame, Sparkles } from 'lucide-react';

export default function MultiplayerPlay() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const gameData = state?.gameData || {};
  const roomCode = gameData.roomCode;
  const mode = gameData.mode;
const [audioLang, setAudioLang] = useState(gameData.audioLang || 'jp');
  const [currentQuestion, setCurrentQuestion] = useState(gameData.currentQuestion || null);
  const [currentIndex, setCurrentIndex] = useState(gameData.currentIndex || 0);
  const [totalRounds, setTotalRounds] = useState(gameData.total || 10);
  const [players, setPlayers] = useState(gameData.players || []);
  const [timeLeft, setTimeLeft] = useState(gameData.timeLeft || 15);
  const [winnerMessage, setWinnerMessage] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [kahootInput, setKahootInput] = useState('');
  const [roundLocked, setRoundLocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [gameOverPlayers, setGameOverPlayers] = useState(null);
  const [isEmojiOnCooldown, setIsEmojiOnCooldown] = useState(false);
const EMOJI_SOUNDS = {
  '😱': '/sounds/nani.mp3',
  '🔥': '/sounds/boom.mp3',
  '🎉': '/sounds/tada.mp3',
  '👏': '/sounds/clap.mp3',
  '💀': '/sounds/fail.mp3',
  '💩': '/sounds/fail2.mp3',
};

const playEmojiSound = (emoji) => {
  const soundPath = EMOJI_SOUNDS[emoji];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.volume = 0.6; // Mantiene un volume gradevole per non sovraccaricare l'audio
    audio.play().catch(e => console.log('Audio blocked by browser policy:', e));
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

const sendEmojiWithCooldown = (emoji) => {
  if (isEmojiOnCooldown) return;
  sendEmoji(emoji);
  setIsEmojiOnCooldown(true);
  setTimeout(() => setIsEmojiOnCooldown(false), 600);
};
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
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
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!roomCode) {
      navigate('/multiplayer');
      return;
    }

const handleNextQuestion = ({ currentQuestion, currentIndex, total, timeLeft, players, audioLang }) => {
  if (audioLang) setAudioLang(audioLang);
  setCurrentQuestion(currentQuestion);
  if (currentIndex !== undefined) setCurrentIndex(currentIndex);
  if (total) setTotalRounds(total);
  setTimeLeft(timeLeft);
  setPlayers(players);
  setWinnerMessage(null);
  setUserInput('');
  setKahootInput('');
  setRoundLocked(false);
};

    const handleTimerTick = ({ timeLeft }) => setTimeLeft(timeLeft);

    const handleRoundStolen = ({ winnerName, correctName, pointsGained, players }) => {
      setWinnerMessage(`🏆 ${winnerName} ha risposto correttamente! Era ${correctName} (+${pointsGained} pt)`);
      setPlayers(players);
      setRoundLocked(true);
      playSound('win');
    };

    const handleRoundEnded = ({ correctAnswer, players }) => {
      setRoundLocked(true);
      setPlayers(players);
      setWinnerMessage(`Tempo scaduto! Risposta corretta: ${correctAnswer}`);
    };

    const handleAnswerFeedback = ({ correct }) => {
      if (correct) playSound('correct');
      else playSound('error');
    };

    const handleGuessError = ({ seconds }) => {
      playSound('error');
      setCooldown(seconds);
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

const handlePlayerReaction = (reaction) => {
  const id = Date.now() + Math.random();
  setReactions(prev => [...prev, { ...reaction, id }]);
  
  // Riproduci l'audio corretto associato all'emoji ricevuta
  playEmojiSound(reaction.emoji);

  setTimeout(() => {
    setReactions(prev => prev.filter(r => r.id !== id));
  }, 2500);
};

    const handleScoreUpdated = (updatedPlayers) => setPlayers(updatedPlayers);

    const handleGameOver = (finalPlayers) => {
      setGameOverPlayers(finalPlayers);
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
      playSound('win');
    };

    socket.on('next_question_ready', handleNextQuestion);
    socket.on('timer_tick', handleTimerTick);
    socket.on('round_stolen', handleRoundStolen);
    socket.on('round_ended', handleRoundEnded);
    socket.on('answer_feedback', handleAnswerFeedback);
    socket.on('guess_error', handleGuessError);
    socket.on('player_reaction', handlePlayerReaction);
    socket.on('score_updated', handleScoreUpdated);
    socket.on('game_over', handleGameOver);

    return () => {
      socket.off('next_question_ready', handleNextQuestion);
      socket.off('timer_tick', handleTimerTick);
      socket.off('round_stolen', handleRoundStolen);
      socket.off('round_ended', handleRoundEnded);
      socket.off('answer_feedback', handleAnswerFeedback);
      socket.off('guess_error', handleGuessError);
      socket.off('player_reaction', handlePlayerReaction);
      socket.off('score_updated', handleScoreUpdated);
      socket.off('game_over', handleGameOver);
    };
  }, [roomCode, navigate]);

  const handleFastestFingerSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || roundLocked || cooldown > 0) return;
    socket.emit('submit_fastest_finger_guess', { roomCode, guess: userInput });
  };

  const handleKahootOptionSelect = (optionText) => {
    if (roundLocked) return;
    setRoundLocked(true);
    socket.emit('submit_kahoot_answer', { roomCode, answer: optionText });
  };

  const handleKahootInputSubmit = (e) => {
    e.preventDefault();
    if (roundLocked || !kahootInput.trim()) return;
    setRoundLocked(true);
    socket.emit('submit_kahoot_answer', { roomCode, answer: kahootInput.trim() });
  };

  const sendEmoji = (emoji) => {
    socket.emit('send_reaction', { roomCode, emoji });
  };

  const getCharacterFilename = (q) => {
    if (!q) return null;
    if (typeof q === 'string') return q;
    if (typeof q === 'object' && q.image) return q.image;
    return null;
  };

  if (gameOverPlayers) {
    const top3 = gameOverPlayers.slice(0, 3);
    return (
      <div className="max-w-xl mx-auto my-8 px-4 text-white text-center">
        <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-2 animate-bounce" />
        <h1 className="text-3xl font-extrabold mb-6">Classifica Finale</h1>

        <div className="flex justify-center items-end gap-3 mb-8 h-64">
          {top3[1] && (
            <div className="flex flex-col items-center w-1/3">
              <img src={`${SERVER_URL}/static/characters/${encodeURIComponent(top3[1].avatar)}`} className="w-12 h-12 rounded-full border-2 border-slate-300 object-cover mb-1" />
              <span className="text-xs font-bold truncate max-w-full">{top3[1].name}</span>
              <span className="text-[10px] text-slate-400 mb-1">{top3[1].score} pt</span>
              <div className="w-full bg-slate-700 h-32 rounded-t-2xl flex items-center justify-center font-black text-xl border-t-4 border-slate-300">2</div>
            </div>
          )}

          {top3[0] && (
            <div className="flex flex-col items-center w-1/3">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <img src={`${SERVER_URL}/static/characters/${encodeURIComponent(top3[0].avatar)}`} className="w-16 h-16 rounded-full border-4 border-amber-400 object-cover mb-1 shadow-lg shadow-amber-500/50" />
              <span className="text-sm font-black truncate max-w-full text-amber-300">{top3[0].name}</span>
              <span className="text-xs text-amber-400 font-bold mb-1">{top3[0].score} pt</span>
              <div className="w-full bg-amber-600 h-44 rounded-t-2xl flex items-center justify-center font-black text-2xl border-t-4 border-amber-300 shadow-xl">1</div>
            </div>
          )}

          {top3[2] && (
            <div className="flex flex-col items-center w-1/3">
              <img src={`${SERVER_URL}/static/characters/${encodeURIComponent(top3[2].avatar)}`} className="w-12 h-12 rounded-full border-2 border-amber-700 object-cover mb-1" />
              <span className="text-xs font-bold truncate max-w-full">{top3[2].name}</span>
              <span className="text-[10px] text-slate-400 mb-1">{top3[2].score} pt</span>
              <div className="w-full bg-amber-900/80 h-24 rounded-t-2xl flex items-center justify-center font-black text-xl border-t-4 border-amber-700">3</div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/multiplayer')} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer">
          Torna alla Lobby
        </button>
      </div>
    );
  }

  const blurPx = mode === 'BLUR_DUEL' ? Math.max(0, (timeLeft / 15) * 20) : 0;
  const currentCharFile = getCharacterFilename(currentQuestion);
  const progressPercent = Math.min(100, Math.max(0, ((currentIndex + 1) / totalRounds) * 100));

  const isKahootInput = currentQuestion?.type === 'SHORT_ANSWER' || 
    (currentQuestion?.type !== 'BOOLEAN' && (!currentQuestion?.options || currentQuestion.options.length === 0));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 text-white relative">
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map(r => (
          <div key={r.id} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold">
            <span>{r.playerName}:</span>
            <span className="text-2xl">{r.emoji}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {players.map((p, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 shrink-0">
            {p.avatar && <img src={`${SERVER_URL}/static/characters/${encodeURIComponent(p.avatar)}`} className="w-6 h-6 rounded-full object-cover" />}
            <div>
              <span className="font-bold block text-slate-200">{p.name}</span>
              <span className="text-indigo-400 font-extrabold">{p.score} pt</span>
            </div>
            {p.streak > 1 && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400" /> {p.streak}x
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl mb-4">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-400 uppercase tracking-wider">Modalità: <span className="text-indigo-400">{mode}</span></span>
          <span className="text-indigo-400 font-extrabold">Round {currentIndex + 1} di {totalRounds}</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3.5 rounded-2xl mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase">Tempo Rimanente</span>
        <div className={`flex items-center gap-1.5 font-black text-lg ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
          <Timer className="w-5 h-5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
        {winnerMessage && (
          <div className="mb-4 p-3 bg-indigo-950/80 border border-indigo-800 text-indigo-300 rounded-2xl font-bold text-sm">
            {winnerMessage}
          </div>
        )}

        {(mode === 'FASTEST_FINGER' || mode === 'BLUR_DUEL' || mode === 'AUDIO_DUEL') && (
<div>
    <h2 className="text-lg font-bold mb-3">
      {mode === 'AUDIO_DUEL' ? 'Ascolta e indovina per primo!' : 'Indovina per primo!'}
    </h2>

    {mode === 'AUDIO_DUEL' ? (
      <div className="w-full h-48 bg-slate-950 rounded-2xl mb-4 flex flex-col items-center justify-center p-6 border border-purple-500/40 shadow-lg shadow-purple-500/10">
        <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mb-3 animate-pulse">
          🔊
        </div>
{currentCharFile && (
  <audio
    key={`${audioLang}-${currentCharFile}`}
    src={`${SERVER_URL}/static/audio/${audioLang}/${encodeURIComponent(currentCharFile)}`}
    autoPlay
    controls
    className="w-full max-w-md mt-2"
  />
)}
      </div>
    ) : (
      /* Immagine per FASTEST_FINGER / BLUR_DUEL */
            <div className="w-full h-72 bg-slate-950 rounded-2xl mb-4 flex items-center justify-center p-2 border border-slate-800 overflow-hidden">
              {currentCharFile ? (
                <img
                  key={currentCharFile}
                  src={`${SERVER_URL}/static/characters/${encodeURIComponent(currentCharFile)}`}
                  alt="Personaggio"
                  style={{ filter: `blur(${blurPx}px)` }}
                  className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300"
                />
              ) : (
                <span className="text-slate-500 text-sm font-medium">Caricamento immagine...</span>
              )}
            </div> 
          )}
{/* Suggerimento Dinamico Multiplayer */}
{(() => {
  const maxTime = gameData.timerDuration || 15;
  const hint = getHintText(currentCharFile, timeLeft, maxTime);
  return hint && !roundLocked ? (
    <div className="my-3 py-2 px-4 bg-purple-950/60 border border-purple-800/80 rounded-xl text-purple-300 text-xs font-mono font-bold tracking-wider animate-pulse text-center">
      {hint}
    </div>
  ) : null;
})()}
            <form onSubmit={handleFastestFingerSubmit} className="flex gap-2">
              <input
                type="text"
                disabled={roundLocked || cooldown > 0}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={cooldown > 0 ? `Bloccato per ${cooldown}s...` : "Scrivi il nome..."}
                className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={roundLocked || cooldown > 0 || !userInput.trim()}
                className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition cursor-pointer"
              >
                Invia
              </button>
            </form>
          </div>
        )}

        {/* MODALITÀ KAHOOT CON SUPPORTO A TUTTI I TIPI DI DOMANDA */}
      {mode === 'KAHOOT' && currentQuestion && (
          <div>
            <div className="flex justify-center items-center gap-2 mb-3 flex-wrap">
              {currentQuestion.section?.title && (
                <span className="text-[10px] font-extrabold bg-amber-950/80 text-amber-400 border border-amber-800/80 px-3 py-1 rounded-full uppercase tracking-wide">
                  Anime: {currentQuestion.section.title}
                </span>
              )}
              <span className="text-[10px] font-bold bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 px-2.5 py-1 rounded-full uppercase">
                {currentQuestion.type || 'MULTIPLE_CHOICE'}
              </span>
            </div>

            <h2 className="text-xl font-extrabold mb-6 text-slate-100">{currentQuestion.questionText}</h2>

            {/* CASO 1: Risposta Aperta (Input di Testo) */}
            {isKahootInput ? (
              <form onSubmit={handleKahootInputSubmit} className="space-y-3 mb-4">
                <input
                  type="text"
                  disabled={roundLocked}
                  value={kahootInput}
                  onChange={(e) => setKahootInput(e.target.value)}
                  placeholder="Scrivi qui la tua risposta..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={roundLocked || !kahootInput.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Invia Risposta
                </button>
              </form>
            ) : currentQuestion.type === 'BOOLEAN' ? (
              /* CASO 2: Vero o Falso */
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['Vero', 'Falso'].map((opt) => (
                  <button
                    key={opt}
                    disabled={roundLocked}
                    onClick={() => handleKahootOptionSelect(opt)}
                    className="bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 p-4 rounded-2xl text-center font-bold border border-slate-700 transition cursor-pointer text-lg"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              /* CASO 3: Scelta Multipla / Who Said */
              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentQuestion.options?.map((opt, i) => (
                  <button
                    key={i}
                    disabled={roundLocked}
                    onClick={() => handleKahootOptionSelect(opt.text)}
                    className="bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 p-4 rounded-2xl text-left font-bold border border-slate-700 transition cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

<div className="mt-6 pt-4 border-t border-slate-800 flex justify-center gap-3">
  {['🔥', '💀', '😱', '🎉', '👏', '💩'].map((emoji, idx) => (
    <button
      key={idx}
      onClick={() => sendEmojiWithCooldown(emoji)}
      className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl text-xl transition transform hover:scale-125 cursor-pointer"
    >
      {emoji}
    </button>
  ))}
</div>
      </div>
    </div>
  );
}