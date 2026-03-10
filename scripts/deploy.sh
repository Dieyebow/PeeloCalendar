#!/bin/bash

# ===========================================
# Peelocalendar Deployment Script
# ===========================================
# This script:
# 1. Commits and pushes changes to GitHub
# 2. SSHs into the server and pulls changes
# 3. Restarts the autoecole.js service via PM2
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server configuration
SSH_KEY="/Users/peeloincceo/.ssh/id_ed25519_hetzner"
SERVER="root@168.119.125.171"
REMOTE_PATH="/root/apps/academy-backend"

echo -e "${YELLOW}🚀 Starting Peelocalendar deployment...${NC}"

# Step 1: Check if there are changes to commit
echo -e "${YELLOW}📝 Checking for changes...${NC}"
cd "$(dirname "$0")/.."

if [[ -z $(git status --porcelain) ]]; then
    echo -e "${GREEN}✓ No local changes to commit. Proceeding with push...${NC}"
else
    # Stage all changes
    echo -e "${YELLOW}📦 Staging changes...${NC}"
    git add -A
    
    # Commit with timestamp
    COMMIT_MSG="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${YELLOW}💾 Committing: ${COMMIT_MSG}${NC}"
    git commit -m "$COMMIT_MSG"
fi

# Step 2: Push to GitHub
echo -e "${YELLOW}⬆️ Pushing to GitHub (origin main)...${NC}"
git push origin main

# Step 3: SSH into server and deploy
echo -e "${YELLOW}🖥️ Connecting to server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" << ENDSSH
    echo "📂 Navigating to $REMOTE_PATH..."
    mkdir -p $REMOTE_PATH
    cd $REMOTE_PATH
    
    if [ ! -d .git ]; then
        echo "🌐 Cloning repository..."
        git clone https://github.com/Dieyebow/PeeloCalendar.git .
    fi
    
    echo "🧹 Cleaning untracked files (excluding uploads)..."
    git clean -fd --exclude=public/assets/uploads/
    
    echo "🔄 Resetting local changes and pulling from origin..."
    git reset --hard HEAD
    git pull origin main
    
    echo "📦 Installing dependencies..."
    npm install

    echo "🔄 Restarting autoecole.js via PM2..."
    pm2 restart autoecole.js || pm2 start autoecole.js
    
    echo "✅ Server deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}   - Code pushed to GitHub${NC}"
echo -e "${GREEN}   - Server updated and autoecole.js restarted${NC}"
