const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/profile
// @desc    Obtener perfil del usuario (con sus paletas)
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   POST /api/user/palettes
// @desc    Guardar una nueva paleta
// @access  Private
router.post('/palettes', auth, async (req, res) => {
  const { id, name, description, colors } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.palettes.push({ id, name, description, colors });
    await user.save();
    
    res.json(user.palettes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al guardar la paleta');
  }
});

// @route   PUT /api/user/palettes/:id
// @desc    Editar una paleta existente
// @access  Private
router.put('/palettes/:id', auth, async (req, res) => {
  const { name, description, colors } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const paletteIndex = user.palettes.findIndex(p => p.id === req.params.id);
    if (paletteIndex === -1) return res.status(404).json({ message: 'Paleta no encontrada' });

    if (name) user.palettes[paletteIndex].name = name;
    if (description !== undefined) user.palettes[paletteIndex].description = description;
    if (colors) user.palettes[paletteIndex].colors = colors;

    await user.save();
    res.json(user.palettes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al actualizar la paleta');
  }
});

// @route   DELETE /api/user/palettes/:id
// @desc    Eliminar una paleta
// @access  Private
router.delete('/palettes/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.palettes = user.palettes.filter(p => p.id !== req.params.id);
    await user.save();
    
    res.json(user.palettes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al eliminar la paleta');
  }
});

// @route   PUT /api/user/palettes/reorder
// @desc    Reordenar las paletas pasándole el nuevo array completo o lista de IDs
// @access  Private
router.put('/palettes/reorder/all', auth, async (req, res) => {
  const { palettes } = req.body; // array de paletas reordenado
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.palettes = palettes;
    await user.save();
    
    res.json(user.palettes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al reordenar paletas');
  }
});

module.exports = router;
