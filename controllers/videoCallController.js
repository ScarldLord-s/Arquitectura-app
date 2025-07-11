import { pool } from '../Config/dataService.js';
import Agora from 'agora-access-token'; // Importa el SDK de Agora

// --- Configuración de Agora (¡ATENCIÓN SEGURIDAD!) ---
const APP_ID = "405c1437f7be41398388e1a7c35fe5c6"; // Tu App ID (ya lo tienes en el frontend, pero es bueno tenerlo aquí también)
const APP_CERTIFICATE = "b1efb1fee7e042d7bf3f130799d330aa"; // <<<<<<< ¡OBTÉN ESTO DE TU CONSOLA DE AGORA!

const EXPIRATION_TIME_IN_SECONDS = 3600; // El token será válido por 1 hora (3600 segundos)

export const startCall = async (req, res) => {
    const { roomId, uid } = req.body; // Puedes enviar un UID desde el frontend, o usar 0
    const agora_channel_name = `room_${roomId}`; // O usa un UUID si quieres

    // --- Lógica para generar el token dinámico de Agora ---
    let agoraToken = null;
    try {
        const role = Agora.RtcRole.PUBLISHER; // Rol del usuario (PUBLISHER para enviar audio/video)
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + EXPIRATION_TIME_IN_SECONDS;

        agoraToken = Agora.RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            agora_channel_name,
            uid || 0, // Usar el UID proporcionado o 0 si no se especifica
            role,
            privilegeExpiredTs
        );
        console.log(`Token Agora generado para el canal ${agora_channel_name}: ${agoraToken}`);

    } catch (tokenError) {
        console.error("Error al generar el token de Agora:", tokenError);
        return res.status(500).json({ success: false, message: "Error al generar el token de Agora." });
    }
    // --- Fin de la lógica de generación de token ---

    try {
        const result = await pool.query(
            `INSERT INTO video_calls (room_id, agora_channel_name) VALUES ($1, $2) RETURNING *`,
            [roomId, agora_channel_name]
        );
        // ¡Devuelve el token al frontend!
        res.json({ success: true, call: result.rows[0], agora_channel_name, agora_token: agoraToken });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const endCall = async (req, res) => {
    const { callId } = req.body;
    try {
        await pool.query(
            `UPDATE video_calls SET ended_at = NOW() WHERE call_id = $1`,
            [callId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCallStatus = async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM video_calls WHERE room_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1`,
            [roomId]
        );
        res.json({ success: true, call: result.rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



