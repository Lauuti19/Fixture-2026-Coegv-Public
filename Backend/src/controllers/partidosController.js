const partidosService = require('../services/partidosService');
const { propagarResultadosPlayoffs } = require('../jobs/propagarPlayoffsJob');

const listarPartidosGrupo = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { letra } = req.params;
        if (!letra || letra.length !== 1) {
            return res.status(400).json({ message: 'La letra del grupo debe ser un único carácter válido.' });
        }
        const partidos = await partidosService.getPartidosPorGrupo(idUsuario, letra.toUpperCase());
        res.status(200).json({ grupo: letra.toUpperCase(), partidos });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los partidos.', error: error.message });
    }
};

const listarPartidosPlayoffs = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const partidos = await partidosService.getPartidosPlayoffs(idUsuario);
        res.status(200).json({ fase: "Eliminación Directa", partidos });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los partidos de playoffs.', error: error.message });
    }
};

const guardarPronostico = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { id_partido, goles_equipo_1, goles_equipo_2, id_ganador_penales } = req.body;

        if (id_partido === undefined || goles_equipo_1 === undefined || goles_equipo_2 === undefined) {
            return res.status(400).json({
                message: 'Faltan datos obligatorios.',
                detalles: { id_partido, goles_equipo_1, goles_equipo_2 }
            });
        }

        const idPartidoInt = parseInt(id_partido, 10);
        const g1 = parseInt(goles_equipo_1, 10);
        const g2 = parseInt(goles_equipo_2, 10);

        if (isNaN(idPartidoInt) || isNaN(g1) || isNaN(g2) || g1 < 0 || g2 < 0) {
            return res.status(400).json({
                message: 'Los goles y el ID del partido deben ser números enteros válidos.',
                detalles: { id_partido, g1, g2 }
            });
        }

        let ganadorPenalesId = null;
        if (id_ganador_penales !== undefined && id_ganador_penales !== "" &&
            id_ganador_penales !== null && id_ganador_penales !== "null") {
            ganadorPenalesId = parseInt(id_ganador_penales, 10);
            if (isNaN(ganadorPenalesId)) ganadorPenalesId = null;
        }

        await partidosService.guardarPronostico(idUsuario, idPartidoInt, g1, g2, ganadorPenalesId);
        res.status(200).json({ message: 'Pronóstico guardado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar el pronóstico.', error: error.message, detalle: error.stack });
    }
};

const obtenerPosicionesGrupo = async (req, res) => {
    try {
        const { letra } = req.params;
        if (!letra || letra.length !== 1) {
            return res.status(400).json({ message: 'La letra del grupo no es válida.' });
        }
        const tabla = await partidosService.getTablaPosiciones(letra.toUpperCase());
        res.status(200).json({ grupo: letra.toUpperCase(), tabla });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la tabla de posiciones.', error: error.message, detalle: error.stack });
    }
};

const obtenerPosicionesGrupoUsuario = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { letra } = req.params;
        if (!letra || letra.length !== 1) {
            return res.status(400).json({ message: 'La letra del grupo no es válida.' });
        }
        const tabla = await partidosService.getTablaPosicionesUsuario(idUsuario, letra.toUpperCase());
        res.status(200).json({ grupo: letra.toUpperCase(), tabla });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la tabla de posiciones del usuario.', error: error.message });
    }
};

const obtenerPartidosDelDia = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const partidos = await partidosService.getPartidosDelDia(idUsuario);
        res.status(200).json(partidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los partidos del día.', error: error.message });
    }
};

const getRanking = async (req, res) => {
    try {
        const ranking = await partidosService.obtenerRankingUsuarios();
        res.status(200).json({ ranking });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ranking.', error: error.message });
    }
};

const getPuntosUsuario = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const puntos = await partidosService.obtenerPuntosUsuario(idUsuario);
        res.status(200).json(puntos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener puntos.', error: error.message });
    }
};

const getCache = async (req, res) => {
    try {
        const data = await partidosService.getFixtureCache();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cache.', error: error.message });
    }
};

module.exports = {
    listarPartidosGrupo,
    listarPartidosPlayoffs,
    guardarPronostico,
    obtenerPosicionesGrupo,
    obtenerPosicionesGrupoUsuario,
    obtenerPartidosDelDia,
    getRanking,
    getPuntosUsuario,
    getCache
};