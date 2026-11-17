import React, { useState, useEffect } from 'react';
import { guardarPronostico } from '../api/partidosApi';
import '../styles/Modal.css';

function PartidoGrupoFila({ p, formatearFecha, onRefresh }) {
    const [isSaving, setIsSaving] = useState(false);

    const [goles1, setGoles1] = useState(p.goles_predichos_1 !== null ? p.goles_predichos_1 : "");
    const [goles2, setGoles2] = useState(p.goles_predichos_2 !== null ? p.goles_predichos_2 : "");

    useEffect(() => {
        setGoles1(p.goles_predichos_1 !== null && p.goles_predichos_1 !== undefined ? p.goles_predichos_1 : "");
        setGoles2(p.goles_predichos_2 !== null && p.goles_predichos_2 !== undefined ? p.goles_predichos_2 : "");
    }, [p.id_partido, p.goles_predichos_1, p.goles_predichos_2]);

    const nombreLocal = typeof p.equipo_1 === 'object' ? p.equipo_1?.nombre : p.equipo_1;
    const nombreVisitante = typeof p.equipo_2 === 'object' ? p.equipo_2?.nombre : p.equipo_2;
    const banderaLocal = p.bandera_1 || p.equipo_1?.bandera;
    const banderaVisitante = p.bandera_2 || p.equipo_2?.bandera;

    const ahora = new Date();
    const fechaPartido = p.fecha_hora ? new Date(p.fecha_hora) : null;
    const bloqueado = fechaPartido ? ahora >= fechaPartido : false;

    const hayResultadoReal = p.goles_real_1 !== null && p.goles_real_1 !== undefined;

    const handleConfirmar = async (e) => {
        e.stopPropagation();
        if (goles1 === "" || goles2 === "" || bloqueado) return;
        setIsSaving(true);

        try {
            await guardarPronostico({
                id_partido: p.id || p.id_partido,
                goles_equipo_1: parseInt(goles1, 10),
                goles_equipo_2: parseInt(goles2, 10),
                id_ganador_penales: null
            });
            localStorage.setItem('currentTab', 'fixture');
            if (onRefresh) await onRefresh();
        } catch (error) {
            alert("Error al guardar: " + JSON.stringify(error.response?.data || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <li className="partido-grupo-fila">
            <div className="modal-match-team-local">
                {banderaLocal ? (
                    <img
                        src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${banderaLocal.toUpperCase()}.svg`}
                        alt=""
                        className="modal-flag-img"
                    />
                ) : <div className="modal-flag-img empty-flag" />}
                <span className="team-name-modal">{nombreLocal || "Por asignar"}</span>
            </div>

            <div className="modal-match-goals-center">
                <input
                    type="number"
                    className="modal-goals-fases-input"
                    value={goles1}
                    onChange={e => setGoles1(e.target.value)}
                    disabled={bloqueado}
                />
                <span className="modal-match-divider">-</span>
                <input
                    type="number"
                    className="modal-goals-fases-input"
                    value={goles2}
                    onChange={e => setGoles2(e.target.value)}
                    disabled={bloqueado}
                />

                {!bloqueado && (
                    <button
                        type="button"
                        className="modal-confirm-match-fase-btn"
                        onClick={handleConfirmar}
                        disabled={isSaving}
                    >
                        {isSaving ? "..." : "✔"}
                    </button>
                )}
            </div>

            <div className="modal-match-team-visitante">
                <span className="team-name-modal">{nombreVisitante || "Por asignar"}</span>
                {banderaVisitante ? (
                    <img
                        src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${banderaVisitante.toUpperCase()}.svg`}
                        alt=""
                        className="modal-flag-img"
                    />
                ) : <div className="modal-flag-img empty-flag" />}
            </div>

            {hayResultadoReal && (
                <div className="partido-grupo-resultado-real">
                    Resultado oficial: {p.goles_real_1} - {p.goles_real_2}
                </div>
            )}
        </li>
    );
}

export default PartidoGrupoFila;