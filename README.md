# Superhero TTRPG

A modern, collaborative tabletop RPG campaign manager built with Next.js 16, TypeScript, and real-time WebSocket support. Designed for superhero-themed campaigns with flexible character systems and real-time gameplay collaboration.

## 🚀 Features

- **Campaign Management**: Create and manage multiple superhero campaigns
- **Custom Character System**: Flexible JSON-based character attributes for custom game systems
- **Real-Time Collaboration**: WebSocket-powered live updates during gameplay sessions
- **Modern Tech Stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
- **Type-Safe Database**: SQLite with Drizzle ORM for full TypeScript type safety
- **Dark Mode**: Built-in theme switching with zero-flicker using next-themes
- **Standalone Deployment**: Docker-ready with standalone build for VPS hosting

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type safety throughout
- **Tailwind CSS v4** - Utility-first CSS with custom theme system
- **next-themes** - Zero-flicker theme management
- **Socket.IO Client** - Real-time WebSocket communication
- **Lucide React** - Modern icon system

### Backend
- **SQLite** - Lightweight, file-based database
- **better-sqlite3** - Synchronous SQLite driver
- **Drizzle ORM** - TypeScript ORM with excellent DX
- **Socket.IO** - WebSocket server for real-time features
- **Zod 4** - Runtime type validation
- **nanoid** - Unique ID generation

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd /Users/lnandez/IdeaProjects/superhero-ttrpg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_PATH=./data/superhero-ttrpg.db
   NEXT_PUBLIC_WS_URL=http://localhost:3000
   ```

4. **Generate and push database schema**
   ```bash
   npm run db:migrate
   ```

## 🚀 Development

```bash
# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Management

```bash
# Generate migration files
npm run db:generate

# Push schema changes to database
npm run db:push

# Run both generate and push
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 🏗️ Project Structure

```
superhero-ttrpg/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home page
│   │   ├── providers.tsx        # Client providers wrapper
│   │   ├── api/                 # API routes
│   │   └── campaigns/           # Campaign routes
│   ├── components/              # React components
│   │   ├── ThemeToggle/        # Theme switch component
│   │   └── WebSocketProvider/  # WebSocket context
│   ├── db/                      # Database layer
│   │   ├── schema.ts           # Drizzle schema
│   │   ├── client.ts           # Database client
│   │   └── migrations/         # Migration files
│   ├── services/               # Business logic layer
│   │   ├── campaign-service.ts
│   │   ├── character-service.ts
│   │   └── session-service.ts
│   ├── hooks/                  # Custom React hooks
│   │   └── use-session.ts     # WebSocket session hook
│   └── types/                  # TypeScript type definitions
├── styles/
│   └── input.css              # Tailwind CSS configuration
├── public/                     # Static assets
├── data/                       # SQLite database files
├── package.json
├── tsconfig.json
├── next.config.js
├── drizzle.config.ts
└── Dockerfile
```

## 🗃️ Database Schema

### Campaigns
```typescript
{
  id: string (PK)
  name: string
  description: string?
  createdBy: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Characters
```typescript
{
  id: string (PK)
  campaignId: string (FK)
  name: string
  attributes: JSON {
    stats?: Record<string, number>
    description?: string
    health?: { current: number; max: number }
    abilities?: Array<{...}>
    // Fully customizable
  }
  createdBy: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Sessions
```typescript
{
  id: string (PK)
  campaignId: string (FK)
  startedAt: timestamp
  endedAt: timestamp?
  isActive: boolean
  state: JSON {
    currentTurn?: string
    turnOrder?: string[]
    notes?: string
    // Real-time state
  }
}
```

## 🔌 Real-Time Features

The application uses Socket.IO for real-time collaboration:

### WebSocket Events

**Client → Server:**
- `session:join` - Join a game session
- `session:leave` - Leave a session
- `session:update-state` - Update session state
- `character:update` - Update character in real-time

**Server → Client:**
- `session:state:updated` - Broadcast state changes
- `character:updated` - Broadcast character updates
- `player:joined` - Player joined notification
- `player:left` - Player left notification

### Usage Example

```typescript
import { useSession } from '@/hooks/use-session';

function GameSession({ sessionId }: { sessionId: string }) {
  const { sessionState, players, updateSessionState } = useSession({
    sessionId,
    onStateUpdate: (state) => console.log('State updated:', state),
  });

  return (
    <div>
      <p>Active players: {players.length}</p>
      {/* Your game UI */}
    </div>
  );
}
```

## 🎨 Styling

The project uses Tailwind CSS v4 with a custom theme:

- Semantic color tokens (brand colors, text colors)
- Custom utility classes
- Dark mode support with `dark:` variant
- Responsive breakpoints: sm (640px), md (780px), lg (1150px)

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t superhero-ttrpg .

# Run the container
docker run -d \
  --name superhero-ttrpg \
  -p 3000:3000 \
  -v /var/lib/ttrpg-data:/app/data \
  --restart unless-stopped \
  superhero-ttrpg
```

The SQLite database will persist in the mounted volume `/var/lib/ttrpg-data`.

## 🔧 Configuration

### Environment Variables

- `DATABASE_PATH` - Path to SQLite database file (default: `./data/superhero-ttrpg.db`)
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL for client connections
- `PORT` - Server port (default: 3000)

### Next.js Config

The `next.config.js` includes:
- Standalone output mode for Docker deployment
- `better-sqlite3` as external package for Server Components

## 🧪 Development Notes

### Adding New Features

1. **Database Changes**: Update `src/db/schema.ts` and run `npm run db:migrate`
2. **New Routes**: Add in `src/app/` following App Router conventions
3. **Services**: Add business logic in `src/services/`
4. **Components**: Create in `src/components/` with TypeScript

### No Auth Yet

Authentication is planned but not implemented. Services use a placeholder `createdBy` field that will be replaced with actual user IDs when auth is added.

Recommended auth solutions:
- **Clerk** - Modern auth with built-in UI
- **NextAuth.js v5** - OAuth + credentials
- **Lucia Auth** - Lightweight, self-hosted

## 📝 License

MIT

## 🤝 Contributing

This is a personal project but suggestions are welcome!

## 🎯 Roadmap

### MVP (Current Phase)
- [x] Project setup
- [x] Database schema
- [x] Campaign management
- [ ] Character creation
- [ ] Real-time sessions
- [ ] WebSocket implementation

### Future Features
- [ ] Authentication system
- [ ] Dice roller
- [ ] Combat tracker
- [ ] Character sheets UI
- [ ] Campaign notes/journal
- [ ] File uploads (character images)
- [ ] Mobile responsive design
- [ ] PWA support