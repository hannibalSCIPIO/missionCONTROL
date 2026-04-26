#!/bin/bash
# Jeff's Mission Control - Quick Setup
# Run this on your local machine

echo "🚀 Setting up Mission Control..."

# Create directory
mkdir -p ~/mission-control && cd ~/mission-control

# If running for first time, uncomment:
# npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm --yes

# For now, just start dev server
echo "Starting Mission Control at http://localhost:3000"
npm run dev