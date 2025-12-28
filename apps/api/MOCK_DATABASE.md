# Mock Database Setup

The application is now using a **mock in-memory database** instead of Prisma/PostgreSQL. This allows you to test all features without needing a database connection.

## What Changed

### Archived Files
- **Original Prisma schema** moved to `apps/api/archive/prisma/schema.prisma`
- All database connection files preserved for future restoration

### New Files
- **`apps/api/src/db/mock-client.ts`** - Mock database implementation with in-memory storage
- **`apps/api/src/db/client.ts`** - Now exports the mock client instead of Prisma

## Mock Data

The mock database comes pre-loaded with dummy data for testing:

### Hunt 1 (Published)
- **Code:** `ABC123`
- **Slug:** `test-hunt-1`
- **Status:** Published
- **Post-its:**
  1. "First Clue" - Riddle type (answer: "4")
  2. "Second Clue" - Photo type (requires photo)
  3. "Final Clue" - Choice type (options A/B)

### Hunt 2 (Draft)
- **Code:** `XYZ789`
- **Slug:** `draft-hunt`
- **Status:** Draft

## Testing

You can now test all API endpoints without a database:

```bash
# Start the server
cd apps/api
pnpm dev

# Test endpoints
curl http://localhost:4000/api/health
curl http://localhost:4000/api/hunts/by-code/ABC123
curl http://localhost:4000/api/hunts/by-slug/test-hunt-1
```

## Features Supported

The mock client supports all Prisma operations used by the services:
- ✅ `findUnique` with `include` and `orderBy`
- ✅ `findFirst` with `where` and `orderBy`
- ✅ `findMany` with filters
- ✅ `create`, `update`, `delete`
- ✅ Nested relations (postIts, options, submissions, photos, progress)
- ✅ All CRUD operations

## Data Persistence

⚠️ **Note:** The mock database is **in-memory only**. All data is lost when the server restarts. This is intentional for testing purposes.

## Restoring Real Database

When you're ready to use the real database again:

1. **Move schema back:**
   ```bash
   mv apps/api/archive/prisma/schema.prisma apps/api/prisma/schema.prisma
   ```

2. **Update `apps/api/src/db/client.ts`:**
   ```typescript
   // Remove mock import, uncomment Prisma:
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
   });
   export default prisma;
   ```

3. **Generate Prisma client:**
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. **Set up your `.env` file** with the correct `DATABASE_URL`

## Current Status

✅ All services work with mock data
✅ No database connection required
✅ Ready for feature testing
✅ Original database files safely archived

