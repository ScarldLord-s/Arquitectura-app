import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAVqP4PgzUErbnHexnR9e3hfYZvpSufKgc");

export async function summarizeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Resume el siguiente texto en español:\n${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}