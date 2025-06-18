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
    idCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, // <--- AGREGA autoIncrement
    email: DataTypes.STRING,
    telefono: DataTypes.STRING,
    idPersona: DataTypes.INTEGER,
  },
  {
    tableName: "Cliente",
    timestamps: false,
  }
);

const Persona = sequelize.define(
  "Persona",
  {
    idPersona: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, // <--- AGREGA ESTO
    dni: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    direccion: DataTypes.STRING,
    idDomicilio: {
      type: DataTypes.INTEGER,
      allowNull: false, // <-- Esto fuerza a que no sea NULL
    },
  },
  {
    tableName: "Persona",
    timestamps: false,
  }
);

// Relación
Cliente.belongsTo(Persona, { foreignKey: "idPersona" });

// Define el modelo Usuario
const Usuario = sequelize.define(
  "Usuario",
  {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreUsuario: DataTypes.STRING,
    contrasena: DataTypes.STRING,
    idRol: DataTypes.INTEGER,
  },
  {
    tableName: "Usuario",
    timestamps: false,
  }
);

// Modelo Rol
const Rol = sequelize.define(
  "Rol",
  {
    idRol: { type: DataTypes.INTEGER, primaryKey: true },
    idTipoRol: DataTypes.INTEGER,
  },
  {
    tableName: "Rol",
    timestamps: false,
  }
);

// Modelo TipoRol
const TipoRol = sequelize.define(
  "TipoRol",
  {
    idTipoRol: { type: DataTypes.INTEGER, primaryKey: true },
    tipoRol: DataTypes.STRING,
    descripcionRol: DataTypes.STRING,
  },
  {
    tableName: "TipoRol",
    timestamps: false,
  }
);

// Define el modelo Pedido
const Pedido = sequelize.define(
  "Pedido",
  {
    numeroPedido: { type: DataTypes.STRING, primaryKey: true },
    idCliente: DataTypes.INTEGER,
    idEstado: DataTypes.INTEGER,
    fechaPedido: DataTypes.DATE, // <-- asegúrate de tener esto
    codigoSeguimiento: DataTypes.STRING, // <-- necesario para update correcto
  },
  { tableName: "pedido", timestamps: false }
);

// DetallePedido
const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    idDetallePedido: { type: DataTypes.STRING, primaryKey: true },
    numeroPedido: DataTypes.STRING,
    codigoIndumentaria: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
  },
  { tableName: "detallepedido", timestamps: false }
);

// EstadoPedido
const EstadoPedido = sequelize.define(
  "EstadoPedido",
  {
    idEstado: { type: DataTypes.INTEGER, primaryKey: true },
    tipoEstado: DataTypes.STRING,
  },
  { tableName: "estadopedido", timestamps: false }
);

// Indumentaria (ya lo tienes, solo asegúrate de que el nombre y PK coincidan)
const Indumentaria = sequelize.define(
  "Indumentaria",
  {
    codigoIndumentaria: { type: DataTypes.STRING, primaryKey: true },
    idDetalle: DataTypes.INTEGER,
  },
  { tableName: "indumentaria", timestamps: false }
);

// Modelos auxiliares
const Color = sequelize.define(
  "Color",
  {
    idColor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    color: DataTypes.STRING,
  },
  { tableName: "Color", timestamps: false }
);

const Talle = sequelize.define(
  "Talle",
  {
    idTalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    talle: DataTypes.STRING, // <-- CAMBIA de nroTalle a talle
  },
  { tableName: "Talle", timestamps: false }
);

const Tela = sequelize.define(
  "Tela",
  {
    idTela: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipoTela: DataTypes.STRING,
  },
  { tableName: "Tela", timestamps: false }
);

const CategoriaIndumentaria = sequelize.define(
  "CategoriaIndumentaria",
  {
    idCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoria: DataTypes.STRING,
  },
  { tableName: "CategoriaIndumentaria", timestamps: false }
);

const EstadoIndumentaria = sequelize.define(
  "EstadoIndumentaria",
  {
    idEstado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estadoIndumentaria: DataTypes.STRING,
  },
  { tableName: "EstadoIndumentaria", timestamps: false }
);

const PrecioIndumentaria = sequelize.define(
  "PrecioIndumentaria",
  {
    idPrecio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    precio: DataTypes.DOUBLE,
  },
  { tableName: "PrecioIndumentaria", timestamps: false }
);

const DetalleIndumentaria = sequelize.define(
  "DetalleIndumentaria",
  {
    idDetalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idPrecio: DataTypes.INTEGER,
    idCategoria: DataTypes.INTEGER,
    idColor: DataTypes.INTEGER,
    idTalle: DataTypes.INTEGER,
    idEstado: DataTypes.INTEGER,
    idTela: DataTypes.INTEGER,
    idNombre: DataTypes.INTEGER, // <--- AGREGA ESTA LÍNEA
  },
  { tableName: "detalleindumentaria", timestamps: false }
);

const NombreIndumentaria = sequelize.define(
  "NombreIndumentaria",
  {
    idNombre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
  },
  { tableName: "nombreindumentaria", timestamps: false }
);
DetallePedido.belongsTo(Indumentaria, {
  foreignKey: "codigoIndumentaria",
  as: "Indumentarium",
});
Indumentaria.belongsTo(DetalleIndumentaria, {
  foreignKey: "idDetalle",
  as: "DetalleIndumentarium",
});
DetalleIndumentaria.belongsTo(NombreIndumentaria, {
  foreignKey: "idNombre",
  as: "NombreIndumentarium",
});
DetalleIndumentaria.belongsTo(Color, { foreignKey: "idColor" });
DetalleIndumentaria.belongsTo(Talle, { foreignKey: "idTalle" });
DetalleIndumentaria.belongsTo(Tela, { foreignKey: "idTela" });
DetalleIndumentaria.belongsTo(CategoriaIndumentaria, {
  foreignKey: "idCategoria",
});
DetalleIndumentaria.belongsTo(PrecioIndumentaria, { foreignKey: "idPrecio" });
DetalleIndumentaria.belongsTo(EstadoIndumentaria, { foreignKey: "idEstado" });
DetalleIndumentaria.belongsTo(NombreIndumentaria, { foreignKey: "idNombre" });

// Relaciones
Indumentaria.belongsTo(DetalleIndumentaria, { foreignKey: "idDetalle" });
DetalleIndumentaria.belongsTo(PrecioIndumentaria, { foreignKey: "idPrecio" });

// Modelo intermedio
const PedidoIndumentaria = sequelize.define(
  "PedidoIndumentaria",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER },
    idIndumentaria: { type: DataTypes.INTEGER },
    cantidad: { type: DataTypes.INTEGER },
  },
  {
    tableName: "pedido_indumentaria",
    timestamps: false,
  }
);

// Relaciones
Pedido.belongsToMany(Indumentaria, {
  through: PedidoIndumentaria,
  foreignKey: "pedido_id",
  otherKey: "idIndumentaria",
});
Indumentaria.belongsToMany(Pedido, {
  through: PedidoIndumentaria,
  foreignKey: "idIndumentaria",
  otherKey: "pedido_id",
});

// Relación
Pedido.belongsTo(Cliente, { foreignKey: "idCliente" });
Pedido.belongsTo(EstadoPedido, { foreignKey: "idEstado" });
Pedido.hasMany(DetallePedido, { foreignKey: "numeroPedido" });

DetallePedido.belongsTo(Pedido, { foreignKey: "numeroPedido" });
DetallePedido.belongsTo(Indumentaria, { foreignKey: "codigoIndumentaria" });

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: "idRol" });
Rol.belongsTo(TipoRol, { foreignKey: "idTipoRol" });

// Domicilio y Barrio
const Domicilio = sequelize.define(
  "Domicilio",
  {
    idDomicilio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, // <--- AGREGA autoIncrement
    calle: DataTypes.STRING,
    altura: DataTypes.STRING,
    piso: DataTypes.STRING,
    departamento: DataTypes.STRING,
    observaciones: DataTypes.STRING,
    idBarrio: DataTypes.INTEGER,
    idCiudad: DataTypes.INTEGER,
  },
  {
    tableName: "Domicilio",
    timestamps: false,
  }
);

const Barrio = sequelize.define(
  "Barrio",
  {
    idBarrio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, // <--- AGREGA autoIncrement
    nombreBarrio: DataTypes.STRING,
    idCiudad: DataTypes.INTEGER,
  },
  {
    tableName: "Barrio",
    timestamps: false,
  }
);

const Ciudad = sequelize.define(
  "Ciudad",
  {
    idCiudad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }, // <--- AGREGA autoIncrement
    nombreCiudad: DataTypes.STRING,
    codigoPostal: DataTypes.STRING,
  },
  {
    tableName: "Ciudad",
    timestamps: false,
  }
);

// Relaciones
Persona.belongsTo(Domicilio, { foreignKey: "idDomicilio" });
Domicilio.belongsTo(Barrio, { foreignKey: "idBarrio" });
Domicilio.belongsTo(Ciudad, { foreignKey: "idCiudad" });

// Endpoints básicos
app.get("/api/clientes", async (req, res) => {
  try {
    // Obtén todos los idPersona que están en la tabla usuario
    const usuarios = await sequelize.query(
      "SELECT idPersona FROM usuario WHERE idPersona IS NOT NULL"
    );
    const idsPersonasUsuarios = usuarios[0].map((u) => u.idPersona);

    // Busca solo los clientes cuyo idPersona NO está en la tabla usuario
    const clientes = await Cliente.findAll({
      where: idsPersonasUsuarios.length
        ? { idPersona: { [Sequelize.Op.notIn]: idsPersonasUsuarios } }
        : {},
      include: {
        model: Persona,
        attributes: ["dni", "nombre", "apellido", "direccion"],
        include: {
          model: Domicilio,
          attributes: [
            "calle",
            "altura",
            "piso",
            "departamento",
            "observaciones",
          ],
          include: [
            {
              model: Barrio,
              attributes: ["nombreBarrio"],
            },
            {
              model: Ciudad,
              attributes: ["nombreCiudad", "codigoPostal"],
            },
          ],
        },
      },
    });

    const clientesFormateados = clientes.map((c) => ({
      id: c.idCliente,
      nombre: `${c.Persona?.nombre || ""} ${c.Persona?.apellido || ""}`,
      tipoDocumento: "DNI",
      numeroDocumento: c.Persona?.dni?.toString() || "",
      telefono: c.telefono,
      email: c.email,
      domicilio: c.Persona?.direccion || "",
      calle: c.Persona?.Domicilio?.calle || "",
      altura: c.Persona?.Domicilio?.altura || "",
      piso: c.Persona?.Domicilio?.piso || "",
      numeroDepartamento: c.Persona?.Domicilio?.departamento || "",
      observaciones: c.Persona?.Domicilio?.observaciones || "",
      localidad: c.Persona?.Domicilio?.Ciudad?.nombreCiudad || "",
      cp: c.Persona?.Domicilio?.Ciudad?.codigoPostal || "",
      barrio: c.Persona?.Domicilio?.Barrio?.nombreBarrio || "",
    }));

    res.json(clientesFormateados);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

app.post("/api/clientes", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log("BODY recibido en /api/clientes:", req.body);

    // 1. Crear domicilio
    const domicilio = await Domicilio.create(
      {
        calle: req.body.calle,
        altura: req.body.altura,
        piso: req.body.piso,
        departamento: req.body.numeroDepartamento,
        observaciones: req.body.observaciones,
        idBarrio: req.body.idBarrio,
        idCiudad: req.body.idCiudad,
      },
      { transaction: t }
    );
    console.log("Domicilio creado:", domicilio.toJSON());

    // 2. Crear persona
    const persona = await Persona.create(
      {
        dni: req.body.numeroDocumento,
        nombre: req.body.nombre,
        apellido: "", // Si lo manejas separado
        direccion: req.body.domicilio,
        idDomicilio: domicilio.idDomicilio,
      },
      { transaction: t }
    );
    console.log("Persona creada:", persona.toJSON());

    // 3. Crear cliente
    const cliente = await Cliente.create(
      {
        email: req.body.email,
        telefono: req.body.telefono,
        idPersona: persona.idPersona,
      },
      { transaction: t }
    );
    console.log("Cliente creado:", cliente.toJSON());

    await t.commit();

    // Busca el cliente recién creado with sus relaciones
    const clienteCreado = await Cliente.findByPk(cliente.idCliente, {
      include: {
        model: Persona,
        attributes: ["dni", "nombre", "apellido", "direccion"],
        include: {
          model: Domicilio,
          attributes: [
            "calle",
            "altura",
            "piso",
            "departamento",
            "observaciones",
          ],
          include: [
            { model: Barrio, attributes: ["nombreBarrio"] },
            { model: Ciudad, attributes: ["nombreCiudad", "codigoPostal"] },
          ],
        },
      },
    });

    // Formatea igual que en el GET
    const clienteFormateado = {
      id: clienteCreado.idCliente,
      nombre: `${clienteCreado.Persona?.nombre || ""} ${
        clienteCreado.Persona?.apellido || ""
      }`,
      tipoDocumento: "DNI",
      numeroDocumento: clienteCreado.Persona?.dni?.toString() || "",
      telefono: clienteCreado.telefono,
      email: clienteCreado.email,
      domicilio: clienteCreado.Persona?.direccion || "",
      calle: clienteCreado.Persona?.Domicilio?.calle || "",
      altura: clienteCreado.Persona?.Domicilio?.altura || "",
      piso: clienteCreado.Persona?.Domicilio?.piso || "",
      numeroDepartamento: clienteCreado.Persona?.Domicilio?.departamento || "",
      observaciones: clienteCreado.Persona?.Domicilio?.observaciones || "",
      localidad: clienteCreado.Persona?.Domicilio?.Ciudad?.nombreCiudad || "",
      cp: clienteCreado.Persona?.Domicilio?.Ciudad?.codigoPostal || "",
      barrio: clienteCreado.Persona?.Domicilio?.Barrio?.nombreBarrio || "",
    };

    res.json(clienteFormateado);
  } catch (error) {
    await t.rollback();
    console.error("Error al crear cliente:", error);
    res
      .status(500)
      .json({ error: "Error al crear cliente", detalle: error.message });
  }
});

app.put("/api/clientes/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 1. Buscar cliente y persona
    const cliente = await Cliente.findByPk(req.params.id, { transaction: t });
    if (!cliente) throw new Error("Cliente no encontrado");
    const persona = await Persona.findByPk(cliente.idPersona, {
      transaction: t,
    });
    if (!persona) throw new Error("Persona no encontrada");

    // 2. Actualizar domicilio
    await Domicilio.update(
      {
        calle: req.body.calle,
        altura: req.body.altura,
        piso: req.body.piso,
        departamento: req.body.numeroDepartamento,
        observaciones: req.body.observaciones,
        idBarrio: req.body.idBarrio,
        idCiudad: req.body.idCiudad,
      },
      { where: { idDomicilio: persona.idDomicilio }, transaction: t }
    );

    // 3. Actualizar persona
    await Persona.update(
      {
        dni: req.body.numeroDocumento,
        nombre: req.body.nombre,
        apellido: "", // Si lo manejas separado
        direccion: req.body.domicilio,
      },
      { where: { idPersona: persona.idPersona }, transaction: t }
    );

    // 4. Actualizar cliente
    await Cliente.update(
      {
        email: req.body.email,
        telefono: req.body.telefono,
      },
      { where: { idCliente: req.params.id }, transaction: t }
    );

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ error: "Error al editar cliente", detalle: error.message });
  }
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

// Modelo EncargadoPicker
const EncargadoPicker = sequelize.define(
  "EncargadoPicker",
  {
    legajo: { type: DataTypes.STRING, primaryKey: true },
    idPersona: DataTypes.INTEGER,
  },
  { tableName: "encargadopicker", timestamps: false }
);

// Endpoint de login (debe estar cerca del resto de endpoints)
app.post("/api/login", async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;
  try {
    // Busca el usuario y su rol
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: {
        model: Rol,
        include: { model: TipoRol },
      },
    });
    if (!usuario || usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    // Si es picker, buscar el legajo real
    let legajoPicker = null;
    if (
      usuario.Rol &&
      usuario.Rol.TipoRol &&
      usuario.Rol.TipoRol.tipoRol &&
      usuario.Rol.TipoRol.tipoRol.toLowerCase().includes("picker")
    ) {
      // Buscar en la tabla encargadopicker por idPersona
      const persona = await Persona.findOne({
        where: { idPersona: usuario.idUsuario },
      });
      if (persona) {
        const picker = await EncargadoPicker.findOne({
          where: { idPersona: persona.idPersona },
        });
        if (picker) legajoPicker = picker.legajo;
      }
    }
    res.json({
      nombreUsuario: usuario.nombreUsuario,
      tipoRol: usuario.Rol?.TipoRol?.tipoRol || "",
      legajoPicker, // null si no es picker
    });
  } catch (error) {
    res.status(500).json({ error: "Error en login" });
  }
});

// Obtener todos los usuarios (solo para admin)
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["idUsuario", "nombreUsuario"],
      include: {
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["tipoRol"],
        },
      },
    });

    // Formatea la respuesta para el frontend
    const usuariosFormateados = usuarios.map((u) => ({
      id: u.idUsuario,
      username: u.nombreUsuario,
      rol: u.Rol?.TipoRol?.tipoRol || "",
    }));

    res.json(usuariosFormateados);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear usuario
app.post("/api/usuarios", async (req, res) => {
  const { username, password, rol } = req.body;
  try {
    // Busca el idRol correspondiente al tipoRol recibido
    const rolDB = await Rol.findOne({
      include: {
        model: TipoRol,
        where: { tipoRol: rol },
      },
    });
    if (!rolDB) {
      return res.status(400).json({ error: "Rol no válido" });
    }
    const nuevo = await Usuario.create({
      nombreUsuario: username,
      contrasena: password,
      idRol: rolDB.idRol,
    });
    res.json({ id: nuevo.idUsuario, username: nuevo.nombreUsuario, rol });
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear el usuario" });
  }
});

// Eliminar usuario
app.delete("/api/usuarios/:id", async (req, res) => {
  try {
    await Usuario.destroy({ where: { idUsuario: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "No se pudo eliminar el usuario" });
  }
});

// Actualizar usuario (nombre de usuario y rol)
app.put("/api/usuarios/:id", async (req, res) => {
  const { username, rol } = req.body;
  try {
    // Busca el idRol correspondiente al tipoRol recibido
    const rolDB = await Rol.findOne({
      include: {
        model: TipoRol,
        where: { tipoRol: rol },
      },
    });
    if (!rolDB) {
      return res.status(400).json({ error: "Rol no válido" });
    }
    await Usuario.update(
      { nombreUsuario: username, idRol: rolDB.idRol },
      { where: { idUsuario: req.params.id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "No se pudo actualizar el usuario" });
  }
});

// Cambiar contraseña
app.put("/api/usuarios/:id/password", async (req, res) => {
  const { password } = req.body;
  try {
    const [updated] = await Usuario.update(
      { contrasena: password },
      { where: { idUsuario: req.params.id } }
    );
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: "No se pudo cambiar la contraseña" });
  }
});

// Obtener todos los pedidos con prendas
app.get("/api/pedidos", async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: Cliente,
          include: [
            {
              model: Persona,
              attributes: ["nombre", "apellido", "dni"],
            },
          ],
        },
        { model: EstadoPedido },
        {
          model: DetallePedido,
          include: [{ model: Indumentaria }],
        },
      ],
    });
    res.json(pedidos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener pedidos", detalle: error.message });
  }
});

// Crear pedido con prendas
app.post("/api/pedidos", async (req, res) => {
  const { idCliente, idEstado, prendas } = req.body;
  const t = await sequelize.transaction();
  try {
    // Genera un número de pedido único
    const numeroPedido =
      "PED-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");

    // Crea el pedido (fechaPedido se asigna automáticamente por la BD)
    const pedido = await Pedido.create(
      {
        numeroPedido,
        idCliente,
        idEstado,
      },
      { transaction: t }
    );

    // Crea los detalles del pedido y descuenta stock
    if (prendas && Array.isArray(prendas)) {
      for (const prenda of prendas) {
        await DetallePedido.create(
          {
            idDetallePedido: "DPED-" + Math.random().toString().slice(2, 8),
            numeroPedido,
            codigoIndumentaria: prenda.codigoIndumentaria,
            cantidad: prenda.cantidad,
          },
          { transaction: t }
        );
        // Descontar stock
        const stock = await Stock.findOne({
          where: { codigoIndumentaria: prenda.codigoIndumentaria },
          transaction: t,
        });
        if (stock) {
          await MovimientoStock.create(
            {
              idMovimientoStock:
                "MOV-PED-" + Math.random().toString().slice(2, 8),
              idStock: stock.idStock,
              fechaMovimiento: new Date(),
              cantidad: -Math.abs(prenda.cantidad),
              observaciones: `Descuento por pedido ${numeroPedido}`,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();
    res.json({ numeroPedido });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ error: "Error al crear pedido", detalle: error.message });
  }
});

// Eliminar pedido
app.delete("/api/pedidos/:numeroPedido", async (req, res) => {
  const { numeroPedido } = req.params;
  const t = await sequelize.transaction();
  try {
    // 1. Obtén los detalles del pedido
    const detalles = await DetallePedido.findAll({
      where: { numeroPedido },
      transaction: t,
    });

    // 2. Devuelve el stock de cada prenda
    for (const detalle of detalles) {
      const stock = await Stock.findOne({
        where: { codigoIndumentaria: detalle.codigoIndumentaria },
        transaction: t,
      });
      if (stock) {
        await MovimientoStock.create(
          {
            idMovimientoStock:
              "MOV-DEL-" + Math.random().toString().slice(2, 8),
            idStock: stock.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalle.cantidad, // Devuelve el stock
            observaciones: `Devolución por eliminación de pedido ${numeroPedido}`,
          },
          { transaction: t }
        );
      }
    }

    // 3. Elimina los detalles asociados
    await DetallePedido.destroy({
      where: { numeroPedido },
      transaction: t,
    });

    // 4. Elimina el pedido
    const deleted = await Pedido.destroy({
      where: { numeroPedido },
      transaction: t,
    });

    await t.commit();

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar pedido:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar pedido", detalle: error.message });
  }
});

// Editar pedido
app.put("/api/pedidos/:numeroPedido", async (req, res) => {
  const { idCliente, idEstado, prendas } = req.body;
  const { numeroPedido } = req.params;
  const t = await sequelize.transaction();
  try {
    // 1. Busca el pedido existente
    const pedido = await Pedido.findOne({
      where: { numeroPedido },
      transaction: t,
    });
    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // 2. Recupera detalles anteriores y devuelve stock
    const detallesAnteriores = await DetallePedido.findAll({
      where: { numeroPedido },
      transaction: t,
    });
    for (const detalle of detallesAnteriores) {
      const stock = await Stock.findOne({
        where: { codigoIndumentaria: detalle.codigoIndumentaria },
        transaction: t,
      });
      if (stock) {
        await MovimientoStock.create(
          {
            idMovimientoStock:
              "MOV-EDIT-DEV-" + Math.random().toString().slice(2, 8),
            idStock: stock.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalle.cantidad, // Devuelve el stock anterior
            observaciones: `Devolución por edición de pedido ${numeroPedido}`,
          },
          { transaction: t }
        );
      }
    }

    // 3. Elimina los detalles anteriores
    await DetallePedido.destroy({
      where: { numeroPedido },
      transaction: t,
    });

    // 4. Crea los nuevos detalles y descuenta stock
    if (prendas && Array.isArray(prendas)) {
      for (const prenda of prendas) {
        await DetallePedido.create(
          {
            idDetallePedido: "DPED-" + Math.random().toString().slice(2, 8),
            numeroPedido,
            codigoIndumentaria: prenda.codigoIndumentaria,
            cantidad: prenda.cantidad,
          },
          { transaction: t }
        );
        // Descontar stock
        const stock = await Stock.findOne({
          where: { codigoIndumentaria: prenda.codigoIndumentaria },
          transaction: t,
        });
        if (stock) {
          await MovimientoStock.create(
            {
              idMovimientoStock:
                "MOV-EDIT-DESC-" + Math.random().toString().slice(2, 8),
              idStock: stock.idStock,
              fechaMovimiento: new Date(),
              cantidad: -Math.abs(prenda.cantidad),
              observaciones: `Descuento por edición de pedido ${numeroPedido}`,
            },
            { transaction: t }
          );
        }
      }
    }

    // 5. Forzar UPDATE real para que se actualice fechaModificacion
    await sequelize.query(
      `UPDATE pedido SET idEstado = idEstado + 1 WHERE numeroPedido = ?`,
      {
        replacements: [numeroPedido],
        transaction: t,
      }
    );
    await sequelize.query(
      `UPDATE pedido SET idEstado = idEstado - 1 WHERE numeroPedido = ?`,
      {
        replacements: [numeroPedido],
        transaction: t,
      }
    );
    // Esto asegura que MySQL SIEMPRE modifique la fila y dispare el trigger ON UPDATE
    // Esto SIEMPRE ejecuta el UPDATE y MySQL actualizará fechaModificacion

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ error: "Error al editar pedido", detalle: error.message });
  }
});
// Obtener pedido por ID con prendas
/*app.get("/api/pedidos/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      where: { numeroPedido: req.params.id }, // <-- CORREGIDO
      include: [
        { model: Cliente },
        {
          model: Indumentaria,
          through: { attributes: ["cantidad"] },
        },
      ],
    });
    if (pedido) {
      res.json(pedido);
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener pedido", detalle: error.message });
  }
});*/

// Validar usuario por nombre de usuario
app.get("/api/usuarios/validate", async (req, res) => {
  const { username } = req.query;
  const usuario = await Usuario.findOne({ where: { nombreUsuario: username } });
  res.json({ valid: !!usuario });
});
// Obtener todas las prendas
app.get("/api/indumentaria", async (req, res) => {
  try {
    const prendas = await Indumentaria.findAll({
      include: [
        {
          model: DetalleIndumentaria,
          include: [
            { model: NombreIndumentaria, attributes: ["idNombre", "nombre"] }, // <--- NUEVO
            { model: Color, attributes: ["color"] },
            { model: Talle, attributes: ["talle"] },
            { model: Tela, attributes: ["tipoTela"] },
            { model: CategoriaIndumentaria, attributes: ["categoria"] },
            { model: PrecioIndumentaria, attributes: ["precio"] },
            { model: EstadoIndumentaria, attributes: ["estadoIndumentaria"] },
          ],
        },
      ],
    });

    // Obtén todos los stocks y movimientos de una sola vez
    const stocks = await Stock.findAll();
    const movimientos = await MovimientoStock.findAll();

    // Mapea el stock actual por codigoIndumentaria
    const stockPorCodigo = {};
    stocks.forEach((s) => {
      const movimientosDeEsteStock = movimientos.filter(
        (m) => m.idStock === s.idStock
      );
      const total = movimientosDeEsteStock.reduce(
        (acc, m) => acc + (m.cantidad || 0),
        0
      );
      if (!stockPorCodigo[s.codigoIndumentaria]) {
        stockPorCodigo[s.codigoIndumentaria] = 0;
      }
      stockPorCodigo[s.codigoIndumentaria] += total;
    });

    // Formatea la respuesta para el frontend
    const prendasFormateadas = prendas.map((p) => ({
      codigoIndumentaria: p.codigoIndumentaria,
      nombre: p.DetalleIndumentarium?.NombreIndumentarium?.nombre || "", // <--- NOMBRE
      color: p.DetalleIndumentarium?.Color?.color || "",
      talle: p.DetalleIndumentarium?.Talle?.talle || "",
      nombreTela: p.DetalleIndumentarium?.Tela?.tipoTela || "",
      categoria:
        p.DetalleIndumentarium?.CategoriaIndumentarium?.categoria || "",
      precio: p.DetalleIndumentarium?.PrecioIndumentarium?.precio || "",
      estado:
        p.DetalleIndumentarium?.EstadoIndumentarium?.estadoIndumentaria || "",
      cantidadIndumentaria: stockPorCodigo[p.codigoIndumentaria] || 0,
    }));

    res.json(prendasFormateadas);
  } catch (error) {
    console.error("Error en /api/indumentaria:", error);
    res.status(500).json({ error: "Error al obtener indumentaria" });
  }
});

// Crear nueva prenda
app.post("/api/indumentaria", async (req, res) => {
  console.log("Datos recibidos en alta indumentaria:", req.body); // <-- agrega esto
  const t = await sequelize.transaction();
  try {
    // 1. Crea la prenda
    const prenda = await Indumentaria.create(req.body, { transaction: t });

    // 2. Crea el registro en stock
    const stock = await Stock.create(
      {
        idStock: "STK" + Math.random().toString().slice(2, 8), // Genera un idStock simple
        codigoIndumentaria: prenda.codigoIndumentaria,
      },
      { transaction: t }
    );

    // 3. Si se envió cantidad inicial, crea el movimiento de stock
    if (req.body.cantidad && Number(req.body.cantidad) > 0) {
      await MovimientoStock.create(
        {
          idMovimientoStock: "MOV-INIT-" + Math.random().toString().slice(2, 8),
          idStock: stock.idStock,
          fechaMovimiento: new Date(),
          cantidad: Number(req.body.cantidad),
          observaciones: "Carga Inicial de Stock",
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.json(prenda);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: "Error al crear prenda" });
  }
});

// Editar prenda
app.put("/api/indumentaria/:id", async (req, res) => {
  try {
    console.log("PUT /api/indumentaria/:id", req.params.id, req.body);
    const [updated] = await Indumentaria.update(
      {
        codigoIndumentaria: req.body.codigoIndumentaria,
        idDetalle: req.body.idDetalle,
      },
      {
        where: { codigoIndumentaria: req.params.id },
      }
    );
    console.log("Filas actualizadas:", updated);

    if (updated) {
      res.json({ success: true });
    } else {
      // Si no se actualizó ninguna fila, verifica si la prenda existe
      const existe = await Indumentaria.findOne({
        where: { codigoIndumentaria: req.params.id },
      });
      if (existe) {
        res.json({ success: true }); // Considera éxito si existe
      } else {
        res.status(404).json({ error: "Prenda no encontrada" });
      }
    }
  } catch (error) {
    console.error("Error en PUT /api/indumentaria/:id", error);
    res.status(500).json({ error: "Error al editar prenda" });
  }
});

// Eliminar prenda
app.delete("/api/indumentaria/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const codigo = req.params.id;

    // 1. Busca los stocks asociados a la prenda
    const stocks = await Stock.findAll({
      where: { codigoIndumentaria: codigo },
      transaction: t,
    });

    // 2. Elimina los movimientos de stock asociados
    for (const stock of stocks) {
      await MovimientoStock.destroy({
        where: { idStock: stock.idStock },
        transaction: t,
      });
    }

    // 3. Elimina los stocks asociados
    await Stock.destroy({
      where: { codigoIndumentaria: codigo },
      transaction: t,
    });

    // 4. Elimina la prenda
    const deleted = await Indumentaria.destroy({
      where: { codigoIndumentaria: codigo },
      transaction: t,
    });

    await t.commit();

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Prenda no encontrada" });
    }
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error al eliminar prenda:", error);
    res.status(500).json({ error: "Error al eliminar prenda" });
  }
});

// Obtener prenda por ID
app.get("/api/indumentaria/:id", async (req, res) => {
  try {
    const prenda = await Indumentaria.findOne({
      where: { codigoIndumentaria: req.params.id },
      include: [
        {
          model: DetalleIndumentaria,
          include: [
            { model: NombreIndumentaria, attributes: ["idNombre", "nombre"] }, // <--- NUEVO
            { model: Color, attributes: ["idColor", "color"] },
            { model: Talle, attributes: ["idTalle", "talle"] },
            { model: Tela, attributes: ["idTela", "tipoTela"] },
            {
              model: CategoriaIndumentaria,
              attributes: ["idCategoria", "categoria"],
            },
            { model: PrecioIndumentaria, attributes: ["idPrecio", "precio"] },
            {
              model: EstadoIndumentaria,
              attributes: ["idEstado", "estadoIndumentaria"],
            },
          ],
        },
      ],
    });

    if (!prenda) {
      return res.status(404).json({ error: "Prenda no encontrada" });
    }

    // --- Calcular stock actual ---
    const stocks = await Stock.findAll({
      where: { codigoIndumentaria: prenda.codigoIndumentaria },
    });
    let cantidad = 0;
    for (const stock of stocks) {
      const movimientos = await MovimientoStock.findAll({
        where: { idStock: stock.idStock },
      });
      cantidad += movimientos.reduce((acc, m) => acc + (m.cantidad || 0), 0);
    }

    const detalle = prenda.DetalleIndumentarium;
    res.json({
      codigoIndumentaria: prenda.codigoIndumentaria,
      idNombre: detalle?.NombreIndumentarium?.idNombre || "",
      nombre: detalle?.NombreIndumentarium?.nombre || "",
      idColor: detalle?.idColor || "",
      idTalle: detalle?.idTalle || "",
      idTela: detalle?.idTela || "",
      idCategoria: detalle?.idCategoria || "",
      idEstado: detalle?.idEstado || "",
      idPrecio: detalle?.idPrecio || "",
      precio: detalle?.PrecioIndumentarium?.precio || "",
      cantidad: cantidad.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener prenda" });
  }
});

// Obtener todos los tipos de rol
app.get("/api/tiporoles", async (req, res) => {
  try {
    const roles = await TipoRol.findAll({ attributes: ["tipoRol"] });
    res.json(roles.map((r) => r.tipoRol));
  } catch (error) {
    res.status(500).json({ error: "Error al obtener roles" });
  }
});

// Buscar o crear ciudad
app.post("/api/ciudades/find-or-create", async (req, res) => {
  const { nombreCiudad, codigoPostal } = req.body;
  let ciudad = await Ciudad.findOne({ where: { nombreCiudad } });
  if (!ciudad) {
    ciudad = await Ciudad.create({ nombreCiudad, codigoPostal });
  }
  // Devuelve solo los datos planos
  res.json({
    idCiudad: ciudad.idCiudad,
    nombreCiudad: ciudad.nombreCiudad,
    codigoPostal: ciudad.codigoPostal,
  });
});

// Buscar o crear barrio
app.post("/api/barrios/find-or-create", async (req, res) => {
  const { nombreBarrio, idCiudad } = req.body;
  let barrio = await Barrio.findOne({ where: { nombreBarrio, idCiudad } });
  if (!barrio) {
    barrio = await Barrio.create({ nombreBarrio, idCiudad });
  }
  res.json({
    idBarrio: barrio.idBarrio,
    nombreBarrio: barrio.nombreBarrio,
    idCiudad: barrio.idCiudad,
  });
});

// Buscar o crear detalle de indumentaria
app.post("/api/detalle-indumentaria/find-or-create", async (req, res) => {
  const {
    idNombre,
    idPrecio,
    idCategoria,
    idColor,
    idTalle,
    idEstado,
    idTela,
  } = req.body;
  let detalle = await DetalleIndumentaria.findOne({
    where: {
      idNombre,
      idPrecio,
      idCategoria,
      idColor,
      idTalle,
      idEstado,
      idTela,
    },
  });
  if (!detalle) {
    detalle = await DetalleIndumentaria.create({
      idNombre,
      idPrecio,
      idCategoria,
      idColor,
      idTalle,
      idEstado,
      idTela,
    });
  }
  res.json({ idDetalle: detalle.idDetalle });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

// Inicia el servidor
app.listen(3001, () => console.log("API corriendo en http://localhost:3001"));

// Nuevos endpoints para obtener colores, talles, telas, categorías y estados de indumentaria
app.get("/api/colores", async (req, res) => {
  const colores = await Color.findAll();
  res.json(colores);
});

app.get("/api/talles", async (req, res) => {
  const talles = await Talle.findAll();
  res.json(talles);
});

app.get("/api/telas", async (req, res) => {
  const telas = await Tela.findAll();
  res.json(telas);
});

app.get("/api/categorias", async (req, res) => {
  const categorias = await CategoriaIndumentaria.findAll();
  res.json(categorias);
});

app.get("/api/estados-indumentaria", async (req, res) => {
  const estados = await EstadoIndumentaria.findAll();
  res.json(estados);
});

app.post("/api/colores", async (req, res) => {
  const { color } = req.body;
  const nuevo = await Color.create({ color });
  res.json(nuevo);
});

app.post("/api/talles", async (req, res) => {
  const { talle } = req.body; // <-- CAMBIA de nroTalle a talle
  const nuevo = await Talle.create({ talle });
  res.json(nuevo);
});

app.post("/api/telas", async (req, res) => {
  const { tipoTela } = req.body;
  const nuevo = await Tela.create({ tipoTela });
  res.json(nuevo);
});

app.post("/api/categorias", async (req, res) => {
  const { categoria } = req.body;
  const nuevo = await CategoriaIndumentaria.create({ categoria });
  res.json(nuevo);
});

app.post("/api/estados-indumentaria", async (req, res) => {
  const { estadoIndumentaria } = req.body;
  const nuevo = await EstadoIndumentaria.create({ estadoIndumentaria });
  res.json(nuevo);
});

app.get("/api/precios", async (req, res) => {
  try {
    const precios = await PrecioIndumentaria.findAll();
    res.json(precios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener precios" });
  }
});

app.post("/api/precios", async (req, res) => {
  try {
    const { precio } = req.body;
    const nuevo = await PrecioIndumentaria.create({ precio });
    res.json(nuevo);
  } catch (error) {
    res.status(500).json({ error: "Error al crear precio" });
  }
});

app.get("/api/pedidos/:numeroPedido", async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      where: { numeroPedido: req.params.numeroPedido },
      include: [
        {
          model: Cliente,
          include: [
            {
              model: Persona,
              attributes: ["nombre", "apellido", "dni"],
            },
          ],
        },
        { model: EstadoPedido },
        {
          model: DetallePedido,
          include: [
            {
              model: Indumentaria,
              as: "Indumentarium",
              include: [
                {
                  model: DetalleIndumentaria,
                  as: "DetalleIndumentarium",
                  include: [
                    {
                      model: NombreIndumentaria,
                      as: "NombreIndumentarium",
                      attributes: ["nombre"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (pedido) {
      res.json(pedido);
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener pedido", detalle: error.message });
  }
});

app.get("/api/pedidos/:numeroPedido/detalle-plano", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const [result] = await sequelize.query(
      `
      SELECT
        ni.nombre AS nombreProducto,
        i.codigoIndumentaria AS referencia,
        i.codigoIndumentaria AS sku,
        cat.categoria AS categoria,
        r.numeroRack AS rack,
        dp.cantidad AS cantidad
      FROM
        detallepedido dp
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
        categoriaindumentaria cat ON di.idCategoria = cat.idCategoria
      JOIN
        stock s ON i.codigoIndumentaria = s.codigoIndumentaria
      JOIN
        rack r ON s.idRack = r.idRack
      WHERE
        dp.numeroPedido = ?
      `,
      { replacements: [numeroPedido] }
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener detalle plano del pedido" });
  }
});

const Stock = sequelize.define(
  "Stock",
  {
    idStock: { type: DataTypes.STRING, primaryKey: true },
    codigoIndumentaria: DataTypes.STRING,
  },
  { tableName: "stock", timestamps: false }
);

const MovimientoStock = sequelize.define(
  "MovimientoStock",
  {
    idMovimientoStock: { type: DataTypes.STRING, primaryKey: true },
    idStock: DataTypes.STRING,
    fechaMovimiento: DataTypes.DATE,
    cantidad: DataTypes.INTEGER,
    observaciones: DataTypes.STRING,
  },
  { tableName: "movimientostock", timestamps: false }
);

app.get("/api/nombres-indumentaria", async (req, res) => {
  try {
    const nombres = await NombreIndumentaria.findAll();
    res.json(nombres);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener nombres de indumentaria" });
  }
});

app.post("/api/nombres-indumentaria/find-or-create", async (req, res) => {
  const { nombre } = req.body;
  let nombreInd = await NombreIndumentaria.findOne({ where: { nombre } });
  if (!nombreInd) {
    nombreInd = await NombreIndumentaria.create({ nombre });
  }
  res.json({ idNombre: nombreInd.idNombre });
});

app.put("/api/detalle-indumentaria/:idDetalle/precio", async (req, res) => {
  try {
    const { precio } = req.body;
    // Busca el detalle
    const detalle = await DetalleIndumentaria.findByPk(req.params.idDetalle);
    if (!detalle) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }
    // Actualiza el precio en la tabla PrecioIndumentaria
    await PrecioIndumentaria.update(
      { precio },
      { where: { idPrecio: detalle.idPrecio } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar precio" });
  }
});

app.post("/api/stock/movimiento", async (req, res) => {
  try {
    const { codigoIndumentaria, cantidad, observaciones } = req.body;
    // Busca el stock de la prenda
    const stock = await Stock.findOne({ where: { codigoIndumentaria } });
    if (!stock) {
      return res.status(404).json({ error: "Stock no encontrado" });
    }
    // Crea el movimiento
    await MovimientoStock.create({
      idMovimientoStock: "MOV-" + Math.random().toString().slice(2, 8),
      idStock: stock.idStock,
      fechaMovimiento: new Date(),
      cantidad: Number(cantidad),
      observaciones: observaciones || "Ajuste manual de stock",
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al crear movimiento de stock" });
  }
});

app.get("/api/reportes/clientes-mas-pedidos", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        c.idCliente,
        p.nombre,
        p.apellido,
        c.email,
        COUNT(ped.numeroPedido) AS total_pedidos
      FROM
        pedido ped
      JOIN
        cliente c ON ped.idCliente = c.idCliente
      JOIN
        persona p ON c.idPersona = p.idPersona
      GROUP BY
        c.idCliente, p.nombre, p.apellido, c.email
      ORDER BY
        total_pedidos DESC
      LIMIT 10
    `);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener clientes con más pedidos" });
  }
});

app.get("/api/reportes/stock-actual", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        s.codigoIndumentaria,
        ni.nombre AS nombre_producto,
        r.numeroRack AS rack,
        SUM(ms.cantidad) AS stock_actual
      FROM
        movimientostock ms
      JOIN
        stock s ON ms.idStock = s.idStock
      JOIN
        indumentaria i ON s.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
        rack r ON s.idRack = r.idRack
      GROUP BY
        s.codigoIndumentaria, ni.nombre, r.numeroRack
      ORDER BY
        stock_actual ASC
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener stock actual" });
  }
});

app.get("/api/reportes/productos-mas-pedidos", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        ni.nombre AS nombre_indumentaria,
        dp.codigoIndumentaria,
        SUM(dp.cantidad) AS cantidad_total_vendida,
        ta.talle,
        te.tipoTela AS tela,
        co.color
      FROM
        detallepedido dp
      JOIN
        pedido p ON dp.numeroPedido = p.numeroPedido
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
        talle ta ON di.idTalle = ta.idTalle
      JOIN
        tela te ON di.idTela = te.idTela
      JOIN
        color co ON di.idColor = co.idColor
      WHERE
        p.idEstado != 6
      GROUP BY
        dp.codigoIndumentaria,
        ni.nombre,
        ta.talle,
        te.tipoTela,
        co.color
      ORDER BY
        cantidad_total_vendida DESC
      LIMIT 5
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos más pedidos" });
  }
});

// --- PICKING: Obtener lista de pickers ---
app.get("/api/pickers", async (req, res) => {
  try {
    // Consulta SQL: SELECT ep.legajo, pe.nombre, pe.apellido FROM encargadopicker ep JOIN persona pe ON ep.idPersona = pe.idPersona ORDER BY pe.apellido, pe.nombre;
    const [pickers] = await sequelize.query(`
      SELECT ep.legajo, pe.nombre, pe.apellido
      FROM encargadopicker ep
      JOIN persona pe ON ep.idPersona = pe.idPersona
      ORDER BY pe.apellido, pe.nombre
    `);
    res.json(
      pickers.map((p) => ({
        id: p.legajo,
        nombre: `${p.nombre} ${p.apellido}`.trim(),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pickers" });
  }
});

// --- PICKING: Asignar picker a pedido ---
app.post("/api/pedidos/:numeroPedido/asignar-picker", async (req, res) => {
  const { numeroPedido } = req.params;
  const { pickerId } = req.body;
  try {
    // 1. Marcar como completadas todas las asignaciones activas previas de este pedido
    await sequelize.query(
      `UPDATE asignacion_picking SET completado = 1, fechaCompletado = NOW() WHERE numeroPedido = ? AND completado = 0`,
      { replacements: [numeroPedido] }
    );
    // 2. Insertar la nueva asignación
    await sequelize.query(
      `INSERT INTO asignacion_picking (numeroPedido, legajoPicker, observaciones) VALUES (?, ?, ?)`,
      {
        replacements: [
          numeroPedido,
          pickerId,
          "Asignación desde panel gerente",
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al asignar picker" });
  }
});

// --- ENDPOINTS DE PICKING ---

// 1. Obtener tareas de picking asignadas a un picker
app.get("/api/picking/tareas", async (req, res) => {
  let { legajo, rol } = req.query;
  try {
    // Si el usuario es administrador (por rol)
    if (
      rol &&
      ["admin", "Administrador", "ADMIN", "administrador"].includes(
        String(rol).toLowerCase()
      )
    ) {
      const [todas] = await sequelize.query(`
        SELECT ap.idAsignacion, ap.numeroPedido, ap.fechaAsignacion, ap.legajoPicker
        FROM asignacion_picking ap
        WHERE ap.completado = 0
        ORDER BY ap.fechaAsignacion DESC
      `);
      return res.json(todas);
    }
    // Si el usuario es administrador (por legajo, compatibilidad)
    if (
      !legajo ||
      ["admin", "Administrador", "ADMIN", "administrador"].includes(
        String(legajo).toLowerCase()
      )
    ) {
      const [todas] = await sequelize.query(`
        SELECT ap.idAsignacion, ap.numeroPedido, ap.fechaAsignacion, ap.legajoPicker
        FROM asignacion_picking ap
        WHERE ap.completado = 0
        ORDER BY ap.fechaAsignacion DESC
      `);
      return res.json(todas);
    }
    // Si es picker, solo sus tareas
    const [tareas] = await sequelize.query(
      `
      SELECT ap.idAsignacion, ap.numeroPedido, ap.fechaAsignacion, ap.legajoPicker
      FROM asignacion_picking ap
      WHERE ap.legajoPicker = :legajo AND ap.completado = 0
      ORDER BY ap.fechaAsignacion DESC
    `,
      { replacements: { legajo } }
    );
    res.json(tareas);
  } catch (err) {
    res.json([]); // Nunca error 500, solo array vacío
  }
});

// 2. Obtener picking list de un pedido
app.get("/api/picking/lista", async (req, res) => {
  const { numeroPedido } = req.query;
  try {
    // Consulta robusta: muestra productos aunque no tengan stock/rack, pero incluye rack si existe
    const [lista] = await sequelize.query(
      `
      SELECT
        ni.nombre AS nombre_producto,
        i.codigoIndumentaria AS referencia,
        i.codigoIndumentaria AS sku,
        cat.categoria AS categoria,
        r.numeroRack AS rack,
        dp.cantidad AS cantidad,
        c.color,
        t.talle
      FROM
        detallepedido dp
      JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN categoriaindumentaria cat ON di.idCategoria = cat.idCategoria
      LEFT JOIN stock s ON i.codigoIndumentaria = s.codigoIndumentaria
      LEFT JOIN rack r ON s.idRack = r.idRack
      LEFT JOIN color c ON di.idColor = c.idColor
      LEFT JOIN talle t ON di.idTalle = t.idTalle
      WHERE dp.numeroPedido = :numeroPedido
    `,
      { replacements: { numeroPedido } }
    );
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener picking list" });
  }
});

// 3. Completar tarea de picking
app.post("/api/picking/completar", async (req, res) => {
  const { idAsignacion, numeroPedido } = req.body;
  try {
    // Marcar la asignación como completada
    await sequelize.query(
      `UPDATE asignacion_picking SET completado = 1, fechaCompletado = NOW() WHERE idAsignacion = :idAsignacion`,
      { replacements: { idAsignacion } }
    );
    // Cambiar el estado del pedido a "Pendiente de Pago" (idEstado = 2)
    const idEstadoPendientePago = 2;
    await sequelize.query(
      `UPDATE pedido SET idEstado = :idEstadoPendientePago WHERE numeroPedido = :numeroPedido`,
      { replacements: { idEstadoPendientePago, numeroPedido } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al completar tarea de picking" });
  }
});

// --- PICKING: Obtener picker asignado a un pedido ---
app.get("/api/pedidos/:numeroPedido/picker-asignado", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const [result] = await sequelize.query(
      `SELECT ep.legajo, CONCAT(pe.nombre, ' ', pe.apellido) AS nombre
       FROM asignacion_picking ap
       JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
       JOIN persona pe ON ep.idPersona = pe.idPersona
       WHERE ap.numeroPedido = :numeroPedido
       ORDER BY ap.fechaAsignacion DESC
       LIMIT 1`,
      { replacements: { numeroPedido } }
    );
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: "Error al obtener picker asignado" });
  }
});

// Cambiar estado a Abonado
app.put("/api/pedidos/:numeroPedido/abonado", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    await sequelize.query(
      `UPDATE pedido SET idEstado = 3 WHERE numeroPedido = :numeroPedido`,
      { replacements: { numeroPedido } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al marcar el pedido como abonado" });
  }
});

// --- API de Envíos/Despachos ---

// 1. Obtener todos los pedidos 'Abonado' (idEstado = 3)
app.get("/api/envios/pendientes", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        p.numeroPedido,
        p.fechaPedido,
        c.email AS cliente_email,
        pe.nombre,
        pe.apellido,
        CONCAT(d.calle, ' ', d.altura, ', ', ci.nombreCiudad) AS direccion_envio,
        SUM(dp.cantidad) AS total_items,
        p.codigoSeguimiento
      FROM pedido p
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN persona pe ON c.idPersona = pe.idPersona
      JOIN domicilio d ON pe.idDomicilio = d.idDomicilio
      JOIN ciudad ci ON d.idCiudad = ci.idCiudad
      JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
      WHERE p.idEstado = 3
      GROUP BY p.numeroPedido, c.email, pe.nombre, pe.apellido, p.fechaPedido, direccion_envio, p.codigoSeguimiento
      ORDER BY p.fechaPedido DESC
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedidos para despacho" });
  }
});

// 2. Marcar pedido como despachado y guardar código de seguimiento
app.put("/api/envios/despachar/:numeroPedido", async (req, res) => {
  try {
    const { codigoSeguimiento } = req.body;
    const { numeroPedido } = req.params;
    // Actualiza el pedido
    const [updated] = await Pedido.update(
      { codigoSeguimiento, idEstado: 4 },
      { where: { numeroPedido } }
    );
    if (updated === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al despachar el pedido" });
  }
});
