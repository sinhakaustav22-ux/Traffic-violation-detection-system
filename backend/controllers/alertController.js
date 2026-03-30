import { query } from '../config/db.js';
import { sendSMSAlert, sendWhatsAppAlert } from '../services/twilioService.js';

export const sendAlert = async (req, res) => {
  try {
    const { violation_id, phone_number, channels } = req.body;
    
    if (!violation_id || !phone_number || !channels || channels.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const violationResult = await query('SELECT * FROM violations WHERE id = $1', [violation_id]);
    if (violationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    const violation = violationResult.rows[0];
    const results = {};
    
    if (channels.includes('SMS')) {
      try {
        const sid = await sendSMSAlert(phone_number, violation);
        results.sms = { status: 'success', sid };
      } catch (e) {
        results.sms = { status: 'failed', error: e.message };
      }
    }
    
    if (channels.includes('WHATSAPP')) {
      try {
        const sid = await sendWhatsAppAlert(phone_number, violation);
        results.whatsapp = { status: 'success', sid };
      } catch (e) {
        results.whatsapp = { status: 'failed', error: e.message };
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const countResult = await query('SELECT COUNT(*) as count FROM sms_alerts');
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT a.*, v.violation_type, v.vehicle_number 
      FROM sms_alerts a
      LEFT JOIN violations v ON a.violation_id = v.id
      ORDER BY a.sent_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      alerts: dataResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
