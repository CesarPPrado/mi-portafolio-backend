// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // 1. Importar bcrypt

// 2. Definir el Schema (plantilla) para el Usuario
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // El email es obligatorio
    unique: true,   // No puede haber dos usuarios con el mismo email
    lowercase: true // Guardar siempre en minúsculas
  },
  password: {
    type: String,
    required: true // La contraseña es obligatoria
  }
});

// 3. ¡Paso de Seguridad Mágico! (Mongoose Middleware)
//    Esto le dice a Mongoose: "Antes ('pre') de que 'guardes' ('save') 
//    un nuevo usuario, ejecuta esta función".
userSchema.pre('save', async function(next) {
  // 'this' se refiere al documento de usuario que está a punto de guardarse
  if (!this.isModified('password')) {
    // Si la contraseña no ha cambiado, no la vuelvas a hashear
    return next();
  }

  try {
    // 4. Generar un "salt" (una cadena aleatoria para hacer el hash más fuerte)
    const salt = await bcrypt.genSalt(10); // 10 es el "costo" (qué tan fuerte)
    // 5. Hashear la contraseña (contraseña_simple + salt)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 4. Crear y exportar el Modelo
module.exports = mongoose.model('User', userSchema);