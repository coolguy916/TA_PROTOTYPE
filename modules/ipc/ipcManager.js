// modules/ipc/ipcManager.js
const { ipcMain } = require('electron');
const alert = require('../../lib/alert');

class IPCManager {
    constructor(database, serialManager) {
        this.database = database;
        this.serialManager = serialManager;
        this.databaseAdapter = null; // NEW: Enhanced database adapter support
    }

    setupHandlers() {
        // NEW: Check if database has enhanced adapter support
        if (this.database && typeof this.database.getDatabaseAdapter === 'function') {
            this.databaseAdapter = this.database.getDatabaseAdapter();
            alert.system.config('IPC', 'Enhanced database adapter mode enabled');
        }

        this.setupDatabaseHandlers();
        this.setupSerialHandlers();
        this.setupEnhancedHandlers(); // NEW: Enhanced adapter handlers
        alert.system.ready('IPC Manager - All handlers configured');
    }

    setupDatabaseHandlers() {
        // User handlers
        ipcMain.handle('get-users', async () => {
            try {
                const users = await this.database.getAllUsers();
                return { success: true, data: users };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('insert-user', async (event, name, email) => {
            try {
                const result = await this.database.insertUser(name, email);
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Generic data handlers
        ipcMain.handle('post-data', async (event, table, data) => {
            try {
                const result = await this.database.postData(table, data);
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('insert-data', async (event, table, data) => {
            try {
                const result = await this.database.postData(table, data);
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('update-data', async (event, table, data, whereClause, whereParams) => {
            try {
                const result = await this.database.updateData(table, data, whereClause, whereParams);
                return { success: true, affectedRows: result.affectedRows };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('delete-data', async (event, table, whereClause, whereParams) => {
            try {
                const result = await this.database.deleteData(table, whereClause, whereParams);
                return { success: true, affectedRows: result.affectedRows };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('get-data-by-filters', async (event, table, filters, options) => {
            try {
                const result = await this.database.getDataByFilters(table, filters, options);
                return { success: true, data: result };
            } catch (err) {
                alert.error('IPC', 'get-data-by-filters handler error', err);
                return { success: false, error: err.message };
            }
        });
    }

    setupSerialHandlers() {
        // Get serial connection status
        ipcMain.handle('serial-get-status', async () => {
            try {
                if (this.serialManager) {
                    return { success: true, data: this.serialManager.getStatus() };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Force reconnection
        ipcMain.handle('serial-force-reconnect', async () => {
            try {
                if (this.serialManager) {
                    await this.serialManager.forceReconnect();
                    return { success: true, message: 'Reconnection initiated' };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Disconnect serial connection
        ipcMain.handle('serial-disconnect', async () => {
            try {
                if (this.serialManager) {
                    await this.serialManager.disconnect();
                    return { success: true, message: 'Disconnected successfully' };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Scan for better ports
        ipcMain.handle('serial-scan-ports', async () => {
            try {
                if (this.serialManager) {
                    await this.serialManager.scanForBetterPorts();
                    return { success: true, message: 'Port scanning initiated' };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Toggle dynamic port switching
        ipcMain.handle('serial-toggle-dynamic-switching', async (event, enabled) => {
            try {
                if (this.serialManager) {
                    this.serialManager.setDynamicPortSwitching(enabled);
                    return { success: true, message: `Dynamic switching ${enabled ? 'enabled' : 'disabled'}` };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Send data to serial device
        ipcMain.handle('serial-send-data', async (event, data) => {
            try {
                if (this.serialManager) {
                    this.serialManager.sendData(data);
                    return { success: true, message: 'Data sent successfully' };
                } else {
                    return { success: false, error: 'Serial manager not initialized' };
                }
            } catch (err) {
                return { success: false, error: err.message };
            }
        });
    }

    // NEW: Enhanced database adapter handlers
    setupEnhancedHandlers() {
        if (!this.databaseAdapter) return;

        // Database health check
        ipcMain.handle('db-health-check', async () => {
            try {
                const health = await this.databaseAdapter.healthCheck();
                return { success: true, data: health };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Database configuration info
        ipcMain.handle('db-get-config', async () => {
            try {
                const config = this.databaseAdapter.getConfig();
                return { success: true, data: config };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Real-time subscription (Firestore only)
        ipcMain.handle('db-subscribe', async (event, tableName, filters = {}) => {
            try {
                const subscription = this.databaseAdapter.subscribe(tableName, (data) => {
                    event.sender.send('db-subscription-data', { 
                        tableName, 
                        data, 
                        subscriptionId: subscription.subscriptionId 
                    });
                }, filters);
                
                return { 
                    success: true, 
                    subscriptionId: subscription.subscriptionId 
                };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Unsubscribe from real-time updates
        ipcMain.handle('db-unsubscribe', async (event, subscriptionId) => {
            try {
                const result = this.databaseAdapter.unsubscribe(subscriptionId);
                return { success: result, message: result ? 'Unsubscribed' : 'Subscription not found' };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Raw query execution (MySQL only)
        ipcMain.handle('db-query', async (event, sql, params = []) => {
            try {
                const result = await this.databaseAdapter.query(sql, params);
                return { success: true, data: result };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        // Transaction support
        ipcMain.handle('db-transaction', async (event, operations) => {
            try {
                const result = await this.databaseAdapter.transaction(async (db) => {
                    const results = [];
                    for (const op of operations) {
                        switch (op.type) {
                            case 'insert':
                                results.push(await db.postData(op.table, op.data));
                                break;
                            case 'update':
                                results.push(await db.updateData(op.table, op.data, op.where, op.params));
                                break;
                            case 'delete':
                                results.push(await db.deleteData(op.table, op.where, op.params));
                                break;
                            default:
                                throw new Error(`Unknown operation type: ${op.type}`);
                        }
                    }
                    return results;
                });
                return { success: true, data: result };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });
    }
}

module.exports = IPCManager;