import { fetchAllItems } from "../services/dataService.js";

async function testConnection() {
  try {
    const data = await fetchAllItems();
    console.log("✅ Conexión exitosa. Datos:", data);
  } catch (err) {
    console.log("❌ Error al conectar:", err.message);
  }
}

testConnection();
