# ✅ CBMS Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checks

### 1. Environment Setup
- [ ] Node.js 18.x or higher installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git initialized (if using Git deployment)
- [ ] Vercel CLI installed (`npm i -g vercel`) or using Vercel dashboard

### 2. Project Structure
- [ ] Run `npm run verify` - all checks pass ✅
- [ ] Files organized (run `npm run reorganize` if needed)
- [ ] `src/main.tsx` exists
- [ ] `src/App.tsx` exists (or `App.tsx` in root)
- [ ] `index.html` exists in root
- [ ] `vercel.json` exists in root

### 3. Dependencies
- [ ] Run `npm install` - no errors
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` exists

### 4. Configuration Files
- [ ] `vite.config.ts` - ✅ Enhanced with code splitting
- [ ] `tsconfig.json` - exists
- [ ] `vercel.json` - configured correctly
- [ ] `.gitignore` - configured

## Build Verification

### 5. Local Build Test
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] TypeScript compilation successful
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` contains JS chunks
- [ ] No chunk size warnings (or acceptable warnings)

### 6. Build Output Inspection
Check that `dist/assets/` contains:
- [ ] `index-[hash].js` (main app)
- [ ] `react-vendor-[hash].js` (React core)
- [ ] `radix-*-[hash].js` (UI components)
- [ ] `charts-[hash].js` (if using analytics)
- [ ] `icons-[hash].js` (Lucide icons)
- [ ] `*.css` files

### 7. Local Preview Test
```bash
npm run preview
```
- [ ] Preview server starts successfully
- [ ] App loads at `http://localhost:4173`
- [ ] Login page displays correctly
- [ ] Can log in with test credentials
- [ ] Navigation works
- [ ] Components render properly
- [ ] No console errors

## Deployment Steps

### 8. Initial Deployment

#### Option A: Vercel CLI
```bash
vercel
```
- [ ] Vercel CLI prompts appear
- [ ] Project linked/created
- [ ] Build succeeds on Vercel
- [ ] Preview URL provided
- [ ] Preview URL works

#### Option B: Vercel Dashboard
- [ ] New project created in Vercel
- [ ] Repository connected (GitHub/GitLab)
- [ ] Build settings configured:
  - Framework Preset: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Deploy initiated
- [ ] Build succeeds
- [ ] Preview URL works

### 9. Production Deployment
```bash
vercel --prod
```
- [ ] Production build starts
- [ ] Build completes successfully
- [ ] Production URL provided
- [ ] Production URL loads correctly

## Post-Deployment Verification

### 10. Functionality Testing
- [ ] Production site loads
- [ ] Login page displays
- [ ] Can log in as PSA Administrator
- [ ] Dashboard displays correctly
- [ ] Navigation menu works
- [ ] All main views accessible:
  - [ ] Dashboard
  - [ ] Data Collection
  - [ ] Households
  - [ ] Analytics
  - [ ] Reports
  - [ ] User Management

### 11. Responsive Design
- [ ] Desktop view works (1920x1080)
- [ ] Tablet view works (768x1024)
- [ ] Mobile view works (375x667)
- [ ] Mobile menu toggles correctly

### 12. Performance
- [ ] Page load time < 3 seconds
- [ ] No JavaScript errors in console
- [ ] All assets load correctly
- [ ] Images display properly
- [ ] Charts render (if viewing Analytics)

### 13. Browser Testing
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Common Issues & Solutions

### ❌ Build Failed: "Cannot find module"
**Solution:**
```bash
npm run reorganize
npm run verify
npm run build
```

### ❌ "No Output Directory named 'dist'"
**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clean build
rm -rf dist
npm run build
```

### ❌ Chunk Size Warnings
**Status:** ✅ Already fixed in `vite.config.ts`

If you still see warnings, they're informational only.

### ❌ Build Succeeds Locally but Fails on Vercel
**Solution:**
- Check Node version in Vercel (should be 18.x or 20.x)
- Verify all dependencies in `package.json`
- Check build logs for specific errors
- Ensure case-sensitive imports match

## Environment Variables (Future)

When you add environment variables:
- [ ] Variables added in Vercel dashboard
- [ ] Variables prefixed with `VITE_` for client-side
- [ ] `.env.example` created for documentation
- [ ] `.env` added to `.gitignore`

## Domain Configuration (Optional)

If setting up custom domain:
- [ ] Domain added in Vercel project settings
- [ ] DNS configured (A/CNAME records)
- [ ] SSL certificate issued automatically
- [ ] Domain works with https://

## Git Integration (Recommended)

If using Git-based deployment:
- [ ] Repository pushed to GitHub/GitLab
- [ ] Vercel connected to repository
- [ ] Automatic deployments enabled
- [ ] Branch deployments configured
- [ ] Production branch set (usually `main`)

## Documentation

- [ ] `README.md` reviewed and updated
- [ ] `DEPLOYMENT_FIX.md` read
- [ ] `QUICK_DEPLOY.md` bookmarked
- [ ] Team members notified of deployment

## Backup & Rollback

- [ ] Previous version tagged (if applicable)
- [ ] Rollback process understood
- [ ] Vercel deployment history checked

## Success Criteria

### ✅ Deployment is successful when:

1. ✅ `npm run build` completes without errors
2. ✅ `dist/` folder created with all assets
3. ✅ Vercel deployment succeeds
4. ✅ Production URL loads the application
5. ✅ Can log in and navigate the app
6. ✅ All main features work correctly
7. ✅ No console errors
8. ✅ Responsive on all devices

## Next Steps After Deployment

### Immediate
- [ ] Test all user roles
- [ ] Verify all data collection forms
- [ ] Check analytics calculations
- [ ] Test report generation

### Short-term
- [ ] Monitor Vercel analytics
- [ ] Set up error tracking (optional)
- [ ] Configure automatic deployments
- [ ] Document deployment process for team

### Long-term
- [ ] Plan database integration
- [ ] Schedule regular updates
- [ ] Gather user feedback
- [ ] Plan feature enhancements

## Support Resources

- **Quick Deploy**: `QUICK_DEPLOY.md`
- **Detailed Fixes**: `DEPLOYMENT_FIX.md`
- **Full Guide**: `DEPLOYMENT.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev

## Sign-off

- [ ] Deployment tested by: _______________
- [ ] Date deployed: _______________
- [ ] Production URL: _______________
- [ ] Team notified: _______________
- [ ] Documentation updated: _______________

---

**🎉 Congratulations on your deployment!**

If you checked all items above, your CBMS application is successfully deployed and ready for use!
