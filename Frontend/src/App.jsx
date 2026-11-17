  import React, { useState, useEffect } from 'react';
  import { useAuth } from './context/AuthContext';
  import Login from './views/Login';
  import Home from './views/Home';
  import Fixture from './views/Fixture';
  import Navbar from './components/Navbar';
  import NotificationModal from './components/NotificationModal';

  function App() {
    const { isAuthenticated, user } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const [currentTab, setCurrentTab] = useState(() => {
      return localStorage.getItem('currentTab') || 'inicio';
    });
    

    useEffect(() => {
    
    const hasSeenModal = localStorage.getItem('hasSeenNotificationModal');
    
    if (isAuthenticated && !hasSeenModal) {
      setShowModal(true);
    }
  }, [isAuthenticated]);

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem('hasSeenNotificationModal', 'true');
  };

    const handleSetTab = (tab) => {
      localStorage.setItem('currentTab', tab);
      setCurrentTab(tab);
    };

    if (!isAuthenticated) {
      return <Login />;
    }

    return (
      <div className="app-container">
        <NotificationModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        onPermissionGranted={handleCloseModal}
      />
        <main className="app-content">
          {!isAuthenticated ? <Login /> : (
            <>
              <div className="Header"></div>
              {currentTab === 'inicio' && <Home />}
              {currentTab === 'fixture' && <Fixture />}
              <Navbar currentTab={currentTab} setCurrentTab={handleSetTab} />
            </>
          )}
        </main>
      </div>
    );
  }

  export default App;