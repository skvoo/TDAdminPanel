# Create admin user on TD DB via SSH (st@104.223.25.234, key-based auth).
# 1) Generates SQL with bcrypt hash
# 2) Copies SQL to server and runs psql -f
# Requires: node (with bcryptjs), ssh, scp, psql on server
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ScriptDir = $PSScriptRoot
$SqlFile = Join-Path $ScriptDir ".create-admin.sql"
$Server = "st@104.223.25.234"
$RemotePath = "/tmp/td-create-admin.sql"

Push-Location $ProjectRoot
try {
    # Generate SQL (email/password: admin@td.local / TdAdminPanel1 by default)
    node "$ScriptDir\create-admin-remote.js"
    if (-not (Test-Path $SqlFile)) {
        Write-Error "SQL file was not created: $SqlFile"
        exit 1
    }
    # Copy to server
    scp $SqlFile "${Server}:${RemotePath}"
    # Run psql on server (PgBouncer on localhost)
    ssh $Server "psql 'postgresql://tdadmin:TdAdmin7xKp2mNqR@127.0.0.1:6432/td' -f $RemotePath"
    # Remove from server
    ssh $Server "rm -f $RemotePath"
    Remove-Item $SqlFile -Force -ErrorAction SilentlyContinue
    Write-Host "Done. Log in at https://td-admin-panel.vercel.app/login with admin@td.local / TdAdminPanel1"
} finally {
    Pop-Location
}
