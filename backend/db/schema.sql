CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','traffic_officer','viewer')),
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  violation_type TEXT NOT NULL CHECK (
    violation_type IN ('NO_HELMET','RED_LIGHT_JUMP','TRIPLE_RIDING','NO_SEATBELT')
  ),
  vehicle_type TEXT CHECK (vehicle_type IN ('TWO_WHEELER','FOUR_WHEELER','HEAVY_VEHICLE')),
  vehicle_number TEXT DEFAULT 'UNKNOWN',
  location TEXT DEFAULT 'College Main Gate',
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  snapshot_path TEXT,
  source_type TEXT DEFAULT 'UPLOAD' CHECK (source_type IN ('UPLOAD','DATASET')),
  status TEXT DEFAULT 'PENDING' CHECK (
    status IN ('PENDING','REVIEWED','CHALLAN_ISSUED','DISMISSED')
  ),
  fine_amount INTEGER NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  violation_id INTEGER UNIQUE REFERENCES violations(id),
  challan_number TEXT UNIQUE NOT NULL,
  issued_by INTEGER REFERENCES users(id),
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  pdf_path TEXT,
  offender_name TEXT DEFAULT 'Unknown',
  fine_paid INTEGER DEFAULT 0,
  paid_at DATETIME
);

CREATE TABLE sms_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  violation_id INTEGER REFERENCES violations(id),
  channel TEXT NOT NULL CHECK (channel IN ('SMS','WHATSAPP')),
  sent_to TEXT NOT NULL,
  message_sid TEXT,
  status TEXT DEFAULT 'SENT',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  violation_id INTEGER REFERENCES violations(id),
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE uploaded_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT,
  saved_path TEXT,
  file_type TEXT CHECK (file_type IN ('VIDEO','IMAGE')),
  processed INTEGER DEFAULT 0,
  violations_found INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_created_at ON violations(created_at);
CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_violations_type ON violations(violation_type);
