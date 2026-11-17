import api from './config';

export const getPartidosDelDia = async () => {
    const response = await api.get('/partidos/proximos');
    return response.data;
};

export const getPlayoffs = async () => {
    const response = await api.get('/partidos/playoffs');
    return response.data;
};

export const getPartidosGrupo = async (letra) => {
    const response = await api.get(`/partidos/grupo/${letra}`);
    return response.data.partidos;
};

export const getPosicionesGrupo = async (letra) => {
    const response = await api.get(`/partidos/posiciones/${letra}`);
    return response.data.tabla;
};

export const guardarPronostico = async (datosResultado) => {
    const response = await api.post('/partidos/pronostico', datosResultado);
    return response.data;
};

export const getHistorialIlimitado = async (equipo1, equipo2) => {
    if (!equipo1 || !equipo2) return [];

    const mapaEspanolIngles = {
        "alemania": "germany", "arabia saudita": "saudi arabia", "argelia": "algeria",
        "argentina": "argentina", "australia": "australia", "bélgica": "belgium",
        "belgica": "belgium", "brasil": "brazil", "camerún": "cameroon",
        "camerun": "cameroon", "canadá": "canada", "canada": "canada",
        "catar": "qatar", "chile": "chile", "colombia": "colombia",
        "corea del sur": "south korea", "costa de marfil": "ivory coast",
        "costa rica": "costa rica", "croacia": "croatia", "dinamarca": "denmark",
        "ecuador": "ecuador", "egipto": "egypt", "escocia": "scotland",
        "eslovaquia": "slovakia", "eslovenia": "slovenia", "españa": "spain",
        "espana": "spain", "estados unidos": "usa", "eeuu": "usa",
        "francia": "france", "gales": "wales", "ghana": "ghana",
        "grecia": "greece", "honduras": "honduras", "inglaterra": "england",
        "irán": "iran", "iran": "iran", "irlanda": "ireland",
        "islandia": "iceland", "italia": "italy", "japón": "japan",
        "japon": "japan", "marruecos": "morocco", "méxico": "mexico",
        "mexico": "mexico", "nigeria": "nigeria", "nueva zelanda": "new zealand",
        "países bajos": "netherlands", "paises bajos": "netherlands",
        "holanda": "netherlands", "panamá": "panama", "panama": "panama",
        "paraguay": "paraguay", "perú": "peru", "peru": "peru",
        "polonia": "poland", "portugal": "portugal", "república checa": "czech republic",
        "rusia": "russia", "senegal": "senegal", "serbia": "serbia",
        "sudáfrica": "south africa", "suecia": "sweden", "suiza": "switzerland",
        "túnez": "tunisia", "tunez": "tunisia", "turquía": "turkey",
        "ucrania": "ukraine", "uruguay": "uruguay"
    };

    const traducir = (nombre) => {
        const limpio = nombre.trim().toLowerCase();
        return mapaEspanolIngles[limpio] || limpio;
    };

    const eq1Ingles = traducir(equipo1);
    const eq2Ingles = traducir(equipo2);

    const anosMundiales = ['2022', '2018', '2014'];
    const crucesEncontrados = [];

    try {
        await Promise.all(anosMundiales.map(async (ano) => {
            try {
                const url = `https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/${ano}/worldcup.json`;
                const response = await fetch(url);
                if (!response.ok) return;

                const data = await response.json();
                if (!data || !data.matches) return;

                data.matches.forEach(match => {
                    if (!match || !match.team1 || !match.team2) return;

                    const casa = (typeof match.team1 === 'string' ? match.team1 : match.team1.name).toLowerCase();
                    const visita = (typeof match.team2 === 'string' ? match.team2 : match.team2.name).toLowerCase();

                    if ((casa === eq1Ingles && visita === eq2Ingles) || (casa === eq2Ingles && visita === eq1Ingles)) {
                        const esLocalEq1 = casa === eq1Ingles;

                        let golesCasa = 0;
                        let golesVisita = 0;

                        if (match.score) {
                            const nodoScore = match.score.et || match.score.ft;
                            if (Array.isArray(nodoScore) && nodoScore.length === 2) {
                                golesCasa = nodoScore[0];
                                golesVisita = nodoScore[1];
                            }
                        }

                        crucesEncontrados.push({
                            id: match.num || `${ano}-${Math.random()}`,
                            fecha: match.date || ano,
                            nombre_original_1: typeof match.team1 === 'string' ? match.team1 : match.team1.name,
                            nombre_original_2: typeof match.team2 === 'string' ? match.team2 : match.team2.name,
                            goles_1: esLocalEq1 ? golesCasa : golesVisita,
                            goles_2: esLocalEq1 ? golesVisita : golesCasa
                        });
                    }
                });
            } catch (err) {
                console.warn(`Error procesando año ${ano}:`, err);
            }
        }));

        return crucesEncontrados
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3);

    } catch (error) {
        console.error("Error general:", error);
        return [];
    }
};

export const getMisPuntos = async () => {
    const response = await api.get('/partidos/mis-puntos');
    return response.data;
};

export const getFixtureCache = async () => {
    const response = await api.get('/partidos/cache');
    return response.data;
};