# Vercel Serverless API Functions

This directory contains serverless functions that run on Vercel.

## Structure:

```
/api
  /auth
    login.ts    - Handles user authentication
    verify.ts   - Verifies JWT tokens
```

## How Vercel Serverless Functions Work:

Each `.ts` file in the `/api` directory becomes an API endpoint:
- `/api/auth/login.ts` → `https://your-app.vercel.app/api/auth/login`
- `/api/auth/verify.ts` → `https://your-app.vercel.app/api/auth/verify`

## Authentication:

Currently using **mock authentication** with hardcoded users for demo purposes.

### Demo Users:
- `admin@kerala.gov` / `admin` - Super Admin
- `wayanad@kerala.gov` / `district` - District Admin  
- `worker` / `worker` - Field Worker
- `phc` / `phc` - PHC Staff

## Adding More Endpoints:

To add a new endpoint, create a new file in this directory:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Your logic here
    res.json({ success: true, data: 'Hello World' });
}
```

## Production Considerations:

For production deployment, you should:
1. Replace mock authentication with real database
2. Implement proper JWT token generation
3. Add rate limiting
4. Use environment variables for secrets
5. Implement proper error handling
