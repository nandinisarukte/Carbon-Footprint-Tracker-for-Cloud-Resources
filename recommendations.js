const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /recommendations - Generate optimization recommendations based on resources
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const resourcesQuery = `
      SELECT r.*, e.carbon_emission, e.power_consumption 
      FROM resources r
      LEFT JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
    `;
    const result = await db.query(resourcesQuery, [userId]);
    const resources = result.rows;

    const recommendations = [];

    resources.forEach((resource) => {
      const cpu = parseFloat(resource.cpu_usage);
      const runtime = parseFloat(resource.runtime_hours);
      const storage = parseFloat(resource.storage_usage);
      const carbon = parseFloat(resource.carbon_emission || 0);

      // Rule 1: CPU < 20%
      if (cpu < 20) {
        // Potential savings could be estimated (e.g. 50% of current footprint if downsized)
        const potentialSavings = carbon * 0.5;
        recommendations.push({
          id: `rec-cpu-${resource.id}`,
          resourceId: resource.id,
          resourceName: resource.name,
          provider: resource.provider,
          type: resource.type,
          category: 'Right-sizing',
          severity: 'Medium',
          triggerValue: `${cpu}% CPU`,
          description: 'Resource appears underutilized. Consider downsizing.',
          potentialSavingsCarbon: parseFloat(potentialSavings.toFixed(2)),
          action: 'Resize the VM/Instance type to a smaller tier.'
        });
      }

      // Rule 2: Runtime > 12 hours
      if (runtime > 12) {
        // Savings if running on schedule (e.g., reduce runtime to 8 hours - saving 1/3 to 2/3)
        const potentialSavings = carbon * ((runtime - 8) / runtime);
        recommendations.push({
          id: `rec-runtime-${resource.id}`,
          resourceId: resource.id,
          resourceName: resource.name,
          provider: resource.provider,
          type: resource.type,
          category: 'Scheduling',
          severity: 'High',
          triggerValue: `${runtime} hrs Runtime`,
          description: 'Enable automatic shutdown scheduling.',
          potentialSavingsCarbon: parseFloat(potentialSavings.toFixed(2)),
          action: 'Set up an auto-stop policy or cron schedule to stop the resource during idle hours.'
        });
      }

      // Rule 3: Storage > 500 GB
      if (storage > 500) {
        // Savings if deleting unneeded backups/snapshots (e.g., standard flat rate or 20% carbon reduction)
        const potentialSavings = carbon * 0.15;
        recommendations.push({
          id: `rec-storage-${resource.id}`,
          resourceId: resource.id,
          resourceName: resource.name,
          provider: resource.provider,
          type: resource.type,
          category: 'Storage',
          severity: 'Low',
          triggerValue: `${storage} GB Storage`,
          description: 'Review unused storage volumes.',
          potentialSavingsCarbon: parseFloat(potentialSavings.toFixed(2)),
          action: 'Delete orphan volumes, configure lifecycle storage rules, or move files to archive tiers.'
        });
      }
    });

    // Sort by severity (High first) or potential savings
    recommendations.sort((a, b) => {
      const severityWeight = { High: 3, Medium: 2, Low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity] || b.potentialSavingsCarbon - a.potentialSavingsCarbon;
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Error compiling recommendations:', error);
    res.status(500).json({ error: 'Database error compiling recommendations' });
  }
});

module.exports = router;
