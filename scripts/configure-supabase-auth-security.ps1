param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

$ErrorActionPreference = "Stop"

function Assert-Value {
  param([string]$Name, [string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value) -or $Value -like "your-*") {
    throw "Missing required value: $Name"
  }
}

Assert-Value -Name "SUPABASE_PROJECT_REF" -Value $ProjectRef
Assert-Value -Name "SUPABASE_ACCESS_TOKEN" -Value $AccessToken

$headers = @{
  Authorization = "Bearer $AccessToken"
  "Content-Type" = "application/json"
}

$body = @{
  mailer_autoconfirm = $false
  mailer_allow_unverified_email_sign_ins = $false
  password_min_length = 10
  password_required_characters = "abcdefghijklmnopqrstuvwxyz:ABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789"
  security_update_password_require_reauthentication = $true
  smtp_max_frequency = 60
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" `
  -Headers $headers `
  -Body $body | Out-Null

Write-Host "Supabase Auth security settings updated for project $ProjectRef."
