import pdfParse from "pdf-parse";
import axios from "axios";
import { summarizeText } from "../services/geminiService.js";
import FileModel from "../models/fileModel.js";

export const summarizePdf = async (req, res) => {
  try {
    const { file_id } = req.params;
    const file = await FileModel.getFileById(file_id);
    // Usa public_url en vez de file_path
    if (!file || !file.public_url) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Descarga el PDF desde Google Cloud Storage
    const response = await axios.get(file.public_url, { responseType: "arraybuffer" });
    const dataBuffer = Buffer.from(response.data, "binary");
    const pdfData = await pdfParse(dataBuffer);

    // Limita el texto para Gemini
    const summary = await summarizeText(pdfData.text.slice(0, 8000));
    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al resumir el PDF" });
  }
};