const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/sections', sectionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stories', storyRoutes);

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