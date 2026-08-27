// frontend/src/pages/CharacterQuestions.jsx
import React, { useState, useEffect, useRef } from 'react';
import { SERVER_URL } from '../api/client';
import { QUESTIONS } from '../data/truthQuestions';
import { RefreshCcw, Volume2 } from 'lucide-react';

export default function CharacterQuestions() {
  const [charactersList, setCharactersList] = useState([]);
  const [audioList, setAudioList] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [audioTarget, setAudioTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(new Audio());

  const formatName = (filename) => {
    return filename.replace(/\.(jpg|jpeg|png|webp|mp3|wav|ogg)$/i, '').replace(/\s*\(.*?\)\s*/, '');
  };

  // Carica le liste dinamiche dal backend all'inizio
  useEffect(() => {
    fetch(`${SERVER_URL}/api/game-media`)
      .then((res) => res.json())
      .then((data) => {
        setCharactersList(data.characters || []);
        setAudioList(data.audioFiles || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Errore nel caricamento dei media:", err);
        setLoading(false);
      });

    return () => audioRef.current.pause();
  }, []);

  const generateNext = () => {
    if (charactersList.length === 0) return;

    // 1. Pesca il personaggio principale
    const randomChar = charactersList[Math.floor(Math.random() * charactersList.length)];
    setCurrentCharacter(randomChar);

    // 2. Pesca la domanda
    const selectedQuestion = { ...QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)] };

    // 3. Rimpiazza {{PG}} se presente
    if (selectedQuestion.text.includes("{{PG}}")) {
      let randomOther = randomChar;
      while (randomOther === randomChar && charactersList.length > 1) {
        randomOther = charactersList[Math.floor(Math.random() * charactersList.length)];
      }
      selectedQuestion.text = selectedQuestion.text.replace("{{PG}}", formatName(randomOther));
    }

    // 4. Gestione Audio
    if (selectedQuestion.isAudio && audioList.length > 0) {
      const randomAudio = audioList[Math.floor(Math.random() * audioList.length)];
      setAudioTarget(randomAudio);
      audioRef.current.src = `${SERVER_URL}/static/audio/it/${randomAudio}`;
      audioRef.current.play().catch(() => {});
    } else {
      setAudioTarget(null);
      audioRef.current.pause();
    }

    setCurrentQuestion(selectedQuestion);
  };

  // Genera la prima domanda appena i dati sono caricati
  useEffect(() => {
    if (!loading && charactersList.length > 0) {
      generateNext();
    }
  }, [loading]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Caricamento domande...</div>;
  }

  if (!currentCharacter || !currentQuestion) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="relative h-96 bg-slate-800">
          <img 
            src={`${SERVER_URL}/static/characters/${currentCharacter}`} 
            alt="Character" 
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900 to-transparent h-32"></div>
          <div className="absolute bottom-4 left-0 w-full text-center px-4">
            <span className="bg-indigo-600/90 text-indigo-50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Tocca a rispondere a
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">{formatName(currentCharacter)}</h2>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center flex-grow">
          <p className="text-xl md:text-2xl font-semibold text-slate-200 leading-relaxed mb-6">
            "{currentQuestion.text}"
          </p>

          {currentQuestion.isAudio && audioTarget && (
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl w-full mb-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-slate-400 font-semibold uppercase">Voce estratta:</p>
                <p className="text-indigo-400 font-bold text-lg">{formatName(audioTarget)}</p>
              </div>
              <button 
                onClick={() => { audioRef.current.currentTime = 0; audioRef.current.play(); }}
                className="bg-indigo-600 p-3 rounded-full"
              >
                <Volume2 className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <button 
            onClick={generateNext}
            className="mt-auto w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Avanti <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}