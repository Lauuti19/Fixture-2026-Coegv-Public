const cron = require('node-cron');
const pool = require('../config/db');

async function calcularAvanceGrupos() {
    try {
        const [gruposConDatos] = await pool.query(`
            SELECT DISTINCT p.id_grupo, g.nombre_grupo
            FROM Partidos p INNER JOIN Grupos g ON p.id_grupo = g.id_grupo
            WHERE p.goles_real_1 IS NOT NULL
        `);

        for (const grupo of gruposConDatos) {
            const [equipos] = await pool.query(
                'SELECT id_equipo FROM Equipos_Grupos WHERE id_grupo = ?',
                [grupo.id_grupo]
            );
            for (const eq of equipos) {
                await pool.query('CALL ActualizarFilaTablaPosicionesReal(?, ?)', [grupo.id_grupo, eq.id_equipo]);
            }
        }

        console.log('[AVANCE-GRUPOS] Tablas de posiciones reales actualizadas.');
    } catch (error) {
        console.error('[AVANCE-GRUPOS] Error:', error.message);
    }
}

cron.schedule('5 */3 * * *', calcularAvanceGrupos, {
    timezone: 'America/Argentina/Buenos_Aires'
});

module.exports = { calcularAvanceGrupos };