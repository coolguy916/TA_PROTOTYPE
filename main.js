// main.js - Main entry point
require('dotenv').config();
const { app } = require('electron');

// Import modular components
const DatabaseManager = require('./modules/database/databaseManager');
const WindowManager = require('./modules/window/windowManager');
const APIServer = require('./modules/api/apiServer');
const SerialManager = require('./modules/serial/serialManager');
const IPCManager = require('./modules/ipc/ipcManager');
const WebsocketManager = require('./modules/websocket/websocketManager');

class Application {
    constructor() {
        this.databaseManager = null;
        this.windowManager = null;
        this.apiServer = null;
        this.serialManager = null;
        this.ipcManager = null;
        this.websocketManager = null;
    }

    async initialize() {
        try {
            // Initialize database
            this.databaseManager = new DatabaseManager();
            await this.databaseManager.initialize();

            // Initialize window manager
            this.windowManager = new WindowManager();
            this.windowManager.createWindow();

            // Initialize API server
            this.apiServer = new APIServer(this.databaseManager.getDatabase());
            this.apiServer.start();

            // Initialize serial manager
            this.serialManager = new SerialManager(
                this.databaseManager.getDatabase(),
                this.windowManager.getMainWindow()
            );
            await this.serialManager.initialize();
            
            // Initialize WebSocket manager
            this.websocketManager = new WebsocketManager(
                this.databaseManager.getDatabase(),
                this.windowManager.getMainWindow()
            );
            await this.websocketManager.initialize();

            // Initialize IPC handlers
            this.ipcManager = new IPCManager(
                this.databaseManager.getDatabase(),
                this.serialManager
            );
            this.ipcManager.setupHandlers();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error("Failed to initialize application:", error);
            app.quit();
        }
    }

    async cleanup() {
        try {
            if (this.serialManager) {
                await this.serialManager.close();
            }
            if (this.databaseManager) {
                await this.databaseManager.close();
            }
            if (this.apiServer) {
                await this.apiServer.stop();
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
        }
    }
}

// Application instance
const application = new Application();

// Electron event handlers
app.whenReady().then(() => application.initialize());

app.on('window-all-closed', async () => {
    await application.cleanup();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (require('electron').BrowserWindow.getAllWindows().length === 0) {
        application.initialize();
    }
});