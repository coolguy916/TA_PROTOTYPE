import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Hello World!');
  const [isElectron, setIsElectron] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(window.api !== undefined);

    // Test backend connection
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus('✅ Backend Connected');
      } else {
        setBackendStatus('❌ Backend Error');
      }
    } catch (error) {
      setBackendStatus('❌ Backend Offline');
    }
  };

  const handleButtonClick = () => {
    setMessage(message === 'Hello World!' ? 'Hello Monitor Framework!' : 'Hello World!');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{message}</h1>
        
        <div className="status-info">
          <p>Environment: {isElectron ? '🖥️ Electron Desktop' : '🌐 Web Browser'}</p>
          <p>Backend Status: {backendStatus}</p>
        </div>

        <button onClick={handleButtonClick} className="hello-button">
          Click me!
        </button>

        <div className="info-section">
          <h3>Monitor Framework Features:</h3>
          <ul>
            <li>✅ Universal React Frontend (Web & Desktop)</li>
            <li>✅ Enhanced Database Adapter (MySQL/Firestore/Hybrid)</li>
            <li>✅ Real-time WebSocket Communication</li>
            <li>✅ Smart Serial Device Communication</li>
            <li>✅ Modular Architecture</li>
          </ul>
        </div>

        {isElectron && (
          <div className="electron-info">
            <h4>🖥️ Electron Features Available:</h4>
            <p>You can access the full backend API through the preload bridge!</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;