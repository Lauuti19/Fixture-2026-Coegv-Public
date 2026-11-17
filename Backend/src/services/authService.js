const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Fixture',
    waitForConnections: true,
    connectionLimit: 10
});

const registerUser = async (email, hashPassword) => {
    const [rows] = await pool.execute(
        'CALL RegistrarNuevoUsuario(?, ?)', 
        [email, hashPassword]
    );
    return rows[0][0].id_usuario_creado;
};

const getUserByEmail = async (email) => {
    const [rows] = await pool.execute('CALL IniciarSesionUsuario(?)', [email]);
    
    if (rows[0].length === 0) return null;
    
    return rows[0][0];
};

module.exports = {
    registerUser,
    getUserByEmail
};