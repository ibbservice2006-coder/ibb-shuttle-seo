#!/bin/bash
set -e

# ============================================
# IBB Shuttle Service - Build Script
# Build order: SEO static → Vite SPA
# ============================================

echo "🔨 Step 1: Generate static SEO pages (Level 0)"
# Ensure we are in the project root
cd "$(dirname "$0")/.."
# Run SEO build
node seo/build-seo.cjs

echo ""
echo "🔨 Step 2: Vite build (SPA - Level 1+)"
# Use npx to run vite build directly to avoid recursion with npm run build
npx vite build

echo ""
echo "✅ Build complete!"
