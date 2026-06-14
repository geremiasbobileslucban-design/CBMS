#!/bin/bash

echo "========================================="
echo "DRHMMS Pre-Build Verification"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check for critical files
echo "📋 Checking critical files..."

if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found in root directory"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ index.html found"
fi

if [ ! -f "src/main.tsx" ]; then
    echo "❌ ERROR: src/main.tsx not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ src/main.tsx found"
fi

if [ ! -f "src/App.tsx" ] && [ ! -f "App.tsx" ]; then
    echo "❌ ERROR: App.tsx not found in src/ or root"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ App.tsx found"
fi

echo ""
echo "📁 Checking required directories..."

# Check for required directories (either in root or src/)
check_dir() {
    local dir_name=$1
    if [ -d "src/$dir_name" ] || [ -d "$dir_name" ]; then
        echo "✅ $dir_name/ directory found"
    else
        echo "⚠️  WARNING: $dir_name/ directory not found"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_dir "components"
check_dir "context"
check_dir "data"
check_dir "types"
check_dir "styles"

echo ""
echo "📦 Checking configuration files..."

if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ package.json found"
    
    # Check if build script exists
    if grep -q '"build":' package.json; then
        echo "✅ Build script configured"
    else
        echo "❌ ERROR: Build script not found in package.json"
        ERRORS=$((ERRORS + 1))
    fi
fi

if [ ! -f "vite.config.ts" ]; then
    echo "❌ ERROR: vite.config.ts not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ vite.config.ts found"
fi

if [ ! -f "tsconfig.json" ]; then
    echo "⚠️  WARNING: tsconfig.json not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ tsconfig.json found"
fi

if [ ! -f "vercel.json" ]; then
    echo "⚠️  WARNING: vercel.json not found (optional for Vercel)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ vercel.json found"
fi

echo ""
echo "🔍 Checking for common issues..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  WARNING: node_modules not found. Run 'npm install' first"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ node_modules directory exists"
fi

# Check if dist directory exists from previous build
if [ -d "dist" ]; then
    echo "ℹ️  Old dist/ directory found (will be replaced during build)"
fi

echo ""
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready to build."
    echo ""
    echo "Run: npm run build"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Found $WARNINGS warning(s) but no critical errors."
    echo "You can proceed with the build, but review warnings above."
    echo ""
    echo "Run: npm run build"
    exit 0
else
    echo "❌ Found $ERRORS error(s) and $WARNING warning(s)."
    echo "Please fix the errors above before building."
    echo ""
    
    if [ ! -d "src/components" ] && [ -d "components" ]; then
        echo "💡 Tip: It looks like your files need reorganization."
        echo "   Run: bash reorganize-safe.sh"
    fi
    
    exit 1
fi
