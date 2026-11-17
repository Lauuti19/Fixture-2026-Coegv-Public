const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

let messagingInstance = null;

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

if (!raw) {
    console.log('ℹ️ Firebase deshabilitado: no hay FIREBASE_SERVICE_ACCOUNT_B64 configurada.');
} else {
    try {
        if (!getApps().length) {
            const serviceAccount = JSON.parse(
                Buffer.from(raw, 'base64').toString('utf-8')
            );

            initializeApp({
                credential: cert(serviceAccount),
            });

            console.log('✅ Firebase Admin inicializado correctamente');
        }
        messagingInstance = getMessaging();
    } catch (error) {
        console.error('❌ Error inicializando Firebase Admin:', error.message);
    }
}

module.exports = { messaging: messagingInstance };