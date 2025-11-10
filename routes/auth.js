// routes/auth.js
const express = require('express');
const router = express.Router(); // Usamos el Router de Express
const User = require('../models/User'); // Importamos el modelo de Usuario
const bcrypt = require('bcrypt'); // 1. Importar bcrypt
const jwt = require('jsonwebtoken'); // 2. Importar jsonwebtoken

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

/**
 * @route   POST /api/auth/login
 * @desc    Autentica un usuario (inicia sesión)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validar que los datos llegaron
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, ingrese todos los campos.' });
    }

    // 2. Verificar si el usuario NO existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Comparar las contraseñas
    //    bcrypt compara la contraseña en texto plano (password) 
    //    con la contraseña hasheada en la BD (user.password)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Si no coinciden, damos el mismo mensaje genérico por seguridad
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 4. ¡Éxito! El usuario existe y la contraseña es correcta.
    //    Ahora, creamos su "pase" (JWT)
    const payload = {
      user: {
        id: user.id // Guardamos el ID del usuario dentro del token
      }
    };

    // 5. Firmamos el token con nuestro secreto y lo enviamos
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Usamos el secreto del .env
      { expiresIn: 3600 }, // El token expira en 1 hora (3600 seg)
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Enviamos el token al usuario
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router; // Exportamos el router