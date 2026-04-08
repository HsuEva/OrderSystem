const express = require('express');
const router = express.Router();
const ops = require('../models/operations');

// POST submit order
router.post('/sessions/:session_id/submit', async (req, res, next) => {
  try {
    const { colleague_id, items } = req.body;
    if (!colleague_id || !Array.isArray(items)) {
      return res.status(400).json({ error: 'colleague_id and items array required' });
    }
    const submission = await ops.submitOrder(req.params.session_id, colleague_id, items);
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
});

// GET session submissions
router.get('/sessions/:session_id', async (req, res, next) => {
  try {
    const submissions = await ops.getSessionSubmissions(req.params.session_id);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// DELETE submission
router.delete('/:id', async (req, res, next) => {
  try {
    await ops.deleteSubmission(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
