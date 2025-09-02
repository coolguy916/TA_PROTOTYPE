// lib/db/firebaseDB.js - Enhanced with optional Firestore support
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, set, get, update, remove, query, orderByChild, orderByKey, limitToFirst, limitToLast, equalTo, startAt, endAt } = require("firebase/database");
const crypto = require('crypto');
const alert = require('../alert');

// Optional Firestore support
let admin, getFirestore, Timestamp, FieldValue;
try {
    admin = require('firebase-admin');
    const firestoreModule = require('firebase-admin/firestore');
    getFirestore = firestoreModule.getFirestore;
    Timestamp = firestoreModule.Timestamp;
    FieldValue = firestoreModule.FieldValue;
} catch (error) {
    // Firestore dependencies not available, will use Realtime Database only
    alert.info('FIREBASE', 'Firestore dependencies not found, using Realtime Database only');
}

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.createHash('sha256').update(process.env.DB_ENCRYPTION_KEY || '').digest();
const IV_LENGTH = 16;

class FirebaseQueryBuilder {
    constructor(database, tableName) {
        this.database = database;
        this.tableName = tableName;
        this.filters = {};
        this.orderField = null;
        this.orderDirection = 'asc';
        this.limitCount = null;
        this.selectFields = null;
        this.isFirestore = database.isFirestore;
    }

    // SELECT methods
    select(fields = '*') {
        if (Array.isArray(fields)) {
            this.selectFields = fields;
        } else if (typeof fields === 'string' && fields !== '*') {
            this.selectFields = fields.split(',').map(field => field.trim());
        }
        return this;
    }

    // WHERE methods
    where(field, operator = '=', value = null) {
        if (typeof field === 'object' && field !== null) {
            // Handle object syntax: where({name: 'John', age: 25})
            Object.assign(this.filters, field);
        } else if (arguments.length === 2) {
            // Handle where(field, value) syntax
            this.filters[field] = { operator: '=', value: operator };
        } else {
            // Handle where(field, operator, value) syntax
            this.filters[field] = { operator, value };
        }
        return this;
    }

    whereIn(field, values) {
        if (Array.isArray(values) && values.length > 0) {
            this.filters[field] = { operator: 'in', value: values };
        }
        return this;
    }

    whereNotIn(field, values) {
        if (Array.isArray(values) && values.length > 0) {
            this.filters[field] = { operator: 'not-in', value: values };
        }
        return this;
    }

    whereBetween(field, min, max) {
        this.filters[field] = { operator: 'between', value: [min, max] };
        return this;
    }

    whereNull(field) {
        this.filters[field] = { operator: 'null' };
        return this;
    }

    whereNotNull(field) {
        this.filters[field] = { operator: 'not-null' };
        return this;
    }

    whereLike(field, pattern) {
        this.filters[field] = { operator: 'like', value: pattern };
        return this;
    }

    orWhere(field, operator = '=', value = null) {
        // Firebase doesn't support OR queries directly, but we can simulate some cases
        // For now, we'll store OR conditions separately and handle them in filtering
        if (!this.orConditions) this.orConditions = [];
        
        if (typeof field === 'object' && field !== null) {
            this.orConditions.push(field);
        } else if (arguments.length === 2) {
            this.orConditions.push({ [field]: { operator: '=', value: operator } });
        } else {
            this.orConditions.push({ [field]: { operator, value } });
        }
        return this;
    }

    // ORDER BY methods
    orderBy(field, direction = 'ASC') {
        this.orderField = field;
        this.orderDirection = direction.toLowerCase() === 'desc' ? 'desc' : 'asc';
        return this;
    }

    orderByDesc(field) {
        return this.orderBy(field, 'DESC');
    }

    orderByAsc(field) {
        return this.orderBy(field, 'ASC');
    }

    // LIMIT methods
    limit(count, offset = null) {
        this.limitCount = count;
        this.offsetCount = offset;
        return this;
    }

    take(count) {
        return this.limit(count);
    }

    skip(offset) {
        this.offsetCount = offset;
        return this;
    }

    // Execution methods
    async get() {
        try {
            if (this.isFirestore) {
                return await this._getFromFirestore();
            } else {
                return await this._getFromRealtimeDB();
            }
        } catch (error) {
            alert.database.error('Firebase get operation', error);
            throw error;
        }
    }

    async _getFromFirestore() {
        let query = this.database.db.collection(this.tableName);

        // Apply where conditions
        for (const [field, condition] of Object.entries(this.filters)) {
            if (typeof condition === 'object' && condition.operator) {
                switch (condition.operator) {
                    case '=':
                    case '==':
                        query = query.where(field, '==', condition.value);
                        break;
                    case '!=':
                    case '<>':
                        query = query.where(field, '!=', condition.value);
                        break;
                    case '>':
                        query = query.where(field, '>', condition.value);
                        break;
                    case '>=':
                        query = query.where(field, '>=', condition.value);
                        break;
                    case '<':
                        query = query.where(field, '<', condition.value);
                        break;
                    case '<=':
                        query = query.where(field, '<=', condition.value);
                        break;
                    case 'in':
                        if (Array.isArray(condition.value)) {
                            query = query.where(field, 'in', condition.value);
                        }
                        break;
                    case 'not-in':
                        if (Array.isArray(condition.value)) {
                            query = query.where(field, 'not-in', condition.value);
                        }
                        break;
                    case 'array-contains':
                        query = query.where(field, 'array-contains', condition.value);
                        break;
                }
            } else {
                query = query.where(field, '==', condition);
            }
        }

        // Apply ordering
        if (this.orderField) {
            query = query.orderBy(this.orderField, this.orderDirection === 'desc' ? 'desc' : 'asc');
        }

        // Apply limit
        if (this.limitCount) {
            query = query.limit(this.limitCount);
        }

        const snapshot = await query.get();
        
        if (snapshot.empty) {
            return [];
        }

        let data = [];
        snapshot.docs.forEach(doc => {
            const item = this.database._decryptRow(doc.data());
            data.push({ id: doc.id, ...item });
        });

        // Apply field selection
        if (this.selectFields && Array.isArray(this.selectFields)) {
            data = data.map(item => {
                const selected = { id: item.id };
                this.selectFields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        selected[field] = item[field];
                    }
                });
                return selected;
            });
        }

        // Handle offset manually
        if (this.offsetCount && this.offsetCount > 0) {
            data = data.slice(this.offsetCount);
        }

        return data;
    }

    async _getFromRealtimeDB() {
        const { ref, get, query, orderByChild, orderByKey, limitToFirst, limitToLast } = require("firebase/database");
        
        const dataRef = ref(this.database.db, this.tableName);
        let firebaseQuery = dataRef;

        // Apply ordering if specified
        if (this.orderField) {
            if (this.orderField === 'key' || this.orderField === '$key') {
                firebaseQuery = query(firebaseQuery, orderByKey());
            } else {
                firebaseQuery = query(firebaseQuery, orderByChild(this.orderField));
            }
        }

        // Apply limit
        if (this.limitCount) {
            if (this.orderDirection === 'desc') {
                firebaseQuery = query(firebaseQuery, limitToLast(this.limitCount));
            } else {
                firebaseQuery = query(firebaseQuery, limitToFirst(this.limitCount));
            }
        }

        const snapshot = await get(firebaseQuery);
        
        if (!snapshot.exists()) {
            return [];
        }

        let data = [];
        snapshot.forEach(childSnapshot => {
            const item = this.database._decryptRow(childSnapshot.val());
            data.push({ id: childSnapshot.key, ...item });
        });

        // Apply client-side filtering for complex conditions
        data = this._applyClientFilters(data);

        // Apply field selection
        if (this.selectFields && Array.isArray(this.selectFields)) {
            data = data.map(item => {
                const selected = { id: item.id };
                this.selectFields.forEach(field => {
                    if (item.hasOwnProperty(field)) {
                        selected[field] = item[field];
                    }
                });
                return selected;
            });
        }

        // Handle offset manually since Firebase doesn't support it directly
        if (this.offsetCount && this.offsetCount > 0) {
            data = data.slice(this.offsetCount);
        }

        return data;
    }

    async first() {
        this.limit(1);
        const results = await this.get();
        return results.length > 0 ? results[0] : null;
    }

    async count(field = '*') {
        const results = await this.get();
        return results.length;
    }

    async exists() {
        const count = await this.count();
        return count > 0;
    }

    async pluck(field) {
        this.select(field);
        const results = await this.get();
        return results.map(row => row[field]);
    }

    // UPDATE method
    async update(data) {
        if (Object.keys(data).length === 0) {
            throw new Error('No data provided for update');
        }

        try {
            // Get all matching records first
            const records = await this.get();
            
            if (records.length === 0) {
                return { affectedRows: 0 };
            }

            const updatePromises = records.map(record => {
                const recordRef = ref(this.database.db, `${this.tableName}/${record.id}`);
                const encryptedData = this.database._encryptData(data);
                return update(recordRef, encryptedData);
            });

            await Promise.all(updatePromises);
            return { affectedRows: records.length };
        } catch (error) {
            alert.database.error('Firebase update operation', error);
            throw error;
        }
    }

    // DELETE method
    async delete() {
        try {
            // Get all matching records first
            const records = await this.get();
            
            if (records.length === 0) {
                return { affectedRows: 0 };
            }

            const deletePromises = records.map(record => {
                const recordRef = ref(this.database.db, `${this.tableName}/${record.id}`);
                return remove(recordRef);
            });

            await Promise.all(deletePromises);
            return { affectedRows: records.length };
        } catch (error) {
            alert.database.error('Firebase delete operation', error);
            throw error;
        }
    }

    // Raw query method (limited functionality in Firebase)
    raw(path, params = []) {
        console.warn("Raw queries are not supported in Firebase. Use Firebase-specific methods instead.");
        return Promise.resolve([]);
    }

    // Apply client-side filters
    _applyClientFilters(data) {
        return data.filter(item => {
            // Apply main filters
            for (const [field, condition] of Object.entries(this.filters)) {
                if (!this._matchesCondition(item, field, condition)) {
                    return false;
                }
            }

            // Apply OR conditions if any
            if (this.orConditions && this.orConditions.length > 0) {
                const orMatch = this.orConditions.some(orCondition => {
                    return Object.entries(orCondition).every(([field, condition]) => {
                        return this._matchesCondition(item, field, condition);
                    });
                });
                if (!orMatch) return false;
            }

            return true;
        });
    }

    _matchesCondition(item, field, condition) {
        const fieldValue = item[field];
        
        if (typeof condition !== 'object' || condition === null) {
            return fieldValue === condition;
        }

        const { operator, value } = condition;

        switch (operator) {
            case '=':
            case '==':
                return fieldValue == value;
            case '!=':
            case '<>':
                return fieldValue != value;
            case '>':
                return fieldValue > value;
            case '>=':
                return fieldValue >= value;
            case '<':
                return fieldValue < value;
            case '<=':
                return fieldValue <= value;
            case 'in':
                return Array.isArray(value) && value.includes(fieldValue);
            case 'not-in':
                return Array.isArray(value) && !value.includes(fieldValue);
            case 'between':
                return Array.isArray(value) && fieldValue >= value[0] && fieldValue <= value[1];
            case 'like':
                const pattern = value.replace(/%/g, '.*').replace(/_/g, '.');
                return new RegExp(pattern, 'i').test(String(fieldValue));
            case 'null':
                return fieldValue === null || fieldValue === undefined;
            case 'not-null':
                return fieldValue !== null && fieldValue !== undefined;
            default:
                return fieldValue === value;
        }
    }
}

class FirebaseDB {
    constructor(config) {
        this.config = config;
        
        // Check if Firestore is specifically requested AND available
        this.isFirestore = (config.useFirestore === true || process.env.USE_FIRESTORE === 'true') && admin && getFirestore;
        
        if (this.isFirestore) {
            // Initialize Firestore using Admin SDK
            try {
                if (admin.apps.length === 0) {
                    const serviceAccount = config.serviceAccountKey ? require(config.serviceAccountKey) : undefined;
                    
                    this.firebaseApp = admin.initializeApp({
                        credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
                        projectId: config.projectId,
                        databaseURL: config.databaseURL
                    });
                } else {
                    this.firebaseApp = admin.app();
                }
                this.db = getFirestore(this.firebaseApp);
                alert.database.connected('Firestore', this.config.projectId);
            } catch (error) {
                alert.warning('FIREBASE', `Firestore initialization failed, falling back to Realtime Database: ${error.message}`);
                this.isFirestore = false;
            }
        }
        
        if (!this.isFirestore) {
            // Initialize Realtime Database using Client SDK (your original implementation)
            this.firebaseApp = initializeApp(config);
            this.db = getDatabase(this.firebaseApp);
            alert.database.connected('Firebase Realtime', this.config.projectId);
        }
    }

    // Connection method (for compatibility with your existing code)
    async connect() {
        if (this.isFirestore) {
            alert.success('FIREBASE', `Firestore connection established`);
        } else {
            alert.success('FIREBASE', `Realtime Database connection established`);
        }
        return Promise.resolve();
    }

    // Chainable query builder
    table(tableName) {
        return new FirebaseQueryBuilder(this, tableName);
    }

    from(tableName) {
        return this.table(tableName);
    }

    // Raw query method (limited in Firebase)
    raw(path, params = []) {
        console.warn("Raw queries are not fully supported in Firebase. Use Firebase-specific methods instead.");
        return Promise.resolve([]);
    }

    // Validation method (same as MySQL version)
    validate(data, rules) {
        for (const [field, rule] of Object.entries(rules)) {
            if (rule.includes('required') && (data[field] === undefined || data[field] === null || data[field] === '')) {
                throw new Error(`${field} is required`);
            }
            if (rule.includes('email') && data[field] && !/^\S+@\S+\.\S+$/.test(data[field])) {
                throw new Error(`${field} must be a valid email`);
            }
        }
    }

    // Encryption methods (same as MySQL version)
    encrypt(text) {
        if (text === null || typeof text === 'undefined') return text;
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
        let encrypted = cipher.update(String(text), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    decrypt(encryptedText) {
        if (typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            return encryptedText;
        }
        try {
            const textParts = encryptedText.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedData = textParts.join(':');
            const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            return encryptedText;
        }
    }

    _encryptData(data) {
        const encryptedData = {};
        for (const [key, value] of Object.entries(data)) {
            // You can specify which fields to encrypt based on your needs
            // For now, let's assume sensitive fields contain 'password', 'email', 'phone', etc.
            const sensitiveFields = ['password', 'email', 'phone', 'address', 'name'];
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                encryptedData[key] = this.encrypt(value);
            } else {
                encryptedData[key] = value;
            }
        }
        return encryptedData;
    }

    _decryptRow(row) {
        if (!row || typeof row !== 'object') return row;
        
        const decryptedRow = { ...row };
        for (const key in decryptedRow) {
            if (typeof decryptedRow[key] === 'string' && decryptedRow[key].includes(':')) {
                const originalValue = decryptedRow[key];
                decryptedRow[key] = this.decrypt(originalValue);
                if (decryptedRow[key] !== originalValue && !isNaN(Number(decryptedRow[key]))) {
                    decryptedRow[key] = Number(decryptedRow[key]);
                }
            }
        }
        return decryptedRow;
    }

    // Legacy methods for backward compatibility
    async postData(tableName, data = {}) {
        try {
            const encryptedData = this._encryptData(data);
            
            if (this.isFirestore) {
                // Add timestamps for Firestore
                encryptedData.created_at = Timestamp.now();
                encryptedData.updated_at = Timestamp.now();
                
                const docRef = await this.db.collection(tableName).add(encryptedData);
                return { insertId: docRef.id, affectedRows: 1 };
            } else {
                // Realtime Database
                const { ref, push, set } = require("firebase/database");
                
                const dataRef = ref(this.db, tableName);
                const newDataRef = push(dataRef);
                
                // Add timestamp for Realtime DB
                encryptedData.created_at = new Date().toISOString();
                
                await set(newDataRef, encryptedData);
                return { insertId: newDataRef.key, affectedRows: 1 };
            }
        } catch (error) {
            alert.database.error('Firebase postData operation', error);
            throw error;
        }
    }

    async updateData(tableName, data = {}, whereClause = '', whereParams = []) {
        try {
            // For Firebase, we need to parse the whereClause and whereParams
            // This is a simplified implementation
            const filters = this._parseWhereClause(whereClause, whereParams);
            
            return await this.table(tableName)
                .where(filters)
                .update(data);
        } catch (error) {
            alert.database.error('Firebase updateData operation', error);
            throw error;
        }
    }

    async deleteData(tableName, whereClause = '', whereParams = []) {
        try {
            const filters = this._parseWhereClause(whereClause, whereParams);
            
            return await this.table(tableName)
                .where(filters)
                .delete();
        } catch (error) {
            alert.database.error('Firebase deleteData operation', error);
            throw error;
        }
    }

    async getDataByFilters(tableName, filters = {}, options = {}) {
        try {
            let query = this.table(tableName);

            // Apply filters
            if (Object.keys(filters).length > 0) {
                query = query.where(filters);
            }

            // Apply ordering
            if (options.orderBy) {
                if (typeof options.orderBy === 'string') {
                    const parts = options.orderBy.trim().split(/\s+/);
                    const column = parts[0];
                    const direction = parts[1] || 'DESC';
                    query = query.orderBy(column, direction);
                } else if (options.orderBy.column) {
                    const direction = options.orderBy.direction || 'DESC';
                    query = query.orderBy(options.orderBy.column, direction);
                }
            }

            // Apply limit
            if (options.limit && Number.isInteger(options.limit) && options.limit > 0) {
                query = query.limit(options.limit);
            }

            const results = await query.get();
            return results;
        } catch (error) {
            alert.database.error('Firebase getDataByFilters operation', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const results = await this.table('users').get();
            return results;
        } catch (error) {
            alert.database.error('Firebase getAllUsers operation', error);
            throw error;
        }
    }

    async insertUser(name, email) {
        try {
            const result = await this.postData('users', { name, email });
            return result;
        } catch (error) {
            alert.database.error('Firebase insertUser operation', error);
            throw error;
        }
    }

    // Helper method to parse MySQL-style WHERE clauses for Firebase
    _parseWhereClause(whereClause, whereParams = []) {
        if (!whereClause) return {};
        
        const filters = {};
        let paramIndex = 0;
        
        // Simple parsing - you might need to enhance this based on your needs
        const conditions = whereClause.split(' AND ');
        
        conditions.forEach(condition => {
            const match = condition.match(/`?(\w+)`?\s*(=|!=|>|>=|<|<=|LIKE)\s*\?/i);
            if (match && paramIndex < whereParams.length) {
                const field = match[1];
                const operator = match[2].toLowerCase();
                const value = whereParams[paramIndex++];
                
                filters[field] = { operator, value };
            }
        });
        
        return filters;
    }

    // Real-time subscription methods for Firestore
    subscribe(tableName, callback, filters = {}) {
        if (!this.isFirestore) {
            console.warn('Real-time subscriptions are only available with Firestore');
            return () => {}; // Return empty unsubscribe function
        }

        let query = this.db.collection(tableName);
        
        // Apply filters if provided
        for (const [field, value] of Object.entries(filters)) {
            query = query.where(field, '==', value);
        }

        const unsubscribe = query.onSnapshot(
            (snapshot) => {
                const changes = snapshot.docChanges().map(change => ({
                    type: change.type, // 'added', 'modified', 'removed'
                    id: change.doc.id,
                    data: this._decryptRow(change.doc.data()),
                    oldIndex: change.oldIndex,
                    newIndex: change.newIndex
                }));
                
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...this._decryptRow(doc.data())
                }));
                
                callback({
                    type: 'snapshot',
                    data,
                    changes,
                    metadata: {
                        hasPendingWrites: snapshot.metadata.hasPendingWrites,
                        fromCache: snapshot.metadata.fromCache
                    }
                });
            },
            (error) => {
                alert.database.error(`Firestore subscription for ${tableName}`, error);
                callback({
                    type: 'error',
                    error: error.message,
                    collection: tableName
                });
            }
        );

        return unsubscribe;
    }

    async close() {
        try {
            if (this.isFirestore && this.firebaseApp) {
                await this.firebaseApp.delete();
                alert.database.disconnected('Firestore');
            } else {
                alert.database.disconnected('Firebase Realtime DB');
            }
        } catch (error) {
            alert.database.error('Firebase connection close', error);
        }
        return Promise.resolve();
    }

    check_up(data) {
        if (!data) {
            return { success: false, error: "Database not initialized for controller." };
        }
    }

    // Firebase-specific methods
    async query(path, params = []) {
        console.warn("Direct query method is not applicable to Firebase. Use table() methods instead.");
        return [];
    }
}

module.exports = FirebaseDB;