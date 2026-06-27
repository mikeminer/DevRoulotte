param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-Template {
  param([string]$Path)

  $resolved = Resolve-Path -LiteralPath $Path
  return Get-Content -LiteralPath $resolved -Raw
}

if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
  $projectRefPath = "supabase/.temp/project-ref"
  if (Test-Path -LiteralPath $projectRefPath) {
    $ProjectRef = (Get-Content -LiteralPath $projectRefPath -Raw).Trim()
  }
}

if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
  throw "Missing SUPABASE_PROJECT_REF. Pass -ProjectRef or set SUPABASE_PROJECT_REF."
}

$payload = [ordered]@{
  mailer_subjects_confirmation = "Conferma il tuo account DevRoulotte"
  mailer_templates_confirmation_content = Get-Template "supabase/templates/confirmation.html"
  mailer_subjects_recovery = "Reimposta la password DevRoulotte"
  mailer_templates_recovery_content = Get-Template "supabase/templates/recovery.html"
  mailer_subjects_magic_link = "Il tuo link di accesso DevRoulotte"
  mailer_templates_magic_link_content = Get-Template "supabase/templates/magic-link.html"
  mailer_subjects_invite = "Sei stato invitato su DevRoulotte"
  mailer_templates_invite_content = Get-Template "supabase/templates/invite.html"
  mailer_subjects_email_change = "Conferma la nuova email DevRoulotte"
  mailer_templates_email_change_content = Get-Template "supabase/templates/email-change.html"
  mailer_subjects_reauthentication = "{{ .Token }} e' il tuo codice DevRoulotte"
  mailer_templates_reauthentication_content = Get-Template "supabase/templates/reauthentication.html"
  mailer_notifications_password_changed_enabled = $true
  mailer_subjects_password_changed_notification = "Password DevRoulotte aggiornata"
  mailer_templates_password_changed_notification_content = Get-Template "supabase/templates/password-changed-notification.html"
  mailer_notifications_email_changed_enabled = $true
  mailer_subjects_email_changed_notification = "Email DevRoulotte aggiornata"
  mailer_templates_email_changed_notification_content = Get-Template "supabase/templates/email-changed-notification.html"
}

if ($DryRun) {
  $payload.Keys | ForEach-Object { Write-Host $_ }
  Write-Host "Dry run only. Project ref: $ProjectRef"
  exit 0
}

if ([string]::IsNullOrWhiteSpace($AccessToken)) {
  throw "Missing SUPABASE_ACCESS_TOKEN. Create a Supabase personal access token and set it only in your shell."
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

Write-Host "Supabase email templates updated for project $ProjectRef."
