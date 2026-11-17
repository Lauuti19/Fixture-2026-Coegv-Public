import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { solicitarPermisoYObtenerToken, escucharMensajes } from '../firebase';
import { registrarTokenNotificacion } from '../api/notificacionesApi';

export const useNotificaciones = (idUsuario = null) => {
    useEffect(() => {
        // En nativo el registro ya se maneja desde AuthContext después del login
        if (Capacitor.isNativePlatform()) return;

        const inicializarWeb = async () => {
            const token = await solicitarPermisoYObtenerToken();
            if (!token) return;
            await registrarTokenNotificacion(token, idUsuario);
            escucharMensajes((payload) => {
                console.log('Notificación en foreground (web):', payload);
            });
        };

        if (idUsuario && !localStorage.getItem('token_enviado')) {
            inicializarWeb().then(() => localStorage.setItem('token_enviado', 'true'));
        }
    }, [idUsuario]);
};