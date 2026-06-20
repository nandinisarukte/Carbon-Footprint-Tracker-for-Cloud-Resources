const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function bootstrap() {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbName = process.env.DB_DATABASE || 'carbon_tracker';

  console.log(`Attempting to connect to PostgreSQL at ${dbHost}:${dbPort} as user '${dbUser}'...`);

  // Connect to default 'postgres' database first to create the app database if missing
  const clientDefault = new Client({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: dbPort,
    database: 'postgres'
  });
  
  try {
    await clientDefault.connect();
    console.log('Successfully connected to default postgres database.');
    
    const checkDb = await clientDefault.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    
    if (checkDb.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating database...`);
      await clientDefault.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (error) {
    console.error('Failed to verify/create database:', error.message);
    console.log('Please make sure your DB_USER and DB_PASSWORD are correct in your backend/.env file.');
    process.exit(1);
  } finally {
    await clientDefault.end();
  }

  // Connect to application database to run DDL schema
  const clientApp = new Client({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: dbPort,
    database: dbName
  });

  try {
    await clientApp.connect();
    console.log(`Connected to app database '${dbName}'. Running schema setup...`);
    
    const sqlPath = path.join(__dirname, '../models/db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    await clientApp.query(sqlContent);
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Failed to run schema setup migrations:', error.message);
    process.exit(1);
  } finally {
    await clientApp.end();
  }
}

// Run bootstrap if called directly
if (require.main === module) {
  bootstrap();
}

module.exports = bootstrap;
