# Scavenger Hunt Memory App

A mobile-first web app for creating and playing personalized scavenger hunts. Built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend), using PostgreSQL with Prisma ORM.

## Features

- **Create Hunts**: Gifters can create personalized scavenger hunts with post-it notes (clues)
- **Play Hunts**: Gifted users can join via share link or short code
- **Post-it Types**: Riddles, photo challenges, mixed (text + photo), and branching choices
- **Progress Tracking**: Locked/unlocked/completed states managed server-side
- **Memory Book Export**: Download completed hunts as HTML memory books

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: S3-compatible storage (AWS S3 / Cloudflare R2) for photos

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- S3-compatible storage (optional for MVP - can use local storage for testing)

### Installation

1. Install dependencies:
```bash
pnpm install:all
```

2. Set up environment variables:

Copy `apps/api/.env.example` to `apps/api/.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/scavenger_hunt?schema=public"
PORT=4000
PUBLIC_WEB_BASE_URL="http://localhost:5173"
S3_ENDPOINT=""
S3_REGION="us-east-1"
S3_BUCKET="scavenger-hunt-uploads"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_PUBLIC_BASE_URL="https://your-bucket.s3.amazonaws.com"
CORS_ORIGIN="http://localhost:5173"
```

3. Set up the database:

```bash
pnpm db:migrate
```

This will:
- Generate Prisma client
- Run database migrations
- Create all necessary tables

4. Start development servers:

```bash
pnpm dev
```

This runs both:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## Project Structure

```
scaven_hunt/
├── apps/
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── controllers/ # (if needed)
│   │   │   ├── services/    # Business logic
│   │   │   ├── lib/         # Utilities
│   │   │   ├── middleware/  # Express middleware
│   │   │   └── db/          # Prisma client
│   │   └── prisma/          # Prisma schema & migrations
│   └── web/                 # Frontend React app
│       └── src/
│           ├── pages/       # Route pages
│           ├── components/  # React components
│           ├── api/         # API client
│           └── types/       # TypeScript types
├── package.json             # Root package.json
└── README.md
```

## API Endpoints

### Health
- `GET /api/health` - Health check

### Hunts
- `POST /api/hunts` - Create a new hunt
- `POST /api/hunts/:huntId/publish` - Publish a hunt
- `GET /api/hunts/:huntId` - Get hunt details (builder)
- `PUT /api/hunts/:huntId` - Update hunt
- `GET /api/hunts/by-code/:code` - Get hunt by code
- `GET /api/hunts/by-slug/:shareSlug` - Get hunt by slug

### Post-its
- `POST /api/hunts/:huntId/post-its` - Create post-it
- `PUT /api/post-its/:postItId` - Update post-it
- `DELETE /api/post-its/:postItId` - Delete post-it
- `POST /api/post-its/:postItId/options` - Add option to choice post-it
- `DELETE /api/post-it-options/:optionId` - Delete option

### State & Submissions
- `GET /api/hunts/:huntId/state` - Get hunt state for player
- `POST /api/hunts/:huntId/post-its/:postItId/submit` - Submit answer

### Uploads
- `POST /api/uploads/sign` - Get signed upload URL

### Export
- `GET /api/hunts/:huntId/export` - Download memory book HTML

## Frontend Routes

- `/create` - Create a new hunt
- `/builder/:huntId` - Build/edit post-its
- `/share/:huntId` - Share hunt (link + code)
- `/join` - Join by code
- `/h/:shareSlug` - Auto-join by slug (redirects to /play/:huntId)
- `/play/:huntId` - Play the hunt (dashboard)
- `/complete/:huntId` - Completion page with export

## Development

### Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Building for Production

```bash
pnpm build
```

## Notes

- No user authentication required (MVP)
- Hunts are accessed via share links or short codes
- Photos are uploaded to S3-compatible storage
- Memory books are exported as downloadable HTML files
- Server is the source of truth for progress and validation

## License

MIT

