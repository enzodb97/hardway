// Importar todos los modelos
const Cliente = require('./Cliente');
const Persona = require('./Persona');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const TipoRol = require('./TipoRol');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
const EstadoPedido = require('./EstadoPedido');
const Indumentaria = require('./Indumentaria');
const DetalleIndumentaria = require('./DetalleIndumentaria');
const PedidoIndumentaria = require('./PedidoIndumentaria');
const UnidadMedida = require('./UnidadMedida');
const MotivoNoApta = require('./MotivoNoApta');
const StockRegistroFallo = require('./StockRegistroFallo');
const EmpresaEnvio = require('./EmpresaEnvio'); // Nuevo modelo
const AsignacionPicking = require('./AsignacionPicking'); // Nuevo modelo
const { Domicilio, Barrio, Ciudad } = require('./Ubicacion');
const {
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  NombreIndumentaria,
} = require('./IndumentariaAuxiliares');

// Modelos adicionales que están en el archivo original
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Stock = sequelize.define(
  "Stock",
  {
    idStock: { type: DataTypes.STRING, primaryKey: true },
    codigoIndumentaria: DataTypes.STRING,
    idRack: DataTypes.INTEGER,
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

const EncargadoPicker = sequelize.define(
  "EncargadoPicker",
  {
    legajo: { type: DataTypes.STRING, primaryKey: true },
    idPersona: DataTypes.INTEGER,
  },
  { tableName: "encargadopicker", timestamps: false }
);

const MotivoCancelacion = sequelize.define(
  "MotivoCancelacion",
  {
    idMotivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descripcion: DataTypes.STRING,
  },
  { tableName: "motivo_cancelacion", timestamps: false }
);

const Rack = sequelize.define(
  "Rack",
  {
    idRack: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numeroRack: DataTypes.STRING,
    descripcion: DataTypes.STRING
  },
  { tableName: "rack", timestamps: false }
);

// Configurar todas las relaciones
const setupAssociations = () => {
  // Relaciones básicas
  Cliente.belongsTo(Persona, { foreignKey: "idPersona" });
  Usuario.belongsTo(Rol, { foreignKey: "idRol" });
  Rol.belongsTo(TipoRol, { foreignKey: "idTipoRol" });

  // Relaciones de Pedido
  Pedido.belongsTo(Cliente, { foreignKey: "idCliente" });
  Pedido.belongsTo(EstadoPedido, { foreignKey: "idEstado" });
  Pedido.belongsTo(EmpresaEnvio, { foreignKey: "idEmpresaEnvio" }); // Nueva relación
  Pedido.hasMany(DetallePedido, { foreignKey: "numeroPedido" });
  Pedido.hasMany(AsignacionPicking, { foreignKey: "numeroPedido" }); // Nueva relación

  // Relaciones de AsignacionPicking
  AsignacionPicking.belongsTo(Pedido, { foreignKey: "numeroPedido" });
  AsignacionPicking.belongsTo(EncargadoPicker, { foreignKey: "legajoPicker", targetKey: "legajo" });

  // Relaciones de DetallePedido
  DetallePedido.belongsTo(Pedido, { foreignKey: "numeroPedido" });
  DetallePedido.belongsTo(Indumentaria, { 
    foreignKey: "codigoIndumentaria", 
    as: "Indumentarium" 
  });

  // Relaciones many-to-many Pedido-Indumentaria
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

  // Relaciones de Indumentaria
  Indumentaria.belongsTo(DetalleIndumentaria, { 
    foreignKey: "idDetalle",
    as: "DetalleIndumentarium" 
  });

  // Relaciones de DetalleIndumentaria
  DetalleIndumentaria.belongsTo(NombreIndumentaria, { 
    foreignKey: "idNombre",
    as: "NombreIndumentarium" 
  });
  DetalleIndumentaria.belongsTo(Color, { foreignKey: "idColor" });
  DetalleIndumentaria.belongsTo(Talle, { foreignKey: "idTalle" });
  DetalleIndumentaria.belongsTo(Tela, { 
    foreignKey: "idTela",
    as: "TelaIndumentarium" 
  });
  DetalleIndumentaria.belongsTo(CategoriaIndumentaria, { 
    foreignKey: "idCategoria",
    as: "CategoriaIndumentarium" 
  });
  DetalleIndumentaria.belongsTo(PrecioIndumentaria, { 
    foreignKey: "idPrecio",
    as: "PrecioIndumentarium" 
  });
  DetalleIndumentaria.belongsTo(EstadoIndumentaria, { 
    foreignKey: "idEstado",
    as: "EstadoIndumentarium" 
  });
  
  // Relación con UnidadMedida
  DetalleIndumentaria.belongsTo(UnidadMedida, { 
    foreignKey: "idUnidadMedida",
    as: "UnidadMedidum" 
  });

  // Relaciones de ubicación
  Persona.belongsTo(Domicilio, { foreignKey: "idDomicilio" });
  Domicilio.belongsTo(Barrio, { foreignKey: "idBarrio" });
  Domicilio.belongsTo(Ciudad, { foreignKey: "idCiudad" });

  // Relaciones de stock
  Stock.belongsTo(Rack, { foreignKey: "idRack" });
  Stock.belongsTo(Indumentaria, { foreignKey: "codigoIndumentaria" });
  Indumentaria.hasOne(Stock, { foreignKey: "codigoIndumentaria" });
  
  // Relaciones de MovimientoStock
  MovimientoStock.belongsTo(Stock, { foreignKey: "idStock" });
  Stock.hasMany(MovimientoStock, { foreignKey: "idStock" });

  console.log("⚙️  Configurando relaciones entre modelos...");
  console.log("✅ Relaciones de modelos configuradas correctamente");
};

// Exportar todos los modelos y la función de configuración
module.exports = {
  // Modelos principales
  Cliente,
  Persona,
  Usuario,
  Rol,
  TipoRol,
  Pedido,
  DetallePedido,
  EstadoPedido,
  Indumentaria,
  DetalleIndumentaria,
  PedidoIndumentaria,
  
  // Modelos de ubicación
  Domicilio,
  Barrio,
  Ciudad,
  
  // Modelos auxiliares de indumentaria
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  NombreIndumentaria,
  UnidadMedida,
  
  // Modelos adicionales
  Stock,
  MovimientoStock,
  EncargadoPicker,
  MotivoCancelacion,
  Rack,
  MotivoNoApta,
  StockRegistroFallo,
  
  // Nuevos modelos para flujo unificado Picker/Despacho
  EmpresaEnvio,
  AsignacionPicking,
  
  // Función para configurar relaciones
  setupAssociations,
  
  // Exportar la instancia de Sequelize para consultas directas
  sequelize,
};
