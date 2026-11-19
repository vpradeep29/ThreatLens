import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Target, Server, Shield, Activity, FileWarning, Search, ChevronRight, CheckCircle, Database } from 'lucide-react';
import { startWebSocketScan, closeWebSocket } from '../services/scanService';

export default function Scanner() {
  const [phase, setPhase] = useState('home'); // home, progress, results
  const [target, setTarget] = useState('');
  const [scanLevel, setScanLevel] = useState('full');
  
  // Progress State
  const [activeModule, setActiveModule] = useState('Initializing Engine...');
  const [progressPercent, setProgressPercent] = useState(0);
  const [logs, setLogs] = useState([]);
  
  // Results State
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!target) return;
    
    setPhase('progress');
    setError(null);
    setResults(null);
    setSelectedVuln(null);
    setLogs([`[*] LVS Engine connecting via secure websocket...`]);
    setProgressPercent(5);
    setActiveModule('Recon & Input Normalization');

    try {
      const ws = startWebSocketScan(
        target, 
        scanLevel, 
        (data) => {
          if (data.type === 'results') {
            setResults(data.data);
            setProgressPercent(100);
            setPhase('results');
            closeWebSocket(ws);
          } else if (data.type === 'error') {
            setError(data.message);
            setLogs(prev => [...prev, `[-] Error: ${data.message}`]);
            setPhase('home');
            closeWebSocket(ws);
          } else if (data.type === 'progress') {
            setProgressPercent(data.percent);
            setActiveModule(data.module);
          } else {
            // Plain text log or other types
            const msg = typeof data === 'string' ? data : JSON.stringify(data);
            setLogs(prev => [...prev, msg]);
          }
        },
        (error) => {
          setError('WebSocket connection error. Is the backend running?');
          setPhase('home');
        }
      );
      
    } catch (err) {
      setError(err.message);
      setPhase('home');
    }
  };

  const exportPDF = async () => {
    if (!results) return;
    
    // Create a temporary container for the PDF content
    const exportRoot = document.createElement('div');
    exportRoot.id = 'pdf-export-root';
    exportRoot.style.position = 'absolute';
    exportRoot.style.left = '-9999px';
    exportRoot.style.width = '800px';
    exportRoot.style.padding = '40px';
    exportRoot.style.background = '#0a0a0a';
    exportRoot.style.color = '#fff';
    exportRoot.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    
    const getSevColor = (sev) => {
      const s = sev.toLowerCase();
      if (s === 'critical') return '#ff0033';
      if (s === 'high') return '#ff4d4d';
      if (s === 'medium') return '#ffaa00';
      return '#00ff41';
    };

    // Build the report content
    let findingsHtml = '';
    results.findings.forEach((f, idx) => {
      findingsHtml += `
        <div style="margin-bottom: 40px; padding: 25px; border: 1px solid #333; border-radius: 12px; background: rgba(255,255,255,0.03); page-break-inside: avoid;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <span style="background: ${getSevColor(f.severity)}; color: #000; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; text-transform: uppercase;">
              ${f.severity}
            </span>
            <h3 style="margin: 0; color: #fff; font-size: 1.4rem;">#${idx + 1}: ${f.title}</h3>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 20px;">
            <div>
              <strong style="display: block; color: #888; font-size: 0.8rem; margin-bottom: 5px; text-transform: uppercase;">CWE Identifier</strong>
              <span style="font-family: monospace; color: #00ff41;">${f.cwe}</span>
            </div>
            <div>
              <strong style="display: block; color: #888; font-size: 0.8rem; margin-bottom: 5px; text-transform: uppercase;">Affected Endpoint</strong>
              <span style="font-family: monospace; color: #ccc;">${f.endpoint || '/'}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h4 style="color: #00ff41; margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Vulnerability Description</h4>
            <p style="color: #aaa; margin: 0; line-height: 1.6; font-size: 1rem;">${f.description}</p>
          </div>
          
          ${f.payload ? `
          <div style="margin-bottom: 25px;">
            <h4 style="color: #ff4d4d; margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Evidence / Payload</h4>
            <div style="background: #000; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; color: #ff4d4d; border: 1px solid #333; word-break: break-all; font-size: 0.9rem;">
              ${f.payload}
            </div>
          </div>
          ` : ''}
          
          <div style="padding: 20px; background: rgba(0, 255, 65, 0.05); border-radius: 8px; border: 1px solid rgba(0, 255, 65, 0.2);">
            <h4 style="color: #00ff41; margin: 0 0 10px 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Remediation Strategy</h4>
            <p style="color: #fff; margin: 0; line-height: 1.5;">${f.remediation}</p>
          </div>
        </div>
      `;
    });

    exportRoot.innerHTML = `
      <div style="margin-bottom: 50px; border-bottom: 3px solid #00ff41; padding-bottom: 30px;">
        <h1 style="color: #00ff41; margin: 0; font-size: 2.5rem; letter-spacing: -1px;">LVS SECURITY INTELLIGENCE</h1>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
          <div>
            <p style="color: #888; margin: 0; font-size: 0.9rem; text-transform: uppercase;">Target System</p>
            <p style="color: #fff; margin: 5px 0 0 0; font-family: monospace; font-size: 1.2rem;">${results.target}</p>
          </div>
          <div style="text-align: right;">
            <p style="color: #888; margin: 0; font-size: 0.9rem; text-transform: uppercase;">Generated On</p>
            <p style="color: #fff; margin: 5px 0 0 0; font-size: 1rem;">${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 30px; margin-bottom: 50px;">
        <div style="flex: 1; padding: 30px; border: 1px solid #333; border-radius: 16px; text-align: center; background: rgba(0,0,0,0.4);">
          <h3 style="margin: 0 0 15px 0; font-size: 0.9rem; text-transform: uppercase; color: #888; letter-spacing: 1px;">Overall Risk Score</h3>
          <div style="font-size: 4.5rem; font-weight: 900; color: ${getSevColor(results.risk_score > 70 ? 'critical' : results.risk_score > 40 ? 'medium' : 'low')}; line-height: 1;">
            ${results.risk_score}
          </div>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 0.8rem;">MAX SCALE: 100</p>
        </div>
        <div style="flex: 2; padding: 30px; border: 1px solid #333; border-radius: 16px; background: rgba(0,0,0,0.4);">
          <h3 style="margin: 0 0 20px 0; font-size: 0.9rem; text-transform: uppercase; color: #888; letter-spacing: 1px;">Scan Metrics</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #111; padding: 15px; border-radius: 8px;">
              <span style="color: #555; display: block; font-size: 0.7rem; text-transform: uppercase;">Server Type</span>
              <span style="color: #ddd; font-weight: bold;">${results.server || 'Protected/Hidden'}</span>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
              <span style="color: #555; display: block; font-size: 0.7rem; text-transform: uppercase;">Findings</span>
              <span style="color: #00ff41; font-weight: bold;">${results.findings.length} Vulnerabilities</span>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
              <span style="color: #555; display: block; font-size: 0.7rem; text-transform: uppercase;">Duration</span>
              <span style="color: #ddd; font-weight: bold;">${results.duration_seconds} Seconds</span>
            </div>
            <div style="background: #111; padding: 15px; border-radius: 8px;">
              <span style="color: #555; display: block; font-size: 0.7rem; text-transform: uppercase;">Status</span>
              <span style="color: #00ff41; font-weight: bold;">Complete</span>
            </div>
          </div>
        </div>
      </div>
      
      <h2 style="border-left: 5px solid #00ff41; padding-left: 15px; margin-bottom: 40px; color: #fff; font-size: 1.8rem;">Detailed Security Analysis</h2>
      
      ${findingsHtml}
      
      <div style="margin-top: 50px; text-align: center; color: #444; font-size: 0.8rem; border-top: 1px solid #222; padding-top: 20px;">
        CONFIDENTIAL - LVS ADVANCED SCANNER v2.0 - SECURE REPORT
      </div>
    `;
    
    document.body.appendChild(exportRoot);
    
    try {
      const canvas = await html2canvas(exportRoot, { 
        scale: 2,
        backgroundColor: '#0a0a0a',
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`LVS_Intelligence_Report_${results.target.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      document.body.removeChild(exportRoot);
    }
  };

  const exportJSON = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lvs_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="dashboard-header">
        <div>
          <div className="dashboard-label">THREAT ACQUISITION</div>
          <h1 className="dashboard-title">Active Scanner</h1>
          <p className="dashboard-subtitle">Initiate advanced vulnerability assessments and active payload injection.</p>
        </div>
      </header>

      {/* PHASE 1: HOME */}
      {phase === 'home' && (
        <section className="scan-panel glass-panel slide-up">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Initiate Scan sequence</h2>
          <form onSubmit={handleScan}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target IP or URL</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. 192.168.1.100 or https://example.com" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Scan Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label className={`scan-type-btn ${scanLevel === 'quick' ? 'active' : ''}`} style={{ flex: 1, padding: '1.5rem', border: `2px solid ${scanLevel === 'quick' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', background: scanLevel === 'quick' ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.3)', transition: 'all 0.2s', textAlign: 'center' }} onClick={() => setScanLevel('quick')}>
                    <Activity size={24} style={{ margin: '0 auto 0.5rem', color: scanLevel === 'quick' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                    <div style={{ fontWeight: 'bold', color: scanLevel === 'quick' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Quick</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Ports & Headers</div>
                  </label>
                  
                  <label className={`scan-type-btn ${scanLevel === 'full' ? 'active' : ''}`} style={{ flex: 1, padding: '1.5rem', border: `2px solid ${scanLevel === 'full' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', background: scanLevel === 'full' ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.3)', transition: 'all 0.2s', textAlign: 'center' }} onClick={() => setScanLevel('full')}>
                    <Shield size={24} style={{ margin: '0 auto 0.5rem', color: scanLevel === 'full' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                    <div style={{ fontWeight: 'bold', color: scanLevel === 'full' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Full OWASP</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>SQLi, XSS, SSRF, IDOR</div>
                  </label>
                  
                  <label className={`scan-type-btn ${scanLevel === 'advanced' ? 'active' : ''}`} style={{ flex: 1, padding: '1.5rem', border: `2px solid ${scanLevel === 'advanced' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, borderRadius: '12px', cursor: 'pointer', background: scanLevel === 'advanced' ? 'rgba(0,255,65,0.1)' : 'rgba(0,0,0,0.3)', transition: 'all 0.2s', textAlign: 'center' }} onClick={() => setScanLevel('advanced')}>
                    <Server size={24} style={{ margin: '0 auto 0.5rem', color: scanLevel === 'advanced' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                    <div style={{ fontWeight: 'bold', color: scanLevel === 'advanced' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Advanced</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Full OWASP + Dir Fuzzing</div>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', marginTop: '1rem', fontSize: '1.2rem' }}>
                Launch Intelligence Scan
              </button>
            </div>
          </form>
          {error && <div className="error-message" style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid var(--severity-critical)', borderRadius: '8px' }}>{error}</div>}
        </section>
      )}

      {/* PHASE 2: PROGRESS */}
      {phase === 'progress' && (
        <section className="glass-panel slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Scanning: {target}</h3>
            
            <div style={{ background: 'rgba(0,0,0,0.5)', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%', marginBottom: '1rem' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.3s ease', boxShadow: '0 0 10px var(--accent-glow)' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span className="blink">Running: {activeModule}</span>
              <span>{progressPercent}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Module Checklist */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Active Modules</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                {['Recon & Fingerprinting', 'Port Scanner & Services', 'Header & Config Check', 'Intelligent Async Crawler', 'Injection & XSS Tester', 'Directory Fuzzing', 'CVE Intelligence Map'].map(mod => {
                  let statusColor = 'var(--text-secondary)';
                  let icon = <ChevronRight size={16} />;
                  if (activeModule === mod) { statusColor = 'var(--accent-primary)'; icon = <span className="loader" style={{width: 12, height: 12, borderWidth: 2}}></span>; }
                  else if (progressPercent > 80 && mod !== 'CVE Intelligence Map') { statusColor = 'var(--severity-low)'; icon = <CheckCircle size={16} />; }
                  
                  return (
                    <li key={mod} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: statusColor }}>
                      {icon} {mod}
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Terminal View */}
            <div className="terminal" style={{ flex: 2, background: 'var(--terminal-bg)', padding: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <Search size={14} /> LIVE ENGINE STDOUT
              </div>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.startsWith('[-]') ? 'var(--severity-critical)' : log.startsWith('[+]') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {log}
                </div>
              ))}
              <div className="blink" style={{ color: 'var(--accent-primary)', marginTop: '0.5rem' }}>_</div>
            </div>
          </div>
        </section>
      )}

      {/* PHASE 3: RESULTS */}
      {phase === 'results' && results && (
        <section id="report-container" className="slide-up">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Intelligence Report</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={exportPDF} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Export PDF</button>
              <button onClick={exportJSON} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Export JSON</button>
              <button onClick={() => {setPhase('home'); setTarget('');}} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>New Scan</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* 1. Risk Summary */}
            <div className="glass-panel" style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Overall Risk Score</h3>
              <div className={`score-circle ${results.risk_score > 70 ? 'score-high' : results.risk_score > 40 ? 'score-med' : 'score-low'}`} style={{ margin: '0 auto 1rem' }}>
                {results.risk_score}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{results.duration_seconds}s scan time</div>
            </div>

            {/* Target Data */}
            <div className="glass-panel" style={{ flex: 2 }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Target Profile</h3>
              <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', marginBottom: '1rem', color: 'var(--accent-primary)' }}>{results.target}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Detected Server</div>
                  <div>{results.server || 'Unknown'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Findings</div>
                  <div>{results.findings.length} Anomalies</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Vulnerabilities List & 3. Detailed View */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Identified Vulnerabilities</h3>
              {results.findings.length === 0 ? (
                <p style={{ color: 'var(--severity-low)' }}>System is secure. No vulnerabilities found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {results.findings.map(finding => (
                    <div 
                      key={finding.id} 
                      onClick={() => setSelectedVuln(finding)}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        background: selectedVuln?.id === finding.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                        borderLeft: `4px solid var(--severity-${finding.severity.toLowerCase()})`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{finding.title}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{finding.cwe}</span>
                        <span style={{ color: `var(--severity-${finding.severity.toLowerCase()})` }}>{finding.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ flex: 2, padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Detailed Analysis</h3>
              {!selectedVuln ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <FileWarning size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>Select a vulnerability from the list to view detailed intelligence.</p>
                </div>
              ) : (
                <div className="fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span className={`severity-badge`} style={{ background: `var(--severity-${selectedVuln.severity.toLowerCase()})`, color: '#000' }}>{selectedVuln.severity}</span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedVuln.title}</h2>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>CWE ID</strong>
                      <span>{selectedVuln.cwe}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Endpoint / Parameter</strong>
                      <span style={{ fontFamily: 'monospace' }}>{selectedVuln.endpoint || '/'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Description & Impact</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedVuln.description}</p>
                  </div>

                  {selectedVuln.payload && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ color: 'var(--severity-critical)', marginBottom: '0.5rem' }}>Payload Used (Evidence)</h4>
                      <div style={{ background: 'var(--terminal-bg)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'var(--severity-critical)', wordBreak: 'break-all' }}>
                        {selectedVuln.payload}
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(0,255,65,0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0,255,65,0.2)' }}>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Fix Recommendation</h4>
                    <p style={{ color: 'var(--text-primary)' }}>{selectedVuln.remediation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
