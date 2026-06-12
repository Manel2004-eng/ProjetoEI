const { Pool } = require("pg");

const pool = new Pool({
  user: "manuel",
  host: "localhost",
  database: "allergy_app",
  password: "1234",
  port: 5432,
});

module.exports = pool;