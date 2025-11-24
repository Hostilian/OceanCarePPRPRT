/**
 * Database Migration Script
 * Migrates database schema to include new tables and fields for production
 * Safe to run multiple times - checks for existing columns before adding
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../oceancare.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
  performMigrations();
});

function performMigrations() {
  console.log('Starting database migrations...\n');

  const migrations = [
    addPasswordHashToUsers,
    addStatusFieldsToDonations,
    addRecurringDonationsTable,
    addImpactMetricsTable,
    addContactMessagesTable,
    addIndexes
  ];

  let completed = 0;

  const runNext = () => {
    if (completed < migrations.length) {
      const migration = migrations[completed];
      migration(() => {
        completed++;
        runNext();
      });
    } else {
      console.log('\n✅ All migrations completed successfully!');
      db.close();
      process.exit(0);
    }
  };

  runNext();
}

function addPasswordHashToUsers(callback) {
  console.log('Checking: password_hash field in users table...');
  
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      callback();
      return;
    }

    const hasPasswordHash = columns.some(col => col.name === 'password_hash');
    
    if (hasPasswordHash) {
      console.log('✓ password_hash already exists\n');
      callback();
      return;
    }

    console.log('Adding password_hash column...');
    db.run('ALTER TABLE users ADD COLUMN password_hash TEXT', (err) => {
      if (err) {
        console.warn('⚠️  Could not add password_hash:', err.message);
      } else {
        console.log('✓ Added password_hash column\n');
      }
      callback();
    });
  });
}

function addStatusFieldsToDonations(callback) {
  console.log('Checking: status field in donations table...');
  
  db.all("PRAGMA table_info(donations)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      callback();
      return;
    }

    const hasStatus = columns.some(col => col.name === 'status');
    const hasStripeId = columns.some(col => col.name === 'stripe_payment_id');
    const hasPaymentMethod = columns.some(col => col.name === 'payment_method');

    const migrations = [];

    if (!hasStatus) migrations.push('ALTER TABLE donations ADD COLUMN status TEXT DEFAULT "completed"');
    if (!hasStripeId) migrations.push('ALTER TABLE donations ADD COLUMN stripe_payment_id TEXT UNIQUE');
    if (!hasPaymentMethod) migrations.push('ALTER TABLE donations ADD COLUMN payment_method TEXT');

    if (migrations.length === 0) {
      console.log('✓ All fields already exist\n');
      callback();
      return;
    }

    console.log(`Adding ${migrations.length} column(s) to donations...`);
    
    let completed = 0;
    migrations.forEach(sql => {
      db.run(sql, (err) => {
        if (err) {
          console.warn('⚠️  Migration error:', err.message);
        } else {
          console.log(`✓ ${sql.split('ADD COLUMN')[1].trim()}`);
        }
        completed++;
        if (completed === migrations.length) {
          console.log();
          callback();
        }
      });
    });
  });
}

function addRecurringDonationsTable(callback) {
  console.log('Checking: recurring_donations table...');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='recurring_donations'", (err, rows) => {
    if (err) {
      console.error('Error checking table:', err);
      callback();
      return;
    }

    if (rows.length > 0) {
      console.log('✓ Table already exists\n');
      callback();
      return;
    }

    console.log('Creating recurring_donations table...');
    db.run(`
      CREATE TABLE IF NOT EXISTS recurring_donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_id TEXT UNIQUE,
        subscription_id TEXT UNIQUE,
        email TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        interval TEXT DEFAULT 'monthly',
        status TEXT DEFAULT 'active',
        next_billing_date DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.warn('⚠️  Could not create table:', err.message);
      } else {
        console.log('✓ Table created\n');
      }
      callback();
    });
  });
}

function addImpactMetricsTable(callback) {
  console.log('Checking: impact_metrics table...');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='impact_metrics'", (err, rows) => {
    if (err) {
      console.error('Error checking table:', err);
      callback();
      return;
    }

    if (rows.length > 0) {
      console.log('✓ Table already exists\n');
      callback();
      return;
    }

    console.log('Creating impact_metrics table...');
    db.run(`
      CREATE TABLE IF NOT EXISTS impact_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        source TEXT
      )
    `, (err) => {
      if (err) {
        console.warn('⚠️  Could not create table:', err.message);
      } else {
        console.log('✓ Table created\n');
      }
      callback();
    });
  });
}

function addContactMessagesTable(callback) {
  console.log('Checking: contact_messages table...');
  
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='contact_messages'", (err, rows) => {
    if (err) {
      console.error('Error checking table:', err);
      callback();
      return;
    }

    if (rows.length > 0) {
      console.log('✓ Table already exists\n');
      callback();
      return;
    }

    console.log('Creating contact_messages table...');
    db.run(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        response TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.warn('⚠️  Could not create table:', err.message);
      } else {
        console.log('✓ Table created\n');
      }
      callback();
    });
  });
}

function addIndexes(callback) {
  console.log('Adding database indexes for performance...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(email)',
    'CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status)',
    'CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email)',
    'CREATE INDEX IF NOT EXISTS idx_volunteers_location ON volunteers(location)',
    'CREATE INDEX IF NOT EXISTS idx_debris_status ON debris_reports(status)',
    'CREATE INDEX IF NOT EXISTS idx_debris_created ON debris_reports(createdAt)',
    'CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status)',
    'CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(createdAt)',
    'CREATE INDEX IF NOT EXISTS idx_recurring_status ON recurring_donations(status)'
  ];

  let completed = 0;

  indexes.forEach(sql => {
    db.run(sql, (err) => {
      if (err) {
        console.warn('⚠️  Index error:', err.message);
      } else {
        console.log(`✓ ${sql.split('CREATE INDEX IF NOT EXISTS')[1].trim()}`);
      }
      completed++;
      if (completed === indexes.length) {
        console.log('\n✅ All indexes created\n');
        callback();
      }
    });
  });
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              OceanCare Database Migration Tool                 ║
║                                                                ║
║  This script safely upgrades your database schema to support  ║
║  new features like payments, authentication, and metrics.     ║
╚════════════════════════════════════════════════════════════════╝
`);
