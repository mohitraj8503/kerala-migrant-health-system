import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock users for authentication
const USERS = [
    { id: 1, loginId: 'admin@kerala.gov', password: 'admin', role: 'Super Admin', name: 'Dr. Arun Kumar', district: 'All' },
    { id: 2, loginId: 'wayanad@kerala.gov', password: 'district', role: 'District Admin', name: 'Dr. Priya Menon', district: 'Wayanad' },
    { id: 3, loginId: 'worker', password: 'worker', role: 'Field Worker', name: 'Rajesh K', district: 'Wayanad' },
    { id: 4, loginId: 'phc', password: 'phc', role: 'PHC Staff', name: 'Nurse Anjali', district: 'Wayanad' }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { username, password, provider } = req.body;

    // Handle social login (mock)
    if (provider === 'google' || provider === 'facebook') {
        const mockUser = USERS[0]; // Use admin for demo
        const token = Buffer.from(`${mockUser.loginId}:${Date.now()}`).toString('base64');
        return res.json({
            success: true,
            token,
            user: {
                id: mockUser.id,
                username: mockUser.loginId,
                role: mockUser.role,
                name: mockUser.name,
                district: mockUser.district,
                loginMethod: provider
            }
        });
    }

    // Handle regular login
    const user = USERS.find(u => u.loginId === username && u.password === password);

    if (user) {
        const token = Buffer.from(`${user.loginId}:${Date.now()}`).toString('base64');
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.loginId,
                role: user.role,
                name: user.name,
                district: user.district
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
}
