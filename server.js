// src/server.js
const express = require('express');
const app = express(); // IMPORTAR EXPRESS
const cors = require('cors'); // IMPORTAR CORS
const PORT = 3001;

// 2. USAR CORS
//    Esto le dice a tu servidor que acepte peticiones de cualquier origen.
app.use(cors());

// 1. Definimos los datos de nuestros proyectos
//    En el futuro, esto vendrá de una base de datos.
const proyectosData = [
  { 
    id: 1, 
    title: "Portafolio v1 (HTML/CSS)", 
    description: "La primera versión de mi portafolio, creada con HTML, CSS y JavaScript puro." 
  },
  { 
    id: 2, 
    title: "Portafolio v2 (React)", 
    description: "Versión 2.0 de mi portafolio, construido con React, Vite y CSS Modules." 
  },
  { 
    id: 3, 
    title: "Servidor de API (Node.js)", 
    description: "El backend que estás usando ahora mismo, construido con Node.js y Express." 
  }
];

// 2. Creamos una ruta raíz que da la bienvenida
app.get('/', (req, res) => {
  res.send('Servidor de API de mi portafolio. Visita /api/proyectos para ver los datos.');
});

// 3. Creamos nuestra primera ruta de API REAL
//    Esta ruta enviará los datos de los proyectos en formato JSON
app.get('/api/proyectos', (req, res) => {
  res.json(proyectosData); // ¡Enviamos los datos como JSON!
});

// 4. Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en http://localhost:${PORT}`);
});