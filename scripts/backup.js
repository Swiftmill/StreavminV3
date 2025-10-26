const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

async function backup() {
  await fs.promises.mkdir(path.join(ROOT, 'backups'), { recursive: true });
  const fileName = `streavmin-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.tar.gz`;
  const output = path.join(ROOT, 'backups', fileName);
  await runTar(DATA_DIR, output);
  console.log(`Backup created at ${output}`);
}

function runTar(sourceDir, outputFile) {
  return new Promise((resolve, reject) => {
    const tar = spawn('tar', ['-czf', outputFile, '-C', sourceDir, '.']);
    tar.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tar exited with code ${code}`));
      }
    });
    tar.on('error', reject);
  });
}

backup().catch((err) => {
  console.error(err);
  process.exit(1);
});
