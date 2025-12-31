# Authentication Troubleshooting Guide

## Current Issue
Getting "Authentication failed. Please check credentials or connection." error on login.

## Quick Test - Demo Credentials

Try logging in with these credentials:

### Super Admin
- **Username:** `admin@kerala.gov`
- **Password:** `admin`

### District Admin
- **Username:** `wayanad@kerala.gov`
- **Password:** `district`

### Field Worker
- **Username:** `worker`
- **Password:** `worker`

### PHC Staff
- **Username:** `phc`
- **Password:** `phc`

## Debugging Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try logging in
4. Look for these log messages:
   - `Attempting login with API_BASE_URL: ...`
   - `Login URL: ...`
   - `Response status: ...`
   - Any error messages in red

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Try logging in
4. Look for a request to `/api/auth/login`
5. Check:
   - **Status Code:** Should be 200 for success, 401 for wrong credentials
   - **Response:** Click on the request and check the "Response" tab
   - **Headers:** Verify Content-Type is application/json

### Step 3: Common Issues and Solutions

#### Issue 1: API Endpoint Not Found (404)
**Symptoms:** Network tab shows 404 error for `/api/auth/login`

**Solution:**
- Verify `api/auth/login.ts` exists in your project
- Check `vercel.json` is properly configured
- Redeploy to Vercel

#### Issue 2: CORS Error
**Symptoms:** Console shows CORS policy error

**Solution:**
- Already configured in `api/auth/login.ts` with proper CORS headers
- If still occurring, check Vercel deployment logs

#### Issue 3: Wrong Credentials (401)
**Symptoms:** Network tab shows 401 status

**Solution:**
- Use the demo credentials listed above
- Make sure you're typing them exactly as shown (case-sensitive)

#### Issue 4: Network Error
**Symptoms:** Console shows "Network error - API endpoint may not be reachable"

**Solution:**
- Check your internet connection
- Verify Vercel deployment is successful
- Check Vercel deployment URL is accessible

## Testing Locally

To test locally before deploying:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then visit `http://localhost:5173/login` and try logging in.

## Vercel Deployment Checklist

- [ ] `api/auth/login.ts` file exists
- [ ] `vercel.json` is configured correctly
- [ ] Latest code is pushed to GitHub
- [ ] Vercel deployment is successful (check dashboard)
- [ ] No build errors in Vercel logs

## API Endpoint Structure

Your API endpoints should be accessible at:
- Production: `https://kerala-migrant-health-system.vercel.app/api/auth/login`
- Local: `http://localhost:5173/api/auth/login`

## What Was Changed

### 1. Added Comprehensive Logging
- `AuthContext.tsx` now logs all API calls and responses
- Easier to debug authentication issues

### 2. Better Error Handling
- More specific error messages
- Network error detection
- Response status checking

### 3. Updated Error Message
- Shows demo credentials in error message
- Helps users know what to try

## Next Steps

1. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Add authentication debugging and error handling"
   git push origin main
   ```

2. **Wait for Vercel deployment** (2-3 minutes)

3. **Test with demo credentials** listed above

4. **Check browser console** for detailed error logs

5. **Report back** with:
   - What you see in the console
   - What you see in the Network tab
   - The exact error message

## Still Not Working?

If authentication still fails after trying all the above:

1. Share the console logs
2. Share the network request details
3. Check Vercel deployment logs at: https://vercel.com/dashboard
4. Verify the deployment URL matches what you're testing

## Environment Variables

Make sure these are NOT needed for basic authentication (they're only for Google OAuth):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

The mock login should work without any environment variables.
