<<<<<<< HEAD
# Monitor Framework 2.0 - Enhanced Universal Edition

**A next-generation modular, real-time monitoring and control framework** that supports both web and desktop deployment. Built with React frontend and Node.js backend, featuring enhanced WebSocket real-time communication, universal database support (MySQL/Firestore/Hybrid), and a highly modular architecture for easy integration into any project.

> **Transform your industrial monitoring dreams into reality!** This isn't just another backend framework - it's your gateway to building robust, real-time monitoring systems that adapt, scale, and never miss a beat. Now with **enhanced database adapter**, **universal React frontend**, and **hybrid database sync** capabilities!

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)]()
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)]()
[![React](https://img.shields.io/badge/React-Universal-61dafb.svg)]()
[![WebSocket](https://img.shields.io/badge/WebSocket-Enhanced-purple.svg)]()
[![Electron](https://img.shields.io/badge/Electron-Desktop-lightblue.svg)]()
[![Database](https://img.shields.io/badge/Database-Hybrid%20Sync-red.svg)]()

## 🚀 What Makes This Framework Special?

Imagine having a monitoring system that's as flexible as a Swiss Army knife and as reliable as a lighthouse. This framework brings together the best of multiple worlds:

- **🔄 Universal Database Support**: MySQL, Firestore, or hybrid mode with automatic sync
- **⚡ Enhanced Real-time Everything**: WebSocket communications with database sync and room-based broadcasting
- **🌐 Universal Frontend**: React-powered UI that works as web app AND desktop application
- **🔗 Smart Serial Communication**: Auto-reconnecting, self-healing device connections
- **🛡️ Fort Knox Security**: Built-in encryption for sensitive data
- **🖥️ Desktop Ready**: Electron-powered interface with React frontend support
- **🔧 Enhanced Database Adapter**: Unified interface across all database types with health monitoring
- **📡 Real-time Subscriptions**: Live data updates with Firestore real-time listeners

## 🏗️ Architecture That Actually Makes Sense

```
┌─────────────────────────────────────────────────────────────────┐
│                 🖥️  Electron Desktop Application                │
├─────────────┬─────────────────┬─────────────────┬───────────────┤
│ 💾 Database │ 🌐 WebSocket    │ 🔌 Serial Comm │ 🚀 REST API   │
│    Layer    │    Server       │    Handler      │    Server     │
├─────────────┼─────────────────┼─────────────────┼───────────────┤
│ MySQL       │ Real-time Data  │ Arduino/ESP32   │ External      │
│ Firebase    │ Broadcasting    │ Auto-detection  │ Integration   │
│ QueryBuilder│ Client Mgmt     │ Smart Reconnect │ Auth Ready    │
└─────────────┴─────────────────┴─────────────────┴───────────────┘
```

## 📁 **Project Structure - Your Roadmap to Success**

Understanding where everything lives is crucial for efficient development. Here's your complete project anatomy:

```
flow-meter-monitoring/
├── 📋 main.js                          # 🚀 Application entry point - Orchestrates all modules
├── 🔗 preload.js                       # 🌉 Bridge between frontend and backend
├── 📦 package.json                     # 📋 Dependencies and scripts
├── 🔐 .env                            # ⚙️ Configuration secrets (create from .env.example)
├── 🔐 .env.example                    # 📝 Template for environment variables
├── 🔧 firebaseConfig.js               # 🔥 Firebase configuration defaults
├── 📚 README.md                       # 📖 You are here!
│
├── 📂 modules/                        # 🧩 Modular Framework Components (NEW!)
│   ├── 📂 database/                   # 💾 Database Management Module
│   │   └── 🗄️ databaseManager.js     # 🏗️ Database initialization & lifecycle
│   │
│   ├── 📂 window/                     # 🖥️ Window Management Module
│   │   └── 🪟 windowManager.js       # 📊 Electron window creation & control
│   │
│   ├── 📂 api/                        # 🌐 API Server Module
│   │   └── 🚀 apiServer.js           # 🔗 Express server setup & routing
│   │
│   ├── 📂 serial/                     # 📡 Serial Communication Module
│   │   └── 🔌 serialManager.js       # 📟 Hardware communication orchestration
│   │
│   └── 📂 ipc/                        # 🌉 IPC Communication Module
│       └── 💬 ipcManager.js          # 🔄 Frontend-backend bridge handlers
│
├── 📂 lib/                            # 🏗️ Core Framework Libraries
│   ├── 📂 db/                         # 💾 Database Abstraction Layer
│   │   ├── 🗄️ mysqlDB.js             # 🐬 MySQL database handler + Query Builder
│   │   ├── 🔥 firebaseDB.js          # 🔥 Firebase Realtime + Firestore handler + Query Builder
│   │   └── 🔧 databaseAdapter.js      # ✨ NEW! Universal database adapter (MySQL/Firestore/Hybrid)
│   │
│   └── 📂 com/                        # 🌐 Communication Modules  
│       ├── 🔌 serialCommunicator.js   # 📡 Arduino/ESP32/Device communication
│       └── 🌐 webSocketCommunicator.js # 💬 Enhanced WebSocket server with database sync
│
├── 📂 controller/                     # 🎮 Business Logic Controllers
│   └── 📂 app/                        # 📱 Application-specific controllers
│       ├── 🔐 authController.js       # 👤 User authentication & JWT handling
│       ├── 🗄️ databaseController.js   # 💾 Generic database operations
│       └── 📱 mauiController.js       # 📲 MAUI/Mobile app integration
│
├── 📂 resource/                       # 🎨 Frontend Resources
│   └── 📂 view/                       # 👁️ User Interface Files
│       └── 📂 uibaru/                 # 🎨 New UI Components
│           ├── 🖥️ monitor.html        # 📊 Main monitoring dashboard
│           ├── 🎨 style.css           # 💄 Dashboard styling
│           └── ⚡ script.js           # 🧠 Frontend logic & real-time updates
│
├── 📂 scripts/                        # 🔧 Utility Scripts
│   └── 🔄 switch-db.js               # 🎛️ Database switching utility
│
├── 📂 frontend/                       # 🌐 React Frontend (NEW!)
│   ├── 📦 package.json               # 📋 Frontend dependencies
│   ├── 📂 src/                        # ⚛️ React source files
│   ├── 📂 public/                     # 🌍 Public web assets
│   └── 📂 build/                      # 📦 Production build output
│
└── 📂 node_modules/                   # 📦 Dependencies (auto-generated)
```

## ✨ **NEW! Enhanced Features Overview**

### 🔧 **Enhanced Database Adapter** 
The new universal database adapter (`lib/db/databaseAdapter.js`) provides a unified interface across all database types:

```javascript
// Single interface for all database types!
const adapter = new DatabaseAdapter();
await adapter.initialize(); // Auto-configures based on environment

// Works the same regardless of MySQL, Firestore, or Hybrid mode
const data = await adapter.postData('sensors', sensorData);
const readings = await adapter.getDataByFilters('sensors', { active: true });

// NEW: Real-time subscriptions (Firestore only)
const subscription = adapter.subscribe('sensors', (data) => {
    console.log('Real-time update:', data);
});

// NEW: Health monitoring
const health = await adapter.healthCheck();
console.log('Database status:', health);
```

**Key Features:**
- **🔄 Hybrid Mode**: Use MySQL and Firestore simultaneously with automatic sync
- **🏥 Health Monitoring**: Real-time database health checks and status reporting
- **📡 Real-time Subscriptions**: Live data updates with Firestore listeners
- **🔀 Transaction Support**: Cross-database transaction handling
- **⚖️ Load Balancing**: Automatic failover between primary and secondary databases

### 🌐 **Universal React Frontend**
The framework now supports both traditional HTML and modern React frontends:

```javascript
// Environment Configuration
USE_REACT_FRONTEND=true          # Enable React frontend
REACT_DEV_URL=http://localhost:3000  # Development server URL

// WindowManager automatically detects and loads appropriate frontend
const windowManager = new WindowManager();
windowManager.createWindow(); // Loads React or HTML based on config
```

**Frontend Features:**
- **🖥️ Desktop & Web**: Same React app works as Electron desktop app and web browser
- **🔄 Hot Switching**: Toggle between React and HTML frontends at runtime
- **📡 WebSocket Integration**: Built-in WebSocket client with auto-reconnection
- **🎯 Electron API**: Full access to backend via enhanced preload bridge

### 🌐 **Enhanced WebSocket Server**
Upgraded WebSocket server with database synchronization capabilities:

```javascript
// NEW: Database sync operations via WebSocket
ws.send(JSON.stringify({
    type: 'db_create',
    table: 'sensors',
    data: { temperature: 25.5, timestamp: new Date() }
}));

// NEW: Real-time subscriptions
ws.send(JSON.stringify({
    type: 'db_subscribe',
    table: 'sensors',
    filters: { active: true }
}));

// NEW: Room-based broadcasting
wsHandler.broadcastToRoom('sensor-room-1', {
    type: 'sensor_update',
    data: sensorData
});
```

**WebSocket Features:**
- **💾 Database Sync**: Direct database operations through WebSocket messages
- **🏠 Room Support**: Join/leave rooms for targeted message broadcasting
- **📡 Real-time Subscriptions**: Subscribe to database changes via WebSocket
- **🔄 Auto-reconnection**: Client-side automatic reconnection with exponential backoff

### 🔧 **Enhanced Module Integration**
All modules now integrate seamlessly with the enhanced database adapter:

```javascript
// Modules automatically detect and use enhanced features
this.websocketManager = new WebsocketManager(database, mainWindow);
// ✅ Automatically uses enhanced adapter if available
// ✅ Provides room-based broadcasting
// ✅ Supports database health monitoring

this.ipcManager = new IPCManager(database, serialManager);  
// ✅ Automatically adds enhanced IPC handlers
// ✅ Supports real-time subscriptions
// ✅ Provides transaction support
// ✅ Includes health monitoring endpoints
```

## 🎯 **File Purpose Guide - Know What You're Editing**

### 🚀 **Core Application Files**

#### `main.js` - The Orchestrator (NEW MODULAR APPROACH!)
```javascript
// 🎯 Purpose: Simplified application bootstrap using modular components
// ✏️ Edit when: Adding new modules, changing initialization order, app-wide config
// 🔧 Contains: Module orchestration, lifecycle management, error handling

// Key sections to modify:
class Application {
    async initialize() {
        // Add new module initializations here
        this.databaseManager = new DatabaseManager();
        this.windowManager = new WindowManager();
        this.apiServer = new APIServer();
        // Add your custom modules here
    }
}
```

### 🧩 **Modular Components (`modules/`)**

#### `modules/database/databaseManager.js` - Database Orchestrator
```javascript
// 🎯 Purpose: Centralized database initialization and management
// ✏️ Edit when: Adding database configurations, switching logic, connection pooling
// 🔧 Contains: Database initialization, connection management, cleanup

class DatabaseManager {
    async initialize() {
        // Add custom database initialization logic
        if (this.useFirebase) {
            this.db = new FirebaseDB(/* config */);
        } else {
            this.db = new Database(/* config */);
            await this.db.connect();
        }
    }
    
    // Add custom database management methods
    async switchDatabase(type) { /* switching logic */ }
    async healthCheck() { /* health monitoring */ }
}
```

#### `modules/window/windowManager.js` - Window Controller
```javascript
// 🎯 Purpose: Electron window lifecycle and configuration management
// ✏️ Edit when: Changing window properties, adding new windows, menu customization
// 🔧 Contains: Window creation, configuration, event handling

class WindowManager {
    createWindow() {
        // Modify window configuration
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            // Add custom window options
        });
        
        // Add custom window event handlers
        this.mainWindow.on('custom-event', this.handleCustomEvent);
    }
    
    // Add new window management methods
    createSecondaryWindow() { /* additional windows */ }
    toggleFullscreen() { /* window controls */ }
}
```

#### `modules/api/apiServer.js` - API Orchestrator
```javascript
// 🎯 Purpose: Express server setup, middleware, and route organization
// ✏️ Edit when: Adding new routes, middleware, authentication, API versioning
// 🔧 Contains: Server configuration, route setup, controller initialization

class APIServer {
    setupRoutes() {
        // Add new API routes
        this.app.post('/api/v2/sensors', sensorController.createSensor);
        this.app.get('/api/admin/stats', authMiddleware, adminController.getStats);
        
        // Add custom middleware
        this.app.use('/api/secure', this.authenticateMiddleware);
    }
    
    // Add server management methods
    addRoute(method, path, handler) { /* dynamic routing */ }
    enableCORS(origins) { /* CORS configuration */ }
}
```

#### `modules/serial/serialManager.js` - Hardware Communication Hub
```javascript
// 🎯 Purpose: Serial communication orchestration and device management
// ✏️ Edit when: Adding device types, communication protocols, data parsing
// ✏️ Contains: Serial configuration, connection management, data handling

class SerialManager {
    async initialize() {
        // Configure serial communication
        this.serialCommunicator = new SerialCommunicator(
            this.config, 
            this.database, 
            this.mainWindow
        );
        
        // Add custom device handlers
        this.setupDeviceHandlers();
    }
    
    // Add device-specific methods
    handleArduinoData(data) { /* Arduino-specific parsing */ }
    handleESP32Data(data) { /* ESP32-specific parsing */ }
    addCustomDevice(config) { /* dynamic device addition */ }
}
```

#### `modules/ipc/ipcManager.js` - Frontend-Backend Bridge
```javascript
// 🎯 Purpose: Organized IPC handler management and frontend communication
// ✏️ Edit when: Adding new frontend-backend communications, data channels
// 🔧 Contains: IPC handler organization, channel management, data validation

class IPCManager {
    setupHandlers() {
        this.setupDatabaseHandlers();
        this.setupSerialHandlers();
        this.setupCustomHandlers(); // Add your custom handlers
    }
    
    setupCustomHandlers() {
        // Add new IPC handlers
        ipcMain.handle('custom-operation', async (event, data) => {
            // Your custom backend operation
            return { success: true, result: processedData };
        });
    }
    
    // Add handler categories
    setupFileHandlers() { /* file operations */ }
    setupSystemHandlers() { /* system operations */ }
}
```

### 🏗️ **Core Framework Libraries (`lib/`)**

#### `lib/db/mysqlDB.js` - MySQL Powerhouse
```javascript
// 🎯 Purpose: MySQL database operations with advanced Query Builder
// ✏️ Edit when: Adding custom query methods, modifying encryption, adding validations
// 🔧 Contains: Connection management, Query Builder class, encryption utilities

// Key sections to modify:
class QueryBuilder {
    // Add custom query methods here
    whereTemperature(min, max) { /* custom filtering */ }
    withSensorData() { /* join sensor tables */ }
}

class Database {
    encrypt(text) { /* modify encryption logic */ }
    validate(data, rules) { /* add validation rules */ }
}
```

#### `lib/db/firebaseDB.js` - Firebase Magic
```javascript  
// 🎯 Purpose: Firebase Realtime Database with MySQL-compatible Query Builder
// ✏️ Edit when: Adding Firebase-specific optimizations, custom query methods
// 🔧 Contains: Firebase connection, Query Builder for NoSQL, data transformation

// Key sections to modify:
class FirebaseQueryBuilder {
    // Add Firebase-specific query methods
    _applyClientFilters(data) { /* custom filtering logic */ }
    whereFirebaseSpecific(field, value) { /* Firebase optimizations */ }
}
```

#### `lib/com/serialCommunicator.js` - Hardware Whisperer
```javascript
// 🎯 Purpose: Smart serial device communication with auto-reconnection
// ✏️ Edit when: Supporting new device types, changing data parsing, adding protocols
// 🔧 Contains: Port management, data parsing, reconnection logic

// Key sections to modify:
_handleData(rawString) {
    // Add new data format parsing
    switch (this.config.dataType) {
        case 'your-custom-format':
            // Your parsing logic here
    }
}

_autoDetectAndConnect() {
    // Add new device detection patterns
    const potentialPorts = ports.filter(p => {
        // Add your device identifiers
    });
}
```

#### `lib/com/webSocketHandler.js` - Real-time Maestro
```javascript
// 🎯 Purpose: WebSocket server for real-time data broadcasting  
// ✏️ Edit when: Adding authentication methods, custom message types, client management
// 🔧 Contains: Client management, message routing, authentication

// Key sections to modify:
_handleClientMessage(ws, clientData, rawData) {
    switch (message.type) {
        case 'your-custom-type':
            this._handleYourCustomType(ws, clientData, message);
            break;
    }
}

_validateSensorData(data) {
    // Add custom validation logic
}
```

### 🎮 **Controllers (`controller/app/`)**

#### `authController.js` - Security Guardian
```javascript
// 🎯 Purpose: User authentication, JWT tokens, security middleware
// ✏️ Edit when: Adding new auth methods, changing token policies, adding user roles
// 🔧 Contains: Login/register logic, JWT generation, middleware

// Key sections to modify:
const authController = {
    login: async (req, res) => {
        // Add custom login logic
        // Add multi-factor authentication
        // Add OAuth integration
    },
    
    register: async (req, res) => {
        // Add custom registration validation
        // Add email verification
        // Add user role assignment
    }
};
```

#### `databaseController.js` - Data Operations Center
```javascript
// 🎯 Purpose: Generic database operations exposed to REST API
// ✏️ Edit when: Adding data validation, custom endpoints, data transformations
// 🔧 Contains: CRUD operations, data validation, error handling

// Key sections to modify:
const dbController = {
    insertSensorData: async (req, res) => {
        // Add custom data validation
        // Add data transformation
        // Add business logic
    }
};
```

#### `mauiController.js` - Mobile Integration Hub
```javascript
// 🎯 Purpose: Handle requests from MAUI/mobile applications
// ✏️ Edit when: Adding mobile-specific endpoints, data formatting for mobile
// 🔧 Contains: Mobile-optimized responses, data formatting

// Key sections to modify:
const mauiController = {
    genericDataHandler: async (req, res) => {
        // Add mobile-specific data processing
        // Add response optimization for mobile
    }
};
```

### 🎨 **Frontend (`resource/view/uibaru/`)**

#### `monitor.html` - Dashboard Canvas
```html
<!-- 🎯 Purpose: Main monitoring interface structure -->
<!-- ✏️ Edit when: Adding new UI components, changing layout, adding charts -->
<!-- 🔧 Contains: Dashboard structure, component containers, script includes -->

<!-- Key sections to modify: -->
<div id="sensor-dashboard">
    <!-- Add new dashboard components here -->
</div>

<div id="connection-status">
    <!-- Modify connection indicators -->
</div>
```

#### `script.js` - Frontend Brain
```javascript
// 🎯 Purpose: Frontend logic, real-time updates, user interactions
// ✏️ Edit when: Adding UI interactions, handling new data types, adding charts
// 🔧 Contains: Real-time data handling, UI updates, event listeners

// Key sections to modify:
api.receive('serial-data-received', (data) => {
    // Add custom data visualization
    // Add real-time chart updates
    // Add data filtering/processing
});

function updateDashboard(data) {
    // Add new dashboard update logic
    // Add data validation
    // Add user notifications
}
```

#### `style.css` - Visual Magic
```css
/* 🎯 Purpose: Dashboard styling and responsive design */
/* ✏️ Edit when: Changing visual design, adding new components, improving UX */
/* 🔧 Contains: Dashboard styling, animations, responsive layouts */

/* Key sections to modify: */
.sensor-card {
    /* Modify sensor display cards */
}

.connection-indicator {
    /* Modify connection status styling */
}

@media (max-width: 768px) {
    /* Add mobile responsive design */
}
```

### ⚙️ **Configuration Files**

#### `.env` - Your Secret Vault
```env
# 🎯 Purpose: Environment-specific configuration and secrets
# ✏️ Edit when: Changing database connections, API keys, feature toggles
# 🔧 Contains: Database configs, API keys, feature flags

# Key sections to modify:
USE_FIREBASE=false              # Toggle database type
MYSQL_HOST=localhost            # Change database connection
SERIAL_PORT=COM3               # Configure serial port
WS_PORT=8080                   # Change WebSocket port
DB_ENCRYPTION_KEY=YourKey      # Update encryption key
```

#### `firebaseConfig.js` - Firebase Defaults
```javascript
// 🎯 Purpose: Default Firebase configuration values
// ✏️ Edit when: Setting up Firebase project, changing default values
// 🔧 Contains: Firebase project configuration

module.exports = {
    apiKey: "your-default-api-key",
    authDomain: "your-project.firebaseapp.com",
    // Add your Firebase project details
};
```

## 🎯 **Common Editing Scenarios with Modular Approach**

### 🔌 **Adding a New Serial Device Type**
1. **Edit `modules/serial/serialManager.js`**: Add device-specific configuration and handlers
2. **Edit `lib/com/serialCommunicator.js`**: Add device detection in `_autoDetectAndConnect()`
3. **Edit `.env`**: Add device-specific configuration options
4. **Edit `resource/view/uibaru/script.js`**: Add frontend handling for new device data

### 📊 **Adding a New Dashboard Widget**
1. **Edit `resource/view/uibaru/monitor.html`**: Add widget HTML structure
2. **Edit `resource/view/uibaru/style.css`**: Add widget styling
3. **Edit `resource/view/uibaru/script.js`**: Add widget update logic
4. **Edit `modules/ipc/ipcManager.js`**: Add IPC handler if backend data needed

### 🗄️ **Adding a New Database Table/Operations**
1. **Edit `lib/db/mysqlDB.js` or `lib/db/firebaseDB.js`**: Add custom query methods
2. **Edit `controller/app/databaseController.js`**: Add REST endpoints
3. **Edit `modules/api/apiServer.js`**: Add new routes
4. **Edit `modules/ipc/ipcManager.js`**: Add IPC handlers
5. **Edit `preload.js`**: Expose new methods to frontend

### 🔐 **Modifying Authentication**
1. **Edit `controller/app/authController.js`**: Modify login/register logic
2. **Edit `modules/api/apiServer.js`**: Update API authentication middleware
3. **Edit `lib/com/webSocketHandler.js`**: Update WebSocket authentication
4. **Edit `.env`**: Add new auth configuration options

### 🌐 **Adding New WebSocket Message Types**
1. **Edit `lib/com/webSocketHandler.js`**: Add message type handler
2. **Edit `resource/view/uibaru/script.js`**: Add frontend message listener
3. **Edit `preload.js`**: Add receive channel if needed

### 🧩 **Creating a New Custom Module**
1. **Create `modules/yourmodule/yourManager.js`**: Implement your module class
2. **Edit `main.js`**: Add module to application initialization
3. **Add module-specific configuration** to `.env`
4. **Connect to other modules** as needed through the main application class

## 💡 **Benefits of the New Modular Structure**

### 🎯 **Better Organization**
- **Cleaner main.js**: From 300+ lines to ~60 lines of orchestration code
- **Focused modules**: Each module handles one specific responsibility
- **Easier navigation**: Find exactly what you need without hunting through large files

### 🔧 **Enhanced Maintainability**
- **Isolated changes**: Modify database logic without touching serial communication
- **Independent testing**: Test each module in isolation
- **Clearer dependencies**: See exactly what each module needs

### 🚀 **Improved Performance**
- **Same runtime performance**: No additional overhead compared to monolithic structure
- **Better memory management**: Modules can be garbage collected independently
- **Faster development**: Smaller files load and process faster in IDEs

### 📈 **Scalability Ready**
- **Easy module addition**: Add new functionality without touching existing code
- **Pluggable architecture**: Swap implementations easily (e.g., different databases)
- **Team development**: Multiple developers can work on different modules simultaneously

This modular approach gives you complete control over every aspect of your monitoring system while maintaining the same powerful functionality you had before - just organized in a way that scales with your project's growth!

## 🎯 Quick Start - Get Running in Minutes!

### 1. **Clone & Install**
```bash
git clone <your-repo>
cd flow-meter-monitoring
npm install
```

### 2. **Choose Your Database Adventure**
```bash
# Want the reliability of MySQL?
npm run switch-db mysql

# Prefer the simplicity of Firebase?
npm run switch-db firebase
```

### 3. **Configure Your Environment**
Copy `.env.example` to `.env` and unleash the power:

```env
# 🎛️ The Master Switch - Choose Your Database Destiny
USE_FIREBASE=false

# 🔧 MySQL Configuration (When you need that SQL power)
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=your_database

# 🔥 Firebase Configuration (When you want Google's magic)
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
# ... more Firebase goodness

# 🌐 WebSocket Magic (Real-time data streaming)
WS_PORT=8080
WS_AUTH_ENABLED=false

# 🔌 Serial Communication (Talk to your hardware)
SERIAL_PORT=COM3          # Windows
# SERIAL_PORT=/dev/ttyUSB0  # Linux
SERIAL_BAUDRATE=9600
```

### 4. **Launch Your Monitoring Empire**
```bash
npm start
```

## 🎮 Features That'll Make You Smile

### 🗄️ **Database Layer - The Foundation of Dreams**

**Dual Database Support** - Because choice is beautiful:

```javascript
// Same code, different databases! 
const users = await db.table('users')
    .where('status', 'active')
    .where('last_login', '>', '2024-01-01')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();

// Works with both MySQL AND Firebase! 🎉
```

**Query Builder That Speaks Your Language:**
```javascript
// Simple and intuitive
const activeUsers = await db.table('users')
    .where({ status: 'active', role: 'admin' })
    .whereIn('department', ['IT', 'Engineering'])
    .whereBetween('salary', 50000, 100000)
    .orderByDesc('last_login')
    .get();

// Complex joins? No problem!
const userData = await db.table('users')
    .leftJoin('profiles', 'users.id', 'profiles.user_id')
    .select(['users.name', 'profiles.avatar'])
    .where('users.active', true)
    .get();
```

### 🔌 **Serial Communication - Your Hardware Whisperer**

**Smart Auto-Detection:**
- 🔍 Automatically finds Arduino/ESP32 devices
- 🔄 Self-healing connections that bounce back from failures
- 🎯 Dynamic port switching when better connections are found
- 📡 Real-time status updates to your interface

```javascript
// Your serial communicator is like a reliable friend
const serialComm = new SerialCommunicator({
    baudRate: 9600,
    autoReconnect: true,
    dataType: 'json-object',  // or 'csv', 'json-array', 'raw'
    dbTableName: 'sensor_readings'
}, db, mainWindow);

// It handles everything for you!
await serialComm.connect(); // Finds and connects automatically
```

**Data Handling Made Simple:**
```javascript
// Supports multiple data types
// JSON Object: {"temperature": 25.5, "humidity": 60}
// JSON Array: [25.5, 60, 1023]
// CSV: "25.5,60,1023"
// Raw: "TEMP:25.5,HUM:60"
```

### 🌐 **WebSocket Server - Real-time Magic**

**Broadcasting That Just Works:**
```javascript
const wsHandler = new WebSocketHandler({
    port: 8080,
    enableAuthentication: false,
    maxConnections: 50
}, db, mainWindow);

// Broadcast to all connected clients
wsHandler.broadcastToAll({
    type: 'sensor_update',
    data: { temperature: 25.5, timestamp: new Date() }
});
```

**Client Management:**
- 🔐 Optional authentication with auto-generated tokens
- 💓 Heartbeat monitoring to detect dead connections
- 📊 Real-time client statistics and monitoring
- 🚦 Connection limiting and overflow protection

### 🚀 **REST API - External Integration Ready**

```javascript
// Clean, simple API endpoints
app.post('/api/sensor-data', async (req, res) => {
    const result = await db.table('sensors')
        .insert(req.body);
    res.json({ success: true, id: result.insertId });
});

// Built-in authentication
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
```

### 🛡️ **Security - Your Data's Bodyguard**

**Encryption That Actually Works:**
```javascript
// Automatic field encryption
const sensitiveData = {
    username: 'john_doe',
    email: 'john@example.com',    // Will be encrypted
    password: 'secret123',        // Will be encrypted
    public_info: 'not sensitive'  // Stays plain
};

await db.table('users').insert(sensitiveData);
// Email and password are automatically encrypted!
```

## 🎛️ **Configuration - Tailor It to Your Needs**

### Database Switching Made Effortless
```bash
# Switch to MySQL
npm run switch-db mysql

# Switch to Firebase  
npm run switch-db firebase

# Check current database
npm run check-db
```

### Environment Variables - Your Control Panel
```env
# 🎯 Core Settings
USE_FIREBASE=false                    # The big switch
API_PORT=3001                        # Your API lives here

# 🔌 Serial Communication
SERIAL_PORT=null                     # Auto-detect magic
SERIAL_BAUDRATE=9600                 # Standard baud rate
SERIAL_DATA_TYPES=json-object        # How your device talks
SERIAL_DB_TABLE_NAME=sensors         # Where data lands

# 🌐 WebSocket Configuration
WS_PORT=8080                         # Real-time data port
WS_AUTH_ENABLED=false               # Keep it simple
WS_MAX_CONNECTIONS=10               # Control the crowd
WS_HEARTBEAT_INTERVAL=30000         # Keep connections alive

# 🔐 Security
DB_ENCRYPTION_KEY=YourSecretKey     # Lock it down
```

## 🎨 **Frontend Integration - Seamless Connection**

Your frontend gets superpowers through the preload bridge:

```javascript
// In your renderer process
const api = window.api;

// Database operations
const sensors = await api.getDataByFilters('sensors', 
    { active: true }, 
    { orderBy: 'timestamp DESC', limit: 100 }
);

// Serial communication
const status = await api.getSerialStatus();
await api.forceReconnect();
await api.sendData('RESET_SENSORS');

// Real-time data listening
api.receive('serial-data-received', (data) => {
    console.log('New sensor data:', data);
    updateDashboard(data);
});

api.receive('database-insert-success', (result) => {
    console.log('Data saved:', result);
    showNotification('Data saved successfully!');
});
```

## 🏁 **Real-World Example - Putting It All Together**

Let's build a temperature monitoring system:

```javascript
// 1. Setup your serial communicator for temperature sensors
const tempSensor = new SerialCommunicator({
    baudRate: 9600,
    dataType: 'json-object',
    dbTableName: 'temperature_readings',
    requiredFields: ['temperature', 'humidity'],
    fieldsToEncrypt: ['location']  // Keep sensor locations private
}, db, mainWindow);

// 2. Start your WebSocket server for real-time updates
const wsServer = new WebSocketHandler({
    port: 8080,
    enableAuthentication: true,
    dbTableName: 'temperature_readings'
}, db, mainWindow);

// 3. Connect everything
await tempSensor.connect();        // Auto-finds your Arduino
await wsServer.start();           // Starts real-time server

// 4. Your Arduino sends: {"temperature": 25.5, "humidity": 60, "location": "Lab1"}
// Framework automatically:
// - Receives and validates the data
// - Encrypts the location field  
// - Saves to your chosen database
// - Broadcasts to all WebSocket clients
// - Updates your Electron interface
```

## 🔧 **Advanced Features - For the Power Users**

### Custom Query Builder Extensions
```javascript
// Add your own query methods
QueryBuilder.prototype.whereTemperature = function(min, max) {
    return this.whereBetween('temperature', min, max);
};

// Use your custom methods
const hotReadings = await db.table('sensors')
    .whereTemperature(30, 50)
    .whereNotNull('humidity')
    .get();
```

### Serial Communication Events
```javascript
serialComm.on('data', (data) => {
    console.log('Raw data received:', data);
});

serialComm.on('connection-lost', (info) => {
    console.log('Connection lost, attempting reconnection...');
    showAlert('Sensor disconnected, reconnecting...');
});

serialComm.on('better-port-detected', (portInfo) => {
    console.log('Found better port:', portInfo.newPort);
    showNotification(`Switching to better connection: ${portInfo.newPort}`);
});
```

## 🐛 **Troubleshooting - We've Got Your Back**

### Common Issues & Solutions

**Serial Port Not Found?**
```bash
# Windows: Check Device Manager
# Linux: List available ports
ls /dev/tty*

# Enable dynamic port switching
SERIAL_ENABLE_DYNAMIC_SWITCHING=true
```

**Database Connection Issues?**
```javascript
// Check your connection
const status = await db.raw('SELECT 1 as test');
console.log('Database OK:', status);

// Switch databases easily
npm run switch-db firebase  # Try Firebase instead
```

**WebSocket Not Connecting?**
```javascript
// Check server status
const wsStatus = wsHandler.getStatus();
console.log('WebSocket Server:', wsStatus);

// Verify port availability
netstat -an | grep :8080
```

## 🎯 **Best Practices - Do It Right**

### 1. **Error Handling Like a Pro**
```javascript
try {
    const result = await db.table('sensors')
        .where('active', true)
        .get();
} catch (error) {
    console.error('Database error:', error.message);
    // Always handle your errors gracefully
    showUserFriendlyMessage('Unable to load sensor data');
}
```

### 2. **Security First**
```javascript
// Always validate incoming data
const validateSensorData = (data) => {
    const required = ['temperature', 'timestamp'];
    return required.every(field => data[field] !== undefined);
};

// Encrypt sensitive fields
const sensitiveSensors = ['location', 'device_id', 'user_id'];
```

### 3. **Performance Optimization**
```javascript
// Use indexes for frequently queried fields
// Limit data retrieval for real-time updates
const recentData = await db.table('sensors')
    .where('timestamp', '>', lastUpdate)
    .limit(100)
    .get();
```

## 🚀 **Deployment - Take It Live**

### Development Mode
```bash
npm run dev          # Hot reloading for development
```

### Production Build
```bash
npm run build        # Optimized production build
npm run start:prod   # Run in production mode
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001 8080
CMD ["npm", "start"]
```

## 📌 TODO / Future Improvements
- [ ] Making Compact Frontend Component
- [ ] Frontend With WebSocket Support
- [ ] Asset for Front End Monitoring
- [ ] Revising Auth for better and compact use
- [ ] Module hot-reloading for development
- [ ] Module dependency injection system
- [ ] Module configuration validation

## 🤝 **Contributing - Join the Journey**

We love contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features  
- 📖 Documentation improvements
- 🧪 Testing enhancements
- 🧩 New modules

Check out our [Contributing Guide](CONTRIBUTING.md) to get started!

## 📄 **License**

This project isn't being Licensed and still be use as open source project, but be sure to tag the user account of any pulling or developing this code

---

## 💡 **Ready to Build Something Amazing?**

This framework isn't just code - it's your foundation for creating monitoring systems that actually work in the real world. Whether you're monitoring industrial equipment, environmental sensors, or IoT devices, we've built the tools you need to succeed.

**Start your monitoring adventure today!**

```bash
git clone <your-repo>
cd flow-meter-monitoring
npm install
npm start
```

### 🌟 **Star us on GitHub if this framework helps you build something awesome!**

---

*Built with ❤️ for developers who believe monitoring should be powerful, flexible, and actually enjoyable to work with.*
=======
# HERE GOES NOTHING
>>>>>>> bc72d0564ea1c331bd71e3879209c3c029c9b080
