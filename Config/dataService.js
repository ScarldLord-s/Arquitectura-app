// Importar las librerías necesarias
import pkg from 'pg'; // Cliente para PostgreSQL
import dotenv from 'dotenv'; // Cargar variables de entorno

dotenv.config(); // Cargar configuración desde el archivo .env

// Configurar la conexión con PostgreSQL
const { Pool } = pkg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexión desde .env
});

// Función para obtener todos los usuarios desde la base de datos PostgreSQL
export async function fetchAllItems() {
  try {
    const client = await pool.connect(); // Conectar a la base de datos
    const result = await client.query("SELECT * FROM users"); // Ejecutar consulta
    client.release(); // Liberar conexión

    return result.rows; // Retornar los registros obtenidos
  } catch (error) {
    throw new Error(`Error al obtener los datos: ${error.message}`);
  }
}
