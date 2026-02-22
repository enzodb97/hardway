const express = require("express");
const router = express.Router();
const { verificarAccesoPedidos } = require("../middleware/auth");
const {
  Pedido,
  Cliente,
  Persona,
  EstadoPedido,
  DetallePedido,
  Indumentaria,
  DetalleIndumentaria,
  NombreIndumentaria,
  Stock,
  MovimientoStock,
  MotivoCancelacion,
  Color,
  Talle,
  PrecioIndumentaria,
  sequelize,
  MotivoModificacionPedido,
  HistorialModificacionPedido,
  Usuario,
  EmpresaEnvio,
  PresentacionProducto,
  NotificacionPedido,
  AsignacionPicking,
} = require("../models");
const { Sequelize, Op } = require("sequelize");

// =====================================================
// RUTAS PÚBLICAS (antes del middleware de autenticación)
// =====================================================

// Obtener motivos de modificación activos
router.get("/motivos-modificacion", async (req, res) => {
  try {
    const motivos = await MotivoModificacionPedido.findAll({
      where: { estaActivo: 1 },
      order: [['idMotivo', 'ASC']]
    });
    res.json(motivos);
  } catch (error) {
    console.error("Error al obtener motivos de modificación:", error);
    res.status(500).json({ 
      error: "Error al obtener motivos de modificación", 
      detalle: error.message 
    });
  }
});

// Obtener notificaciones para un usuario (vendedor)
router.get("/notificaciones/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const { soloNoLeidas } = req.query;
    
    // Verificar si el usuario es administrador
    const [usuario] = await sequelize.query(`
      SELECT u.idUsuario
      FROM usuario u
      JOIN usuario_tiporol utr ON u.idUsuario = utr.idUsuario
      WHERE u.idUsuario = ? AND utr.idTipoRol = 1
      LIMIT 1
    `, {
      replacements: [idUsuario]
    });
    
    const esAdministrador = usuario && usuario.length > 0;
    
    console.log(`🔍 [DEBUG] Endpoint /notificaciones/${idUsuario} - Es Admin:`, esAdministrador);
    
    // Si es administrador, mostrar TODAS las notificaciones
    // Si no, solo las del usuario específico
    const whereCondition = esAdministrador 
      ? `WHERE 1=1 ${soloNoLeidas === 'true' ? 'AND n.leida = 0' : ''}`
      : `WHERE n.idUsuarioDestino = ? ${soloNoLeidas === 'true' ? 'AND n.leida = 0' : ''}`;
    
    const [notificaciones] = await sequelize.query(`
      SELECT 
        n.idNotificacion,
        n.numeroPedido,
        n.idUsuarioDestino,
        n.tipoNotificacion,
        n.mensaje,
        n.fechaNotificacion,
        n.leida,
        n.fechaLectura,
        n.idAsignacionPicking,
        n.estadoResolucion,
        n.tipoResolucion,
        n.observacionesResolucion,
        ap.tieneProblemas,
        ap.observacionesProblema,
        m.descripcion as motivoDescripcion,
        u.nombreUsuario as pickerAsignado
      FROM notificacion_pedido n
      LEFT JOIN asignacion_picking ap ON n.idAsignacionPicking = ap.idAsignacion
      LEFT JOIN motivo_no_apta m ON ap.idMotivoProblema = m.idMotivo
      LEFT JOIN usuario u ON n.idUsuarioDestino = u.idUsuario
      ${whereCondition}
      ORDER BY n.fechaNotificacion DESC
    `, {
      replacements: esAdministrador ? [] : [idUsuario]
    });
    
    console.log(`🔍 [DEBUG] Notificaciones encontradas:`, notificaciones.length);
    console.log(`🔍 [DEBUG] Datos:`, JSON.stringify(notificaciones, null, 2));
    
    res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ 
      error: "Error al obtener notificaciones", 
      detalle: error.message 
    });
  }
});

// Obtener notificaciones de un pedido específico
router.get("/notificaciones-pedido/:numeroPedido", async (req, res) => {
  try {
    const { numeroPedido } = req.params;
    
    const [notificaciones] = await sequelize.query(`
      SELECT 
        n.idNotificacion,
        n.numeroPedido,
        n.tipoNotificacion,
        n.mensaje,
        n.fechaNotificacion,
        n.leida,
        n.fechaLectura,
        n.idAsignacionPicking,
        n.estadoResolucion,
        n.tipoResolucion,
        n.observacionesResolucion,
        ap.tieneProblemas,
        ap.observacionesProblema,
        ap.completarParcial,
        ap.idDetallePedidoProblema,
        ap.cantidadConProblema,
        m.descripcion as motivoDescripcion,
        u.nombreUsuario as pickerAsignado
      FROM notificacion_pedido n
      LEFT JOIN asignacion_picking ap ON n.idAsignacionPicking = ap.idAsignacion
      LEFT JOIN motivo_no_apta m ON ap.idMotivoProblema = m.idMotivo
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario u ON ep.idPersona = u.idPersona
      WHERE n.numeroPedido = ?
      ORDER BY n.fechaNotificacion DESC
    `, {
      replacements: [numeroPedido]
    });
    
    res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones del pedido:", error);
    res.status(500).json({ 
      error: "Error al obtener notificaciones del pedido", 
      detalle: error.message 
    });
  }
});

// Marcar notificación como leída
router.put("/notificaciones/:idNotificacion/marcar-leida", async (req, res) => {
  try {
    const { idNotificacion } = req.params;
    
    await sequelize.query(`
      UPDATE notificacion_pedido
      SET leida = 1, fechaLectura = NOW()
      WHERE idNotificacion = ?
    `, {
      replacements: [idNotificacion]
    });
    
    res.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({ 
      error: "Error al marcar notificación", 
      detalle: error.message 
    });
  }
});

// Resolver notificación de problema (vendedor)
router.put("/notificaciones/:idNotificacion/resolver", async (req, res) => {
  const { idNotificacion } = req.params;
  const { 
    tipoResolucion, 
    observacionesResolucion, 
    codigoIndumentariaAlternativo, 
    nuevaCantidad 
  } = req.body;
  
  const t = await sequelize.transaction();
  
  try {
    // Validar tipo de resolución
    const tiposValidos = [
      'cancelar_articulo', 
      'reducir_cantidad', 
      'producto_alternativo', 
      'reabastecer', 
      'continuar', 
      'cancelar_pedido'
    ];
    
    if (!tiposValidos.includes(tipoResolucion)) {
      await t.rollback();
      return res.status(400).json({ 
        error: "Tipo de resolución inválido",
        tiposValidos 
      });
    }
    
    // Obtener notificación con detalles
    const notificacion = await NotificacionPedido.findByPk(idNotificacion, { transaction: t });
    if (!notificacion) {
      await t.rollback();
      return res.status(404).json({ error: "Notificación no encontrada" });
    }
    
    // Obtener asignación de picking relacionada
    const asignacion = await AsignacionPicking.findByPk(
      notificacion.idAsignacionPicking, 
      { transaction: t }
    );
    
    if (!asignacion) {
      await t.rollback();
      return res.status(404).json({ error: "Asignación de picking no encontrada" });
    }
    
    const numeroPedido = notificacion.numeroPedido;
    const idUsuarioVendedor = req.usuarioAutenticado?.idUsuario || 1;
    
    // Obtener información del pedido y picker
    const [pedidoInfo] = await sequelize.query(`
      SELECT p.*, u.idUsuario as idPicker, u.nombreUsuario as pickerNombre
      FROM pedido p
      JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido
      JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      JOIN usuario u ON ep.idPersona = u.idPersona
      WHERE p.numeroPedido = ?
      LIMIT 1
    `, {
      replacements: [numeroPedido],
      transaction: t
    });
    
    if (!pedidoInfo || pedidoInfo.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    const idPickerDestino = pedidoInfo[0].idPicker;
    let mensajeParaPicker = "";
    
    // ==========================================
    // EJECUTAR LÓGICA SEGÚN TIPO DE RESOLUCIÓN
    // ==========================================
    
    switch (tipoResolucion) {
      
      // ------------------------------------------
      case 'cancelar_articulo':
        // Eliminar el artículo del pedido
        if (!asignacion.idDetallePedidoProblema) {
          await t.rollback();
          return res.status(400).json({ 
            error: "No se encontró el artículo problemático en la asignación" 
          });
        }
        
        // Obtener detalle del artículo antes de eliminarlo
        const detalleAEliminar = await DetallePedido.findByPk(
          asignacion.idDetallePedidoProblema,
          { transaction: t }
        );
        
        if (!detalleAEliminar) {
          await t.rollback();
          return res.status(400).json({ error: "Artículo no encontrado en el pedido" });
        }
        
        // Devolver stock (el picker nunca lo sacó del rack)
        const stocksEliminar = await Stock.findAll({
          where: { 
            codigoIndumentaria: detalleAEliminar.codigoIndumentaria,
            idRack: { [Op.ne]: 99 } // Excluir rack No Aptos
          },
          order: [['idRack', 'ASC']],
          transaction: t,
        });
        
        if (stocksEliminar && stocksEliminar.length > 0) {
          const stockEliminar = stocksEliminar[0];
          await MovimientoStock.create({
            idMovimientoStock: "MOV-RES-" + Math.random().toString().slice(2, 8),
            idStock: stockEliminar.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalleAEliminar.cantidad,
            observaciones: `Devolución por cancelación de artículo en resolución de problema - Pedido ${numeroPedido}`,
          }, { transaction: t });
        }
        
        // Eliminar el detalle
        await DetallePedido.destroy({
          where: { idDetallePedido: asignacion.idDetallePedidoProblema },
          transaction: t
        });
        
        // Registrar en historial
        await HistorialModificacionPedido.create({
          numeroPedido,
          fechaModificacion: new Date(),
          idUsuarioModifico: idUsuarioVendedor,
          tipoModificacion: 'Se elimino un producto',
          codigoIndumentaria: detalleAEliminar.codigoIndumentaria,
          idDetallePedido: asignacion.idDetallePedidoProblema,
          cantidadAnterior: detalleAEliminar.cantidad,
          descripcion: `Artículo eliminado por problema reportado en picking: ${observacionesResolucion || 'Sin observaciones'}`,
          observaciones: observacionesResolucion
        }, { transaction: t });
        
        mensajeParaPicker = `✅ Resolución: El artículo con problema ha sido CANCELADO del pedido ${numeroPedido}. No es necesario prepararlo. ${observacionesResolucion ? `Nota: ${observacionesResolucion}` : ''}`;
        break;
        
      // ------------------------------------------
      case 'reducir_cantidad':
        if (!nuevaCantidad || nuevaCantidad <= 0) {
          await t.rollback();
          return res.status(400).json({ 
            error: "Debe especificar una nueva cantidad válida mayor a 0" 
          });
        }
        
        if (!asignacion.idDetallePedidoProblema) {
          await t.rollback();
          return res.status(400).json({ 
            error: "No se encontró el artículo problemático" 
          });
        }
        
        const detalleReducir = await DetallePedido.findByPk(
          asignacion.idDetallePedidoProblema,
          { transaction: t }
        );
        
        if (!detalleReducir) {
          await t.rollback();
          return res.status(400).json({ error: "Artículo no encontrado" });
        }
        
        if (nuevaCantidad >= detalleReducir.cantidad) {
          await t.rollback();
          return res.status(400).json({ 
            error: "La nueva cantidad debe ser menor a la cantidad actual" 
          });
        }
        
        const cantidadAnterior = detalleReducir.cantidad;
        const diferencia = cantidadAnterior - nuevaCantidad;
        
        // Devolver stock de la diferencia
        const stocksReducir = await Stock.findAll({
          where: { 
            codigoIndumentaria: detalleReducir.codigoIndumentaria,
            idRack: { [Op.ne]: 99 }
          },
          order: [['idRack', 'ASC']],
          transaction: t,
        });
        
        if (stocksReducir && stocksReducir.length > 0) {
          await MovimientoStock.create({
            idMovimientoStock: "MOV-RED-" + Math.random().toString().slice(2, 8),
            idStock: stocksReducir[0].idStock,
            fechaMovimiento: new Date(),
            cantidad: diferencia,
            observaciones: `Devolución por reducción de cantidad en resolución - Pedido ${numeroPedido}`,
          }, { transaction: t });
        }
        
        // Actualizar cantidad y recalcular descuento proporcional
        const descuentoProporcional = detalleReducir.descuentoItem 
          ? (detalleReducir.descuentoItem / cantidadAnterior) * nuevaCantidad 
          : 0;
        
        await DetallePedido.update(
          { 
            cantidad: nuevaCantidad,
            descuentoItem: descuentoProporcional
          },
          { 
            where: { idDetallePedido: asignacion.idDetallePedidoProblema },
            transaction: t 
          }
        );
        
        // Registrar en historial
        await HistorialModificacionPedido.create({
          numeroPedido,
          fechaModificacion: new Date(),
          idUsuarioModifico: idUsuarioVendedor,
          tipoModificacion: 'Se modifico la cantidad de un producto',
          codigoIndumentaria: detalleReducir.codigoIndumentaria,
          idDetallePedido: asignacion.idDetallePedidoProblema,
          cantidadAnterior,
          cantidadNueva: nuevaCantidad,
          descripcion: `Cantidad reducida por problema en picking: ${cantidadAnterior} → ${nuevaCantidad}`,
          observaciones: observacionesResolucion
        }, { transaction: t });
        
        mensajeParaPicker = `📦 Resolución: La cantidad del artículo con problema en pedido ${numeroPedido} se redujo de ${cantidadAnterior} a ${nuevaCantidad} unidades. Prepara solo ${nuevaCantidad}. ${observacionesResolucion ? `Nota: ${observacionesResolucion}` : ''}`;
        break;
        
      // ------------------------------------------
      case 'producto_alternativo':
        if (!codigoIndumentariaAlternativo) {
          await t.rollback();
          return res.status(400).json({ 
            error: "Debe especificar el código del producto alternativo" 
          });
        }
        
        if (!asignacion.idDetallePedidoProblema) {
          await t.rollback();
          return res.status(400).json({ error: "No se encontró el artículo problemático" });
        }
        
        const detalleOriginal = await DetallePedido.findByPk(
          asignacion.idDetallePedidoProblema,
          { transaction: t }
        );
        
        if (!detalleOriginal) {
          await t.rollback();
          return res.status(400).json({ error: "Artículo original no encontrado" });
        }
        
        // Verificar que el producto alternativo existe y tiene stock
        const stockAlternativo = await Stock.findAll({
          where: { 
            codigoIndumentaria: codigoIndumentariaAlternativo,
            idRack: { [Op.ne]: 99 }
          },
          order: [['idRack', 'ASC']],
          transaction: t,
        });
        
        if (!stockAlternativo || stockAlternativo.length === 0) {
          await t.rollback();
          return res.status(400).json({ 
            error: "El producto alternativo no tiene stock disponible" 
          });
        }
        
        // Devolver stock del producto original
        const stocksOriginal = await Stock.findAll({
          where: { 
            codigoIndumentaria: detalleOriginal.codigoIndumentaria,
            idRack: { [Op.ne]: 99 }
          },
          order: [['idRack', 'ASC']],
          transaction: t,
        });
        
        if (stocksOriginal && stocksOriginal.length > 0) {
          await MovimientoStock.create({
            idMovimientoStock: "MOV-RALT-" + Math.random().toString().slice(2, 8),
            idStock: stocksOriginal[0].idStock,
            fechaMovimiento: new Date(),
            cantidad: detalleOriginal.cantidad,
            observaciones: `Devolución por reemplazo con producto alternativo - Pedido ${numeroPedido}`,
          }, { transaction: t });
        }
        
        // Descontar stock del producto alternativo
        await MovimientoStock.create({
          idMovimientoStock: "MOV-DALT-" + Math.random().toString().slice(2, 8),
          idStock: stockAlternativo[0].idStock,
          fechaMovimiento: new Date(),
          cantidad: -detalleOriginal.cantidad,
          observaciones: `Descuento por producto alternativo - Pedido ${numeroPedido}`,
        }, { transaction: t });
        
        // Eliminar detalle original
        await DetallePedido.destroy({
          where: { idDetallePedido: asignacion.idDetallePedidoProblema },
          transaction: t
        });
        
        // Crear nuevo detalle con producto alternativo
        const nuevoDetalle = await DetallePedido.create({
          idDetallePedido: "DPED-" + Math.random().toString().slice(2, 8),
          numeroPedido,
          codigoIndumentaria: codigoIndumentariaAlternativo,
          cantidad: detalleOriginal.cantidad,
          idPresentacion: detalleOriginal.idPresentacion || 1,
          descuentoItem: detalleOriginal.descuentoItem || 0,
          cantidadPresentaciones: detalleOriginal.cantidadPresentaciones || 1,
          unidadesTotales: detalleOriginal.unidadesTotales || detalleOriginal.cantidad
        }, { transaction: t });
        
        // Registrar en historial
        await HistorialModificacionPedido.create({
          numeroPedido,
          fechaModificacion: new Date(),
          idUsuarioModifico: idUsuarioVendedor,
          tipoModificacion: 'Se reemplazo un producto',
          codigoIndumentaria: detalleOriginal.codigoIndumentaria,
          idDetallePedido: nuevoDetalle.idDetallePedido,
          descripcion: `Producto ${detalleOriginal.codigoIndumentaria} reemplazado por ${codigoIndumentariaAlternativo} debido a problema en picking`,
          observaciones: observacionesResolucion
        }, { transaction: t });
        
        mensajeParaPicker = `🔄 Resolución: Producto alternativo asignado en pedido ${numeroPedido}. Prepara ${codigoIndumentariaAlternativo} (${detalleOriginal.cantidad} unidades) en lugar del producto original. ${observacionesResolucion ? `Nota: ${observacionesResolucion}` : ''}`;
        break;
        
      // ------------------------------------------
      case 'reabastecer':
        // Limpiar flag de problemas y poner en estado "en resolución"
        await AsignacionPicking.update(
          { 
            tieneProblemas: 0
          },
          { 
            where: { idAsignacion: asignacion.idAsignacion },
            transaction: t 
          }
        );
        
        mensajeParaPicker = `🔄 Resolución: El problema del pedido ${numeroPedido} está siendo REABASTECIDO. La tarea quedará disponible nuevamente cuando esté resuelto. ${observacionesResolucion ? `Nota: ${observacionesResolucion}` : ''}`;
        break;
        
      // ------------------------------------------
      case 'continuar':
        // Autorizar al picker a continuar con el producto a pesar del problema
        await AsignacionPicking.update(
          { 
            tieneProblemas: 0
          },
          { 
            where: { idAsignacion: asignacion.idAsignacion },
            transaction: t 
          }
        );
        
        mensajeParaPicker = `✅ Resolución: El vendedor autorizó CONTINUAR con el pedido ${numeroPedido} a pesar del problema reportado. Procede con la preparación normal. ${observacionesResolucion ? `Instrucciones: ${observacionesResolucion}` : ''}`;
        break;
        
      // ------------------------------------------
      case 'cancelar_pedido':
        // Usar lógica existente de cancelación de pedido
        // Esta lógica ya está implementada en el endpoint DELETE o PUT de cancelación
        // Por simplicidad, aquí marcaremos el estado como Cancelado
        
        await sequelize.query(`
          UPDATE pedido 
          SET idEstado = 6, 
              fechaCancelacion = NOW(),
              idUsuarioCancelo = ?
          WHERE numeroPedido = ?
        `, {
          replacements: [idUsuarioVendedor, numeroPedido],
          transaction: t
        });
        
        // Devolver todo el stock del pedido
        const detallesCancelar = await DetallePedido.findAll({
          where: { numeroPedido },
          transaction: t
        });
        
        for (const detalle of detallesCancelar) {
          const stocksCancelar = await Stock.findAll({
            where: { 
              codigoIndumentaria: detalle.codigoIndumentaria,
              idRack: { [Op.ne]: 99 }
            },
            order: [['idRack', 'ASC']],
            transaction: t,
          });
          
          if (stocksCancelar && stocksCancelar.length > 0) {
            await MovimientoStock.create({
              idMovimientoStock: "MOV-CANC-" + Math.random().toString().slice(2, 8),
              idStock: stocksCancelar[0].idStock,
              fechaMovimiento: new Date(),
              cantidad: detalle.cantidad,
              observaciones: `Devolución por cancelación total del pedido ${numeroPedido}`,
            }, { transaction: t });
          }
        }
        
        // Registrar cancelación en historial
        await HistorialModificacionPedido.create({
          numeroPedido,
          fechaModificacion: new Date(),
          idUsuarioModifico: idUsuarioVendedor,
          tipoModificacion: 'Cancelacion',
          descripcion: `Pedido cancelado por problema en picking: ${observacionesResolucion || 'Sin observaciones'}`,
          observaciones: observacionesResolucion
        }, { transaction: t });
        
        mensajeParaPicker = `❌ Resolución: El pedido ${numeroPedido} ha sido CANCELADO completamente debido al problema reportado. No continuar con la preparación. ${observacionesResolucion ? `Motivo: ${observacionesResolucion}` : ''}`;
        break;
    }
    
    // ==========================================
    // ACTUALIZAR NOTIFICACIÓN ORIGINAL
    // ==========================================
    
    await NotificacionPedido.update(
      {
        estadoResolucion: 'resuelto',
        tipoResolucion,
        idUsuarioResolvio: idUsuarioVendedor,
        fechaResolucion: new Date(),
        observacionesResolucion,
        codigoIndumentariaAlternativo: codigoIndumentariaAlternativo || null,
        nuevaCantidad: nuevaCantidad || null
      },
      { 
        where: { idNotificacion },
        transaction: t 
      }
    );
    
    // ==========================================
    // CREAR NOTIFICACIÓN PARA EL PICKER
    // ==========================================
    
    await NotificacionPedido.create({
      numeroPedido,
      idUsuarioDestino: idPickerDestino,
      tipoNotificacion: 'resolucion_vendedor',
      mensaje: mensajeParaPicker,
      fechaNotificacion: new Date(),
      leida: 0,
      idAsignacionPicking: asignacion.idAsignacion,
      estadoResolucion: 'resuelto'
    }, { transaction: t });
    
    await t.commit();
    
    res.json({ 
      success: true,
      message: "Resolución aplicada exitosamente",
      tipoResolucion,
      mensajeParaPicker
    });
    
  } catch (error) {
    await t.rollback();
    console.error("Error al resolver notificación:", error);
    res.status(500).json({ 
      error: "Error al resolver notificación", 
      detalle: error.message 
    });
  }
});

// =====================================================
// APLICAR MIDDLEWARE A LAS DEMÁS RUTAS
// =====================================================

// Aplicar middleware a todas las rutas de pedidos (excepto las de arriba)
router.use(verificarAccesoPedidos);

// Obtener todos los pedidos con prendas
router.get("/", async (req, res) => {
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
          include: [
            {
              model: Indumentaria,
              as: "Indumentarium",
            },
          ],
        },
      ],
    });
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener pedidos", detalle: error.message });
  }
});

// Crear pedido con prendas
router.post("/", async (req, res) => {
  const { idCliente, idEstado, prendas, idEmpresaEnvio } = req.body;
  
  // Debug: verificar qué se está recibiendo
  console.log("📦 Datos recibidos en POST /api/pedidos:");
  console.log("   - idCliente:", idCliente);
  console.log("   - idEstado:", idEstado);
  console.log("   - idEmpresaEnvio:", idEmpresaEnvio, "Tipo:", typeof idEmpresaEnvio);
  console.log("   - prendas:", prendas?.length, "items");
  
  const t = await sequelize.transaction();
  try {
    // Generar número de pedido: PED-YYYYMMDD-XXX (XXX = correlativo del día)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const fechaStr = `${yyyy}${mm}${dd}`;

    // Buscar el último número correlativo del día
    const [result] = await sequelize.query(
      `SELECT numeroPedido FROM pedido WHERE numeroPedido LIKE :prefijo ORDER BY numeroPedido DESC LIMIT 1`,
      { replacements: { prefijo: `PED-${fechaStr}-%` } }
    );
    let correlativo = 1;
    if (result.length > 0) {
      // Extraer el número correlativo del último pedido del día
      const ultimo = result[0].numeroPedido;
      const partes = ultimo.split("-");
      correlativo = parseInt(partes[2], 10) + 1;
    }
    const numeroPedido = `PED-${fechaStr}-${String(correlativo).padStart(
      3,
      "0"
    )}`;

    // Calcular el total del pedido (precio * cantidad de cada prenda con descuentos de presentación)
    let totalPedido = 0;
    let subtotalOriginalTotal = 0; // Para calcular descuento VIP sobre subtotal sin descuentos
    if (prendas && Array.isArray(prendas)) {
      for (const prenda of prendas) {
        // Obtener precio de la prenda
        const [precioRow] = await sequelize.query(
          `SELECT pr.precio FROM indumentaria i
            JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
            JOIN precioindumentaria pr ON di.idPrecio = pr.idPrecio
            WHERE i.codigoIndumentaria = ? LIMIT 1`,
          { replacements: [prenda.codigoIndumentaria] }
        );
        const precio = precioRow[0]?.precio || 0;
        const subtotalOriginal = precio * prenda.cantidad;
        subtotalOriginalTotal += subtotalOriginal; // Acumular subtotal sin descuentos
        
        // Aplicar descuentos por presentación
        // idPresentacion: 1=Unidad, 2=Caja Cerrada, 3=Pack
        let precioConDescuento = precio;
        const idPres = prenda.idPresentacion || 1;
        
        if (idPres === 3) {
          // Pack: 5% de descuento
          precioConDescuento = precio * 0.95;
        } else if (idPres === 2) {
          // Caja Cerrada: 10% de descuento
          precioConDescuento = precio * 0.90;
        }
        
        totalPedido += precioConDescuento * prenda.cantidad;
      }
    }

    // Verificar si el cliente es VIP
    let esVip = false;
    try {
      const [vipRows] = await sequelize.query(
        "SELECT idCliente FROM vista_clientes_vip WHERE idCliente = ?",
        { replacements: [idCliente] }
      );
      esVip = vipRows.length > 0;
    } catch (e) {
      esVip = false;
    }

    // Calcular descuento global si es VIP (sobre subtotal original, antes de descuentos de presentación)
    const descuentoOrden = esVip ? subtotalOriginalTotal * 0.1 : 0;

    // Crea el pedido (fechaPedido se asigna automáticamente por la BD)
    const pedido = await Pedido.create(
      {
        numeroPedido,
        idCliente,
        idEstado,
        idUsuarioCreo: req.usuarioAutenticado.idUsuario, // Registrar quien creó el pedido
        descuentoOrden,
        idEmpresaEnvio: idEmpresaEnvio || null, // Agregar empresa de envío
      },
      { transaction: t }
    );

    // Crea los detalles del pedido y descuenta stock
    if (prendas && Array.isArray(prendas)) {
      for (const prenda of prendas) {
        // Obtener precio unitario
        const [precioRow] = await sequelize.query(
          `SELECT pr.precio FROM indumentaria i
            JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
            JOIN precioindumentaria pr ON di.idPrecio = pr.idPrecio
            WHERE i.codigoIndumentaria = ? LIMIT 1`,
          { replacements: [prenda.codigoIndumentaria] }
        );
        const precioUnitario = precioRow[0]?.precio || 0;
        const subtotalOriginal = precioUnitario * prenda.cantidad;
        
        // Calcular descuento por presentación
        // idPresentacion: 1=Unidad, 2=Caja Cerrada, 3=Pack
        let descuentoItem = 0;
        const idPres = prenda.idPresentacion || 1;
        
        if (idPres === 3) {
          // Pack: 5% de descuento
          descuentoItem = subtotalOriginal * 0.05;
        } else if (idPres === 2) {
          // Caja Cerrada: 10% de descuento
          descuentoItem = subtotalOriginal * 0.10;
        }
        
        await DetallePedido.create(
          {
            idDetallePedido: "DPED-" + Math.random().toString().slice(2, 8),
            numeroPedido,
            codigoIndumentaria: prenda.codigoIndumentaria,
            cantidad: prenda.cantidad,
            descuentoItem: descuentoItem,
            idPresentacion: prenda.idPresentacion || 1,
            cantidadPresentaciones: prenda.cantidadPresentaciones || prenda.cantidad,
            unidadesTotales: prenda.unidadesTotales || prenda.cantidad,
          },
          { transaction: t }
        );
        // Descontar stock (excluir rack 99 - No Aptos)
        const stocks = await Stock.findAll({
          where: { 
            codigoIndumentaria: prenda.codigoIndumentaria,
            idRack: { [Op.ne]: 99 } // Excluir rack de No Aptos
          },
          order: [['idRack', 'ASC']], // Ordenar por rack para consistencia
          transaction: t,
        });
        
        if (stocks && stocks.length > 0) {
          // Descontar del primer stock disponible (excluyendo No Aptos)
          const stock = stocks[0];
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
        } else {
          console.warn(`⚠️ No se encontró stock disponible para ${prenda.codigoIndumentaria}`);
        }
      }
    }

    await t.commit();
    res.json({ numeroPedido });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear pedido:", error);
    res
      .status(500)
      .json({ error: "Error al crear pedido", detalle: error.message });
  }
});

// Obtener pedido por número
router.get("/:numeroPedido", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const pedido = await Pedido.findOne({
      where: { numeroPedido },
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
                    { model: NombreIndumentaria, as: "NombreIndumentarium" },
                    { model: Color, as: "Color" },
                    { model: Talle, as: "Talle" },
                    { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
                  ],
                },
              ],
            },
            {
              model: PresentacionProducto,
              as: "Presentacion",
              attributes: ['idPresentacion', 'nombrePresentacion', 'descripcion'],
            },
          ],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res
      .status(500)
      .json({ error: "Error al obtener pedido", detalle: error.message });
  }
});

// Obtener detalle plano del pedido (con trazabilidad de usuarios)
router.get("/:numeroPedido/detalle-plano", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    // Obtener información del pedido y motivo de cancelación
    const [pedidoInfo] = await sequelize.query(
      `
      SELECT 
        p.numeroPedido,
        p.fechaPedido,
        p.fechaModificacion,
        p.idEstado,
        ep.tipoEstado,
        mc.descripcion AS motivoCancelacion,
        p.observacionCancelacion,
        p.fechaCancelacion,
        uc.nombreUsuario AS usuarioCancelo,
        ucr.nombreUsuario AS usuarioCreo,
        um.nombreUsuario AS usuarioModifico,
        p.idCliente,
        p.descuentoOrden,
        p.codigoSeguimiento AS numeroSeguimiento,
        ee.nombre AS empresaEnvio,
        per.nombre AS clienteNombre,
        per.apellido AS clienteApellido,
        per.dni AS clienteDocumento,
        cl.email AS clienteEmail,
        cl.telefono AS clienteTelefono,
        d.calle AS clienteCalle,
        d.altura AS clienteNumero,
        d.piso AS clientePiso,
        d.departamento AS clienteDepartamento,
        b.nombreBarrio AS clienteBarrio,
        c.nombreCiudad AS clienteCiudad,
        c.codigoPostal AS clienteCodigoPostal
      FROM pedido p
      JOIN estadopedido ep ON p.idEstado = ep.idEstado
      LEFT JOIN motivo_cancelacion mc ON p.idMotivoCancelacion = mc.idMotivo
      LEFT JOIN usuario uc ON p.idUsuarioCancelo = uc.idUsuario
      LEFT JOIN usuario ucr ON p.idUsuarioCreo = ucr.idUsuario
      LEFT JOIN usuario um ON p.idUsuarioModifico = um.idUsuario
      LEFT JOIN empresa_envio ee ON p.idEmpresaEnvio = ee.idEmpresaEnvio
      LEFT JOIN cliente cl ON p.idCliente = cl.idCliente
      LEFT JOIN persona per ON cl.idPersona = per.idPersona
      LEFT JOIN domicilio d ON per.idDomicilio = d.idDomicilio
      LEFT JOIN barrio b ON d.idBarrio = b.idBarrio
      LEFT JOIN ciudad c ON b.idCiudad = c.idCiudad
      WHERE p.numeroPedido = ?
      `,
      { replacements: [numeroPedido] }
    );

    const [detalleItems] = await sequelize.query(
      `
      SELECT
        ni.nombre AS nombre_producto,
        ta.talle,
        co.color,
        pr.precio AS precio_unitario,
        dp.cantidad,
        dp.descuentoItem AS descuento_por_item,
        (pr.precio * dp.cantidad - IFNULL(dp.descuentoItem,0)) AS subtotal,
        dp.idPresentacion,
        dp.cantidadPresentaciones,
        dp.unidadesTotales,
        pp.nombrePresentacion
      FROM
        detallepedido dp
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
        precioindumentaria pr ON di.idPrecio = pr.idPrecio
      JOIN
        talle ta ON di.idTalle = ta.idTalle
      JOIN
        color co ON di.idColor = co.idColor
      LEFT JOIN
        presentacion_producto pp ON dp.idPresentacion = pp.idPresentacion
      WHERE
        dp.numeroPedido = ?
      `,
      { replacements: [numeroPedido] }
    );

    // Calcular subtotal general
    let subtotalGeneral = 0;
    for (const item of detalleItems) {
      subtotalGeneral +=
        Number(item.precio_unitario) * Number(item.cantidad) -
        (Number(item.descuento_por_item) || 0);
    }

    // Descuento global del pedido
    const descuentoOrden = pedidoInfo[0]?.descuentoOrden || 0;
    const granTotal = subtotalGeneral - descuentoOrden;

    // Devolver los campos calculados
    const pedidoExtendido = pedidoInfo[0]
      ? {
          ...pedidoInfo[0],
          subtotal: subtotalGeneral,
          descuentoOrden,
          total: granTotal,
        }
      : null;

    const response = {
      pedido: pedidoExtendido,
      items: detalleItems,
    };

    res.json(response);
  } catch (error) {
    console.error("Error al obtener detalle plano del pedido:", error);
    res
      .status(500)
      .json({ error: "Error al obtener detalle plano del pedido" });
  }
});

// Editar pedido
// Editar pedido (devuelve stock antiguo, descuenta nuevo stock)
router.put("/:numeroPedido", async (req, res) => {
  const { idCliente, idEstado, prendas, idEmpresaEnvio, idMotivo, observaciones } = req.body;
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

    // Validar que se haya proporcionado un motivo de modificación
    if (!idMotivo) {
      await t.rollback();
      return res.status(400).json({ 
        error: "Debe proporcionar un motivo de modificación" 
      });
    }

    // Guardar valores anteriores para el historial
    const empresaEnvioAnterior = pedido.idEmpresaEnvio;

    // 2. Recupera detalles anteriores
    const detallesAnteriores = await DetallePedido.findAll({
      where: { numeroPedido },
      transaction: t,
    });

    // 2.1. REGISTRAR HISTORIAL ANTES DE ELIMINAR (para que los IDs existan)
    const idUsuario = req.usuarioAutenticado.idUsuario;
    
    // Detectar cambio de empresa de envío
    if (empresaEnvioAnterior !== idEmpresaEnvio) {
      // Buscar nombres de las empresas
      let nombreEmpresaAnterior = 'Sin empresa';
      let nombreEmpresaNueva = 'Sin empresa';
      
      if (empresaEnvioAnterior) {
        const empresaAnt = await EmpresaEnvio.findByPk(empresaEnvioAnterior, { transaction: t });
        nombreEmpresaAnterior = empresaAnt ? empresaAnt.nombre : `ID: ${empresaEnvioAnterior}`;
      }
      
      if (idEmpresaEnvio) {
        const empresaNueva = await EmpresaEnvio.findByPk(idEmpresaEnvio, { transaction: t });
        nombreEmpresaNueva = empresaNueva ? empresaNueva.nombre : `ID: ${idEmpresaEnvio}`;
      }
      
      await HistorialModificacionPedido.create({
        numeroPedido,
        fechaModificacion: new Date(),
        idUsuarioModifico: idUsuario,
        idMotivo,
        observaciones,
        tipoModificacion: 'Envio',
        valorAnterior: nombreEmpresaAnterior,
        valorNuevo: nombreEmpresaNueva,
        descripcion: `Cambio de empresa de envío de "${nombreEmpresaAnterior}" a "${nombreEmpresaNueva}"`
      }, { transaction: t });
    }

    // Crear un mapa de los detalles anteriores para comparación
    const mapaAnteriores = new Map();
    detallesAnteriores.forEach(det => {
      mapaAnteriores.set(det.codigoIndumentaria, {
        cantidad: det.cantidad,
        idDetallePedido: det.idDetallePedido
      });
    });

    // Detectar cambios en los ítems
    if (prendas && Array.isArray(prendas)) {
      for (const prenda of prendas) {
        const anterior = mapaAnteriores.get(prenda.codigoIndumentaria);
        
        if (!anterior) {
          // Ítem agregado
          await HistorialModificacionPedido.create({
            numeroPedido,
            fechaModificacion: new Date(),
            idUsuarioModifico: idUsuario,
            idMotivo,
            observaciones,
            tipoModificacion: 'Se agrego un producto',
            codigoIndumentaria: prenda.codigoIndumentaria,
            cantidadNueva: prenda.cantidad,
            descripcion: `Se agregó ${prenda.cantidad} unidad(es) del producto ${prenda.codigoIndumentaria}`
          }, { transaction: t });
        } else if (anterior.cantidad !== prenda.cantidad) {
          // Cambio de cantidad
          await HistorialModificacionPedido.create({
            numeroPedido,
            fechaModificacion: new Date(),
            idUsuarioModifico: idUsuario,
            idMotivo,
            observaciones,
            tipoModificacion: 'Se modifico la cantidad de un producto',
            codigoIndumentaria: prenda.codigoIndumentaria,
            idDetallePedido: anterior.idDetallePedido,
            cantidadAnterior: anterior.cantidad,
            cantidadNueva: prenda.cantidad,
            descripcion: `Cantidad modificada de ${anterior.cantidad} a ${prenda.cantidad} del producto ${prenda.codigoIndumentaria}`
          }, { transaction: t });
        }
        
        // Marcar como procesado
        mapaAnteriores.delete(prenda.codigoIndumentaria);
      }
    }

    // Ítems eliminados (los que quedaron en el mapa)
    for (const [codigoIndumentaria, datos] of mapaAnteriores) {
      await HistorialModificacionPedido.create({
        numeroPedido,
        fechaModificacion: new Date(),
        idUsuarioModifico: idUsuario,
        idMotivo,
        observaciones,
        tipoModificacion: 'Se elimino un producto',
        codigoIndumentaria: codigoIndumentaria,
        idDetallePedido: datos.idDetallePedido,
        cantidadAnterior: datos.cantidad,
        descripcion: `Se eliminó ${datos.cantidad} unidad(es) del producto ${codigoIndumentaria}`
      }, { transaction: t });
    }

    // 3. Devuelve stock de los detalles anteriores
    for (const detalle of detallesAnteriores) {
      const stocks = await Stock.findAll({
        where: { 
          codigoIndumentaria: detalle.codigoIndumentaria,
          idRack: { [Op.ne]: 99 } // Excluir rack de No Aptos
        },
        order: [['idRack', 'ASC']], // Ordenar por rack para consistencia
        transaction: t,
      });
      if (stocks && stocks.length > 0) {
        const stock = stocks[0];
        await MovimientoStock.create(
          {
            idMovimientoStock:
              "MOV-DEV-" + Math.random().toString().slice(2, 8),
            idStock: stock.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalle.cantidad,
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
            idPresentacion: prenda.idPresentacion || 1,
            cantidadPresentaciones: prenda.cantidadPresentaciones || prenda.cantidad,
            unidadesTotales: prenda.unidadesTotales || prenda.cantidad,
          },
          { transaction: t }
        );
        // Descontar stock (excluir rack 99 - No Aptos)
        const stocks = await Stock.findAll({
          where: { 
            codigoIndumentaria: prenda.codigoIndumentaria,
            idRack: { [Op.ne]: 99 } // Excluir rack de No Aptos
          },
          order: [['idRack', 'ASC']], // Ordenar por rack para consistencia
          transaction: t,
        });
        if (stocks && stocks.length > 0) {
          const stock = stocks[0];
          await MovimientoStock.create(
            {
              idMovimientoStock:
                "MOV-PED-" + Math.random().toString().slice(2, 8),
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

    // 5. Actualizar el pedido con el usuario que modifica y forzar fechaModificacion
    await sequelize.query(
      `UPDATE pedido SET 
         idCliente = ?, 
         idEstado = ?, 
         idEmpresaEnvio = ?,
         idUsuarioModifico = ?, 
         fechaModificacion = NOW() 
       WHERE numeroPedido = ?`,
      {
        replacements: [
          idCliente,
          idEstado,
          idEmpresaEnvio || null,
          req.usuarioAutenticado.idUsuario,
          numeroPedido,
        ],
        transaction: t,
      }
    );

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error("Error al editar pedido:", error);
    res
      .status(500)
      .json({ error: "Error al editar pedido", detalle: error.message });
  }
});

// Eliminar pedido
router.delete("/:numeroPedido", async (req, res) => {
  const { numeroPedido } = req.params;
  const t = await sequelize.transaction();
  try {
    // 1. Obtén los detalles del pedido
    const detalles = await DetallePedido.findAll({
      where: { numeroPedido },
      transaction: t,
    });

    // 2. Devuelve el stock de cada prenda (excluir rack 99 - No Aptos)
    for (const detalle of detalles) {
      const stocks = await Stock.findAll({
        where: { 
          codigoIndumentaria: detalle.codigoIndumentaria,
          idRack: { [Op.ne]: 99 } // Excluir rack de No Aptos
        },
        order: [['idRack', 'ASC']], // Ordenar por rack para consistencia
        transaction: t,
      });
      if (stocks && stocks.length > 0) {
        const stock = stocks[0];
        await MovimientoStock.create(
          {
            idMovimientoStock:
              "MOV-DEL-" + Math.random().toString().slice(2, 8),
            idStock: stock.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalle.cantidad,
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

// Cancelar pedido con trazabilidad
router.put("/:numeroPedido/cancelar", async (req, res) => {
  const { numeroPedido } = req.params;
  const { idMotivo, idUsuarioCancelo, observacionCancelacion } = req.body;

  // Validar parámetros requeridos
  if (!idMotivo || !idUsuarioCancelo) {
    return res.status(400).json({
      error: "Se requieren idMotivo e idUsuarioCancelo",
    });
  }

  // Validar observación si el motivo es "Otro" (asumiendo que id 6 es "Otro")
  if (
    idMotivo === 6 &&
    (!observacionCancelacion || observacionCancelacion.trim() === "")
  ) {
    return res.status(400).json({
      error: "Se requiere observación cuando el motivo es 'Otro'",
    });
  }

  const t = await sequelize.transaction();

  try {
    // Validar el Pedido
    const pedido = await Pedido.findOne({
      where: {
        numeroPedido,
        estaActivo: 1,
        idEstado: {
          [Sequelize.Op.notIn]: [5, 6], // No permitir cancelar pedidos Finalizados (5) o ya Cancelados (6)
        },
      },
      transaction: t,
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({
        error:
          "Pedido no encontrado o no se puede cancelar (ya finalizado o cancelado)",
      });
    }

    // Devolver Productos al Stock
    const detalles = await DetallePedido.findAll({
      where: { numeroPedido },
      transaction: t,
    });

    // Para cada producto, crear movimiento de stock (devolución) - Excluir rack 99 (No Aptos)
    for (const detalle of detalles) {
      const stocks = await Stock.findAll({
        where: { 
          codigoIndumentaria: detalle.codigoIndumentaria,
          idRack: { [Op.ne]: 99 } // Excluir rack de No Aptos
        },
        order: [['idRack', 'ASC']], // Ordenar por rack para consistencia
        transaction: t,
      });

      if (stocks && stocks.length > 0) {
        const stock = stocks[0];
        const idMovimiento = `MOV-CANC-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)}`;

        await MovimientoStock.create(
          {
            idMovimientoStock: idMovimiento,
            idStock: stock.idStock,
            fechaMovimiento: new Date(),
            cantidad: detalle.cantidad, // Cantidad positiva = devuelve al stock
            observaciones: `Devolución por cancelación de pedido ${numeroPedido}`,
          },
          { transaction: t }
        );
      } else {
        console.warn(`⚠️ No se encontró stock disponible para devolver ${detalle.codigoIndumentaria}`);
      }
    }

    // Actualizar el Pedido (con el Usuario que cancela)
    const updateData = {
      estaActivo: 0, // Borrado lógico
      idEstado: 6, // Estado 'Cancelado'
      idMotivoCancelacion: idMotivo, // Motivo de cancelación
      idUsuarioCancelo: idUsuarioCancelo, // Usuario que canceló
      fechaCancelacion: new Date(), // Fecha y hora exactas de la cancelación
    };

    // Solo agregar observación si se proporcionó
    if (observacionCancelacion && observacionCancelacion.trim() !== "") {
      updateData.observacionCancelacion = observacionCancelacion.trim();
    }

    await Pedido.update(updateData, {
      where: { numeroPedido },
      transaction: t,
    });

    await t.commit();

    res.json({
      success: true,
      mensaje: "Pedido cancelado exitosamente",
      numeroPedido,
      motivoCancelacion: idMotivo,
      usuarioCancelo: idUsuarioCancelo,
      observacionCancelacion: observacionCancelacion || null,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al cancelar pedido:", error);
    res.status(500).json({
      error: "Error interno al cancelar el pedido",
      detalle: error.message,
    });
  }
});

// Cambiar estado a Abonado
router.put("/:numeroPedido/abonado", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    await sequelize.query(
      `UPDATE pedido SET idEstado = 3 WHERE numeroPedido = :numeroPedido`,
      { replacements: { numeroPedido } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error al marcar pedido como abonado:", error);
    res.status(500).json({ error: "Error al marcar el pedido como abonado" });
  }
});

// Cambiar estado a Finalizado
router.put("/:numeroPedido/finalizado", async (req, res) => {
  try {
    const { numeroPedido } = req.params;
    const [updated] = await Pedido.update(
      { idEstado: 5 },
      { where: { numeroPedido } }
    );
    if (updated === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error al finalizar pedido:", error);
    res.status(500).json({ error: "Error al finalizar el pedido" });
  }
});

// Obtener picker asignado a un pedido
router.get("/:numeroPedido/picker-asignado", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const [result] = await sequelize.query(
      `SELECT 
         ep.legajo, 
         COALESCE(u.nombreUsuario, CONCAT(pe.nombre, ' ', pe.apellido)) AS nombre
       FROM asignacion_picking ap
       JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
       JOIN persona pe ON ep.idPersona = pe.idPersona
       LEFT JOIN usuario u ON u.idPersona = pe.idPersona
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
  } catch (error) {
    console.error("Error al obtener picker asignado:", error);
    res.status(500).json({ error: "Error al obtener picker asignado" });
  }
});

// Asignar picker a pedido
router.post("/:numeroPedido/asignar-picker", async (req, res) => {
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
    console.error("Error al asignar picker:", error);
    res.status(500).json({ error: "Error al asignar picker" });
  }
});

// Obtener historial de modificaciones de un pedido
router.get("/:numeroPedido/historial", async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const historial = await HistorialModificacionPedido.findAll({
      where: { numeroPedido },
      include: [
        {
          model: Usuario,
          as: "UsuarioModificador",
          attributes: ['nombreUsuario']
        },
        {
          model: MotivoModificacionPedido,
          as: "Motivo",
          attributes: ['descripcion']
        }
      ],
      order: [['fechaModificacion', 'DESC']]
    });
    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial de modificaciones:", error);
    res.status(500).json({ 
      error: "Error al obtener historial de modificaciones", 
      detalle: error.message 
    });
  }
});

module.exports = router;
