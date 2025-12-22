// lib/backup.js - Database backup utilities
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Backup MySQL database
 */
async function backupDatabase() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set');
    }

    // Parse database URL
    // Format: mysql://user:password@host:port/database
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = urlMatch;

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(backupDir, `travelgo_backup_${timestamp}_${Date.now()}.sql`);

    // MySQL dump command
    const command = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > "${backupFile}"`;

    await execPromise(command);

    // Compress backup (optional, requires gzip)
    try {
      const compressedFile = `${backupFile}.gz`;
      await execPromise(`gzip "${backupFile}"`);
      console.log(`✅ Database backup created: ${compressedFile}`);
      return compressedFile;
    } catch (compressError) {
      console.log(`✅ Database backup created: ${backupFile}`);
      return backupFile;
    }
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    throw error;
  }
}

/**
 * List all backups
 */
function listBackups() {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const files = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('travelgo_backup_'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return files;
}

/**
 * Delete old backups (keep last N backups)
 */
function cleanupOldBackups(keepCount = 10) {
  const backups = listBackups();
  
  if (backups.length <= keepCount) {
    return;
  }

  const toDelete = backups.slice(keepCount);
  for (const backup of toDelete) {
    try {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Deleted old backup: ${backup.filename}`);
    } catch (error) {
      console.error(`❌ Error deleting backup ${backup.filename}:`, error);
    }
  }
}

/**
 * Initialize automatic backup scheduler
 */
function initBackupScheduler() {
  const backupInterval = process.env.BACKUP_INTERVAL || '24'; // hours
  const intervalMs = parseInt(backupInterval) * 60 * 60 * 1000;

  // Run backup immediately on startup
  backupDatabase().catch(err => {
    console.error('❌ Initial backup failed:', err);
  });

  // Schedule periodic backups
  setInterval(() => {
    backupDatabase()
      .then(() => {
        cleanupOldBackups(10); // Keep last 10 backups
      })
      .catch(err => {
        console.error('❌ Scheduled backup failed:', err);
      });
  }, intervalMs);

  console.log(`✅ Backup scheduler initialized - Backing up every ${backupInterval} hours`);
}

module.exports = {
  backupDatabase,
  listBackups,
  cleanupOldBackups,
  initBackupScheduler,
};

