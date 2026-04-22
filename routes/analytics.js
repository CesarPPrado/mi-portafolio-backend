const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración de multer para guardar temporalmente en memoria (o en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const API_KEY = process.env.GEMINI_API_KEY;

// Utilidad para extraer texto de archivos PPTX y DOCX (mammoth es para docx, pero para simplificar PPTX si no instalamos otra librería, trataremos PPTX con una aproximación si podemos, si no sugerimos otra. Por ahora pdf, excel y docx están cubiertos al 100%)
// Wait, to parse PPTX from memory we might need 'officeparser' or similar. 
// For now, let's just throw an error for PPTX if we don't have a parser, or use a basic approach.

async function extractTextFromBuffer(buffer, originalname, mimetype) {
  const ext = path.extname(originalname).toLowerCase();
  
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    return { type: 'excel', content: data };
  } 
  else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return { type: 'word', content: result.value };
  }
  else if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return { type: 'pdf', content: data.text };
  }
  else if (ext === '.pptx') {
    // Si no tenemos officeparser, retornaremos un mensaje o podríamos agregarlo después.
    throw new Error('El formato PPTX requiere una librería específica (ej. officeparser). Sube un PDF o DOCX por el momento.');
  }
  else {
    throw new Error('Formato no soportado');
  }
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // 1. Extraer el contenido
    const { type, content } = await extractTextFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);

    // 2. Elegir el Skill adecuado (Router)
    let skillFileName = '';
    if (type === 'excel') {
      skillFileName = 'skill_data_analysis.md';
    } else {
      // word, pdf
      skillFileName = 'skill_text_summarization.md';
    }

    const skillPath = path.join(__dirname, '..', 'skills', skillFileName);
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    // 3. Consultar a Gemini
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada en el servidor.');
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Preparar el prompt truncando el contenido si es muy largo
    const limit = type === 'excel' ? 5000 : 15000;
    const contentString = type === 'excel' ? JSON.stringify(content).substring(0, limit) : content.substring(0, limit);

    const prompt = `
      INSTRUCCIONES DEL SISTEMA (SKILL):
      ${skillContent}

      CONTENIDO DEL ARCHIVO (MUESTRA):
      ${contentString}
    `;

    const result = await model.generateContent(prompt);
    const textResult = await result.response.text();

    // 4. Preparar la respuesta JSON para el frontend
    // Si es excel, devolvemos también los datos para que el frontend dibuje las gráficas
    const responsePayload = {
      aiAnalysis: textResult,
      type: type,
      fileName: req.file.originalname,
      data: type === 'excel' ? content : null, // Enviamos el JSON para las gráficas
    };

    // Para Word/PDF podríamos enviar las frecuencias de palabras calculadas aquí mismo
    if (type !== 'excel') {
      const words = content.match(/\b\w+\b/g) || [];
      const wordFrequency = {};
      words.forEach(w => {
        const lower = w.toLowerCase();
        if (lower.length > 3) {
          wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
        }
      });
      const topWords = Object.entries(wordFrequency)
        .map(([word, count]) => ({ text: word, value: count })) // Formato para Recharts BarChart
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      
      responsePayload.wordFreq = topWords;
    }

    res.json(responsePayload);

  } catch (error) {
    console.error('Error procesando el archivo:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
