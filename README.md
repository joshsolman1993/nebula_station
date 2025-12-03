# 🌌 Nebula Station

A modern, browser-based sci-fi themed online strategy game (PBBG - Persistent Browser-Based Game).

## 🚀 Tech Stack

### Frontend
- **React** with **TypeScript** (via Vite)
- **Tailwind CSS v3** with custom DeepSpace theme
- **Context API** for state management
- Modern sci-fi UI with neon aesthetics and glassmorphism

### Backend
- **Node.js** + **Express**
- **MongoDB** with **Mongoose** ORM (✅ Connected)
- **JWT** authentication with bcryptjs
- RESTful API architecture

## 🎮 Features

### ✅ Phase 1: Initialization
- Project setup with monorepo structure
- DeepSpace theme with neon colors
- MongoDB connection

### ✅ Phase 2: Gateway & Soul (COMPLETE!)
- **User Authentication**:
  - Registration with validation
  - Login with JWT tokens
  - Password hashing with bcryptjs
  - Protected routes
- **Landing Page**:
  - Stunning hero section
  - Glassmorphism design
  - Feature cards and stats
- **Dashboard**:
  - Welcome screen
  - Resource display (Metal, Crystal, Energy)
  - Level and XP tracking
  - Premium credits system

## 📁 Project Structure

```
nebula_station/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   └── index.css      # Global styles with Tailwind
│   ├── .env               # Client environment variables
│   ├── tailwind.config.js # Custom DeepSpace theme
│   └── package.json
├── server/                 # Backend Express server
│   ├── server.js          # Main server file
│   ├── .env               # Server environment variables
│   └── package.json
├── package.json           # Root package.json with scripts
└── README.md
```

## 🎨 Design System - DeepSpace Theme

The application features a custom **DeepSpace** color palette:

- **Background**: Deep space blacks and blues (#0a0a12)
- **Accents**: Neon cyan, magenta, and amber
- **Typography**: Orbitron (headings) + Rajdhani (body)
- **Effects**: Glow animations, gradients, and sci-fi elements

## 🛠️ Installation

### Install all dependencies at once:
```bash
npm run install:all
```

### Or install manually:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## 🏃 Running the Application

### Development Mode (Recommended)
Run both client and server concurrently:
```bash
npm run dev
```

### Run Separately

**Client only:**
```bash
npm run client
```
The client will be available at: http://localhost:5173

**Server only:**
```bash
npm run server
```
The server will be available at: http://localhost:5000

## 🔧 Environment Variables

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Nebula Station
VITE_APP_VERSION=0.1.0
```

### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nebula_station
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

## 📡 API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check
- `GET /api/test` - Test client-server communication

## 🗄️ Database Setup

The server is configured to work with MongoDB. To connect:

1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in `server/.env`
3. The server will automatically connect on startup

## 🎯 Next Steps

- [ ] Set up authentication system
- [ ] Create game models (Player, Station, Resources)
- [ ] Build game UI components
- [ ] Implement real-time features (WebSockets)
- [ ] Add game logic and mechanics

## 📝 License

ISC

---

**Version**: 0.1.0  
**Status**: Development Build  
**Last Updated**: December 2025
