// WebSocketHandler.js
const WebSocket = require('ws');
const crypto = require('crypto');

class WebSocketHandler {
    constructor(config, dbInstance, windowInstance) {
        this.config = {
            port: 8080,
            host: '0.0.0.0',
            enableAuthentication: false,
            authToken: null,
            dbTableName: 'sensors_data',
            requiredFields: [],
            fieldsToEncrypt: [],
            enableHeartbeat: true,
            heartbeatInterval: 30000, // 30 seconds
            maxConnections: 10,
            enableDataValidation: true,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            
            ...config
        };

        this.db = dbInstance;
        this.mainWindow = windowInstance;
        this.server = null;
        this.clients = new Map(); // Store client connections with metadata
        this.isRunning = false;
        this.connectionCount = 0;
        
        // Generate auth token if authentication is enabled but no token provided
        if (this.config.enableAuthentication && !this.config.authToken) {
            this.config.authToken = this._generateAuthToken();
        }
    }

    // Start WebSocket server
    async start() {
        if (this.isRunning) {
            this._log('warn', 'WebSocket server is already running');
            return;
        }

        try {
            this.server = new WebSocket.Server({
                port: this.config.port,
                host: this.config.host,
                maxPayload: 1024 * 1024, // 1MB max payload
            });

            this._setupServerEventHandlers();
            this.isRunning = true;
            
            this._log('info', `WebSocket server started on ws://${this.config.host}:${this.config.port}`);
            
            if (this.config.enableAuthentication) {
                this._log('info', `Authentication enabled. Token: ${this.config.authToken}`);
            }

            this._sendToRenderer('websocket-server-status', {
                status: 'started',
                port: this.config.port,
                host: this.config.host,
                authEnabled: this.config.enableAuthentication,
                authToken: this.config.enableAuthentication ? this.config.authToken : null,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this._log('error', `Failed to start WebSocket server: ${error.message}`);
            this._sendToRenderer('websocket-server-error', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    // Stop WebSocket server
    async stop() {
        if (!this.isRunning) {
            this._log('warn', 'WebSocket server is not running');
            return;
        }

        try {
            // Close all client connections
            this.clients.forEach((clientData, ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, 'Server shutdown');
                }
            });
            this.clients.clear();

            // Close server
            if (this.server) {
                this.server.close(() => {
                    this._log('info', 'WebSocket server stopped');
                });
            }

            this.isRunning = false;
            this.connectionCount = 0;

            this._sendToRenderer('websocket-server-status', {
                status: 'stopped',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this._log('error', `Error stopping WebSocket server: ${error.message}`);
            throw error;
        }
    }

    // Setup server event handlers
    _setupServerEventHandlers() {
        this.server.on('connection', (ws, request) => {
            this._handleNewConnection(ws, request);
        });

        this.server.on('error', (error) => {
            this._log('error', `WebSocket server error: ${error.message}`);
            this._sendToRenderer('websocket-server-error', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
        });

        this.server.on('listening', () => {
            this._log('info', `WebSocket server listening on port ${this.config.port}`);
        });
    }

    // Handle new client connection
    _handleNewConnection(ws, request) {
        const clientIP = request.socket.remoteAddress;
        const userAgent = request.headers['user-agent'] || 'Unknown';
        const clientId = this._generateClientId();

        this._log('info', `New connection from ${clientIP} (${userAgent})`);

        // Check max connections
        if (this.connectionCount >= this.config.maxConnections) {
            this._log('warn', `Max connections (${this.config.maxConnections}) reached, rejecting connection`);
            ws.close(1013, 'Server overloaded');
            return;
        }

        // Store client data
        const clientData = {
            id: clientId,
            ip: clientIP,
            userAgent: userAgent,
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
            isAuthenticated: !this.config.enableAuthentication, // Auto-auth if disabled
            dataReceived: 0,
            lastDataTime: null
        };

        this.clients.set(ws, clientData);
        this.connectionCount++;

        // Setup client event handlers
        this._setupClientEventHandlers(ws, clientData);

        // Start heartbeat if enabled
        if (this.config.enableHeartbeat) {
            this._startClientHeartbeat(ws, clientData);
        }

        // Send welcome message
        this._sendToClient(ws, {
            type: 'welcome',
            clientId: clientId,
            authRequired: this.config.enableAuthentication,
            timestamp: new Date().toISOString()
        });

        this._sendToRenderer('websocket-client-connected', {
            clientId: clientId,
            ip: clientIP,
            userAgent: userAgent,
            totalConnections: this.connectionCount,
            timestamp: new Date().toISOString()
        });
    }

    // Setup client-specific event handlers
    _setupClientEventHandlers(ws, clientData) {
        ws.on('message', (rawData) => {
            this._handleClientMessage(ws, clientData, rawData);
        });

        ws.on('close', (code, reason) => {
            this._handleClientDisconnection(ws, clientData, code, reason);
        });

        ws.on('error', (error) => {
            this._log('error', `Client ${clientData.id} error: ${error.message}`);
            this._sendToRenderer('websocket-client-error', {
                clientId: clientData.id,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        });

        ws.on('pong', () => {
            clientData.lastHeartbeat = new Date();
            this._log('debug', `Heartbeat received from client ${clientData.id}`);
        });
    }

    // Handle incoming messages from clients
    _handleClientMessage(ws, clientData, rawData) {
        try {
            const message = JSON.parse(rawData.toString());
            this._log('debug', `Message from ${clientData.id}:`, message);

            clientData.lastDataTime = new Date();
            clientData.dataReceived++;

            // Handle different message types
            switch (message.type) {
                case 'auth':
                    this._handleAuthentication(ws, clientData, message);
                    break;
                    
                case 'sensor_data':
                    this._handleSensorData(ws, clientData, message);
                    break;
                    
                case 'heartbeat':
                    this._handleHeartbeat(ws, clientData, message);
                    break;
                    
                case 'ping':
                    this._sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                    
                default:
                    this._log('warn', `Unknown message type from ${clientData.id}: ${message.type}`);
                    this._sendToClient(ws, {
                        type: 'error',
                        message: `Unknown message type: ${message.type}`,
                        timestamp: new Date().toISOString()
                    });
            }

        } catch (error) {
            this._log('error', `Error parsing message from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'error',
                message: 'Invalid JSON format',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle authentication
    _handleAuthentication(ws, clientData, message) {
        if (!this.config.enableAuthentication) {
            this._sendToClient(ws, {
                type: 'auth_response',
                success: true,
                message: 'Authentication not required',
                timestamp: new Date().toISOString()
            });
            return;
        }

        if (message.token === this.config.authToken) {
            clientData.isAuthenticated = true;
            this._log('info', `Client ${clientData.id} authenticated successfully`);
            
            this._sendToClient(ws, {
                type: 'auth_response',
                success: true,
                message: 'Authentication successful',
                timestamp: new Date().toISOString()
            });

            this._sendToRenderer('websocket-client-authenticated', {
                clientId: clientData.id,
                ip: clientData.ip,
                timestamp: new Date().toISOString()
            });
        } else {
            this._log('warn', `Authentication failed for client ${clientData.id}`);
            
            this._sendToClient(ws, {
                type: 'auth_response',
                success: false,
                message: 'Invalid authentication token',
                timestamp: new Date().toISOString()
            });
            
            // Close connection after failed auth
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1008, 'Authentication failed');
                }
            }, 1000);
        }
    }

    // Handle sensor data
    _handleSensorData(ws, clientData, message) {
        if (this.config.enableAuthentication && !clientData.isAuthenticated) {
            this._sendToClient(ws, {
                type: 'error',
                message: 'Authentication required',
                timestamp: new Date().toISOString()
            });
            return;
        }

        try {
            const sensorData = message.data || message.payload || message;
            
            // Validate required fields
            if (this.config.enableDataValidation && !this._validateSensorData(sensorData)) {
                this._sendToClient(ws, {
                    type: 'data_response',
                    success: false,
                    message: 'Data validation failed',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Add metadata
            const dataToSave = {
                ...sensorData,
                client_id: clientData.id,
                client_ip: clientData.ip,
                received_at: new Date().toISOString()
            };

            // Save to database
            this._saveToDatabase(dataToSave, ws, clientData);

            this._log('info', `Sensor data received from ${clientData.id}:`, sensorData);

            // Send to renderer for real-time display
            this._sendToRenderer('websocket-data-received', {
                clientId: clientData.id,
                data: sensorData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this._log('error', `Error processing sensor data from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'data_response',
                success: false,
                message: 'Error processing data',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle heartbeat
    _handleHeartbeat(ws, clientData, message) {
        clientData.lastHeartbeat = new Date();
        this._sendToClient(ws, {
            type: 'heartbeat_response',
            timestamp: new Date().toISOString()
        });
        this._log('debug', `Heartbeat from client ${clientData.id}`);
    }

    // Validate sensor data
    _validateSensorData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required fields
        for (const field of this.config.requiredFields) {
            if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
                this._log('warn', `Missing required field: ${field}`);
                return false;
            }
        }

        return true;
    }

    // Save data to database
    async _saveToDatabase(data, ws, clientData) {
        try {
            let dataToInsert = { ...data };

            // Handle encryption if configured
            if (this.db.encrypt && this.config.fieldsToEncrypt && this.config.fieldsToEncrypt.length > 0) {
                for (const field of this.config.fieldsToEncrypt) {
                    if (dataToInsert.hasOwnProperty(field) && dataToInsert[field] !== null && dataToInsert[field] !== undefined) {
                        try {
                            dataToInsert[field] = this.db.encrypt(String(dataToInsert[field]));
                            this._log('debug', `Field '${field}' encrypted`);
                        } catch (encError) {
                            this._log('error', `Error encrypting field '${field}': ${encError.message}`);
                        }
                    }
                }
            }

            const result = await this.db.postData(this.config.dbTableName, dataToInsert);
            
            this._log('info', `Data saved to database (${this.config.dbTableName}): ID ${result.insertId}`);

            // Send success response to client
            this._sendToClient(ws, {
                type: 'data_response',
                success: true,
                insertId: result.insertId,
                timestamp: new Date().toISOString()
            });

            // Send to renderer
            this._sendToRenderer('websocket-database-insert', {
                clientId: clientData.id,
                table: this.config.dbTableName,
                insertId: result.insertId,
                data: data,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this._log('error', `Database error for client ${clientData.id}: ${error.message}`);
            
            this._sendToClient(ws, {
                type: 'data_response',
                success: false,
                message: 'Database error',
                timestamp: new Date().toISOString()
            });

            this._sendToRenderer('websocket-database-error', {
                clientId: clientData.id,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle client disconnection
    _handleClientDisconnection(ws, clientData, code, reason) {
        this._log('info', `Client ${clientData.id} disconnected (${code}: ${reason})`);
        
        this.clients.delete(ws);
        this.connectionCount--;

        this._sendToRenderer('websocket-client-disconnected', {
            clientId: clientData.id,
            ip: clientData.ip,
            connectedDuration: Date.now() - clientData.connectedAt.getTime(),
            dataReceived: clientData.dataReceived,
            totalConnections: this.connectionCount,
            timestamp: new Date().toISOString()
        });
    }

    // Start heartbeat for client
    _startClientHeartbeat(ws, clientData) {
        const heartbeatTimer = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                const timeSinceLastHeartbeat = Date.now() - clientData.lastHeartbeat.getTime();
                
                if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 2) {
                    this._log('warn', `Client ${clientData.id} heartbeat timeout, closing connection`);
                    ws.close(1000, 'Heartbeat timeout');
                    clearInterval(heartbeatTimer);
                } else {
                    ws.ping();
                }
            } else {
                clearInterval(heartbeatTimer);
            }
        }, this.config.heartbeatInterval);
    }

    // Send message to specific client
    _sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                this._log('error', `Error sending message to client: ${error.message}`);
            }
        }
    }

    // Broadcast message to all connected clients
    broadcastToAll(message) {
        const messageStr = JSON.stringify(message);
        let sentCount = 0;

        this.clients.forEach((clientData, ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(messageStr);
                    sentCount++;
                } catch (error) {
                    this._log('error', `Error broadcasting to client ${clientData.id}: ${error.message}`);
                }
            }
        });

        this._log('info', `Broadcast sent to ${sentCount} clients`);
        return sentCount;
    }

    // Get server status
    getStatus() {
        const clientsInfo = Array.from(this.clients.values()).map(client => ({
            id: client.id,
            ip: client.ip,
            connectedAt: client.connectedAt,
            isAuthenticated: client.isAuthenticated,
            dataReceived: client.dataReceived,
            lastDataTime: client.lastDataTime
        }));

        return {
            isRunning: this.isRunning,
            port: this.config.port,
            host: this.config.host,
            connectionCount: this.connectionCount,
            maxConnections: this.config.maxConnections,
            authEnabled: this.config.enableAuthentication,
            authToken: this.config.enableAuthentication ? this.config.authToken : null,
            clients: clientsInfo,
            uptime: this.isRunning ? Date.now() - this.startTime : 0
        };
    }

    // Utility methods
    _generateAuthToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    _generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _log(level, message, data = null) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        const configLevel = levels[this.config.logLevel] || 1;
        
        if (levels[level] >= configLevel) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [WebSocket-${level.toUpperCase()}] ${message}`;
            
            console.log(logMessage);
            if (data) {
                console.log(data);
            }
        }
    }

    _sendToRenderer(channel, data) {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.send(channel, data);
        }
    }
}

module.exports = WebSocketHandler;