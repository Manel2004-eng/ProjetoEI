const pool = require("./db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro na ligação à base de dados:", err);
  } else {
    console.log("Ligação bem-sucedida:", res.rows[0]);
  }
  pool.end();
});