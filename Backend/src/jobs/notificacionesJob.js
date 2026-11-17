const cron = require('node-cron');
const { enviarNotificacionMasiva, obtenerPartidosDeHoy } = require('../services/notificacionesService');

const FECHA_LIMITE = new Date('2026-07-19T23:59:59-03:00');

const mundialActivo = () => new Date() <= FECHA_LIMITE;

const iniciarCrons = () => {

    cron.schedule('0 12 * * *', async () => {
        if (!mundialActivo()) return;
        try {
            const partidos = await obtenerPartidosDeHoy();
            if (!partidos.length) return;

            const listaPartidos = partidos
                .map(p => {
                    const hora = p.fecha_hora.toISOString().substring(11, 16);
                    return `${hora}hs — ${p.equipo_1 || 'Por definir'} vs ${p.equipo_2 || 'Por definir'}`;
                })
                .join('\n');

            await enviarNotificacionMasiva(
                `⚽ ${partidos.length} partido${partidos.length > 1 ? 's' : ''} hoy en el Mundial`,
                listaPartidos
            );
        } catch (err) {
            console.error('Error cron matutino:', err);
        }
    }, { timezone: 'America/Argentina/Buenos_Aires' });

    cron.schedule('0 11 * * *', async () => {
        if (!mundialActivo()) return;
        try {
            const partidos = await obtenerPartidosDeHoy();
            const partidoArgentina = partidos.find(p =>
                p.equipo_1?.toLowerCase().includes('argentina') ||
                p.equipo_2?.toLowerCase().includes('argentina')
            );

            if (!partidoArgentina) return;

            const hora = partidoArgentina.fecha_hora.toISOString().substring(11, 16);
            const rival = partidoArgentina.equipo_1?.toLowerCase().includes('argentina')
                ? partidoArgentina.equipo_2
                : partidoArgentina.equipo_1;

            await enviarNotificacionMasiva(
                '🇦🇷 ¡Hoy juega Argentina!',
                `Argentina vs ${rival || 'su rival'} a las ${hora}hs. ¡Hacé tu pronóstico!`
            );
        } catch (err) {
            console.error('Error cron Argentina:', err);
        }
    }, { timezone: 'America/Argentina/Buenos_Aires' });

    cron.schedule('0 21 * * *', async () => {
        if (!mundialActivo()) return;
        try {
            await enviarNotificacionMasiva(
                '🌍 ¡El Mundial sigue adelante!',
                'Y nosotros apoyamos con más energía que nunca para que no te pierdas nada. Seguí todos los partidos en Sensa TV.'
            );
        } catch (err) {
            console.error('Error cron vespertino:', err);
        }
    }, { timezone: 'America/Argentina/Buenos_Aires' });

    console.log('✅ Crons de notificaciones iniciados');
};

module.exports = { iniciarCrons };