import React from 'react';
import { useAuth } from '../context/AuthContext';
import inicioIcon from '/InicioIcon.webp';
import fixtureIcon from '/FixtureIcon.webp';
import salirIcon from '/SalirIcon.webp';

function Navbar({ currentTab, setCurrentTab }) {
    const { logout } = useAuth();

    return (
        <nav className="nav-footer">
            <button 
                type="button"
                className={`nav-item ${currentTab === 'inicio' ? 'active' : ''}`}
                onClick={() => setCurrentTab('inicio')}
            >
                <img src={inicioIcon} alt="Inicio" className="nav-icon-img" />
            </button>

            <button 
                type="button"
                className={`nav-item ${currentTab === 'fixture' ? 'active' : ''}`}
                onClick={() => setCurrentTab('fixture')}
            >
                <img src={fixtureIcon} alt="Fixture" className="nav-icon-img" />
            </button>

            <button 
                type="button"
                className="nav-item"
                onClick={logout}
            >
                <img src={salirIcon} alt="Salir" className="nav-icon-img" />
            </button>
        </nav>
    );
}

export default Navbar;