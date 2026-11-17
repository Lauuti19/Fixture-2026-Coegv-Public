import React from 'react';
import logoSensa from '/logoSensa.svg';
import fbIcon from '/Fb.webp';
import xIcon from '/X.webp';
import igIcon from '/ig.webp';
import ytIcon from '/yt.webp';
import telefonoSensa from '/telefonoSensa.webp';

function PromoBanner() {
    return (
        <section className="promo-banner">
            <div className="promo-brand-column">
                <div className="promo-text">Seguí cada<br />partido con</div>
                <img src={logoSensa} alt="Sensa" className="logo-sensa" />
            </div>
            <div className="promo-social-column">
                <span className="social-title">Seguinos en:</span>
                <div className="social-icons-row">
                    <img src={fbIcon} alt="Facebook" className="social-icon" />
                    <img src={xIcon} alt="X" className="social-icon" />
                    <img src={igIcon} alt="Instagram" className="social-icon" />
                    <img src={ytIcon} alt="YouTube" className="social-icon" />
                </div>
                <span className="social-user">@sensaok</span>
            </div>
            <div className="promo-phone-column">
                <img src={telefonoSensa} alt="Teléfono Sensa" className="phone-image" />
            </div>
        </section>
    );
}

export default PromoBanner;