# Authentication Fix - Deployment Guide

## Problem Fixed
The authentication was failing on Vercel because the frontend was trying to connect to `http://localhost:5000/api` which doesn't exist in production.

## Changes Made

### 1. **AuthContext.tsx** - Environment-Aware API Calls
- Changed from hardcoded `http://localhost:5000/api` to dynamic `API_BASE_URL`
- Uses `VITE_API_URL` environment variable if set, otherwise defaults to `/api`
- This allows the app to work in both development (with local server) and production (with Vercel serverless functions)

### 2. **vercel.json** - Fixed API Routing
- Updated rewrite rule from `"/(.*)"` to `"/((?!api).*)"`
- This prevents API routes from being rewritten to `index.html`
- API calls now properly route to serverless functions in the `/api` directory

### 3. **.env.example** - Environment Variable Template
- Added documentation for required environment variables
- Includes API URL configuration and OAuth credentials

## Deployment Steps

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix authentication - use environment-aware API endpoints"
git push origin main
```

### Step 2: Configure Vercel Environment Variables (Optional)
If you need to override the API URL in production:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add: `VITE_API_URL` = `/api` (or leave empty to use default)

**Note:** For production on Vercel, you don't need to set `VITE_API_URL` because the default `/api` will work correctly.

### Step 3: Verify Deployment
After Vercel automatically deploys your changes:
1. Visit https://kerala-migrant-health-system.vercel.app/login
2. Try logging in with test credentials:
   - **Super Admin**: `admin@kerala.gov` / `admin`
   - **District Admin**: `wayanad@kerala.gov` / `district`
   - **Field Worker**: `worker` / `worker`
   - **PHC Staff**: `phc` / `phc`

## Local Development Setup

### For Local Development (with Express server):
1. Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:5000/api
```

2. Start the backend server:
```bash
npm run server
```

3. Start the frontend (in a new terminal):
```bash
npm run dev
```

### For Testing Production Build Locally:
```bash
npm run build
npm run preview
```

## How It Works

### Development Mode
- Frontend runs on `http://localhost:5173` (Vite dev server)
- Backend runs on `http://localhost:5000` (Express server)
- `VITE_API_URL=http://localhost:5000/api` tells frontend to call the local Express server

### Production Mode (Vercel)
- Frontend is served as static files
- API calls use relative path `/api`
- Vercel routes `/api/*` to serverless functions in the `/api` directory
- No CORS issues because frontend and API are on the same domain

## Troubleshooting

### If login still fails after deployment:
1. Check browser console for errors
2. Verify the API endpoint is being called correctly (should be `/api/auth/login`, not `http://localhost:5000/api/auth/login`)
3. Check Vercel function logs for errors
4. Ensure all files in `/api` directory are deployed

### If you see CORS errors:
- The `vercel.json` headers should handle CORS
- Verify the headers are being applied in the Network tab

### If API returns 404:
- Check that the `vercel.json` rewrite rule is correct
- Verify serverless functions are in the `/api` directory
- Check Vercel deployment logs

## Test Credentials

| Role | Login ID | Password |
|------|----------|----------|
| Super Admin | admin@kerala.gov | admin |
| District Admin | wayanad@kerala.gov | district |
| Field Worker | worker | worker |
| PHC Staff | phc | phc |

## Next Steps After Fix

1. Test all authentication flows (login, logout, session persistence)
2. Test Google OAuth if configured
3. Verify all API endpoints work correctly
4. Test the complete user journey from login to dashboard
