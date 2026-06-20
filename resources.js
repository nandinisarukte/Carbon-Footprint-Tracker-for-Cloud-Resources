const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

const regionIntensities = {
  'AWS us-east-1': 380,
  'AWS us-west-2': 180,
  'Azure westeurope': 120,
  'GCP us-central1': 320
};

// Helper for calculations
function calculateFootprint(cpuUsage, runtimeHours, provider, region) {
  const cpu = parseFloat(cpuUsage || 0);
  const runtime = parseFloat(runtimeHours || 0);
  const powerConsumption = cpu * runtime * 0.05; // (CPU Usage % * Runtime Hours * 0.05)
  const lookupKey = `${provider} ${region}`;
  const intensity = regionIntensities[lookupKey] || 250; // default intensity
  const carbonEmission = powerConsumption * intensity;
  return { powerConsumption, carbonEmission };
}

// GET /resources - Get all resources for authenticated user
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    const queryText = `
      SELECT r.*, e.power_consumption, e.carbon_emission, e.recorded_at 
      FROM resources r
      LEFT JOIN emission_records e ON r.id = e.resource_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(queryText, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Database error fetching resources' });
  }
});

// POST /resources - Create a new resource
router.post('/', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const {
    name,
    provider,
    region,
    type,
    cpu_usage,
    memory_usage,
    storage_usage,
    network_usage,
    runtime_hours
  } = req.body;

  if (!name || !provider || !region || !type) {
    return res.status(400).json({ error: 'Missing required resource fields' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Insert Resource
    const insertResourceQuery = `
      INSERT INTO resources 
        (user_id, name, provider, region, type, cpu_usage, memory_usage, storage_usage, network_usage, runtime_hours) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    const resourceResult = await client.query(insertResourceQuery, [
      userId,
      name,
      provider,
      region,
      type,
      cpu_usage || 0,
      memory_usage || 0,
      storage_usage || 0,
      network_usage || 0,
      runtime_hours || 0
    ]);

    const resource = resourceResult.rows[0];

    // Calculate footprint
    const { powerConsumption, carbonEmission } = calculateFootprint(
      resource.cpu_usage,
      resource.runtime_hours,
      resource.provider,
      resource.region
    );

    // Insert Emission Record
    const insertEmissionQuery = `
      INSERT INTO emission_records 
        (resource_id, power_consumption, carbon_emission) 
      VALUES 
        ($1, $2, $3) 
      RETURNING *
    `;
    const emissionResult = await client.query(insertEmissionQuery, [
      resource.id,
      powerConsumption,
      carbonEmission
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Resource created and emission recorded',
      resource: {
        ...resource,
        power_consumption: emissionResult.rows[0].power_consumption,
        carbon_emission: emissionResult.rows[0].carbon_emission
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting resource:', error);
    res.status(500).json({ error: 'Database error inserting resource' });
  } finally {
    client.release();
  }
});

// PUT /resources/:id - Edit resource
router.put('/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const {
    name,
    provider,
    region,
    type,
    cpu_usage,
    memory_usage,
    storage_usage,
    network_usage,
    runtime_hours
  } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Confirm ownership
    const checkResult = await client.query('SELECT * FROM resources WHERE id = $1 AND user_id = $2', [id, userId]);
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }

    // Update Resource
    const updateQuery = `
      UPDATE resources 
      SET 
        name = COALESCE($1, name),
        provider = COALESCE($2, provider),
        region = COALESCE($3, region),
        type = COALESCE($4, type),
        cpu_usage = COALESCE($5, cpu_usage),
        memory_usage = COALESCE($6, memory_usage),
        storage_usage = COALESCE($7, storage_usage),
        network_usage = COALESCE($8, network_usage),
        runtime_hours = COALESCE($9, runtime_hours),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    const resourceResult = await client.query(updateQuery, [
      name,
      provider,
      region,
      type,
      cpu_usage,
      memory_usage,
      storage_usage,
      network_usage,
      runtime_hours,
      id
    ]);

    const resource = resourceResult.rows[0];

    // Re-calculate footprint
    const { powerConsumption, carbonEmission } = calculateFootprint(
      resource.cpu_usage,
      resource.runtime_hours,
      resource.provider,
      resource.region
    );

    // Update or insert emission record
    const updateEmissionQuery = `
      INSERT INTO emission_records (resource_id, power_consumption, carbon_emission)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE 
      SET power_consumption = EXCLUDED.power_consumption, carbon_emission = EXCLUDED.carbon_emission
      RETURNING *
    `;
    
    // Note: To simplify conflict update with single constraint, we can check if it exists first or just overwrite/update
    const emissionCheck = await client.query('SELECT id FROM emission_records WHERE resource_id = $1', [id]);
    let emissionResult;
    if (emissionCheck.rows.length > 0) {
      emissionResult = await client.query(
        'UPDATE emission_records SET power_consumption = $1, carbon_emission = $2 WHERE resource_id = $3 RETURNING *',
        [powerConsumption, carbonEmission, id]
      );
    } else {
      emissionResult = await client.query(
        'INSERT INTO emission_records (resource_id, power_consumption, carbon_emission) VALUES ($1, $2, $3) RETURNING *',
        [id, powerConsumption, carbonEmission]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Resource updated successfully',
      resource: {
        ...resource,
        power_consumption: emissionResult.rows[0].power_consumption,
        carbon_emission: emissionResult.rows[0].carbon_emission
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Database error updating resource' });
  } finally {
    client.release();
  }
});

// DELETE /resources/:id - Delete resource
router.delete('/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM resources WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }
    res.json({ message: 'Resource and associated emission records deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Database error deleting resource' });
  }
});

module.exports = router;
