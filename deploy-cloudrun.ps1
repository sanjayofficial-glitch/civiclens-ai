# deploy-cloudrun.ps1
$ErrorActionPreference = "Stop"

$EnvFile = "apps/web/.env.local"
$ProjectId = "blockseblock-81d99"
$Region = "us-east4"
$ServiceName = "civiclens-ai"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "CivicLens AI — Google Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI is not installed. Please install Google Cloud SDK or run in Cloud Shell."
    exit 1
}

# 2. Check for .env.local file
if (-not (Test-Path $EnvFile)) {
    Write-Error "$EnvFile not found. Please verify environment variables are configured."
    exit 1
}

# 3. Read environment variables
Write-Host "Reading environment variables from $EnvFile..." -ForegroundColor Yellow
$EnvVars = @{}
Get-Content $EnvFile | Where-Object { $_ -match "^VITE_[A-Z_]+=" } | ForEach-Object {
    $parts = $_ -split '=', 2
    $EnvVars[$parts[0]] = $parts[1].Trim()
}

if ($EnvVars.ContainsKey("VITE_FIREBASE_PROJECT_ID")) {
    $ProjectId = $EnvVars["VITE_FIREBASE_PROJECT_ID"]
}

Write-Host "Configuration summary:"
Write-Host "- GCP Project: $ProjectId"
Write-Host "- Region:      $Region"
Write-Host "- Service:     $ServiceName"
Write-Host ""

# 4. Deploy using gcloud
Write-Host "Deploying service to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --project $ProjectId `
  --allow-unauthenticated `
  --build-arg VITE_FIREBASE_API_KEY=$($EnvVars["VITE_FIREBASE_API_KEY"]) `
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=$($EnvVars["VITE_FIREBASE_AUTH_DOMAIN"]) `
  --build-arg VITE_FIREBASE_PROJECT_ID=$ProjectId `
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=$($EnvVars["VITE_FIREBASE_STORAGE_BUCKET"]) `
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$($EnvVars["VITE_FIREBASE_MESSAGING_SENDER_ID"]) `
  --build-arg VITE_FIREBASE_APP_ID=$($EnvVars["VITE_FIREBASE_APP_ID"]) `
  --build-arg VITE_FIREBASE_MEASUREMENT_ID=$($EnvVars["VITE_FIREBASE_MEASUREMENT_ID"]) `
  --build-arg VITE_GEMINI_API_KEY=$($EnvVars["VITE_GEMINI_API_KEY"])

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
