// routes/auth.js
const express = require('express');
const router = express.Router(); // Usamos el Router de Express
const User = require('../models/User'); // Importamos el modelo de Usuario

/**
 * @route   POST /api/auth/register
 * @desc    Registra un nuevo usuario
 * @access  Public
 */
router.post('/register', async (req, res) => {
  // 1. Extraemos el email y la contraseña del cuerpo (body) de la petición
  //    (Para que esto funcione, necesitamos 'app.use(express.json())' en server.js, que ya lo tenemos)
  const { email, password } = req.body;

  try {
    // 2. Validar que los datos llegaron
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, ingrese todos los campos.' });
    }

    // 3. Verificar si el usuario ya existe en la BD
    let user = await User.findOne({ email }); // Busca un usuario con ese email
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    // 4. Si no existe, creamos un nuevo documento de Usuario
    user = new User({
      email,
      password
      // NOTA: La contraseña se "hasheará" automáticamente aquí
      // gracias al 'pre-save' hook que definimos en el modelo User.js
    });

    // 5. Guardar el nuevo usuario en la base de datos
    await user.save();

    // 6. Enviar una respuesta de éxito
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });

  } catch (err) {
    // Manejo de errores
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exportamos el router