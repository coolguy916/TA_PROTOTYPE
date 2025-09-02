# Monitor Framework 2.0 - Modular Real-time Monitoring System

**A production-ready modular monitoring and control framework** that supports both web and desktop deployment. Built with React frontend and Node.js backend, featuring WebSocket real-time communication, flexible database support (MySQL/Firebase), and a clean modular architecture for easy maintenance and scaling.

> **Transform your monitoring requirements into a robust solution!** A clean, modular framework designed for real-world applications with industrial-grade reliability and developer-friendly architecture.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)]()
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)]()
[![React](https://img.shields.io/badge/React-Universal-61dafb.svg)]()
[![WebSocket](https://img.shields.io/badge/WebSocket-Enhanced-purple.svg)]()
[![Electron](https://img.shields.io/badge/Electron-Desktop-lightblue.svg)]()
[![Database](https://img.shields.io/badge/Database-Hybrid%20Sync-red.svg)]()

## 🚀 Key Features

A modular monitoring system built for reliability and maintainability:

- **🏗️ Modular Architecture**: Clean separation of concerns with dedicated modules for each functionality
- **🔄 Flexible Database Support**: MySQL and Firebase support with easy switching
- **⚡ Real-time Communication**: WebSocket server for live data streaming
- **🔗 Serial Communication**: Auto-detecting device communication with reconnection logic
- **🌐 Dual Frontend Support**: React web app and Electron desktop application
- **🛡️ Built-in Security**: Authentication system with JWT tokens and data encryption
- **📡 Cross-platform Compatibility**: Works on Windows, macOS, and Linux
- **🔧 Developer Friendly**: Hot reloading, linting, and comprehensive error handling

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 🖥️  Electron Desktop & React Web App           │
├─────────────┬─────────────────┬─────────────────┬───────────────┤
│ 💾 Database │ 🌐 WebSocket    │ 🔌 Serial Comm │ 🚀 REST API   │
│   Module    │    Module       │    Module       │    Module     │
├─────────────┼─────────────────┼─────────────────┼───────────────┤
│ MySQL       │ Real-time Data  │ Arduino/ESP32   │ Express.js    │
│ Firebase    │ Broadcasting    │ Auto-detection  │ Auth & CORS   │
│ Switch-able │ Client Mgmt     │ Smart Reconnect │ Rate Limiting │
└─────────────┴─────────────────┴─────────────────┴───────────────┘
```

## 📁 **Current Project Structure**

Here's the actual project structure based on the current codebase:

```
monitor-framework/
├── 📋 main.js                          # 🚀 Application entry point - Orchestrates all modules
├── 🔗 preload.js                       # 🌉 Bridge between frontend and backend
├── 🗄️ server.js                        # 💻 Standalone web server for development
├── 📦 package.json                     # 📋 Dependencies and scripts
├── 🔐 .env                            # ⚙️ Configuration secrets (create from .env.example)
├── 🔐 .env.example                    # 📝 Template for environment variables
├── 🔧 firebaseConfig.js               # 🔥 Firebase configuration defaults
├── 📚 README.md                       # 📖 You are here!
│
├── 📂 modules/                        # 🧩 Modular Framework Components
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
│   ├── 📂 websocket/                  # 🌐 WebSocket Module
│   │   └── 💬 websocketManager.js    # 🔄 Real-time communication handler
│   │
│   └── 📂 ipc/                        # 🌉 IPC Communication Module
│       └── 💬 ipcManager.js          # 🔄 Frontend-backend bridge handlers
│
├── 📂 lib/                            # 🏗️ Core Framework Libraries
│   ├── 📂 db/                         # 💾 Database Abstraction Layer
│   │   ├── 🗄️ mysqlDB.js             # 🐬 MySQL database handler
│   │   ├── 🔥 firebaseDB.js          # 🔥 Firebase handler
│   │   └── 🔧 databaseAdapter.js      # ✨ Universal database adapter
│   │
│   ├── 📂 com/                        # 🌐 Communication Modules  
│   │   ├── 🔌 serialCommunicator.js   # 📡 Arduino/ESP32/Device communication
│   │   └── 🌐 webSocketCommunicator.js # 💬 WebSocket server implementation
│   │
│   └── 📂 alert/                      # 🚨 Alert Management
│       ├── 📢 alertManager.js         # 🔔 Alert system management
│       └── 📋 index.js               # 📤 Alert module exports
│
├── 📂 App/Http/Controllers/           # 🎮 HTTP Controllers
│   ├── 🔐 authController.js          # 👤 User authentication & JWT handling
│   ├── 🗄️ databaseController.js      # 💾 Generic database operations
│   └── 📱 mauiController.js          # 📲 MAUI/Mobile app integration
│
├── 📂 resource/                       # 🎨 Legacy Frontend Resources
│   └── 📂 view/                       # 👁️ HTML/CSS/JS Files
│
├── 📂 scripts/                        # 🔧 Utility Scripts
│   └── 🔄 switch-db.js               # 🎛️ Database switching utility
│
├── 📂 frontend/                       # ⚛️ React Frontend Application
│   ├── 📂 src/                        # ⚛️ React source files
│   │   ├── 📄 App.js                  # 🏠 Main React application component
│   │   └── 📄 index.js               # ⚛️ React app entry point
│   ├── 📂 public/                     # 🌍 Public web assets
│   └── 📂 build/                      # 📦 Production build output
│
└── 📂 node_modules/                   # 📦 Dependencies (auto-generated)
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- MySQL 8.0+ (optional - for database operations)
- Firebase project (optional - alternative to MySQL)

### **Quick Setup**

1. **Clone and Install**
```bash
git clone <your-repo>
cd monitor-framework
npm install
```

2. **Configure Environment**
Copy `.env.example` to `.env` and configure:
```env
# Database Configuration
USE_FIREBASE=false
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Application Ports
API_PORT=3001
WS_PORT=8080

# Serial Communication (optional)
SERIAL_PORT=COM3  # or /dev/ttyUSB0 for Linux
SERIAL_BAUDRATE=9600
```

3. **Choose Your Database**
```bash
# For MySQL
npm run switch-db mysql

# For Firebase
npm run switch-db firebase
```

4. **Start the Application**

**For Development (with hot reloading):**
```bash
# Runs both backend and React frontend
npm run dev
```

**For Electron Desktop App:**
```bash
# Start as desktop application
npm run start:electron
```

**For Web Server Only:**
```bash
# Start backend server only
npm start
```

## 🏗️ **Modular Architecture**

The framework uses a clean modular structure where each module has a single responsibility:

### **Core Modules**
- **Database Manager**: Handles database initialization and switching between MySQL/Firebase
- **Window Manager**: Manages Electron windows and frontend loading
- **API Server**: Express.js REST API with authentication and rate limiting
- **Serial Manager**: Handles hardware communication with auto-detection
- **WebSocket Manager**: Real-time communication between frontend and backend
- **IPC Manager**: Inter-process communication between Electron main and renderer

### **Available Scripts**
```bash
npm run dev              # Development mode with hot reloading
npm run start:electron   # Start as Electron desktop app
npm run build            # Build for production
npm run lint             # Code linting
npm run test             # Run tests
npm run switch-db <type> # Switch between mysql/firebase
```

## 💾 **Database Support**

The framework supports both MySQL and Firebase with a unified interface:

### **MySQL Setup**
```env
USE_FIREBASE=false
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

### **Firebase Setup**
```env
USE_FIREBASE=true
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### **Switching Databases**
```bash
# Switch to MySQL
npm run switch-db mysql

# Switch to Firebase  
npm run switch-db firebase
```

## 📡 **Communication & Real-time Features**

### **WebSocket Server**
Real-time bidirectional communication between frontend and backend:
- Live data streaming from serial devices
- Real-time database updates
- Client connection management
- Message broadcasting

### **Serial Communication** 
Auto-detecting hardware communication:
- Supports Arduino, ESP32, and other microcontrollers
- Automatic port detection and connection
- Smart reconnection on connection loss
- Configurable baud rates and data formats

### **IPC (Inter-Process Communication)**
Electron main-renderer communication:
- Secure data passing between processes
- Real-time event broadcasting
- Database operation bridging
- Hardware status updates

## 🔧 **Configuration**

### **Environment Variables**
Configure the application behavior through `.env` file:
```env
# Database Configuration
USE_FIREBASE=false
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Firebase Configuration (when USE_FIREBASE=true)
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Application Ports
API_PORT=3001
WS_PORT=8080

# Serial Communication
SERIAL_PORT=COM3                # Windows: COM3, Linux: /dev/ttyUSB0
SERIAL_BAUDRATE=9600
SERIAL_DATA_TYPE=json-object    # json-object, json-array, csv, raw

# Security
JWT_SECRET=your_jwt_secret_key
DB_ENCRYPTION_KEY=your_encryption_key

# Development
NODE_ENV=development
USE_REACT_FRONTEND=true
REACT_DEV_URL=http://localhost:3000
```

### **Module Configuration**
Each module can be configured independently:
- **Database Module**: Switch between MySQL and Firebase
- **Serial Module**: Auto-detection or manual port configuration  
- **WebSocket Module**: Port and authentication settings
- **API Module**: CORS, rate limiting, and middleware configuration

### **Runtime Configuration**
Switch configurations without code changes:
```bash
# Switch database type
npm run switch-db mysql
npm run switch-db firebase

# Environment-specific configs
NODE_ENV=production npm start
NODE_ENV=development npm run dev
```

## 🔐 **Security Features**

### **Authentication System**
- JWT-based authentication with secure token generation
- Password hashing using bcrypt
- Session management and token refresh
- Route protection middleware

### **Data Encryption**
- Configurable field-level encryption for sensitive data
- Secure environment variable management
- HTTPS support for production deployment

### **Access Control**
- Role-based access control (RBAC) ready
- API rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Helmet.js security headers

## 🚀 **Deployment**

### **Development Deployment**
```bash
# Start development server with hot reloading
npm run dev

# Start Electron desktop app in development
npm run dev:electron
```

### **Production Deployment**
```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start

# Build Electron application
npm run build:electron
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001 8080
CMD ["npm", "start"]
```

## 🔧 **Current Status & TODO**

### ✅ **Completed Features**
- [x] Modular architecture with 6 core modules
- [x] Dual database support (MySQL/Firebase)
- [x] React frontend with Material-UI components
- [x] Electron desktop application
- [x] WebSocket real-time communication
- [x] Serial communication with auto-detection
- [x] JWT authentication system
- [x] Development tools (hot reloading, linting)
- [x] Database switching utility
- [x] Alert management system

### 🚧 **In Progress / TODO**
- [ ] Frontend WebSocket integration completion
- [ ] Enhanced monitoring dashboard components
- [ ] Database migration system
- [ ] Comprehensive test coverage
- [ ] Docker deployment configuration
- [ ] Module hot-reloading for development
- [ ] Configuration validation system
- [ ] API documentation generation

## 📊 **Development & Testing**

### **Development Mode**
```bash
# Start with hot reloading
npm run dev

# Development backend only
npm run dev:backend

# Development frontend only  
npm run dev:frontend

# Electron development
npm run dev:electron
```

### **Code Quality**
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run backend tests
npm run test:backend
```

### **Building**
```bash
# Build for production
npm run build

# Build web version only
npm run build:web

# Build Electron app
npm run build:electron
```

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

## 📄 **License**

This project is available as open source. Please credit the original authors when using or modifying this code.

---

## 💡 **Ready to Start?**

This framework provides a solid foundation for building real-time monitoring systems with a clean, modular architecture.

```bash
git clone <your-repo>
cd monitor-framework
npm install
npm run dev
```

---

*A modular monitoring framework built for reliability and developer experience.*
