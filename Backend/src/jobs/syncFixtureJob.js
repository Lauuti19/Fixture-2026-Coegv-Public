const cron = require('node-cron');
const pool = require('../config/db');
const { traducirEquipoApi } = require('../utils/traduccionEquipos');

const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;

async function obtenerYGuardarFixture() {
    try {
        const url = 'https://api.football-data.org/v4/competitions/WC/matches';
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`HTTP ${response.status} - ${body}`);
        }

        const data = await response.json();
        const fixturesApi = data.matches || [];

        const [partidosMap] = await pool.query(
            'SELECT numero_partido, api_fixture_id FROM Partidos WHERE api_fixture_id IS NOT NULL'
        );
        const mapaFixtureToNumero = {};
        partidosMap.forEach(p => { mapaFixtureToNumero[p.api_fixture_id] = p.numero_partido; });

        const [equiposDb] = await pool.query('SELECT id_equipo, nombre_equipo FROM Equipos');
        const mapaNombreAId = {};
        equiposDb.forEach(e => { mapaNombreAId[e.nombre_equipo] = e.id_equipo; });

        const resultados = [];

        for (const f of fixturesApi) {
            const numeroPartido = mapaFixtureToNumero[f.id];
            if (!numeroPartido) continue;

            let idEquipo1 = null;
            let idEquipo2 = null;

            if (numeroPartido >= 73) {
                const nombre1 = traducirEquipoApi(f.homeTeam?.name || f.homeTeam?.shortName);
                const nombre2 = traducirEquipoApi(f.awayTeam?.name || f.awayTeam?.shortName);
                idEquipo1 = nombre1 ? mapaNombreAId[nombre1] : null;
                idEquipo2 = nombre2 ? mapaNombreAId[nombre2] : null;

                if (!idEquipo1 || !idEquipo2) {
                    console.warn(`[DEBUG-PLAYOFF] Partido ${numeroPartido} (api_fixture_id ${f.id}) -> home: "${f.homeTeam?.name}" / away: "${f.awayTeam?.name}" -> resuelto: [${nombre1}, ${nombre2}]`);
                }

                if (idEquipo1) {
                    await pool.query('UPDATE Partidos SET id_equipo_1_fijo = ? WHERE numero_partido = ?', [idEquipo1, numeroPartido]);
                }
                if (idEquipo2) {
                    await pool.query('UPDATE Partidos SET id_equipo_2_fijo = ? WHERE numero_partido = ?', [idEquipo2, numeroPartido]);
                }
            }

            if (f.status === 'FINISHED') {
                let ganadorReal = 'E';
                if (f.score?.winner === 'HOME_TEAM') ganadorReal = 'L';
                else if (f.score?.winner === 'AWAY_TEAM') ganadorReal = 'V';

                let idGanadorPenales = null;
                if (f.score?.duration === 'PENALTY_SHOOTOUT' && f.score?.penalties) {
                    if (f.score.penalties.home > f.score.penalties.away) idGanadorPenales = idEquipo1;
                    else if (f.score.penalties.away > f.score.penalties.home) idGanadorPenales = idEquipo2;
                }

                resultados.push({
                    numero_partido: numeroPartido,
                    goles_1: f.score.fullTime.home,
                    goles_2: f.score.fullTime.away,
                    ganador_real: ganadorReal,
                    id_ganador_penales_real: idGanadorPenales
                });
            }
        }

        await pool.query('DELETE FROM Fixture_Resultados_Cache');
        await pool.query(
            'INSERT INTO Fixture_Resultados_Cache (datos_json) VALUES (?)',
            [JSON.stringify(resultados)]
        );

        console.log(`[CRON] Fixture sincronizado: ${resultados.length} partidos finalizados.`);

        for (const resultado of resultados) {
            await pool.query(
                'UPDATE Partidos SET goles_real_1 = ?, goles_real_2 = ?, id_ganador_penales_real = ? WHERE numero_partido = ?',
                [resultado.goles_1, resultado.goles_2, resultado.id_ganador_penales_real, resultado.numero_partido]
            );
            await pool.query('CALL CalcularPuntosPartido(?, ?, ?, ?, ?)', [
                resultado.numero_partido, resultado.goles_1, resultado.goles_2,
                resultado.ganador_real, resultado.id_ganador_penales_real
            ]);
        }
        if (resultados.length > 0) {
            console.log(`[CRON] Goles reales y puntos actualizados para ${resultados.length} partidos.`);
        }

    } catch (error) {
        console.error('[CRON] Error al sincronizar fixture:', error.message);
    }
}

cron.schedule('0 */3 * * *', obtenerYGuardarFixture, {
    timezone: 'America/Argentina/Buenos_Aires'
});

module.exports = { obtenerYGuardarFixture };