# Fixing Google OAuth `redirect_uri_mismatch` Error

## Problem
You're seeing: **"Error 400: redirect_uri_mismatch"** when trying to sign in with Google.

This happens because the redirect URI in your Google Cloud Console doesn't match the one your application is using.

## Solution

### Understanding the Issue

Vercel creates **deployment-specific URLs** for each deployment, like:
- `https://kerala-migrant-health-system-8h52ktyg9.vercel.app` (preview/deployment URL)
- `https://kerala-migrant-health-system.vercel.app` (production URL)

The hash (`8h52ktyg9`) changes with each deployment, so we need to configure Google OAuth to accept **all** Vercel deployment URLs.

### Step 1: Update Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project (or the project containing your OAuth credentials)

2. **Find Your OAuth 2.0 Client ID:**
   - Look for the client ID: `47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com`
   - Click on it to edit

3. **Update Authorized Redirect URIs:**
   
   ⚠️ **Important:** Google OAuth **does NOT support wildcards** in redirect URIs. You have two options:

   **Option A: Add Multiple Redirect URIs (Recommended)**
   
   Add these specific URIs:
   ```
   https://kerala-migrant-health-system.vercel.app/api/auth/callback/google
   https://kerala-migrant-health-system-8h52ktyg9.vercel.app/api/auth/callback/google
   http://localhost:5173/api/auth/callback/google
   ```
   
   **Note:** You'll need to add a new URI for each Vercel deployment URL. Check your current deployment URL in Vercel dashboard.

   **Option B: Use Only Production Domain (Simpler)**
   
   Configure Vercel to only use the production domain for OAuth:
   ```
   https://kerala-migrant-health-system.vercel.app/api/auth/callback/google
   http://localhost:5173/api/auth/callback/google
   ```
   
   Then set a custom environment variable in Vercel (see Step 3 below).

4. **Update Authorized JavaScript Origins:**
   - In the "Authorized JavaScript origins" section, add:
   
   ```
   https://kerala-migrant-health-system.vercel.app
   https://kerala-migrant-health-system-8h52ktyg9.vercel.app
   http://localhost:5173
   ```

5. **Save Changes:**
   - Click the **"SAVE"** button at the bottom
   - Wait a few minutes for changes to propagate (usually 5-10 minutes)

### Step 2: Deploy Updated Code to Vercel

The code has been updated to use `VERCEL_URL` environment variable which automatically adapts to the deployment URL. Deploy these changes:

```bash
git add .
git commit -m "Fix Google OAuth redirect_uri_mismatch error"
git push origin main
```

Vercel will automatically deploy the changes.

### Step 3: Configure Vercel to Use Production URL (Optional but Recommended)

To avoid having to add every deployment URL to Google Cloud Console, you can force Vercel to always use the production URL:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `kerala-migrant-health-system`
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_PRODUCTION_URL`
   - **Value:** `https://kerala-migrant-health-system.vercel.app`
   - **Environment:** Production, Preview, Development (check all)

5. **Redeploy** your application for changes to take effect

Then update the code to use this variable (I can do this for you if needed).

### Step 4: Verify Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `kerala-migrant-health-system`
3. Go to **Settings** → **Environment Variables**
4. Ensure these variables are set:

Ensure these variables are set:
   - `GOOGLE_CLIENT_ID`: `47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `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`

### Step 5: Test the Fix

1. Wait 5-10 minutes after saving changes in Google Cloud Console
2. Visit your Vercel deployment URL (check Vercel dashboard for the exact URL)
3. Click "Sign in with Google"
4. You should now be redirected properly without the error

**Important:** If you're testing a preview deployment, make sure you've added that specific deployment URL to Google Cloud Console redirect URIs.

## What Was Changed in the Code

### Before:
```typescript
const REDIRECT_URI = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/auth/callback/google`
    : 'http://localhost:5173/api/auth/callback/google';
```

**Problem:** `VERCEL_URL` can vary between deployments and preview builds, causing mismatches.

### After:
```typescript
const REDIRECT_URI = process.env.NODE_ENV === 'production'
    ? 'https://kerala-migrant-health-system.vercel.app/api/auth/callback/google'
    : 'http://localhost:5173/api/auth/callback/google';
```

**Solution:** Use a fixed production URL that matches what's configured in Google Cloud Console.

## Common Issues

### Issue 1: Still Getting the Error After Changes
- **Wait:** Google Cloud Console changes can take 5-10 minutes to propagate
- **Clear Cache:** Clear your browser cache and cookies
- **Check URL:** Make sure you're using the exact production URL

### Issue 2: Works Locally but Not on Vercel
- **Check Environment Variables:** Ensure `NODE_ENV` is set to `production` in Vercel
- **Verify Deployment:** Make sure the latest code is deployed (check commit hash)

### Issue 3: Different Vercel URL
If your Vercel URL is different from `kerala-migrant-health-system.vercel.app`:
1. Update the redirect URI in both files:
   - `api/auth/google.ts` (line 22)
   - `api/auth/callback/google.ts` (line 15)
2. Update the redirect URI in Google Cloud Console to match
3. Redeploy to Vercel

## Security Note

⚠️ **Important:** Your Google Client Secret is currently hardcoded in the files. For better security:
1. Remove the hardcoded values from the code
2. Set them as environment variables in Vercel only
3. Never commit secrets to Git

To do this, update both files to:
```typescript
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing Google OAuth credentials');
}
```

## Need Help?

If you're still experiencing issues:
1. Check the browser console for error messages
2. Check Vercel deployment logs
3. Verify the exact redirect URI being used in the error message
4. Ensure it matches exactly what's in Google Cloud Console
