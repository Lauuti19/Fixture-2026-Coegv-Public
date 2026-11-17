import React, { useEffect, useState, useRef } from 'react';
import { getPlayoffs, getPartidosGrupo, getPosicionesGrupo, getMisPuntos } from '../api/partidosApi';
import PartidoCuadro from '../components/PartidoCuadro';
import PartidoGrupoFila from '../components/PartidoGrupoFila';
import ModalPartidoPlayoff from '../components/ModalPartidoPlayoff';
import copaMundial from '/copaMundial.webp';
import '../styles/Fixture.css';

const BANDERAS_POR_GRUPO = {
    A: ['MX', 'ZA', 'KR', 'CZ'],
    B: ['CA', 'BA', 'QA', 'CH'],
    C: ['BR', 'MA', 'HT', 'GB-SCT'],
    D: ['US', 'PY', 'AU', 'TR'],
    E: ['DE', 'CW', 'CI', 'EC'],
    F: ['NL', 'JP', 'SE', 'TN'],
    G: ['BE', 'EG', 'IR', 'NZ'],
    H: ['ES', 'CV', 'SA', 'UY'],
    I: ['FR', 'SN', 'IQ', 'NO'],
    J: ['AR', 'DZ', 'AT', 'JO'],
    K: ['PT', 'CD', 'UZ', 'CO'],
    L: ['GB-ENG', 'HR', 'GH', 'PA']
};

function Fixture() {
    const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

    const [playoffs, setPlayoffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [misPuntos, setMisPuntos] = useState(null);

    const [grupoIndex, setGrupoIndex] = useState(null);
    const grupoSeleccionado = grupoIndex !== null ? GRUPOS[grupoIndex] : null;

    const [partidosGrupo, setPartidosGrupo] = useState([]);
    const [tablaPosiciones, setTablaPosiciones] = useState([]);
    const [loadingGrupo, setLoadingGrupo] = useState(false);
    const [partidoPlayoffSeleccionado, setPartidoPlayoffSeleccionado] = useState(null);

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;

        const diffX = touchStartX.current - e.changedTouches[0].clientX;
        const diffY = touchStartY.current - e.changedTouches[0].clientY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            navegarGrupo(diffX > 0 ? 1 : -1);
        }

        touchStartX.current = null;
        touchStartY.current = null;
    };

    const cargarPlayoffs = async () => {
        try {
            const data = await getPlayoffs();
            const partidosArray = data && Array.isArray(data.partidos)
                ? data.partidos
                : (Array.isArray(data) ? data : []);
            setPlayoffs(partidosArray);
        } catch (err) {
            console.error("Error al cargar playoffs", err);
            setPlayoffs([]);
        }
    };

    const cargarPuntos = async () => {
        try {
            const data = await getMisPuntos();
            setMisPuntos(data);
        } catch (err) {
            console.error("Error al cargar puntos", err);
        }
    };

    useEffect(() => {
        const inicializar = async () => {
            setLoading(true);
            await Promise.all([cargarPlayoffs(), cargarPuntos()]);
            setLoading(false);
        };
        inicializar();
    }, []);

    const handleGrupoClick = async (letraGrupo) => {
        const idx = GRUPOS.indexOf(letraGrupo);
        setGrupoIndex(idx);
        setLoadingGrupo(true);
        try {
            const [partidosData, posicionesData] = await Promise.all([
                getPartidosGrupo(letraGrupo),
                getPosicionesGrupo(letraGrupo)
            ]);
            setPartidosGrupo(Array.isArray(partidosData) ? partidosData : []);
            setTablaPosiciones(Array.isArray(posicionesData) ? posicionesData : []);
        } catch (err) {
            console.error("Error al cargar datos del grupo", err);
            setPartidosGrupo([]);
            setTablaPosiciones([]);
        } finally {
            setLoadingGrupo(false);
        }
    };

    const navegarGrupo = async (direccion) => {
        const nuevoIndex = (grupoIndex + direccion + GRUPOS.length) % GRUPOS.length;
        setGrupoIndex(nuevoIndex);
        setLoadingGrupo(true);
        try {
            const letra = GRUPOS[nuevoIndex];
            const [partidosData, posicionesData] = await Promise.all([
                getPartidosGrupo(letra),
                getPosicionesGrupo(letra)
            ]);
            setPartidosGrupo(Array.isArray(partidosData) ? partidosData : []);
            setTablaPosiciones(Array.isArray(posicionesData) ? posicionesData : []);
        } catch (err) {
            setPartidosGrupo([]);
            setTablaPosiciones([]);
        } finally {
            setLoadingGrupo(false);
        }
    };

    const renderCuadro = (partido, claseFase) => (
        <div className="bracket-cell" key={partido.id_partido}>
            <div className={`bracket-box-color ${claseFase}`}>
                <PartidoCuadro
                    partido={partido}
                    onSelect={setPartidoPlayoffSeleccionado}
                    esFinal={claseFase === 'fase-final'}
                />
            </div>
        </div>
    );

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "Fecha a confirmar";
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-AR', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const filtrarPorFase = (nombreFaseBD) => {
        return playoffs.filter(partido =>
            partido.nombre_fase && partido.nombre_fase.toLowerCase() === nombreFaseBD.toLowerCase()
        );
    };

    const partidos16avos = filtrarPorFase('Dieciseisavos de Final');
    const partidosOctavos = filtrarPorFase('Octavos de Final');
    const partidosCuartos = filtrarPorFase('Cuartos de Final');
    const partidosSemifinales = filtrarPorFase('Semifinales');
    const tercerPuesto = filtrarPorFase('Tercer Puesto');
    const final = filtrarPorFase('Final');

    const handlePlayoffSaved = async () => {
        await cargarPlayoffs();
        setPartidoPlayoffSeleccionado(null);
    };

    if (loading) return <p role="status" className="loading-text">Cargando llaves del fixture...</p>;

    const playoffDataEnModal = partidoPlayoffSeleccionado
        ? playoffs.find(p => p.id_partido === partidoPlayoffSeleccionado.id_partido)
        : null;

    const renderGrupoBoton = (letra) => {
        const banderasGrupo = BANDERAS_POR_GRUPO[letra] || ['placeholder', 'placeholder', 'placeholder', 'placeholder'];
        return (
            <button key={letra} type="button" className="group-card-btn" onClick={() => handleGrupoClick(letra)}>
                <div className="group-flags-preview">
                    {banderasGrupo.map((codigo, idx) => (
                        codigo === 'placeholder' ? (
                            <div key={idx} className="flag-mini-circle empty"></div>
                        ) : (
                            <img
                                key={idx}
                                src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${codigo.toUpperCase()}.svg`}
                                alt=""
                                className="flag-mini-circle"
                                style={{ objectFit: 'cover' }}
                            />
                        )
                    ))}
                </div>
                <span className="group-label">Grupo {letra}</span>
            </button>
        );
    };

    return (
        <div className="fixture-view">

            {misPuntos !== null && (
                <div className="widget-puntos-flotante">
                    <span className="widget-puntos-label">PUNTOS</span>
                    <span className="widget-puntos-valor">{misPuntos.total_puntos}</span>
                </div>
            )}

            <header className="fixture-header">
                <h2>Selecciona grupo o partido para indicar resultado</h2>
            </header>

            <nav className="groups-row-layout">
                {['A', 'B', 'C', 'D', 'E', 'F'].map(letra => renderGrupoBoton(letra))}
            </nav>

            <section className="convergent-bracket-container">
                <div className="bracket-row row-16avos">
                    {partidos16avos.slice(0, 8).map(p => renderCuadro(p, 'fase-16avos'))}
                </div>
                <div className="bracket-row row-octavos">
                    {partidosOctavos.slice(0, 4).map(p => renderCuadro(p, 'fase-octavos'))}
                </div>
                <div className="bracket-row row-cuartos">
                    {partidosCuartos.slice(0, 2).map(p => renderCuadro(p, 'fase-cuartos'))}
                </div>
                <div className="bracket-row row-semis">
                    {partidosSemifinales.slice(0, 1).map(p => renderCuadro(p, 'fase-semis'))}
                </div>

                <div className="center-core-showcase">
                    <div className="core-side-box third-place-box">
                        <span className="core-box-title">3° PUESTO</span>
                        {tercerPuesto.slice(0, 1).map(p => renderCuadro(p, 'tercer-puesto'))}
                    </div>
                    <div className="core-trophy-wrapper">
                        <img src={copaMundial} alt="Copa del Mundo" className="main-world-cup-img" />
                    </div>
                    <div className="core-side-box champion-box">
                        <span className="core-box-title">FINAL</span>
                        {final.slice(0, 1).map(p => renderCuadro(p, 'fase-final'))}
                    </div>
                </div>

                <div className="bracket-row row-semis">
                    {partidosSemifinales.slice(1, 2).map(p => renderCuadro(p, 'fase-semis'))}
                </div>
                <div className="bracket-row row-cuartos">
                    {partidosCuartos.slice(2, 4).map(p => renderCuadro(p, 'fase-cuartos'))}
                </div>
                <div className="bracket-row row-octavos">
                    {partidosOctavos.slice(4, 8).map(p => renderCuadro(p, 'fase-octavos'))}
                </div>
                <div className="bracket-row row-16avos">
                    {partidos16avos.slice(8, 16).map(p => renderCuadro(p, 'fase-16avos'))}
                </div>
            </section>

            <nav className="groups-row-layout bottom-groups">
                {['G', 'H', 'I', 'J', 'K', 'L'].map(letra => renderGrupoBoton(letra))}
            </nav>

            <footer className="fixture-footer"></footer>

            {grupoSeleccionado && (
                <div className="modal-overlay">
                    <section
                        className="modal-content"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <header className="modal-header">
                            <button type="button" className="modal-nav-btn" onClick={() => navegarGrupo(-1)} aria-label="Grupo anterior">‹</button>
                            <h3 className="modal-title">Grupo {grupoSeleccionado}</h3>
                            <button type="button" className="modal-nav-btn" onClick={() => navegarGrupo(1)} aria-label="Grupo siguiente">›</button>
                            <button type="button" onClick={() => setGrupoIndex(null)} className="modal-close-btn">✕</button>
                        </header>
                        <div className="modal-grupo-dots">
                            {GRUPOS.map((g, i) => (
                                <button
                                    key={g}
                                    type="button"
                                    className={`grupo-dot ${i === grupoIndex ? 'active' : ''}`}
                                    onClick={() => handleGrupoClick(g)}
                                    aria-label={`Grupo ${g}`}
                                />
                            ))}
                        </div>
                        {loadingGrupo ? (
                            <p className="modal-loading-text">Cargando...</p>
                        ) : (
                            <div className="group-tables-wrapper">
                                <table className="modal-table-positions">
                                    <thead>
                                        <tr>
                                            <th className="text-left-padding">Equipo</th>
                                            <th>PTS</th>
                                            <th>GF</th>
                                            <th>GC</th>
                                            <th>DF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tablaPosiciones.map((row, idx) => (
                                            <tr key={row.id_equipo || idx} className="modal-table-row">
                                                <td className="team-cell-info">
                                                    <img
                                                        src={row.bandera ? `https://catamphetamine.gitlab.io/country-flag-icons/3x2/${row.bandera.toUpperCase()}.svg` : '/flags/placeholder.png'}
                                                        alt=""
                                                        className="modal-flag-img"
                                                    />
                                                    {row.equipo}
                                                </td>
                                                <td><strong>{row.puntos || 0}</strong></td>
                                                <td>{row.goles_favor || 0}</td>
                                                <td>{row.goles_contra || 0}</td>
                                                <td>{row.diferencia_goles || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <ul className="modal-matches-list">
                                    {partidosGrupo.map((p) => (
                                        <PartidoGrupoFila
                                            key={`${p.id_partido}-${p.goles_predichos_1}-${p.goles_predichos_2}`}
                                            p={p}
                                            formatearFecha={formatearFecha}
                                            onRefresh={async () => {
                                                await handleGrupoClick(grupoSeleccionado);
                                                await cargarPlayoffs();
                                            }}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {playoffDataEnModal && (
                <ModalPartidoPlayoff
                    partido={playoffDataEnModal}
                    onClose={() => setPartidoPlayoffSeleccionado(null)}
                    onSaveSuccess={handlePlayoffSaved}
                />
            )}
        </div>
    );
}

export default Fixture;