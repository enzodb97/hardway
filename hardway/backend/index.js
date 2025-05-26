const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

console.log("Iniciando backend...");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // URL de tu frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Configura tu conexión (ajusta estos valores según tu configuración)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: console.log, // Esto mostrará las consultas SQL en la consola
  }
);

// Prueba la conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos establecida.");
  })
  .catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
  });

// Define el modelo Cliente
const Cliente = sequelize.define(
  "Cliente",
  {
    tipoDocumento: { type: DataTypes.STRING, field: "tipo_documento" },
    numeroDocumento: { type: DataTypes.STRING, field: "numero_documento" },
    nombre: DataTypes.STRING,
    domicilio: DataTypes.STRING,
    calle: DataTypes.STRING,
    altura: DataTypes.STRING,
    piso: DataTypes.STRING,
    numeroDepartamento: {
      type: DataTypes.STRING,
      field: "numero_departamento",
    },
    observaciones: DataTypes.STRING,
    localidad: DataTypes.STRING,
    barrio: DataTypes.STRING,
    cp: DataTypes.STRING,
    telefono: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  {
    tableName: "clientes",
    timestamps: false,
  }
);

// Define el modelo Usuario
const Usuario = sequelize.define(
  "Usuario",
  {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    rol: DataTypes.STRING,
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

// Endpoints básicos
app.get("/api/clientes", async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

app.post("/api/clientes", async (req, res) => {
  const cliente = await Cliente.create(req.body);
  res.json(cliente);
});

app.put("/api/clientes/:id", async (req, res) => {
  const { id } = req.params;
  await Cliente.update(req.body, { where: { id } });
  res.json({ success: true });
});

app.delete("/api/clientes/:id", async (req, res) => {
  const { id } = req.params;
  await Cliente.destroy({ where: { id } });
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("¡API de Clientes funcionando!");
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Intento de login:", username, password);
  try {
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    if (usuario.password !== password) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    res.json({ username: usuario.username, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

// Inicia el servidor
app.listen(3001, () => console.log("API corriendo en http://localhost:3001"));
