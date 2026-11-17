const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { registrarToken, enviarBienvenida } = require('../controllers/notificacionesController');

router.post('/token', verificarToken, registrarToken);
router.post('/bienvenida', verificarToken, enviarBienvenida);

module.exports = router;