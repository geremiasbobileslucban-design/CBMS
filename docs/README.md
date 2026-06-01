# CBMS - Community-Based Monitoring System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cbms-app)

A comprehensive data-gathering and information management system for Philippine Statistics Authority (PSA) and Local Government Units (LGUs) to collect household-level socio-economic data for poverty reduction and development planning, as mandated by Republic Act No. 11315.

## 🌟 Features

### Multi-Role Support
- **PSA Administrator**: Full system access with national-level oversight
- **LGU CBMS Focal Person**: Local government unit management and coordination
- **Data Processor**: Data processing, validation, and quality control
- **Enumerator**: Field data collection and household surveys
- **Planning Officer**: Analytics, reporting, and strategic planning

### Core Functionality
- ✅ **Authentication System**: Secure login with role-based access control
- 📊 **Data Collection**: Comprehensive household survey forms
- 👥 **User Management**: Add, edit, and manage system users
- 📈 **Analytics Dashboard**: Real-time poverty indicators and statistics
- 📋 **Reports**: Generate and export compliance reports
- 🗂️ **Household Database**: Search, filter, and manage household records
- 📱 **Mobile Responsive**: Fully functional on desktop, tablet, and mobile devices

### Data Collection Coverage
- Income and employment status
- Education levels
- Health insurance coverage
- Housing type and conditions
- Access to basic services (water, electricity, internet)
- Disaster vulnerability assessment
- Automatic poverty level calculation

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cbms-app.git
   cd cbms-app
   ```

2. **Reorganize project structure** (first time only)
   ```bash
   chmod +x reorganize.sh
   ./reorganize.sh
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Default Login Credentials

Use these credentials to test different user roles:

| Role | Username | Password |
|------|----------|----------|
| PSA Administrator | `psa.admin` | `admin123` |
| LGU CBMS Focal Person | `lgu.focal` | `focal123` |
| Data Processor | `data.processor` | `processor123` |
| Enumerator | `enumerator1` | `enum123` |
| Planning Officer | `planning.officer` | `planning123` |

## 📦 Build & Deploy

### Build for Production

```bash
# Option 1: Quick build (files already organized)
npm run build

# Option 2: Full reorganization + build
npm run reorganize
npm run build
```

### Deploy to Vercel

**Quick Deploy:**
```bash
npm install
npm run build
vercel --prod
```

**⚠️ Deployment Issues?**

If you encounter build errors or chunk size warnings, we've created comprehensive fixes:

- 📖 **Quick Start**: See `QUICK_DEPLOY.md` for fastest deployment
- 🔧 **Detailed Fixes**: See `DEPLOYMENT_FIX.md` for troubleshooting
- ✅ **Verification**: Run `npm run verify` to check your setup

The following issues are now **FIXED**:
- ✅ Chunks larger than 500 kB (enhanced code splitting)
- ✅ No dist directory found (improved build configuration)
- ✅ Path resolution issues (flexible aliases)

### Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run verify` | Verify project structure before build |
| `npm run reorganize` | Move files to proper src/ structure |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
cbms-app/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── Analytics.tsx    # Analytics dashboard
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── DataCollection.tsx  # Data collection forms
│   │   ├── HouseholdList.tsx   # Household database
│   │   ├── LoginPage.tsx    # Authentication
│   │   ├── Reports.tsx      # Report generation
│   │   └── UserManagement.tsx  # User management
│   ├── context/
│   │   └── DataContext.tsx  # Global state management
│   ├── data/
│   │   ├── mockData.ts      # Sample household data
│   │   └── mockUsers.ts     # User credentials
│   ├── types/
│   │   ├── auth.ts          # Authentication types
│   │   └── cbms.ts          # CBMS data types
│   ├── styles/
│   │   └── globals.css      # Global styles
│   ├── App.tsx              # Main application
│   └── main.tsx             # Entry point
├── public/                   # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── vercel.json              # Vercel deployment config
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **State Management**: React Context API
- **Deployment**: Vercel

## 📊 CBMS Workflow

The system implements the 7-phase CBMS workflow:

1. **Planning & Preparation**: System setup and user onboarding
2. **Data Collection**: Field enumeration and household surveys
3. **Processing**: Data validation and quality control
4. **Submission**: LGU to PSA data transmission
5. **Analysis**: Statistical analysis and poverty indicators
6. **Utilization**: Report generation for planning
7. **Monitoring**: Progress tracking and updates

## 🔒 Security & Privacy

- Role-based access control (RBAC)
- Secure authentication system
- Data privacy compliant with RA 10173 (Data Privacy Act)
- Security headers configured for production
- Input validation and sanitization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for the Philippine Statistics Authority and Local Government Units under Republic Act No. 11315.

## 🆘 Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub

## 🎯 Roadmap

### Version 1.1 (Planned)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time data synchronization
- [ ] Offline data collection support
- [ ] Advanced analytics with AI insights
- [ ] PDF report generation
- [ ] Multi-language support (English/Filipino)
- [ ] GIS mapping integration
- [ ] Bulk data import/export

### Version 1.2 (Future)
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] API for third-party integrations
- [ ] Advanced user audit logging
- [ ] Automated backup system

## 📝 Changelog

### Version 1.0.0 (February 2026)
- ✅ Initial release
- ✅ Full authentication system
- ✅ User management module
- ✅ Data collection forms
- ✅ Household database
- ✅ Analytics dashboard
- ✅ Report generation
- ✅ Mobile responsive design
- ✅ Vercel deployment ready

## 🙏 Acknowledgments

- Philippine Statistics Authority (PSA)
- Local Government Units (LGUs)
- Republic Act No. 11315
- Community-Based Monitoring System stakeholders

---

**Developed for Philippine Statistics Authority**  
**Republic Act No. 11315 Implementation**  
**Version 1.0.0 | February 2026**