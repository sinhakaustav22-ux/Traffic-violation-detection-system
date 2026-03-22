import { query } from '../config/db.js';
import { getSevenDayForecast } from '../services/forecastService.js';

export const getSummary = async (req, res) => {
  try {
    const totalResult = await query('SELECT COUNT(*) FROM violations');
    const todayResult = await query('SELECT COUNT(*) FROM violations WHERE DATE(created_at) = CURRENT_DATE');
    const pendingResult = await query("SELECT COUNT(*) FROM violations WHERE status = 'PENDING'");
    
    const byTypeResult = await query('SELECT violation_type, COUNT(*) FROM violations GROUP BY violation_type');
    const byStatusResult = await query('SELECT status, COUNT(*) FROM violations GROUP BY status');
    
    const challansThisMonthResult = await query(`
      SELECT COUNT(*) FROM challans 
      WHERE EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      today: parseInt(todayResult.rows[0].count),
      pending: parseInt(pendingResult.rows[0].count),
      challansThisMonth: parseInt(challansThisMonthResult.rows[0].count),
      byType: byTypeResult.rows,
      byStatus: byStatusResult.rows
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDailyTrend = async (req, res) => {
  try {
    const result = await query(`
      SELECT DATE(created_at) as date, COUNT(*) 
      FROM violations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at) 
      ORDER BY DATE(created_at) ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily trend:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getByType = async (req, res) => {
  try {
    const result = await query('SELECT violation_type, COUNT(*) FROM violations GROUP BY violation_type');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching by type:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getHourlyHeatmap = async (req, res) => {
  try {
    const result = await query(`
      SELECT EXTRACT(DOW FROM created_at) as day_of_week, 
             EXTRACT(HOUR FROM created_at) as hour_of_day, 
             COUNT(*) 
      FROM violations 
      GROUP BY day_of_week, hour_of_day
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hourly heatmap:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getForecast = async (req, res) => {
  try {
    const result = await query(`
      SELECT DATE(created_at) as date, COUNT(*) 
      FROM violations 
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY DATE(created_at) 
      ORDER BY DATE(created_at) ASC
    `);
    
    const forecast = getSevenDayForecast(result.rows);
    res.json({ historical: result.rows, forecast });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
