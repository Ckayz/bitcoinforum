#!/bin/bash

echo "🚀 Preparing Bitcoin Forum for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy Bitcoin Forum to production"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No git remote found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    exit 1
fi

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push -u origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next steps for Vercel deployment:"
echo "1. Go to https://vercel.com"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "5. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
