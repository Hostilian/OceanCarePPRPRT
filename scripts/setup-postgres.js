#!/usr/bin/env node

/**
 * Database Setup for Production
 * 
 * This script sets up a PostgreSQL database for OceanCare production deployment.
 * 
 * Prerequisites:
 * - PostgreSQL 12+ installed
 * - psql command available
 * - Root/admin access to PostgreSQL
 * 
 * Usage:
 *   node scripts/setup-postgres.js
 * 
 * Or manually run the SQL commands in postgres-setup.sql
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   OceanCare PostgreSQL Setup Script     ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Get database details
    const host = await question('PostgreSQL Host [localhost]: ') || 'localhost';
    const port = await question('PostgreSQL Port [5432]: ') || '5432';
    const adminUser = await question('PostgreSQL Admin User [postgres]: ') || 'postgres';
    const adminPassword = await question('PostgreSQL Admin Password: ');
    
    const dbName = await question('Database Name [oceancare]: ') || 'oceancare';
    const dbUser = await question('Database User [oceancare_user]: ') || 'oceancare_user';
    const dbPassword = await question('Database User Password: ');

    console.log('\n🔄 Setting up PostgreSQL database...\n');

    // Create database and user
    const sqlSetup = `
-- OceanCare Database Setup

-- Create database
CREATE DATABASE "${dbName}" 
  OWNER postgres 
  ENCODING 'UTF8' 
  LOCALE 'C' 
  TEMPLATE template0;

-- Create limited-privilege user
CREATE USER "${dbUser}" WITH ENCRYPTED PASSWORD '${dbPassword}' VALID UNTIL 'infinity';

-- Grant privileges
GRANT CONNECT ON DATABASE "${dbName}" TO "${dbUser}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${dbUser}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${dbUser}";

-- Connect to database and create schema
\\c ${dbName}

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  purpose VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  receipt_email VARCHAR(255),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  interests TEXT,
  availability VARCHAR(255),
  location VARCHAR(255),
  background TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debris_reports (
  id SERIAL PRIMARY KEY,
  reporter_email VARCHAR(255),
  debris_type VARCHAR(100),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'new',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  activity_type VARCHAR(100),
  description TEXT,
  impact_value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_type VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_stripe_payment_intent ON donations(stripe_payment_intent_id);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_volunteers_email ON volunteers(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_debris_reports_status ON debris_reports(status);
CREATE INDEX idx_debris_reports_location ON debris_reports(latitude, longitude);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);

-- Grant permissions to user
GRANT USAGE ON SCHEMA public TO "${dbUser}";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${dbUser}";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO "${dbUser}";

-- Create backup user for automated backups
CREATE USER oceancare_backup WITH ENCRYPTED PASSWORD '${dbPassword}_backup' VALID UNTIL 'infinity';
GRANT CONNECT ON DATABASE "${dbName}" TO oceancare_backup;
GRANT pg_read_all_data TO oceancare_backup;

-- Enable common extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log completion
SELECT 'OceanCare database setup completed at ' || NOW() as status;
`;

    // Save SQL to file
    const sqlPath = path.join(__dirname, '../database-setup.sql');
    fs.writeFileSync(sqlPath, sqlSetup);

    console.log(`✅ SQL setup file created: ${sqlPath}\n`);
    console.log('📋 Next steps:\n');
    console.log(`1. Run this command:\n`);
    console.log(`   PGPASSWORD='${adminPassword}' psql -h ${host} -p ${port} -U ${adminUser} < ${sqlPath}\n`);
    console.log(`2. Verify setup:\n`);
    console.log(`   psql -h ${host} -U ${dbUser} -d ${dbName} -c "SELECT version();"\n`);
    console.log(`3. Update .env.production:\n`);
    console.log(`   DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${host}:${port}/${dbName}\n`);
    console.log(`4. Test connection:\n`);
    console.log(`   npm run db:migrate\n`);

    rl.close();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
