// modules/database/databaseManager.js - Enhanced with new database adapter
const FirebaseDB = require('../../lib/db/firebaseDB');
const Database = require('../../lib/db/mysqlDB');
const { getInstance: getDatabaseAdapter } = require('../../lib/db/databaseAdapter');
const { apiKey } = require('../../firebaseConfig');
const alert = require('../../lib/alert');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbAdapter = null; // NEW: Enhanced database adapter
        this.useFirebase = process.env.USE_FIREBASE === 'true';
        this.useEnhancedAdapter = process.env.USE_ENHANCED_ADAPTER === 'true';
    }

    async initialize() {
        try {
            // NEW: Use enhanced database adapter if enabled
            if (this.useEnhancedAdapter) {
                alert.system.startup('Enhanced Database Adapter (hybrid mode)');
                this.dbAdapter = getDatabaseAdapter();
                await this.dbAdapter.initialize();
                this.db = this.dbAdapter; // Provide compatibility interface
                alert.success('DATABASE', `Enhanced adapter initialized (${this.dbAdapter.getConfig().type} mode)`);
                return;
            }

            // Original database initialization (backward compatibility)
            if (this.useFirebase) {
                this.db = new FirebaseDB({
                    apiKey: process.env.FIREBASE_API_KEY || apiKey,
                    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
                    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-database-url.firebaseio.com',
                    projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
                    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
                    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
                    appId: process.env.FIREBASE_APP_ID || 'your-app-id',
                    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'your-measurement-id',
                    useFirestore: process.env.USE_FIRESTORE === 'true' // NEW: Firestore support
                });
                await this.db.connect();
            } else {
                this.db = new Database({
                    host: process.env.MYSQL_HOST || 'localhost',
                    user: process.env.MYSQL_USER || 'root',
                    password: process.env.MYSQL_PASSWORD || '',
                    database: process.env.MYSQL_DATABASE || 'monitor_db'
                });
                await this.db.connect();
            }

            const dbType = this.useFirebase ? 
                (this.db.isFirestore ? 'Firestore' : 'Firebase Realtime') : 'MySQL';
            alert.database.connected(dbType, 'Database layer ready');
            
        } catch (error) {
            alert.database.error('Database initialization', error);
            throw error;
        }
    }

    getDatabase() {
        return this.db;
    }

    // NEW: Get enhanced database adapter
    getDatabaseAdapter() {
        return this.dbAdapter;
    }

    // NEW: Get database configuration info
    getDatabaseInfo() {
        if (this.dbAdapter) {
            return this.dbAdapter.getConfig();
        }
        return {
            type: this.useFirebase ? 'firebase' : 'mysql',
            useFirestore: this.db?.isFirestore || false,
            useEnhancedAdapter: this.useEnhancedAdapter
        };
    }

    async close() {
        if (this.db) {
            try {
                await this.db.close();
                alert.database.disconnected('Database Manager');
            } catch (error) {
                alert.database.error('Connection close', error);
                throw error;
            }
        }
    }

    isFirebase() {
        return this.useFirebase;
    }

    // NEW: Check if using enhanced adapter
    isEnhancedMode() {
        return this.useEnhancedAdapter;
    }

    // NEW: Get health check information
    async getHealthCheck() {
        if (this.dbAdapter && this.dbAdapter.healthCheck) {
            return await this.dbAdapter.healthCheck();
        }
        return { status: 'unknown', type: this.isFirebase() ? 'firebase' : 'mysql' };
    }
}

module.exports = DatabaseManager;