const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { initializeDatabase, closeDatabase } = require('../server/models/db');
const app = require('../server/index');

const testDbPath = path.join(__dirname, '..', 'data', 'test.db');

beforeAll(async () => {
  process.env.APP_DB_PATH = testDbPath;
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  await initializeDatabase();
});

afterAll(async () => {
  await closeDatabase();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  delete process.env.APP_DB_PATH;
});

describe('Team Order Form System', () => {
  // Test suite for colleague roster management
  describe('Colleague Roster Management', () => {
    it('should create a colleague group', async () => {
      const res = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Engineering' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Engineering');
    });

    it('should list all colleague groups', async () => {
      await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Sales' });
      
      const res = await request(app).get('/api/roster/groups');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a colleague', async () => {
      const groupRes = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Marketing' });
      
      const res = await request(app)
        .post('/api/roster/colleagues')
        .send({
          name: 'John Doe',
          employee_id: 'EMP001',
          group_id: groupRes.body.id
        });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('John Doe');
      expect(res.body.employee_id).toBe('EMP001');
    });

    it('should list colleagues by group', async () => {
      const groupRes = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'HR' });
      
      await request(app)
        .post('/api/roster/colleagues')
        .send({
          name: 'Jane Smith',
          employee_id: 'EMP002',
          group_id: groupRes.body.id
        });
      
      const res = await request(app)
        .get(`/api/roster/colleagues?group_id=${groupRes.body.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // Test suite for order session management
  describe('Order Session Management', () => {
    it('should create an order session', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ name: 'Lunch Order 2024-01-15' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Lunch Order 2024-01-15');
    });

    it('should retrieve session details', async () => {
      const createRes = await request(app)
        .post('/api/sessions')
        .send({ name: 'Team Lunch' });
      
      const res = await request(app).get(`/api/sessions/${createRes.body.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Team Lunch');
    });

    it('should assign colleagues to session', async () => {
      const groupRes = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Ops' });
      
      const colleagueRes = await request(app)
        .post('/api/roster/colleagues')
        .send({
          name: 'Alice Brown',
          group_id: groupRes.body.id
        });
      
      const sessionRes = await request(app)
        .post('/api/sessions')
        .send({ name: 'Afternoon Snack' });
      
      const res = await request(app)
        .post(`/api/sessions/${sessionRes.body.id}/assign-colleagues`)
        .send({ colleague_ids: [colleagueRes.body.id] });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Test suite for menu management
  describe('Menu Management', () => {
    let sessionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ name: 'Menu Test Session' });
      sessionId = res.body.id;
    });

    it('should add food menu item', async () => {
      const res = await request(app)
        .post(`/api/menu/sessions/${sessionId}/items`)
        .send({ item_type: 'food', name: 'Fried Rice' });
      
      expect(res.status).toBe(201);
      expect(res.body.item_type).toBe('food');
      expect(res.body.name).toBe('Fried Rice');
    });

    it('should add drink menu item', async () => {
      const res = await request(app)
        .post(`/api/menu/sessions/${sessionId}/items`)
        .send({ item_type: 'drink', name: 'Tea' });
      
      expect(res.status).toBe(201);
      expect(res.body.item_type).toBe('drink');
    });

    it('should set sweetness levels', async () => {
      const res = await request(app)
        .post(`/api/menu/sessions/${sessionId}/sweetness-levels`)
        .send({ levels: ['Full Sugar', 'Half Sugar', 'No Sugar'] });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should get sweetness levels', async () => {
      const res = await request(app)
        .get(`/api/menu/sessions/${sessionId}/sweetness-levels`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should set ice levels', async () => {
      const res = await request(app)
        .post(`/api/menu/sessions/${sessionId}/ice-levels`)
        .send({ levels: ['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice'] });
      
      expect(res.status).toBe(200);
    });

    it('should get menu items for session', async () => {
      const res = await request(app)
        .get(`/api/menu/sessions/${sessionId}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Test suite for submissions and statistics
  describe('Order Submissions and Statistics', () => {
    let sessionId, colleagueId, foodItemId, drinkItemId, sweetnessId, iceId;

    beforeAll(async () => {
      // Create group and colleague
      const groupRes = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Test Team' });
      
      const colleagueRes = await request(app)
        .post('/api/roster/colleagues')
        .send({
          name: 'Test User',
          group_id: groupRes.body.id
        });
      colleagueId = colleagueRes.body.id;

      // Create session
      const sessionRes = await request(app)
        .post('/api/sessions')
        .send({ name: 'Test Order Session' });
      sessionId = sessionRes.body.id;

      // Assign colleague to session
      await request(app)
        .post(`/api/sessions/${sessionId}/assign-colleagues`)
        .send({ colleague_ids: [colleagueId] });

      // Add menu items
      const foodRes = await request(app)
        .post(`/api/menu/sessions/${sessionId}/items`)
        .send({ item_type: 'food', name: 'Noodles' });
      foodItemId = foodRes.body.id;

      const drinkRes = await request(app)
        .post(`/api/menu/sessions/${sessionId}/items`)
        .send({ item_type: 'drink', name: 'Coffee' });
      drinkItemId = drinkRes.body.id;

      // Set drink options
      const sweetnessRes = await request(app)
        .post(`/api/menu/sessions/${sessionId}/sweetness-levels`)
        .send({ levels: ['Sweet', 'Normal', 'Less Sweet'] });

      const iceRes = await request(app)
        .post(`/api/menu/sessions/${sessionId}/ice-levels`)
        .send({ levels: ['Hot', 'Lukewarm', 'Cold'] });

      // Get the IDs for submission
      const sweetnesses = await request(app)
        .get(`/api/menu/sessions/${sessionId}/sweetness-levels`);
      sweetnessId = sweetnesses.body[0]?.id;

      const ices = await request(app)
        .get(`/api/menu/sessions/${sessionId}/ice-levels`);
      iceId = ices.body[0]?.id;
    });

    it('should submit order with food and drink items', async () => {
      const res = await request(app)
        .post(`/api/submissions/sessions/${sessionId}/submit`)
        .send({
          colleague_id: colleagueId,
          items: [
            { menu_item_id: foodItemId, quantity: 2 },
            { menu_item_id: drinkItemId, quantity: 1, sweetness_id: sweetnessId, ice_level_id: iceId }
          ]
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should replace previous submission from same colleague', async () => {
      // First submission
      await request(app)
        .post(`/api/submissions/sessions/${sessionId}/submit`)
        .send({
          colleague_id: colleagueId,
          items: [{ menu_item_id: foodItemId, quantity: 1 }]
        });

      // Second submission (should replace)
      const res = await request(app)
        .post(`/api/submissions/sessions/${sessionId}/submit`)
        .send({
          colleague_id: colleagueId,
          items: [{ menu_item_id: foodItemId, quantity: 2 }]
        });

      expect(res.status).toBe(201);

      // Verify only latest submission exists
      const submissionsRes = await request(app)
        .get(`/api/submissions/sessions/${sessionId}`);
      
      const userSubmissions = submissionsRes.body.filter(s => s.colleague_id === colleagueId);
      expect(userSubmissions.length).toBe(1);
    });

    it('should calculate food summary', async () => {
      const res = await request(app)
        .get(`/api/statistics/sessions/${sessionId}/food-summary`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      const noodles = res.body.find(item => item.name === 'Noodles');
      expect(noodles).toBeDefined();
      expect(noodles.total_quantity).toBeGreaterThan(0);
    });

    it('should calculate drink summary with customization tuple', async () => {
      // Re-submit with drink to ensure drink summary is populated
      await request(app)
        .post(`/api/submissions/sessions/${sessionId}/submit`)
        .send({
          colleague_id: colleagueId,
          items: [
            { menu_item_id: foodItemId, quantity: 2 },
            { menu_item_id: drinkItemId, quantity: 1, sweetness_id: sweetnessId, ice_level_id: iceId }
          ]
        });

      const res = await request(app)
        .get(`/api/statistics/sessions/${sessionId}/drink-summary`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      const coffeeEntry = res.body.find(item => item.name === 'Coffee');
      expect(coffeeEntry).toBeDefined();
      expect(coffeeEntry.sweetness).toBeDefined();
      expect(coffeeEntry.ice).toBeDefined();
    });

    it('should export statistics as JSON', async () => {
      const res = await request(app)
        .get(`/api/statistics/sessions/${sessionId}/export?format=json`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('food_summary');
      expect(res.body).toHaveProperty('drink_summary');
      expect(Array.isArray(res.body.food_summary)).toBe(true);
      expect(Array.isArray(res.body.drink_summary)).toBe(true);
    });
  });

  // Test suite for deadline enforcement
  describe('Deadline Enforcement', () => {
    it('should reject submission after deadline', async () => {
      // Create session with past deadline
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const sessionRes = await request(app)
        .post('/api/sessions')
        .send({
          name: 'Past Deadline Session',
          submission_deadline: pastDate
        });

      const groupRes = await request(app)
        .post('/api/roster/groups')
        .send({ name: 'Test' });

      const colleagueRes = await request(app)
        .post('/api/roster/colleagues')
        .send({ name: 'Late User', group_id: groupRes.body.id });

      await request(app)
        .post(`/api/sessions/${sessionRes.body.id}/assign-colleagues`)
        .send({ colleague_ids: [colleagueRes.body.id] });

      const foodRes = await request(app)
        .post(`/api/menu/sessions/${sessionRes.body.id}/items`)
        .send({ item_type: 'food', name: 'Late Lunch' });

      const res = await request(app)
        .post(`/api/submissions/sessions/${sessionRes.body.id}/submit`)
        .send({
          colleague_id: colleagueRes.body.id,
          items: [{ menu_item_id: foodRes.body.id, quantity: 1 }]
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('deadline');
    });
  });
});

afterAll(async () => {
  await closeDatabase();
});
