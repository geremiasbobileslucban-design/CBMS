#!/bin/bash

# Safe reorganization script that handles existing src/ files
echo "========================================="
echo "DRHMMS Safe Reorganization Script"
echo "========================================="
echo ""

# Function to safely move directory
safe_move_dir() {
    local src_dir=$1
    local dest_dir=$2
    
    if [ -d "$src_dir" ]; then
        if [ -d "$dest_dir" ]; then
            echo "  ⚠️  Both /$src_dir and /src/$src_dir exist. Removing root version..."
            rm -rf "$src_dir"
        else
            echo "  ✓ Moving $src_dir/ to src/$src_dir/"
            mv "$src_dir" "src/"
        fi
    elif [ ! -d "$dest_dir" ]; then
        echo "  ⚠️  Neither /$src_dir nor /src/$src_dir found!"
    else
        echo "  ✓ src/$src_dir/ already in place"
    fi
}

# Function to safely move file
safe_move_file() {
    local src_file=$1
    local dest_file=$2
    
    if [ -f "$src_file" ]; then
        if [ -f "$dest_file" ]; then
            echo "  ⚠️  Both /$src_file and /src/$src_file exist. Removing root version..."
            rm -f "$src_file"
        else
            echo "  ✓ Moving $src_file to src/$src_file"
            mv "$src_file" "src/"
        fi
    elif [ ! -f "$dest_file" ]; then
        echo "  ⚠️  Neither /$src_file nor /src/$src_file found!"
    else
        echo "  ✓ src/$src_file already in place"
    fi
}

# Create src directory if needed
mkdir -p src

echo "📁 Organizing project structure..."
echo ""

# Move directories
safe_move_dir "components" "src/components"
safe_move_dir "context" "src/context"
safe_move_dir "data" "src/data"
safe_move_dir "types" "src/types"
safe_move_dir "styles" "src/styles"

echo ""
echo "📄 Organizing files..."
safe_move_file "App.tsx" "src/App.tsx"

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "📋 Verifying structure..."

# Verify critical files exist
errors=0

if [ ! -f "src/main.tsx" ]; then
    echo "❌ ERROR: src/main.tsx not found!"
    errors=$((errors + 1))
fi

if [ ! -f "src/App.tsx" ]; then
    echo "❌ ERROR: src/App.tsx not found!"
    errors=$((errors + 1))
fi

if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found in root!"
    errors=$((errors + 1))
fi

if [ ! -d "src/components" ]; then
    echo "❌ ERROR: src/components/ directory not found!"
    errors=$((errors + 1))
fi

if [ $errors -eq 0 ]; then
    echo "✅ All critical files verified!"
    echo ""
    echo "🚀 Ready to build! Run: npm run build"
else
    echo ""
    echo "⚠️  Found $errors error(s). Please fix before building."
    exit 1
fi
