import { query } from '../config/db.js';
import { generateChallan } from '../services/pdfService.js';
import { sendBothAlerts } from '../services/twilioService.js';
import path from 'path';
import fs from 'fs';

export const issueChallan = async (req, res) => {
  try {
    const { violation_id } = req.body;
    
    const violationResult = await query('SELECT * FROM violations WHERE id = $1', [violation_id]);
    if (violationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    const violation = violationResult.rows[0];
    if (violation.status === 'CHALLAN_ISSUED') {
      return res.status(400).json({ error: 'Challan already issued for this violation' });
    }
    
    const year = new Date().getFullYear();
    const paddedId = String(violation.id).padStart(4, '0');
    const challan_number = `CTVDS-${year}-${paddedId}`;
    
    const challanResult = await query(`
      INSERT INTO challans (violation_id, challan_number, issued_by) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [violation.id, challan_number, req.user.id]);
    
    const challan = challanResult.rows[0];
    
    const pdfPath = await generateChallan(violation, challan, req.user.name);
    
    await query('UPDATE challans SET pdf_path = $1 WHERE id = $2', [pdfPath, challan.id]);
    await query('UPDATE violations SET status = $1, updated_at = NOW() WHERE id = $2', ['CHALLAN_ISSUED', violation.id]);
    
    if (process.env.AUTHORITY_PHONE) {
      await sendBothAlerts(process.env.AUTHORITY_PHONE, violation);
    }
    
    res.status(201).json({
      ...challan,
      pdf_path: pdfPath,
      download_url: `/api/challans/${challan.id}/pdf`
    });
  } catch (error) {
    console.error('Error issuing challan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const downloadChallanPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM challans WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challan not found' });
    }
    
    const challan = result.rows[0];
    if (!challan.pdf_path || !fs.existsSync(challan.pdf_path)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${challan.challan_number}.pdf`);
    
    const fileStream = fs.createReadStream(challan.pdf_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllChallans = async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, v.violation_type, v.vehicle_number, v.fine_amount 
      FROM challans c
      JOIN violations v ON c.violation_id = v.id
      ORDER BY c.issued_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid } = req.body;
    
    const result = await query(`
      UPDATE challans 
      SET fine_paid = $1, paid_at = $2 
      WHERE id = $3 
      RETURNING *
    `, [paid, paid ? new Date() : null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challan not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking challan as paid:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
