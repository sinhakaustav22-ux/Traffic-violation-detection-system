import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export const initDb = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = new Database(path.join(__dirname, '../../ctvds.sqlite'));
  
  // Enable foreign keys
  dbInstance.pragma('foreign_keys = ON');
  
  console.log('SQLite Database connected');
  return dbInstance;
};

// Initialize immediately
initDb().catch(err => console.error('Failed to init DB', err));

// Wrapper to make it compatible with pg's query(text, params)
export const query = async (text, params = []) => {
  const db = await initDb();
  
  // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
  let sqliteText = text.replace(/\$\d+/g, '?');
  
  // Convert booleans to 1/0 for SQLite
  const sqliteParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
  
  try {
    const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT') || 
                     sqliteText.trim().toUpperCase().startsWith('PRAGMA') ||
                     sqliteText.toUpperCase().includes('RETURNING');
                     
    if (isSelect) {
      const stmt = db.prepare(sqliteText);
      const rows = stmt.all(...sqliteParams);
      return { rows, rowCount: rows.length };
    } else {
      const stmt = db.prepare(sqliteText);
      const result = stmt.run(...sqliteParams);
      return { 
        rows: [], 
        rowCount: result.changes,
        lastInsertRowid: result.lastInsertRowid 
      };
    }
  } catch (error) {
    console.error('Database query error:', error, '\\nQuery:', sqliteText, '\\nParams:', sqliteParams);
    throw error;
  }
};

export default { query, initDb };
