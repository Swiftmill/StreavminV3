const path = require('path');
const bcrypt = require('bcryptjs');
const { readJson, withJsonLock } = require('./fileStore');

const USERS_ROOT = path.join(__dirname, '..', 'data', 'users');

async function loadUser(username) {
  const file = path.join(USERS_ROOT, `${username}.json`);
  try {
    return await readJson(file);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

async function upsertUser(user) {
  if (!user.username) {
    throw new Error('username required');
  }
  const file = path.join(USERS_ROOT, `${user.username}.json`);
  return withJsonLock(file, async (existing = {}) => {
    const next = { ...existing, ...user };
    if (user.password) {
      next.passHash = await bcrypt.hash(user.password, 10);
      delete next.password;
    }
    return next;
  }, {});
}

async function verifyCredentials(username, password) {
  const user = await loadUser(username);
  if (!user || !user.passHash) {
    return null;
  }
  const hash = user.passHash.startsWith('$2y$') ? '$2a$' + user.passHash.slice(4) : user.passHash;
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return null;
  }
  return { username: user.username, role: user.role || 'user' };
}

module.exports = {
  loadUser,
  upsertUser,
  verifyCredentials
};
