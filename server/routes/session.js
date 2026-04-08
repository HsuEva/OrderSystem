const express = require('express');
const router = express.Router();
const ops = require('../models/operations');

// GET all sessions
router.get('/', async (req, res, next) => {
  try {
    const sessions = await ops.getAllOrderSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// POST create session
router.post('/', async (req, res, next) => {
  try {
    const { name, submission_deadline } = req.body;
    if (!name) return res.status(400).json({ error: 'Session name required' });
    const session = await ops.createOrderSession(name, submission_deadline || null);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// GET session details
router.get('/:id', async (req, res, next) => {
  try {
    const session = await ops.getOrderSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// PUT update session deadline
router.put('/:id/deadline', async (req, res, next) => {
  try {
    const { submission_deadline } = req.body;
    const session = await ops.updateOrderSessionDeadline(
      req.params.id,
      submission_deadline || null
    );
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// PUT update session settings
router.put('/:id/settings', async (req, res, next) => {
  try {
    const session = await ops.updateOrderSessionSettings(req.params.id, req.body || {});
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// POST assign colleagues to session
router.post('/:id/assign-colleagues', async (req, res, next) => {
  try {
    const { colleague_ids } = req.body;
    if (!Array.isArray(colleague_ids)) {
      return res.status(400).json({ error: 'colleague_ids must be an array' });
    }
    await ops.assignColleaguesToSession(req.params.id, colleague_ids);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST assign groups to session
router.post('/:id/assign-groups', async (req, res, next) => {
  try {
    const { group_ids } = req.body;
    if (!Array.isArray(group_ids)) {
      return res.status(400).json({ error: 'group_ids must be an array' });
    }
    await ops.assignGroupsToSession(req.params.id, group_ids);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE session
router.delete('/:id', async (req, res, next) => {
  try {
    await ops.deleteOrderSession(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
