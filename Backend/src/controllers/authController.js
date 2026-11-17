const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const userId = await authService.registerUser(email, hashPassword);

        res.status(201).json({ 
            message: 'Usuario registrado con éxito y fixture inicializado.', 
            userId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Correo y contraseña requeridos.' });
        }

        const usuario = await authService.getUserByEmail(email);
        if (!usuario) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
        }

        const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordCorrecto) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, nombre: usuario.nombre },
            process.env.JWT_SECRET || 'secreto_cooperativa_viamonte',
            { expiresIn: '30d' } 
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

module.exports = {
    signup,
    login
};