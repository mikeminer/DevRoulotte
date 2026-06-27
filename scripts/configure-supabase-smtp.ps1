param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
  [string]$AccessTokenFile = "supabase/emailtemplates.txt",
  [string]$SmtpConfigPath = ".supabase-smtp.local.json",
  [switch]$SkipTemplates,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-ProjectRef {
  param([string]$Value)

  if (-not [string]::IsNullOrWhiteSpace($Value)) {
    return $Value
  }

  $projectRefPath = "supabase/.temp/project-ref"
  if (Test-Path -LiteralPath $projectRefPath) {
    return (Get-Content -LiteralPath $projectRefPath -Raw).Trim()
  }

  return $null
}

function Get-AccessToken {
  param(
    [string]$Value,
    [string]$Path
  )

  if (-not [string]::IsNullOrWhiteSpace($Value)) {
    return $Value.Trim()
  }

  if (Test-Path -LiteralPath $Path) {
    $content = Get-Content -LiteralPath $Path -Raw
    $match = [regex]::Match($content, 'sbp_[^\s"''<>]+')
    if ($match.Success) {
      return $match.Value.Trim()
    }
  }

  return $null
}

$ProjectRef = Get-ProjectRef $ProjectRef
if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
  throw "Missing SUPABASE_PROJECT_REF. Pass -ProjectRef or set SUPABASE_PROJECT_REF."
}

$AccessToken = Get-AccessToken -Value $AccessToken -Path $AccessTokenFile
if ([string]::IsNullOrWhiteSpace($AccessToken)) {
  throw "Missing SUPABASE_ACCESS_TOKEN. Pass -AccessToken, set SUPABASE_ACCESS_TOKEN, or put an sbp_ token in $AccessTokenFile."
}

if (-not (Test-Path -LiteralPath $SmtpConfigPath)) {
  throw "Missing SMTP config file: $SmtpConfigPath. Copy .supabase-smtp.local.example.json to .supabase-smtp.local.json and fill it."
}

$smtp = Get-Content -LiteralPath $SmtpConfigPath -Raw | ConvertFrom-Json
$required = @("senderEmail", "senderName", "host", "port", "user", "password")
foreach ($key in $required) {
  if ([string]::IsNullOrWhiteSpace([string]$smtp.$key)) {
    throw "Missing SMTP config field: $key"
  }
}

$payload = [ordered]@{
  external_email_enabled = $true
  smtp_admin_email = [string]$smtp.senderEmail
  smtp_sender_name = [string]$smtp.senderName
  smtp_host = [string]$smtp.host
  smtp_port = [int]$smtp.port
  smtp_user = [string]$smtp.user
  smtp_pass = [string]$smtp.password
}

if ($DryRun) {
  [pscustomobject]@{
    projectRef = $ProjectRef
    senderEmail = $payload.smtp_admin_email
    senderName = $payload.smtp_sender_name
    host = $payload.smtp_host
    port = $payload.smtp_port
    user = $payload.smtp_user
    hasPassword = -not [string]::IsNullOrWhiteSpace($payload.smtp_pass)
    templatesWillBeApplied = -not $SkipTemplates
  } | ConvertTo-Json
  exit 0
}

$json = $payload | ConvertTo-Json -Depth 8

Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" `
  -Headers @{
    Authorization = "Bearer $AccessToken"
    "Content-Type" = "application/json"
  } `
  -Body $json | Out-Null

Write-Host "Supabase custom SMTP updated for project $ProjectRef."

if (-not $SkipTemplates) {
  & "$PSScriptRoot/configure-supabase-email-templates.ps1" `
    -ProjectRef $ProjectRef `
    -AccessToken $AccessToken
}
