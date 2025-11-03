// Quick check script for backend connection
const http = require('http');

function checkBackend() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend is running! Status: ${res.statusCode}`);
    console.log(`✅ Response headers:`, res.headers);
    res.on('data', (chunk) => {
      console.log(`✅ Response: ${chunk.toString()}`);
    });
    process.exit(0);
  });

  req.on('error', (e) => {
    console.error(`❌ Backend is NOT running!`);
    console.error(`❌ Error: ${e.message}`);
    console.error(`\n💡 Hãy chạy: npm start`);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error(`❌ Timeout: Backend không phản hồi`);
    req.destroy();
    process.exit(1);
  });

  req.end();
}

checkBackend();

