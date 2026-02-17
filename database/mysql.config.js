/**
 * MySQL Database Configuration
 *
 * Note: This project is configured to use Supabase (PostgreSQL) by default.
 * This MySQL config is provided for alternative local development setup.
 */

import mysql from 'mysql2/promise';

// Database connection configuration
export const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'oldroad_auto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
};

// Create connection pool
let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig);
  }
  return pool;
};

// Test connection
export const testConnection = async () => {
  try {
    const connection = await getPool().getConnection();
    console.log('✓ MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    return false;
  }
};

// Execute query helper
export const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Close all connections
export const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('MySQL connection pool closed');
  }
};

export default {
  mysqlConfig,
  getPool,
  testConnection,
  executeQuery,
  closePool
};
