const TRADUCCION_EQUIPOS = {
    'mexico': 'México', 'south africa': 'Sudáfrica', 'korea republic': 'Corea del Sur',
    'south korea': 'Corea del Sur', 'czechia': 'Chequia', 'czech republic': 'Chequia',
    'canada': 'Canadá',
    'bosnia and herzegovina': 'Bosnia y Herzegovina',
    'bosnia & herzegovina': 'Bosnia y Herzegovina',
    'bosnia-herzegovina': 'Bosnia y Herzegovina',
    'bosnia': 'Bosnia y Herzegovina',
    'qatar': 'Qatar', 'switzerland': 'Suiza', 'brazil': 'Brasil', 'morocco': 'Marruecos',
    'haiti': 'Haití', 'scotland': 'Escocia',
    'usa': 'Estados Unidos', 'united states': 'Estados Unidos',
    'united states of america': 'Estados Unidos', 'us': 'Estados Unidos',
    'paraguay': 'Paraguay', 'australia': 'Australia', 'turkey': 'Turquía', 'türkiye': 'Turquía',
    'germany': 'Alemania', 'curacao': 'Curazao', 'curaçao': 'Curazao',
    'ivory coast': 'Costa de Marfil', "cote d'ivoire": 'Costa de Marfil',
    "côte d'ivoire": 'Costa de Marfil', 'ecuador': 'Ecuador',
    'netherlands': 'Países Bajos', 'japan': 'Japón', 'sweden': 'Suecia', 'tunisia': 'Túnez',
    'belgium': 'Bélgica', 'egypt': 'Egipto', 'iran': 'Irán', 'ir iran': 'Irán',
    'new zealand': 'Nueva Zelanda', 'spain': 'España',
    'cape verde': 'Cabo Verde', 'cabo verde': 'Cabo Verde',
    'cape verde islands': 'Cabo Verde', 'cabo verde islands': 'Cabo Verde',
    'saudi arabia': 'Arabia Saudita', 'uruguay': 'Uruguay',
    'france': 'Francia', 'senegal': 'Senegal', 'iraq': 'Irak', 'norway': 'Noruega',
    'argentina': 'Argentina', 'algeria': 'Argelia', 'austria': 'Austria', 'jordan': 'Jordania',
    'portugal': 'Portugal', 'dr congo': 'República Democrática del Congo',
    'congo dr': 'República Democrática del Congo',
    'democratic republic of the congo': 'República Democrática del Congo',
    'uzbekistan': 'Uzbekistán', 'colombia': 'Colombia', 'england': 'Inglaterra',
    'croatia': 'Croacia', 'ghana': 'Ghana', 'panama': 'Panamá'
};

const traducirEquipoApi = (nombreApi) => {
    if (!nombreApi) return null;
    const clave = nombreApi.trim().toLowerCase();
    const traducido = TRADUCCION_EQUIPOS[clave];
    if (!traducido) {
        console.warn(`[TRADUCCION] Nombre de equipo no reconocido: "${nombreApi}"`);
    }
    return traducido || null;
};

module.exports = { traducirEquipoApi };