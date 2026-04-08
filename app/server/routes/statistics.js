const express = require('express');
const router = express.Router();
const ops = require('../models/operations');

// GET food summary statistics
router.get('/sessions/:session_id/food-summary', async (req, res, next) => {
  try {
    const summary = await ops.getFoodSummary(req.params.session_id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET drink summary statistics
router.get('/sessions/:session_id/drink-summary', async (req, res, next) => {
  try {
    const summary = await ops.getDrinkSummary(req.params.session_id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET combined statistics with CSV export option
router.get('/sessions/:session_id/export', async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const foodSummary = await ops.getFoodSummary(req.params.session_id);
    const drinkSummary = await ops.getDrinkSummary(req.params.session_id);
    
    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCsvExport(foodSummary, drinkSummary);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="order-summary-${req.params.session_id}.csv"`);
      // Excel on Windows often needs UTF-8 BOM to avoid mojibake.
      res.send('\uFEFF' + csvContent);
    } else {
      res.json({
        food_summary: foodSummary,
        drink_summary: drinkSummary
      });
    }
  } catch (err) {
    next(err);
  }
});

function generateCsvExport(foodSummary, drinkSummary) {
  const lines = [];
  
  // Food section
  lines.push('=== 食物統計 ===');
  lines.push('項目名稱,數量');
  for (const item of foodSummary) {
    lines.push(`${item.name},${item.total_quantity}`);
  }
  
  lines.push('');
  lines.push('=== 飲料統計 ===');
  lines.push('飲料,甜度,冰塊,數量');
  for (const item of drinkSummary) {
    lines.push(`${item.name},${item.sweetness},${item.ice},${item.total_quantity}`);
  }
  
  return lines.join('\n');
}

module.exports = router;
