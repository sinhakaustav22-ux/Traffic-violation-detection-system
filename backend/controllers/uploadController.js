import { query } from '../config/db.js';
import { processFile as mlProcessFile } from '../services/mlBridgeService.js';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    const result = await query(`
      INSERT INTO uploaded_files (original_name, saved_path, file_type, uploaded_by) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [req.file.originalname, req.file.path, 'VIDEO', req.user.id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    const result = await query(`
      INSERT INTO uploaded_files (original_name, saved_path, file_type, uploaded_by) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [req.file.originalname, req.file.path, 'IMAGE', req.user.id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const processFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM uploaded_files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = result.rows[0];
    if (file.processed) {
      return res.status(400).json({ error: 'File already processed' });
    }
    
    // Start ML processing asynchronously
    mlProcessFile(file.saved_path, file.file_type, file.id)
      .then(result => {
        console.log(`Processing complete for file ${id}: ${result.violations_found} violations found`);
      })
      .catch(err => {
        console.error(`Processing failed for file ${id}:`, err);
      });
    
    res.json({ message: 'Processing started', file_id: id });
  } catch (error) {
    console.error('Error starting file processing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFiles = async (req, res) => {
  try {
    const result = await query(`
      SELECT f.*, u.name as uploader_name 
      FROM uploaded_files f 
      LEFT JOIN users u ON f.uploaded_by = u.id 
      ORDER BY f.uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
