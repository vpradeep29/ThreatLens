import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="dashboard-page fade-in">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="dashboard-header">
        <div>
          <div className="dashboard-label">SYSTEM CONFIGURATION</div>
          <h1 className="dashboard-title">Settings</h1>
          <p className="dashboard-subtitle">Configure scanning engine limits, api keys, and system preferences.</p>
        </div>
      </header>

      <div className="glass-panel" style={{ minHeight: '400px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3>API Integrations</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Configure external services like Shodan, Wappalyzer, or CVE Databases.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h3>Concurrency Limits</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Max asynchronous threads: 10</p>
        </div>
      </div>
    </div>
  );
}
