const { messaging } = require('../config/firebaseAdmin');
const pool = require('../config/db');

const enviarNotificacionMasiva = async (titulo, cuerpo) => {
    if (!messaging) {
        console.log('ℹ️ Notificación omitida (Firebase no configurado):', titulo);
        return;
    }

    const [rows] = await pool.query('SELECT DISTINCT token FROM Usuario_FCM_Tokens');
    if (!rows.length) return;

    const tokens = rows.map(r => r.token);
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
    }

    for (const chunk of chunks) {
        const mensaje = {
            notification: { title: titulo, body: cuerpo },
            webpush: {
                notification: {
                    icon: '/logoSensa.svg',
                    badge: '/logoSensa.svg',
                    vibrate: [200, 100, 200]
                },
                fcmOptions: { link: '/' }
            },
            tokens: chunk
        };

        const resultado = await messaging.sendEachForMulticast(mensaje);

        resultado.responses.forEach((resp, idx) => {
            if (!resp.success &&
                resp.error?.code === 'messaging/registration-token-not-registered') {
                pool.query('DELETE FROM Usuario_FCM_Tokens WHERE token = ?', [chunk[idx]]);
            }
        });
    }
};

const obtenerPartidosDeHoy = async () => {
    const [rows] = await pool.query(`
        SELECT p.*,
               e1.nombre_equipo AS equipo_1,
               e2.nombre_equipo AS equipo_2
        FROM Partidos p
        LEFT JOIN Equipos e1 ON p.id_equipo_1_fijo = e1.id_equipo
        LEFT JOIN Equipos e2 ON p.id_equipo_2_fijo = e2.id_equipo
        WHERE DATE(p.fecha_hora) = CURDATE()
        ORDER BY p.fecha_hora ASC
    `);
    return rows;
};

module.exports = { enviarNotificacionMasiva, obtenerPartidosDeHoy };