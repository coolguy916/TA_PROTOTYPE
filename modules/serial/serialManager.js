// modules/serial/serialManager.js
const SerialCommunicator = require('../../lib/com/serialCommunicator');
const alert = require('../../lib/alert');

class SerialManager {
    constructor(database, mainWindow) {
        this.database = database;
        this.mainWindow = mainWindow;
        this.serialCommunicator = null;
        this.config = this.getSerialConfig();
    }

    getSerialConfig() {
        return {
            portPath: process.env.SERIAL_PORT || null,
            baudRate: process.env.SERIAL_BAUDRATE || 9600,
            lineDelimiter: process.env.SERIAL_LINE_DELIMITER || '\r\n',
            dataType: process.env.SERIAL_DATA_TYPES || 'json-object',
            dbTableName: process.env.SERIAL_DB_TABLE_NAME || 'sensors_table',
            requiredFields: process.env.SERIAL_REQUIRED_FIELDS || [],
            fieldsToEncrypt: process.env.SERIAL_FIELD_TO_ENCRYPT || [],
        };
    }

    async initialize() {
        try {
            this.serialCommunicator = new SerialCommunicator(
                this.config, 
                this.database, 
                this.mainWindow
            );

            // In server mode (no window), connect immediately
            // In Electron mode, wait for window to load
            const delay = this.mainWindow ? 2000 : 500;
            setTimeout(() => {
                this.serialCommunicator.connect();
            }, delay);

            const mode = this.mainWindow ? 'Electron' : 'Server';
            alert.system.ready(`Serial Manager (${mode} mode)`);
        } catch (error) {
            alert.error('SERIAL', 'Manager initialization failed', error);
            throw error;
        }
    }

    getStatus() {
        return this.serialCommunicator ? this.serialCommunicator.getStatus() : null;
    }

    async forceReconnect() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.forceReconnect();
        }
    }

    async disconnect() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.disconnect();
        }
    }

    async scanForBetterPorts() {
        if (this.serialCommunicator) {
            await this.serialCommunicator.scanForBetterPorts();
        }
    }

    setDynamicPortSwitching(enabled) {
        if (this.serialCommunicator) {
            this.serialCommunicator.setDynamicPortSwitching(enabled);
        }
    }

    sendData(data) {
        if (this.serialCommunicator) {
            this.serialCommunicator.sendData(data);
        }
    }

    async close() {
        if (this.serialCommunicator) {
            try {
                await this.serialCommunicator.close();
                console.log('Serial communicator closed');
            } catch (error) {
                console.error('Error closing serial communicator:', error);
                throw error;
            }
        }
    }

    isConnected() {
        return this.serialCommunicator ? this.serialCommunicator.isConnected() : false;
    }
}

module.exports = SerialManager;