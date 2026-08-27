const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const sectionRoutes = require('./routes/sectionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const storyRoutes = require('./routes/storyRoutes');
const setupGameSockets = require('./sockets/gameSockets');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());

// Aumento dei limiti del body parser a 100MB per evitare il blocco su payload JSON estesi
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/static', express.static(path.join(process.cwd(), 'static')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// Rotta per ottenere la lista dinamica dei file
app.get('/api/game-media', (req, res) => {
  try {
    // __dirname è 'backend/src'
    const charactersDir = path.join(__dirname, '../static/characters');       // -> backend/src/characters
    const audioDir = path.join(__dirname, '../static/audio/it');   // -> backend/static/audio/it

    const characters = fs.readdirSync(charactersDir)
      .filter(file => !file.startsWith('.') && /\.(jpg|jpeg|png|webp)$/i.test(file));

    const audioFiles = fs.readdirSync(audioDir)
      .filter(file => !file.startsWith('.') && /\.(mp3|wav|ogg)$/i.test(file));

    res.json({ characters, audioFiles });
  } catch (error) {
    console.error("Errore nel recupero dei file media:", error);
    res.status(500).json({ error: "Impossibile leggere i file" });
  }
});

app.use('/characters', express.static(path.join(__dirname, 'characters')));

app.use('/api/sections', sectionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stories', storyRoutes);

// Endpoint per il ping (Health Check)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Middleware di gestione degli errori per catturare anomalie durante l'upload dei file
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Errore durante l\'elaborazione della richiesta'
    });
  }
  next();
});

setupGameSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Node.js + WebSockets in esecuzione sulla porta ${PORT}`);
});