const pool = require("./db");

const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createUsersTableQuery)
  .then(() => {
    console.log("Tabela users criada com sucesso.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Erro ao criar tabela users:", err);
    return pool.end();
  });