param(
  [string]$CredentialFile = ".paypal-credentials.local.json",
  [string]$Mode = $env:PAYPAL_MODE,
  [string]$ClientId = $env:PAYPAL_CLIENT_ID,
  [string]$ClientSecret = $env:PAYPAL_CLIENT_SECRET,
  [string]$PlanId = $env:PAYPAL_PLAN_ID,
  [string]$WebhookId = $env:PAYPAL_WEBHOOK_ID,
  [string]$AppUrl = $env:NEXT_PUBLIC_APP_URL,
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
    $Value -match "^(TODO|your-|replace-|P-xxxxxxxx|WH-xxxxxxxx)"
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

function Get-PayPalAccessToken {
  param(
    [string]$BaseUrl,
    [string]$Id,
    [string]$Secret
  )

  $pair = "{0}:{1}" -f $Id, $Secret
  $basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))

  $response = Invoke-RestMethod `
    -Method Post `
    -Uri "$BaseUrl/v1/oauth2/token" `
    -Headers @{ Authorization = "Basic $basic" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "grant_type=client_credentials"

  return $response.access_token
}

function Invoke-PayPal {
  param(
    [string]$BaseUrl,
    [string]$AccessToken,
    [string]$Method,
    [string]$Path,
    [object]$Body,
    [string]$RequestId
  )

  $headers = @{
    Authorization = "Bearer $AccessToken"
    Accept = "application/json"
    "Content-Type" = "application/json"
  }

  if (-not [string]::IsNullOrWhiteSpace($RequestId)) {
    $headers["PayPal-Request-Id"] = $RequestId
  }

  $params = @{
    Method = $Method
    Uri = "$BaseUrl$Path"
    Headers = $headers
  }

  if ($null -ne $Body) {
    $params["Body"] = $Body | ConvertTo-Json -Depth 20
  }

  return Invoke-RestMethod @params
}

if ($DisableNodeTlsVerification) {
  $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
  Write-Warning "NODE_TLS_REJECT_UNAUTHORIZED=0 is enabled for this shell only."
}

$config = $null
if (Test-Path -LiteralPath $CredentialFile) {
  $config = Get-Content -LiteralPath $CredentialFile -Raw | ConvertFrom-Json
}

$Mode = Use-ConfigValue -Config $config -Property "mode" -CurrentValue $Mode
$ClientId = Use-ConfigValue -Config $config -Property "clientId" -CurrentValue $ClientId
$ClientSecret = Use-ConfigValue -Config $config -Property "clientSecret" -CurrentValue $ClientSecret
$PlanId = Use-ConfigValue -Config $config -Property "planId" -CurrentValue $PlanId
$WebhookId = Use-ConfigValue -Config $config -Property "webhookId" -CurrentValue $WebhookId

if ([string]::IsNullOrWhiteSpace($Mode)) {
  $Mode = "sandbox"
}

$Mode = $Mode.ToLowerInvariant()
if ($Mode -notin @("sandbox", "live")) {
  throw "PAYPAL_MODE must be sandbox or live."
}

if ([string]::IsNullOrWhiteSpace($AppUrl)) {
  $AppUrl = "https://devroulotte.chat"
}

$AppUrl = $AppUrl.TrimEnd("/")
$baseUrl = if ($Mode -eq "live") { "https://api-m.paypal.com" } else { "https://api-m.sandbox.paypal.com" }

Assert-Value -Name "PAYPAL_CLIENT_ID" -Value $ClientId
Assert-Value -Name "PAYPAL_CLIENT_SECRET" -Value $ClientSecret

$accessToken = Get-PayPalAccessToken -BaseUrl $baseUrl -Id $ClientId -Secret $ClientSecret

if (Is-Placeholder -Value $PlanId) {
  $product = Invoke-PayPal `
    -BaseUrl $baseUrl `
    -AccessToken $accessToken `
    -Method "Post" `
    -Path "/v1/catalogs/products" `
    -RequestId "devroulotte-product-$Mode" `
    -Body @{
      name = "DevRoulotte Premium"
      description = "Piano Premium DevRoulotte per networking 1:1."
      type = "SERVICE"
      category = "SOFTWARE"
      image_url = "$AppUrl/devroulotte-logo.png"
      home_url = $AppUrl
    }

  $plan = Invoke-PayPal `
    -BaseUrl $baseUrl `
    -AccessToken $accessToken `
    -Method "Post" `
    -Path "/v1/billing/plans" `
    -RequestId "devroulotte-plan-399-$Mode" `
    -Body @{
      product_id = $product.id
      name = "DevRoulotte Premium"
      description = "Premium con trial gratuito di 5 giorni, poi 3,99 EUR al mese."
      status = "ACTIVE"
      billing_cycles = @(
        @{
          frequency = @{
            interval_unit = "DAY"
            interval_count = 5
          }
          tenure_type = "TRIAL"
          sequence = 1
          total_cycles = 1
          pricing_scheme = @{
            fixed_price = @{
              value = "0"
              currency_code = "EUR"
            }
          }
        },
        @{
          frequency = @{
            interval_unit = "MONTH"
            interval_count = 1
          }
          tenure_type = "REGULAR"
          sequence = 2
          total_cycles = 0
          pricing_scheme = @{
            fixed_price = @{
              value = "3.99"
              currency_code = "EUR"
            }
          }
        }
      )
      payment_preferences = @{
        auto_bill_outstanding = $true
        setup_fee = @{
          value = "0"
          currency_code = "EUR"
        }
        setup_fee_failure_action = "CONTINUE"
        payment_failure_threshold = 3
      }
    }

  $PlanId = $plan.id
}

$webhookUrl = "$AppUrl/api/paypal/webhook"

if (Is-Placeholder -Value $WebhookId) {
  $existingWebhook = $null
  $webhooks = Invoke-PayPal `
    -BaseUrl $baseUrl `
    -AccessToken $accessToken `
    -Method "Get" `
    -Path "/v1/notifications/webhooks"

  if ($null -ne $webhooks.webhooks) {
    $existingWebhook = $webhooks.webhooks |
      Where-Object { $_.url -eq $webhookUrl } |
      Select-Object -First 1
  }

  if ($null -ne $existingWebhook) {
    $WebhookId = $existingWebhook.id
  } else {
    $webhook = Invoke-PayPal `
      -BaseUrl $baseUrl `
      -AccessToken $accessToken `
      -Method "Post" `
      -Path "/v1/notifications/webhooks" `
      -Body @{
        url = $webhookUrl
        event_types = @(
          @{ name = "BILLING.SUBSCRIPTION.CREATED" },
          @{ name = "BILLING.SUBSCRIPTION.ACTIVATED" },
          @{ name = "BILLING.SUBSCRIPTION.UPDATED" },
          @{ name = "BILLING.SUBSCRIPTION.CANCELLED" },
          @{ name = "BILLING.SUBSCRIPTION.SUSPENDED" },
          @{ name = "BILLING.SUBSCRIPTION.EXPIRED" },
          @{ name = "BILLING.SUBSCRIPTION.PAYMENT.FAILED" }
        )
      }

    $WebhookId = $webhook.id
  }
}

$returnUrl = "$AppUrl/profile?paypal=approved"
$cancelUrl = "$AppUrl/?paypal=cancelled"

$envValues = [ordered]@{
  NEXT_PUBLIC_APP_URL = $AppUrl
  PAYPAL_MODE = $Mode
  PAYPAL_CLIENT_ID = $ClientId
  PAYPAL_CLIENT_SECRET = $ClientSecret
  PAYPAL_PLAN_ID = $PlanId
  PAYPAL_WEBHOOK_ID = $WebhookId
  PAYPAL_RETURN_URL = $returnUrl
  PAYPAL_CANCEL_URL = $cancelUrl
}

foreach ($entry in $envValues.GetEnumerator()) {
  Set-LocalEnvValue -Name $entry.Key -Value $entry.Value
}

Write-Host "PayPal configured locally."
Write-Host "Plan: $PlanId"
Write-Host "Webhook: $WebhookId"

if (-not $SkipVercel) {
  foreach ($target in @("production", "preview", "development")) {
    foreach ($entry in $envValues.GetEnumerator()) {
      Add-VercelEnv -Name $entry.Key -Value $entry.Value -Target $target
    }
  }

  Write-Host "Synced PayPal env vars to Vercel."

  if (-not $SkipDeploy) {
    & vercel deploy --prod --yes --scope $VercelScope
  }
}
