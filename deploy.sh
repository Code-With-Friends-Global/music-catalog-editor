#!/bin/bash

set -e

PROJECT_ID="${GCP_PROJECT_ID:-music-catalog-editor-project}"
SERVICE_NAME="${SERVICE_NAME:-music-catalog-editor-api}"
REGION="${REGION:-us-central1}"
IMAGE_NAME="music-catalog-editor-api"
GCR_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest"
SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-music-catalog-editor-sa}"
SECRET_NAME="${SECRET_NAME:-gemini-service-account-key}"
SECRET_ENV_VAR="${SECRET_ENV_VAR:-GOOGLE_SERVICE_ACCOUNT_KEY_JSON}"
SECRET_FILE="${SECRET_FILE:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cat <<EOF
${YELLOW}🎵 Music Catalog Editor Deployment Script${NC}
Project ID: $PROJECT_ID
Service Name: $SERVICE_NAME
Region: $REGION
Image: $GCR_IMAGE
Service Account: $SERVICE_ACCOUNT_NAME
Secret Name: $SECRET_NAME
Secret Env Var: $SECRET_ENV_VAR
EOF

if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI not found. Please install it.${NC}"
  exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo -e "${RED}Error: No active gcloud account. Run 'gcloud auth login'${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Authenticated as: $ACTIVE_ACCOUNT${NC}"

gcloud config set project "$PROJECT_ID"

echo -e "${GREEN}✓ Project set to: $PROJECT_ID${NC}"

DOCKER_AVAILABLE=true
if ! command -v docker &> /dev/null; then
  DOCKER_AVAILABLE=false
  echo -e "${YELLOW}Docker CLI not found. Will use gcloud builds submit instead.${NC}"
else
  if ! docker ps &> /dev/null; then
    DOCKER_AVAILABLE=false
    echo -e "${YELLOW}Docker daemon is not running. Will use gcloud builds submit instead.${NC}"
  else
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
  fi
fi

echo -e "${YELLOW}Step: Building container image...${NC}"
if [ "$DOCKER_AVAILABLE" = true ]; then
  gcloud auth configure-docker --quiet
  docker buildx build --platform linux/amd64 -f Dockerfile.ai -t "$GCR_IMAGE" --push .
else
  TEMP_BACKUP=""
  if [ -f Dockerfile ]; then
    TEMP_BACKUP="Dockerfile.bak.deploy"
    mv Dockerfile "$TEMP_BACKUP"
  fi
  cp Dockerfile.ai Dockerfile
  gcloud builds submit --tag "$GCR_IMAGE" .
  rm -f Dockerfile
  if [ -n "$TEMP_BACKUP" ] && [ -f "$TEMP_BACKUP" ]; then
    mv "$TEMP_BACKUP" Dockerfile
  fi
fi

gcloud services enable run.googleapis.com generativelanguage.googleapis.com aiplatform.googleapis.com secretmanager.googleapis.com --quiet

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" --project "$PROJECT_ID" --display-name="Music Catalog Editor service account"
fi

for ROLE in roles/aiplatform.user roles/secretmanager.secretAccessor roles/iam.serviceAccountTokenCreator roles/generativeai.apiUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="$ROLE" --quiet || true
  echo -e "${GREEN}✓ Granted $ROLE${NC}"
 done

SECRET_EXISTS=false
SECRET_BINDABLE=false
if gcloud secrets describe "$SECRET_NAME" --project "$PROJECT_ID" >/dev/null 2>&1; then
  SECRET_EXISTS=true
  VERSION_COUNT=$(gcloud secrets versions list "$SECRET_NAME" --project "$PROJECT_ID" --format='value(name)' | wc -l | tr -d ' ')
  if [ "$VERSION_COUNT" -gt 0 ]; then
    SECRET_BINDABLE=true
  elif [ -n "$SECRET_FILE" ]; then
    gcloud secrets versions add "$SECRET_NAME" --data-file="$SECRET_FILE" --project "$PROJECT_ID"
    SECRET_BINDABLE=true
  fi
elif [ -n "$SECRET_FILE" ]; then
  gcloud secrets create "$SECRET_NAME" --replication-policy="automatic" --data-file="$SECRET_FILE" --project "$PROJECT_ID"
  SECRET_EXISTS=true
  SECRET_BINDABLE=true
fi

DEPLOY_CMD=(gcloud run deploy "$SERVICE_NAME" \
  --image "$GCR_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --service-account "$SERVICE_ACCOUNT_EMAIL" \
  --set-env-vars "GEMINI_MODEL=${GEMINI_MODEL:-gemini-flash},GOOGLE_CLOUD_PROJECT=$PROJECT_ID,AI_SERVICE_PORT=3001")

if [ "$SECRET_BINDABLE" = true ]; then
  DEPLOY_CMD+=(--set-secrets "$SECRET_ENV_VAR=${SECRET_NAME}:latest")
fi

"${DEPLOY_CMD[@]}"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "Service URL: $SERVICE_URL"

if curl -s "$SERVICE_URL/api/health" | grep -q "ok"; then
  echo -e "${GREEN}✓ AI service is responding correctly${NC}"
else
  echo -e "${RED}✗ API test failed${NC}"
  exit 1
fi
