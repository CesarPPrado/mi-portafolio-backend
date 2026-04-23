const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener el token del header (formato: Bearer <token>)
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido, autorización denegada' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar el usuario al request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};
