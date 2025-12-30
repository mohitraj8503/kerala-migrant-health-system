import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ success: false, message: 'No authorization code provided' });
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '47982363352-iqcmml15sbjh1n5d114839p6r4pnbrr6.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
    const REDIRECT_URI = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/auth/callback/google`
        : 'http://localhost:5173/api/auth/callback/google';

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code as string,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            return res.status(400).json({ success: false, message: 'Failed to get access token' });
        }

        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        const userInfo = await userInfoResponse.json();

        // Create session token
        const sessionToken = Buffer.from(`google:${userInfo.email}:${Date.now()}`).toString('base64');

        // Mock user data (in production, save to database)
        const user = {
            id: userInfo.id,
            username: userInfo.email,
            name: userInfo.name,
            role: 'Field Worker', // Default role for Google sign-in
            district: 'All',
            profilePicture: userInfo.picture,
            loginMethod: 'google'
        };

        // Redirect back to frontend with token
        const frontendUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:5173';

        res.redirect(`${frontendUrl}?token=${sessionToken}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ success: false, message: 'OAuth authentication failed' });
    }
}
