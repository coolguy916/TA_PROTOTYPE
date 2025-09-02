// lib/db/databaseAdapter.js
// Universal Database Adapter for Monitor Framework - Works with existing structure

const Database = require('./mysqlDB');
const FirebaseDB = require('./firebaseDB');

class DatabaseAdapter {
    constructor() {
        this.databases = new Map();
        this.primaryDb = null;
        this.secondaryDb = null;
        this.initialized = false;
        this.subscriptions = new Map();
        
        // Configuration from environment
        this.config = {
            type: process.env.DB_TYPE || 'mysql', // mysql, firestore, hybrid
            mysql: {
                host: process.env.MYSQL_HOST || 'localhost',
                port: parseInt(process.env.MYSQL_PORT) || 3306,
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'monitor_db',
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10
            },
            firebase: {
                projectId: process.env.FIREBASE_PROJECT_ID,
                serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                useFirestore: process.env.USE_FIRESTORE !== 'false' // Default to Firestore
            }
        };
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log(`🗄️ Initializing Database Adapter (${this.config.type} mode)...`);
            
            // Initialize primary database
            if (this.config.type === 'mysql' || this.config.type === 'hybrid') {
                this.databases.set('mysql', new Database(this.config.mysql));
                await this.databases.get('mysql').connect();
                this.primaryDb = this.databases.get('mysql');
                console.log('✅ MySQL database connected');
            }

            // Initialize Firebase/Firestore if enabled
            if (this.config.type === 'firestore' || this.config.type === 'hybrid') {
                this.databases.set('firebase', new FirebaseDB(this.config.firebase));
                await this.databases.get('firebase').connect();
                
                if (!this.primaryDb) {
                    this.primaryDb = this.databases.get('firebase');
                }
                this.secondaryDb = this.databases.get('firebase');
                console.log('✅ Firebase database connected');
            }

            this.initialized = true;
            console.log(`🎯 Database adapter initialized successfully`);
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw new Error(`Database initialization failed: ${error.message}`);
        }
    }

    // Main database operations - compatible with existing codebase
    async postData(tableName, data = {}) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.postData(tableName, data);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('postData', tableName, data).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`postData failed for ${tableName}:`, error);
            throw error;
        }
    }

    async getDataByFilters(tableName, filters = {}, options = {}) {
        await this.ensureInitialized();
        
        try {
            return await this.primaryDb.getDataByFilters(tableName, filters, options);
        } catch (error) {
            // Fallback to secondary if available
            if (this.secondaryDb) {
                console.warn('Primary database read failed, trying secondary:', error.message);
                return await this.secondaryDb.getDataByFilters(tableName, filters, options);
            }
            throw error;
        }
    }

    async updateData(tableName, data = {}, whereClause = '', whereParams = []) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.updateData(tableName, data, whereClause, whereParams);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('updateData', tableName, data, whereClause, whereParams).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`updateData failed for ${tableName}:`, error);
            throw error;
        }
    }

    async deleteData(tableName, whereClause = '', whereParams = []) {
        await this.ensureInitialized();
        
        try {
            const result = await this.primaryDb.deleteData(tableName, whereClause, whereParams);
            
            // Sync to secondary database if hybrid mode
            if (this.secondaryDb && this.config.type === 'hybrid') {
                this._syncToSecondary('deleteData', tableName, whereClause, whereParams).catch(err => {
                    console.warn('Secondary database sync failed:', err);
                });
            }
            
            return result;
        } catch (error) {
            console.error(`deleteData failed for ${tableName}:`, error);
            throw error;
        }
    }

    // Query builder interface (enhanced MySQL-style queries)
    table(name) {
        if (this.primaryDb && this.primaryDb.table) {
            return this.primaryDb.table(name);
        }
        throw new Error('Query builder not available for current database type');
    }

    // Raw query execution
    async query(sql, params = []) {
        await this.ensureInitialized();
        
        if (this.primaryDb && this.primaryDb.query) {
            return await this.primaryDb.query(sql, params);
        }
        throw new Error('Raw queries not supported for current database type');
    }

    // Transaction support
    async transaction(callback) {
        await this.ensureInitialized();
        
        if (this.primaryDb && this.primaryDb.transaction) {
            return await this.primaryDb.transaction(callback);
        }
        
        // For databases without transaction support, execute directly
        return await callback(this.primaryDb);
    }

    // Real-time subscription support (Firestore only)
    subscribe(tableName, callback, filters = {}) {
        const firebaseDb = this.databases.get('firebase');
        if (firebaseDb && firebaseDb.subscribe) {
            const subscriptionId = `${tableName}_${Date.now()}_${Math.random()}`;
            const unsubscribe = firebaseDb.subscribe(tableName, callback, filters);
            
            this.subscriptions.set(subscriptionId, {
                unsubscribe,
                tableName,
                createdAt: Date.now()
            });
            
            return {
                subscriptionId,
                unsubscribe: () => this.unsubscribe(subscriptionId)
            };
        }
        
        console.warn('Real-time subscriptions require Firebase/Firestore database');
        return { subscriptionId: null, unsubscribe: () => {} };
    }

    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionId);
            console.log(`📡 Subscription ${subscriptionId} unsubscribed`);
            return true;
        }
        return false;
    }

    unsubscribeAll() {
        for (const [id, subscription] of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions.clear();
        console.log('📡 All subscriptions unsubscribed');
    }

    // Legacy method compatibility
    async getAllUsers() {
        return await this.getDataByFilters('users');
    }

    async insertUser(name, email) {
        return await this.postData('users', { name, email });
    }

    // Validation (forwarded to primary database)
    validate(data, rules) {
        if (this.primaryDb && this.primaryDb.validate) {
            return this.primaryDb.validate(data, rules);
        }
    }

    // Encryption methods (forwarded to primary database)
    encrypt(text) {
        if (this.primaryDb && this.primaryDb.encrypt) {
            return this.primaryDb.encrypt(text);
        }
        return text;
    }

    decrypt(encryptedText) {
        if (this.primaryDb && this.primaryDb.decrypt) {
            return this.primaryDb.decrypt(encryptedText);
        }
        return encryptedText;
    }

    // Health check
    async healthCheck() {
        const health = {
            primary: false,
            secondary: false,
            databases: {}
        };

        for (const [name, db] of this.databases) {
            try {
                if (name === 'mysql' && db.query) {
                    await db.query('SELECT 1 as test');
                } else if (name === 'firebase') {
                    // Firebase health check is handled in connect method
                }
                
                health.databases[name] = { 
                    status: 'healthy', 
                    lastCheck: new Date(),
                    type: name === 'mysql' ? 'MySQL' : (db.isFirestore ? 'Firestore' : 'Firebase Realtime')
                };
                
                if (db === this.primaryDb) health.primary = true;
                if (db === this.secondaryDb) health.secondary = true;
                
            } catch (error) {
                health.databases[name] = { 
                    status: 'unhealthy', 
                    error: error.message,
                    lastCheck: new Date()
                };
            }
        }

        return health;
    }

    // Get current configuration
    getConfig() {
        return {
            type: this.config.type,
            primaryDatabase: this.primaryDb ? (this.primaryDb.constructor.name) : null,
            secondaryDatabase: this.secondaryDb ? (this.secondaryDb.constructor.name) : null,
            databases: Array.from(this.databases.keys()),
            isFirestore: this.secondaryDb ? this.secondaryDb.isFirestore : null
        };
    }

    // Close all connections
    async close() {
        console.log('🛑 Closing database adapter...');
        
        // Unsubscribe from all real-time subscriptions
        this.unsubscribeAll();
        
        const promises = [];
        
        for (const [name, db] of this.databases) {
            if (db.close) {
                promises.push(
                    db.close().catch(err => 
                        console.warn(`Failed to close ${name} database:`, err)
                    )
                );
            }
        }

        await Promise.all(promises);
        this.databases.clear();
        this.primaryDb = null;
        this.secondaryDb = null;
        this.initialized = false;
        
        console.log('📚 Database adapter closed successfully');
    }

    // Private methods
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    async _syncToSecondary(method, ...args) {
        if (!this.secondaryDb) return;
        
        try {
            await this.secondaryDb[method](...args);
        } catch (error) {
            console.error(`Secondary sync failed for ${method}:`, error);
            // Could implement retry logic here
        }
    }

    // Static helper methods
    static createMySQLConfig(host, port, user, password, database) {
        return {
            type: 'mysql',
            mysql: { host, port, user, password, database }
        };
    }

    static createFirebaseConfig(projectId, serviceAccountKey, useFirestore = true) {
        return {
            type: 'firestore',
            firebase: { projectId, serviceAccountKey, useFirestore }
        };
    }

    static createHybridConfig(mysqlConfig, firebaseConfig) {
        return {
            type: 'hybrid',
            mysql: mysqlConfig,
            firebase: firebaseConfig
        };
    }
}

// Singleton pattern for easy integration with existing modules
let instance = null;

module.exports = {
    DatabaseAdapter,
    getInstance: () => {
        if (!instance) {
            instance = new DatabaseAdapter();
        }
        return instance;
    },
    resetInstance: () => {
        if (instance && instance.initialized) {
            instance.close();
        }
        instance = null;
    },
    // Export helper methods
    createMySQLConfig: DatabaseAdapter.createMySQLConfig,
    createFirebaseConfig: DatabaseAdapter.createFirebaseConfig,
    createHybridConfig: DatabaseAdapter.createHybridConfig
};