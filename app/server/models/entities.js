/**
 * Data entity definitions for the team order form system
 * This file documents all data models and their relationships
 */

const DataEntities = {
  // Colleague Roster Models
  ColleagueGroup: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT NOT NULL',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Group classification for colleagues (e.g., department, team)'
  },

  Colleague: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT NOT NULL',
      employee_id: 'TEXT',
      group_id: 'TEXT FOREIGN KEY',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Individual colleague in the global roster'
  },

  // Order Session Models
  OrderSession: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT NOT NULL',
      colleague_roster_id: 'TEXT',
      submission_deadline: 'DATETIME',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Single order session instance with menu, roster, and deadline'
  },

  SessionAssignedCollleagues: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      colleague_id: 'TEXT FOREIGN KEY'
    },
    description: 'Individual colleague assignments to a session'
  },

  SessionAssignedGroup: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      group_id: 'TEXT FOREIGN KEY'
    },
    description: 'Group-level roster assignments to a session'
  },

  // Menu Models
  MenuItem: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      item_type: 'TEXT NOT NULL (food|drink)',
      name: 'TEXT NOT NULL',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Food or drink item available in a session'
  },

  SweetnessLevel: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      level: 'TEXT NOT NULL',
      display_order: 'INTEGER',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Drink sweetness option (e.g., full sugar, half sugar, no sugar)'
  },

  IceLevel: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      level: 'TEXT NOT NULL',
      display_order: 'INTEGER',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Drink ice level option (e.g., no ice, less ice, normal, extra ice)'
  },

  // Submission Models
  OrderSubmission: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      session_id: 'TEXT FOREIGN KEY',
      colleague_id: 'TEXT FOREIGN KEY',
      submitted_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    description: 'Single colleague order per session (latest submission only)',
    constraints: 'UNIQUE(session_id, colleague_id)'
  },

  SubmissionItem: {
    fields: {
      id: 'TEXT PRIMARY KEY',
      submission_id: 'TEXT FOREIGN KEY',
      menu_item_id: 'TEXT FOREIGN KEY',
      quantity: 'INTEGER NOT NULL DEFAULT 1',
      sweetness_id: 'TEXT FOREIGN KEY (nullable)',
      ice_level_id: 'TEXT FOREIGN KEY (nullable)'
    },
    description: 'Individual item line within a submission (e.g., 2x red tea with half sugar and normal ice)'
  }
};

module.exports = DataEntities;
