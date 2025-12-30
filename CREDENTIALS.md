# Kerala Digital Health Machine System (DHMS) - Access Credentials

This document lists all the pre-configured accounts for testing the pilot production environment.

## 1. Super Admin (State Level)
**Access Level:** Full System Access (All Districts)
- **Login ID:** `admin@kerala.gov`
- **Password:** `admin`
- **Dashboard:** Full analytics, User Management, Policy Settings.

## 2. District Admin (Wayanad)
**Access Level:** District Specific (Wayanad)
- **Login ID:** `wayanad@kerala.gov`
- **Password:** `district`
- **Dashboard:** Filtered to Wayanad district metrics only.

## 3. Field Worker
**Access Level:** Data Entry & Registration
- **Login ID:** `worker`
- **Password:** `worker`
- **Function:** Quick access to Migrant Registration Form.

## 4. PHC Staff (Primary Health Centre)
**Access Level:** Clinical & Records
- **Login ID:** `phc`
- **Password:** `phc`
- **Function:** View Patient Records, Update Vitals, Referrals.

---
**Note:** These credentials are for the **Local/Dev/Pilot** environment as configured in `server/index.ts`. In a real production build, these would be replaced by actual database records hashed with bcrypt.
