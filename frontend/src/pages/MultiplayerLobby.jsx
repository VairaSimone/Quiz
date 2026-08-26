import React, { useState, useEffect } from 'react';
import { socket } from '../api/socket';
import { useNavigate } from 'react-router-dom';
import API, { SERVER_URL } from '../api/client';

export default function MultiplayerLobby() {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('playerAvatar') || null);

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();
  const [timerDuration, setTimerDuration] = useState(15);
  const [totalRounds, setTotalRounds] = useState(10);
  const [audioLang, setAudioLang] = useState('jp'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleNameChange = (name) => {
    setPlayerName(name);
    localStorage.setItem('playerName', name);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    localStorage.setItem('playerAvatar', avatar);
  };

  useEffect(() => {
    let isMounted = true;

    API.get('/quiz/characters')
      .then(res => {
        if (isMounted && res.data.data.length > 0) {
          setCharacters(res.data.data);
          const savedAvatar = localStorage.getItem('playerAvatar');
          if (!savedAvatar || !res.data.data.includes(savedAvatar)) {
            setSelectedAvatar(res.data.data[0]);
            localStorage.setItem('playerAvatar', res.data.data[0]);
          }
        }
      })
      .catch(console.error);

    if (!socket.connected) socket.connect();

    const handleRoomCreated = ({ room }) => {
      setActiveRoom(room);
      setIsHost(true);
    };

    const handleJoinedSuccessfully = ({ room }) => {
      setActiveRoom(room);
      setIsHost(false);
    };

    const handlePlayerListUpdated = (players) => {
      setActiveRoom(prev => prev ? { ...prev, players } : null);
    };

    const handleErrorMsg = (msg) => alert(msg);

    const handleGameStarted = (data) => {
      navigate('/multiplayer-play', { state: { gameData: data } });
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('joined_successfully', handleJoinedSuccessfully);
    socket.on('player_list_updated', handlePlayerListUpdated);
    socket.on('error_msg', handleErrorMsg);
    socket.on('game_started', handleGameStarted);

    return () => {
      isMounted = false; 
      socket.off('room_created', handleRoomCreated);
      socket.off('joined_successfully', handleJoinedSuccessfully);
      socket.off('player_list_updated', handlePlayerListUpdated);
      socket.off('error_msg', handleErrorMsg);
      socket.off('game_started', handleGameStarted);
    };
  }, [navigate]);

  const handleCreateRoom = (mode) => {
    if (!playerName.trim()) return alert('Inserisci un nickname!');
    socket.emit('create_room', {
      mode,
      playerName,
      avatar: selectedAvatar,
      timerDuration,
      totalRounds,
      audioLang
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCodeInput.trim()) return alert('Inserisci nickname e codice!');
    socket.emit('join_room', { roomCode: roomCodeInput, playerName, avatar: selectedAvatar });
  };

  const handleStartGame = () => {
    socket.emit('start_game', { roomCode: activeRoom.code });
  };

  if (activeRoom) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-1">Stanza: <span className="text-indigo-400 font-black text-3xl">{activeRoom.code}</span></h2>
        <p className="text-xs text-slate-400 mb-6">Condividi questo codice per far accedere gli amici</p>

        <div className="bg-slate-800/80 p-4 rounded-2xl mb-6 text-left border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Giocatori Connessi ({activeRoom.players.length})</h3>
          <ul className="space-y-2">
            {activeRoom.players.map((p, i) => (
              <li key={i} className="bg-slate-900 px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-3">
                  {p.avatar ? (
                    <img 
                      src={`${SERVER_URL}/static/characters/${encodeURIComponent(p.avatar)}`} 
                      alt="Avatar" 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150/4f46e5/ffffff?text=?'; }}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">?</div>
                  )}
                  <span>{p.name}</span>
                </div>
                {i === 0 && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/30">HOST</span>}
              </li>
            ))}
          </ul>
        </div>

        {isHost ? (
          <button onClick={handleStartGame} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold cursor-pointer transition shadow-lg shadow-indigo-600/30">
            Avvia Partita per Tutti
          </button>
        ) : (
          <p className="text-sm text-indigo-400 animate-pulse font-medium">In attesa che l'host avvii la partita...</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white shadow-2xl">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-indigo-400">Multiplayer Party</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Il tuo Nickname</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="es. OtakuKing"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Avatar Selezionato</label>
          
          <div className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
            {selectedAvatar ? (
              <img 
                src={`${SERVER_URL}/static/characters/${encodeURIComponent(selectedAvatar)}`} 
                alt="Selected Avatar" 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150/4f46e5/ffffff?text=?'; }}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold">?</div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-200">
                {selectedAvatar ? selectedAvatar.replace(/\.[^/.]+$/, "") : "Nessuno"}
              </p>
              <p className="text-[10px] text-slate-400">Clicca per cambiare tra 150+ PG</p>
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Sfoglia Tutti
            </button>
          </div>

          {isAvatarModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col p-5 shadow-2xl">
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-lg text-indigo-400">Scegli il tuo Avatar</h3>
                  <button 
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-lg px-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Cerca personaggio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="overflow-y-auto pr-1 grid grid-cols-4 gap-3 scrollbar-thin">
                  {characters
                    .filter((char) => char.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((char, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          handleAvatarSelect(char);
                          setIsAvatarModalOpen(false);
                        }}
                        className={`relative group flex flex-col items-center p-1.5 rounded-2xl border-2 transition cursor-pointer ${
                          selectedAvatar === char 
                            ? 'border-indigo-500 bg-indigo-500/10 scale-105' 
                            : 'border-slate-800 hover:border-slate-600 bg-slate-800/50'
                        }`}
                      >
                        <img 
                          src={`${SERVER_URL}/static/characters/${encodeURIComponent(char)}`} 
                          alt={char} 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150/4f46e5/ffffff?text=?'; }}
                          loading="lazy"
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                        <span className="text-[9px] font-bold mt-1 text-slate-300 truncate w-full text-center">
                          {char.replace(/\.[^/.]+$/, "")}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/60 p-4 rounded-2xl mb-6 border border-slate-700/80 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regole Partita Custom</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Timer per Round</label>
            <select 
              value={timerDuration} 
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 focus:outline-none"
            >
              <option value={5}>5 Secondi</option>
              <option value={10}>10 Secondi</option>
              <option value={15}>15 Secondi</option>
              <option value={30}>30 Secondi</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Numero Round</label>
            <select 
              value={totalRounds} 
              onChange={(e) => setTotalRounds(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-indigo-400 focus:outline-none"
            >
              <option value={5}>5 Round</option>
              <option value={10}>10 Round</option>
              <option value={20}>20 Round</option>
              <option value="ENDLESS">Endless (Tutte)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <label className="block text-[11px] font-semibold text-slate-300 mb-2">Lingua Audio (Audio Quiz)</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAudioLang('jp')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                audioLang === 'jp' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 border border-slate-700'
              }`}
            >
              🇯🇵 Giapponese
            </button>
            <button
              type="button"
              onClick={() => setAudioLang('it')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                audioLang === 'it' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 border border-slate-700'
              }`}
            >
              🇮🇹 Italiano
            </button>
          </div>
        </div>
      </div>

      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Crea Stanza Modalità</label>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button onClick={() => handleCreateRoom('KAHOOT')} className="bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center">
          Kahoot
        </button>
        <button onClick={() => handleCreateRoom('FASTEST_FINGER')} className="bg-rose-600 hover:bg-rose-500 p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center">
          Duello PG
        </button>
        <button onClick={() => handleCreateRoom('BLUR_DUEL')} className="bg-amber-600 hover:bg-amber-500 p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center">
          Blur Duel
        </button>
        <button onClick={() => handleCreateRoom('AUDIO_DUEL')} className="bg-purple-600 hover:bg-purple-500 p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center">
          Audio Quiz
        </button>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Entra con Codice</label>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
            placeholder="Codice 6 cifre"
            className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-center font-bold tracking-widest"
          />
          <button onClick={handleJoinRoom} className="bg-emerald-600 hover:bg-emerald-500 px-5 rounded-xl text-xs font-bold transition cursor-pointer">
            Entra
          </button>
        </div>
      </div>
    </div>
  );
}