const pool = require('../config/db');
const { messaging } = require('../config/firebaseAdmin');

const enviarBienvenida = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token requerido.' });

    const message = {
        token: token,
        notification: {
            title: '¡Bienvenido a COEGV Mundial!',
            body: 'No te pierdas ningún partido y completa los resultados. ¡Si quedas en el podio podrás obtener una bonificación!'
        },
        webpush: {
            notification: {
                icon: '/logoSensa.svg',
                badge: '/logoSensa.svg'
            },
            fcmOptions: { link: '/' }
        }
    };

    try {
        await messaging.send(message);
        res.status(200).json({ message: 'Bienvenida enviada con éxito.' });
    } catch (error) {
        console.error('Error al enviar bienvenida:', error);
        res.status(500).json({ message: 'Error enviando bienvenida.', error: error.message });
    }
};

const registrarToken = async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token requerido.' });

        await pool.query(
            `INSERT INTO Usuario_FCM_Tokens (id_usuario, token) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE fecha_registro = CURRENT_TIMESTAMP`,
            [idUsuario, token]
        );

        res.status(200).json({ message: 'Token registrado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando token.', error: error.message });
    }
};

module.exports = { enviarBienvenida, registrarToken };