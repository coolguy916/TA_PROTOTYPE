// modules/window/windowManager.js
const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const alert = require('../../lib/alert');

class WindowManager {
    constructor() {
        this.mainWindow = null;
        this.useReactFrontend = process.env.USE_REACT_FRONTEND === 'true';
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, '../../preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            }
        });

        // NEW: Support both React frontend and traditional HTML
        this.loadAppropriateUI();

        // Set fullscreen
        this.mainWindow.setFullScreen(true);

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        alert.system.ready(`Window Manager (${this.useReactFrontend ? 'React' : 'HTML'} frontend)`);
    }

    // NEW: Load appropriate UI based on configuration
    loadAppropriateUI() {
        if (this.useReactFrontend) {
            // Check if React build exists
            const reactBuildPath = path.join(__dirname, '../../frontend/build/index.html');
            if (fs.existsSync(reactBuildPath)) {
                this.mainWindow.loadFile(reactBuildPath);
                console.log('✅ Loading React frontend from build');
            } else {
                // Development mode - connect to React dev server
                const reactDevUrl = process.env.REACT_DEV_URL || 'http://localhost:3000';
                this.mainWindow.loadURL(reactDevUrl);
                console.log(`⚡ Loading React frontend from dev server: ${reactDevUrl}`);
            }
        } else {
            // Traditional HTML frontend
            const htmlPath = path.join(__dirname, '../../resource', 'view', 'layout', 'index.html');
            if (fs.existsSync(htmlPath)) {
                this.mainWindow.loadFile(htmlPath);
                console.log('✅ Loading traditional HTML frontend');
            } else {
                console.error('❌ HTML frontend not found, creating fallback');
                this.createFallbackHTML();
            }
        }
    }

    // NEW: Create a simple fallback HTML if none exists
    createFallbackHTML() {
        const fallbackHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Monitor Framework</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .info { background: #e3f2fd; border: 1px solid #1976d2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Monitor Framework</h1>
        <div class="status info">
            <p>The application is running successfully!</p>
            <p>To set up the React frontend, run: <code>npm run setup</code></p>
            <p>To enable React frontend, set: <code>USE_REACT_FRONTEND=true</code> in your .env file</p>
        </div>
    </div>
</body>
</html>`;

        const fallbackPath = path.join(__dirname, '../../fallback.html');
        fs.writeFileSync(fallbackPath, fallbackHTML);
        this.mainWindow.loadFile(fallbackPath);
    }

    getMainWindow() {
        return this.mainWindow;
    }

    closeWindow() {
        if (this.mainWindow) {
            this.mainWindow.close();
        }
    }

    isWindowCreated() {
        return this.mainWindow !== null;
    }

    // NEW: Methods for React frontend integration
    isUsingReactFrontend() {
        return this.useReactFrontend;
    }

    toggleFrontend(useReact = null) {
        if (useReact !== null) {
            this.useReactFrontend = useReact;
        } else {
            this.useReactFrontend = !this.useReactFrontend;
        }
        
        if (this.mainWindow) {
            this.loadAppropriateUI();
        }
        
        console.log(`Frontend switched to: ${this.useReactFrontend ? 'React' : 'HTML'}`);
        return this.useReactFrontend;
    }

    reloadWindow() {
        if (this.mainWindow) {
            this.loadAppropriateUI();
        }
    }

    // NEW: Development helpers
    openDevTools() {
        if (this.mainWindow) {
            this.mainWindow.webContents.openDevTools();
        }
    }

    refreshWindow() {
        if (this.mainWindow) {
            this.mainWindow.webContents.reload();
        }
    }
}

module.exports = WindowManager;