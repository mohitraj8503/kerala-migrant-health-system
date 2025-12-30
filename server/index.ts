import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import QRCode from 'qrcode';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const app = express();
app.use(cors());
app.use(express.json());

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Configure Multer for Local Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Database Helpers
function query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Mock SMS
const sendSMS = (mobile: string, message: string) => {
    console.log(`[SMS to ${mobile}]: ${message}`);
};

// MOCK USERS & AUTHENTICATION
const USERS = [
    { id: 1, loginId: 'admin@kerala.gov', password: 'admin', role: 'Super Admin', name: 'Dr. Arun Kumar', district: 'All' },
    { id: 2, loginId: 'wayanad@kerala.gov', password: 'district', role: 'District Admin', name: 'Dr. Priya Menon', district: 'Wayanad' },
    { id: 3, loginId: 'worker', password: 'worker', role: 'Field Worker', name: 'Rajesh K', district: 'Wayanad' },
    { id: 4, loginId: 'phc', password: 'phc', role: 'PHC Staff', name: 'Nurse Anjali', district: 'Wayanad' }
];

// --- API ENDPOINTS ---

// 0. AUTHENTICATION
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Check against loginId OR email if convenient, but STRICT request said Login ID.
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
});

app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    if (token) {
        try {
            const decoded = Buffer.from(token, 'base64').toString('ascii');
            const loginId = decoded.split(':')[0];
            const user = USERS.find(u => u.loginId === loginId);
            if (user) {
                res.json({
                    success: true, user: {
                        id: user.id,
                        username: user.loginId,
                        role: user.role,
                        name: user.name,
                        district: user.district
                    }
                });
                return;
            }
        } catch (e) { }
        res.status(401).json({ success: false });
    } else {
        res.status(401).json({ success: false });
    }
});

// 1. GET /api/patients (List)
app.get('/api/patients', async (req, res) => {
    try {
        const { search, location, disease, role, userLocation, page = 1, limit = 20 } = req.query as any;
        const offset = (Number(page) - 1) * Number(limit);
        const params: any[] = [];

        let sql = `
            SELECT 
                p.*,
                COALESCE((SELECT COUNT(*) FROM health_conditions hc WHERE hc.patient_id = p.id AND hc.is_active = 1), 0) as conditions_count,
                COALESCE((SELECT COUNT(*) FROM vaccinations v WHERE v.patient_id = p.id AND v.status = 'Completed'), 0) as vaccines_completed
            FROM patients p
            WHERE p.is_active = 1
        `;

        if (search) {
            sql += ` AND (p.full_name LIKE ? OR p.patient_id LIKE ? OR p.mobile LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (location && location !== 'All Districts' && location !== 'All Locations') {
            sql += ` AND p.current_location = ?`;
            params.push(location);
        }

        if (disease && disease !== 'All Diseases') {
            sql += ` AND EXISTS (SELECT 1 FROM health_conditions hc WHERE hc.patient_id = p.id AND hc.condition_name LIKE ?)`;
            params.push(`%${disease}%`);
        }

        // Role-based partitioning
        if (role === 'DISTRICT_ADMIN' && userLocation && userLocation !== 'All') {
            sql += ` AND p.current_location = ?`;
            params.push(userLocation);
        } else if (role === 'FIELD_WORKER' && userLocation && userLocation !== 'All') {
            sql += ` AND p.current_location = ?`;
            params.push(userLocation);
        }

        sql += ` ORDER BY p.registered_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const patients = await query(sql, params);
        const countRes = await get(`SELECT COUNT(*) as total FROM patients WHERE is_active = 1`);

        res.json({
            success: true,
            data: {
                patients,
                total: countRes.total,
                page: Number(page),
                totalPages: Math.ceil(countRes.total / Number(limit))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. GET /api/patients/:id (Detailed Profile for Overview)
app.get('/api/patients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Search by internal ID first, if nan search by patient_id string
        let patient;
        if (!isNaN(Number(id))) {
            patient = await get(`SELECT * FROM patients WHERE id = ?`, [id]);
        }
        if (!patient) {
            patient = await get(`SELECT * FROM patients WHERE patient_id = ?`, [id]);
        }

        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const conditions = await query(`SELECT * FROM health_conditions WHERE patient_id = ?`, [patient.id]);
        const schemes = await query(`SELECT * FROM patient_schemes WHERE patient_id = ?`, [patient.id]);
        // Quick summary counts
        const visits = await query(`SELECT id, visit_date, diagnosis, facility FROM patient_visits WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 5`, [patient.id]);
        const vaccinations = await query(`SELECT * FROM vaccinations WHERE patient_id = ?`, [patient.id]);

        res.json({
            success: true,
            data: {
                ...patient,
                health_conditions: conditions,
                vaccinations,
                schemes,
                visits
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. VISIT MANAGEMENT

// GET Visits
app.get('/api/patients/:patientId/visits', async (req, res) => {
    try {
        const { patientId } = req.params;
        const visits = await query(`SELECT * FROM patient_visits WHERE patient_id = ? ORDER BY visit_date DESC`, [patientId]);

        // Attach attachments
        for (const visit of visits) {
            visit.attachments = await query(`SELECT * FROM visit_attachments WHERE visit_id = ?`, [visit.id]);
            // Parse vitals if string
            if (typeof visit.vitals === 'string') {
                try { visit.vitals = JSON.parse(visit.vitals); } catch (e) { }
            }
        }

        res.json({ success: true, data: { visits } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching visits' });
    }
});

// POST Add Visit
app.post('/api/patients/:patientId/visits', upload.array('attachments'), async (req, res) => {
    try {
        const { patientId } = req.params;
        const {
            visitDate, facility, chiefComplaint, vitals, diagnosis,
            treatmentNotes, followUpRequired, followUpDate
        } = req.body;

        const result = await run(`
            INSERT INTO patient_visits (
                patient_id, visit_date, facility, chief_complaint,
                vitals, diagnosis, treatment_notes,
                follow_up_required, follow_up_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            patientId, visitDate, facility, chiefComplaint,
            vitals, diagnosis, treatmentNotes,
            followUpRequired === 'true' ? 1 : 0, followUpDate
        ]);

        const visitId = result.lastID;

        // Handle Attachments
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const fileUrl = `http://localhost:5000/uploads/${file.filename}`;
                await run(`
                    INSERT INTO visit_attachments (visit_id, filename, file_type, file_url, file_size)
                    VALUES (?, ?, ?, ?, ?)
                `, [visitId, file.originalname, file.mimetype, fileUrl, file.size]);
            }
        }

        const newVisit = await get(`SELECT * FROM patient_visits WHERE id = ?`, [visitId]);
        // Parse vitals for response
        if (typeof newVisit.vitals === 'string') {
            try { newVisit.vitals = JSON.parse(newVisit.vitals); } catch (e) { }
        }
        newVisit.attachments = await query(`SELECT * FROM visit_attachments WHERE visit_id = ?`, [visitId]);

        io.emit('visit:added', { patientId, visit: newVisit });
        io.emit('health_data_update');

        res.json({ success: true, data: { visit: newVisit } });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. VACCINATION MANAGEMENT

// GET Vaccinations
app.get('/api/patients/:patientId/vaccinations', async (req, res) => {
    try {
        const vaccinations = await query(`
            SELECT * FROM vaccinations 
            WHERE patient_id = ? 
            ORDER BY CASE status WHEN 'Pending' THEN 1 ELSE 2 END, vaccine_name
        `, [req.params.patientId]);
        res.json({ success: true, data: { vaccinations } });
    } catch (error) {
        res.status(500).json({ error: 'DB Error' });
    }
});

// POST Complete Vaccination
app.post('/api/patients/:patientId/vaccinations/:vaccineId/complete', upload.single('certificate'), async (req, res) => {
    try {
        const { vaccineId } = req.params;
        const { administeredDate, batchNumber, administratorName, nextDueDate, vaccineName } = req.body;

        let certificateUrl = null;
        if (req.file) {
            certificateUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        await run(`
            UPDATE vaccinations
            SET status = 'Completed',
                administered_date = ?,
                batch_number = ?,
                administrator_name = ?,
                next_due_date = ?,
                certificate_url = ?
            WHERE id = ?
        `, [administeredDate, batchNumber, administratorName, nextDueDate, certificateUrl, vaccineId]);

        io.emit('vaccination:updated', { patientId: req.params.patientId, vaccineId });
        io.emit('health_data_update');

        res.json({ success: true, message: 'Vaccination completed' });

    } catch (error) {
        res.status(500).json({ error: 'DB Error' });
    }
});

// 5. ABHA INTEGRATION

// GET QR
app.get('/api/patients/:patientId/abha/qr', async (req, res) => {
    try {
        const patient = await get('SELECT * FROM patients WHERE id = ?', [req.params.patientId]);

        const qrData = {
            abhaId: patient.abha_id,
            name: patient.full_name,
            gender: patient.gender,
            mobile: patient.mobile,
            patientId: patient.patient_id
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
        res.json({ success: true, data: { qrCode, qrData } });
    } catch (error) {
        res.status(500).json({ error: 'QR Gen Error' });
    }
});

// POST Link ABHA
app.post('/api/patients/:patientId/abha/link', async (req, res) => {
    try {
        const { abhaId } = req.body;
        await run(`
            UPDATE patients 
            SET abha_id = ?, abdm_linked = 1, abdm_linked_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [abhaId, req.params.patientId]);

        // Mock syncing
        const patient = await get('SELECT full_name, mobile FROM patients WHERE id = ?', [req.params.patientId]);
        sendSMS(patient.mobile, `Your record is linked to ABHA ID: ${abhaId}`);

        res.json({
            success: true,
            message: 'ABHA Linked Successfully',
            data: { recordsSynced: 12 } // Mock count
        });
    } catch (error) {
        res.status(500).json({ error: 'Link Error' });
    }
});

// 5. ABHA INTEGRATION
// ... (existing code handles this)

// 7. LAB REPORTS
app.get('/api/patients/:patientId/labs', async (req, res) => {
    try {
        const labs = await query(`SELECT * FROM lab_reports WHERE patient_id = ? ORDER BY test_date DESC`, [req.params.patientId]);
        res.json({ success: true, data: { labs } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching labs' });
    }
});

// 8. PRESCRIPTIONS
app.get('/api/patients/:patientId/prescriptions', async (req, res) => {
    try {
        const prescriptions = await query(`SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescribed_date DESC`, [req.params.patientId]);
        res.json({ success: true, data: { prescriptions } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching prescriptions' });
    }
});

// 9. REFERRALS
app.get('/api/patients/:patientId/referrals', async (req, res) => {
    try {
        const referrals = await query(`SELECT * FROM referrals WHERE patient_id = ? ORDER BY referral_date DESC`, [req.params.patientId]);
        res.json({ success: true, data: { referrals } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching referrals' });
    }
});

// 10. CONSENT
app.get('/api/patients/:patientId/consents', async (req, res) => {
    try {
        const consents = await query(`SELECT * FROM abdm_consent_requests WHERE patient_id = ? ORDER BY created_at DESC`, [req.params.patientId]);
        res.json({ success: true, data: { consents } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching consents' });
    }
});

// 11. DASHBOARD ANALYTICS
app.get('/api/dashboard/metrics', async (req, res) => {
    try {
        const totalMigrants = await get('SELECT COUNT(*) as count FROM patients WHERE is_active = 1');
        const vaxCompleted = await get("SELECT COUNT(*) as count FROM vaccinations WHERE status = 'Completed'");
        const totalVaxExpected = (totalMigrants.count || 0) * 3;
        const vaxCoverage = totalVaxExpected > 0 ? Math.round((vaxCompleted.count / totalVaxExpected) * 100) : 0;
        const uniqueLocations = await get('SELECT COUNT(DISTINCT current_location) as count FROM patients');
        const activeAlerts = await get("SELECT COUNT(*) as count FROM health_conditions WHERE is_active = 1");

        res.json({
            success: true,
            data: {
                totalMigrants: totalMigrants.count,
                vaccinationCoverage: vaxCoverage,
                uniqueLocations: uniqueLocations.count,
                activeAlerts: activeAlerts.count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/dashboard/charts', async (req, res) => {
    try {
        const locationData = await query(`
            SELECT current_location as name, COUNT(*) as count, 85 as score 
            FROM patients 
            GROUP BY current_location 
            LIMIT 5
        `);

        const vaccinationData = [
            { name: 'Fully Vaccinated', value: 65 },
            { name: 'Partial', value: 25 },
            { name: 'Pending', value: 10 }
        ];

        const diseaseTrends = [
            { name: 'Jun', cases: 12 },
            { name: 'Jul', cases: 19 },
            { name: 'Aug', cases: 15 },
            { name: 'Sep', cases: 22 },
            { name: 'Oct', cases: 30 },
            { name: 'Nov', cases: 25 },
            { name: 'Dec', cases: 28 }
        ].map(d => ({ ...d, month: d.name }));

        res.json({
            success: true,
            data: { locationData, vaccinationData, diseaseTrends }
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Real-time
io.on('connection', (socket) => {
    console.log('Node connected:', socket.id);

    // Handle real-time registration sync
    socket.on('new_patient', async (data) => {
        try {
            await run(`
                INSERT INTO patients (
                    patient_id, full_name, age, gender, mobile, 
                    abha_id, origin_state, current_location, 
                    accommodation_type, room_occupancy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.id, data.name, data.age, data.gender, data.mobile,
                data.abhaId, data.origin, data.district,
                data.housing, data.occupants
            ]);

            // Broadcast update to all clients to refresh dashboard
            io.emit('health_data_update');
            console.log('Real-time sync: Patient added & broadcasted');
        } catch (err) {
            console.error('Socket Sync Error:', err);
        }
    });

    socket.on('disconnect', () => console.log('Node disconnected'));
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`DHMS Server active on port ${PORT}`);
});
