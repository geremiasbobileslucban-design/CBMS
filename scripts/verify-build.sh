#!/bin/bash

# Build Verification Script for DRHMMS Application
# This script checks if your project is ready for deployment

echo "========================================"
echo "DRHMMS Build Verification Script"
echo "========================================"
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to print error
error() {
    echo -e "${RED}✗ ERROR:${NC} $1"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠ WARNING:${NC} $1"
    ((WARNINGS++))
}

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check Node.js version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        success "Node.js $NODE_VERSION (>= 18.x required)"
    else
        error "Node.js $NODE_VERSION found, but >= 18.x required"
    fi
else
    error "Node.js not found. Please install Node.js 18.x or higher"
fi

# Check npm
echo ""
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm $NPM_VERSION"
else
    error "npm not found"
fi

# Check project structure
echo ""
echo "Checking project structure..."

# Check critical files
critical_files=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "index.html"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file is missing"
    fi
done

# Check src directory structure
echo ""
echo "Checking src/ directory structure..."

src_dirs=(
    "src"
    "src/components"
    "src/context"
    "src/data"
    "src/types"
    "src/styles"
)

for dir in "${src_dirs[@]}"; do
    if [ -d "$dir" ]; then
        success "$dir/ exists"
    else
        error "$dir/ is missing - run reorganize.sh"
    fi
done

# Check critical source files
echo ""
echo "Checking critical source files..."

src_files=(
    "src/App.tsx"
    "src/main.tsx"
    "src/styles/globals.css"
)

for file in "${src_files[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file is missing"
    fi
done

# Check if node_modules exists
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    success "node_modules/ exists"
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    echo "   Found $MODULE_COUNT installed packages"
else
    warning "node_modules/ not found. Run 'npm install'"
fi

# Check package.json scripts
echo ""
echo "Checking package.json scripts..."
if [ -f "package.json" ]; then
    if grep -q '"dev"' package.json && \
       grep -q '"build"' package.json && \
       grep -q '"preview"' package.json; then
        success "Required npm scripts found"
    else
        error "Missing required npm scripts (dev, build, preview)"
    fi
fi

# Try to build the project
echo ""
echo "Attempting to build project..."
if [ -d "node_modules" ]; then
    echo "Running: npm run build"
    if npm run build > /tmp/build-output.log 2>&1; then
        success "Build successful!"
        
        # Check dist directory
        if [ -d "dist" ]; then
            success "dist/ directory created"
            DIST_SIZE=$(du -sh dist | cut -f1)
            echo "   Build size: $DIST_SIZE"
            
            # Check for index.html in dist
            if [ -f "dist/index.html" ]; then
                success "dist/index.html exists"
            else
                error "dist/index.html not found"
            fi
            
            # Check for assets
            if [ -d "dist/assets" ]; then
                ASSET_COUNT=$(ls -1 dist/assets 2>/dev/null | wc -l)
                success "dist/assets/ exists with $ASSET_COUNT files"
            else
                warning "dist/assets/ not found"
            fi
        else
            error "dist/ directory not created"
        fi
    else
        error "Build failed. Check /tmp/build-output.log for details"
        echo ""
        echo "Build error output:"
        tail -20 /tmp/build-output.log
    fi
else
    warning "Skipping build test - run 'npm install' first"
fi

# Check for .gitignore
echo ""
echo "Checking Git configuration..."
if [ -f ".gitignore" ]; then
    success ".gitignore exists"
    if grep -q "node_modules" .gitignore && \
       grep -q "dist" .gitignore && \
       grep -q ".env" .gitignore; then
        success ".gitignore has required entries"
    else
        warning ".gitignore may be missing important entries"
    fi
else
    warning ".gitignore not found"
fi

# Check for Git repository
if [ -d ".git" ]; then
    success "Git repository initialized"
else
    warning "Not a Git repository (run 'git init' if deploying via Git)"
fi

# Check Vercel configuration
echo ""
echo "Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    success "vercel.json exists"
else
    warning "vercel.json not found (optional but recommended)"
fi

# Summary
echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your project is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. git add . && git commit -m 'Ready for deployment'"
    echo "2. vercel --prod"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo ""
    echo "Your project should deploy, but review the warnings above."
    echo ""
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors before deploying."
    echo ""
    echo "Common fixes:"
    echo "  • Run './reorganize.sh' to fix file structure"
    echo "  • Run 'npm install' to install dependencies"
    echo "  • Check TROUBLESHOOTING.md for help"
    echo ""
    exit 1
fi
