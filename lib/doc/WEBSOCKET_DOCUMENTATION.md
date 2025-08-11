# WebSocket Handler Documentation

## Overview
The WebSocketHandler class provides a robust WebSocket server implementation for real-time communication with multiple clients, featuring authentication, heartbeat monitoring, and data validation.

## Features
- Real-time bidirectional communication
- Client authentication
- Heartbeat monitoring
- Data validation
- Automatic reconnection
- Client metadata tracking
- Database integration
- Encryption support

## Configuration Options
```javascript
{
    port: 8080,                  // WebSocket server port
    host: '0.0.0.0',            // Host to bind to
    enableAuthentication: false, // Enable/disable client authentication
    authToken: null,            // Authentication token
    dbTableName: 'sensors_data',// Database table for storing data
    requiredFields: [],         // Required fields in incoming data
    fieldsToEncrypt: [],        // Fields to encrypt before storage
    enableHeartbeat: true,      // Enable/disable heartbeat
    heartbeatInterval: 30000,   // Heartbeat interval in ms
    maxConnections: 10,         // Maximum allowed connections
    enableDataValidation: true, // Enable/disable data validation
    logLevel: 'info'           // Logging level (debug/info/warn/error)
}
```

## Methods

### Server Control
```javascript
// Start the WebSocket server
await webSocketHandler.start();

// Stop the WebSocket server
await webSocketHandler.stop();

// Get server status
const status = webSocketHandler.getStatus();
```

### Client Communication
```javascript
// Broadcast message to all clients
webSocketHandler.broadcastToAll({
    type: 'notification',
    message: 'System update required'
});
```

### Event Handling Examples

#### Client Connection
```javascript
// The handler automatically manages new connections
webSocketHandler.on('connection', (ws, request) => {
    // Connection is handled internally
    // Client gets assigned an ID and metadata
});
```

#### Message Handling
```javascript
// Receiving data from client
ws.on('message', (data) => {
    const message = {
        type: 'sensor_data',
        data: {
            temperature: 25.5,
            humidity: 60
        }
    };
    webSocketHandler._handleClientMessage(ws, clientData, message);
});
```

#### Authentication Example
```javascript
// Client authentication request
const authMessage = {
    type: 'authentication',
    token: 'your_auth_token'
};

// Server handles authentication
webSocketHandler._handleAuthentication(ws, clientData, authMessage);
```

## Client Status Management
```javascript
// Get all connected clients info
const clientsInfo = Array.from(webSocketHandler.clients.values()).map(client => ({
    id: client.id,
    ip: client.ip,
    connectedAt: client.connectedAt,
    isAuthenticated: client.isAuthenticated,
    dataReceived: client.dataReceived
}));
```

## Data Validation
```javascript
// Example of data validation configuration
const config = {
    requiredFields: ['timestamp', 'sensorId', 'value'],
    enableDataValidation: true
};

// The handler validates incoming data automatically
_validateSensorData(data) {
    if (!data || typeof data !== 'object') return false;
    return config.requiredFields.every(field => field in data);
}
```

## Error Handling
```javascript
// Error events are automatically logged and sent to renderer
webSocketHandler.on('error', (error) => {
    this._log('error', `WebSocket server error: ${error.message}`);
    this._sendToRenderer('websocket-server-error', {
        error: error.message,
        timestamp: new Date().toISOString()
    });
});
```

## Integration with Database
```javascript
// Example of saving data to database
async _saveToDatabase(data, ws, clientData) {
    try {
        const result = await this.db.postData(this.config.dbTableName, data);
        return result;
    } catch (error) {
        this._log('error', `Database error: ${error.message}`);
        throw error;
    }
}
```

## Security Considerations

### Authentication
- Token-based authentication system
- Configurable authentication requirement
- Secure token generation using crypto
- Connection limits to prevent DoS

### Data Encryption
- Support for field-level encryption
- Integration with database encryption
- Secure token transmission

### Connection Management
- Maximum connection limits
- Heartbeat monitoring
- Automatic disconnection of stale clients
- IP tracking and logging

## Best Practices

1. **Enable Authentication**
```javascript
const config = {
    enableAuthentication: true,
    authToken: 'your_secure_token'
};
```

2. **Configure Heartbeat**
```javascript
const config = {
    enableHeartbeat: true,
    heartbeatInterval: 30000  // 30 seconds
};
```

3. **Set Data Validation**
```javascript
const config = {
    enableDataValidation: true,
    requiredFields: ['timestamp', 'sensorId', 'value']
};
```

4. **Implement Error Handling**
```javascript
webSocketHandler.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Implement recovery logic
});
```

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Check port availability
   - Verify network configuration
   - Check maximum connection limits

2. **Authentication Issues**
   - Verify token configuration
   - Check client token transmission
   - Verify encryption settings

3. **Data Validation Errors**
   - Check required fields configuration
   - Verify data format
   - Check client data structure

### Logging
```javascript
// Set appropriate log level
const config = {
    logLevel: 'debug'  // For detailed logging
};

// Check logs
webSocketHandler._log('debug', 'Detailed message');
webSocketHandler._log('error', 'Error message');
```
