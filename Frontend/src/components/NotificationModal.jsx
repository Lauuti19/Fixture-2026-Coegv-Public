import React from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import modalNotif from '../../public/modalNotif.webp'; 
import '../styles/NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, onPermissionGranted }) => {
  if (!isOpen) return null;

  const handleEnable = async () => {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      await PushNotifications.register();
      onPermissionGranted(); 
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* La 'X' en la esquina */}
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>

        {/* Imagen */}
        <img src={modalNotif} alt="Notificaciones" className="modal-image" />
        
        {/* Texto explicativo */}
        <h3>¡No te pierdas ningún partido!</h3>
        <p>Activá las notificaciones para recibir alertas de los partidos que se jugaran en el día y más noticias</p>
        
        {/* Botón de acción */}
        <button className="modal-enable-button" onClick={handleEnable}>
          Activar Notificaciones
        </button>
        
      </div>
    </div>
  );
};

export default NotificationModal;