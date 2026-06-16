

const { Pool } = require("pg");
require("dotenv").config();

console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;