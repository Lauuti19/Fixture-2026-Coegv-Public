import React from 'react';

function PartidoCard({ partido, seleccionado, onSeleccionar }) {
    const hora = new Date(partido.fecha_hora).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
    });

    const flag = (url) =>
        url
            ? `https://catamphetamine.gitlab.io/country-flag-icons/3x2/${url.toUpperCase()}.svg`
            : '/flags/placeholder.png';

    return (
         <div 
            className={`match-card ${seleccionado ? 'match-card--selected' : ''}`}
            onClick={() => onSeleccionar(partido)}
            style={{ cursor: 'pointer' }}
        >
            <time className="match-datetime">{hora}</time>

            <div className="match-teams-row">
                <article className="team-info">
                    <img src={flag(partido.bandera_1)} alt={partido.equipo_1 || '?'} className="team-flag" />
                    <strong className="team-name">{partido.equipo_1 || 'Por asignar'}</strong>
                </article>

                <div className="match-separator">VS</div>

                <article className="team-info">
                    <img src={flag(partido.bandera_2)} alt={partido.equipo_2 || '?'} className="team-flag" />
                    <strong className="team-name">{partido.equipo_2 || 'Por asignar'}</strong>
                </article>
            </div>

            {partido.estadio && (
                <footer className="match-location-footer">
                    {partido.estadio}{partido.ciudad ? ` — ${partido.ciudad}` : ''}
                </footer>
            )}
        </div>
    );
}

function PartidosDelDia({ partidos, partidoSeleccionado, onSeleccionar }) {
    if (!partidos?.length) return null;

    const fecha = new Date(partidos[0].fecha_hora).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires'
    });

    return (
        <section className="partidos-del-dia">
            <header className="match-card-header">
                <h3>Partidos de hoy</h3>
                <h2>{fecha}</h2>
            </header>

            <div className="partidos-del-dia-list">
                {partidos.map(p => (
                    <PartidoCard
                        key={p.id_partido}
                        partido={p}
                        seleccionado={partidoSeleccionado?.id_partido === p.id_partido}
                        onSeleccionar={onSeleccionar}
                    />
                ))}
            </div>
        </section>
    );
}

export default PartidosDelDia;