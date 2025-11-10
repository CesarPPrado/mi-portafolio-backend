// routes/contact.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Envía un mensaje desde el formulario de contacto
 * @access  Public
 */
router.post('/', async (req, res) => {
  // 1. Extraemos los datos del formulario (del frontend)
  const { name, email, message } = req.body;

  // 2. Validación simple (para asegurarnos de que no estén vacíos)
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Por favor, complete todos los campos.' });
  }

  // 3. Configurar el "transporter" (el "camión de correo" de Nodemailer)
  //    Utiliza las credenciales que guardamos en el archivo .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, 
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Configurar el "mailOptions" (el contenido del correo)
  const mailOptions = {
    from: 'pradopradocsr@gmail.com',  // TU EMAIL VERIFICADO EN BREVO
    to: 'pradopradocsr@gmail.com',      // El destinatario
    replyTo: email,                     // El email del visitante (para que puedas presionar "Responder")
    subject: `Nuevo Mensaje del Portafolio de: ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
  };

  // 5. Intentar enviar el correo
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Mensaje enviado exitosamente.' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el mensaje. Intente más tarde.' });
  }
});

module.exports = router;