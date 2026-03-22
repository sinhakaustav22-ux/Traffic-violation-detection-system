CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin','traffic_officer','viewer')),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE violations (
  id SERIAL PRIMARY KEY,
  violation_type VARCHAR(30) NOT NULL CHECK (
    violation_type IN ('NO_HELMET','RED_LIGHT_JUMP','TRIPLE_RIDING','NO_SEATBELT')
  ),
  vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('TWO_WHEELER','FOUR_WHEELER','HEAVY_VEHICLE')),
  vehicle_number VARCHAR(20) DEFAULT 'UNKNOWN',
  location VARCHAR(100) DEFAULT 'College Main Gate',
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  snapshot_path VARCHAR(255),
  source_type VARCHAR(10) DEFAULT 'UPLOAD' CHECK (source_type IN ('UPLOAD','DATASET')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (
    status IN ('PENDING','REVIEWED','CHALLAN_ISSUED','DISMISSED')
  ),
  fine_amount INTEGER NOT NULL,
  reviewed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE challans (
  id SERIAL PRIMARY KEY,
  violation_id INTEGER UNIQUE REFERENCES violations(id),
  challan_number VARCHAR(30) UNIQUE NOT NULL,
  issued_by INTEGER REFERENCES users(id),
  issued_at TIMESTAMP DEFAULT NOW(),
  pdf_path VARCHAR(255),
  offender_name VARCHAR(100) DEFAULT 'Unknown',
  fine_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP
);

CREATE TABLE sms_alerts (
  id SERIAL PRIMARY KEY,
  violation_id INTEGER REFERENCES violations(id),
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('SMS','WHATSAPP')),
  sent_to VARCHAR(20) NOT NULL,
  message_sid VARCHAR(50),
  status VARCHAR(10) DEFAULT 'SENT',
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dashboard_notifications (
  id SERIAL PRIMARY KEY,
  violation_id INTEGER REFERENCES violations(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE uploaded_files (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255),
  saved_path VARCHAR(255),
  file_type VARCHAR(5) CHECK (file_type IN ('VIDEO','IMAGE')),
  processed BOOLEAN DEFAULT FALSE,
  violations_found INTEGER DEFAULT 0,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_violations_created_at ON violations(created_at);
CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_violations_type ON violations(violation_type);
