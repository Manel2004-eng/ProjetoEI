const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

function getEuropeanAqiStatus(aqi) {
  if (aqi <= 20) return "Boa";
  if (aqi <= 40) return "Razoável";
  if (aqi <= 60) return "Moderada";
  if (aqi <= 80) return "Fraca";
  if (aqi <= 100) return "Muito fraca";
  return "Extremamente fraca";
}

function calculateRiskLevel({ aqi, wind, humidity, temperature }) {
  let score = 0;

  // AQI
  if (aqi <= 20) score += 0;
  else if (aqi <= 40) score += 1;
  else if (aqi <= 60) score += 2;
  else if (aqi <= 80) score += 3;
  else score += 4;

  // Vento
  if (wind >= 30) score += 2;
  else if (wind >= 15) score += 1;

  // Humidade
  if (humidity >= 90) score += 1;
  else if (humidity <= 30) score += 1;

  // Temperatura
  if (temperature <= 5 || temperature >= 32) score += 1;

  if (score <= 2) return "Baixo";
  if (score <= 4) return "Moderado";
  return "Alto";
}

function generateRecommendations(riskLevel, airStatus, wind, humidity) {
  const recommendations = [];

  if (riskLevel === "Alto") {
    recommendations.push("Evitar atividade física intensa no exterior.");
    recommendations.push("Reduzir exposição prolongada ao ar livre.");
  }

  if (riskLevel === "Moderado") {
    recommendations.push("Ter atenção ao tempo passado no exterior.");
  }

  if (airStatus === "Fraca" || airStatus === "Muito fraca" || airStatus === "Extremamente fraca") {
    recommendations.push("Considerar máscara em deslocações longas no exterior.");
  }

  if (wind >= 15) {
    recommendations.push("Ter atenção ao vento, que pode aumentar a dispersão de partículas.");
  }

  if (humidity >= 90) {
    recommendations.push("Humidade elevada pode agravar desconforto respiratório.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Condições relativamente favoráveis para atividades normais.");
  }

  return recommendations;
}

app.get("/", (req, res) => {
  res.send("API do projeto a funcionar!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend online." });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const city = req.query.city || "Covilhã";

    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}` +
      `&count=1&language=pt&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Erro ao obter dados de geocoding.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Cidade não encontrada."
      });
    }

    const place = geoData.results[0];

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Erro ao obter dados meteorológicos.");
    }

    const weatherData = await weatherResponse.json();
    const currentWeather = weatherData.current;

    const airUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}` +
      `&longitude=${place.longitude}` +
      `&current=european_aqi,pm2_5,pm10`;

    const airResponse = await fetch(airUrl);

    if (!airResponse.ok) {
      throw new Error("Erro ao obter dados de qualidade do ar.");
    }

    const airData = await airResponse.json();
    const currentAir = airData.current;

    const aqi = currentAir.european_aqi;
    const airStatus = getEuropeanAqiStatus(aqi);

    const riskLevel = calculateRiskLevel({
      aqi: aqi,
      wind: currentWeather.wind_speed_10m,
      humidity: currentWeather.relative_humidity_2m,
      temperature: currentWeather.temperature_2m,
    });

    const recommendations = generateRecommendations(
      riskLevel,
      airStatus,
      currentWeather.wind_speed_10m,
      currentWeather.relative_humidity_2m
    );

    res.json({
      city: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      riskLevel: riskLevel,
      weather: {
        temperature: `${currentWeather.temperature_2m}°C`,
        humidity: `${currentWeather.relative_humidity_2m}%`,
        wind: `${currentWeather.wind_speed_10m} km/h`,
      },
      airQuality: {
        aqi: aqi,
        status: airStatus,
        pm2_5: `${currentAir.pm2_5} μg/m³`,
        pm10: `${currentAir.pm10} μg/m³`,
      },
      pollen: {
        level: "Alto",
        dominant: "Gramíneas",
      },
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Erro no /api/dashboard:", error.message);
    res.status(500).json({
      error: true,
      message: "Erro ao obter dados do dashboard."
    });
  }
});
app.get("/api/diary", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM allergy_diary_entries ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter registos do diário:", error.message);
    res.status(500).json({ error: "Erro ao obter registos do diário." });
  }
});

app.post("/api/diary", async (req, res) => {
  try {
    const {
      userId,
      date,
      city,
      severity,
      sneezing,
      itchyEyes,
      nasalCongestion,
      cough,
      medication,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "O userId é obrigatório." });
    }

    const result = await pool.query(
      `
      INSERT INTO allergy_diary_entries
      (user_id, date, city, severity, sneezing, itchy_eyes, nasal_congestion, cough, medication, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        userId,
        date,
        city,
        severity,
        sneezing,
        itchyEyes,
        nasalCongestion,
        cough,
        medication,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao guardar registo do diário:", error.message);
    res.status(500).json({ error: "Erro ao guardar registo do diário." });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, wantsDoctor } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e password são obrigatórios.",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Já existe uma conta com esse email.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role, doctor_request)
      VALUES ($1, $2, $3, 'user', $4)
      RETURNING id, name, email, role, doctor_request, created_at
      `,
      [name, email, password, wantsDoctor === true]
    );

    res.status(201).json({
      message: "Utilizador registado com sucesso.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erro no registo:", error.message);
    res.status(500).json({
      error: "Erro ao registar utilizador.",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e password são obrigatórios.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciais inválidas.",
      });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({
        error: "Credenciais inválidas.",
      });
    }

    res.status(200).json({
      message: "Login efetuado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(500).json({
      error: "Erro ao efetuar login.",
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
   const result = await pool.query(
  "SELECT id, name, email, role, doctor_request, created_at FROM users ORDER BY created_at DESC"
);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter utilizadores:", error.message);
    res.status(500).json({
      error: "Erro ao obter utilizadores.",
    });
  }
});

app.put("/api/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, doctorRequest } = req.body;

    if (!role) {
      return res.status(400).json({
        error: "O role é obrigatório.",
      });
    }

    const validRoles = ["user", "doctor", "admin"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Role inválido.",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET role = $1, doctor_request = $2
      WHERE id = $3
      RETURNING id, name, email, role, doctor_request, created_at
      `,
      [role, doctorRequest ?? false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Utilizador não encontrado.",
      });
    }

    res.json({
      message: "Role atualizada com sucesso.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar role:", error.message);
    res.status(500).json({
      error: "Erro ao atualizar role do utilizador.",
    });
  }
});

app.get("/api/doctors/:doctorId/patients", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const result = await pool.query(
      `
      SELECT u.id, u.name, u.email, u.role, dp.created_at
      FROM doctor_patients dp
      JOIN users u ON dp.patient_id = u.id
      WHERE dp.doctor_id = $1
      ORDER BY dp.created_at DESC
      `,
      [doctorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter utentes do médico:", error.message);
    res.status(500).json({ error: "Erro ao obter utentes do médico." });
  }
});

app.get("/api/available-patients", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE role = 'user'
      ORDER BY name ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter utilizadores disponíveis:", error.message);
    res.status(500).json({ error: "Erro ao obter utilizadores disponíveis." });
  }
});

app.post("/api/doctors/:doctorId/patients", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "O patientId é obrigatório." });
    }

    const patientCheck = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Utente não encontrado." });
    }

    if (patientCheck.rows[0].role !== "user") {
      return res.status(400).json({ error: "Só utilizadores com role user podem ser utentes." });
    }

    const result = await pool.query(
      `
      INSERT INTO doctor_patients (doctor_id, patient_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [doctorId, patientId]
    );

    res.status(201).json({
      message: "Utente associado ao médico com sucesso.",
      relation: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao associar utente ao médico:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Este utente já está associado a este médico.",
      });
    }

    res.status(500).json({ error: "Erro ao associar utente ao médico." });
  }
});

app.get("/api/doctors/:doctorId/patients/:patientId/records", async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const relationCheck = await pool.query(
      `
      SELECT * FROM doctor_patients
      WHERE doctor_id = $1 AND patient_id = $2
      `,
      [doctorId, patientId]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Este utente não pertence a este médico.",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM allergy_diary_entries
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter registos do utente:", error.message);
    res.status(500).json({
      error: "Erro ao obter registos do utente.",
    });
  }
});

app.get("/api/doctors/:doctorId/patients/:patientId/feedback", async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const relationCheck = await pool.query(
      `
      SELECT * FROM doctor_patients
      WHERE doctor_id = $1 AND patient_id = $2
      `,
      [doctorId, patientId]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Este utente não pertence a este médico.",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM doctor_feedback
      WHERE doctor_id = $1 AND patient_id = $2
      ORDER BY created_at DESC
      `,
      [doctorId, patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter feedback do médico:", error.message);
    res.status(500).json({
      error: "Erro ao obter feedback do médico.",
    });
  }
});

app.post("/api/doctors/:doctorId/patients/:patientId/feedback", async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        error: "O feedback é obrigatório.",
      });
    }

    const relationCheck = await pool.query(
      `
      SELECT * FROM doctor_patients
      WHERE doctor_id = $1 AND patient_id = $2
      `,
      [doctorId, patientId]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(403).json({
        error: "Este utente não pertence a este médico.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO doctor_feedback (doctor_id, patient_id, feedback)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [doctorId, patientId, feedback]
    );

    res.status(201).json({
      message: "Feedback guardado com sucesso.",
      feedbackEntry: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao guardar feedback do médico:", error.message);
    res.status(500).json({
      error: "Erro ao guardar feedback do médico.",
    });
  }
});

app.get("/api/patients/:patientId/feedback", async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `
      SELECT df.id, df.feedback, df.created_at, u.name AS doctor_name, u.email AS doctor_email
      FROM doctor_feedback df
      JOIN users u ON df.doctor_id = u.id
      WHERE df.patient_id = $1
      ORDER BY df.created_at DESC
      `,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter feedback do utente:", error.message);
    res.status(500).json({
      error: "Erro ao obter feedback do utente.",
    });
  }
});

app.get("/api/patients/:patientId/feedback", async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(
      `
      SELECT df.id, df.feedback, df.created_at, u.name AS doctor_name, u.email AS doctor_email
      FROM doctor_feedback df
      JOIN users u ON df.doctor_id = u.id
      WHERE df.patient_id = $1
      ORDER BY df.created_at DESC
      `,
      [patientId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao obter feedback do utente:", error.message);
    res.status(500).json({
      error: "Erro ao obter feedback do utente.",
    });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});