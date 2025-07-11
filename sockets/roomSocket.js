import { AuthService } from '../services/authService.js';
import { addMemberToRoom } from '../services/roomMemberService.js';
import { saveMessage, getMessagesByRoomId } from '../services/messageService.js';

let io;

export const setupRoomSocket = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    socket.on('join room', async ({ roomId, userId }) => {
      socket.join(roomId);
      socket.userId = userId;

      try {
        await addMemberToRoom(roomId, userId);

        const messages = await getMessagesByRoomId(roomId);

        if (messages && messages.length > 0) {
          const messagesWithSender = await Promise.all(
            messages.map(async (msg) => {
              const messageUserIdFromDB = msg.user_id;
              let senderName = 'Usuario Desconocido';

              try {
                if (messageUserIdFromDB) {
                  const userProfile = await AuthService.getProfile(messageUserIdFromDB);
                  if (userProfile && userProfile.username) {
                    senderName = userProfile.username;
                  }
                }
              } catch (userError) {
                // Considera si quieres un log de errores silenciosos o un error.warn para esto
              }

              const processedMessage = {
                id: msg.message_id,
                roomId: msg.room_id,
                userId: msg.user_id,
                text: msg.content,
                sender: senderName,
                createdAt: msg.created_at,
              };
              return processedMessage;
            })
          );
          socket.emit('previous messages', messagesWithSender);
        } else {
          socket.emit('previous messages', []);
        }

        socket.to(roomId).emit('user joined', {
          userId,
          message: `User ${userId} has joined room ${roomId}`,
        });
      } catch (error) {
        // Dejar este log de error es crucial para depuración en producción
        console.error('[Server] Error in join room:', error);
        socket.emit('error', { message: 'Error joining room' });
      }
    });

    socket.on('new message', async (messageData) => {
      try {
        const { roomId, userId, text, sender } = messageData;

        if (!roomId || !userId || !text) {
          // Mantener este log si los datos son inválidos
          console.error('[Server] Missing required message data:', { roomId, userId, text });
          return;
        }

        const savedMessage = await saveMessage(roomId, userId, text);

        let messageSender = sender;
        if (!messageSender) {
          const userProfile = await AuthService.getProfile(userId);
          messageSender = userProfile ? userProfile.username : 'Usuario Desconocido';
        }

        const messageWithUser = {
          id: savedMessage.message_id,
          roomId: savedMessage.room_id,
          userId: savedMessage.user_id,
          text: savedMessage.content,
          sender: messageSender,
          createdAt: savedMessage.created_at || new Date(),
        };

        io.to(roomId).emit('new message', messageWithUser);

        // Puedes quitar esta verificación si no la necesitas para depuración
        // const verification = await getMessagesByRoomId(roomId);
      } catch (error) {
        // Dejar este log de error es crucial para depuración en producción
        console.error('[Server] Error handling new message:', error);
      }
    });

    // --- INICIO: Soporte para encuestas en tiempo real ---
    socket.on('new poll', ({ roomId }) => {
      io.to(roomId).emit('new poll');
    });

    socket.on('vote update', ({ pollId, roomId }) => {
      io.to(roomId).emit('vote update', pollId);
    });
    // --- FIN: Soporte para encuestas en tiempo real ---

    socket.on('disconnect', () => {
      // Puedes mantener este log si quieres saber cuándo se desconecta un usuario
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};