// src/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Importar Modelos ---
const Project = require('./models/Project'); // IMPORTAMOS EL MODELO
const User = require('./models/User');

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth'); // IMPORTAR LA RUTA DE AUTH
const contactRoutes = require('./routes/contact'); // IMPORTAR RUTA DE CONTACTO

const app = express();
const PORT = 3001;

// --- Middlewares ---

// 1. Definir los orígenes permitidos (Whitelist)
const allowedOrigins = [
  'http://localhost:5173', // Para tu desarrollo local
  'https://mi-portafolio-react-six.vercel.app' // ¡Para tu sitio en producción!
];

// 2. Configurar las opciones de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin 'origin' (como las de Postman)
    if (!origin) return callback(null, true);

    // Si el origen de la petición SÍ está en nuestra lista blanca
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Si el origen NO está en la lista blanca
      callback(new Error('La política de CORS no permite este origen.'), false);
    }
  }
};

// 3. Usar CORS con nuestras opciones configuradas
app.use(cors(corsOptions));
app.use(express.json()); // Para que Express entienda el body de las peticiones JSON

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
//    Le decimos a Express que use el archivo de rutas 'auth.js'
//    para cualquier URL que empiece con '/api/auth'
app.use('/api/auth', authRoutes);

// --- CONECTAR RUTA DE CONTACTO ---
app.use('/api/contact', contactRoutes);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
});