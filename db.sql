-- Create database
-- CREATE DATABASE carbon_tracker;

-- Connect to database
-- \c carbon_tracker;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- AWS, Azure, GCP
    region VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    cpu_usage NUMERIC(5,2) NOT NULL CHECK (cpu_usage >= 0 AND cpu_usage <= 100),
    memory_usage NUMERIC(5,2) NOT NULL CHECK (memory_usage >= 0 AND memory_usage <= 100),
    storage_usage NUMERIC(12,2) NOT NULL CHECK (storage_usage >= 0),
    network_usage NUMERIC(12,2) NOT NULL CHECK (network_usage >= 0),
    runtime_hours NUMERIC(10,2) NOT NULL CHECK (runtime_hours >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emission Records Table
CREATE TABLE IF NOT EXISTS emission_records (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    power_consumption NUMERIC(12,4) NOT NULL, -- in kWh
    carbon_emission NUMERIC(12,4) NOT NULL,    -- in gCO2e or kgCO2e depending on scale. Let's assume gCO2e
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
