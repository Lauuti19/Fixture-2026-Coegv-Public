import api from './config';

export const registrarTokenNotificacion = async (token, idUsuario = null) => {
    try {
        await api.post('/notificaciones/token', { token });
    } catch (error) {
        console.error('Error al registrar token:', error);
    }
};