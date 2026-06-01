#!/bin/bash

# Script to reorganize files for Vite/Vercel deployment
echo "========================================"
echo "CBMS Project Reorganization Script"
echo "========================================"
echo ""

# Check if src directory already exists and has files
if [ -d "src" ] && [ "$(ls -A src 2>/dev/null)" ]; then
    echo "⚠️  Warning: src/ directory already exists and contains files."
    echo "Do you want to continue? This may overwrite existing files. (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Aborted."
        exit 1
    fi
fi

# Create src directory if it doesn't exist
echo "📁 Creating src directory structure..."
mkdir -p src

# Move main directories to src
echo ""
echo "📦 Moving project directories..."

if [ -d "components" ] && [ ! -d "src/components" ]; then
    echo "  ✓ Moving components/ to src/components/"
    mv components src/
elif [ -d "components" ]; then
    echo "  ⚠  src/components/ already exists, skipping..."
else
    echo "  ⓘ  No components/ directory found"
fi

if [ -d "context" ] && [ ! -d "src/context" ]; then
    echo "  ✓ Moving context/ to src/context/"
    mv context src/
elif [ -d "context" ]; then
    echo "  ⚠  src/context/ already exists, skipping..."
else
    echo "  ⓘ  No context/ directory found"
fi

if [ -d "data" ] && [ ! -d "src/data" ]; then
    echo "  ✓ Moving data/ to src/data/"
    mv data src/
elif [ -d "data" ]; then
    echo "  ⚠  src/data/ already exists, skipping..."
else
    echo "  ⓘ  No data/ directory found"
fi

if [ -d "types" ] && [ ! -d "src/types" ]; then
    echo "  ✓ Moving types/ to src/types/"
    mv types src/
elif [ -d "types" ]; then
    echo "  ⚠  src/types/ already exists, skipping..."
else
    echo "  ⓘ  No types/ directory found"
fi

if [ -d "styles" ] && [ ! -d "src/styles" ]; then
    echo "  ✓ Moving styles/ to src/styles/"
    mv styles src/
elif [ -d "styles" ]; then
    echo "  ⚠  src/styles/ already exists, skipping..."
else
    echo "  ⓘ  No styles/ directory found"
fi

# Move App.tsx to src/ if it exists in root
echo ""
echo "📄 Moving main application files..."
if [ -f "App.tsx" ] && [ ! -f "src/App.tsx" ]; then
    echo "  ✓ Moving App.tsx to src/App.tsx"
    mv App.tsx src/
elif [ -f "App.tsx" ]; then
    echo "  ⚠  src/App.tsx already exists, skipping..."
else
    echo "  ⓘ  App.tsx already in src/ or not found"
fi

# Check if main.tsx exists
if [ ! -f "src/main.tsx" ]; then
    echo "  ⚠  Warning: src/main.tsx not found!"
else
    echo "  ✓ src/main.tsx exists"
fi

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "  ⚠  Warning: index.html not found in root directory!"
else
    echo "  ✓ index.html exists in root"
fi

echo ""
echo "========================================"
echo "✅ Project structure reorganized!"
echo "========================================"
echo ""
echo "📊 Current structure:"
if command -v tree &> /dev/null; then
    tree -L 2 -I 'node_modules|dist' .
else
    echo ""
    echo "src/"
    ls -1 src/ 2>/dev/null | sed 's/^/  ├── /'
    echo ""
    echo "Root files:"
    ls -1 *.json *.html *.md *.ts *.sh 2>/dev/null | sed 's/^/  ├── /'
fi

echo ""
echo "========================================"
echo "📝 Next Steps:"
echo "========================================"
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Test locally:"
echo "   npm run dev"
echo ""
echo "3. Build for production:"
echo "   npm run build"
echo ""
echo "4. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "📚 For detailed instructions, see:"
echo "   • QUICKSTART.md (5-minute guide)"
echo "   • DEPLOYMENT.md (complete guide)"
echo "   • PRE_DEPLOYMENT_CHECKLIST.md (verification)"
echo ""
echo "========================================"
echo "🚀 Ready to deploy!"
echo "========================================"