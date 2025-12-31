# QUICK FIX - Google OAuth Error

## The Problem
Your current deployment URL is:
```
https://kerala-migrant-health-system-8h52ktyg9.vercel.app
```

But Google OAuth doesn't have this URL registered as an authorized redirect URI.

## IMMEDIATE FIX (Do This Now!)

### Step 1: Add Your Current Deployment URL to Google Cloud Console

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. **Click on:** `47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com`
3. **In "Authorized redirect URIs", ADD:**
   ```
   https://kerala-migrant-health-system-8h52ktyg9.vercel.app/api/auth/callback/google
   ```

4. **In "Authorized JavaScript origins", ADD:**
   ```
   https://kerala-migrant-health-system-8h52ktyg9.vercel.app
   ```

5. **Click SAVE**
6. **Wait 5 minutes** for changes to propagate

### Step 2: Test Again

After 5 minutes, try signing in with Google again at:
```
https://kerala-migrant-health-system-8h52ktyg9.vercel.app/login
```

It should work now! ✅

---

## LONG-TERM FIX (Do This After Testing)

The issue is that Vercel creates a new URL for each deployment. To avoid this problem in the future:

### Option 1: Use Production Domain Only (Recommended)

Add these URIs to Google Cloud Console and keep them:
```
https://kerala-migrant-health-system.vercel.app/api/auth/callback/google
http://localhost:5173/api/auth/callback/google
```

Then configure your Vercel project to always use the production domain for OAuth (I can help you with this).

### Option 2: Add All Deployment URLs

Every time you deploy, check the Vercel deployment URL and add it to Google Cloud Console. This is tedious but works.

---

## Current Status

✅ Code has been updated to use `VERCEL_URL` environment variable  
⏳ Waiting for you to add the deployment URL to Google Cloud Console  
⏳ Waiting for you to test after 5 minutes  

## Need Help?

If you're still stuck after following these steps, let me know!
