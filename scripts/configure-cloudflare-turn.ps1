param(
  [string]$CredentialFile = ".cloudflare-turn.local.json",
  [string]$AccountId = $env:CLOUDFLARE_ACCOUNT_ID,
  [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,
  [string]$TurnKeyId = $env:CLOUDFLARE_TURN_KEY_ID,
  [string]$TurnApiToken = $env:CLOUDFLARE_TURN_API_TOKEN,
  [string]$TurnKeyName = "devroulotte-turn",
  [string]$VercelScope = "mikeminers-projects",
  [switch]$SkipVercel,
  [switch]$SkipDeploy,
  [switch]$DisableNodeTlsVerification
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Is-Placeholder {
  param([string]$Value)

  return [string]::IsNullOrWhiteSpace($Value) -or
    $Value -match "^(TODO|your-|replace-)"
}

function Use-ConfigValue {
  param(
    [object]$Config,
    [string]$Property,
    [string]$CurrentValue
  )

  if (-not (Is-Placeholder -Value $CurrentValue)) {
    return $CurrentValue
  }

  if ($null -ne $Config -and $Config.PSObject.Properties.Name -contains $Property) {
    return [string]$Config.$Property
  }

  return $CurrentValue
}

function Assert-Value {
  param([string]$Name, [string]$Value)

  if (Is-Placeholder -Value $Value) {
    throw "Missing required value: $Name"
  }
}

function Set-LocalEnvValue {
  param(
    [string]$Name,
    [string]$Value
  )

  $path = ".env.local"
  $lines = @()

  if (Test-Path -LiteralPath $path) {
    $lines = @(Get-Content -LiteralPath $path)
  }

  $pattern = "^\s*{0}=" -f [regex]::Escape($Name)
  $newLine = "$Name=$Value"
  $updated = $false

  $nextLines = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $updated = $true
      $newLine
    } else {
      $line
    }
  }

  if (-not $updated) {
    $nextLines += $newLine
  }

  Set-Content -LiteralPath $path -Value $nextLines -Encoding UTF8
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

if ($DisableNodeTlsVerification) {
  $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
  Write-Warning "NODE_TLS_REJECT_UNAUTHORIZED=0 is enabled for this shell only."
}

$config = $null
if (Test-Path -LiteralPath $CredentialFile) {
  $config = Get-Content -LiteralPath $CredentialFile -Raw | ConvertFrom-Json
}

$AccountId = Use-ConfigValue -Config $config -Property "accountId" -CurrentValue $AccountId
$ApiToken = Use-ConfigValue -Config $config -Property "apiToken" -CurrentValue $ApiToken
$TurnKeyId = Use-ConfigValue -Config $config -Property "turnKeyId" -CurrentValue $TurnKeyId
$TurnApiToken = Use-ConfigValue -Config $config -Property "turnApiToken" -CurrentValue $TurnApiToken

if (Is-Placeholder -Value $TurnKeyId -or Is-Placeholder -Value $TurnApiToken) {
  Assert-Value -Name "CLOUDFLARE_ACCOUNT_ID" -Value $AccountId
  Assert-Value -Name "CLOUDFLARE_API_TOKEN" -Value $ApiToken

  $response = Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/calls/turn_keys" `
    -Headers @{
      Authorization = "Bearer $ApiToken"
      "Content-Type" = "application/json"
    } `
    -Body (@{ name = $TurnKeyName } | ConvertTo-Json)

  if (-not $response.success) {
    $messages = ($response.errors | ForEach-Object { $_.message }) -join "; "
    throw "Cloudflare TURN key creation failed: $messages"
  }

  $TurnKeyId = $response.result.uid
  $TurnApiToken = $response.result.key
}

Assert-Value -Name "CLOUDFLARE_TURN_KEY_ID" -Value $TurnKeyId
Assert-Value -Name "CLOUDFLARE_TURN_API_TOKEN" -Value $TurnApiToken

$ice = Invoke-RestMethod `
  -Method Post `
  -Uri "https://rtc.live.cloudflare.com/v1/turn/keys/$TurnKeyId/credentials/generate-ice-servers" `
  -Headers @{
    Authorization = "Bearer $TurnApiToken"
    "Content-Type" = "application/json"
  } `
  -Body (@{ ttl = 3600 } | ConvertTo-Json)

if ($null -eq $ice.iceServers -or $ice.iceServers.Count -eq 0) {
  throw "Cloudflare TURN credentials test did not return iceServers."
}

$envValues = [ordered]@{
  CLOUDFLARE_TURN_KEY_ID = $TurnKeyId
  CLOUDFLARE_TURN_API_TOKEN = $TurnApiToken
}

foreach ($entry in $envValues.GetEnumerator()) {
  Set-LocalEnvValue -Name $entry.Key -Value $entry.Value
}

Write-Host "Cloudflare TURN configured locally."
Write-Host "TURN key id: $TurnKeyId"
Write-Host "Generated ICE server groups: $($ice.iceServers.Count)"

if (-not $SkipVercel) {
  foreach ($target in @("production", "preview", "development")) {
    foreach ($entry in $envValues.GetEnumerator()) {
      Add-VercelEnv -Name $entry.Key -Value $entry.Value -Target $target
    }
  }

  Write-Host "Synced Cloudflare TURN env vars to Vercel."

  if (-not $SkipDeploy) {
    & vercel deploy --prod --yes --scope $VercelScope
  }
}
