
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Target, AlertTriangle, Wifi,
  Activity, Globe, Server, Clock, RefreshCw,
  ArrowUpRight, Shield
} from 'lucide-react';
import apiClient from '../utils/api';

export default function Dashboard() {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const [history, setHistory] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [historyResponse, healthResponse] = await Promise.allSettled([
        apiClient.get('/api/history'),
        apiClient.get('/health')
      ]);

      if (historyResponse.status === 'fulfilled' &&
        historyResponse.value.data.status === 'success') {
        setHistory(historyResponse.value.data.data || []);
      } else {
        setLoadError('Unable to load scan history.');
      }

      setBackendStatus(
        healthResponse.status === 'fulfilled' &&
          healthResponse.value.data.status === 'healthy'
          ? 'online'
          : 'offline'
      );
    } catch {
      setLoadError('Unable to retrieve dashboard information.');
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await apiClient.post('/api/test-connection', {
        target: testUrl.trim()
      });
      setTestResult(response.data);
    } catch (error) {
      setTestResult(
        error.response?.data || {
          status: 'error',
          message: 'Unable to connect to the backend server.'
        }
      );
    } finally {
      setIsTesting(false);
    }
  };

  const totalScans = history.length;
  const averageRisk = totalScans
    ? Math.round(history.reduce((sum, item) => sum + (Number(item.risk_score) || 0), 0) / totalScans)
    : null;
  const totalFindings = history.reduce(
    (sum, item) => sum + (Number(item.findings_count) || 0), 0
  );

  const recentScans = history.slice(0, 5);

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
  };

  const riskColor = (score) => {
    if (score > 70) return 'var(--severity-critical)';
    if (score > 40) return 'var(--severity-medium)';
    return 'var(--severity-low)';
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="dashboard-header">
        <div>
          <div className="dashboard-label">THREAT INTELLIGENCE PLATFORM</div>
          <h1 className="dashboard-title">Command Center</h1>
          <p className="dashboard-subtitle">
            Monitor scan activity, review security findings and assess authorized targets.
          </p>
        </div>

        <div className="live-status">
          <span
            className="pulse-dot"
            style={{
              background: backendStatus === 'online'
                ? '#22c55e'
                : backendStatus === 'offline'
                  ? '#ef4444'
                  : '#eab308'
            }}
          />
          {backendStatus === 'online'
            ? 'Backend Online'
            : backendStatus === 'offline'
              ? 'Backend Offline'
              : 'Checking Backend'}
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card" style={{ '--accent': '#3b82f6', '--glow': 'rgba(59,130,246,0.2)' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><Target size={25} /></div>
            <span className="status-badge">SCAN HISTORY</span>
          </div>
          <div className="stat-content">
            <p>Total Scans</p>
            <h2>{loading ? '...' : totalScans}</h2>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#f59e0b', '--glow': 'rgba(245,158,11,0.2)' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><AlertTriangle size={25} /></div>
            <span className="status-badge">RECORDED</span>
          </div>
          <div className="stat-content">
            <p>Total Findings</p>
            <h2>{loading ? '...' : totalFindings}</h2>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#22c55e', '--glow': 'rgba(34,197,94,0.2)' }}>
          <div className="card-glow"></div>
          <div className="stat-top">
            <div className="icon-wrap"><Shield size={25} /></div>
            <span className="status-badge">SCAN METRIC</span>
          </div>
          <div className="stat-content">
            <p>Average Risk Score</p>
            <h2>{loading ? '...' : averageRisk === null ? '—' : `${averageRisk}/100`}</h2>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem' }}>
          {loadError}
          <button onClick={loadDashboard} className="btn-secondary" style={{ marginLeft: '1rem' }}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="glass-panel large-panel">
          <div className="panel-header">
            <div>
              <h3>Target Reachability Tester</h3>
              <p>Check endpoint connectivity before initiating an authorized scan.</p>
            </div>
            <div className="panel-icon"><Wifi size={24} color="#60a5fa" /></div>
          </div>

          <form
            onSubmit={handleTestConnection}
            style={{
              display: 'flex', gap: '1rem', marginBottom: '1.5rem',
              background: 'rgba(0,0,0,0.2)', padding: '1rem',
              borderRadius: '16px', border: '1px solid var(--glass-border)'
            }}
          >
            <input
              type="text"
              placeholder="Enter an authorized target URL"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              required
              style={{ flex: 1, minWidth: 0 }}
            />
            <button type="submit" className="btn-primary" disabled={isTesting}>
              {isTesting
                ? <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                : <Server size={18} />}
              <span>{isTesting ? 'Testing...' : 'Test Target'}</span>
            </button>
          </form>

          {testResult && (
            <div
              className="glass-panel"
              style={{
                marginBottom: '1.5rem', padding: '1rem',
                borderColor: testResult.status === 'success' ? '#22c55e' : '#ef4444'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {testResult.status === 'success'
                  ? <ShieldCheck color="#22c55e" size={24} />
                  : <AlertTriangle color="#ef4444" size={24} />}
                <div>
                  <strong>{testResult.status === 'success' ? 'Connection Successful' : 'Connection Failed'}</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {testResult.message}
                  </p>
                  {testResult.server && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Server: {testResult.server}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <div className="panel-header">
              <div>
                <h3>Recent Scan Activity</h3>
                <p>Latest records retrieved from the scan history database.</p>
              </div>
              <Activity size={21} color="#60a5fa" />
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading scan records...</p>
            ) : recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <Activity size={35} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p>No scan activity recorded yet.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Start a scan to see results here.
                </p>
              </div>
            ) : (
              <div className="activity-list">
                {recentScans.map((scan) => (
                  <div className="activity-item" key={scan.id}>
                    <div className="activity-dot" style={{ background: riskColor(scan.risk_score) }}></div>
                    <div className="activity-info">
                      <h4>{scan.target}</h4>
                      <p>
                        {scan.scan_type?.toUpperCase()} scan · {scan.findings_count} findings
                      </p>
                    </div>
                    <span>{formatDate(scan.scan_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="side-panels">
          <div className="glass-panel mini-panel">
            <div className="mini-top">
              <Globe size={20} color="#22c55e" />
              <h3>Scanner Overview</h3>
            </div>
            <div className="metric">
              <h2>{loading ? '...' : totalScans}</h2>
              <p>Saved scan records</p>
            </div>
            <div style={{ marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <p><Clock size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />Latest recorded scan</p>
              <strong style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                {recentScans.length ? formatDate(recentScans[0].scan_date) : 'No scans yet'}
              </strong>
            </div>
          </div>

          <div className="glass-panel mini-panel">
            <div className="mini-top">
              <ShieldCheck size={20} color="#3b82f6" />
              <h3>Risk Overview</h3>
            </div>
            <div className="metric">
              <h2>{loading ? '...' : averageRisk === null ? '—' : averageRisk}</h2>
              <p>Average recorded risk score</p>
            </div>
            <div style={{
              height: '5px', background: 'rgba(255,255,255,0.1)',
              borderRadius: '5px', marginTop: '1rem', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${averageRisk ?? 0}%`,
                background: averageRisk === null ? '#64748b' : riskColor(averageRisk),
                transition: 'width 0.4s ease'
              }} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Historical average · Not a live security rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
