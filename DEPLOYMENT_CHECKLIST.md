# 🚀 Deployment Checklist for Vercel

## ✅ Pre-Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Google OAuth in Google Cloud Console

#### Add Authorized Redirect URIs:
- ✅ `https://kerala-migrant-health-system.vercel.app/api/auth/callback/google`
- ✅ `http://localhost:5173/api/auth/callback/google` (for local testing)

#### Add Authorized JavaScript Origins:
- ✅ `https://kerala-migrant-health-system.vercel.app`
- ✅ `http://localhost:5173` (for local testing)

### 3. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
GOOGLE_CLIENT_ID=47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Important**: Make sure to add these for all environments (Production, Preview, Development)

## 📦 Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Add Vercel serverless API and Google OAuth integration"
git push origin main
```

### 2. Vercel Auto-Deploy
Vercel will automatically detect the push and start deploying.

### 3. Verify Deployment
Once deployed, check:
- ✅ Frontend loads correctly
- ✅ Login page displays
- ✅ Google OAuth button works
- ✅ Regular login works with demo credentials

## 🧪 Testing After Deployment

### Test Regular Login:
| Username | Password | Expected Result |
|----------|----------|-----------------|
| `admin@kerala.gov` | `admin` | Redirect to Dashboard |
| `wayanad@kerala.gov` | `district` | Redirect to Dashboard |
| `worker` | `worker` | Redirect to Register |
| `phc` | `phc` | Redirect to Register |

### Test Google OAuth:
1. Click "Google" button
2. Should redirect to Google consent screen
3. Sign in with a test user (added in Google Console)
4. Should redirect back to app and log in successfully

## 🔧 Troubleshooting

### Issue: "Authentication failed" error
**Solution**: Backend API not responding
- Check Vercel deployment logs
- Verify API functions are deployed in `/api` directory

### Issue: "redirect_uri_mismatch" with Google OAuth
**Solution**: Redirect URI mismatch
- Verify the exact URL in Google Console matches your Vercel domain
- Check for typos or trailing slashes

### Issue: "Cannot find module '@vercel/node'"
**Solution**: Missing dependency
- Run `npm install` to install all dependencies
- Commit `package-lock.json`

### Issue: API calls return 404
**Solution**: API routes not configured
- Verify `/api` directory exists
- Check `vercel.json` configuration
- Redeploy

## 📊 Post-Deployment Verification

- [ ] Visit your deployed URL
- [ ] Test login with demo credentials
- [ ] Test Google OAuth flow
- [ ] Check browser console for errors
- [ ] Verify API endpoints respond correctly
- [ ] Test navigation between pages

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Login page loads without errors
2. ✅ Demo credentials work for authentication
3. ✅ Google OAuth redirects properly
4. ✅ Users can navigate to dashboard/register after login
5. ✅ No console errors in browser

## 📝 Notes

- The current setup uses **mock authentication** for demo purposes
- For production, you'll need to:
  - Set up a real database
  - Implement proper session management
  - Add rate limiting
  - Secure API endpoints
  - Implement proper error handling

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Deployment Logs](https://vercel.com/mohit-rajs-projects-fdf024c9/kerala-migrant-health-system)
