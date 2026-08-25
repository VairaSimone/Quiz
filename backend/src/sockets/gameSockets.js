const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const rooms = new Map();
const MAX_ROUNDS = 10; // Limite fisso di 10 round casuali per partita

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getFirstName(filename) {
  if (!filename) return '';
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return nameWithoutExt.trim().split(/\s+/)[0];
}

function clearRoomTimers(room) {
  if (!room) return;
  if (room.timer) {
    clearInterval(room.timer);
    room.timer = null;
  }
  if (room.roundTimeout) {
    clearTimeout(room.roundTimeout);
    room.roundTimeout = null;
  }
}

module.exports = function setupGameSockets(io) {

  function startRoundTimer(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  clearRoomTimers(room);

  if (room.currentIndex >= room.questions.length) {
    room.status = 'ENDED';
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    io.to(roomCode).emit('game_over', sortedPlayers);
    return;
  }

  room.timeLeft = room.timerDuration || 15; // Usa il timer personalizzato della stanza
  room.status = 'PLAYING';
  room.lockedRound = false;

  room.players.forEach(p => {
    p.hasAnswered = false;
    p.cooldownUntil = 0;
  });

  const currentQ = room.questions[room.currentIndex];

  io.to(roomCode).emit('next_question_ready', {
    currentQuestion: currentQ,
    currentIndex: room.currentIndex,
    total: room.questions.length,
    timeLeft: room.timeLeft,
    timerDuration: room.timerDuration,
    players: room.players
  });

    room.timer = setInterval(() => {
      const liveRoom = rooms.get(roomCode);
      if (!liveRoom || liveRoom.status !== 'PLAYING') {
        clearRoomTimers(liveRoom);
        return;
      }

      liveRoom.timeLeft -= 1;

      if (liveRoom.timeLeft <= 0) {
        clearRoomTimers(liveRoom);
        endRound(roomCode);
      } else {
        io.to(roomCode).emit('timer_tick', { timeLeft: liveRoom.timeLeft });
      }
    }, 1000);
  }

  function endRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room || room.status === 'ROUND_REVEAL' || room.status === 'ENDED') return;

    room.status = 'ROUND_REVEAL';
    clearRoomTimers(room);

    let correctAnswerText = '';
    const currentQ = room.questions[room.currentIndex];

    if (room.mode === 'KAHOOT') {
      correctAnswerText = currentQ ? currentQ.correctAnswer : '';
      room.players.forEach(p => {
        if (!p.hasAnswered) p.streak = 0;
      });
    } else {
      correctAnswerText = getFirstName(currentQ);
    }

    io.to(roomCode).emit('round_ended', {
      correctAnswer: correctAnswerText,
      players: room.players,
      currentIndex: room.currentIndex,
      total: room.questions.length
    });

    room.roundTimeout = setTimeout(() => {
      const liveRoom = rooms.get(roomCode);
      if (!liveRoom || liveRoom.status === 'ENDED') return;

      liveRoom.currentIndex += 1;

      if (liveRoom.currentIndex >= liveRoom.questions.length) {
        liveRoom.status = 'ENDED';
        const sortedPlayers = [...liveRoom.players].sort((a, b) => b.score - a.score);
        io.to(roomCode).emit('game_over', sortedPlayers);
      } else {
        startRoundTimer(roomCode);
      }
    }, 4000);
  }

  io.on('connection', (socket) => {

// backend/src/sockets/gameSockets.js

socket.on('create_room', async ({ mode, sectionId, playerName, avatar, timerDuration = 15, totalRounds = 10 }) => {
  const roomCode = generateRoomCode();
  let questions = [];

  if (mode === 'KAHOOT') {
    const queryOptions = sectionId
      ? { where: { sectionId }, include: { options: true, section: { select: { title: true } } } }
      : { include: { options: true, section: { select: { title: true } } } };
    questions = await prisma.question.findMany(queryOptions);
  } else if (mode === 'FASTEST_FINGER' || mode === 'BLUR_DUEL') {
    const charDir = path.join(__dirname, '../../static/characters');
    if (fs.existsSync(charDir)) {
      questions = fs.readdirSync(charDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
    }
  } else if (mode === 'AUDIO_DUEL') {
    const audioDir = path.join(__dirname, '../../static/audio');
    if (fs.existsSync(audioDir)) {
      questions = fs.readdirSync(audioDir).filter(f => /\.(mp3|wav|ogg|m4a|aac)$/i.test(f));
    }
  }

  if (questions.length === 0) {
    return socket.emit('error_msg', 'Nessuna domanda o personaggio disponibile per questa modalità');
  }

  // Se totalRounds è 'ENDLESS' (o 999), usiamo tutte le domande disponibili senza limitarle a 10
  const maxLimit = totalRounds === 'ENDLESS' ? questions.length : Math.min(Number(totalRounds), questions.length);
  questions = questions.sort(() => 0.5 - Math.random()).slice(0, maxLimit);

  const selectedTimer = Number(timerDuration) || 15;

  const newRoom = {
    code: roomCode,
    mode,
    hostId: socket.id,
    status: 'LOBBY',
    currentIndex: 0,
    questions,
    players: [{ id: socket.id, name: playerName, avatar, score: 0, streak: 0, hasAnswered: false, cooldownUntil: 0 }],
    lockedRound: false,
    timer: null,
    roundTimeout: null,
    timerDuration: selectedTimer,
    timeLeft: selectedTimer
  };

  rooms.set(roomCode, newRoom);
  socket.join(roomCode);
  socket.emit('room_created', { roomCode, room: newRoom });
});

    socket.on('join_room', ({ roomCode, playerName, avatar }) => {
      const room = rooms.get(roomCode);
      if (!room) return socket.emit('error_msg', 'Stanza non trovata');
      if (room.status !== 'LOBBY') return socket.emit('error_msg', 'Partita già iniziata');

      room.players.push({ id: socket.id, name: playerName, avatar, score: 0, streak: 0, hasAnswered: false, cooldownUntil: 0 });
      socket.join(roomCode);

      io.to(roomCode).emit('player_list_updated', room.players);
      socket.emit('joined_successfully', { roomCode, room });
    });

    socket.on('start_game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id || room.status !== 'LOBBY') return;

      room.currentIndex = 0;
      io.to(roomCode).emit('game_started', {
        roomCode: room.code,
        mode: room.mode,
        total: room.questions.length,
        currentIndex: 0,
        currentQuestion: room.questions[0],
        players: room.players,
        timeLeft: 15
      });

      startRoundTimer(roomCode);
    });

    socket.on('submit_kahoot_answer', ({ roomCode, answer }) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== 'PLAYING') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.hasAnswered) return;

      player.hasAnswered = true;
      const q = room.questions[room.currentIndex];

      const normUser = answer.toLowerCase().trim();
      const normCorrect = q ? q.correctAnswer.toLowerCase().trim() : '';

      // Confronto esatto o contenimento della stringa
      const isCorrect = normUser === normCorrect || (normCorrect.length > 0 && normCorrect.includes(normUser));

      if (isCorrect) {
        player.streak += 1;
        const multiplier = 1 + Math.min(player.streak - 1, 3) * 0.25;
        const basePoints = 500 + (room.timeLeft * 30);
        const points = Math.round(basePoints * multiplier);
        player.score += points;

        socket.emit('answer_feedback', { correct: true, pointsGained: points, streak: player.streak });
      } else {
        player.streak = 0;
        socket.emit('answer_feedback', { correct: false, pointsGained: 0, streak: 0 });
      }

      io.to(roomCode).emit('score_updated', room.players);

      if (room.players.every(p => p.hasAnswered)) {
        endRound(roomCode);
      }
    });

    socket.on('submit_fastest_finger_guess', ({ roomCode, guess }) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== 'PLAYING' || room.lockedRound) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      if (Date.now() < player.cooldownUntil) {
        return socket.emit('cooldown_active');
      }

      const currentFile = room.questions[room.currentIndex];
      const firstName = getFirstName(currentFile);

      if (guess.toLowerCase().trim() === firstName.toLowerCase()) {
        room.lockedRound = true;

        let points = 100;
        if (room.mode === 'BLUR_DUEL') {
          points = Math.max(20, Math.round(room.timeLeft * 20));
        }

        player.score += points;

        io.to(roomCode).emit('round_stolen', {
          winnerName: player.name,
          winnerAvatar: player.avatar,
          correctName: firstName,
          pointsGained: points,
          players: room.players
        });

        endRound(roomCode);
      } else {
        player.cooldownUntil = Date.now() + 3000;
        socket.emit('guess_error', { message: 'Errato! Bloccato per 3s', seconds: 3 });
      }
    });

    socket.on('send_reaction', ({ roomCode, emoji }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        io.to(roomCode).emit('player_reaction', {
          playerId: socket.id,
          playerName: player.name,
          avatar: player.avatar,
          emoji
        });
      }
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, code) => {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          clearRoomTimers(room);
          rooms.delete(code);
        } else {
          io.to(code).emit('player_list_updated', room.players);
        }
      });
    });
  });
};