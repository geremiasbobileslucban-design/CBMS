# CBMS - Quick Start Guide

## ⚡ Fast Track to Deployment

### Step 1: Prepare Your Project (2 minutes)

```bash
# Run the reorganization script
chmod +x reorganize.sh
./reorganize.sh

# Install dependencies
npm install
```

### Step 2: Test Locally (1 minute)

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` and login with:
- **Username**: `psa.admin`
- **Password**: `admin123`

### Step 3: Deploy to Vercel (2 minutes)

#### Option A: Quick Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

#### Option B: Deploy via Git

```bash
# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/cbms-app.git
git push -u origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Click "Deploy"

## ✅ That's It!

Your CBMS app is now live! 🎉

## 📋 Post-Deployment Checklist

- [ ] Test login with all user roles
- [ ] Add new household data
- [ ] View analytics dashboard
- [ ] Generate a report
- [ ] Test on mobile device
- [ ] Configure custom domain (optional)

## 🔗 Useful Links

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **README**: See [README.md](./README.md)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

## 🆘 Need Help?

**Build fails?**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Blank page after deployment?**
- Check browser console for errors
- Verify all files are in `src/` directory
- Review Vercel deployment logs

**Still stuck?**
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Review Vercel build logs in your dashboard

---

**Estimated Total Time**: ~5 minutes from start to deployment! ⚡
