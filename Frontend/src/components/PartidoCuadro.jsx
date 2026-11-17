import React from 'react';

function PartidoCuadro({ partido, onSelect, esFinal }) {
    const nombreLocal = partido.equipo_1 || "TBD";
    const nombreVisitante = partido.equipo_2 || "TBD";
    const banderaLocal = partido.bandera_1;
    const banderaVisitante = partido.bandera_2;

    return (
        <div className="playoff-match-card" onClick={() => onSelect(partido)}>
            
            <div className="playoff-flag-slot">
                {banderaLocal ? (
                    <img 
                        src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${banderaLocal.toUpperCase()}.svg`} 
                        alt="" 
                        className="playoff-mini-flag" 
                    />
                ) : (
                    <div className="playoff-mini-flag empty"></div>
                )}
            </div>

            <span className="score">
                {partido.goles_predichos_1 ?? "-"} - {partido.goles_predichos_2 ?? "-"}
            </span>

            <div className="playoff-flag-slot">
                {banderaVisitante ? (
                    <img 
                        src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${banderaVisitante.toUpperCase()}.svg`} 
                        alt="" 
                        className="playoff-mini-flag" 
                    />
                ) : (
                    <div className="playoff-mini-flag empty"></div>
                )}
            </div>
        </div>
    );
}

export default PartidoCuadro;