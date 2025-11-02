// src/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Importar Modelos ---
const Project = require('./models/Project'); // IMPORTAMOS EL MODELO

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth'); // 1. IMPORTAR LAS NUEVAS RUTAS

const app = express();
const PORT = 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Conexión a MongoDB ---
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('¡Conexión exitosa a MongoDB Atlas!'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- Rutas de la API ---
app.get('/', (req, res) => {
  res.send('Servidor de API de mi portafolio. Conectado a MongoDB.');
});

// MODIFICAMOS LA RUTA PARA QUE USE EL MODELO
app.get('/api/proyectos', async (req, res) => {
  try {
    // Project.find() busca TODOS los documentos en la colección 'projects'
    const proyectos = await Project.find();
    res.json(proyectos); // Envía los datos de la BD como JSON
  } catch (err) {
    // Manejo de errores
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- CONECTAR RUTAS DE AUTENTICACIÓN ---
// 2. Le decimos a Express que use el archivo de rutas 'auth.js'
//    para cualquier URL que empiece con '/api/auth'
app.use('/api/auth', authRoutes);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
});