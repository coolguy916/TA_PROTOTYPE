// server.js - Backend-only server (no Electron GUI)
require('dotenv').config();
const alert = require('./lib/alert');

// Import modular components (without window manager)
const DatabaseManager = require('./modules/database/databaseManager');
const APIServer = require('./modules/api/apiServer');
const SerialManager = require('./modules/serial/serialManager');
const WebsocketManager = require('./modules/websocket/websocketManager');

class BackendServer {
    constructor() {
        this.databaseManager = null;
        this.apiServer = null;
        this.serialManager = null;
        this.websocketManager = null;
    }

    async initialize() {
        try {
            alert.system.startup('Monitor Framework Backend Server');

            // Initialize database
            this.databaseManager = new DatabaseManager();
            await this.databaseManager.initialize();

            // Initialize API server
            this.apiServer = new APIServer(this.databaseManager.getDatabase());
            this.apiServer.start();

            // Initialize serial manager (no window needed)
            this.serialManager = new SerialManager(
                this.databaseManager.getDatabase(),
                null // No main window in server mode
            );
            await this.serialManager.initialize();
            
            // Initialize WebSocket manager (no window needed)
            this.websocketManager = new WebsocketManager(
                this.databaseManager.getDatabase(),
                null // No main window in server mode
            );
            await this.websocketManager.initialize();

            alert.app.initialized();
            alert.success('SERVER', 'All services started successfully');
            alert.info('SERVER', 'API Server: http://localhost:3001');
            alert.info('SERVER', 'WebSocket Server: ws://localhost:8080');
            alert.info('SERVER', 'Frontend Development: npm run dev:frontend');

        } catch (error) {
            alert.error('SERVER', 'Backend server initialization failed', error);
            process.exit(1);
        }
    }

    async cleanup() {
        try {
            alert.system.shutdown('Backend Server');
            
            if (this.serialManager) {
                await this.serialManager.close();
            }
            if (this.databaseManager) {
                await this.databaseManager.close();
            }
            if (this.apiServer) {
                await this.apiServer.stop();
            }
            if (this.websocketManager) {
                await this.websocketManager.stop();
            }
            
            alert.success('SERVER', 'Backend server shutdown complete');
        } catch (error) {
            alert.error('SERVER', 'Error during cleanup', error);
        }
    }
}

// Create and start server
const server = new BackendServer();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    alert.system.shutdown('SIGINT received');
    await server.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    alert.system.shutdown('SIGTERM received');
    await server.cleanup();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    alert.error('SYSTEM', 'Unhandled Promise Rejection', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    alert.error('SYSTEM', 'Uncaught Exception', error);
    process.exit(1);
});

// Start the server
server.initialize();