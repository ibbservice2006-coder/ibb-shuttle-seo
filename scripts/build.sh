#!/bin/bash
set -e

# ============================================
# IBB Shuttle Service - Build Script
# Build order: SEO static → Vite SPA
# ============================================

echo "🔨 Step 1: Generate static SEO pages (Level 0)"
node seo/build-seo.js

echo ""
echo "🔨 Step 2: Vite build (SPA - Level 1+)"
npx vite build

echo ""
echo "✅ Build complete!"
