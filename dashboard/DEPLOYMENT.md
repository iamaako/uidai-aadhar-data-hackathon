# UIDAI Analytics Dashboard - Deployment Guide

## 🚀 Netlify Deployment

### Prerequisites
- GitHub account
- Netlify account (free)

### Steps to Deploy:

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect Next.js settings
   - Click "Deploy site"

3. **Build Settings** (Auto-configured via netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

### Environment Variables (if needed):
- No environment variables required for this project
- All data is loaded from static JSON files in `/public`

### Custom Domain (Optional):
- Go to Site settings → Domain management
- Add your custom domain
- Follow DNS configuration steps

---

## 💻 Local Development

### Run locally:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Pages:
- `/` - Main Dashboard
- `/security` - Border Security Alerts
- `/scheme-rush` - Scheme Rush Detector

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🔧 Tech Stack
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Maps**: D3.js
- **Animations**: Framer Motion

---

## 📝 Notes
- The app works on both localhost and Netlify without any code changes
- All data files must be in `/public` directory
- Static export compatible
- No server-side APIs required

---

## 🐛 Troubleshooting

### Build fails on Netlify:
1. Check Node version is 18+
2. Ensure all dependencies are in `package.json`
3. Clear cache and retry deployment

### Data not loading:
1. Verify JSON files are in `/public/processed_json_monthly/`
2. Check file paths are correct
3. Ensure files are committed to git

---

## 📞 Support
For issues, check the Netlify build logs for detailed error messages.
