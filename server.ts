import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Route for Code Review
  app.post("/api/review", async (req, res) => {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code ist erforderlich." });
    }

    try {
      const model = "gemini-3-flash-preview";
      
      const prompt = `Analysiere den folgenden ${language || 'Code'} und gib ein strukturiertes Review in deutscher Sprache zurück. 
      Fokussiere dich auf:
      1. Best Practices
      2. Sicherheit
      3. Performance
      4. Lesbarkeit
      
      Code:
      ${code}`;

      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "Kurze Zusammenfassung des Reviews" },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Kategorie (z.B. Sicherheit, Performance)" },
                    severity: { type: Type.STRING, description: "Schweregrad (Niedrig, Mittel, Hoch)" },
                    description: { type: Type.STRING, description: "Detaillierte Beschreibung des Problems" },
                    suggestion: { type: Type.STRING, description: "Verbesserungsvorschlag" }
                  },
                  required: ["type", "severity", "description", "suggestion"]
                }
              },
              score: { type: Type.NUMBER, description: "Gesamtbewertung von 0 bis 100" }
            },
            required: ["summary", "issues", "score"]
          }
        }
      });

      const reviewData = JSON.parse(response.text || "{}");
      res.json(reviewData);

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Return the real error message as requested
      const errorMessage = error.message || "Ein unbekannter Fehler ist aufgetreten.";
      const errorDetails = error.response?.data || error.stack || null;
      
      res.status(500).json({ 
        error: "Analyse fehlgeschlagen.", 
        details: errorMessage,
        raw: errorDetails
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
