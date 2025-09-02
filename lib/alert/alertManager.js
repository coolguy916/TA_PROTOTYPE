// lib/alert/alertManager.js
// Colorful and Clean Alert System for Monitor Framework

const colors = {
    // Text colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    
    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    
    // Styles
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    // Reset
    reset: '\x1b[0m'
};

class AlertManager {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.enableColors = process.env.DISABLE_COLORS !== 'true';
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
    }

    // Get timestamp
    getTimestamp() {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    // Format message with colors and icons
    formatMessage(level, category, message, icon = '', color = colors.white) {
        if (!this.enableColors) {
            return `[${this.getTimestamp()}] [${level.toUpperCase()}] [${category}] ${message}`;
        }

        const timestamp = `${colors.gray}[${this.getTimestamp()}]${colors.reset}`;
        const levelTag = `${color}${colors.bright}[${level.toUpperCase()}]${colors.reset}`;
        const categoryTag = `${colors.cyan}[${category}]${colors.reset}`;
        const formattedMessage = `${color}${icon} ${message}${colors.reset}`;

        return `${timestamp} ${levelTag} ${categoryTag} ${formattedMessage}`;
    }

    // Check if log level should be displayed
    shouldLog(level) {
        return this.logLevels[level] <= this.logLevels[this.logLevel];
    }

    // Core logging method
    log(level, category, message, icon, color) {
        if (!this.shouldLog(level)) return;
        
        const formatted = this.formatMessage(level, category, message, icon, color);
        console.log(formatted);
    }

    // Success messages (green)
    success(category, message) {
        this.log('info', category, message, '✅', colors.green);
    }

    // Error messages (red)
    error(category, message, error = null) {
        const errorMsg = error ? `${message}: ${error.message}` : message;
        this.log('error', category, errorMsg, '❌', colors.red);
    }

    // Warning messages (yellow)
    warning(category, message) {
        this.log('warn', category, message, '⚠️', colors.yellow);
    }

    // Info messages (blue)
    info(category, message) {
        this.log('info', category, message, 'ℹ️', colors.blue);
    }

    // Debug messages (magenta)
    debug(category, message) {
        this.log('debug', category, message, '🐛', colors.magenta);
    }

    // Database related messages
    database = {
        connected: (dbType, details = '') => {
            this.success('DATABASE', `${dbType} connected successfully ${details}`);
        },
        
        disconnected: (dbType) => {
            this.info('DATABASE', `${dbType} disconnected`);
        },
        
        error: (operation, error) => {
            this.error('DATABASE', `${operation} failed`, error);
        },
        
        query: (query, duration = null) => {
            const durationText = duration ? `(${duration}ms)` : '';
            this.debug('DATABASE', `Query executed: ${query} ${durationText}`);
        },
        
        health: (status, details = '') => {
            const icon = status === 'healthy' ? '💚' : '💔';
            const color = status === 'healthy' ? colors.green : colors.red;
            this.log('info', 'DATABASE', `Health check: ${status} ${details}`, icon, color);
        }
    };

    // WebSocket related messages
    websocket = {
        serverStarted: (port) => {
            this.success('WEBSOCKET', `Server started on port ${port}`);
        },
        
        clientConnected: (clientId, count) => {
            this.info('WEBSOCKET', `Client connected [${clientId}] - Total: ${count}`);
        },
        
        clientDisconnected: (clientId, count) => {
            this.info('WEBSOCKET', `Client disconnected [${clientId}] - Total: ${count}`);
        },
        
        messageReceived: (type, from) => {
            this.debug('WEBSOCKET', `Message received: ${type} from ${from}`);
        },
        
        messageSent: (type, to) => {
            this.debug('WEBSOCKET', `Message sent: ${type} to ${to}`);
        },
        
        roomJoined: (clientId, room) => {
            this.log('info', 'WEBSOCKET', `Client ${clientId} joined room: ${room}`, '🏠', colors.cyan);
        },
        
        roomLeft: (clientId, room) => {
            this.log('info', 'WEBSOCKET', `Client ${clientId} left room: ${room}`, '🚪', colors.cyan);
        },
        
        broadcast: (room, messageType, count) => {
            this.log('info', 'WEBSOCKET', `Broadcast ${messageType} to room ${room} (${count} clients)`, '📡', colors.magenta);
        }
    };

    // Serial communication messages
    serial = {
        connected: (port, baudRate) => {
            this.success('SERIAL', `Connected to ${port} at ${baudRate} baud`);
        },
        
        disconnected: (port) => {
            this.warning('SERIAL', `Disconnected from ${port}`);
        },
        
        dataReceived: (data, port) => {
            this.debug('SERIAL', `Data received from ${port}: ${JSON.stringify(data)}`);
        },
        
        dataSent: (data, port) => {
            this.debug('SERIAL', `Data sent to ${port}: ${JSON.stringify(data)}`);
        },
        
        portDetected: (port, description) => {
            this.log('info', 'SERIAL', `Port detected: ${port} (${description})`, '🔍', colors.cyan);
        },
        
        portSwitched: (oldPort, newPort) => {
            this.log('info', 'SERIAL', `Switched from ${oldPort} to ${newPort}`, '🔄', colors.yellow);
        },
        
        error: (operation, error) => {
            this.error('SERIAL', `${operation} failed`, error);
        }
    };

    // API server messages
    api = {
        serverStarted: (port) => {
            this.success('API', `Server started on port ${port}`);
        },
        
        requestReceived: (method, path, ip) => {
            this.debug('API', `${method} ${path} from ${ip}`);
        },
        
        requestCompleted: (method, path, status, duration) => {
            const color = status >= 400 ? colors.red : status >= 300 ? colors.yellow : colors.green;
            this.log('debug', 'API', `${method} ${path} - ${status} (${duration}ms)`, '📝', color);
        },
        
        authSuccess: (user, ip) => {
            this.log('info', 'API', `Authentication successful: ${user} from ${ip}`, '🔐', colors.green);
        },
        
        authFailed: (user, ip) => {
            this.log('warn', 'API', `Authentication failed: ${user} from ${ip}`, '🔒', colors.red);
        }
    };

    // System messages
    system = {
        startup: (component) => {
            this.log('info', 'SYSTEM', `${component} starting up...`, '🚀', colors.blue);
        },
        
        shutdown: (component) => {
            this.log('info', 'SYSTEM', `${component} shutting down...`, '🛑', colors.yellow);
        },
        
        ready: (component) => {
            this.success('SYSTEM', `${component} is ready`);
        },
        
        config: (key, value) => {
            this.debug('SYSTEM', `Config: ${key} = ${value}`);
        },
        
        memory: (usage) => {
            this.debug('SYSTEM', `Memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
        }
    };

    // Application lifecycle messages
    app = {
        initialized: () => {
            this.log('info', 'APP', 'Monitor Framework initialized successfully', '🎉', colors.green);
        },
        
        moduleLoaded: (moduleName) => {
            this.log('info', 'APP', `Module loaded: ${moduleName}`, '🧩', colors.cyan);
        },
        
        moduleError: (moduleName, error) => {
            this.error('APP', `Module ${moduleName} failed to load`, error);
        },
        
        healthCheck: (status, details) => {
            const icon = status === 'healthy' ? '💚' : '🔴';
            const color = status === 'healthy' ? colors.green : colors.red;
            this.log('info', 'APP', `Health check: ${status} ${details}`, icon, color);
        }
    };

    // Performance monitoring
    performance = {
        start: (operation) => {
            this.debug('PERF', `Started: ${operation}`);
            return Date.now();
        },
        
        end: (operation, startTime) => {
            const duration = Date.now() - startTime;
            const color = duration > 1000 ? colors.red : duration > 500 ? colors.yellow : colors.green;
            this.log('debug', 'PERF', `Completed: ${operation} in ${duration}ms`, '⏱️', color);
            return duration;
        }
    };
}

// Create singleton instance
const alertManager = new AlertManager();

module.exports = alertManager;