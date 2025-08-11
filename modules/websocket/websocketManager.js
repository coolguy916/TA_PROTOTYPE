const WebSocketHandler = require('../../lib/com/webSocketCommunicator');

class WebsocketManager {
    constructor(database, mainWindow) {
        this.database = database;
        this.mainWindow = mainWindow;
        this.websocketHandler = null;
        this.config = this.getWebsocketConfig();
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
            this.websocketHandler = new WebSocketHandler(
                this.config,
                this.database,
                this.mainWindow
            );

            // Wait for window to load before starting the server
            setTimeout(async () => {
                await this.websocketHandler.start();
            }, 2000);

            console.log('WebSocket server manager initialized');
        } catch (error) {
            console.error('WebSocket server manager initialization failed:', error);
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
}

module.exports = WebsocketManager;