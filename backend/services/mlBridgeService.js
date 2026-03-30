import { spawn } from 'child_process';
import { query } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

export const processFile = async (filePath, fileType, uploadedFileId) => {
  return new Promise((resolve, reject) => {
    const mlEnginePath = process.env.ML_ENGINE_PATH || '../ml_engine';
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
    const internalToken = process.env.INTERNAL_ML_TOKEN || 'internal_ml_secret';
    
    // For demo purposes, we will simulate the ML engine if Python script is not found
    // In a real scenario, this would spawn the Python process
    
    console.log(`Starting ML processing for ${filePath} (Type: ${fileType})`);
    
    // Simulate processing delay
    setTimeout(async () => {
      try {
        // Simulated ML results
        const violationsFound = Math.floor(Math.random() * 3) + 1; // 1 to 3 violations
        
        await query(
          'UPDATE uploaded_files SET processed = 1, violations_found = $1 WHERE id = $2',
          [violationsFound, uploadedFileId]
        );
        
        const violationTypes = ['NO_HELMET', 'RED_LIGHT_JUMP', 'TRIPLE_RIDING', 'NO_SEATBELT'];
        const vehicleTypes = ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'];
        const fines = {
          'NO_HELMET': 1000,
          'RED_LIGHT_JUMP': 5000,
          'TRIPLE_RIDING': 2000,
          'NO_SEATBELT': 1000
        };

        // Generate one vehicle number and type for the entire file
        // so multiple violations on the same file belong to the same vehicle
        const sharedVehType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        const sharedVehicleNumber = `DL${Math.floor(Math.random() * 90) + 10}C${Math.floor(Math.random() * 9000) + 1000}`;

        // Determine compatible violation types based on vehicle type
        let compatibleViolationTypes = [];
        if (sharedVehType === 'TWO_WHEELER') {
          compatibleViolationTypes = ['NO_HELMET', 'TRIPLE_RIDING', 'RED_LIGHT_JUMP'];
        } else {
          compatibleViolationTypes = ['NO_SEATBELT', 'RED_LIGHT_JUMP'];
        }

        const newViolations = [];
        for (let i = 0; i < violationsFound; i++) {
          const vType = compatibleViolationTypes[Math.floor(Math.random() * compatibleViolationTypes.length)];
          const confidence = (Math.random() * (0.99 - 0.70) + 0.70).toFixed(2);
          const fine = fines[vType] || 1000;
          
          const snapshotPath = fileType === 'VIDEO' 
            ? 'https://picsum.photos/seed/traffic/600/400' 
            : filePath;
            
          const result = await query(
            `INSERT INTO violations 
             (violation_type, vehicle_type, vehicle_number, location, confidence_score, snapshot_path, source_type, status, fine_amount) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [vType, sharedVehType, sharedVehicleNumber, 'Campus Main Gate', confidence, snapshotPath, 'UPLOAD', 'PENDING', fine]
          );
          newViolations.push(result.rows[0]);
        }
        
        // In a real app, the ML engine would call the API to create violations
        // Here we just return the simulated count and the new violations
        resolve({ status: 'success', violations_found: violationsFound, new_violations: newViolations });
      } catch (err) {
        console.error('Error updating processed file status', err);
        reject(err);
      }
    }, 3000);
  });
};
