const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const LOCK_RETRY_DELAY = 50;
const LOCK_MAX_RETRY = 40;

async function ensureDir(filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function acquireLock(filePath, retryCount = 0) {
  const lockPath = `${filePath}.lock`;
  try {
    const handle = await fsp.open(lockPath, 'wx');
    await handle.close();
    return lockPath;
  } catch (err) {
    if (err.code === 'EEXIST') {
      if (retryCount >= LOCK_MAX_RETRY) {
        throw new Error(`Failed to acquire lock for ${filePath}`);
      }
      await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY));
      return acquireLock(filePath, retryCount + 1);
    }
    throw err;
  }
}

async function releaseLock(lockPath) {
  try {
    await fsp.unlink(lockPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

async function readJson(filePath, defaultValue = null) {
  try {
    const data = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (defaultValue === null) {
        throw err;
      }
      return defaultValue;
    }
    throw err;
  }
}

async function writeJson(filePath, content) {
  await ensureDir(filePath);
  const lockPath = await acquireLock(filePath);
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  try {
    await fsp.writeFile(tempPath, JSON.stringify(content, null, 2));
    await fsp.rename(tempPath, filePath);
  } finally {
    await releaseLock(lockPath);
    try {
      await fsp.unlink(tempPath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}

async function withJsonLock(filePath, updater, defaultValue = null) {
  await ensureDir(filePath);
  const lockPath = await acquireLock(filePath);
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  try {
    const current = await readJson(filePath, defaultValue);
    const next = await updater(current);
    await fsp.writeFile(tempPath, JSON.stringify(next, null, 2));
    await fsp.rename(tempPath, filePath);
    return next;
  } finally {
    await releaseLock(lockPath);
    try {
      await fsp.unlink(tempPath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}

module.exports = {
  readJson,
  writeJson,
  withJsonLock
};
