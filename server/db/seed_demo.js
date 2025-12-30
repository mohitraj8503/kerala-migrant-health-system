import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const patientsData = [
    {
        patient_id: 'KDH-2025-001234',
        full_name: 'Imran Kumar',
        age: 39,
        gender: 'Female',
        blood_group: 'AB-',
        origin_state: 'Jharkhand',
        origin_district: 'Ranchi',
        current_location: 'Wayanad',
        accommodation_type: 'Rented Shared Unit',
        room_occupancy: 8,
        has_clean_water: 1,
        toilet_access: 'Shared',
        abha_id: '34-8821-4432-4221',
        mobile: '+91-9876543210',
        registered_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const origins = [
    { state: 'Bihar', districts: ['Patna', 'Gaya', 'Bhagalpur'] },
    { state: 'Jharkhand', districts: ['Ranchi', 'Dhanbad', 'Jamshedpur'] },
    { state: 'West Bengal', districts: ['Kolkata', 'Howrah', 'Siliguri'] },
    { state: 'Odisha', districts: ['Bhubaneswar', 'Cuttack', 'Rourkela'] },
    { state: 'Assam', districts: ['Guwahati', 'Dibrugarh', 'Silchar'] },
    { state: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Varanasi'] },
    { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur'] }
];

const keralaDistricts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
    'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const accommodationTypes = ['Rented Shared Unit', 'Employer Quarters', 'Makeshift Shelter', 'Labour Camps'];
const toiletAccess = ['Personal', 'Shared', 'None'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Generate 24 more patients
for (let i = 1; i < 25; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const district = origin.districts[Math.floor(Math.random() * origin.districts.length)];
    const keralaDist = keralaDistricts[i % keralaDistricts.length];

    patientsData.push({
        patient_id: `KDH-2025-00${1234 + i}`,
        full_name: `Worker ${1234 + i}`,
        age: Math.floor(Math.random() * (58 - 18 + 1)) + 18,
        gender: Math.random() > 0.4 ? 'Male' : 'Female',
        blood_group: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        origin_state: origin.state,
        origin_district: district,
        current_location: keralaDist,
        accommodation_type: accommodationTypes[Math.floor(Math.random() * accommodationTypes.length)],
        room_occupancy: Math.floor(Math.random() * 11) + 2,
        has_clean_water: Math.random() > 0.3 ? 1 : 0,
        toilet_access: toiletAccess[Math.floor(Math.random() * toiletAccess.length)],
        abha_id: Math.random() > 0.3 ? `${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : null,
        mobile: `+91-${Math.floor(6000000000 + Math.random() * 4000000000)}`,
        registered_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
    });
}

const realisticNames = [
    'Rajesh Kumar', 'Suman Devi', 'Amit Singh', 'Priya Das', 'Manoj Yadav',
    'Anita Murmu', 'Subhash Chandra', 'Gita Rani', 'Vikram Meena', 'Pooja Sharma',
    'Ramesh Soren', 'Laxmi Kumari', 'Sanjay Mahato', 'Deepika Roy', 'Suresh Ali',
    'Rina Khatun', 'Mohammad Azad', 'Sunita Bouri', 'Arun Tudu', 'Kabita Barua',
    'Bikram Singh', 'Mousumi Begum', 'Suraj Pal', 'Nilam Devi'
];

for (let i = 1; i < 25; i++) {
    patientsData[i].full_name = realisticNames[i - 1];
}

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    });
});

async function seed() {
    try {
        console.log('Starting seed process...');

        const tables = ['visit_attachments', 'patient_visits', 'vaccinations', 'health_conditions', 'patient_schemes', 'lab_reports', 'prescriptions', 'referrals', 'abdm_consent_requests', 'patients'];
        for (const table of tables) {
            await run(`DELETE FROM ${table}`);
            try { await run(`DELETE FROM sqlite_sequence WHERE name='${table}'`); } catch (e) { }
        }
        console.log('Cleared existing data.');

        for (const p of patientsData) {
            await run(`
                INSERT INTO patients (
                    patient_id, full_name, age, gender, blood_group, 
                    origin_state, origin_district, current_location, 
                    accommodation_type, room_occupancy, has_clean_water, 
                    toilet_access, abha_id, mobile, registered_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                p.patient_id, p.full_name, p.age, p.gender, p.blood_group,
                p.origin_state, p.origin_district, p.current_location,
                p.accommodation_type, p.room_occupancy, p.has_clean_water,
                p.toilet_access, p.abha_id, p.mobile, p.registered_at
            ]);
        }
        console.log('Inserted 25 patients.');

        const dbPatients = await new Promise((resolve, reject) => {
            db.all("SELECT id, patient_id, full_name FROM patients", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const p of dbPatients) {
            let conditions = [];
            if (p.full_name === 'Imran Kumar') {
                conditions.push({ name: 'Asthma', code: 'J45', severity: 'Moderate', notes: 'Chronic asthma, needs inhaler' });
            } else {
                const rand = Math.random();
                if (rand < 0.3) conditions.push({ name: 'Asthma', code: 'J45', severity: 'Mild', notes: 'Wheezing' });
                else if (rand < 0.45) conditions.push({ name: 'Diabetes Type 2', code: 'E11', severity: 'Moderate', notes: 'Diet issues' });
                else if (rand < 0.55) conditions.push({ name: 'Hypertension', code: 'I10', severity: 'Mild', notes: 'High BP' });
            }

            for (const c of conditions) {
                await run(`
                    INSERT INTO health_conditions (patient_id, condition_name, icd_code, severity, diagnosed_date, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [p.id, c.name, c.code, c.severity, new Date().toISOString().split('T')[0], c.notes]);
            }
        }
        console.log('Inserted health conditions.');

        const vaccines = ['COVID-19', 'Hepatitis B', 'Tetanus', 'MMR', 'Influenza'];
        for (const p of dbPatients) {
            for (const vName of vaccines) {
                let status = 'Pending';
                let adminDate = null;
                const r = Math.random();
                if (r < 0.6) {
                    status = 'Completed';
                    adminDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                }
                await run(`
                    INSERT INTO vaccinations (patient_id, vaccine_name, status, administered_date, batch_number)
                    VALUES (?, ?, ?, ?, ?)
                `, [p.id, vName, status, adminDate, status === 'Completed' ? 'VAC-123' : null]);
            }
        }
        console.log('Inserted vaccinations.');

        // Visits
        for (const p of dbPatients) {
            if (p.full_name === 'Imran Kumar' || Math.random() > 0.5) {
                await run(`
                    INSERT INTO patient_visits (patient_id, visit_date, facility, chief_complaint, vitals, diagnosis, treatment_notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [p.id, new Date().toISOString(), 'PHC Wayanad', 'Cough', JSON.stringify({ temp: 98 }), 'Viral', 'Rest']);
            }
        }
        console.log('Inserted visits.');

        // Schemes
        for (const p of dbPatients) {
            await run(`
                INSERT INTO patient_schemes (patient_id, scheme_name, enrollment_status, policy_id, coverage_amount, valid_until)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [p.id, 'Kerala Awaz Protection', 'ACTIVE', 'KA-44221', 500000, '2025-12-31']);
        }
        console.log('Inserted schemes.');

        console.log('Seed complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
