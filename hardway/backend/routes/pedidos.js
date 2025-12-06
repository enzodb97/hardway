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
} = require("../models");
const { Sequelize } = require("sequelize");

// Aplicar middleware a todas las rutas de pedidos
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

    // Calcular el total del pedido (precio * cantidad de cada prenda)
    let totalPedido = 0;
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
        totalPedido += precio * prenda.cantidad;
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

    // Calcular descuento global si es VIP
    const descuentoOrden = esVip ? totalPedido * 0.1 : 0;

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
        await DetallePedido.create(
          {
            idDetallePedido: "DPED-" + Math.random().toString().slice(2, 8),
            numeroPedido,
            codigoIndumentaria: prenda.codigoIndumentaria,
            cantidad: prenda.cantidad,
            descuentoItem: 0, // Por ahora, sin descuento por ítem
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
        (pr.precio * dp.cantidad - IFNULL(dp.descuentoItem,0)) AS subtotal
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
router.put("/:numeroPedido", async (req, res) => {
  const { idCliente, idEstado, prendas, idEmpresaEnvio } = req.body;
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

    // Para cada producto, crear movimiento de stock (devolución)
    for (const detalle of detalles) {
      const stock = await Stock.findOne({
        where: { codigoIndumentaria: detalle.codigoIndumentaria },
        transaction: t,
      });

      if (stock) {
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

module.exports = router;
