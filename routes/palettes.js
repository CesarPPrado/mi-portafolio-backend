const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const API_KEY = process.env.GEMINI_API_KEY;

// Convert file to generative part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// @route   POST /api/palettes/from-image
// @desc    Extraer paleta de colores de una imagen
// @access  Public
router.post('/from-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ninguna imagen' });
    }

    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usamos el modelo flash que también acepta imágenes
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Analiza esta imagen y extrae los 5 colores principales o más representativos.
      Devuelve ÚNICAMENTE un JSON válido con esta estructura:
      {
        "name": "Nombre inspirado en la imagen",
        "description": "Breve descripción de la paleta",
        "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"]
      }
      NO agregues comillas invertidas de markdown ni la palabra 'json' al inicio. Solo el objeto JSON puro.
    `;

    const imageParts = [
      fileToGenerativePart(req.file.buffer, req.file.mimetype),
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    let textResult = await result.response.text();
    textResult = textResult.replace(/```json\n?|```/g, '').trim();
    
    const paletteData = JSON.parse(textResult);

    res.json(paletteData);

  } catch (error) {
    console.error('Error al generar paleta desde imagen:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/palettes/advice
// @desc    Generar paleta basada en una descripción
// @access  Public
router.post('/advice', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Se requiere una descripción (prompt)' });
    }

    const skillPath = path.join(__dirname, '..', 'skills', 'skill_colorimetry.md');
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const finalPrompt = `
      ${skillContent}

      LA PETICIÓN DEL USUARIO ES:
      "${prompt}"
    `;

    const result = await model.generateContent(finalPrompt);
    let textResult = await result.response.text();
    textResult = textResult.replace(/```json\n?|```/g, '').trim();

    const paletteData = JSON.parse(textResult);

    res.json(paletteData);

  } catch (error) {
    console.error('Error al generar paleta por consejo:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
