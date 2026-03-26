import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSeed = async () => {
  try {
    console.log('Starting seed...');
    
    // 1. Drop and recreate tables
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // SQLite doesn't support CASCADE in DROP TABLE, so we drop in reverse order
    await query(`DROP TABLE IF EXISTS uploaded_files;`);
    await query(`DROP TABLE IF EXISTS dashboard_notifications;`);
    await query(`DROP TABLE IF EXISTS sms_alerts;`);
    await query(`DROP TABLE IF EXISTS challans;`);
    await query(`DROP TABLE IF EXISTS violations;`);
    await query(`DROP TABLE IF EXISTS users;`);
    
    // Split schema by semicolon and execute each statement
    const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');
    for (const stmt of statements) {
      await query(stmt + ';');
    }
    console.log('Schema recreated.');

    // 2. Insert users
    const adminHash = await bcrypt.hash('Admin@1234', 10);
    const officerHash = await bcrypt.hash('Officer@1234', 10);
    const viewerHash = await bcrypt.hash('Viewer@1234', 10);

    await query(`
      INSERT INTO users (name, email, password_hash, role, phone) VALUES 
      ('Admin User', 'admin@ctvds.in', $1, 'admin', '+919876543210'),
      ('Traffic Officer', 'officer@ctvds.in', $2, 'traffic_officer', '+919876543211'),
      ('Viewer User', 'viewer@ctvds.in', $3, 'viewer', '+919876543212')
    `, [adminHash, officerHash, viewerHash]);
    console.log('Users inserted.');

    // 3. Insert 40 sample violations
    const types = ['NO_HELMET', 'RED_LIGHT_JUMP', 'TRIPLE_RIDING', 'NO_SEATBELT'];
    const statuses = ['PENDING', 'REVIEWED', 'CHALLAN_ISSUED', 'DISMISSED'];
    const locations = ["College Main Gate", "Library Junction", "Hostel Road", "Admin Block Entry", "Parking Zone B"];
    const vehicles = ['MH12AB1234', 'OD05XY9988', 'KA01CD5678', 'DL04EF9012', 'UP32GH3456'];
    
    // Fines based on constants
    const fines = {
      NO_HELMET: 1000,
      RED_LIGHT_JUMP: 1000,
      TRIPLE_RIDING: 1000,
      NO_SEATBELT: 1000
    };

    const vehicleTypes = {
      NO_HELMET: 'TWO_WHEELER',
      RED_LIGHT_JUMP: 'FOUR_WHEELER',
      TRIPLE_RIDING: 'TWO_WHEELER',
      NO_SEATBELT: 'FOUR_WHEELER'
    };

    let challanIssuedViolations = [];

    for (let i = 0; i < 40; i++) {
      const type = types[i % 4];
      
      // Mix statuses: 15 PENDING, 10 REVIEWED, 12 CHALLAN_ISSUED, 3 DISMISSED
      let status = 'PENDING';
      if (i < 15) status = 'PENDING';
      else if (i < 25) status = 'REVIEWED';
      else if (i < 37) status = 'CHALLAN_ISSUED';
      else status = 'DISMISSED';

      const location = locations[i % 5];
      const vehicle = vehicles[i % 5];
      const score = (Math.random() * (0.98 - 0.60) + 0.60).toFixed(2);
      
      // Spread evenly across last 21 days
      const daysAgo = Math.floor(Math.random() * 21);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 24));
      
      const result = await query(`
        INSERT INTO violations 
        (violation_type, vehicle_type, vehicle_number, location, confidence_score, status, fine_amount, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [type, vehicleTypes[type], vehicle, location, score, status, fines[type], date.toISOString()]);

      if (status === 'CHALLAN_ISSUED') {
        challanIssuedViolations.push(result.rows[0].id);
      }
    }
    console.log('Violations inserted.');

    // 4. Insert 12 challans
    for (let i = 0; i < challanIssuedViolations.length; i++) {
      const vId = challanIssuedViolations[i];
      const year = new Date().getFullYear();
      const paddedId = String(vId).padStart(4, '0');
      const challan_number = `CTVDS-${year}-${paddedId}`;
      
      await query(`
        INSERT INTO challans (violation_id, challan_number, issued_by) 
        VALUES ($1, $2, $3)
      `, [vId, challan_number, 1]); // issued by admin
    }
    console.log('Challans inserted.');

    // 5. Insert 20 dashboard notifications
    for (let i = 0; i < 20; i++) {
      await query(`
        INSERT INTO dashboard_notifications (violation_id, message, is_read) 
        VALUES ($1, $2, $3)
      `, [i + 1, `New violation detected at ${locations[i % 5]}`, i % 2 === 0]);
    }
    console.log('Notifications inserted.');

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

runSeed();
