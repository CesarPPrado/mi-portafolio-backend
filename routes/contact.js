// routes/contact.js
const express = require('express');
const { Resend } = require('resend'); // 1. Importar Resend
const router = express.Router();

// 2. Inicializar Resend con tu clave de API (que viene del .env)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @route   POST /api/contact
 * @desc    Envía un mensaje desde el formulario de contacto
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 3. Configurar y enviar el correo con Resend
    const { data, error } = await resend.emails.send({
      // 4. Usamos el remitente de prueba de Resend (¡esto evita los bloqueos!)
      from: 'Portafolio <onboarding@resend.dev>', 
      to: ['pradopradocsr@gmail.com'], // Tu email de destino
      subject: `Nuevo Mensaje del Portafolio de: ${name}`,
      // 5. El cuerpo del correo
      html: `
        <p>Has recibido un nuevo mensaje de contacto:</p>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email (para responder):</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    // 6. Si Resend devuelve un error, lánzalo
    if (error) {
      throw new Error(error.message);
    }

    // 7. ¡Éxito!
    res.status(200).json({ message: 'Mensaje enviado exitosamente.' });

  } catch (err) {
    console.error('Error al enviar el correo:', err);
    res.status(500).json({ message: 'Error al enviar el mensaje.' });
  }
});

module.exports = router;