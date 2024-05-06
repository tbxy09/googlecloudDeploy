source .env
gcloud config set project ${PROJECT_ID}
gcloud config set functions/region ${REGION_NAME}
gcloud functions deploy codebot \
 --gen2 --runtime nodejs20 --trigger-http \
 --set-secrets 'ANTHROPIC_API_KEY=${SECRET_API}' \
 --allow-unauthenticated --entry-point codebot --source ./dist
