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

// Define el modelo Pedido
const Pedido = sequelize.define(
  "Pedido",
  {
    descripcion: DataTypes.STRING,
    fecha: DataTypes.DATE,
    estado: DataTypes.STRING,
    clienteId: {
      type: DataTypes.INTEGER,
      field: "cliente_id",
      references: {
        model: "clientes",
        key: "id",
      },
    },
  },
  {
    tableName: "pedidos",
    timestamps: false,
  }
);

// Modelo Sequelize (ajusta los campos según tu modelo real)
const Indumentaria = sequelize.define("Indumentaria", {
  idIndumentaria: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  codigoIndumentaria: Sequelize.STRING,
  descripcionIndumentaria: Sequelize.STRING,
  color: Sequelize.STRING,
  nombreTela: Sequelize.STRING,
  nroTalle: Sequelize.STRING,
  descripcionTalle: Sequelize.STRING,
  categoria: Sequelize.STRING,
  subCategoria: Sequelize.STRING,
  precioVenta: Sequelize.DECIMAL(12, 2),
  costoIndumentaria: Sequelize.DECIMAL(12, 2),
  cantidadIndumentaria: Sequelize.INTEGER,
  estado_actual: Sequelize.INTEGER,
  codigoDetalle: Sequelize.STRING,
  cantidadTotal: Sequelize.INTEGER,
}, {
  tableName: "indumentaria",
  timestamps: false,
});

// Relación
Pedido.belongsTo(Cliente, { foreignKey: "clienteId" });
Cliente.hasMany(Pedido, { foreignKey: "clienteId" });

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
  try {
    // Verifica si tiene pedidos asociados
    const pedidos = await Pedido.findAll({ where: { clienteId: id } });
    if (pedidos.length > 0) {
      return res.status(400).json({
        error:
          "No se puede eliminar el cliente porque tiene pedidos asociados.",
      });
    }
    const deleted = await Cliente.destroy({ where: { id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar cliente", detalle: error.message });
  }
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

// Obtener todos los usuarios (solo para admin)
app.get("/api/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll({
    attributes: ["id", "username", "rol"],
  }); // No envíes la contraseña
  res.json(usuarios);
});

// Crear usuario
app.post("/api/usuarios", async (req, res) => {
  const { username, password, rol } = req.body;
  try {
    const nuevo = await Usuario.create({ username, password, rol });
    res.json({ id: nuevo.id, username: nuevo.username, rol: nuevo.rol });
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear el usuario" });
  }
});

// Eliminar usuario
app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  await Usuario.destroy({ where: { id } });
  res.json({ success: true });
});

// Actualizar usuario (nombre de usuario y rol)
app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { username, rol } = req.body;
  try {
    await Usuario.update({ username, rol }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "No se pudo actualizar el usuario" });
  }
});

// Cambiar contraseña
app.put("/api/usuarios/:id/password", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    await Usuario.update({ password }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "No se pudo cambiar la contraseña" });
  }
});

// Obtener todos los pedidos
app.get("/api/pedidos", async (req, res) => {
  const pedidos = await Pedido.findAll({ include: Cliente });
  res.json(pedidos);
});

// Crear pedido
app.post("/api/pedidos", async (req, res) => {
  const pedido = await Pedido.create(req.body);
  res.json(pedido);
});

// Eliminar pedido
app.delete("/api/pedidos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Pedido.destroy({ where: { id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar pedido", detalle: error.message });
  }
});

// Editar pedido
app.put("/api/pedidos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Pedido.update(req.body, { where: { id } });
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al editar pedido", detalle: error.message });
  }
});

// Obtener pedido por ID
app.get("/api/pedidos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await Pedido.findOne({ where: { id }, include: Cliente });
    if (pedido) {
      res.json(pedido);
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedido", detalle: error.message });
  }
});

// Validar usuario por nombre de usuario
app.get("/api/usuarios/validate", async (req, res) => {
  const { username } = req.query;
  const usuario = await Usuario.findOne({ where: { username } });
  res.json({ valid: !!usuario });
});

// Obtener todas las prendas
app.get("/api/indumentaria", async (req, res) => {
  try {
    const prendas = await Indumentaria.findAll();
    res.json(prendas);
  } catch (error) {
    console.error("Error en /api/indumentaria:", error); // <-- AGREGA ESTO
    res.status(500).json({ error: "Error al obtener indumentaria" });
  }
});

// Crear nueva prenda
app.post("/api/indumentaria", async (req, res) => {
  try {
    const prenda = await Indumentaria.create(req.body);
    res.json(prenda);
  } catch (error) {
    res.status(500).json({ error: "Error al crear prenda" });
  }
});

// Editar prenda
app.put("/api/indumentaria/:id", async (req, res) => {
  try {
    const [updated] = await Indumentaria.update(req.body, { where: { idIndumentaria: req.params.id } });
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Prenda no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al editar prenda" });
  }
});

// Eliminar prenda
app.delete("/api/indumentaria/:id", async (req, res) => {
  try {
    const deleted = await Indumentaria.destroy({ where: { idIndumentaria: req.params.id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Prenda no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar prenda" });
  }
});

// Obtener prenda por ID
app.get("/api/indumentaria/:id", async (req, res) => {
  try {
    const prenda = await Indumentaria.findOne({ where: { idIndumentaria: req.params.id } });
    if (prenda) {
      res.json(prenda);
    } else {
      res.status(404).json({ error: "Prenda no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener prenda" });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

// Inicia el servidor
app.listen(3001, () => console.log("API corriendo en http://localhost:3001"));
