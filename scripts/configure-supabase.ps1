param(
  [string]$ProjectUrl = $env:NEXT_PUBLIC_SUPABASE_URL,
  [string]$AnonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY,
  [string]$DbUrl = $env:SUPABASE_DB_URL,
  [string]$VercelScope = "mikeminers-projects",
  [switch]$SkipVercel,
  [switch]$SkipSchema,
  [switch]$SkipDeploy,
  [switch]$DisableNodeTlsVerification
)

$ErrorActionPreference = "Stop"

function Assert-Value {
  param([string]$Name, [string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value) -or $Value -like "your-*") {
    throw "Missing required value: $Name"
  }
}

function Add-VercelEnv {
  param(
    [string]$Name,
    [string]$Value,
    [string]$Target
  )

  $args = @(
    "env",
    "add",
    $Name,
    $Target,
    "--value",
    $Value,
    "--yes",
    "--force",
    "--scope",
    $VercelScope
  )

  & vercel @args | Out-Null
}

Assert-Value -Name "NEXT_PUBLIC_SUPABASE_URL" -Value $ProjectUrl
Assert-Value -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $AnonKey
Assert-Value -Name "SUPABASE_SERVICE_ROLE_KEY" -Value $ServiceRoleKey

if ($DisableNodeTlsVerification) {
  $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
  Write-Warning "NODE_TLS_REJECT_UNAUTHORIZED=0 is enabled for this shell only."
}

$localEnv = @"
NEXT_PUBLIC_SUPABASE_URL=$ProjectUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$AnonKey
SUPABASE_SERVICE_ROLE_KEY=$ServiceRoleKey
"@

if (-not [string]::IsNullOrWhiteSpace($DbUrl)) {
  $localEnv += "`nSUPABASE_DB_URL=$DbUrl"
}

Set-Content -LiteralPath ".env.local" -Value $localEnv -Encoding UTF8
Write-Host "Wrote .env.local with Supabase runtime keys."

if (-not $SkipSchema) {
  if ([string]::IsNullOrWhiteSpace($DbUrl)) {
    Write-Warning "SUPABASE_DB_URL not provided. Schema was not applied."
    Write-Warning "Run supabase/schema.sql in Supabase SQL Editor or rerun with SUPABASE_DB_URL."
  } else {
    $psql = Get-Command psql -ErrorAction SilentlyContinue

    if (-not $psql) {
      Write-Warning "psql not found. Schema was not applied."
      Write-Warning "Install PostgreSQL tools or run supabase/schema.sql in Supabase SQL Editor."
    } else {
      & psql $DbUrl -v ON_ERROR_STOP=1 -f "supabase/schema.sql"
      Write-Host "Applied Supabase schema."
    }
  }
}

if (-not $SkipVercel) {
  foreach ($target in @("production", "preview", "development")) {
    Add-VercelEnv -Name "NEXT_PUBLIC_SUPABASE_URL" -Value $ProjectUrl -Target $target
    Add-VercelEnv -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $AnonKey -Target $target
    Add-VercelEnv -Name "SUPABASE_SERVICE_ROLE_KEY" -Value $ServiceRoleKey -Target $target
  }

  Write-Host "Synced Supabase env vars to Vercel."

  if (-not $SkipDeploy) {
    & vercel deploy --prod --yes --scope $VercelScope
  }
}
