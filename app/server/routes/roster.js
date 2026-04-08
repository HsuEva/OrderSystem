const express = require('express');
const router = express.Router();
const ops = require('../models/operations');

// GET all groups
router.get('/groups', async (req, res, next) => {
  try {
    const groups = await ops.getColleagueGroups();
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

// POST create group
router.post('/groups', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });
    const group = await ops.createColleagueGroup(name);
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

// PUT update group
router.put('/groups/:id', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });
    await ops.updateColleagueGroup(req.params.id, name);
    res.json({ id: req.params.id, name });
  } catch (err) {
    next(err);
  }
});

// DELETE group
router.delete('/groups/:id', async (req, res, next) => {
  try {
    await ops.deleteColleagueGroup(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET all colleagues (optionally filtered by group)
router.get('/colleagues', async (req, res, next) => {
  try {
    const { group_id } = req.query;
    const colleagues = await ops.getColleagues(group_id);
    res.json(colleagues);
  } catch (err) {
    next(err);
  }
});

// POST create colleague
router.post('/colleagues', async (req, res, next) => {
  try {
    const { name, employee_id, group_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Colleague name required' });
    const colleague = await ops.createColleague(name, employee_id || null, group_id || null);
    res.status(201).json(colleague);
  } catch (err) {
    next(err);
  }
});

// PUT update colleague
router.put('/colleagues/:id', async (req, res, next) => {
  try {
    const { name, employee_id, group_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Colleague name required' });
    await ops.updateColleague(req.params.id, name, employee_id || null, group_id || null);
    res.json({ id: req.params.id, name, employee_id, group_id });
  } catch (err) {
    next(err);
  }
});

// DELETE colleague
router.delete('/colleagues/:id', async (req, res, next) => {
  try {
    await ops.deleteColleague(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
