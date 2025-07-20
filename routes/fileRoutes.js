import express from 'express';
import multer from 'multer';
import GCSStorageService from '../services/gcsStorageService.js';
import FileModel from '../models/fileModel.js';
import { authenticateToken } from '../middleware/auth.js';
import { summarizePdf } from '../controllers/pdfSummaryController.js';

const router = express.Router();

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/avi',
      'video/mov'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

/**
 * POST /api/files/upload
 * Subir archivo a una sala específica
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { roomId } = req.body;
    // --- DEBUGGING LOGS (you can remove them after confirming fix) ---
    console.log('--- Debugging /files/upload ---');
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);
    // --- MODIFICADO: ACCEDER A req.user.id EN LUGAR DE req.user.userId ---
    const userId = req.user.id; // <--- ¡CAMBIO AQUÍ!
    console.log('Extracted userId (CORRECTED):', userId); // For debugging
    console.log('--- End Debugging ---');
    // --- END DEBUGGING LOGS ---

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }
    if (!roomId) {
      return res.status(400).json({ error: 'roomId es requerido' });
    }
    // Si userId viene como undefined/null (lo que no debería pasar si req.user.id funciona)
    if (!userId) {
        console.error('Error: userId no disponible en req.user. Esto indica un problema con la autenticación o el token.');
        return res.status(401).json({ error: 'Usuario no autenticado o ID de usuario no disponible.' });
    }


    // Subir archivo a Google Cloud Storage
    const uploadResult = await GCSStorageService.uploadFile(file, roomId, userId);

    // Guardar información en base de datos
    const fileRecord = await FileModel.createFile({
      roomId: parseInt(roomId),
      userId: userId, // Este userId ahora será el correcto
      fileName: uploadResult.fileName,
      filePath: uploadResult.filePath,
      publicUrl: uploadResult.publicUrl,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType
    });

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: {
        id: fileRecord.file_id,
        name: fileRecord.file_name,
        path: fileRecord.file_path,
        publicUrl: fileRecord.public_url || uploadResult.publicUrl,
        uploadedAt: fileRecord.uploaded_at
      }
    });

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});


router.get('/summarize/:file_id', summarizePdf);
/**
 * GET /api/files/room/:roomId
 * Obtener archivos de una sala
 */
router.get('/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await FileModel.getFilesByRoom(roomId);

    const filesWithUrls = files.map(file => ({
      ...file,
      publicUrl: file.public_url || GCSStorageService.getPublicUrl(file.file_path)
    }));

    res.json({ files: filesWithUrls });
  } catch (error) {
    console.error('Error obteniendo archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/files/:fileId
 * Eliminar archivo
 */
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id; // <--- ¡CAMBIO AQUÍ TAMBIÉN!

    const file = await FileModel.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    // Asegúrate de que file.user_id es el nombre correcto de la columna en tu DB
    if (file.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este archivo' });
    }

    await GCSStorageService.deleteFile(file.file_path);
    await FileModel.deleteFile(fileId);

    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/files/user/:userId
 * Obtener archivos de un usuario
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params; // Este userId viene de la URL, es el ID del usuario cuyos archivos se quieren ver
    // El ID del usuario actual (autenticado) viene del token
    // Asegúrate de que req.user.id coincide con el payload de tu JWT
    if (parseInt(userId) !== req.user.id) { // <--- ¡CAMBIO AQUÍ TAMBIÉN!
      return res.status(403).json({ error: 'No tienes permisos para ver estos archivos' });
    }

    const files = await FileModel.getFilesByUser(userId);

    const filesWithUrls = files.map(file => ({
      ...file,
      publicUrl: file.public_url || GCSStorageService.getPublicUrl(file.file_path)
    }));

    res.json({ files: filesWithUrls });
  } catch (error) {
    console.error('Error obteniendo archivos del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/files/download/:fileId
 * Generar URL de descarga firmada
 */
router.get('/download/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const signedUrl = await GCSStorageService.getSignedDownloadUrl(file.file_path, 60);

    res.json({
      downloadUrl: signedUrl,
      fileName: file.file_name
    });
  } catch (error) {
    console.error('Error generando URL de descarga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/files/signed-upload-url
 * Obtener URL firmada para subida directa desde el frontend
 */
router.post('/signed-upload-url', authenticateToken, async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName y contentType son requeridos' });
    }
    const url = await GCSStorageService.getSignedUploadUrl(fileName, contentType);
    res.json({ url });
  } catch (error) {
    console.error('Error generando URL de subida firmada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;