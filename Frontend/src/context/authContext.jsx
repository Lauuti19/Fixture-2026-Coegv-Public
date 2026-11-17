import { createContext, useState, useEffect, useContext } from 'react';
import { Capacitor } from '@capacitor/core';
import { registrarTokenNotificacion } from '../api/notificacionesApi';

const AuthContext = createContext(null);

const registrarTokenPush = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.removeAllListeners();
        PushNotifications.addListener('registration', async (fcmToken) => {
            console.log('Registrando token post-login:', fcmToken.value);
            await registrarTokenNotificacion(fcmToken.value);
            localStorage.setItem('token_enviado', 'true');
        });
        await PushNotifications.register();
    } catch (e) {
        console.error('Error registrando token push:', e);
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarSesion = () => {
            const tokenGuardado = localStorage.getItem('token');
            const usuarioGuardado = localStorage.getItem('usuario');
            if (tokenGuardado && usuarioGuardado) {
                setToken(tokenGuardado);
                setUser(JSON.parse(usuarioGuardado));
            }
            setLoading(false);
        };
        cargarSesion();
    }, []);

    const login = async (userData, tokenData) => {
        setToken(tokenData);
        setUser(userData);
        localStorage.setItem('token', tokenData);
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.removeItem('token_enviado'); 
        await registrarTokenPush(); 
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('token_enviado');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);