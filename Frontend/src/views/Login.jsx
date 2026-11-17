import React, { useState } from 'react';
import { loginUsuario, registrarUsuario } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import InputClave from '../components/InputClave';
import '../styles/Login.css';

function Login() {
    const { login } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password || (isRegister && !confirmPassword)) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        if (isRegister && password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        try {
            setLoading(true);
            if (isRegister) {
                await registrarUsuario({ email, password });
                setConfirmPassword('');
                setSuccess('¡Registro exitoso! Redirigiendote para iniciar sesión.');
                setTimeout(() => {
                    setIsRegister(false);
                    setSuccess('');
                }, 3000);
            } else {
                const data = await loginUsuario( email, password );
                login(data.usuario, data.token);
            }
        } catch (err) {
            const mensajeError = err.response?.data?.message || 'Ocurrió un error inesperado.';
            setError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <main className="login-screen-container">
            <section className="login-card">

                <header className="login-card-header">
                    <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                </header>

                {error && <div className="login-error-message">{error}</div>}
                {success && <div className="login-success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="login-form">

                    <div className="login-field-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@correo.com"
                            autoComplete='email'
                            required
                        />
                    </div>

                    <InputClave
                        id="password"
                        label="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />

                    {isRegister && (
                        <InputClave
                            id="confirmPassword"
                            label="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    )}

                    <button type="submit" disabled={loading} className="btn-login-submit">
                        {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
                    </button>
                </form>

                <footer className="login-card-footer">
                    <button
                        type="button"
                        onClick={handleToggleMode}
                        className="btn-login-toggle"
                    >
                        {isRegister ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate acá'}
                    </button>
                </footer>
            </section>
        </main>
    );
}

export default Login;