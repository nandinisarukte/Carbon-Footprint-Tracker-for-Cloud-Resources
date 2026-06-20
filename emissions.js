const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /emissions/dashboard - Fetch all statistics for charts and summary cards
router.get('/dashboard', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    // 1. Summary details (Total Resources, Total Energy, Total Carbon)
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT r.id) as total_resources,
        COALESCE(SUM(e.power_consumption), 0) as total_energy,
        COALESCE(SUM(e.carbon_emission), 0) as total_carbon
      FROM resources r
      LEFT JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
    `;
    const summaryResult = await db.query(summaryQuery, [userId]);
    const summary = summaryResult.rows[0];

    // 2. Daily Emissions (last 7 days or all days)
    const dailyQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('day', e.recorded_at), 'YYYY-MM-DD') as period,
        COALESCE(SUM(e.carbon_emission), 0) as carbon,
        COALESCE(SUM(e.power_consumption), 0) as energy
      FROM resources r
      JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      GROUP BY DATE_TRUNC('day', e.recorded_at)
      ORDER BY DATE_TRUNC('day', e.recorded_at) ASC
      LIMIT 30
    `;
    const dailyResult = await db.query(dailyQuery, [userId]);

    // 3. Weekly Emissions
    const weeklyQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('week', e.recorded_at), 'YYYY-"W"IW') as period,
        COALESCE(SUM(e.carbon_emission), 0) as carbon,
        COALESCE(SUM(e.power_consumption), 0) as energy
      FROM resources r
      JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      GROUP BY DATE_TRUNC('week', e.recorded_at)
      ORDER BY DATE_TRUNC('week', e.recorded_at) ASC
    `;
    const weeklyResult = await db.query(weeklyQuery, [userId]);

    // 4. Monthly Emissions
    const monthlyQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', e.recorded_at), 'YYYY-MM') as period,
        COALESCE(SUM(e.carbon_emission), 0) as carbon,
        COALESCE(SUM(e.power_consumption), 0) as energy
      FROM resources r
      JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      GROUP BY DATE_TRUNC('month', e.recorded_at)
      ORDER BY DATE_TRUNC('month', e.recorded_at) ASC
    `;
    const monthlyResult = await db.query(monthlyQuery, [userId]);

    // 5. Emissions by Provider
    const providerQuery = `
      SELECT 
        r.provider,
        COALESCE(SUM(e.carbon_emission), 0) as carbon,
        COALESCE(SUM(e.power_consumption), 0) as energy,
        COUNT(r.id) as count
      FROM resources r
      LEFT JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      GROUP BY r.provider
    `;
    const providerResult = await db.query(providerQuery, [userId]);

    // 6. Top Polluting Resources
    const topPollutingQuery = `
      SELECT 
        r.id,
        r.name,
        r.provider,
        r.type,
        COALESCE(SUM(e.carbon_emission), 0) as carbon
      FROM resources r
      JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      GROUP BY r.id, r.name, r.provider, r.type
      ORDER BY carbon DESC
      LIMIT 5
    `;
    const topPollutingResult = await db.query(topPollutingQuery, [userId]);

    res.json({
      summary: {
        totalResources: parseInt(summary.total_resources, 10),
        totalEnergy: parseFloat(summary.total_energy),
        totalCarbon: parseFloat(summary.total_carbon)
      },
      daily: dailyResult.rows,
      weekly: weeklyResult.rows,
      monthly: monthlyResult.rows,
      byProvider: providerResult.rows,
      topPolluting: topPollutingResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Database error fetching dashboard statistics' });
  }
});

module.exports = router;
