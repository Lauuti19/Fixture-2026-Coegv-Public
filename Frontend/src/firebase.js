// firebase.js
import { initializeApp } from 'firebase/app';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const solicitarPermisoYObtenerToken = async () => {
    if (Capacitor.isNativePlatform()) return null;
    if (typeof window === 'undefined' || !('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;

    try {
        // Import dinámico — solo se carga cuando se llama, no al importar el módulo
        const { getMessaging, getToken } = await import('firebase/messaging');
        const messaging = getMessaging(app);

        const permiso = await Notification.requestPermission();
        if (permiso !== 'granted') return null;

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        return token;
    } catch (error) {
        console.error('Error obteniendo token FCM:', error);
        return null;
    }
};

export const escucharMensajes = async (callback) => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
        const { getMessaging, onMessage } = await import('firebase/messaging');
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
            callback(payload);
        });
    } catch (error) {
        console.error('Error escuchando mensajes:', error);
    }
};