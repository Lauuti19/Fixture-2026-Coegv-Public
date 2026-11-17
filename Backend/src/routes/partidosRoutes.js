const express = require('express');
const router = express.Router();
const partidosController = require('../controllers/partidosController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/grupo/:letra', verificarToken, partidosController.listarPartidosGrupo);
router.get('/playoffs', verificarToken, partidosController.listarPartidosPlayoffs);
router.post('/pronostico', verificarToken, partidosController.guardarPronostico);
router.get('/posiciones/:letra', partidosController.obtenerPosicionesGrupo);
router.get('/posiciones-usuario/:letra', verificarToken, partidosController.obtenerPosicionesGrupoUsuario);
router.get('/proximos', verificarToken, partidosController.obtenerPartidosDelDia);
router.get('/ranking', partidosController.getRanking);
router.get('/mis-puntos', verificarToken, partidosController.getPuntosUsuario);
router.get('/cache', partidosController.getCache);

module.exports = router;