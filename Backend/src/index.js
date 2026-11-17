const express = require('express');
const cors = require('cors');

require('dotenv').config();
const pool = require('./config/db');
const { obtenerYGuardarFixture } = require('./jobs/syncFixtureJob');
const { calcularAvanceGrupos } = require('./jobs/calcularAvanceGruposJob');
const { iniciarCrons } = require('./jobs/notificacionesJob');

const authRoutes = require('./routes/authRoutes');
const partidosRoutes = require('./routes/partidosRoutes');
const notificacionesRoutes = require('./routes/notificacionesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor del fixture corriendo" });
});

app.use('/api/auth', authRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

async function esperarConexionDB(intentos = 15, delayMs = 2000) {
    for (let i = 1; i <= intentos; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('✅ Conexión a la base de datos lista.');
            return;
        } catch (error) {
            console.log(`⏳ Esperando base de datos (intento ${i}/${intentos})...`);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    console.error('❌ No se pudo conectar a la base de datos tras varios intentos.');
}

async function bootstrapJobs() {
    await esperarConexionDB();
    await obtenerYGuardarFixture();
    await calcularAvanceGrupos();
    console.log('✅ Jobs iniciales completados en orden.');
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    iniciarCrons();
    bootstrapJobs();
});