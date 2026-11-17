import React, { useEffect, useState } from 'react';
import { getHistorialIlimitado } from '../api/partidosApi';

function HistorialPrevio({ equipo1, equipo2 }) {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Equipos recibidos:', equipo1, equipo2); 
        const cargarHistorial = async () => {
            if (equipo1 && equipo2) {
                setLoading(true);
                const datos = await getHistorialIlimitado(equipo1, equipo2);
                setHistorial(datos);
            }
            setLoading(false);
        };
        
        cargarHistorial();
    }, [equipo1, equipo2]); 

    if (loading) return <p style={{color: '#fff', textAlign: 'center'}}>Buscando historial...</p>;

    if (historial.length === 0) return (
    <div className="history-block-standalone">
        <div className="history-badge-title">
            ENCUENTROS PREVIOS
        </div>
        <div className="history-block-container">
            <p>
                SIN ENCUENTROS EN LOS MUNDIALES MÁS RECIENTES
            </p>
        </div>
    </div>
);

    return (
        <div className="history-block-standalone">
            <div className="history-badge-title">
                ENCUENTROS PREVIOS
            </div>
            
            <div className="history-results-list">
                {historial.map((h, index) => {
                    // Tomamos las primeras 3 letras del nombre real del JSON (ej: "Argentina" -> "ARG")
                    const abrev1 = h.nombre_original_1 ? h.nombre_original_1.slice(0, 3).toUpperCase() : 'LOC';
                    const abrev2 = h.nombre_original_2 ? h.nombre_original_2.slice(0, 3).toUpperCase() : 'VIS';
                    
                    // Formateamos la fecha al estilo mockup: "18 DIC 2022"
                    const fechaPartidoPrevio = h.fecha ? new Date(h.fecha + "T00:00:00").toLocaleDateString('es-AR', {
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                    }).replace('.', '').toUpperCase() : 'FECHA DESCONOCIDA';

                    return (
                        <React.Fragment key={h.id}>
                            <div className="history-match-row">
                                <div className="history-score-line">
                                    {abrev1} {h.goles_1} – {h.goles_2} {abrev2}
                                </div>
                                <div className="history-date-line">
                                    {fechaPartidoPrevio}
                                </div>
                            </div>
                            {index < historial.length - 1 && <hr className="history-divider" />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

export default HistorialPrevio;