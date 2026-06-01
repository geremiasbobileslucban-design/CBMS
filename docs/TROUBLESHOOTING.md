# CBMS Troubleshooting Guide

Common issues and solutions for deploying and running the CBMS application.

## 🔍 Quick Diagnostic

Run these commands first to identify the issue:

```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Check npm version
npm --version

# Check if dependencies are installed
ls node_modules 2>/dev/null | wc -l

# Try a clean build
rm -rf node_modules dist
npm install
npm run build
```

---

## 🚫 Common Errors

### 1. "Module not found" or "Cannot find module"

**Symptoms:**
```
Error: Cannot find module './components/Dashboard'
```

**Causes:**
- Files not in the correct directory structure
- Import paths are incorrect
- File extensions missing

**Solutions:**

```bash
# 1. Run the reorganization script
chmod +x reorganize.sh
./reorganize.sh

# 2. Verify src structure
ls -R src/

# 3. Check that main.tsx and App.tsx are in src/
ls src/App.tsx src/main.tsx
```

Make sure all imports use correct relative paths:
```typescript
// Correct
import { Dashboard } from './components/Dashboard';

// Incorrect
import { Dashboard } from '../components/Dashboard';
```

---

### 2. "npm install" fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# If still fails, try
npm install --force
```

---

### 3. TypeScript errors during build

**Symptoms:**
```
error TS2307: Cannot find module './types/auth' or its corresponding type declarations
```

**Solutions:**

```bash
# 1. Check tsconfig.json exists
cat tsconfig.json

# 2. Verify all type files are in src/types/
ls src/types/

# 3. Clean build
rm -rf dist
npx tsc --noEmit

# 4. If specific file missing, check import path
# Change:
import { User } from './types/auth';
# To:
import { User } from './types/auth.ts';
```

---

### 4. Vercel build fails

**Symptoms:**
- Build succeeds locally but fails on Vercel
- "Build exceeded maximum duration"
- "Out of memory"

**Solutions:**

**Check Build Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on failed deployment
3. Read the build logs for specific errors

**Common Fixes:**

```bash
# Ensure vercel.json is correct
cat vercel.json

# Check package.json scripts
cat package.json | grep -A 5 "scripts"

# Verify output directory
npm run build
ls dist/
```

**Vercel Settings:**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js Version: **18.x**

---

### 5. Blank page after deployment

**Symptoms:**
- Deployment succeeds
- Page loads but shows blank screen
- No error message visible

**Solutions:**

**1. Check Browser Console:**
- Open browser Developer Tools (F12)
- Look for JavaScript errors in Console tab
- Look for failed network requests in Network tab

**2. Common Causes:**

```bash
# Verify index.html exists
cat index.html

# Check main.tsx entry point
cat src/main.tsx

# Ensure App.tsx has default export
cat src/App.tsx | grep "export default"

# Verify public assets
ls public/
```

**3. Check vercel.json routing:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 6. Styles not loading

**Symptoms:**
- Page loads but has no styling
- Elements are visible but unstyled
- Tailwind classes not working

**Solutions:**

```bash
# 1. Check globals.css exists
ls src/styles/globals.css

# 2. Verify it's imported in main.tsx
grep "globals.css" src/main.tsx

# 3. Check vite.config.ts has Tailwind plugin
grep "tailwindcss" vite.config.ts

# 4. Rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

### 7. Environment variables not working

**Symptoms:**
```
undefined is not a valid environment variable
```

**Solutions:**

**In Vercel:**
1. Go to Project Settings → Environment Variables
2. Add variables with `VITE_` prefix
3. Redeploy application

**Locally:**
```bash
# Create .env.local
cp .env.example .env.local

# Edit values
nano .env.local

# Variables must start with VITE_
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_key_here

# Access in code:
const apiUrl = import.meta.env.VITE_API_URL;
```

---

### 8. Port 3000 already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3001

# Option 3: Find and kill process
ps aux | grep node
kill -9 <PID>
```

---

### 9. "Cannot find module 'vite'"

**Symptoms:**
```
Error: Cannot find module 'vite'
```

**Solutions:**

```bash
# 1. Install dependencies
npm install

# 2. If still fails, check package.json
cat package.json | grep vite

# 3. Install vite specifically
npm install -D vite @vitejs/plugin-react

# 4. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### 10. Images/assets not loading

**Symptoms:**
- 404 errors for images
- Icons not displaying
- SVG files missing

**Solutions:**

```bash
# 1. Check public directory
ls public/

# 2. Verify asset paths (use absolute paths)
# Correct:
<img src="/logo.png" alt="Logo" />

# Incorrect:
<img src="./logo.png" alt="Logo" />

# 3. For Lucide icons, check import
grep "lucide-react" src/App.tsx

# 4. Rebuild
npm run build
```

---

## 🔧 Advanced Troubleshooting

### Clear Everything and Start Fresh

```bash
# Nuclear option - fresh start
rm -rf node_modules dist package-lock.json
npm cache clean --force
npm install
npm run build
npm run dev
```

### Check for Conflicting Dependencies

```bash
# Check for peer dependency issues
npm ls

# Update all dependencies (careful!)
npm update

# Check for outdated packages
npm outdated
```

### Verify File Structure

```bash
# Expected structure
tree -I 'node_modules|dist' -L 2

# Should show:
# .
# ├── src/
# │   ├── components/
# │   ├── context/
# │   ├── data/
# │   ├── types/
# │   ├── styles/
# │   ├── App.tsx
# │   └── main.tsx
# ├── public/
# ├── index.html
# ├── package.json
# ├── vite.config.ts
# └── tsconfig.json
```

---

## 🐛 Debugging Tips

### Enable Verbose Logging

```bash
# Build with verbose output
npm run build -- --debug

# Run dev server with debug
DEBUG=vite:* npm run dev
```

### Test Production Build Locally

```bash
# Build for production
npm run build

# Test production build
npm run preview

# Check what's in dist/
ls -lah dist/
```

### Check Network Requests

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for:
   - Failed requests (red)
   - 404 errors
   - CORS errors
   - Slow requests

### Verify TypeScript Compilation

```bash
# Compile without emitting files
npx tsc --noEmit

# Check for type errors
npm run lint
```

---

## 📞 Getting Help

### Still Stuck?

1. **Check Deployment Logs**
   - Vercel Dashboard → Deployments → Build Logs

2. **Review Documentation**
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [QUICKSTART.md](./QUICKSTART.md)
   - [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

3. **Common Resources**
   - [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
   - [Vercel Docs](https://vercel.com/docs)
   - [React Docs](https://react.dev)

4. **Debug Information to Collect**
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - OS: `uname -a` (macOS/Linux) or `systeminfo` (Windows)
   - Error messages (full stack trace)
   - Build logs from Vercel
   - Browser console errors (screenshot)

---

## ✅ Prevention Checklist

To avoid common issues:

- [ ] Always run `reorganize.sh` on fresh clones
- [ ] Use Node.js 18.x or higher
- [ ] Keep dependencies updated
- [ ] Test builds locally before deploying
- [ ] Use `npm run preview` to test production builds
- [ ] Check browser console for errors
- [ ] Read Vercel build logs carefully
- [ ] Use absolute paths for assets in `public/`
- [ ] Prefix environment variables with `VITE_`
- [ ] Clear cache when switching branches

---

**Last Updated**: February 2026
**Version**: 1.0.0
