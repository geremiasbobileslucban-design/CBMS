# DRHMMS Application - Vercel Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18.x or higher installed
- npm or yarn package manager
- A Vercel account (free tier available at [vercel.com](https://vercel.com))
- Git installed (for Git-based deployment)

## Project Structure

The project needs to be organized with the following structure:

```
drhmms-app/
├── src/
│   ├── components/       # React components
│   ├── context/          # React Context providers
│   ├── data/             # Mock data files
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # CSS files
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── public/               # Static assets (optional)
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── vercel.json           # Vercel configuration
└── .gitignore            # Git ignore rules
```

## Step 1: Reorganize Project Files

Run the reorganization script to move files to the correct structure:

```bash
# Make the script executable
chmod +x reorganize.sh

# Run the script
./reorganize.sh
```

Or manually move files:

```bash
# Create src directory
mkdir -p src

# Move directories to src/
mv components src/
mv context src/
mv data src/
mv types src/
mv styles src/

# If App.tsx is in root, move it to src/
[ -f "App.tsx" ] && mv App.tsx src/
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Test Locally

Before deploying, test the application locally:

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:3000` to verify the application works correctly.

## Step 4: Deploy to Vercel

### Method 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   # For preview deployment
   vercel

   # For production deployment
   vercel --prod
   ```

4. Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: **drhmms-app** (or your preferred name)
   - Directory with code: **./** (press Enter)
   - Override settings? **No** (press Enter)

### Method 2: Deploy via Git Integration

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - DRHMMS application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/drhmms-app.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and click "Add New Project"

3. Import your Git repository

4. Vercel will auto-detect the Vite framework and set:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

### Method 3: Deploy via Vercel Dashboard (Drag & Drop)

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Go to [vercel.com](https://vercel.com) dashboard

3. Drag and drop the `dist` folder

Note: This method doesn't support automatic redeployments.

## Configuration

### Environment Variables

If you need environment variables:

1. Create a `.env.local` file (see `.env.example`)
2. In Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add variables (they must start with `VITE_` to be exposed to the app)

### Custom Domain

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Follow the DNS configuration instructions

## Build Optimization

The build configuration includes:

- **Code Splitting**: Vendor chunks separated for better caching
- **Tree Shaking**: Unused code eliminated
- **Minification**: JavaScript and CSS minified
- **Source Maps**: Disabled in production for smaller builds
- **Asset Optimization**: Images and static assets optimized

## Security Headers

The `vercel.json` file includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Troubleshooting

### Build Fails

1. Check all files are in the correct `src/` directory
2. Verify `package.json` dependencies are correct
3. Run `npm run build` locally to see detailed errors
4. Check Vercel build logs in the dashboard

### Blank Page After Deployment

1. Check browser console for errors
2. Verify `index.html` is in the root directory
3. Check that all imports use correct relative paths
4. Ensure `vercel.json` has correct rewrites configuration

### TypeScript Errors

1. Run `npm run lint` to check for errors
2. Fix type errors in the code
3. Ensure `tsconfig.json` is properly configured

### Assets Not Loading

1. Verify assets are in the `public/` directory
2. Check asset paths are correct (use `/asset.png` not `./asset.png`)
3. Clear Vercel cache and redeploy

## Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics in Project Settings → Analytics to monitor:
- Page views
- Performance metrics
- User behavior

### Error Tracking

Consider integrating error tracking:
- Sentry
- LogRocket
- Rollbar

## Performance Optimization

For optimal performance:

1. **Lazy Loading**: Components are loaded on demand
2. **Caching**: Static assets cached for 1 year
3. **Compression**: Gzip/Brotli compression enabled by default
4. **CDN**: Vercel's Edge Network serves assets globally

## Continuous Deployment

With Git integration, every push to your repository:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] All pages/views are accessible
- [ ] Authentication works correctly
- [ ] Forms submit successfully
- [ ] Data persists correctly
- [ ] Mobile responsiveness verified
- [ ] Test all user roles and permissions
- [ ] Check browser compatibility
- [ ] Verify security headers are applied
- [ ] Test custom domain (if configured)

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Troubleshooting Guide](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)

## Default Login Credentials

For testing after deployment, use the default credentials from `src/data/mockUsers.ts`:

**PSA Administrator:**
- Username: `psa.admin`
- Password: `admin123`

**LGU DRHMMS Focal Person:**
- Username: `lgu.focal`
- Password: `focal123`

---

**Last Updated**: February 2026
**Version**: 1.0.0
