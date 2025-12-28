# Archived Database Files

This folder contains the original Prisma database files that have been archived to allow testing with mock data.

## Contents

- `prisma/schema.prisma` - Original Prisma schema file

## To Restore

When you're ready to use the real database again:

1. Move `prisma/schema.prisma` back to `apps/api/prisma/schema.prisma`
2. Update `apps/api/src/db/client.ts` to use PrismaClient instead of the mock
3. Run `pnpm prisma:generate` and `pnpm prisma:migrate`
4. Update your `.env` file with the correct DATABASE_URL

## Current Setup

The application is currently using a mock in-memory database located in:
- `apps/api/src/db/mock-client.ts` - Mock database implementation
- `apps/api/src/db/client.ts` - Exports the mock client

