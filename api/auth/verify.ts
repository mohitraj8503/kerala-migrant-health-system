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

    const { token } = req.body;

    if (token) {
        try {
            const decoded = Buffer.from(token, 'base64').toString('ascii');
            const loginId = decoded.split(':')[0];
            const user = USERS.find(u => u.loginId === loginId);

            if (user) {
                return res.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.loginId,
                        role: user.role,
                        name: user.name,
                        district: user.district
                    }
                });
            }
        } catch (e) {
            return res.status(401).json({ success: false });
        }
    }

    res.status(401).json({ success: false });
}
