# Database Connection Troubleshooting Guide

## Issue: DNS Resolution Failed

If you're seeing `WARNING: Name resolution of db.xxx.supabase.co failed`, here are the most common causes and solutions:

## 1. Check if Supabase Project is Paused

Supabase free tier projects pause after inactivity. This causes DNS resolution to fail.

**Solution:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Find your project
3. If it shows "Paused", click "Restore" or "Unpause"
4. Wait a few minutes for DNS to propagate

## 2. Use Connection Pooler Instead of Direct Connection

Supabase recommends using the connection pooler for better reliability. The direct connection (port 5432) may have issues.

**In your `.env` file, change:**

❌ **Direct connection (port 5432):**
```
DATABASE_URL="postgresql://postgres:password@db.qwimygmvkiaueydoeyxc.supabase.co:5432/postgres"
```

✅ **Connection pooler (port 6543):**
```
DATABASE_URL="postgresql://postgres:password@db.qwimygmvkiaueydoeyxc.supabase.co:6543/postgres?pgbouncer=true"
```

Or use the pooler subdomain:
```
DATABASE_URL="postgresql://postgres.qwimygmvkiaueydoeyxc:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

## 3. Get the Correct Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Under **Connection string**, select **Connection pooling** (not Direct connection)
4. Copy the connection string
5. Update your `.env` file

## 4. Verify Your .env File

Make sure you have a `.env` file in `apps/api/` with:

```env
DATABASE_URL="your_connection_string_here"
```

## 5. Test the Connection

Run the diagnostic script:

```bash
cd apps/api
pnpm test:db
```

This will:
- Test the database connection
- Show detailed error messages
- Provide specific solutions based on the error

## 6. Alternative: Test Connection Manually

You can also test the connection using PowerShell:

```powershell
# Test DNS resolution
Resolve-DnsName db.qwimygmvkiaueydoeyxc.supabase.co

# Test port connectivity (use 6543 for pooler)
Test-NetConnection db.qwimygmvkiaueydoeyxc.supabase.co -Port 6543
```

## Common Error Codes

- **P1001**: Cannot reach database server
  - Project might be paused
  - Wrong connection string
  - Network/firewall issue

- **ENOTFOUND / EAI_AGAIN**: DNS resolution failed
  - Project is paused
  - Incorrect hostname
  - Use connection pooler instead

- **P2021**: Table does not exist
  - Run migrations: `pnpm prisma:migrate`

## Still Having Issues?

1. Verify your Supabase project is active
2. Double-check the connection string format
3. Try the connection pooler (port 6543)
4. Check your network/firewall settings
5. Contact Supabase support if the project is active but still not connecting

