# Deployment Instructions for Vercel

## Quick Deploy Steps:

1. **Install the new dependency:**
   ```bash
   npm install
   ```

2. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Vercel serverless API functions for authentication"
   git push
   ```

3. **Vercel will automatically redeploy** with the new API functions

## Testing After Deployment:

Once deployed, you can test the login with these credentials:

| Role | Login ID | Password |
|------|----------|----------|
| Super Admin | `admin@kerala.gov` | `admin` |
| District Admin | `wayanad@kerala.gov` | `district` |
| Field Worker | `worker` | `worker` |
| PHC Staff | `phc` | `phc` |

## How It Works:

- **Frontend**: Deployed as static site on Vercel
- **API**: Serverless functions in `/api` directory
- **Authentication**: Mock authentication (no database needed for demo)
- **CORS**: Configured to allow cross-origin requests

## API Endpoints Available:

- `POST /api/auth/login` - Login with username/password or social provider
- `POST /api/auth/verify` - Verify authentication token

## Local Development:

For local development, you still need to run the backend server:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:5000 (you'll need to start this separately)

## Environment Variables (Optional):

If you want to use a different API URL in development:
```bash
VITE_API_URL=http://localhost:5000
```

Add this to a `.env` file in the root directory.
