import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ShieldAlert, History, Settings, Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="sidebar glass-panel" style={{ width: '250px', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', padding: '2rem 1rem', borderRight: '1px solid var(--glass-border)', borderRadius: 0, zIndex: 10 }}>
      <div className="logo-area" style={{ marginBottom: '3rem', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="logo-icon">👁️‍🗨️</span>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>LVS</h1>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.2' }}>Lightweight OWASP + CVE Intelligence Scanner</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
          <Activity size={20} /> Dashboard
        </NavLink>
        <NavLink to="/scanner" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ShieldAlert size={20} /> Scanner
        </NavLink>
        <NavLink to="/history" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <History size={20} /> Scan History
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>

      <div className="theme-toggle" style={{ marginTop: 'auto', textAlign: 'center' }}>
        <button onClick={toggleTheme} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.75rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>
          {theme === 'dark' ? <><Sun size={18}/> Light Mode</> : <><Moon size={18}/> Hacker Mode</>}
        </button>
      </div>
    </div>
  );
}
