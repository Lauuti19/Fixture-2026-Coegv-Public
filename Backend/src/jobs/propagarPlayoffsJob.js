const cron = require('node-cron');
const pool = require('../config/db');

const MAPA_AVANCE_PLAYOFFS = {
    73: { partido_ganador: 90, posicion: 1 },
    74: { partido_ganador: 89, posicion: 1 },
    75: { partido_ganador: 90, posicion: 2 },
    76: { partido_ganador: 91, posicion: 1 },
    77: { partido_ganador: 89, posicion: 2 },
    78: { partido_ganador: 91, posicion: 2 },
    79: { partido_ganador: 92, posicion: 1 },
    80: { partido_ganador: 92, posicion: 2 },
    81: { partido_ganador: 94, posicion: 1 },
    82: { partido_ganador: 94, posicion: 2 },
    83: { partido_ganador: 93, posicion: 1 },
    84: { partido_ganador: 93, posicion: 2 },
    85: { partido_ganador: 96, posicion: 1 },
    86: { partido_ganador: 95, posicion: 1 },
    87: { partido_ganador: 96, posicion: 2 },
    88: { partido_ganador: 95, posicion: 2 },
    89: { partido_ganador: 97, posicion: 1 },
    90: { partido_ganador: 97, posicion: 2 },
    91: { partido_ganador: 99, posicion: 1 },
    92: { partido_ganador: 99, posicion: 2 },
    93: { partido_ganador: 98, posicion: 1 },
    94: { partido_ganador: 98, posicion: 2 },
    95: { partido_ganador: 100, posicion: 1 },
    96: { partido_ganador: 100, posicion: 2 },
    97: { partido_ganador: 101, posicion: 1 },
    98: { partido_ganador: 101, posicion: 2 },
    99: { partido_ganador: 102, posicion: 1 },
    100: { partido_ganador: 102, posicion: 2 },
    101: { partido_ganador: 104, posicion: 1, partido_perdedor: 103, posicion_perdedor: 1 },
    102: { partido_ganador: 104, posicion: 2, partido_perdedor: 103, posicion_perdedor: 2 },
};

async function propagarResultadosPlayoffs() {
    try {
        const [cacheRows] = await pool.query('CALL ObtenerFixtureCache()');
        const jsonResultados = cacheRows[0][0]?.datos_json;
        if (!jsonResultados) {
            console.log('[PLAYOFFS] Sin cache disponible');
            return;
        }

        const resultados = JSON.parse(jsonResultados);
        const playoffsFinalizados = resultados.filter(r => r.numero_partido >= 73);
        if (!playoffsFinalizados.length) {
            console.log('[PLAYOFFS] Sin playoffs finalizados aún');
            return;
        }

        for (const resultado of playoffsFinalizados) {
            const avance = MAPA_AVANCE_PLAYOFFS[resultado.numero_partido];
            if (!avance) continue;

            const [equiposPartido] = await pool.query(
                'SELECT id_equipo_1_fijo, id_equipo_2_fijo FROM Partidos WHERE numero_partido = ?',
                [resultado.numero_partido]
            );
            if (!equiposPartido.length) continue;

            const { id_equipo_1_fijo, id_equipo_2_fijo } = equiposPartido[0];

            await pool.query(
                'UPDATE Partidos SET goles_real_1 = ?, goles_real_2 = ? WHERE numero_partido = ?',
                [resultado.goles_1, resultado.goles_2, resultado.numero_partido]
            );
            await pool.query('CALL CalcularPuntosPartido(?, ?, ?)', [
                resultado.numero_partido, resultado.goles_1, resultado.goles_2
            ]);

            let id_ganador, id_perdedor;
            if (resultado.goles_1 > resultado.goles_2) {
                id_ganador = id_equipo_1_fijo; id_perdedor = id_equipo_2_fijo;
            } else if (resultado.goles_2 > resultado.goles_1) {
                id_ganador = id_equipo_2_fijo; id_perdedor = id_equipo_1_fijo;
            } else {
                console.log(`[PLAYOFFS] Partido ${resultado.numero_partido} empate, penales pendientes`);
                continue;
            }

            if (avance.posicion === 1) {
                await pool.query('UPDATE Partidos SET id_equipo_1_fijo = ? WHERE numero_partido = ?', [id_ganador, avance.partido_ganador]);
            } else {
                await pool.query('UPDATE Partidos SET id_equipo_2_fijo = ? WHERE numero_partido = ?', [id_ganador, avance.partido_ganador]);
            }

            if (avance.partido_perdedor && id_perdedor) {
                if (avance.posicion_perdedor === 1) {
                    await pool.query('UPDATE Partidos SET id_equipo_1_fijo = ? WHERE numero_partido = ?', [id_perdedor, avance.partido_perdedor]);
                } else {
                    await pool.query('UPDATE Partidos SET id_equipo_2_fijo = ? WHERE numero_partido = ?', [id_perdedor, avance.partido_perdedor]);
                }
            }

            console.log(`[PLAYOFFS] Partido ${resultado.numero_partido} propagado — ganador equipo ${id_ganador}`);
        }

        console.log('[PLAYOFFS] Propagación completada');
    } catch (error) {
        console.error('[PLAYOFFS] Error al propagar:', error.message);
    }
}

cron.schedule('10 0,6,12,18 * * *', propagarResultadosPlayoffs, {
    timezone: 'America/Argentina/Buenos_Aires'
});


module.exports = { propagarResultadosPlayoffs };