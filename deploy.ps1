<#
.SYNOPSIS
  OUT LMS - Cross-Platform Deployment Script for Windows PowerShell
  The Open University of Tanzania Learning Management System

.EXAMPLE
  .\deploy.ps1
  .\deploy.ps1 -Docker
  .\deploy.ps1 -SeedOnly
  .\deploy.ps1 -BuildOnly
#>

[CmdletBinding()]
param (
    [switch]$Docker,
    [switch]$SeedOnly,
    [switch]$BuildOnly,
    [switch]$SkipSeed,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  OUT LMS - Windows Deployment Engine" -ForegroundColor Cyan
Write-Host "  The Open University of Tanzania" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# Load environment configuration if available
if (Test-Path "$ScriptDir\.env") {
    Write-Host "[INFO] Loading settings from .env..." -ForegroundColor Gray
    Get-Content "$ScriptDir\.env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
            $parts = $line.Split('=', 2)
            $envKey = $parts[0].Trim()
            $envVal = $parts[1].Trim().Trim('"').Trim("'")
            if (-not [System.Environment]::GetEnvironmentVariable($envKey)) {
                [System.Environment]::SetEnvironmentVariable($envKey, $envVal)
            }
        }
    }
} elseif (Test-Path "$ScriptDir\.env.example") {
    Write-Host "[INFO] Creating .env from .env.example..." -ForegroundColor Gray
    Copy-Item "$ScriptDir\.env.example" "$ScriptDir\.env"
}

# ------------------------------------------------------------------------------
# 1. Docker Deployment
# ------------------------------------------------------------------------------
if ($Docker) {
    Write-Host "[INFO] Deploying with Docker Compose..." -ForegroundColor Green
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH."
    }
    docker compose down --remove-orphans
    docker compose up -d --build
    Write-Host ""
    Write-Host "==============================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] OUT LMS Docker Containers Launched Successfully!" -ForegroundColor Green
    Write-Host "  - Web Portal:   http://localhost:3000" -ForegroundColor White
    Write-Host "  - Backend API:  http://localhost:8080" -ForegroundColor White
    Write-Host "  - Database:     localhost:3306" -ForegroundColor White
    Write-Host "==============================================================================" -ForegroundColor Green
    return
}

# ------------------------------------------------------------------------------
# 2. Seed-Only Mode
# ------------------------------------------------------------------------------
if ($SeedOnly) {
    Write-Host "[INFO] Executing database seeder..." -ForegroundColor Green
    if (Get-Command php -ErrorAction SilentlyContinue) {
        php "$ScriptDir\database\seed.php"
    } else {
        Write-Error "PHP is required on PATH to execute database/seed.php"
    }
    return
}

# ------------------------------------------------------------------------------
# 3. Build-Only Mode
# ------------------------------------------------------------------------------
if ($BuildOnly) {
    Write-Host "[INFO] Compiling React 18 production bundle..." -ForegroundColor Green
    Set-Location "$ScriptDir\frontend"
    npm install --legacy-peer-deps
    npm run build
    Set-Location $ScriptDir
    Write-Host "[SUCCESS] Bundle compiled in frontend\build\" -ForegroundColor Green
    return
}

# ------------------------------------------------------------------------------
# 4. Standard Local Deployment
# ------------------------------------------------------------------------------
if (-not $SkipSeed) {
    if (Get-Command php -ErrorAction SilentlyContinue) {
        Write-Host "[INFO] Seeding database with official OUT LMS courses and assets..." -ForegroundColor Yellow
        try {
            php "$ScriptDir\database\seed.php"
        } catch {
            Write-Warning "Database seed reported non-zero status. Continuing deployment..."
        }
    } else {
        Write-Warning "PHP not found on PATH; skipping database seeding."
    }
}

if (-not $SkipBuild) {
    if (-not (Test-Path "$ScriptDir\frontend\build\index.html")) {
        Write-Host "[INFO] Compiling frontend production build..." -ForegroundColor Yellow
        Set-Location "$ScriptDir\frontend"
        npm install --legacy-peer-deps
        npm run build
        Set-Location $ScriptDir
    } else {
        Write-Host "[INFO] Production build detected at frontend\build\." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] System ready for launch!" -ForegroundColor Green
Write-Host " Launching server daemon at http://localhost:3000 ..." -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green

node "$ScriptDir\frontend\serve_build.js"

