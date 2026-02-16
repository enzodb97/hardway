// Importar todos los modelos
const Cliente = require('./Cliente');
const Persona = require('./Persona');
const Usuario = require('./Usuario');
// const Rol = require('./Rol'); // ❌ ELIMINADO - Tabla 'rol' ya no existe en BD
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
const MotivoModificacionPedido = require('./MotivoModificacionPedido');
const HistorialModificacionPedido = require('./HistorialModificacionPedido');
const MotivoInactivacionUsuario = require('./MotivoInactivacionUsuario'); // Nuevo modelo
const PresentacionProducto = require('./PresentacionProducto'); // Modelo para presentaciones
const ConfiguracionPresentacion = require('./ConfiguracionPresentacion'); // Modelo para configuración
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

// ✅ Modelo para la tabla intermedia usuario_tiporol (N:M)
const UsuarioTipoRol = sequelize.define(
  "UsuarioTipoRol",
  {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'usuario',
        key: 'idUsuario'
      }
    },
    idTipoRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'tiporol',
        key: 'idTipoRol'
      }
    }
  },
  { 
    tableName: "usuario_tiporol", 
    timestamps: false // ✅ CRÍTICO: Sin createdAt/updatedAt
  }
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
  Usuario.belongsTo(Persona, { foreignKey: "idPersona" }); // ✅ Agregar relación Usuario -> Persona
  
  // ✅ NUEVA RELACIÓN N:M: Usuario ←→ TipoRol (a través de usuario_tiporol)
  Usuario.belongsToMany(TipoRol, {
    through: UsuarioTipoRol, // ✅ Usar el modelo explícito en lugar de string
    foreignKey: "idUsuario",
    otherKey: "idTipoRol",
    as: "roles" // Alias para acceder: usuario.roles
  });
  
  TipoRol.belongsToMany(Usuario, {
    through: UsuarioTipoRol, // ✅ Usar el modelo explícito en lugar de string
    foreignKey: "idTipoRol",
    otherKey: "idUsuario",
    as: "usuarios" // Alias para acceder: tipoRol.usuarios
  });

  // ✅ Relación Usuario -> MotivoInactivacionUsuario
  Usuario.belongsTo(MotivoInactivacionUsuario, { 
    foreignKey: "idMotivoInactivacion",
    as: "motivoInactivacion"
  });
  
  // ❌ RELACIONES ANTIGUAS ELIMINADAS:
  // Usuario.belongsTo(Rol, { foreignKey: "idRol" });
  // Rol.belongsTo(TipoRol, { foreignKey: "idTipoRol" });

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
  DetallePedido.belongsTo(PresentacionProducto, { 
    foreignKey: "idPresentacion",
    as: "Presentacion"
  });

  // Relaciones de ConfiguracionPresentacion
  ConfiguracionPresentacion.belongsTo(Indumentaria, { 
    foreignKey: "codigoIndumentaria",
    as: "Indumentaria"
  });
  ConfiguracionPresentacion.belongsTo(PresentacionProducto, { 
    foreignKey: "idPresentacion",
    as: "Presentacion"
  });

  // Relación inversa: una Indumentaria puede tener múltiples configuraciones
  Indumentaria.hasMany(ConfiguracionPresentacion, { 
    foreignKey: "codigoIndumentaria",
    as: "ConfiguracionesPresentacion"
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

  // Relaciones de HistorialModificacionPedido
  HistorialModificacionPedido.belongsTo(Pedido, { foreignKey: "numeroPedido" });
  HistorialModificacionPedido.belongsTo(Usuario, { 
    foreignKey: "idUsuarioModifico",
    as: "UsuarioModificador"
  });
  HistorialModificacionPedido.belongsTo(MotivoModificacionPedido, { 
    foreignKey: "idMotivo",
    as: "Motivo"
  });
  HistorialModificacionPedido.belongsTo(DetallePedido, { 
    foreignKey: "idDetallePedido",
    as: "DetallePedido"
  });
  HistorialModificacionPedido.belongsTo(Indumentaria, { 
    foreignKey: "codigoIndumentaria",
    as: "Indumentaria"
  });
  
  Pedido.hasMany(HistorialModificacionPedido, { foreignKey: "numeroPedido" });

  console.log("⚙️  Configurando relaciones entre modelos...");
  console.log("✅ Relaciones de modelos configuradas correctamente");
};

// Exportar todos los modelos y la función de configuración
module.exports = {
  // Modelos principales
  Cliente,
  Persona,
  Usuario,
  // Rol, // ❌ ELIMINADO - Ya no existe en BD
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
  UsuarioTipoRol, // ✅ Tabla intermedia N:M Usuario-TipoRol
  Rack,
  MotivoNoApta,
  StockRegistroFallo,
  
  // Nuevos modelos para flujo unificado Picker/Despacho
  EmpresaEnvio,
  AsignacionPicking,
  
  // Modelos de auditoría de pedidos
  MotivoModificacionPedido,
  HistorialModificacionPedido,
  
  // Modelos de auditoría de usuarios
  MotivoInactivacionUsuario,
  
  // Modelos de presentaciones de producto
  PresentacionProducto,
  ConfiguracionPresentacion,
  
  // Función para configurar relaciones
  setupAssociations,
  
  // Exportar la instancia de Sequelize para consultas directas
  sequelize,
};
