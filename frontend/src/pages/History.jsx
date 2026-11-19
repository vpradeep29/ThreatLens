import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Clock, AlertTriangle } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    fetch(`${apiBase}/api/history`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setHistory(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page fade-in">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="dashboard-header">
        <div>
          <div className="dashboard-label">ARCHIVE & REPORTS</div>
          <h1 className="dashboard-title">Scan History</h1>
          <p className="dashboard-subtitle">Review previous assessments, exported reports, and historical threat telemetry.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}><span className="loader" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent', display: 'inline-block' }}></span></div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <HistoryIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No Scans Found</h3>
          <p>Your history database is currently empty. Run a scan to populate this view.</p>
        </div>
      ) : (
        <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map(item => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.target}</h3>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> {new Date(item.scan_date).toLocaleString()}</span>
                  <span>|</span>
                  <span>Type: {item.scan_type.toUpperCase()}</span>
                  <span>|</span>
                  <span>Duration: {item.duration}s</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Findings</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: item.findings_count > 0 ? 'var(--severity-high)' : 'var(--severity-low)' }}>
                    {item.findings_count}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk Score</div>
                  <div className={`score-circle ${item.risk_score > 70 ? 'score-high' : item.risk_score > 40 ? 'score-med' : 'score-low'}`} style={{ width: '40px', height: '40px', fontSize: '1rem', margin: 0, borderWidth: '2px' }}>
                    {item.risk_score}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
