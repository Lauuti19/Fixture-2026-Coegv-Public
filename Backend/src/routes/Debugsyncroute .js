const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;

router.get('/debug-sync', async (req, res) => {
    const diagnostico = {};

    try {
        diagnostico.token_presente = !!FOOTBALL_DATA_TOKEN;
        diagnostico.token_preview = FOOTBALL_DATA_TOKEN
            ? FOOTBALL_DATA_TOKEN.slice(0, 4) + '...' + FOOTBALL_DATA_TOKEN.slice(-4)
            : null;

        // 1. Llamada a la API
        const url = 'https://api.football-data.org/v4/competitions/WC/matches';
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }
        });

        diagnostico.http_status = response.status;

        const data = await response.json();
        diagnostico.resultSet = data.resultSet || null;
        diagnostico.errors_api = data.errors || null;

        const fixturesApi = data.matches || [];
        diagnostico.total_fixtures_api = fixturesApi.length;
        diagnostico.fixtures_finished = fixturesApi.filter(f => f.status === 'FINISHED').length;
        diagnostico.estados_presentes = [...new Set(fixturesApi.map(f => f.status))];

        // 2. Mapa de api_fixture_id en la BD
        const [partidosMap] = await pool.query(
            'SELECT numero_partido, api_fixture_id FROM Partidos WHERE api_fixture_id IS NOT NULL'
        );
        diagnostico.partidos_con_fixture_id = partidosMap.length;

        const mapaFixtureToNumero = {};
        partidosMap.forEach(p => { mapaFixtureToNumero[p.api_fixture_id] = p.numero_partido; });

        // 3. Cruce final
        const finishedFixtureIds = fixturesApi
            .filter(f => f.status === 'FINISHED')
            .map(f => ({ id: f.id, home: f.homeTeam.name, away: f.awayTeam.name }));

        diagnostico.finished_fixture_ids = finishedFixtureIds;

        const resultados = fixturesApi
            .filter(f => mapaFixtureToNumero[f.id] && f.status === 'FINISHED')
            .map(f => ({
                numero_partido: mapaFixtureToNumero[f.id],
                goles_1: f.score.fullTime.home,
                goles_2: f.score.fullTime.away,
                estado: f.status,
                fixture_id: f.id
            }));

        diagnostico.resultados_finales = resultados;

        res.json(diagnostico);
    } catch (error) {
        diagnostico.error = error.message;
        res.status(500).json(diagnostico);
    }
});

module.exports = router;