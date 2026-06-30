#!/bin/bash
# Exit on error
set -e

ENV_FILE="apps/web/.env.local"
PROJECT_ID="blockseblock-81d99"
REGION="us-east4"
SERVICE_NAME="civiclens-ai"

echo "============================================="
echo "CivicLens AI — Google Cloud Run Deployment"
echo "============================================="

# 1. Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed."
    echo "Please install the Google Cloud SDK or run this script in Google Cloud Shell."
    exit 1
fi

# 2. Check for .env.local file
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found."
    echo "Please ensure you have configured your environment variables."
    exit 1
fi

# 3. Read environment variables
echo "Reading environment variables from $ENV_FILE..."
VITE_FIREBASE_API_KEY=$(grep -E "^VITE_FIREBASE_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_AUTH_DOMAIN=$(grep -E "^VITE_FIREBASE_AUTH_DOMAIN=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_PROJECT_ID=$(grep -E "^VITE_FIREBASE_PROJECT_ID=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_STORAGE_BUCKET=$(grep -E "^VITE_FIREBASE_STORAGE_BUCKET=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_MESSAGING_SENDER_ID=$(grep -E "^VITE_FIREBASE_MESSAGING_SENDER_ID=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_APP_ID=$(grep -E "^VITE_FIREBASE_APP_ID=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_FIREBASE_MEASUREMENT_ID=$(grep -E "^VITE_FIREBASE_MEASUREMENT_ID=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')
VITE_GEMINI_API_KEY=$(grep -E "^VITE_GEMINI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r')

# Use project ID from .env.local if set, otherwise default
if [ -n "$VITE_FIREBASE_PROJECT_ID" ]; then
    PROJECT_ID="$VITE_FIREBASE_PROJECT_ID"
fi

echo "Configuration summary:"
echo "- GCP Project: $PROJECT_ID"
echo "- Region:      $REGION"
echo "- Service:     $SERVICE_NAME"
echo ""

# 4. Deploy using gcloud
echo "Deploying service to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --build-arg VITE_FIREBASE_PROJECT_ID="$PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="$VITE_FIREBASE_MEASUREMENT_ID" \
  --build-arg VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY"

echo "✅ Deployment completed successfully!"
