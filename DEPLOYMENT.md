# 🚀 Bitcoin Forum Deployment Guide

## 📋 Prerequisites
- GitHub account
- Vercel account
- Custom domain (optional)
- Supabase project

## 🔧 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial Bitcoin Forum deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Custom Domain (Optional)
1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## 🛠️ Build Configuration
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## 🔍 Troubleshooting

### Common Issues:
1. **Build fails**: Check TypeScript errors
2. **Environment variables**: Ensure they're set in Vercel
3. **Supabase connection**: Verify URL and keys
4. **Domain issues**: Check DNS propagation

### Build Logs:
Check Vercel deployment logs for specific errors.

## 📱 Post-Deployment
1. Test all functionality
2. Check Supabase RLS policies
3. Verify authentication works
4. Test rich text editor
5. Confirm moderation features

## 🎯 Performance
- Images are unoptimized for faster builds
- Console logs removed in production
- SWC minification enabled
- Server components optimized
