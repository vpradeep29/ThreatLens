import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Globe from './components/Globe';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Globe />
      <Sidebar />
      <main style={{ marginLeft: '250px', flex: 1, padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
