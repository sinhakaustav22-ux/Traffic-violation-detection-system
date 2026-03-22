import { query } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM dashboard_notifications 
      WHERE is_read = FALSE 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await query('UPDATE dashboard_notifications SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
