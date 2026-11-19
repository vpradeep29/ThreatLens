import apiClient from '../utils/api';

// Test connection to target
export const testConnection = async (target) => {
  try {
    const response = await apiClient.post('/api/test-connection', { target });
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'error', message: error.message };
  }
};

// Get scan history
export const getScanHistory = async () => {
  try {
    const response = await apiClient.get('/api/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'error', message: error.message };
  }
};

// Start WebSocket scan
export const startWebSocketScan = (target, scanType = 'full', onMessage, onError) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  let wsUrl;
  
  if (apiBase.startsWith('http')) {
    wsUrl = apiBase.replace('http', 'ws') + '/ws/scan';
  } else {
    wsUrl = `${wsProtocol}//${window.location.host}/ws/scan`;
  }
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      target,
      scan_type: scanType,
    }));
  };
  
  ws.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };
  
  ws.onerror = (error) => {
    onError(error);
  };
  
  return ws;
};

// Close WebSocket connection
export const closeWebSocket = (ws) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
};
