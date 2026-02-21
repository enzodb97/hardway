const express = require('express');
const router = express.Router();
const { verificarAccesoPicking } = require('../middleware/auth');
const { 
  Pedido,
  Cliente,
  Persona,
  DetallePedido,
  Indumentaria,
  DetalleIndumentaria,
  NombreIndumentaria,
  Color,
  Talle,
  CategoriaIndumentaria,
  EncargadoPicker,
  Stock,
  Rack,
  sequelize 
} = require('../models');

// Rutas SIN middleware de picking (para administradores)
// Obtener todas las tareas de picking (para administradores)
router.get("/tareas-admin", async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        ap.idAsignacion,
        ap.numeroPedido,
        p.fechaPedido,
        p.idEstado,
        CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombreCliente,
        c.email AS emailCliente,
        c.telefono AS telefonoCliente,
        ap.fechaAsignacion,
        ap.observaciones,
        ap.legajoPicker,
        ap.completado,
        COALESCE(u_picker.nombreUsuario, CONCAT(p_picker.nombre, ' ', COALESCE(p_picker.apellido, ''))) AS pickerAsignado,
        COUNT(dp.idDetallePedido) AS totalItems
      FROM asignacion_picking ap
      JOIN pedido p ON ap.numeroPedido = p.numeroPedido
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN persona per ON c.idPersona = per.idPersona
      LEFT JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN persona p_picker ON ep.idPersona = p_picker.idPersona
      LEFT JOIN usuario u_picker ON u_picker.idPersona = p_picker.idPersona
      WHERE p.estaActivo = 1
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = ap.numeroPedido
        )
      GROUP BY 
        ap.idAsignacion, ap.numeroPedido, p.fechaPedido, p.idEstado, per.nombre, per.apellido,
        c.email, c.telefono, ap.fechaAsignacion, ap.observaciones,
        ap.legajoPicker, ap.completado, u_picker.nombreUsuario, p_picker.nombre, p_picker.apellido
      ORDER BY ap.fechaAsignacion DESC
    `);
    
    res.json(results);
  } catch (error) {
    console.error("Error al obtener todas las tareas de picking:", error);
    res.status(500).json({ error: "Error al obtener todas las tareas de picking" });
  }
});

// Aplicar middleware de picking SOLO a las rutas que lo necesitan

// Obtener lista de pickers (sin middleware especial)
router.get("/pickers", async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        ep.legajo as id,
        ep.legajo,
        COALESCE(u.nombreUsuario, CONCAT(p.nombre, ' ', COALESCE(p.apellido, ''))) AS nombre,
        COALESCE(u.nombreUsuario, CONCAT(p.nombre, ' ', COALESCE(p.apellido, ''))) AS nombreCompleto
      FROM encargadopicker ep
      JOIN persona p ON ep.idPersona = p.idPersona
      LEFT JOIN usuario u ON u.idPersona = p.idPersona
      WHERE u.estaActivo = 1 OR u.estaActivo IS NULL
      ORDER BY COALESCE(u.nombreUsuario, p.nombre)
    `);
    
    res.json(results);
  } catch (error) {
    console.error("Error al obtener pickers:", error);
    res.status(500).json({ error: "Error al obtener pickers" });
  }
});

// Obtener motivos de problemas para picking (reutiliza motivo_no_apta)
router.get("/motivos-problemas", async (req, res) => {
  try {
    const [motivos] = await sequelize.query(`
      SELECT 
        idMotivo,
        descripcion
      FROM motivo_no_apta
      ORDER BY idMotivo ASC
    `);
    
    res.json(motivos);
  } catch (error) {
    console.error("Error al obtener motivos de problemas:", error);
    res.status(500).json({ error: "Error al obtener motivos de problemas" });
  }
});

// Obtener tareas de picking (CON middleware)
router.get("/tareas", verificarAccesoPicking, async (req, res) => {
  // El legajo ya fue validado por el middleware y está en req.pickerAutenticado
  const legajoPicker = req.pickerAutenticado.legajo;

  try {
    const [results] = await sequelize.query(`
      SELECT 
        ap.idAsignacion,
        ap.numeroPedido,
        p.fechaPedido,
        p.idEstado,
        CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombreCliente,
        c.email AS emailCliente,
        c.telefono AS telefonoCliente,
        ap.fechaAsignacion,
        ap.observaciones,
        ap.completado,
        COUNT(dp.idDetallePedido) AS totalItems
      FROM asignacion_picking ap
      JOIN pedido p ON ap.numeroPedido = p.numeroPedido
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN persona per ON c.idPersona = per.idPersona
      LEFT JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
      WHERE ap.legajoPicker = ? 
        AND p.estaActivo = 1
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = ap.numeroPedido
        )
      GROUP BY 
        ap.idAsignacion, ap.numeroPedido, p.fechaPedido, p.idEstado, per.nombre, per.apellido,
        c.email, c.telefono, ap.fechaAsignacion, ap.observaciones, ap.completado
      ORDER BY ap.fechaAsignacion DESC
    `, { replacements: [legajoPicker] });
    
    res.json(results);
  } catch (error) {
    console.error("Error al obtener tareas de picking:", error);
    res.status(500).json({ error: "Error al obtener tareas de picking" });
  }
});

// Obtener detalle de tarea de picking (CON middleware)
router.get("/tareas/:numeroPedido", verificarAccesoPicking, async (req, res) => {
  const { numeroPedido } = req.params;
  
  try {
    // Inicializar variable de asignación
    let asignacion = [];
    
    // Si es admin, no verificar asignación específica
    if (req.esAdmin) {
      console.log('👑 Acceso como administrador, omitiendo verificación de asignación');
      // Para admins, solo verificamos que el pedido exista en alguna asignación
      const [asignacionResult] = await sequelize.query(`
        SELECT * FROM asignacion_picking 
        WHERE numeroPedido = ?
      `, { replacements: [numeroPedido] });
      
      asignacion = asignacionResult;
    } else {
      // El legajo ya fue validado por el middleware y está en req.pickerAutenticado
      const legajoPicker = req.pickerAutenticado.legajo;
      
      // Verificar que la tarea esté asignada al picker
      const [asignacionResult] = await sequelize.query(`
        SELECT * FROM asignacion_picking 
        WHERE numeroPedido = ? AND legajoPicker = ?
      `, { replacements: [numeroPedido, legajoPicker] });
      
      asignacion = asignacionResult;
      
      if (!asignacion.length) {
        return res.status(403).json({ error: "Tarea no asignada a este picker" });
      }
    }

    // Verificar que el pedido existe en alguna asignación
    if (!asignacion.length) {
      return res.status(404).json({ error: "No se encontró información de picking para este pedido" });
    }

    // Obtener detalles del pedido
    const pedido = await Pedido.findOne({
      where: { numeroPedido },
      include: [
        {
          model: Cliente,
          include: [{ model: Persona }],
        },
        {
          model: DetallePedido,
          include: [
            {
              model: Indumentaria,
              as: "Indumentarium",
              attributes: ['codigoIndumentaria', 'idDetalle'],
              include: [
                {
                  model: DetalleIndumentaria,
                  as: "DetalleIndumentarium",
                  include: [
                    { model: NombreIndumentaria, as: "NombreIndumentarium" },
                    { model: Color },
                    { model: Talle },
                    { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
                  ],
                },
                {
                  model: Stock,
                  attributes: ['idStock', 'idRack'],
                  include: [
                    { model: Rack, attributes: ['idRack', 'numeroRack'] }
                  ]
                }
              ],
            },
          ],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Log para diagnóstico
    console.log('Enviando datos de pedido con rack:', 
      pedido.DetallePedidos.map(detalle => ({
        codigo: detalle.Indumentarium?.codigoIndumentaria,
        idRack: detalle.Indumentarium?.Stock?.idRack,
        numeroRack: detalle.Indumentarium?.Stock?.Rack?.numeroRack
      }))
    );
    
    res.json({
      pedido,
      asignacion: asignacion[0]
    });
  } catch (error) {
    console.error("Error al obtener detalle de tarea:", error);
    res.status(500).json({ error: "Error al obtener detalle de tarea" });
  }
});

// Completar tarea de picking (con soporte para reportar problemas)
router.post("/tareas/:numeroPedido/completar", verificarAccesoPicking, async (req, res) => {
  const { numeroPedido } = req.params;
  const { 
    observaciones, 
    idAsignacion,
    tieneProblemas,
    idMotivoProblema,
    observacionesProblema,
    completarParcial,
    idDetallePedidoProblema,
    cantidadConProblema
  } = req.body;
  
  // Log para diagnóstico
  console.log('📦 Cuerpo de la petición recibido:', JSON.stringify(req.body));
  console.log('🔑 idAsignacion recibido:', idAsignacion, 'tipo:', typeof idAsignacion);
  console.log('⚠️ Tiene problemas:', tieneProblemas, 'Completar parcial:', completarParcial);
  console.log('🎯 Artículo problema:', idDetallePedidoProblema, 'Cantidad:', cantidadConProblema);

  // Iniciar transacción
  const t = await sequelize.transaction();
  
  try {
    // VALIDACIÓN: Verificar si hay problemas pendientes de resolución antes de completar
    if (!tieneProblemas) { // Solo validar cuando se intenta completar sin problemas
      const [notificacionesPendientes] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM notificacion_pedido n
        WHERE n.numeroPedido = ?
          AND n.tipoNotificacion = 'problema_picking'
          AND n.estadoResolucion = 'pendiente'
      `, {
        replacements: [numeroPedido],
        transaction: t
      });

      if (notificacionesPendientes[0].total > 0) {
        await t.rollback();
        console.log(`❌ Intento de completar pedido ${numeroPedido} con problemas pendientes de resolución`);
        return res.status(400).json({ 
          error: "No se puede completar. Hay problemas pendientes de resolución.",
          detalles: "El vendedor debe resolver los problemas reportados antes de continuar.",
          cantidadProblemasPendientes: notificacionesPendientes[0].total
        });
      }
    }
    
    let idAsignacionActual = null;
    
    // Manejar caso especial para administradores
    if (req.esAdmin) {
      console.log('🔑 Usuario administrador completando tarea de picking');
      
      const idAsignacionNum = idAsignacion ? parseInt(idAsignacion, 10) : null;
      console.log('🔍 idAsignacion recibido y convertido:', { 
        original: idAsignacion, 
        tipo: typeof idAsignacion, 
        convertido: idAsignacionNum, 
        tipoConvertido: typeof idAsignacionNum,
        esValido: idAsignacionNum && !isNaN(idAsignacionNum)
      });
      
      if (idAsignacionNum && !isNaN(idAsignacionNum)) {
        const [asignacionResults] = await sequelize.query(`
          SELECT legajoPicker FROM asignacion_picking 
          WHERE numeroPedido = ? AND idAsignacion = ? AND completado = 0
        `, { 
          replacements: [numeroPedido, idAsignacionNum],
          transaction: t 
        });

        if (asignacionResults.length === 0) {
          throw new Error('No se encontró la asignación especificada o ya está completada');
        }

        idAsignacionActual = idAsignacionNum;
        
        // Si hay problemas, actualizar campos adicionales
        if (tieneProblemas) {
          await sequelize.query(`
            UPDATE asignacion_picking 
            SET completado = ?, 
                fechaCompletado = ?, 
                observaciones = ?,
                tieneProblemas = 1,
                idMotivoProblema = ?,
                observacionesProblema = ?,
                completarParcial = ?,
                idDetallePedidoProblema = ?,
                cantidadConProblema = ?
            WHERE numeroPedido = ? AND idAsignacion = ? AND completado = 0
          `, { 
            replacements: [
              completarParcial ? 1 : 0, // Solo completar si picker decidió hacerlo parcialmente
              completarParcial ? new Date() : null,
              observaciones || 'Completada por administrador',
              idMotivoProblema,
              observacionesProblema,
              completarParcial ? 1 : 0,
              idDetallePedidoProblema,
              cantidadConProblema,
              numeroPedido, 
              idAsignacionNum
            ],
            transaction: t 
          });
          console.log(`⚠️ Admin registró problema en tarea ${idAsignacionNum} - Artículo: ${idDetallePedidoProblema}, Cantidad: ${cantidadConProblema}`);
        } else {
          // Sin problemas, completar normal
          await sequelize.query(`
            UPDATE asignacion_picking 
            SET completado = 1, fechaCompletado = NOW(), observaciones = ?
            WHERE numeroPedido = ? AND idAsignacion = ? AND completado = 0
          `, { 
            replacements: [observaciones || 'Completada por administrador', numeroPedido, idAsignacionNum],
            transaction: t 
          });
          console.log(`✅ Admin completó tarea con ID ${idAsignacionNum} para pedido ${numeroPedido}`);
        }
      } else {
        console.log('❌ Error: idAsignacion no válido:', idAsignacion, 'tipo:', typeof idAsignacion);
        throw new Error('Como administrador, debe especificar idAsignacion válido para completar una tarea');
      }
    } else if (req.pickerAutenticado && req.pickerAutenticado.legajo) {
      // Caso normal para pickers regulares
      const legajoPicker = req.pickerAutenticado.legajo;
      console.log(`🔑 Picker ${legajoPicker} completando tarea`);

      // Obtener idAsignacion actual del picker
      const [asignacionResults] = await sequelize.query(`
        SELECT idAsignacion FROM asignacion_picking
        WHERE numeroPedido = ? AND legajoPicker = ? AND completado = 0
        LIMIT 1
      `, {
        replacements: [numeroPedido, legajoPicker],
        transaction: t
      });
      
      if (asignacionResults.length > 0) {
        idAsignacionActual = asignacionResults[0].idAsignacion;
      }

      // Si hay problemas, actualizar campos adicionales
      if (tieneProblemas) {
        await sequelize.query(`
          UPDATE asignacion_picking 
          SET completado = ?, 
              fechaCompletado = ?, 
              observaciones = ?,
              tieneProblemas = 1,
              idMotivoProblema = ?,
              observacionesProblema = ?,
              completarParcial = ?,
              idDetallePedidoProblema = ?,
              cantidadConProblema = ?
          WHERE numeroPedido = ? AND legajoPicker = ? AND completado = 0
        `, { 
          replacements: [
            completarParcial ? 1 : 0,
            completarParcial ? new Date() : null,
            observaciones || 'Tarea con problema reportado',
            idMotivoProblema,
            observacionesProblema,
            completarParcial ? 1 : 0,
            idDetallePedidoProblema,
            cantidadConProblema,
            numeroPedido, 
            legajoPicker
          ],
          transaction: t 
        });
        console.log(`⚠️ Picker ${legajoPicker} registró problema - Artículo: ${idDetallePedidoProblema}, Cantidad: ${cantidadConProblema}`);
      } else {
        // Sin problemas, completar normal
        await sequelize.query(`
          UPDATE asignacion_picking 
          SET completado = 1, fechaCompletado = NOW(), observaciones = ?
          WHERE numeroPedido = ? AND legajoPicker = ? AND completado = 0
        `, { 
          replacements: [observaciones || 'Tarea completada', numeroPedido, legajoPicker],
          transaction: t 
        });
      }
    } else {
      throw new Error('No se pudo identificar el picker ni se proporcionó idAsignacion como administrador');
    }

    // Actualizar estado del pedido SOLO si no hay problemas O si se decidió completar parcialmente
    if (!tieneProblemas || completarParcial) {
      console.log(`🔄 Actualizando estado del pedido ${numeroPedido} a Pendiente de Pago (idEstado=2)`);
      await Pedido.update(
        { idEstado: 2, fechaModificacion: new Date() },
        { where: { numeroPedido }, transaction: t }
      );
    } else {
      console.log(`⏸️ Pedido ${numeroPedido} queda en estado "En Curso" (esperando resolución del problema)`);
    }

    // Si hay problemas, crear notificación para el vendedor
    if (tieneProblemas) {
      // Obtener idUsuarioCreo del pedido
      const [pedidoInfo] = await sequelize.query(`
        SELECT idUsuarioCreo FROM pedido WHERE numeroPedido = ?
      `, {
        replacements: [numeroPedido],
        transaction: t
      });

      if (pedidoInfo.length > 0 && pedidoInfo[0].idUsuarioCreo) {
        const idUsuarioVendedor = pedidoInfo[0].idUsuarioCreo;
        
        // Obtener descripción del motivo
        const [motivoInfo] = await sequelize.query(`
          SELECT descripcion FROM motivo_no_apta WHERE idMotivo = ?
        `, {
          replacements: [idMotivoProblema],
          transaction: t
        });

        const descripcionMotivo = motivoInfo.length > 0 ? motivoInfo[0].descripcion : 'Problema no especificado';
        
        // Construir información del artículo si está disponible
        let infoArticulo = '';
        if (idDetallePedidoProblema) {
          const [articuloInfo] = await sequelize.query(`
            SELECT dp.codigoIndumentaria, ni.nombre, pp.nombrePresentacion
            FROM detallepedido dp
            LEFT JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
            LEFT JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
            LEFT JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
            LEFT JOIN presentacion_producto pp ON dp.idPresentacion = pp.idPresentacion
            WHERE dp.idDetallePedido = ?
            LIMIT 1
          `, {
            replacements: [idDetallePedidoProblema],
            transaction: t
          });

          if (articuloInfo.length > 0) {
            const nombreArticulo = articuloInfo[0].nombre || articuloInfo[0].codigoIndumentaria;
            const presentacion = articuloInfo[0].nombrePresentacion ? ` (${articuloInfo[0].nombrePresentacion})` : '';
            infoArticulo = ` | Artículo: ${nombreArticulo}${presentacion}${cantidadConProblema ? ` - ${cantidadConProblema} unidades` : ''}`;
          }
        }
        
        const mensaje = `⚠️ Problema reportado en pedido ${numeroPedido}: ${descripcionMotivo}${infoArticulo}. ${observacionesProblema || ''}${completarParcial ? ' (Pedido completado parcialmente)' : ' (Pedido en espera de resolución)'}`;
        
        // Crear notificación
        await sequelize.query(`
          INSERT INTO notificacion_pedido 
          (numeroPedido, idUsuarioDestino, tipoNotificacion, mensaje, idAsignacionPicking, estadoResolucion)
          VALUES (?, ?, 'problema_picking', ?, ?, 'pendiente')
        `, {
          replacements: [numeroPedido, idUsuarioVendedor, mensaje, idAsignacionActual],
          transaction: t
        });
        
        console.log(`📩 Notificación creada para usuario ${idUsuarioVendedor} sobre problema en pedido ${numeroPedido}`);
      }
    }

    await t.commit();
    
    let estadoFinal = tieneProblemas && !completarParcial ? 'En Curso (con problema)' : 'Pendiente de Pago';
    let idEstadoFinal = tieneProblemas && !completarParcial ? 1 : 2;
    
    res.json({ 
      message: tieneProblemas 
        ? (completarParcial 
          ? "Problema reportado. Pedido completado parcialmente." 
          : "Problema reportado. Pedido en espera de resolución.")
        : "Tarea de picking completada correctamente", 
      estado: estadoFinal,
      idEstado: idEstadoFinal,
      tieneProblemas: tieneProblemas || false
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al completar tarea:", error);
    res.status(500).json({ error: "Error al completar tarea: " + error.message });
  }
});

module.exports = router;
