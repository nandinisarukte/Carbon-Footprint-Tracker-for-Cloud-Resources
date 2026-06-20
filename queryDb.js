const db = require('./db');

async function testQuery() {
  try {
    console.log('--- USERS ---');
    const users = await db.query('SELECT * FROM users');
    console.log(users.rows);

    console.log('--- RESOURCES ---');
    const resources = await db.query('SELECT * FROM resources');
    console.log(resources.rows);

    console.log('--- EMISSION RECORDS ---');
    const emissions = await db.query('SELECT * FROM emission_records');
    console.log(emissions.rows);
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    process.exit(0);
  }
}

testQuery();
