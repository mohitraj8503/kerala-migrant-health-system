import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath);

const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const initDB = async () => {
    console.log('🔄 Initializing database with comprehensive demo data...');

    try {
        // 1. Reset Database
        const tables = [
            'visit_attachments', 'patient_visits', 'vaccinations', 'health_conditions',
            'patient_schemes', 'lab_reports', 'prescriptions', 'referrals',
            'abdm_consent_requests', 'patients', 'dashboard_metrics'
        ];
        for (const table of tables) {
            await runQuery(`DROP TABLE IF EXISTS ${table}`);
        }
        console.log('✅ Tables dropped.');

        // 2. Create Schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        for (const stmt of statements) {
            await runQuery(stmt);
        }
        console.log('✅ Schema created.');

        // 3. Seed Data
        console.log('🌱 Seeding specific demo patients...');

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

        const patientsData = [];

        // Patient 1: Imran Kumar (Female? Prompt says "Gender: Female" but name "Imran Kumar". I'll follow prompt)
        patientsData.push({
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
            abha_id: '34-XXXX-XXXX-4221',
            mobile: '+91-9876543210',
            registered_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        });

        const realisticNames = [
            'Rajesh Kumar', 'Suman Devi', 'Amit Singh', 'Priya Das', 'Manoj Yadav',
            'Anita Murmu', 'Subhash Chandra', 'Gita Rani', 'Vikram Meena', 'Pooja Sharma',
            'Ramesh Soren', 'Laxmi Kumari', 'Sanjay Mahato', 'Deepika Roy', 'Suresh Ali',
            'Rina Khatun', 'Mohammad Azad', 'Sunita Bouri', 'Arun Tudu', 'Kabita Barua',
            'Bikram Singh', 'Mousumi Begum', 'Suraj Pal', 'Nilam Devi'
        ];

        for (let i = 1; i < 25; i++) {
            const origin = origins[Math.floor(Math.random() * origins.length)];
            const keralaDist = keralaDistricts[i % keralaDistricts.length];
            patientsData.push({
                patient_id: `KDH-2025-00${1234 + i}`,
                full_name: realisticNames[i - 1],
                age: Math.floor(Math.random() * (58 - 18 + 1)) + 18,
                gender: Math.random() > 0.4 ? 'Male' : 'Female',
                blood_group: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
                origin_state: origin.state,
                origin_district: origin.districts[Math.floor(Math.random() * origin.districts.length)],
                current_location: keralaDist,
                accommodation_type: accommodationTypes[Math.floor(Math.random() * accommodationTypes.length)],
                room_occupancy: Math.floor(Math.random() * 11) + 2,
                has_clean_water: Math.random() > 0.3 ? 1 : 0,
                toilet_access: toiletAccess[Math.floor(Math.random() * toiletAccess.length)],
                abha_id: Math.random() > 0.3 ? `${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : null,
                mobile: `+91-${Math.floor(6000000000 + Math.random() * 4000000000)}`,
                registered_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        // Insert Patients
        for (const p of patientsData) {
            await runQuery(`
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

        const dbPatients = await new Promise((resolve, reject) => {
            db.all("SELECT id, full_name FROM patients", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Conditions, Vaccines, Visits, Schemes
        const vaccines = ['COVID-19', 'Hepatitis B', 'Tetanus', 'MMR', 'Influenza'];
        const facilities = ['PHC Kalpetta', 'District Hospital Ernakulam', 'CHC Thrissur', 'PHC Munnar', 'General Hospital Trivandrum'];

        for (const p of dbPatients) {
            // Conditions
            if (p.full_name === 'Imran Kumar') {
                await runQuery(`INSERT INTO health_conditions (patient_id, condition_name, icd_code, severity, diagnosed_date, is_active) VALUES (?, 'Asthma', 'J45', 'Moderate', '2024-12-10', 1)`, [p.id]);
            } else {
                const r = Math.random();
                if (r < 0.3) await runQuery(`INSERT INTO health_conditions (patient_id, condition_name, icd_code, severity, diagnosed_date, is_active) VALUES (?, 'Asthma', 'J45', 'Mild', '2024-11-15', 1)`, [p.id]);
                else if (r < 0.45) await runQuery(`INSERT INTO health_conditions (patient_id, condition_name, icd_code, severity, diagnosed_date, is_active) VALUES (?, 'Diabetes Type 2', 'E11', 'Moderate', '2024-10-20', 1)`, [p.id]);
            }

            // Vaccines
            for (const v of vaccines) {
                const status = Math.random() < 0.6 ? 'Completed' : 'Pending';
                await runQuery(`INSERT INTO vaccinations (patient_id, vaccine_name, status, administered_date, batch_number) VALUES (?, ?, ?, ?, ?)`,
                    [p.id, v, status, status === 'Completed' ? '2024-06-01' : null, status === 'Completed' ? 'VAC-123' : null]);
            }

            // Schemes
            await runQuery(`INSERT INTO patient_schemes (patient_id, scheme_name, enrollment_status, policy_id, coverage_amount, valid_until) VALUES (?, 'Kerala Awaz Protection', 'ACTIVE', 'KA-44221', 500000, '2025-12-31')`, [p.id]);
            if (p.full_name === 'Imran Kumar') {
                await runQuery(`INSERT INTO patient_schemes (patient_id, scheme_name, enrollment_status, policy_id, coverage_amount) VALUES (?, 'AB-PMJAY', 'PENDING_ASSESSMENT', 'PMJAY-999', 500000)`, [p.id]);
            }

            // Visits
            if (p.full_name === 'Imran Kumar' || Math.random() > 0.6) {
                const visitResult = await runQuery(`INSERT INTO patient_visits (patient_id, visit_date, facility, chief_complaint, diagnosis, vitals) VALUES (?, ?, ?, ?, ?, ?)`,
                    [p.id, new Date().toISOString(), 'PHC Wayanad', 'Breathing difficulty', 'Asthma Exacerbation', JSON.stringify({ temp: 98.6, bp: '120/80', spo2: 96 })]);

                if (p.full_name === 'Imran Kumar') {
                    const visitId = visitResult.lastID;
                    // Seed Labs
                    await runQuery(`INSERT INTO lab_reports (patient_id, visit_id, test_name, result, reference_range, status, test_date) VALUES (?, ?, 'HbA1c', '6.2%', '4.0-5.6%', 'ABNORMAL', '2024-12-10')`, [p.id, visitId]);
                    await runQuery(`INSERT INTO lab_reports (patient_id, visit_id, test_name, result, status, test_date) VALUES (?, ?, 'Chest X-Ray', 'Clear lungs', 'NORMAL', '2024-12-11')`, [p.id, visitId]);

                    // Seed Prescriptions
                    await runQuery(`INSERT INTO prescriptions (patient_id, visit_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, 'Salbutamol Inhaler', '100mcg', 'PRN', '30 days', 'Inhale during breathlessness')`, [p.id, visitId]);
                    await runQuery(`INSERT INTO prescriptions (patient_id, visit_id, medicine_name, dosage, frequency, duration) VALUES (?, ?, 'Cetirizine', '10mg', 'Once Daily', '10 days')`, [p.id, visitId]);

                    // Seed Referrals
                    await runQuery(`INSERT INTO referrals (patient_id, visit_id, to_facility, reason, priority, status) VALUES (?, ?, 'District Hospital Wayanad', 'Specialist consultation for Asthma', 'MEDIUM', 'PENDING')`, [p.id, visitId]);
                }
            }
        }

        console.log('✅ Seeding complete.');
    } catch (err) {
        console.error('❌ Error initializing DB:', err);
    } finally {
        db.close();
    }
};

initDB();
