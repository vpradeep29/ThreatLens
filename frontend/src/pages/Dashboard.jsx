import React, { useState } from 'react';
import { ShieldCheck, Target, AlertTriangle, Wifi, Activity, Globe, Server } from 'lucide-react';

export default function Dashboard() {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!testUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: testUrl })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ status: 'error', message: 'Failed to connect to backend server.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="dashboard-page fade-in">
      {/* Background Ambience */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      {/* Premium Header */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-label">INTELLIGENCE NETWORK</div>
          <h1 className="dashboard-title">Command Center</h1>
          <p className="dashboard-subtitle">Real-time threat monitoring, endpoint reachability, and global reconnaissance telemetry.</p>
        </div>
        <div className="live-status">
          <div className="pulse-dot"></div>
          System Online
        </div>
      </header>

      {/* Stats Grid with Hover Animations */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--glow': 'rgba(34, 197, 94, 0.4)', '--accent': '#22c55e' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><ShieldCheck size={28} /></div>
            <span className="status-badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>SECURE</span>
          </div>
          <div className="stat-content">
            <p>System Status</p>
            <h2>Nominal</h2>
          </div>
          <div className="stat-wave" style={{ borderColor: 'rgba(34,197,94,0.15)' }}></div>
        </div>

        <div className="stat-card" style={{ '--glow': 'rgba(59, 130, 246, 0.4)', '--accent': '#3b82f6' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><Target size={28} /></div>
          </div>
          <div className="stat-content">
            <p>Targets Scanned</p>
            <h2>12</h2>
          </div>
          <div className="stat-wave" style={{ borderColor: 'rgba(59,130,246,0.15)' }}></div>
        </div>

        <div className="stat-card" style={{ '--glow': 'rgba(239, 68, 68, 0.4)', '--accent': '#ef4444' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><AlertTriangle size={28} /></div>
            <span className="status-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>3 ACTIVE</span>
          </div>
          <div className="stat-content">
            <p>Active Threats</p>
            <h2>3</h2>
          </div>
          <div className="stat-wave" style={{ borderColor: 'rgba(239,68,68,0.15)' }}></div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Panel: Reachability & Activity */}
        <div className="glass-panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Target Reachability Tester</h3>
              <p>Verify endpoint connectivity before initiating a scan.</p>
            </div>
            <div className="panel-icon"><Wifi size={24} color="#60a5fa" /></div>
          </div>

          <form onSubmit={handleTestConnection} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <input 
              type="text" 
              placeholder="e.g. testphp.vulnweb.com" 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '1rem' }}
            />
            <button type="submit" className="btn-primary" disabled={isTesting} style={{ padding: '0.85rem 1.5rem', borderRadius: '12px', minWidth: '160px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              {isTesting ? <span className="loader" style={{width: 18, height: 18, borderWidth: 2}}></span> : <Server size={18} />}
              <span style={{ marginLeft: '0.5rem' }}>{isTesting ? 'Testing...' : 'Ping Target'}</span>
            </button>
          </form>

          {testResult && (
            <div style={{ marginBottom: '2rem', padding: '1.25rem', borderRadius: '16px', background: testResult.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${testResult.status === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '50%', background: testResult.status === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: testResult.status === 'success' ? '#22c55e' : '#ef4444' }}>
                {testResult.status === 'success' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h4 style={{ color: testResult.status === 'success' ? '#22c55e' : '#ef4444', marginBottom: '0.25rem' }}>{testResult.status === 'success' ? 'Reachability Verified' : 'Reachability Failed'}</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{testResult.message}</p>
                {testResult.server && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Detected Server: {testResult.server}</p>}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>Recent Telemetry Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" style={{ background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
                <div className="activity-info">
                  <h4>testphp.vulnweb.com</h4>
                  <p>Full OWASP Scan completed successfully</p>
                </div>
                <span>2 mins ago</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></div>
                <div className="activity-info">
                  <h4>192.168.1.105</h4>
                  <p>Network Port Scan finished</p>
                </div>
                <span>15 mins ago</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></div>
                <div className="activity-info">
                  <h4>demo.testfire.net</h4>
                  <p>SQL Injection Vulnerability Detected</p>
                </div>
                <span>1 hour ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels: Radar and Security Score */}
        <div className="side-panels">
          <div className="glass-panel mini-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="mini-top" style={{ width: '100%', justifyContent: 'center' }}>
              <Globe size={20} color="#22c55e" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Active Radar</h3>
            </div>
            <div className="radar-circle">
              <div className="radar-sweep"></div>
              <div className="radar-center"></div>
            </div>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Scanning local subnet...</p>
          </div>
          
          <div className="glass-panel mini-panel">
            <div className="mini-top">
              <ShieldCheck size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Security Score</h3>
            </div>
            <div className="metric">
              <h2>98<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.5)' }}>/100</span></h2>
              <p>+2.4% vs last week</p>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '98%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
