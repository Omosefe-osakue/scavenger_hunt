// Using mock database client instead of Prisma
// Original Prisma files have been archived to apps/api/archive/
// To restore: move schema.prisma back and uncomment Prisma code below

import mockClient from './mock-client';

// Uncomment below and remove mockClient import to use real Prisma:
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
// });
// export default prisma;

export default mockClient;

