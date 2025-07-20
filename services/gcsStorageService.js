import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'default';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

class GCSStorageService {
  async uploadFile(file, roomId, userId) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `rooms/${roomId}/${fileName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
      metadata: {
        originalName: file.originalname,
        uploadedBy: String(userId),
        roomId: String(roomId),
        uploadDate: new Date().toISOString()
      }
    });

    const publicUrl = this.getPublicUrl(filePath);
    return {
      fileName: file.originalname,
      filePath,
      publicUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      roomId: parseInt(roomId),
      userId: parseInt(userId)
    };
  }


  async deleteFile(filePath) {
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.deleteIfExists();
  }


  async getSignedDownloadUrl(filePath, expiresInMinutes = 5) {
    const blockBlobClient = containerClient.getBlockBlobClient(filePath);
    // Genera una URL SAS temporal para descarga
    const { generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } = ('@azure/storage-blob');
    const url = blockBlobClient.url;
    // Si necesitas una URL firmada, implementa aquí usando StorageSharedKeyCredential y generateBlobSASQueryParameters
    // Por simplicidad, retorna la URL pública (si el contenedor es público)
    return url;
  }


  async getSignedUploadUrl(fileName, contentType, expiresInMinutes = 10) {
    // Implementar si necesitas SAS para subida directa desde el frontend
    throw new Error('Signed upload URLs no implementados para Azure Blob Storage. Usa uploadFile directamente.');
  }


  getPublicUrl(fileName) {
    // URL pública de Azure Blob Storage
    return `${containerClient.url}/${encodeURIComponent(fileName)}`;
  }
}

export default new GCSStorageService();