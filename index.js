import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import pollRoutes from './routes/pollRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import router from './routes/roomBanRoutes.js';
import { setupRoomSocket } from './sockets/roomSocket.js';

dotenv.config();

const app = express();

// AÑADE ESTA LÍNEA AQUÍ
// Configura Express para confiar en los proxies.
// Esto es crucial si tu aplicación está detrás de un balanceador de carga o un proxy.
app.set('trust proxy', 1); // O '1' si solo esperas un proxy

// Middlewares globales
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/video-calls', videoRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bans', router);
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Crear servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Ajusta según tus necesidades de seguridad
    methods: ['GET', 'POST']
  }
});

// Configuración de sockets (ejemplo: salas de chat)
setupRoomSocket(io);

// Inicializar servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});