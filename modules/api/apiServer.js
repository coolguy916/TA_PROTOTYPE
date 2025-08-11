// modules/api/apiServer.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Controllers
const dbController = require('../../App/Http/Controllers/databaseController');
const authController = require('../../App/Http/Controllers/authController');
const mauiController = require('../../App/Http/Controllers/mauiController');

class APIServer {
    constructor(database) {
        this.app = express();
        this.database = database;
        this.server = null;
        this.port = process.env.API_PORT || 3001;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeControllers();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    initializeControllers() {
        dbController.initializeController(this.database);
        authController.initializeController(this.database);
    }

    setupRoutes() {
        // Authentication Routes
        this.app.post('/api/auth/register', authController.register);
        this.app.post('/api/auth/login', authController.login);

        // Data Routes
        this.app.post('/api/sensor-data', dbController.insertSensorData);
        this.app.post('/api/maui-data', mauiController.genericDataHandler);

        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                success: true, 
                message: 'API server is running',
                timestamp: new Date().toISOString()
            });
        });

        /*
        this.app.get('/api/profile', authenticateToken, async (req, res) => {
            try {
                const userProfile = await this.database.findUserByEmail(req.user.email);
                const { password, ...profileData } = userProfile;
                res.json({ success: true, data: profileData });
            } catch (error) {
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
        */
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`API server listening at http://localhost:${this.port}`);
        });
    }

    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('API server stopped');
                    resolve();
                });
            });
        }
    }

    getApp() {
        return this.app;
    }

    getPort() {
        return this.port;
    }
}

module.exports = APIServer;