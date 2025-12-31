"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
    // Construct redirect URI dynamically based on environment
    // VERCEL_URL is set automatically by Vercel and includes the deployment-specific URL
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'production'
            ? 'https://kerala-migrant-health-system.vercel.app'
            : 'http://localhost:5173';
    const REDIRECT_URI = `${baseUrl}/api/auth/callback/google`;
    // Initiate Google OAuth flow
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    res.json({
        success: true,
        authUrl: googleAuthUrl.toString(),
        redirectUri: REDIRECT_URI
    });
}
