import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../../db.json');

// Initialize database file if it does not exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    companies: [],
    employee_profiles: [],
    email_otps: []
  }, null, 2));
}

function readDb() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read jsonDb file, resetting database:', error);
    return {
      users: [],
      companies: [],
      employee_profiles: [],
      email_otps: []
    };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write to jsonDb file:', error);
  }
}

export function executeJsonDbQuery(sql, params) {
  const db = readDb();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. SELECT NOW()
  if (cleanSql.toUpperCase().startsWith('SELECT NOW()')) {
    return { rows: [{ now: new Date().toISOString() }] };
  }

  // 2. SELECT * FROM users WHERE email = $1
  if (cleanSql.includes('SELECT * FROM users WHERE email =')) {
    const email = params[0];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // 3. SELECT id FROM users WHERE email = $1
  if (cleanSql.includes('SELECT id FROM users WHERE email =')) {
    const email = params[0];
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [{ id: user.id }] : [] };
  }

  // 4. UPDATE email_otps SET consumed_at = now() WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
  if (cleanSql.includes('UPDATE email_otps SET consumed_at = now() WHERE user_id =') && cleanSql.includes('AND purpose =')) {
    const userId = params[0];
    const purpose = params[1];
    db.email_otps.forEach(o => {
      if (o.user_id === userId && o.purpose === purpose && !o.consumed_at) {
        o.consumed_at = new Date().toISOString();
      }
    });
    writeDb(db);
    return { rows: [] };
  }

  // 5. INSERT INTO email_otps
  if (cleanSql.startsWith('INSERT INTO email_otps')) {
    const [userId, purpose, otpHash, expiresAt, pendingPasswordHash] = params;
    const newOtp = {
      id: crypto.randomUUID(),
      user_id: userId,
      purpose,
      otp_hash: otpHash,
      expires_at: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
      attempts: 0,
      consumed_at: null,
      created_at: new Date().toISOString()
    };
    db.email_otps.push(newOtp);
    writeDb(db);
    return { rows: [newOtp] };
  }

  // 6. SELECT * FROM email_otps WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
  if (cleanSql.includes('SELECT * FROM email_otps') && cleanSql.includes('WHERE user_id =') && cleanSql.includes('AND purpose =')) {
    const userId = params[0];
    const purpose = params[1];
    const matching = db.email_otps
      .filter(o => o.user_id === userId && o.purpose === purpose && !o.consumed_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: cleanSql.includes('LIMIT 1') ? (matching[0] ? [matching[0]] : []) : matching };
  }

  // 7. UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1
  if (cleanSql.includes('UPDATE email_otps SET attempts = attempts + 1')) {
    const id = params[0];
    const o = db.email_otps.find(x => x.id === id);
    if (o) o.attempts++;
    writeDb(db);
    return { rows: [] };
  }

  // 8. UPDATE email_otps SET consumed_at = now() WHERE id = $1
  if (cleanSql.includes('UPDATE email_otps SET consumed_at = now() WHERE id =')) {
    const id = params[0];
    const o = db.email_otps.find(x => x.id === id);
    if (o) o.consumed_at = new Date().toISOString();
    writeDb(db);
    return { rows: [] };
  }

  // 8b. UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2
  if (cleanSql.includes('UPDATE users SET password_hash =')) {
    const [passwordHash, id] = params;
    const u = db.users.find(x => x.id === id);
    if (u) {
      u.password_hash = passwordHash;
      u.updated_at = new Date().toISOString();
    }
    writeDb(db);
    return { rows: [] };
  }
  // 9. UPDATE users SET is_email_verified = true, updated_at = now() WHERE id = $1
  if (cleanSql.includes('UPDATE users SET is_email_verified = true')) {
    const id = params[0];
    const u = db.users.find(x => x.id === id);
    if (u) {
      u.is_email_verified = true;
      u.updated_at = new Date().toISOString();
    }
    writeDb(db);
    return { rows: [] };
  }

  // 10. INSERT INTO users (account_type, full_name, email, password_hash) VALUES ('company', $1, $2, $3) RETURNING *
  // OR with phone: INSERT INTO users (account_type, full_name, email, password_hash, phone) VALUES ('employee', $1, $2, $3, $4) RETURNING *
  if (cleanSql.startsWith('INSERT INTO users')) {
    const isEmployee = cleanSql.includes('phone');
    const newUser = {
      id: crypto.randomUUID(),
      account_type: isEmployee ? 'employee' : 'company',
      full_name: params[0],
      email: params[1],
      password_hash: params[2],
      phone: isEmployee ? params[3] : null,
      is_email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDb(db);
    return { rows: [newUser] };
  }

  // 11. INSERT INTO companies (owner_user_id, company_name, industry, fleet_size, primary_fleet_type, invite_code) VALUES ($1, $2, $3, $4, $5, $6)
  if (cleanSql.startsWith('INSERT INTO companies')) {
    const [ownerUserId, companyName, industry, fleetSize, primaryFleetType, inviteCode] = params;
    const newCompany = {
      id: crypto.randomUUID(),
      owner_user_id: ownerUserId,
      company_name: companyName,
      industry,
      fleet_size: fleetSize,
      primary_fleet_type: primaryFleetType,
      invite_code: inviteCode,
      created_at: new Date().toISOString()
    };
    db.companies.push(newCompany);
    writeDb(db);
    return { rows: [newCompany] };
  }

  // 12. INSERT INTO employee_profiles (user_id, employee_role, employee_code, company_invite_code) VALUES ($1, $2, $3, $4)
  if (cleanSql.startsWith('INSERT INTO employee_profiles')) {
    const [userId, employeeRole, employeeCode, companyInviteCode] = params;
    const newProfile = {
      id: crypto.randomUUID(),
      user_id: userId,
      employee_role: employeeRole,
      employee_code: employeeCode,
      company_invite_code: companyInviteCode,
      created_at: new Date().toISOString()
    };
    db.employee_profiles.push(newProfile);
    writeDb(db);
    return { rows: [newProfile] };
  }

  // 13. Transaction queries
  if (cleanSql.toUpperCase() === 'BEGIN' || cleanSql.toUpperCase() === 'COMMIT' || cleanSql.toUpperCase() === 'ROLLBACK') {
    return { rows: [] };
  }

  console.warn('Unknown SQL executed on mock JSON database:', sql);
  return { rows: [] };
}
