import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

class GCSStorageService {
  async uploadFile(file, roomId, userId) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `rooms/${roomId}/${fileName}`;
    const fileUpload = bucket.file(filePath);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
          roomId: roomId,
          uploadDate: new Date().toISOString()
        }
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
        resolve({
          fileName: file.originalname,
          filePath,
          publicUrl,
          fileSize: file.size,
          mimeType: file.mimetype,
          roomId: parseInt(roomId),
          userId: parseInt(userId)
        });
      });
      stream.end(file.buffer);
    });
  }

  async deleteFile(filePath) {
    await bucket.file(filePath).delete();
  }

  async getSignedDownloadUrl(filePath, expiresInMinutes = 5) {
    const [url] = await bucket.file(filePath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  }

  async getSignedUploadUrl(fileName, contentType, expiresInMinutes = 10) {
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
      contentType,
    });
    return url;
  }

  getPublicUrl(fileName) {
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  }
}

export default new GCSStorageService();