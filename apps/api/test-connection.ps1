# Database Connection Diagnostic Script
# This script helps diagnose Supabase connection issues

Write-Host "🔍 Supabase Database Connection Diagnostic" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Create a .env file with your DATABASE_URL" -ForegroundColor Yellow
    Write-Host "   Example: DATABASE_URL=`"postgresql://user:pass@host:port/db`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Try to extract hostname from DATABASE_URL if it's set
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    # Try to read from .env file
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'DATABASE_URL=(.+)') {
        $databaseUrl = $matches[1].Trim('"').Trim("'").Trim()
    }
}

if (-not $databaseUrl) {
    Write-Host "❌ DATABASE_URL not found in environment or .env file" -ForegroundColor Red
    exit 1
}

Write-Host "✅ DATABASE_URL found (hidden for security)" -ForegroundColor Green

# Extract hostname from connection string
$hostname = $null
$port = $null

if ($databaseUrl -match '@([^:]+):(\d+)/') {
    $hostname = $matches[1]
    $port = [int]$matches[2]
    Write-Host ""
    Write-Host "📍 Detected hostname: $hostname" -ForegroundColor Cyan
    Write-Host "📍 Detected port: $port" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Could not parse hostname from DATABASE_URL" -ForegroundColor Yellow
    Write-Host "   Please check your connection string format" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Testing DNS resolution..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName -Name $hostname -ErrorAction Stop
    Write-Host "✅ DNS resolution successful" -ForegroundColor Green
    Write-Host "   IP Address: $($dnsResult[0].IPAddress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ DNS resolution failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possible solutions:" -ForegroundColor Yellow
    Write-Host "   1. Your Supabase project might be PAUSED" -ForegroundColor Yellow
    Write-Host "      → Go to https://app.supabase.com and unpause your project" -ForegroundColor Yellow
    Write-Host "   2. Try using the connection pooler (port 6543) instead of direct (5432)" -ForegroundColor Yellow
    Write-Host "   3. Check if the hostname is correct in your DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Testing port connectivity..." -ForegroundColor Cyan
$connectionTest = Test-NetConnection -ComputerName $hostname -Port $port -WarningAction SilentlyContinue

if ($connectionTest.TcpTestSucceeded) {
    Write-Host "✅ Port $port is reachable" -ForegroundColor Green
} else {
    Write-Host "❌ Cannot connect to port $port" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 If you're using port 5432 (direct connection), try:" -ForegroundColor Yellow
    Write-Host "   - Switch to connection pooler (port 6543)" -ForegroundColor Yellow
    Write-Host "   - Add ?pgbouncer=true to your connection string" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Example pooler URL:" -ForegroundColor Yellow
    $exampleUrl = "postgresql://user:pass@${hostname}:6543/db?pgbouncer=true"
    Write-Host "   $exampleUrl" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. If DNS failed: Unpause your Supabase project" -ForegroundColor White
Write-Host "   2. If port failed: Use connection pooler (port 6543)" -ForegroundColor White
Write-Host "   3. Run 'pnpm test:db' to test Prisma connection" -ForegroundColor White
Write-Host ""

