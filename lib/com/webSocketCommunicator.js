// WebSocketHandler.js - Enhanced with database sync capabilities
const WebSocket = require('ws');
const crypto = require('crypto');
const alert = require('../alert');

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
            enableDatabaseSync: true, // NEW: Enable real-time database sync
            enableRoomBroadcast: true, // NEW: Enable room-based broadcasting
            
            ...config
        };

        this.db = dbInstance;
        this.mainWindow = windowInstance;
        this.server = null;
        this.clients = new Map(); // Store client connections with metadata
        this.rooms = new Map(); // NEW: Store room subscriptions
        this.dbSubscriptions = new Map(); // NEW: Store database subscriptions
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
            
            alert.websocket.serverStarted(this.config.port);
            
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

        // Log client connection with enhanced alert system
        alert.websocket.clientConnected(clientId, this.connectionCount);
        
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

                // NEW: Database sync operations
                case 'db_create':
                    this._handleDatabaseCreate(ws, clientData, message);
                    break;
                    
                case 'db_read':
                    this._handleDatabaseRead(ws, clientData, message);
                    break;
                    
                case 'db_update':
                    this._handleDatabaseUpdate(ws, clientData, message);
                    break;
                    
                case 'db_delete':
                    this._handleDatabaseDelete(ws, clientData, message);
                    break;
                    
                case 'db_subscribe':
                    this._handleDatabaseSubscribe(ws, clientData, message);
                    break;
                    
                case 'db_unsubscribe':
                    this._handleDatabaseUnsubscribe(ws, clientData, message);
                    break;

                // NEW: Room management
                case 'join_room':
                    this._handleJoinRoom(ws, clientData, message);
                    break;
                    
                case 'leave_room':
                    this._handleLeaveRoom(ws, clientData, message);
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
        this.clients.delete(ws);
        alert.websocket.clientDisconnected(clientData.id, this.connectionCount);
        
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

    // NEW: Broadcast to specific room
    broadcastToRoom(roomId, message) {
        if (!this.config.enableRoomBroadcast || !this.rooms.has(roomId)) {
            return 0;
        }

        const messageStr = JSON.stringify(message);
        const room = this.rooms.get(roomId);
        let sentCount = 0;

        room.clients.forEach(clientId => {
            const ws = Array.from(this.clients.keys()).find(ws => 
                this.clients.get(ws).id === clientId
            );
            
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(messageStr);
                    sentCount++;
                } catch (error) {
                    this._log('error', `Error broadcasting to client ${clientId} in room ${roomId}: ${error.message}`);
                }
            }
        });

        this._log('info', `Room broadcast sent to ${sentCount} clients in room ${roomId}`);
        return sentCount;
    }

    // NEW: Database operation handlers
    async _handleDatabaseCreate(ws, clientData, message) {
        if (!this._checkAuthAndSend(ws, clientData)) return;

        try {
            const { table, data } = message.data || message;
            if (!table || !data) {
                this._sendToClient(ws, {
                    type: 'db_create_response',
                    success: false,
                    error: 'Missing table or data',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const result = await this.db.postData(table, data);
            
            this._sendToClient(ws, {
                type: 'db_create_response',
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

            // Broadcast to room subscribers if enabled
            if (this.config.enableDatabaseSync) {
                this.broadcastToRoom(`db_${table}`, {
                    type: 'db_change',
                    action: 'create',
                    table,
                    data: result,
                    clientId: clientData.id,
                    timestamp: new Date().toISOString()
                });
            }

            this._log('info', `Database create via WebSocket: ${table} by ${clientData.id}`);

        } catch (error) {
            this._log('error', `Database create error from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'db_create_response',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async _handleDatabaseRead(ws, clientData, message) {
        if (!this._checkAuthAndSend(ws, clientData)) return;

        try {
            const { table, filters, options } = message.data || message;
            if (!table) {
                this._sendToClient(ws, {
                    type: 'db_read_response',
                    success: false,
                    error: 'Missing table name',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const result = await this.db.getDataByFilters(table, filters || {}, options || {});
            
            this._sendToClient(ws, {
                type: 'db_read_response',
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

            this._log('debug', `Database read via WebSocket: ${table} by ${clientData.id}`);

        } catch (error) {
            this._log('error', `Database read error from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'db_read_response',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async _handleDatabaseUpdate(ws, clientData, message) {
        if (!this._checkAuthAndSend(ws, clientData)) return;

        try {
            const { table, data, whereClause, whereParams } = message.data || message;
            if (!table || !data) {
                this._sendToClient(ws, {
                    type: 'db_update_response',
                    success: false,
                    error: 'Missing table or data',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const result = await this.db.updateData(table, data, whereClause || '', whereParams || []);
            
            this._sendToClient(ws, {
                type: 'db_update_response',
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

            // Broadcast to room subscribers if enabled
            if (this.config.enableDatabaseSync) {
                this.broadcastToRoom(`db_${table}`, {
                    type: 'db_change',
                    action: 'update',
                    table,
                    data: { whereClause, whereParams, updateData: data },
                    clientId: clientData.id,
                    timestamp: new Date().toISOString()
                });
            }

            this._log('info', `Database update via WebSocket: ${table} by ${clientData.id}`);

        } catch (error) {
            this._log('error', `Database update error from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'db_update_response',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async _handleDatabaseDelete(ws, clientData, message) {
        if (!this._checkAuthAndSend(ws, clientData)) return;

        try {
            const { table, whereClause, whereParams } = message.data || message;
            if (!table) {
                this._sendToClient(ws, {
                    type: 'db_delete_response',
                    success: false,
                    error: 'Missing table name',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const result = await this.db.deleteData ? 
                await this.db.deleteData(table, whereClause || '', whereParams || []) :
                await this.db.table(table).where(whereClause || {}).delete();
            
            this._sendToClient(ws, {
                type: 'db_delete_response',
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

            // Broadcast to room subscribers if enabled
            if (this.config.enableDatabaseSync) {
                this.broadcastToRoom(`db_${table}`, {
                    type: 'db_change',
                    action: 'delete',
                    table,
                    data: { whereClause, whereParams },
                    clientId: clientData.id,
                    timestamp: new Date().toISOString()
                });
            }

            this._log('info', `Database delete via WebSocket: ${table} by ${clientData.id}`);

        } catch (error) {
            this._log('error', `Database delete error from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'db_delete_response',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    _handleDatabaseSubscribe(ws, clientData, message) {
        if (!this._checkAuthAndSend(ws, clientData)) return;

        try {
            const { table, filters } = message.data || message;
            if (!table) {
                this._sendToClient(ws, {
                    type: 'db_subscribe_response',
                    success: false,
                    error: 'Missing table name',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const roomId = `db_${table}`;
            
            // Add client to room
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, { 
                    clients: new Set(), 
                    table, 
                    filters: filters || {},
                    createdAt: new Date() 
                });
            }
            
            this.rooms.get(roomId).clients.add(clientData.id);
            
            // If database supports real-time subscriptions (like Firestore)
            if (this.db.subscribe && !this.dbSubscriptions.has(roomId)) {
                const unsubscribe = this.db.subscribe(table, (changes) => {
                    this.broadcastToRoom(roomId, {
                        type: 'db_realtime',
                        table,
                        changes,
                        timestamp: new Date().toISOString()
                    });
                }, filters);
                
                this.dbSubscriptions.set(roomId, unsubscribe);
                this._log('info', `Real-time database subscription created for ${table}`);
            }
            
            this._sendToClient(ws, {
                type: 'db_subscribe_response',
                success: true,
                table,
                roomId,
                timestamp: new Date().toISOString()
            });

            this._log('info', `Client ${clientData.id} subscribed to database table: ${table}`);

        } catch (error) {
            this._log('error', `Database subscribe error from ${clientData.id}: ${error.message}`);
            this._sendToClient(ws, {
                type: 'db_subscribe_response',
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    _handleDatabaseUnsubscribe(ws, clientData, message) {
        const { table } = message.data || message;
        if (!table) return;

        const roomId = `db_${table}`;
        
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).clients.delete(clientData.id);
            
            // Remove room if no clients left
            if (this.rooms.get(roomId).clients.size === 0) {
                // Unsubscribe from database if applicable
                const unsubscribe = this.dbSubscriptions.get(roomId);
                if (unsubscribe) {
                    unsubscribe();
                    this.dbSubscriptions.delete(roomId);
                }
                
                this.rooms.delete(roomId);
                this._log('info', `Database subscription removed for ${table} (no clients left)`);
            }
        }
        
        this._sendToClient(ws, {
            type: 'db_unsubscribe_response',
            success: true,
            table,
            timestamp: new Date().toISOString()
        });

        this._log('info', `Client ${clientData.id} unsubscribed from database table: ${table}`);
    }

    _handleJoinRoom(ws, clientData, message) {
        const { roomId } = message.data || message;
        if (!roomId) return;

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { 
                clients: new Set(), 
                createdAt: new Date() 
            });
        }
        
        this.rooms.get(roomId).clients.add(clientData.id);
        
        this._sendToClient(ws, {
            type: 'room_joined',
            roomId,
            timestamp: new Date().toISOString()
        });

        alert.websocket.roomJoined(clientData.id, roomId);
    }

    _handleLeaveRoom(ws, clientData, message) {
        const { roomId } = message.data || message;
        if (!roomId || !this.rooms.has(roomId)) return;

        this.rooms.get(roomId).clients.delete(clientData.id);
        
        // Remove empty rooms
        if (this.rooms.get(roomId).clients.size === 0) {
            this.rooms.delete(roomId);
        }
        
        this._sendToClient(ws, {
            type: 'room_left',
            roomId,
            timestamp: new Date().toISOString()
        });

        alert.websocket.roomLeft(clientData.id, roomId);
    }

    // Helper method for authentication check
    _checkAuthAndSend(ws, clientData) {
        if (this.config.enableAuthentication && !clientData.isAuthenticated) {
            this._sendToClient(ws, {
                type: 'error',
                message: 'Authentication required',
                timestamp: new Date().toISOString()
            });
            return false;
        }
        return true;
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
        // Use the new alert system with proper categorization
        const fullMessage = data ? `${message} - ${JSON.stringify(data)}` : message;
        
        switch (level) {
            case 'debug':
                alert.debug('WEBSOCKET', fullMessage);
                break;
            case 'info':
                alert.info('WEBSOCKET', fullMessage);
                break;
            case 'warn':
                alert.warning('WEBSOCKET', fullMessage);
                break;
            case 'error':
                alert.error('WEBSOCKET', fullMessage);
                break;
            default:
                alert.info('WEBSOCKET', fullMessage);
        }
    }

    _sendToRenderer(channel, data) {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.send(channel, data);
        }
    }
}

module.exports = WebSocketHandler;