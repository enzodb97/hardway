const cors = require("cors");

// Configuración de CORS
const corsConfig = cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175"
  ], // URLs posibles del frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ Agregado PATCH y OPTIONS
  credentials: true,
});

module.exports = { corsConfig };
