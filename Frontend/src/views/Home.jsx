import React, { useEffect, useState } from 'react';
import { getPartidosDelDia } from '../api/partidosApi';
import PromoBanner from '../components/PromoBanner';
import PartidosDelDia from '../components/PartidosDelDia';
import '../styles/Home.css';

const FECHA_FIN_MUNDIAL = new Date('2026-07-19T23:59:59-03:00');

function Home() {
    const [partidos, setPartidos] = useState([]);
    const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const mundialFinalizado = new Date() > FECHA_FIN_MUNDIAL;

    useEffect(() => {
        const cargarDatosHome = async () => {
            try {
                const data = await getPartidosDelDia();
                setPartidos(data);
                if (data.length) setPartidoSeleccionado(data[0]);
            } catch (err) {
                setError('No se pudo cargar la información de la página principal.');
            } finally {
                setLoading(false);
            }
        };
        cargarDatosHome();
    }, []);

    return (
        <main className="home-container">
            <header className="home-main-header"></header>
            <PromoBanner />

            <section className="next-match-section">
                {loading ? (
                    <p role="status" className="home-status-message">Cargando partidos del día...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : mundialFinalizado ? (
                    <p className="home-status-message">El Mundial ya finalizó. ¡Gracias por participar!.</p>
                ) : partidos.length ? (
                    <PartidosDelDia
                        partidos={partidos}
                        partidoSeleccionado={partidoSeleccionado}
                        onSeleccionar={setPartidoSeleccionado}
                    />
                ) : (
                    <p className="home-status-message">No hay partidos próximos a la fecha.</p>
                )}
            </section>

            <footer className="home-footer"></footer>
        </main>
    );
}

export default Home;