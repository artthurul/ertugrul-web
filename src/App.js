/*
 * Date: 2026-02-02
 * Developer: Ertuğrul Eren Durak
 * Copyright © 2026 All Rights Reserved.
 * File Purpose: Main Portfolio (ertugrulerendurak.com) 
 * entry point featuring an interactive particle-based text animation 
 * with Three.js for a futuristic user experience.
 */

import React from 'react';
import './App.css';
import ParticleBackground from './components/ParticleBackground';

function App() {
  return (
    <div className="main-container">
      <ParticleBackground />
      
      {/* Top Header */}
      <div className="header-bar">
        <span className="subtitle">BILKENT UNIVERSITY</span>
        <span className="separator">|</span>
        <span className="department">Computer Engineering</span>
      </div>
      
      {/* Bottom Footer */}
      <div className="footer-bar">
        <span className="status">LAUNCHING SOON</span>
        <span className="separator">|</span>
        <span className="construction">WHERE CODE MEETS CREATIVITY</span>
      </div>
    </div>
  );
}

export default App;