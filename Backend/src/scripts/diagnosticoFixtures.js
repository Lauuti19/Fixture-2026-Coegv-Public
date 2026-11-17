
// Backend/src/scripts/diagnosticoFixtures.js
//
// Script de diagnóstico: muestra los fixtures de la API cercanos a las fechas
// de los partidos 35, 51, 52 (los que quedaron sin match), junto con los
// fixture_id ya usados, para identificar manualmente cuál corresponde.
//
// Ejecutar con: docker exec -it backend node src/scripts/diagnosticoFixtures.js
require('dotenv').config();
const pool = require('../config/db');

const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const NUMEROS_A_REVISAR = [35, 51, 52];

async function main() {
    const url = 'https://api.football-data.org/v4/competitions/WC/matches';
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }
    });
    const data = await response.json();
    const fixturesApi = data.matches || [];

    const [partidosBD] = await pool.query(
        'SELECT id_partido, numero_partido, fecha_hora, api_fixture_id, ' +
        'id_equipo_1_fijo, id_equipo_2_fijo FROM Partidos ORDER BY numero_partido'
    );

    const usados = new Set(
        partidosBD.filter(p => p.api_fixture_id).map(p => p.api_fixture_id)
    );

    // Traemos nombres de equipos para mostrar en el diagnóstico
    const [equipos] = await pool.query('SELECT id_equipo, nombre_equipo FROM Equipos');
    const nombreEquipo = {};
    equipos.forEach(e => { nombreEquipo[e.id_equipo] = e.nombre_equipo; });

    for (const num of NUMEROS_A_REVISAR) {
        const partido = partidosBD.find(p => p.numero_partido === num);
        const fechaBD = new Date(partido.fecha_hora);
        const fechaBD_UTC = new Date(fechaBD.getTime() + 3 * 60 * 60 * 1000);

        console.log(`\n=== Partido ${num} ===`);
        console.log(`Equipos BD: ${nombreEquipo[partido.id_equipo_1_fijo]} vs ${nombreEquipo[partido.id_equipo_2_fijo]}`);
        console.log(`Fecha BD (Arg): ${partido.fecha_hora}`);
        console.log(`Fecha BD convertida a UTC: ${fechaBD_UTC.toISOString()}`);
        console.log('Fixtures de la API dentro de +/- 4hs (usado = ya asignado a otro partido):');

        for (const f of fixturesApi) {
            const fechaApi = new Date(f.utcDate);
            const diffMin = (fechaApi.getTime() - fechaBD_UTC.getTime()) / 60000;
            if (Math.abs(diffMin) <= 240) {
                console.log(
                    `  fixture_id ${f.id} | ${f.homeTeam.name} vs ${f.awayTeam.name} | ` +
                    `${f.utcDate} | diff ${diffMin.toFixed(0)} min | ` +
                    `${usados.has(f.id) ? 'USADO' : 'LIBRE'}`
                );
            }
        }
    }

    process.exit(0);
}

main().catch((err) => {
    console.error('Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});