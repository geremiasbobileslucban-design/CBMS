# 🚀 Quick Deploy Guide

## Option 1: Deploy Immediately (No Reorganization)

```bash
npm install
npm run build
vercel --prod
```

## Option 2: Clean Deployment (Recommended)

```bash
# Step 1: Reorganize files into src/ structure
npm run reorganize

# Step 2: Install dependencies
npm install

# Step 3: Build
npm run build

# Step 4: Deploy
vercel --prod
```

## Verification Commands

```bash
# Check if ready to build
npm run verify

# Test dev server
npm run dev

# Test production build locally
npm run build && npm run preview
```

## If Build Fails

```bash
# Check TypeScript errors
npx tsc --noEmit

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Common Issues & Quick Fixes

| Issue | Command |
|-------|---------|
| Missing dist folder | `npm run build` |
| Cannot find modules | `npm run reorganize` |
| Chunk size warnings | ✅ Already fixed in vite.config.ts |
| TypeScript errors | `npx tsc --noEmit` to see details |

## Success Indicators

✅ Build creates `dist/` folder
✅ `dist/index.html` exists
✅ `dist/assets/` contains JS chunks
✅ No TypeScript errors
✅ Preview works: `npm run preview`

## After Deployment

Your app will be live at: `https://your-project.vercel.app`

To update:
```bash
npm run build
vercel --prod
```

---

**Need more details?** See `DEPLOYMENT_FIX.md` or `DEPLOYMENT.md`
