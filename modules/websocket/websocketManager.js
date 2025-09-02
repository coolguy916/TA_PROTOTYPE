const WebSocketHandler = require('../../lib/com/webSocketCommunicator');
const alert = require('../../lib/alert');

class WebsocketManager {
    constructor(database, mainWindow) {
        this.database = database;
        this.mainWindow = mainWindow;
        this.websocketHandler = null;
        this.config = this.getWebsocketConfig();
        this.databaseAdapter = null; // NEW: Enhanced database adapter support
    }

    getWebsocketConfig() {
        return {
            port: process.env.WEBSOCKET_PORT || 8080,
            host: process.env.WEBSOCKET_HOST || '0.0.0.0',
            enableAuthentication: process.env.WEBSOCKET_ENABLE_AUTH === 'true',
            authToken: process.env.WEBSOCKET_AUTH_TOKEN || null,
            dbTableName: process.env.WEBSOCKET_DB_TABLE_NAME || 'sensors_data',
            requiredFields: process.env.WEBSOCKET_REQUIRED_FIELDS ?
                process.env.WEBSOCKET_REQUIRED_FIELDS.split(',') : [],
            fieldsToEncrypt: process.env.WEBSOCKET_FIELDS_TO_ENCRYPT ?
                process.env.WEBSOCKET_FIELDS_TO_ENCRYPT.split(',') : [],
            enableHeartbeat: process.env.WEBSOCKET_ENABLE_HEARTBEAT !== 'false',
            heartbeatInterval: parseInt(process.env.WEBSOCKET_HEARTBEAT_INTERVAL) || 30000,
            maxConnections: parseInt(process.env.WEBSOCKET_MAX_CONNECTIONS) || 10,
            enableDataValidation: process.env.WEBSOCKET_ENABLE_VALIDATION !== 'false',
            logLevel: process.env.WEBSOCKET_LOG_LEVEL || 'info'
        };
    }

    async initialize() {
        try {
            // NEW: Check if database has enhanced adapter support
            if (this.database && typeof this.database.getDatabaseAdapter === 'function') {
                this.databaseAdapter = this.database.getDatabaseAdapter();
                alert.system.config('WebSocket', 'Enhanced database adapter mode enabled');
            }

            this.websocketHandler = new WebSocketHandler(
                this.config,
                this.database,
                this.mainWindow
            );

            // In server mode (no window), start immediately
            // In Electron mode, wait for window to load
            const delay = this.mainWindow ? 2000 : 500;
            setTimeout(async () => {
                await this.websocketHandler.start();
            }, delay);

            const mode = this.mainWindow ? 'Electron' : 'Server';
            alert.system.ready(`WebSocket Manager (${mode} mode)`);
        } catch (error) {
            alert.error('WEBSOCKET', 'Manager initialization failed', error);
            throw error;
        }
    }

    getStatus() {
        return this.websocketHandler ? this.websocketHandler.getStatus() : null;
    }

    async stop() {
        if (this.websocketHandler) {
            await this.websocketHandler.stop();
        }
    }

    broadcastToAll(message) {
        if (this.websocketHandler) {
            return this.websocketHandler.broadcastToAll(message);
        }
        return 0;
    }

    // NEW: Enhanced methods for database adapter integration
    broadcastToRoom(roomId, message) {
        if (this.websocketHandler && this.websocketHandler.broadcastToRoom) {
            return this.websocketHandler.broadcastToRoom(roomId, message);
        }
        return 0;
    }

    getDatabaseAdapter() {
        return this.databaseAdapter;
    }

    async getDatabaseHealth() {
        if (this.databaseAdapter && this.databaseAdapter.healthCheck) {
            return await this.databaseAdapter.healthCheck();
        }
        return { status: 'unknown', message: 'Enhanced adapter not available' };
    }
}

module.exports = WebsocketManager;