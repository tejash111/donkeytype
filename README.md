# DonkeyType - Multiplayer Typing Game

A real-time multiplayer typing game built with Next.js and Socket.IO.

##  Features

- **Solo Mode**: Practice typing alone with timer and stats
- **Multiplayer Mode**: Race against friends in real-time
- Real-time WPM and accuracy tracking
- Live player progress visualization
- Custom room system for private matches
- Responsive design with Tailwind CSS

##  Project Structure

```
donkeytype/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   │   ├── solo/      # Solo mode
│   │   │   └── multiplayer/ # Multiplayer mode
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Socket.IO)
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # Helper functions
│   └── package.json
│
└── server/          # Socket.IO server (backend)
    ├── server.js    # Socket.IO server implementation
    └── package.json
```

##  Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tejash111/donkeytype.git
cd donkeytype
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

##  Running the Application

You need to run both the server and client simultaneously.

### Option 1: Manual Start (Recommended)

**Terminal 1 - Start Socket.IO Server:**
```bash
cd server
npm run dev
```
✅ Server runs on `http://localhost:4000`

**Terminal 2 - Start Next.js Client:**
```bash
cd client
npm run dev
```
✅ Client runs on `http://localhost:3000`

### Option 2: Production Mode

**Server:**
```bash
cd server
node server.js
```

**Client:**
```bash
cd client
npm run build
npm start
```

##  How to Play

### Solo Mode
1. Navigate to `http://localhost:3000/solo`
2. Start typing when ready
3. Race against the timer
4. View your WPM and accuracy

### Multiplayer Mode
1. Navigate to `http://localhost:3000/multiplayer`
2. Enter your username
3. Create or join a room with a Room ID
4. Wait for other players (open in multiple tabs/browsers)
5. Click "Start Game"
6. Type the words - see live progress of all players!
7. Check the leaderboard when finished

## Tech Stack

### Frontend (client/)
- **Next.js 15** - React framework
- **React 19** - UI library
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Faker.js** - Random word generation

### Backend (server/)
- **Node.js** - Runtime environment
- **Express** - Web server
- **Socket.IO** - WebSocket implementation

##  Socket.IO Events

### Client → Server
- `join-room` - Join a multiplayer room
- `start-game` - Start the typing game
- `update-progress` - Update player's progress
- `leave-room` - Leave the current room

### Server → Client
- `room-state` - Current room state
- `player-joined` - New player joined
- `player-left` - Player disconnected
- `game-started` - Game begins
- `progress-update` - Player progress changed
- `game-finished` - All players finished

##  Configuration

### Server Port
Change in `server/server.js`:
```javascript
const PORT = 4000; // Change this
```

### Socket.IO URL
Change in `client/src/contexts/SocketContext.js`:
```javascript
const socketInstance = io('http://localhost:4000', { // Change URL
  transports: ['websocket'],
});
```

##  Troubleshooting

### "Cannot connect to server"
- Make sure the Socket.IO server is running on port 4000
- Check if another application is using port 4000
- Verify the URL in SocketContext.js matches your server

### "Module not found" errors
- Run `npm install` in both `client/` and `server/` directories
- Delete `node_modules` and reinstall if issues persist

### Port already in use
- Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

##  Development

### Adding new features
1. Frontend changes go in `client/src/`
2. Backend/Socket.IO logic goes in `server/server.js`
3. Shared types/interfaces can be documented in comments

### Code structure
- Components: `client/src/components/`
- Pages: `client/src/app/*/page.js`
- Hooks: `client/src/hooks/`
- Utils: `client/src/services/`

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

##  License

This project is open source and available under the MIT License.

##  Author

**Tejash**
- GitHub: [@tejash111](https://github.com/tejash111)

##  Show your support

Give a ⭐️ if you like this project!
