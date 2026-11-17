const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 50
});

const getPartidosPorGrupo = async (idUsuario, letraGrupo) => {
    const [rows] = await pool.query('CALL ObtenerPartidosPorGrupo(?, ?)', [idUsuario, letraGrupo]);
    return rows[0];
};

const getPartidosPlayoffs = async (idUsuario) => {
    const [rows] = await pool.query('CALL ObtenerPartidosPlayoffs(?)', [idUsuario]);
    return rows[0];
};

const guardarPronostico = async (idUsuario, idPartido, goles1, goles2, idGanadorPenales) => {
    const [result] = await pool.query(
        'CALL GuardarPronostico(?, ?, ?, ?, ?)',
        [idUsuario, idPartido, goles1, goles2, idGanadorPenales]
    );
    return result;
};

const getTablaPosiciones = async (letraGrupo) => {
    const [rows] = await pool.query('CALL ObtenerTablaPosiciones(?)', [letraGrupo]);
    return rows[0];
};

const getTablaPosicionesUsuario = async (idUsuario, letraGrupo) => {
    const [rows] = await pool.query('CALL ObtenerTablaPosicionesUsuario(?, ?)', [idUsuario, letraGrupo]);
    return rows[0];
};

const getPartidosDelDia = async (idUsuario) => {
    const [rows] = await pool.query('CALL ObtenerPartidosDelDia(?)', [idUsuario]);
    return rows[0];
};

const obtenerRankingUsuarios = async () => {
    const [rows] = await pool.query('CALL ObtenerRankingUsuarios()');
    return rows[0];
};

const obtenerPuntosUsuario = async (idUsuario) => {
    const [rows] = await pool.query('CALL ObtenerPuntosUsuario(?)', [idUsuario]);
    return rows[0][0];
};

const getFixtureCache = async () => {
    const [cacheRows] = await pool.query('CALL ObtenerFixtureCache()');
    const jsonResultados = cacheRows[0][0]?.datos_json;
    if (!jsonResultados) return [];
    return JSON.parse(jsonResultados);
};

module.exports = {
    getPartidosPorGrupo,
    getPartidosPlayoffs,
    guardarPronostico,
    getTablaPosiciones,
    getTablaPosicionesUsuario,
    getPartidosDelDia,
    obtenerRankingUsuarios,
    obtenerPuntosUsuario,
    getFixtureCache
};