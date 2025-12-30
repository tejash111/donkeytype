# DonkeyType - Multiplayer Typing Game

A real-time multiplayer typing game built with Next.js and Socket.IO.

## Features

- **Solo Mode**: Practice typing alone with timer and stats
- **Multiplayer Mode**: Race against friends in real-time
- Real-time WPM and accuracy tracking
- Live player progress visualization
- Custom room system for private matches
- Responsive design with Tailwind CSS

## Project Structure

```
donkeytype/
├── client/                    # Next.js frontend application
│   ├── public/               # Static assets
│   │   └── logo.png         # App logo
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── (solo)/      # Solo mode (root route)
│   │   │   │   └── page.js  # Solo typing game
│   │   │   ├── multiplayer/ # Multiplayer mode
│   │   │   │   └── page.js  # Multiplayer typing game
│   │   │   ├── chart/       # Stats visualization
│   │   │   │   └── page.js  # Chart display page
│   │   │   ├── globals.css  # Global styles
│   │   │   ├── layout.js    # Root layout
│   │   │   ├── page.js      # Home page wrapper
│   │   │   └── providers.js # App providers
│   │   ├── components/
│   │   │   ├── chart.jsx    # Chart component
│   │   │   ├── navbar.js    # Navigation bar
│   │   │   ├── multi/       # Multiplayer components
│   │   │   │   ├── Chat.js
│   │   │   │   ├── GameSettings.js
│   │   │   │   ├── PlayerCard.js
│   │   │   │   ├── ResultSummary.js
│   │   │   │   └── TypingArea.js
│   │   │   ├── solo/        # Solo mode components
│   │   │   │   ├── InputBar.js
│   │   │   │   ├── restartButton.js
│   │   │   │   ├── result.js
│   │   │   │   └── typing.js
│   │   │   └── ui/          # UI components (shadcn/ui)
│   │   │       ├── card.jsx
│   │   │       ├── chart.jsx
│   │   │       ├── resizable-navbar.jsx
│   │   │       └── select.jsx
│   │   ├── contexts/
│   │   │   └── SocketContext.js  # Socket.IO context provider
│   │   ├── hooks/
│   │   │   ├── countdownTimer.js # Timer hook
│   │   │   └── usetyping.js      # Typing logic hook
│   │   ├── lib/
│   │   │   └── utils.js          # Utility functions
│   │   └── services/
│   │       └── helper.js         # WPM/accuracy calculations
│   ├── .env.local          # Environment variables (Socket URL)
│   ├── .env.example        # Environment variables template
│   ├── components.json     # shadcn/ui config
│   ├── eslint.config.mjs   # ESLint configuration
│   ├── next.config.mjs     # Next.js configuration
│   ├── postcss.config.mjs  # PostCSS configuration
│   ├── tailwind.config.mjs # Tailwind CSS configuration
│   └── package.json        # Frontend dependencies
│
├── server/                 # Socket.IO backend server
│   ├── server.js          # Socket.IO server implementation
│   │                      # - Room management
│   │                      # - Real-time game state sync
│   │                      # - Player progress tracking
│   │                      # - Chat functionality
│   ├── .env               # Server environment variables
│   ├── .env.example       # Environment variables template
│   ├── .gitignore         # Git ignore rules
│   └── package.json       # Backend dependencies
│
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## Technology Stack

### Frontend

- **Next.js 15.1.6** - React framework with App Router
- **React 19** - UI library
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Motion** - Animations
- **Recharts** - Data visualization
- **shadcn/ui** - UI components
- **Faker.js** - Random word generation

### Backend

- **Node.js** - Runtime environment
- **Express** - Web server
- **Socket.IO** - Real-time bidirectional communication
- **dotenv** - Environment variable management

## Getting Started

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

## Running the Application

You need to run both the server and client simultaneously.

### Environment Setup

**Client (.env.local):**

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

**Server (.env):**

```bash
PORT=4000
CORS_ORIGIN=*
NODE_ENV=development
```

### Development Mode

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

### Production Mode

**Server:**

```bash
cd server
npm install
node server.js
```

**Client:**

```bash
cd client
npm install
npm run build
npm start
```

## How to Play

### Solo Mode

1. Navigate to `http://localhost:3000/` (root page)
2. Choose between **time** or **words** mode
3. Select duration (15s, 30s, 1m, 2m) or word count (10, 25, 50, 100)
4. Start typing when ready
5. View your WPM, accuracy, and detailed stats after completion

### Multiplayer Mode

1. Navigate to `http://localhost:3000/multiplayer`
2. Enter your username
3. **Create Room**: Click "create room" to generate a 6-character room code
4. **Join Room**: Enter the room code shared by a friend
5. Wait for other players (only room creator can start)
6. Room creator can adjust settings (time limit, word count, game mode)
7. Click "Start" to begin the race
8. Type the words - see live progress of all players!
9. Check the leaderboard and WPM charts when finished

## Socket.IO Events

### Client → Server

- `join-room` - Join/create a multiplayer room
- `start-game` - Start the typing game (creator only)
- `update-progress` - Update player's WPM, accuracy, progress
- `update-settings` - Change game settings (creator only)
- `player-ready` - Mark player as ready
- `chat-message` - Send chat message
- `time-up` - Notify when time expires
- `leave-room` - Leave the current room

### Server → Client

- `room-state` - Initial room state with players and settings
- `player-joined` - New player joined with updated player list
- `player-left` - Player disconnected
- `game-started` - Game begins with words and start time
- `progress-update` - Real-time player progress updates
- `game-finished` - Game ended with final results
- `settings-updated` - Game settings changed by creator
- `player-ready-update` - Player ready status changed
- `new-chat-message` - New chat message received
- `error` - Error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Configuration

### Server Port

Change in `server/server.js`:

```javascript
const PORT = 4000; // Change this
```

### Socket.IO URL

Change in `client/src/contexts/SocketContext.js`:

```javascript
const socketInstance = io("http://localhost:4000", {
  // Change URL
  transports: ["websocket"],
});
```

## Troubleshooting

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

## Development

### Adding new features

1. Frontend changes go in `client/src/`
2. Backend/Socket.IO logic goes in `server/server.js`
3. Shared types/interfaces can be documented in comments

### Code structure

- Components: `client/src/components/`
- Pages: `client/src/app/*/page.js`
- Hooks: `client/src/hooks/`
- Utils: `client/src/services/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

**Tejash**

- GitHub: [@tejash111](https://github.com/tejash111)

## Show your support

Give a ⭐️ if you like this project!
