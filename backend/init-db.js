const pool = require("./db");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS allergy_diary_entries (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    city VARCHAR(255) NOT NULL,
    severity INTEGER NOT NULL,
    sneezing INTEGER DEFAULT 0,
    itchy_eyes INTEGER DEFAULT 0,
    nasal_congestion INTEGER DEFAULT 0,
    cough INTEGER DEFAULT 0,
    medication TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => {
    console.log("Tabela allergy_diary_entries criada com sucesso.");
    return pool.end();
  })
  .catch((err) => {
    console.error("Erro ao criar tabela:", err);
    return pool.end();
  });