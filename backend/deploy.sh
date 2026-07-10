#!/bin/bash
# ============================================================
# deploy.sh — Deploy Tikscale Backend to Cloud Run
# ============================================================

set -e

SERVICE_NAME="tikscale-backend"
REGION="us-central1"

echo "🚀 Tikscale Backend Deploy Script"
echo "=================================="

# 1. Check gcloud
if ! command -v gcloud &> /dev/null; then
  # Try common install location
  if [ -f "$HOME/google-cloud-sdk/bin/gcloud" ]; then
    source "$HOME/google-cloud-sdk/path.bash.inc"
  else
    echo "❌ gcloud not found. Installing..."
    curl -s https://sdk.cloud.google.com | bash -s -- --disable-prompts
    source "$HOME/google-cloud-sdk/path.bash.inc"
  fi
fi

# 2. Get active project
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT" ]; then
  echo "❌ No GCP project set."
  echo "   Run: gcloud auth login && gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "✅ GCP Project: $PROJECT"
echo "✅ Region: $REGION"
echo "✅ Service: $SERVICE_NAME"

# 3. Enable Cloud Run API
echo ""
echo "🔧 Enabling Cloud Run API..."
gcloud services enable run.googleapis.com --project=$PROJECT 2>/dev/null || true

# 4. Read secrets
GOOGLE_KEY=""
SUPABASE_URL_VAL=""
SUPABASE_ANON_KEY_VAL=""

if [ -f ".env" ]; then
  GOOGLE_KEY=$(grep "^GOOGLE_API_KEY=" .env | cut -d'=' -f2-)
  SUPABASE_URL_VAL=$(grep "^SUPABASE_URL=" .env | cut -d'=' -f2-)
  SUPABASE_ANON_KEY_VAL=$(grep "^SUPABASE_ANON_KEY=" .env | cut -d'=' -f2-)
fi

if [ -z "$GOOGLE_KEY" ]; then
  echo ""
  read -p "🔑 Enter your GOOGLE_API_KEY: " GOOGLE_KEY
fi

if [ -z "$SUPABASE_URL_VAL" ]; then
  echo ""
  read -p "🔑 Enter your SUPABASE_URL: " SUPABASE_URL_VAL
fi

if [ -z "$SUPABASE_ANON_KEY_VAL" ]; then
  echo ""
  read -p "🔑 Enter your SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY_VAL
fi

# 5. Deploy to Cloud Run
echo ""
echo "🏗️  Deploying to Cloud Run (~3-5 min)..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --platform managed \
  --memory 512Mi \
  --cpu 1 \
  --timeout 120 \
  --concurrency 80 \
  --set-env-vars "GOOGLE_API_KEY=$GOOGLE_KEY,SUPABASE_URL=$SUPABASE_URL_VAL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY_VAL,NODE_ENV=production" \
  --project $PROJECT

# 6. Get the deployed URL
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT \
  --format="value(status.url)")

echo ""
echo "✅ Backend URL: $BACKEND_URL"

# 7. Set VITE_BACKEND_URL in Vercel
echo ""
echo "🔧 Adding VITE_BACKEND_URL to Vercel..."
cd ..
echo "$BACKEND_URL" | npx vercel env add VITE_BACKEND_URL production 2>&1 && \
  echo "✅ Vercel env var added!" || \
  echo "⚠️  Add manually: VITE_BACKEND_URL = $BACKEND_URL"

echo ""
echo "=================================="
echo "✅ DEPLOY COMPLETE!"
echo "   Backend: $BACKEND_URL"
echo "   Next: Redeploy no Vercel para ativar."
echo "=================================="
