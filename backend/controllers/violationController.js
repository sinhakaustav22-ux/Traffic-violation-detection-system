import { query } from '../config/db.js';
import { FINES } from '../constants/fines.js';

export const getAllViolations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { type, status, date_from, date_to, search } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type && type !== 'All') {
      whereClause += ` AND violation_type = $${paramIndex++}`;
      params.push(type);
    }
    
    if (status && status !== 'All') {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (date_from) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(date_from);
    }
    
    if (date_to) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(date_to);
    }
    
    if (search) {
      whereClause += ` AND vehicle_number ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }
    
    const countQuery = `SELECT COUNT(*) FROM violations ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataQuery = `
      SELECT v.*, u.name as reviewer_name 
      FROM violations v 
      LEFT JOIN users u ON v.reviewed_by = u.id 
      ${whereClause} 
      ORDER BY v.created_at DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);
    
    const dataResult = await query(dataQuery, params);
    
    res.json({
      violations: dataResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getViolationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT v.*, u.name as reviewer_name 
      FROM violations v 
      LEFT JOIN users u ON v.reviewed_by = u.id 
      WHERE v.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching violation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createViolation = async (req, res) => {
  try {
    const { violation_type, vehicle_type, vehicle_number, location, confidence_score, snapshot_path, source_type } = req.body;
    
    if (!FINES[violation_type]) {
      return res.status(400).json({ error: 'Invalid violation type' });
    }
    
    const fine_amount = FINES[violation_type].amount;
    
    const result = await query(`
      INSERT INTO violations 
      (violation_type, vehicle_type, vehicle_number, location, confidence_score, snapshot_path, source_type, fine_amount) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [violation_type, vehicle_type, vehicle_number, location, confidence_score, snapshot_path, source_type, fine_amount]);
    
    const violation = result.rows[0];
    
    // Create dashboard notification
    const message = `New ${violation_type.replace(/_/g, ' ')} detected at ${location} (Vehicle: ${vehicle_number})`;
    const notifResult = await query(
      'INSERT INTO dashboard_notifications (violation_id, message) VALUES ($1, $2) RETURNING *',
      [violation.id, message]
    );
    
    // Emit socket events
    if (req.app.get('io')) {
      req.app.get('io').emit('new_violation', violation);
      req.app.get('io').emit('new_notification', notifResult.rows[0]);
    }
    
    res.status(201).json(violation);
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateViolationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'REVIEWED', 'CHALLAN_ISSUED', 'DISMISSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await query(`
      UPDATE violations 
      SET status = $1, reviewed_by = $2, updated_at = NOW() 
      WHERE id = $3 
      RETURNING *
    `, [status, req.user.id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating violation status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
