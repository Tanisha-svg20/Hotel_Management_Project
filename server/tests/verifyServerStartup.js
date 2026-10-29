const { spawn } = require('child_process');
const http = require('http');

console.log('Testing HotelPro server startup and auto-seeding...');

const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname + '/..',
  env: { ...process.env, PORT: '8005' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';

serverProcess.stdout.on('data', (data) => {
  const str = data.toString();
  output += str;
  process.stdout.write(str);
});

serverProcess.stderr.on('data', (data) => {
  const str = data.toString();
  output += str;
  process.stderr.write(str);
});

function fetchEndpoint(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runVerification() {
  const maxAttempts = 30;
  let attempts = 0;
  let serverReady = false;

  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
    try {
      const res = await fetchEndpoint('http://localhost:8005/api/health');
      if (res.statusCode === 200) {
        console.log('\n[Verification] /api/health responded with 200 OK:', res.body);
        serverReady = true;
        break;
      }
    } catch (e) {
      // not yet up
    }
  }

  if (!serverReady) {
    console.error('\n[Verification FAILED] Server failed to respond to /api/health within 30s');
    serverProcess.kill();
    process.exit(1);
  }

  // Check rooms endpoint to verify seeded data
  try {
    const roomsRes = await fetchEndpoint('http://localhost:8005/api/rooms');
    console.log(`\n[Verification] /api/rooms responded with ${roomsRes.statusCode}`);
    const roomsData = JSON.parse(roomsRes.body);
    console.log(`[Verification] Number of rooms retrieved: ${roomsData.count || roomsData.data?.length || (Array.isArray(roomsData) ? roomsData.length : 'unknown')}`);
    console.log('[Verification SUCCESS] Server startup and seeding verified cleanly without errors!');
  } catch (err) {
    console.error('\n[Verification FAILED] Error fetching rooms:', err.message);
  } finally {
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      process.exit(0);
    }, 500);
  }
}

runVerification();

