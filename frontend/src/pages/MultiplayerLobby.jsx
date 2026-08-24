import React, { useState, useEffect } from 'react';
import { socket } from '../api/socket';
import { useNavigate } from 'react-router-dom';
import API, { SERVER_URL } from '../api/client';

export default function MultiplayerLobby() {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const navigate = useNavigate();
  const [timerDuration, setTimerDuration] = useState(15);
  const [totalRounds, setTotalRounds] = useState(10);
  useEffect(() => {
    // Carica personaggi per la scelta dell'Avatar
    API.get('/quiz/characters')
      .then(res => {
        if (res.data.data.length > 0) {
          setCharacters(res.data.data);
          setSelectedAvatar(res.data.data[0]);
        }
      })
      .catch(console.error);

    if (!socket.connected) socket.connect();

    socket.on('room_created', ({ room }) => {
      setActiveRoom(room);
      setIsHost(true);
    });

    socket.on('joined_successfully', ({ room }) => {
      setActiveRoom(room);
      setIsHost(false);
    });

    socket.on('player_list_updated', (players) => {
      setActiveRoom(prev => prev ? { ...prev, players } : null);
    });

    socket.on('error_msg', (msg) => alert(msg));

    socket.on('game_started', (data) => {
      if (playerName.trim()) localStorage.setItem('playerName', playerName.trim());
      navigate('/multiplayer-play', { state: { gameData: data, isHost } });
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_successfully');
      socket.off('player_list_updated');
      socket.off('error_msg');
      socket.off('game_started');
    };
  }, [navigate, isHost, playerName]);

  const handleCreateRoom = (mode) => {
    if (!playerName.trim()) return alert('Inserisci un nickname!');
    socket.emit('create_room', {
      mode,
      playerName,
      avatar: selectedAvatar,
      timerDuration,
      totalRounds
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
                    <img src={`${SERVER_URL}/uploads/characters/${encodeURIComponent(p.avatar)}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-indigo-500" />
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
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="es. OtakuKing"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Selezione Avatar */}
        {characters.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Scegli Avatar</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {characters.slice(0, 15).map((char, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(char)}
                  className={`relative shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition cursor-pointer ${selectedAvatar === char ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/50' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={`${SERVER_URL}/uploads/characters/${encodeURIComponent(char)}`} alt="Avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Crea Stanza Modalità</label>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button onClick={() => handleCreateRoom('KAHOOT')} className="bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer text-center">
          Kahoot
        </button>
        <button onClick={() => handleCreateRoom('FASTEST_FINGER')} className="bg-rose-600 hover:bg-rose-500 p-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer text-center">
          Duello PG
        </button>
        <button onClick={() => handleCreateRoom('BLUR_DUEL')} className="bg-amber-600 hover:bg-amber-500 p-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer text-center">
          Blur Duel
        </button>
        <button onClick={() => handleCreateRoom('AUDIO_DUEL')} className="bg-purple-600 hover:bg-purple-500 p-2.5 rounded-xl text-[11px] font-bold transition cursor-pointer text-center">
          Audio Quiz
        </button>
      </div>
{/* Personalizzazione Regole Stanza */}
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