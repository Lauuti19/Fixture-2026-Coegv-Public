
// Backend/src/scripts/mapearFixtureIds.js
//
// Script de UNA SOLA EJECUCIÓN.
// Llama a football-data.org, cruza los partidos del Mundial 2026 con la tabla
// Partidos (por fecha/hora) y completa la columna api_fixture_id.
//
// Ejecutar con: node src/scripts/mapearFixtureIds.js
//
// Requisitos previos:
//   - ALTER TABLE Partidos ADD COLUMN api_fixture_id INT NULL UNIQUE;
//   - Variable de entorno FOOTBALL_DATA_TOKEN cargada (.env)
//     (registrate gratis en https://www.football-data.org/client/register)

require('dotenv').config();
const pool = require('../config/db');

const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;

// Tolerancia en minutos para considerar que dos fechas son "el mismo partido".
const TOLERANCIA_MINUTOS = 90;

async function main() {
    console.log('Consultando fixtures en football-data.org...');

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
    console.log(`Fixtures recibidos de la API: ${fixturesApi.length}`);
    console.log('resultSet:', JSON.stringify(data.resultSet));

    if (fixturesApi.length === 0) {
        console.error('La API no devolvió matches. Revisá FOOTBALL_DATA_TOKEN.');
        console.error('Respuesta completa:', JSON.stringify(data));
        process.exit(1);
    }

    const [partidosBD] = await pool.query(
        'SELECT id_partido, numero_partido, fecha_hora, id_equipo_1_fijo, id_equipo_2_fijo, api_fixture_id FROM Partidos ORDER BY numero_partido'
    );
    console.log(`Partidos en la BD: ${partidosBD.length}`);

    let actualizados = 0;
    let sinMatch = [];
    const fixtureIdsUsados = new Set(
        partidosBD.filter(p => p.api_fixture_id).map(p => p.api_fixture_id)
    );

    for (const partido of partidosBD) {
        if (partido.api_fixture_id) continue; // ya tiene fixture_id asignado

        // fecha_hora en la BD está en horario Argentina (GMT-3).
        const fechaBD = new Date(partido.fecha_hora);
        const fechaBD_UTC = new Date(fechaBD.getTime() + 3 * 60 * 60 * 1000); // sumamos 3hs

        let mejorMatch = null;
        let menorDiferencia = Infinity;

        for (const f of fixturesApi) {
            if (fixtureIdsUsados.has(f.id)) continue; // ya asignado a otro partido en esta corrida

            const fechaApi = new Date(f.utcDate);

            const diferenciaMinutos = Math.abs(fechaApi.getTime() - fechaBD_UTC.getTime()) / 60000;

            if (diferenciaMinutos <= TOLERANCIA_MINUTOS && diferenciaMinutos < menorDiferencia) {
                menorDiferencia = diferenciaMinutos;
                mejorMatch = f;
            }
        }

        if (mejorMatch) {
            await pool.query(
                'UPDATE Partidos SET api_fixture_id = ? WHERE id_partido = ?',
                [mejorMatch.id, partido.id_partido]
            );
            fixtureIdsUsados.add(mejorMatch.id);
            actualizados++;
            console.log(
                `Partido ${partido.numero_partido} -> fixture_id ${mejorMatch.id} ` +
                `(${mejorMatch.homeTeam.name} vs ${mejorMatch.awayTeam.name}, ` +
                `diferencia ${menorDiferencia.toFixed(0)} min)`
            );
        } else {
            sinMatch.push(partido.numero_partido);
        }
    }

    console.log(`\nTotal actualizados: ${actualizados}`);
    if (sinMatch.length > 0) {
        console.log(`Partidos SIN match automático (revisar manualmente): ${sinMatch.join(', ')}`);
        console.log('Esto es esperable en playoffs (16avos en adelante) donde los equipos todavía no están definidos:');
        console.log('la API puede no tener publicados esos fixtures hasta que se conozcan los equipos.');
    }

    process.exit(0);
}

main().catch((err) => {
    console.error('Error:', err.message);
    console.error(err.stack);
    if (err.sqlMessage) console.error('SQL:', err.sqlMessage);
    process.exit(1);
});