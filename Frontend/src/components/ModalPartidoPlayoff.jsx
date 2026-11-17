import React, { useState } from 'react';
import { guardarPronostico } from '../api/partidosApi';
import '../styles/Modal.css';

function ModalPartidoPlayoff({ partido, onClose, onSaveSuccess }) {
    const [isSaving, setIsSaving] = useState(false);
    const [goles1, setGoles1] = useState(partido.goles_predichos_1 !== null ? partido.goles_predichos_1 : "");
    const [goles2, setGoles2] = useState(partido.goles_predichos_2 !== null ? partido.goles_predichos_2 : "");
    const [ganadorPenales, setGanadorPenales] = useState(partido.id_ganador_penales || "");

    const nombre1 = typeof partido.equipo_1 === 'object' ? partido.equipo_1?.nombre : partido.equipo_1;
    const nombre2 = typeof partido.equipo_2 === 'object' ? partido.equipo_2?.nombre : partido.equipo_2;
    const bandera1 = partido.bandera_1 || partido.equipo_1?.bandera;
    const bandera2 = partido.bandera_2 || partido.equipo_2?.bandera;

    const listosParaJugar = !!(partido.id_equipo_1 || partido.equipo_1) && !!(partido.id_equipo_2 || partido.equipo_2);

    const ahora = new Date();
    const fechaPartido = partido.fecha_hora ? new Date(partido.fecha_hora) : null;
    const bloqueado = fechaPartido ? ahora >= fechaPartido : false;

    const hayResultadoReal = partido.goles_real_1 !== null && partido.goles_real_1 !== undefined;

    const fechaFormateada = fechaPartido
        ? fechaPartido.toLocaleDateString('es-AR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
              timeZone: 'America/Argentina/Buenos_Aires'
          })
        : null;

    const horaFormateada = fechaPartido
        ? fechaPartido.toLocaleTimeString('es-AR', {
            hour: '2-digit', minute: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires'
        })
        : null;

    const flag = (url) =>
        url ? `https://catamphetamine.gitlab.io/country-flag-icons/3x2/${url.toUpperCase()}.svg` : null;

    const handleGuardarPlayoff = async () => {
        if (!listosParaJugar || goles1 === "" || goles2 === "" || bloqueado) return;
        const g1 = parseInt(goles1, 10);
        const g2 = parseInt(goles2, 10);

        if (g1 === g2 && !ganadorPenales) {
            alert("Elige ganador por penales");
            return;
        }

        setIsSaving(true);
        try {
            await guardarPronostico({
                id_partido: partido.id_partido,
                goles_equipo_1: g1,
                goles_equipo_2: g2,
                id_ganador_penales: g1 === g2 ? parseInt(ganadorPenales, 10) : null
            });
            if (onSaveSuccess) await onSaveSuccess(partido.id_partido);
        } catch (error) {
            alert("Error al guardar el playoff");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section className="modal-content playoff-modal-compact" onClick={e => e.stopPropagation()}>

                <header className="modal-header">
                    <h3 className="modal-title">Partido N° {partido.numero_partido}</h3>
                    <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
                </header>

                {fechaFormateada && (
                    <div className="playoff-match-info">
                        <span className="playoff-match-date">{fechaFormateada}</span>
                        <span className="playoff-match-time">{horaFormateada}</span>
                        {partido.nombre_estadio && (
                            <span className="playoff-match-stadium">
                                {partido.nombre_estadio}
                                {partido.ciudad ? ` — ${partido.ciudad}` : ''}
                            </span>
                        )}
                    </div>
                )}

                {bloqueado && (
                    <div className="playoff-blocked-banner">
                        Este partido ya comenzó
                    </div>
                )}

                <div className="playoff-versus-container">
                    <div className="playoff-team-side left">
                        {flag(bandera1)
                            ? <img src={flag(bandera1)} alt="" className="modal-flag-img playoff-flag" />
                            : <div className="modal-flag-img empty-flag playoff-flag" />
                        }
                        <span className="playoff-team-name">{nombre1 || "Por asignar"}</span>
                    </div>

                    <span className="vs-badge">VS</span>

                    <div className="playoff-team-side right">
                        <span className="playoff-team-name">{nombre2 || "Por asignar"}</span>
                        {flag(bandera2)
                            ? <img src={flag(bandera2)} alt="" className="modal-flag-img playoff-flag" />
                            : <div className="modal-flag-img empty-flag playoff-flag" />
                        }
                    </div>
                </div>

                {!listosParaJugar ? (
                    <p className="playoff-pending-text">
                        Los equipos de este cruce aún no están definidos
                    </p>
                ) : (
                    <>
                        <div className="modal-match-goals-center margin-v-15">
                            <input
                                type="number"
                                className="modal-goals-input large"
                                value={goles1}
                                onChange={e => setGoles1(e.target.value)}
                                disabled={bloqueado}
                                min={0}
                            />
                            <span className="modal-match-divider">-</span>
                            <input
                                type="number"
                                className="modal-goals-input large"
                                value={goles2}
                                onChange={e => setGoles2(e.target.value)}
                                disabled={bloqueado}
                                min={0}
                            />
                        </div>

                        {goles1 !== "" && goles2 !== "" && parseInt(goles1) === parseInt(goles2) && !bloqueado && (
                            <select
                                value={ganadorPenales}
                                onChange={e => setGanadorPenales(e.target.value)}
                                className="modal-select-penalties"
                            >
                                <option value="">-- Avanza por penales --</option>
                                <option value={partido.id_equipo_1}>{nombre1}</option>
                                <option value={partido.id_equipo_2}>{nombre2}</option>
                            </select>
                        )}

                        {bloqueado && goles1 !== "" && goles2 !== "" && parseInt(goles1) === parseInt(goles2) && ganadorPenales && (
                            <p className="playoff-penales-info">
                                Avanza por penales: <strong>
                                    {ganadorPenales == partido.id_equipo_1 ? nombre1 : nombre2}
                                </strong>
                            </p>
                        )}
                    </>
                )}

                {hayResultadoReal && (
                    <div className="playoff-resultado-oficial">
                        <span className="playoff-resultado-label">Resultado oficial</span>
                        <div className="playoff-resultado-scores">
                            <span className="playoff-resultado-nombre">{nombre1}</span>
                            <span className="playoff-resultado-marcador">
                                {partido.goles_real_1} — {partido.goles_real_2}
                            </span>
                            <span className="playoff-resultado-nombre">{nombre2}</span>
                        </div>
                    </div>
                )}

                {!bloqueado && listosParaJugar && (
                    <div className="modal-actions-wrapper">
                        <button
                            type="button"
                            onClick={handleGuardarPlayoff}
                            disabled={isSaving || goles1 === "" || goles2 === ""}
                            className="modal-confirm-match-btn padding-btn"
                        >
                            {isSaving ? "Guardando..." : "Guardar pronóstico"}
                        </button>
                        <button type="button" onClick={onClose} className="modal-close-btn secondary">
                            Cancelar
                        </button>
                    </div>
                )}

                {bloqueado && (
                    <div className="modal-actions-wrapper">
                        <button type="button" onClick={onClose} className="modal-close-btn secondary">
                            Cerrar
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default ModalPartidoPlayoff;