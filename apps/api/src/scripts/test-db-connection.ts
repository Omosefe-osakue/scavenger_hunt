import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    // Check if we can query a table
    try {
      const huntCount = await prisma.hunt.count();
      console.log(`✅ Database is accessible. Hunt count: ${huntCount}`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('⚠️  Database connected but tables may not exist. Run migrations: pnpm prisma:migrate');
      } else {
        throw error;
      }
    }
    
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Possible solutions:');
      console.error('1. Check if your Supabase project is paused (unpause it in the dashboard)');
      console.error('2. Verify your DATABASE_URL in .env file');
      console.error('3. Try using the connection pooler instead of direct connection:');
      console.error('   - Direct: postgresql://...@db.xxx.supabase.co:5432/...');
      console.error('   - Pooler: postgresql://...@db.xxx.supabase.co:6543/... (port 6543)');
      console.error('   - Or: postgresql://...@pooler.xxx.supabase.co:6543/...');
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      console.error('\n💡 DNS resolution failed. Possible causes:');
      console.error('1. Supabase project is paused - check your Supabase dashboard');
      console.error('2. Incorrect hostname in DATABASE_URL');
      console.error('3. Network/firewall blocking the connection');
      console.error('4. Try using the connection pooler (port 6543) instead of direct (5432)');
    } else if (!process.env.DATABASE_URL) {
      console.error('\n💡 DATABASE_URL environment variable is not set!');
      console.error('Create a .env file in apps/api/ with:');
      console.error('DATABASE_URL="postgresql://user:password@host:port/database"');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

