/**
 * OUT LMS - Zero-Dependency Universal Node.js Launcher
 * The Open University of Tanzania Learning Management System
 * 
 * Usage:
 *   node start.js
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('==============================================================================');
console.log('  OUT LMS - Universal Launcher');
console.log('  The Open University of Tanzania');
console.log('==============================================================================\n');

// 1. Verify / prepare frontend build
const buildIndex = path.join(__dirname, 'frontend', 'build', 'index.html');
if (!fs.existsSync(buildIndex)) {
  console.log('[INFO] Production bundle not found. Building frontend...');
  try {
    execSync('npm run build', {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('[ERROR] Failed to compile frontend bundle:', err.message);
    process.exit(1);
  }
}

// 2. Launch serve_build.js
const serverScript = path.join(__dirname, 'frontend', 'serve_build.js');
console.log('[INFO] Starting server via:', serverScript);

const child = spawn(process.execPath, [serverScript], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`[INFO] Server exited with code ${code}`);
  process.exit(code);
});

