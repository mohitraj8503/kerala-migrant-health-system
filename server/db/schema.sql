-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  date_of_birth DATE,
  mobile TEXT,
  email TEXT,
  abha_id TEXT,
  abdm_linked INTEGER DEFAULT 0, -- Boolean
  abdm_linked_at DATETIME,
  abdm_reference_id TEXT,
  origin_state TEXT,
  origin_district TEXT,
  current_location TEXT, -- Kerala district
  current_address TEXT,
  accommodation_type TEXT,
  room_occupancy INTEGER,
  has_clean_water INTEGER, -- 0 or 1
  toilet_access TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  registered_by INTEGER,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1
);

-- 2. HEALTH_CONDITIONS TABLE
CREATE TABLE IF NOT EXISTS health_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  condition_name TEXT,
  icd_code TEXT,
  severity TEXT,
  diagnosed_date DATE,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- 3. VACCINATIONS TABLE
CREATE TABLE IF NOT EXISTS vaccinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  vaccine_name TEXT,
  dose_number INTEGER,
  status TEXT,
  administered_date DATE,
  next_due_date DATE,
  batch_number TEXT,
  administrator_name TEXT,
  certificate_url TEXT,
  administered_by INTEGER,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- 4. VISITS TABLE
CREATE TABLE IF NOT EXISTS patient_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  visit_date DATETIME,
  facility TEXT,
  chief_complaint TEXT,
  vitals TEXT, -- JSON string
  diagnosis TEXT,
  treatment_notes TEXT,
  follow_up_required INTEGER DEFAULT 0, -- Boolean
  follow_up_date DATE,
  visited_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- 5. VISIT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS visit_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER,
  filename TEXT,
  file_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(visit_id) REFERENCES patient_visits(id)
);

-- 6. HEALTH_SCHEMES TABLE
CREATE TABLE IF NOT EXISTS patient_schemes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  scheme_name TEXT,
  enrollment_status TEXT,
  policy_id TEXT,
  coverage_amount REAL,
  valid_until DATE,
  claims_used REAL DEFAULT 0,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- 7. ABDM CONSENT REQUESTS
CREATE TABLE IF NOT EXISTS abdm_consent_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  requester_facility_id TEXT,
  purpose TEXT,
  data_types TEXT, -- JSON array string
  status TEXT,
  valid_from DATE,
  valid_until DATE,
  consent_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- 8. DASHBOARD_METRICS (Cached)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT,
  district TEXT,
  metric_value REAL,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. LAB_REPORTS TABLE
CREATE TABLE IF NOT EXISTS lab_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  visit_id INTEGER,
  test_name TEXT,
  test_date DATE,
  result TEXT,
  reference_range TEXT,
  status TEXT,
  file_url TEXT,
  facility TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(visit_id) REFERENCES patient_visits(id)
);

-- 10. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  visit_id INTEGER,
  medicine_name TEXT,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  prescribed_date DATE,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(visit_id) REFERENCES patient_visits(id)
);

-- 11. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  visit_id INTEGER,
  to_facility TEXT,
  reason TEXT,
  priority TEXT,
  status TEXT,
  referral_date DATE,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(visit_id) REFERENCES patient_visits(id)
);
