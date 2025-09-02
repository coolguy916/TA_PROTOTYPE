const { contextBridge, ipcRenderer } = require('electron');

const validInvokeChannels = new Set([
  'get-data-by-filters',
  'delete-data',
  'insert-data',
  'update-data',
  'serial-force-reconnect',
  'serial-disconnect',
  'serial-scan-ports',
  'serial-toggle-dynamic-switching',
  'serial-get-status',
  'serial-send-data',
  // NEW: Enhanced database adapter channels
  'db-health-check',
  'db-get-config',
  'db-subscribe',
  'db-unsubscribe',
  'db-query',
  'db-transaction',
  // NEW: User management
  'get-users',
  'insert-user',
  'post-data',
]);

const validReceiveChannels = new Set([
  'serial-data-received',
  'serial-port-status',
  'serial-port-error',
  'serial-connection-lost',
  'serial-reconnect-status',
  'serial-port-switched',
  'database-insert-success',
  'serial-data-sent',
  // NEW: Enhanced database adapter events
  'db-subscription-data',
  'db-health-status',
  'websocket-data-received',
  'websocket-connection-status',
  'websocket-room-joined',
  'websocket-room-left',
]);

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => {
    if (!validInvokeChannels.has(channel)) {
      console.warn(`Invalid invoke channel: ${channel}`);
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  receive: (channel, callback) => {
    if (!validReceiveChannels.has(channel)) {
      console.warn(`Invalid receive channel: ${channel}`);
      return;
    }
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Database convenience methods
  getDataByFilters: (table, filters, options) => ipcRenderer.invoke('get-data-by-filters', table, filters, options),
  deleteData: (table, whereClause, whereParams) => ipcRenderer.invoke('delete-data', table, whereClause, whereParams),
  insertData: (table, data) => ipcRenderer.invoke('insert-data', table, data),
  updateData: (table, data, whereClause, whereParams) => ipcRenderer.invoke('update-data', table, data, whereClause, whereParams),

  // Serial convenience methods
  getSerialStatus: () => ipcRenderer.invoke('serial-get-status'),
  forceReconnect: () => ipcRenderer.invoke('serial-force-reconnect'),
  disconnect: () => ipcRenderer.invoke('serial-disconnect'),
  scanPorts: () => ipcRenderer.invoke('serial-scan-ports'),
  setDynamicSwitching: (enabled) => ipcRenderer.invoke('serial-toggle-dynamic-switching', enabled),
  sendData: (data) => ipcRenderer.invoke('serial-send-data', data),

  // NEW: Enhanced database adapter methods
  getDatabaseHealth: () => ipcRenderer.invoke('db-health-check'),
  getDatabaseConfig: () => ipcRenderer.invoke('db-get-config'),
  subscribeToTable: (tableName, filters) => ipcRenderer.invoke('db-subscribe', tableName, filters),
  unsubscribeFromTable: (subscriptionId) => ipcRenderer.invoke('db-unsubscribe', subscriptionId),
  executeQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
  executeTransaction: (operations) => ipcRenderer.invoke('db-transaction', operations),

  // NEW: User management methods
  getUsers: () => ipcRenderer.invoke('get-users'),
  insertUser: (name, email) => ipcRenderer.invoke('insert-user', name, email),
  postData: (table, data) => ipcRenderer.invoke('post-data', table, data),

  // NEW: WebSocket client integration (for React frontend)
  websocket: {
    connect: (url = 'ws://localhost:8080') => {
      if (typeof window !== 'undefined' && window.WebSocket) {
        const ws = new WebSocket(url);
        return ws;
      }
      throw new Error('WebSocket not available in this environment');
    },
    
    // WebSocket message handlers for React components
    createRealtimeConnection: (url, options = {}) => {
      const {
        onOpen = () => {},
        onMessage = () => {},
        onClose = () => {},
        onError = () => {},
        autoReconnect = true,
        reconnectDelay = 3000
      } = options;

      let ws = null;
      let reconnectTimer = null;

      const connect = () => {
        ws = new WebSocket(url);
        
        ws.onopen = (event) => {
          console.log('🔗 WebSocket connected');
          onOpen(event);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (err) {
            onMessage(event.data);
          }
        };
        
        ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected');
          onClose(event);
          
          if (autoReconnect && !event.wasClean) {
            reconnectTimer = setTimeout(connect, reconnectDelay);
          }
        };
        
        ws.onerror = (event) => {
          console.error('❌ WebSocket error:', event);
          onError(event);
        };
      };

      connect();

      return {
        send: (data) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof data === 'string' ? data : JSON.stringify(data));
            return true;
          }
          return false;
        },
        close: () => {
          if (reconnectTimer) clearTimeout(reconnectTimer);
          if (ws) ws.close(1000, 'Client closing');
        },
        getReadyState: () => ws ? ws.readyState : WebSocket.CLOSED
      };
    }
  }
});