-- Colleague Roster Management
CREATE TABLE IF NOT EXISTS colleague_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colleagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT,
  group_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES colleague_groups(id)
);

-- Order Session Management
CREATE TABLE IF NOT EXISTS order_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  colleague_roster_id TEXT,
  submission_deadline DATETIME,
  max_food_items INTEGER NOT NULL DEFAULT 2,
  max_drink_items INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_assigned_colleagues (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  colleague_id TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id),
  FOREIGN KEY (colleague_id) REFERENCES colleagues(id),
  UNIQUE(session_id, colleague_id)
);

CREATE TABLE IF NOT EXISTS session_assigned_groups (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id),
  FOREIGN KEY (group_id) REFERENCES colleague_groups(id),
  UNIQUE(session_id, group_id)
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('food', 'drink')),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id)
);

CREATE TABLE IF NOT EXISTS sweetness_levels (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  level TEXT NOT NULL,
  display_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id),
  UNIQUE(session_id, level)
);

CREATE TABLE IF NOT EXISTS ice_levels (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  level TEXT NOT NULL,
  display_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id),
  UNIQUE(session_id, level)
);

-- Submissions
CREATE TABLE IF NOT EXISTS order_submissions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  colleague_id TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES order_sessions(id),
  FOREIGN KEY (colleague_id) REFERENCES colleagues(id),
  UNIQUE(session_id, colleague_id)
);

CREATE TABLE IF NOT EXISTS submission_items (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sweetness_id TEXT,
  ice_level_id TEXT,
  FOREIGN KEY (submission_id) REFERENCES order_submissions(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
  FOREIGN KEY (sweetness_id) REFERENCES sweetness_levels(id),
  FOREIGN KEY (ice_level_id) REFERENCES ice_levels(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_colleagues_group ON colleagues(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_session ON menu_items(session_id);
CREATE INDEX IF NOT EXISTS idx_order_submissions_session ON order_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_order_submissions_colleague ON order_submissions(colleague_id);
CREATE INDEX IF NOT EXISTS idx_submission_items_submission ON submission_items(submission_id);
