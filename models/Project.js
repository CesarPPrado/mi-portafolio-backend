// models/Project.js
const mongoose = require('mongoose');

// 1. Definir el Schema (la plantilla) para nuestros proyectos
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // El título es obligatorio
  },
  description: {
    type: String,
    required: true // La descripción es obligatoria
  }
});

// 2. Crear y exportar el Modelo
//    Mongoose tomará el nombre "Project", lo pondrá en minúsculas 
//    y plural ("projects") y así nombrará a la "colección" (tabla) en la BD.
module.exports = mongoose.model('Project', projectSchema);