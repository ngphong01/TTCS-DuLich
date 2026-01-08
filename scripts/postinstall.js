/**
 * TravelGo - Post Install Script
 * ================================
 * Script nÃ y tá»± Ä‘á»™ng cháº¡y sau npm install
 * Táº¡o file .env tá»« .env.example náº¿u chÆ°a cÃ³
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname.replace(/[\\/]scripts$/, '');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('');
console.log('ðŸš€ TravelGo - Setting up environment...');
console.log('=========================================');

// Function to copy .env.example to .env if .env doesn't exist
function setupEnv(dir, name) {
  const envPath = path.join(dir, '.env');
  const envExamplePath = path.join(dir, '.env.example');

  if (fs.existsSync(envPath)) {
    console.log('âœ… ' + name + '/.env already exists - skipping');
    return;
  }

  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('âœ… ' + name + '/.env created from .env.example');
  } else {
    console.log('âš ï¸  ' + name + '/.env.example not found - skipping');
  }
}

// Setup backend .env
setupEnv(backendDir, 'backend');

// Setup frontend .env
setupEnv(frontendDir, 'frontend');

console.log('');
console.log('=========================================');
console.log('ðŸ“‹ Next steps:');
console.log('');
console.log('1. Setup MySQL database:');
console.log('   mysql -u root -p < backend/database/travelgo_complete.sql');
console.log('');
console.log('2. (Optional) Edit .env files if needed:');
console.log('   - backend/.env  - Database URL, JWT secret');
console.log('   - frontend/.env - API URL');
console.log('');
console.log('3. Start the application:');
console.log('   npm start');
console.log('');
console.log('ðŸŒ Frontend: http://localhost:3001');
console.log('ðŸ”§ Backend:  http://localhost:3000');
console.log('');
console.log('ðŸ‘¤ Admin Login:');
console.log('   Email: phong@triennguyen.com');
console.log('   Password: Phong@2004');
console.log('=========================================');
console.log('');
