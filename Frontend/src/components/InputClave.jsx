import React, { useState } from 'react';

function InputClave({ id, label, value, onChange, placeholder, autoComplete }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-field-group">
            <label htmlFor={id}>{label}</label>
            <div className="password-input-container">
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    id={id} 
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required
                />
                <button 
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
                >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
            </div>
        </div>
    );
}

export default InputClave;