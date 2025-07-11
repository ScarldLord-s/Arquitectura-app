import GCSStorageService from '../services/gcsStorageService.js';
import FileModel from '../models/fileModel.js';

const uploadFileController = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No se envió archivo.' });

    const fileInfo = await GCSStorageService.uploadFile(file, roomId, userId);
    const fileRecord = await FileModel.createFile(fileInfo);

    res.status(201).json({ success: true, file: fileRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFilesByRoomController = async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await FileModel.getFilesByRoom(roomId);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFileByIdController = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.getFileById(fileId);
    if (!file) return res.status(404).json({ success: false, message: 'Archivo no encontrado.' });
    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFileController = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.getFileById(fileId);
    if (!file) return res.status(404).json({ success: false, message: 'Archivo no encontrado.' });

    await GCSStorageService.deleteFile(file.file_path);
    await FileModel.deleteFile(fileId);

    res.json({ success: true, message: 'Archivo eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFilesByUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await FileModel.getFilesByUser(userId);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSignedDownloadUrlController = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await FileModel.getFileById(fileId);
    if (!file) return res.status(404).json({ success: false, message: 'Archivo no encontrado.' });

    const url = await GCSStorageService.getSignedDownloadUrl(file.file_path);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSignedUploadUrlController = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    const url = await GCSStorageService.getSignedUploadUrl(fileName, contentType);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const FileController = {
  uploadFileController,
  getFilesByRoomController,
  getFileByIdController,
  deleteFileController,
  getFilesByUserController,
  getSignedDownloadUrlController,
  getSignedUploadUrlController,
};