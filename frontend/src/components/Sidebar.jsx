
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  History,
  Settings,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const navigation = [
    { to: '/', label: 'Dashboard', icon: Activity, end: true },
    { to: '/scanner', label: 'Vulnerability Scanner', icon: ShieldAlert },
    { to: '/history', label: 'Scan History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className="sidebar glass-panel"
      aria-label="Main navigation"
      style={{
        width: '250px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.75rem 1rem',
        borderRight: '1px solid var(--glass-border)',
        borderRadius: 0,
        zIndex: 10
      }}
    >
      <div
        className="logo-area"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <ShieldCheck size={30} color="var(--accent-primary)" />
          <h1 style={{
            fontSize: '1.55rem',
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--accent-primary)',
            margin: 0
          }}>
            ThreatLens
          </h1>
        </div>

        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          marginTop: '0.75rem',
          lineHeight: 1.5
        }}>
          Security Assessment & Intelligence
        </p>
      </div>

      <div style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '1.5px',
        color: 'var(--text-secondary)',
        padding: '0 0.75rem',
        marginBottom: '0.75rem'
      }}>
        WORKSPACE
      </div>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        flex: 1
      }}>
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            aria-label={label}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '1rem'
      }}>
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            width: '100%',
            justifyContent: 'center',
            padding: '0.8rem',
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark'
            ? <><Sun size={18} /> Light Mode</>
            : <><Moon size={18} /> Dark Mode</>}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '0.68rem',
          color: 'var(--text-secondary)',
          marginTop: '1rem'
        }}>
          ThreatLens · Security Scanner
        </p>
      </div>
    </aside>
  );
}
