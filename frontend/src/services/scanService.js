
import apiClient from '../utils/api';

export const testConnection = async (target) => {
  const response = await apiClient.post('/api/test-connection', { target });
  return response.data;
};

export const getScanHistory = async () => {
  const response = await apiClient.get('/api/history');
  return response.data;
};

export const startWebSocketScan = (
  target,
  scanType,
  onMessage,
  onError
) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const wsBase = apiBase
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:')
    .replace(/\/$/, '');

  const ws = new WebSocket(`${wsBase}/ws/scan`);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      target,
      scan_type: scanType
    }));
  };

  ws.onmessage = (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch {
      // Backend may send plain-text scan logs.
      data = event.data;
    }

    onMessage?.(data);
  };

  ws.onerror = () => {
    onError?.(new Error('WebSocket connection failed.'));
  };

  ws.onclose = (event) => {
    if (event.code !== 1000) {
      onError?.(
        new Error(`Scan connection closed unexpectedly (code ${event.code}).`)
      );
    }
  };

  return ws;
};

export const closeWebSocket = (ws) => {
  if (ws && (
    ws.readyState === WebSocket.OPEN ||
    ws.readyState === WebSocket.CONNECTING
  )) {
    ws.close(1000, 'Client closed connection');
  }
};
