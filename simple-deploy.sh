#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs -0)
  echo "Environment variables loaded successfully."
else
  echo "Error: .env file not found."
  exit 1
fi

# Variables (change these as needed)
ACR_NAME="playpowerregistry"
IMAGE_NAME="playpower-backend"
IMAGE_TAG="latest"
RESOURCE_GROUP="vibeApps"
LOCATION="centralindia"
CONTAINER_APP_NAME="playpower-app"
ENVIRONMENT_NAME="playpower-env"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Step 1: Updating Dockerfile for compatibility...${NC}"
cat > Dockerfile << EOL
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/app.js"]
EOL

echo -e "${GREEN}Step 2: Building Docker Image (with platform specification)...${NC}"
docker build --platform linux/amd64 -t $IMAGE_NAME:$IMAGE_TAG .

echo -e "${GREEN}Step 3: Setting up Azure Container Registry...${NC}"
echo -e "${YELLOW}Creating Resource Group if it doesn't exist...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

echo -e "${YELLOW}Creating Azure Container Registry...${NC}"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic || echo "ACR already exists, continuing..."

echo -e "${YELLOW}Enabling Admin user for ACR...${NC}"
az acr update --name $ACR_NAME --admin-enabled true

echo -e "${YELLOW}Getting ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv)

echo -e "${GREEN}Step 4: Logging into ACR and pushing image...${NC}"
docker login $ACR_NAME.azurecr.io --username $ACR_USERNAME --password $ACR_PASSWORD
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG

echo -e "${GREEN}Step 6: Creating Azure Container App...${NC}"
echo -e "${YELLOW}Setting environment variables for the container app...${NC}"


# Deploy using the environment variables from the file
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --env-vars PORT=$PORT NODE_ENV=$NODE_ENV DATABASE_URL=$DATABASE_URL JWT_SECRET=$JWT_SECRET JWT_EXPIRES_IN=$JWT_EXPIRES_IN AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY AZURE_OPENAI_API_VERSION=$AZURE_OPENAI_API_VERSION AZURE_OPENAI_DEPLOYMENT_NAME=$AZURE_OPENAI_DEPLOYMENT_NAME \
  --query properties.configuration.ingress.fqdn

echo -e "${GREEN}Deployment completed! Your app is now running on Azure Container Apps.${NC}"
echo -e "${YELLOW}Note: Make sure your database is accessible from Azure. You might need to update firewall rules.${NC}"
