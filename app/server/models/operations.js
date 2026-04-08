const { getDatabase } = require('./db');
const { v4: uuidv4 } = require('uuid');

// ===== COLLEAGUE ROSTER OPERATIONS =====

async function createColleagueGroup(name) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    'INSERT INTO colleague_groups (id, name) VALUES (?, ?)',
    [id, name]
  );
  return { id, name };
}

async function getColleagueGroups() {
  const db = getDatabase();
  return db.all('SELECT * FROM colleague_groups ORDER BY name');
}

async function updateColleagueGroup(id, name) {
  const db = getDatabase();
  await db.run(
    'UPDATE colleague_groups SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, id]
  );
}

async function deleteColleagueGroup(id) {
  const db = getDatabase();
  // Check for active submissions in any session using this group
  const activeSubmissions = await db.get(
    `SELECT COUNT(*) as count FROM order_submissions os
     INNER JOIN session_assigned_colleagues sac ON os.session_id = sac.session_id
     INNER JOIN colleagues c ON sac.colleague_id = c.id
     WHERE c.group_id = ? AND os.updated_at > datetime('now', '-24 hours')`,
    [id]
  );
  
  if (activeSubmissions && activeSubmissions.count > 0) {
    throw new Error(`Cannot delete group ${id}: has ${activeSubmissions.count} active submissions`);
  }
  
  await db.run('DELETE FROM colleague_groups WHERE id = ?', [id]);
}

async function createColleague(name, employeeId, groupId) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    'INSERT INTO colleagues (id, name, employee_id, group_id) VALUES (?, ?, ?, ?)',
    [id, name, employeeId, groupId]
  );
  return { id, name, employee_id: employeeId, group_id: groupId };
}

async function getColleagues(groupId = null) {
  const db = getDatabase();
  if (groupId) {
    return db.all(
      'SELECT * FROM colleagues WHERE group_id = ? ORDER BY name',
      [groupId]
    );
  }
  return db.all('SELECT * FROM colleagues ORDER BY name');
}

async function updateColleague(id, name, employeeId, groupId) {
  const db = getDatabase();
  await db.run(
    'UPDATE colleagues SET name = ?, employee_id = ?, group_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, employeeId, groupId, id]
  );
}

async function deleteColleague(id) {
  const db = getDatabase();
  // Check for active submissions
  const activeSubmissions = await db.get(
    `SELECT COUNT(*) as count FROM order_submissions 
     WHERE colleague_id = ? AND updated_at > datetime('now', '-24 hours')`,
    [id]
  );
  
  if (activeSubmissions && activeSubmissions.count > 0) {
    throw new Error(`Cannot delete colleague ${id}: has ${activeSubmissions.count} active submissions`);
  }
  
  await db.run('DELETE FROM colleagues WHERE id = ?', [id]);
}

// ===== ORDER SESSION OPERATIONS =====

async function createOrderSession(name, submissionDeadline = null) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    'INSERT INTO order_sessions (id, name, submission_deadline, max_food_items, max_drink_items) VALUES (?, ?, ?, ?, ?)',
    [id, name, submissionDeadline, 2, 1]
  );
  return { id, name, submission_deadline: submissionDeadline, max_food_items: 2, max_drink_items: 1 };
}

async function getOrderSession(id) {
  const db = getDatabase();
  const session = await db.get(
    'SELECT * FROM order_sessions WHERE id = ?',
    [id]
  );
  
  if (!session) return null;
  
  // Load assigned colleagues and groups
  const assignedColleagues = await db.all(
    'SELECT colleague_id FROM session_assigned_colleagues WHERE session_id = ?',
    [id]
  );
  const assignedGroups = await db.all(
    'SELECT group_id FROM session_assigned_groups WHERE session_id = ?',
    [id]
  );
  
  session.assigned_colleague_ids = assignedColleagues.map(c => c.colleague_id);
  session.assigned_group_ids = assignedGroups.map(g => g.group_id);
  
  return session;
}

async function getAllOrderSessions() {
  const db = getDatabase();
  return db.all(
    'SELECT * FROM order_sessions ORDER BY created_at DESC'
  );
}

async function updateOrderSessionDeadline(sessionId, submissionDeadline = null) {
  const db = getDatabase();
  await db.run(
    'UPDATE order_sessions SET submission_deadline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [submissionDeadline, sessionId]
  );
  return getOrderSession(sessionId);
}

async function updateOrderSessionSettings(sessionId, settings) {
  const db = getDatabase();
  const maxFoodItems = Number.isFinite(Number(settings.max_food_items)) ? Number(settings.max_food_items) : 2;
  const maxDrinkItems = Number.isFinite(Number(settings.max_drink_items)) ? Number(settings.max_drink_items) : 1;
  await db.run(
    `UPDATE order_sessions
     SET submission_deadline = ?,
         max_food_items = ?,
         max_drink_items = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [settings.submission_deadline || null, maxFoodItems, maxDrinkItems, sessionId]
  );
  return getOrderSession(sessionId);
}

async function assignColleaguesToSession(sessionId, colleagueIds) {
  const db = getDatabase();
  
  // Clear existing assignments
  await db.run('DELETE FROM session_assigned_colleagues WHERE session_id = ?', [sessionId]);
  
  // Insert new assignments
  for (const colleagueId of colleagueIds) {
    const id = uuidv4();
    await db.run(
      'INSERT INTO session_assigned_colleagues (id, session_id, colleague_id) VALUES (?, ?, ?)',
      [id, sessionId, colleagueId]
    );
  }
}

async function assignGroupsToSession(sessionId, groupIds) {
  const db = getDatabase();
  
  // Clear existing group assignments
  await db.run('DELETE FROM session_assigned_groups WHERE session_id = ?', [sessionId]);
  
  // Insert new group assignments
  for (const groupId of groupIds) {
    const id = uuidv4();
    await db.run(
      'INSERT INTO session_assigned_groups (id, session_id, group_id) VALUES (?, ?, ?)',
      [id, sessionId, groupId]
    );
  }
}

// ===== MENU OPERATIONS =====

async function addMenuItem(sessionId, itemType, name) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    'INSERT INTO menu_items (id, session_id, item_type, name) VALUES (?, ?, ?, ?)',
    [id, sessionId, itemType, name]
  );
  return { id, session_id: sessionId, item_type: itemType, name };
}

async function getMenuItems(sessionId) {
  const db = getDatabase();
  const items = await db.all(
    'SELECT * FROM menu_items WHERE session_id = ? ORDER BY item_type, name',
    [sessionId]
  );
  return items;
}

async function deleteMenuItem(id) {
  const db = getDatabase();
  // Check if any submissions reference this item
  const count = await db.get(
    'SELECT COUNT(*) as count FROM submission_items WHERE menu_item_id = ?',
    [id]
  );
  
  if (count && count.count > 0) {
    throw new Error(`Cannot delete menu item: ${count.count} submissions reference it`);
  }
  
  await db.run('DELETE FROM menu_items WHERE id = ?', [id]);
}

// ===== SWEETNESS & ICE OPERATIONS =====

async function setSweetnessLevels(sessionId, levels) {
  const db = getDatabase();
  await db.run('DELETE FROM sweetness_levels WHERE session_id = ?', [sessionId]);
  
  for (let i = 0; i < levels.length; i++) {
    const id = uuidv4();
    await db.run(
      'INSERT INTO sweetness_levels (id, session_id, level, display_order) VALUES (?, ?, ?, ?)',
      [id, sessionId, levels[i], i]
    );
  }
}

async function getSweetnessLevels(sessionId) {
  const db = getDatabase();
  return db.all(
    'SELECT * FROM sweetness_levels WHERE session_id = ? ORDER BY display_order',
    [sessionId]
  );
}

async function addSweetnessLevel(sessionId, level) {
  const db = getDatabase();
  const id = uuidv4();
  
  // Get highest display_order for this session
  const result = await db.get(
    'SELECT COALESCE(MAX(display_order), -1) as max_order FROM sweetness_levels WHERE session_id = ?',
    [sessionId]
  );
  const displayOrder = (result ? result.max_order : -1) + 1;
  
  await db.run(
    'INSERT INTO sweetness_levels (id, session_id, level, display_order) VALUES (?, ?, ?, ?)',
    [id, sessionId, level, displayOrder]
  );
  
  return { id, session_id: sessionId, level, display_order: displayOrder };
}

async function deleteSweetnessLevel(id) {
  const db = getDatabase();
  await db.run('DELETE FROM sweetness_levels WHERE id = ?', [id]);
}

async function setIceLevels(sessionId, levels) {
  const db = getDatabase();
  await db.run('DELETE FROM ice_levels WHERE session_id = ?', [sessionId]);
  
  for (let i = 0; i < levels.length; i++) {
    const id = uuidv4();
    await db.run(
      'INSERT INTO ice_levels (id, session_id, level, display_order) VALUES (?, ?, ?, ?)',
      [id, sessionId, levels[i], i]
    );
  }
}

async function getIceLevels(sessionId) {
  const db = getDatabase();
  return db.all(
    'SELECT * FROM ice_levels WHERE session_id = ? ORDER BY display_order',
    [sessionId]
  );
}

async function addIceLevel(sessionId, level) {
  const db = getDatabase();
  const id = uuidv4();
  
  // Get highest display_order for this session
  const result = await db.get(
    'SELECT COALESCE(MAX(display_order), -1) as max_order FROM ice_levels WHERE session_id = ?',
    [sessionId]
  );
  const displayOrder = (result ? result.max_order : -1) + 1;
  
  await db.run(
    'INSERT INTO ice_levels (id, session_id, level, display_order) VALUES (?, ?, ?, ?)',
    [id, sessionId, level, displayOrder]
  );
  
  return { id, session_id: sessionId, level, display_order: displayOrder };
}

async function deleteIceLevel(id) {
  const db = getDatabase();
  await db.run('DELETE FROM ice_levels WHERE id = ?', [id]);
}

// ===== SUBMISSION OPERATIONS =====

async function submitOrder(sessionId, colleagueId, items) {
  const db = getDatabase();
  
  // Validate session deadline
  const session = await db.get(
    'SELECT submission_deadline FROM order_sessions WHERE id = ?',
    [sessionId]
  );
  
  if (session && session.submission_deadline) {
    const deadline = new Date(session.submission_deadline);
    if (new Date() > deadline) {
      throw new Error('Session submission deadline has passed');
    }
  }

  const menuItems = await db.all(
    `SELECT id, item_type FROM menu_items WHERE session_id = ? AND id IN (${items.map(() => '?').join(',')})`,
    [sessionId, ...items.map(item => item.menu_item_id)]
  );
  const menuItemMap = new Map(menuItems.map(item => [item.id, item.item_type]));

  let foodTotal = 0;
  let drinkTotal = 0;
  for (const item of items) {
    const quantity = Number(item.quantity || 0);
    const itemType = menuItemMap.get(item.menu_item_id);
    if (!itemType) {
      throw new Error('Invalid menu item for this session');
    }
    if (itemType === 'food') {
      foodTotal += quantity;
    }
    if (itemType === 'drink') {
      drinkTotal += quantity;
    }
  }

  const maxFoodItems = session && session.max_food_items != null ? Number(session.max_food_items) : 2;
  const maxDrinkItems = session && session.max_drink_items != null ? Number(session.max_drink_items) : 1;
  if (foodTotal > maxFoodItems) {
    throw new Error(`Food selection exceeds limit (${maxFoodItems})`);
  }
  if (drinkTotal > maxDrinkItems) {
    throw new Error(`Drink selection exceeds limit (${maxDrinkItems})`);
  }
  
  // Validate colleague is in session roster
  const inRoster = await db.get(
    `SELECT 1 FROM session_assigned_colleagues 
     WHERE session_id = ? AND colleague_id = ?`,
    [sessionId, colleagueId]
  );
  
  if (!inRoster) {
    throw new Error('Colleague not in session roster');
  }
  
  // Delete previous submission if exists
  const previousSubmission = await db.get(
    'SELECT id FROM order_submissions WHERE session_id = ? AND colleague_id = ?',
    [sessionId, colleagueId]
  );
  
  if (previousSubmission) {
    // Delete submission items first (foreign key constraint)
    await db.run(
      'DELETE FROM submission_items WHERE submission_id = ?',
      [previousSubmission.id]
    );
    // Then delete the submission
    await db.run(
      'DELETE FROM order_submissions WHERE id = ?',
      [previousSubmission.id]
    );
  }
  
  // Create new submission
  const submissionId = uuidv4();
  await db.run(
    'INSERT INTO order_submissions (id, session_id, colleague_id) VALUES (?, ?, ?)',
    [submissionId, sessionId, colleagueId]
  );
  
  // Add submission items
  for (const item of items) {
    const itemId = uuidv4();
    await db.run(
      `INSERT INTO submission_items 
       (id, submission_id, menu_item_id, quantity, sweetness_id, ice_level_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [itemId, submissionId, item.menu_item_id, item.quantity || 1, item.sweetness_id || null, item.ice_level_id || null]
    );
  }
  
  return { id: submissionId, session_id: sessionId, colleague_id: colleagueId };
}

async function getSessionSubmissions(sessionId) {
  const db = getDatabase();
  return db.all(
    `SELECT os.*, c.name as colleague_name
     FROM order_submissions os
     JOIN colleagues c ON os.colleague_id = c.id
     WHERE os.session_id = ?
     ORDER BY c.name`,
    [sessionId]
  );
}

async function deleteSubmission(submissionId) {
  const db = getDatabase();
  await db.run('DELETE FROM submission_items WHERE submission_id = ?', [submissionId]);
  await db.run('DELETE FROM order_submissions WHERE id = ?', [submissionId]);
}

async function deleteOrderSession(sessionId) {
  const db = getDatabase();
  // Delete submission_items -> order_submissions -> menu-related -> session
  const submissions = await db.all('SELECT id FROM order_submissions WHERE session_id = ?', [sessionId]);
  for (const sub of submissions) {
    await db.run('DELETE FROM submission_items WHERE submission_id = ?', [sub.id]);
  }
  await db.run('DELETE FROM order_submissions WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM menu_items WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM sweetness_levels WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM ice_levels WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM session_assigned_colleagues WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM session_assigned_groups WHERE session_id = ?', [sessionId]);
  await db.run('DELETE FROM order_sessions WHERE id = ?', [sessionId]);
}

// ===== STATISTICS OPERATIONS =====

async function getFoodSummary(sessionId) {
  const db = getDatabase();
  return db.all(
    `SELECT 
       mi.id, mi.name,
       SUM(si.quantity) as total_quantity
     FROM submission_items si
     JOIN menu_items mi ON si.menu_item_id = mi.id
     WHERE mi.session_id = ? AND mi.item_type = 'food'
     GROUP BY mi.id, mi.name
     ORDER BY mi.name`,
    [sessionId]
  );
}

async function getDrinkSummary(sessionId) {
  const db = getDatabase();
  return db.all(
    `SELECT 
       mi.id, mi.name, COALESCE(sl.level, 'default') as sweetness, COALESCE(il.level, 'default') as ice,
       SUM(si.quantity) as total_quantity
     FROM submission_items si
     JOIN menu_items mi ON si.menu_item_id = mi.id
     LEFT JOIN sweetness_levels sl ON si.sweetness_id = sl.id
     LEFT JOIN ice_levels il ON si.ice_level_id = il.id
     WHERE mi.session_id = ? AND mi.item_type = 'drink'
     GROUP BY mi.id, si.sweetness_id, si.ice_level_id
     ORDER BY mi.name, sweetness, ice`,
    [sessionId]
  );
}

module.exports = {
  // Colleague Roster
  createColleagueGroup,
  getColleagueGroups,
  updateColleagueGroup,
  deleteColleagueGroup,
  createColleague,
  getColleagues,
  updateColleague,
  deleteColleague,
  
  // Order Session
  createOrderSession,
  getOrderSession,
  getAllOrderSessions,
  updateOrderSessionDeadline,
  updateOrderSessionSettings,
  assignColleaguesToSession,
  assignGroupsToSession,
  
  // Menu
  addMenuItem,
  getMenuItems,
  deleteMenuItem,
  
  // Sweetness & Ice
  setSweetnessLevels,
  getSweetnessLevels,
  addSweetnessLevel,
  deleteSweetnessLevel,
  setIceLevels,
  getIceLevels,
  addIceLevel,
  deleteIceLevel,
  
  // Submissions
  submitOrder,
  getSessionSubmissions,
  deleteSubmission,
  deleteOrderSession,
  
  // Statistics
  getFoodSummary,
  getDrinkSummary
};
