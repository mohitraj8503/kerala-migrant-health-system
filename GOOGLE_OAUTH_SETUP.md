# Google OAuth Configuration

## Environment Variables

Add these to your Vercel project settings:

```
GOOGLE_CLIENT_ID=47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## Google Cloud Console Setup

### 1. Authorized Redirect URIs

Add these URIs in your Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:

#### Production (Vercel):
```
https://kerala-migrant-health-system.vercel.app/api/auth/callback/google
https://your-custom-domain.vercel.app/api/auth/callback/google
```

#### Development (Local):
```
http://localhost:5173/api/auth/callback/google
http://localhost:5000/api/auth/callback/google
```

### 2. Authorized JavaScript Origins

Add these origins:

#### Production:
```
https://kerala-migrant-health-system.vercel.app
https://your-custom-domain.vercel.app
```

#### Development:
```
http://localhost:5173
http://localhost:5000
```

### 3. OAuth Consent Screen

Make sure your OAuth consent screen is configured with:
- **App name**: Kerala Digital Health System
- **User support email**: Your email
- **App logo**: (Optional) Upload your app logo
- **Authorized domains**: vercel.app (and your custom domain if any)
- **Scopes**: 
  - `openid`
  - `email`
  - `profile`

### 4. Test Users

While in "Testing" mode, add test users who can sign in:
- Add the email addresses of users who should be able to test the OAuth flow

## How It Works

1. User clicks "Google" button on login page
2. Frontend calls `/api/auth/google` to get OAuth URL
3. User is redirected to Google's consent screen
4. After approval, Google redirects to `/api/auth/callback/google`
5. Backend exchanges code for tokens and user info
6. User is redirected back to frontend with session token
7. Frontend stores token and navigates to appropriate page

## Security Notes

- **Never commit** the client secret to git
- Store secrets in Vercel environment variables
- Use HTTPS in production
- Implement proper session management in production
- Add rate limiting to prevent abuse

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Console exactly matches what's being sent
- Check for trailing slashes
- Verify the domain is correct

### "access_denied" error
- User is not in the test users list (if app is in testing mode)
- User declined the consent screen

### "invalid_client" error
- Client ID or secret is incorrect
- Check environment variables in Vercel
