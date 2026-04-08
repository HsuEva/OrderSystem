const express = require('express');
const router = express.Router();
const ops = require('../models/operations');

// GET menu items for session
router.get('/sessions/:session_id', async (req, res, next) => {
  try {
    const items = await ops.getMenuItems(req.params.session_id);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST add menu item
router.post('/sessions/:session_id/items', async (req, res, next) => {
  try {
    const { item_type, name } = req.body;
    if (!item_type || !name) {
      return res.status(400).json({ error: 'item_type and name required' });
    }
    const item = await ops.addMenuItem(req.params.session_id, item_type, name);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE menu item
router.delete('/items/:id', async (req, res, next) => {
  try {
    await ops.deleteMenuItem(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST set sweetness levels (bulk operation)
router.post('/sessions/:session_id/sweetness-levels', async (req, res, next) => {
  try {
    const { levels, level } = req.body;
    
    // Support single level creation (new endpoint style)
    if (level && !levels) {
      const result = await ops.addSweetnessLevel(req.params.session_id, level);
      return res.status(201).json(result);
    }
    
    // Support array of levels (bulk operation)
    if (!Array.isArray(levels)) {
      return res.status(400).json({ error: 'levels must be an array or provide level' });
    }
    await ops.setSweetnessLevels(req.params.session_id, levels);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE sweetness level
router.delete('/sweetness-levels/:id', async (req, res, next) => {
  try {
    await ops.deleteSweetnessLevel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET sweetness levels
router.get('/sessions/:session_id/sweetness-levels', async (req, res, next) => {
  try {
    const levels = await ops.getSweetnessLevels(req.params.session_id);
    res.json(levels);
  } catch (err) {
    next(err);
  }
});

// POST set ice levels (bulk operation)
router.post('/sessions/:session_id/ice-levels', async (req, res, next) => {
  try {
    const { levels, level } = req.body;
    
    // Support single level creation (new endpoint style)
    if (level && !levels) {
      const result = await ops.addIceLevel(req.params.session_id, level);
      return res.status(201).json(result);
    }
    
    // Support array of levels (bulk operation)
    if (!Array.isArray(levels)) {
      return res.status(400).json({ error: 'levels must be an array or provide level' });
    }
    await ops.setIceLevels(req.params.session_id, levels);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE ice level
router.delete('/ice-levels/:id', async (req, res, next) => {
  try {
    await ops.deleteIceLevel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET ice levels
router.get('/sessions/:session_id/ice-levels', async (req, res, next) => {
  try {
    const levels = await ops.getIceLevels(req.params.session_id);
    res.json(levels);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
