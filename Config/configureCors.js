// force-cors.js
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

const bucketName = process.env.GCS_BUCKET_NAME;

// Configuración CORS muy permisiva
const corsConfiguration = [
  {
    origin: ['*'], // Permite TODOS los orígenes
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    responseHeader: ['*'], // Permite TODOS los headers
    maxAgeSeconds: 3600
  }
];

async function forceCorsConfig() {
  try {
    console.log('🚀 Aplicando configuración CORS forzada...');
    console.log('Bucket:', bucketName);
    
    // Limpiar configuración anterior
    console.log('🧹 Limpiando configuración CORS anterior...');
    await storage.bucket(bucketName).setCorsConfiguration([]);
    
    // Aplicar nueva configuración
    console.log('⚙️  Aplicando nueva configuración CORS...');
    await storage.bucket(bucketName).setCorsConfiguration(corsConfiguration);
    
    console.log('✅ Configuración CORS aplicada exitosamente');
    
    // Verificar que se aplicó
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    console.log('🔍 Verificación - CORS configurado:');
    console.log(JSON.stringify(metadata.cors, null, 2));
    
    console.log('\n🎉 ¡Configuración completada! Prueba tu aplicación ahora.');
    
  } catch (error) {
    console.error('❌ Error al configurar CORS:', error.message);
    console.error('Código:', error.code);
    
    if (error.code === 403) {
      console.error('\n🔐 PROBLEMA DE PERMISOS:');
      console.error('Tu cuenta de servicio necesita el rol "Storage Admin"');
      console.error('O estos permisos específicos:');
      console.error('- storage.buckets.update');
      console.error('- storage.buckets.get');
    }
  }
}

forceCorsConfig();