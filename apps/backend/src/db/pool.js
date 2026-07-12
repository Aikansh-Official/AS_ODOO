import pg from 'pg';
import { config } from '../config/env.js';
import { executeJsonDbQuery } from './jsonDb.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  connectionTimeoutMillis: 2000,
});

let useJsonDb = null;

const originalConnect = pool.connect.bind(pool);

async function checkDbConnection() {
  if (useJsonDb !== null) return useJsonDb;
  try {
    // Attempt a quick connection test using the original connect method to avoid recursion
    const client = await originalConnect();
    await client.query('SELECT NOW()');
    client.release();
    useJsonDb = false;
    console.log('[DATABASE] Successfully connected to PostgreSQL.');
  } catch (error) {
    useJsonDb = true;
    console.warn('[DATABASE] PostgreSQL connection failed. Falling back to local JSON database (db.json). Error:', error.message);
  }
  return useJsonDb;
}

pool.connect = async function() {
  const fallback = await checkDbConnection();
  if (fallback) {
    return {
      query: async (text, params) => executeJsonDbQuery(text, params),
      release: () => {}
    };
  }
  return originalConnect();
};

const originalQuery = pool.query.bind(pool);
pool.query = async function(text, params) {
  const fallback = await checkDbConnection();
  if (fallback) {
    return executeJsonDbQuery(text, params);
  }
  return originalQuery(text, params);
};

export async function query(text, params = []) {
  const fallback = await checkDbConnection();
  if (fallback) {
    return executeJsonDbQuery(text, params);
  }
  return pool.query(text, params);
}
