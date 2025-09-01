const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const { 
  Indumentaria,
  DetalleIndumentaria,
  NombreIndumentaria,
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  UnidadMedida,
  Stock,
  MovimientoStock,
  Rack,
  sequelize
} = require('../models');

// Rutas de Racks
router.get("/racks", async (req, res) => {
  try {
    const racks = await Rack.findAll({
      order: [['numeroRack', 'ASC']]
    });
    res.json(racks);
  } catch (error) {
    console.error('Error al obtener racks:', error);
    res.status(500).json({ error: 'Error al obtener racks', detalle: error.message });
  }
});

// Obtener un rack por ID
router.get("/racks/:id", async (req, res) => {
  try {
    const rack = await Rack.findByPk(req.params.id);
    if (!rack) {
      return res.status(404).json({ error: 'Rack no encontrado' });
    }
    res.json(rack);
  } catch (error) {
    console.error('Error al obtener rack:', error);
    res.status(500).json({ error: 'Error al obtener rack', detalle: error.message });
  }
});

// Crear nuevo rack
router.post("/racks", async (req, res) => {
  const { numeroRack, descripcion } = req.body;
  
  const t = await sequelize.transaction();
  try {
    const nuevoRack = await Rack.create({
      numeroRack,
      descripcion
    }, { transaction: t });

    await t.commit();
    res.status(201).json(nuevoRack);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear rack:', error);
    res.status(500).json({ error: 'Error al crear rack', detalle: error.message });
  }
});

// Obtener el siguiente código autoincremental
router.get("/siguiente-codigo", async (req, res) => {
  try {
    // Obtener el último código de indumentaria que comience con "IND"
    const ultimaIndumentaria = await Indumentaria.findOne({
      where: {
        codigoIndumentaria: {
          [Op.like]: 'IND%'
        }
      },
      order: [
        [Sequelize.literal("CAST(SUBSTRING(codigoIndumentaria, 4) AS UNSIGNED)"), 'DESC']
      ],
      limit: 1
    });

    let siguienteNumero = 1;
    
    if (ultimaIndumentaria) {
      const ultimoCodigo = ultimaIndumentaria.codigoIndumentaria;
      // Extraer el número después de "IND"
      const numeroActual = parseInt(ultimoCodigo.substring(3));
      siguienteNumero = numeroActual + 1;
    }

    // Formatear con ceros a la izquierda (3 dígitos)
    const siguienteCodigo = `IND${siguienteNumero.toString().padStart(3, '0')}`;
    
    res.json({ siguienteCodigo });
  } catch (error) {
    console.error('Error al generar siguiente código:', error);
    res.status(500).json({ error: 'Error al generar código', detalle: error.message });
  }
});

// Obtener toda la indumentaria
router.get("/", async (req, res) => {
  try {
    const indumentaria = await Indumentaria.findAll({
      include: [
        {
          model: DetalleIndumentaria,
          as: "DetalleIndumentarium",
          include: [
            { model: NombreIndumentaria, as: "NombreIndumentarium" },
            { model: Color },
            { model: Talle },
            { model: Tela, as: "TelaIndumentarium" },
            { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
            { model: EstadoIndumentaria, as: "EstadoIndumentarium" },
            { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
            { model: UnidadMedida, as: "UnidadMedidum" },
          ],
        },
        {
          model: Stock,
          include: [
            { model: MovimientoStock },
            { model: Rack },
          ],
        },
      ],
    });

    // Calcular stock actual para cada indumentaria
    const indumentariaConStock = indumentaria.map(item => {
      const itemJson = item.toJSON();
      
      // Calcular stock disponible (excluyendo el rack No Apto)
      let stockDisponible = 0;
      if (item.Stock && item.Stock.MovimientoStocks) {
        // Solo contar stock de racks que no sean el No Apto (99)
        if (item.Stock.idRack !== 99) {
          stockDisponible = item.Stock.MovimientoStocks.reduce((total, movimiento) => {
            return total + (movimiento.cantidad || 0);
          }, 0);
        }
      }

      // Agregar el stock calculado al DetalleIndumentarium
      if (itemJson.DetalleIndumentarium) {
        itemJson.DetalleIndumentarium.cantidadIndumentaria = stockDisponible;
      }

      return itemJson;
    });

    res.json(indumentariaConStock);
  } catch (error) {
    console.error("Error al obtener indumentaria:", error);
    res.status(500).json({ error: "Error al obtener indumentaria", detalle: error.message });
  }
});

// Crear nueva indumentaria
router.post("/", async (req, res) => {
  const {
    codigoIndumentaria,
    descripcion,
    idDetalle,
    cantidadInicial = 0, // Stock inicial
    idRack // Ubicación del stock
  } = req.body;

  const t = await sequelize.transaction();
  try {
    // 1. Crear la indumentaria
    const nuevaIndumentaria = await Indumentaria.create(
      {
        codigoIndumentaria,
        descripcion,
        idDetalle,
        estaActivo: 1,
      },
      { transaction: t }
    );

    // 2. Crear el registro de stock
    const stockId = `STK-${Date.now()}`;
    const nuevoStock = await Stock.create(
      {
        idStock: stockId,
        codigoIndumentaria: nuevaIndumentaria.codigoIndumentaria,
        idRack: idRack || null
      },
      { transaction: t }
    );

    // 3. Si hay stock inicial o rack asignado, crear el movimiento inicial
    if (cantidadInicial > 0 || idRack) {
      const movimientoId = `MOV-${Date.now()}`;
      await MovimientoStock.create(
        {
          idMovimientoStock: movimientoId,
          idStock: stockId,
          fechaMovimiento: new Date(),
          cantidad: cantidadInicial || 0,
          observaciones: 'Stock inicial'
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({
      indumentaria: nuevaIndumentaria,
      stock: nuevoStock,
      stockInicial: cantidadInicial
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear indumentaria:", error);
    res.status(500).json({ error: "Error al crear indumentaria", detalle: error.message });
  }
});

// Obtener indumentaria por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const indumentaria = await Indumentaria.findOne({
      where: { codigoIndumentaria: id },
      include: [
        {
          model: DetalleIndumentaria,
          as: "DetalleIndumentarium",
          include: [
            { model: NombreIndumentaria, as: "NombreIndumentarium" },
            { model: Color },
            { model: Talle },
            { model: Tela, as: "TelaIndumentarium" },
            { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
            { model: EstadoIndumentaria, as: "EstadoIndumentarium" },
            { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
            { model: UnidadMedida, as: "UnidadMedidum" }, // Nuevo JOIN
          ],
        },
        {
          model: Stock,
          include: [
            {
              model: MovimientoStock,
            },
          ],
        },
      ],
    });

    if (!indumentaria) {
      return res.status(404).json({ error: "Indumentaria no encontrada" });
    }

    // Calcular stock actual
    let stockActual = 0;
    if (indumentaria.Stock && indumentaria.Stock.MovimientoStocks) {
      stockActual = indumentaria.Stock.MovimientoStocks.reduce((total, movimiento) => {
        return total + (movimiento.cantidad || 0);
      }, 0);
    }

    // Agregar el stock calculado al DetalleIndumentarium
    const indumentariaJson = indumentaria.toJSON();
    if (indumentariaJson.DetalleIndumentarium) {
      indumentariaJson.DetalleIndumentarium.cantidadIndumentaria = stockActual;
    }

    res.json(indumentariaJson);
  } catch (error) {
    console.error("Error al obtener indumentaria:", error);
    res.status(500).json({ error: "Error al obtener indumentaria", detalle: error.message });
  }
});

// Actualizar indumentaria
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { descripcion, idDetalle } = req.body;

  const t = await sequelize.transaction();
  try {
    const indumentaria = await Indumentaria.findOne({
      where: { codigoIndumentaria: id },
      transaction: t,
    });

    if (!indumentaria) {
      await t.rollback();
      return res.status(404).json({ error: "Indumentaria no encontrada" });
    }

    await indumentaria.update(
      { descripcion, idDetalle },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Indumentaria actualizada correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar indumentaria:", error);
    res.status(500).json({ error: "Error al actualizar indumentaria", detalle: error.message });
  }
});

// Mover indumentaria a No Apta
router.post("/:id/no-apta", async (req, res) => {
  const { id } = req.params;
  const { cantidad, motivo } = req.body;

  console.log('Recibiendo solicitud para marcar como no apta:', {
    id,
    cantidad,
    motivo
  });

  // Validar datos de entrada
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ 
      error: "La cantidad debe ser un número mayor a 0",
      detalles: { cantidad, tipo: typeof cantidad }
    });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Obtener el stock actual y todos sus movimientos
    // 1. Obtener el stock actual y todos sus movimientos
    const stockActual = await Stock.findOne({
      where: { 
        codigoIndumentaria: id,
        idRack: { [Op.ne]: 99 } // Excluir el rack de No Aptos
      },
      include: [{ 
        model: MovimientoStock,
        attributes: ['cantidad', 'fechaMovimiento', 'observaciones']
      }],
      transaction: t
    });

    if (!stockActual) {
      console.log('Stock no encontrado para:', id);
      await t.rollback();
      return res.status(404).json({ error: "Stock no encontrado" });
    }

    console.log('Stock encontrado:', {
      idStock: stockActual.idStock,
      movimientos: stockActual.MovimientoStocks.map(m => ({
        cantidad: m.cantidad,
        fecha: m.fechaMovimiento,
        obs: m.observaciones
      }))
    });

    // Calcular stock disponible sumando todos los movimientos
    const stockDisponible = stockActual.MovimientoStocks.reduce((total, mov) => {
      return total + (Number(mov.cantidad) || 0)
    }, 0);
    
    console.log('Stock disponible calculado:', {
      stockDisponible,
      movimientos: stockActual.MovimientoStocks.map(m => ({
        cantidad: m.cantidad,
        fecha: m.fechaMovimiento
      }))
    });
    
    if (stockDisponible < cantidad) {
      console.log('Error: Stock insuficiente', { stockDisponible, cantidadSolicitada: cantidad });
      await t.rollback();
      return res.status(400).json({ 
        error: "No hay suficiente stock disponible",
        detalles: { 
          stockDisponible, 
          cantidadSolicitada: cantidad,
          codigoIndumentaria: id
        }
      });
    }
    
    console.log('Stock disponible calculado:', stockDisponible);
    
    if (stockDisponible < cantidad) {
      await t.rollback();
      return res.status(400).json({ error: "No hay suficiente stock disponible" });
    }

    // 2. Crear nuevo registro de stock para No Apto si no existe
    let stockNoApto = await Stock.findOne({
      where: { 
        codigoIndumentaria: id,
        idRack: 99 // Rack No Apto
      },
      transaction: t
    });

    if (!stockNoApto) {
      stockNoApto = await Stock.create({
        idStock: `STK-NA-${Date.now()}`,
        codigoIndumentaria: id,
        idRack: 99 // Rack No Apto
      }, { transaction: t });
    }

    // 3. Registrar movimientos
    const fecha = new Date();
    
    // Movimiento de salida del stock original
    await MovimientoStock.create({
      idMovimientoStock: `MOV-${Date.now()}-1`,
      idStock: stockActual.idStock,
      fechaMovimiento: fecha,
      cantidad: -cantidad,
      observaciones: `Movimiento a No Apto: ${motivo || 'Sin especificar'}`
    }, { transaction: t });

    // Movimiento de entrada al stock no apto
    await MovimientoStock.create({
      idMovimientoStock: `MOV-${Date.now()}-2`,
      idStock: stockNoApto.idStock,
      fechaMovimiento: fecha,
      cantidad: cantidad,
      observaciones: `Ingreso desde stock vendible: ${motivo || 'Sin especificar'}`
    }, { transaction: t });

    await t.commit();
    res.json({ message: "Stock movido a No Apto correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al mover stock a No Apto:", error);
    res.status(500).json({ error: "Error al mover stock a No Apto", detalle: error.message });
  }
});

// Rutas de Racks

// Rutas de Stock

// Crear movimiento de stock
router.post('/stock/movimiento', async (req, res) => {
  const { codigoIndumentaria, cantidad, observaciones } = req.body;
  
  if (!codigoIndumentaria || !cantidad) {
    return res.status(400).json({ error: 'Se requiere codigoIndumentaria y cantidad' });
  }

  const t = await sequelize.transaction();
  try {
    // Primero buscamos el stock correspondiente
    let stock = await Stock.findOne({
      where: { codigoIndumentaria },
      transaction: t
    });

    // Si no existe el stock, lo creamos
    if (!stock) {
      const stockId = `STK-${Date.now()}`;
      stock = await Stock.create({
        idStock: stockId,
        codigoIndumentaria
      }, { transaction: t });
    }

    const movimientoId = `MOV-${Date.now()}`;
    const nuevoMovimiento = await MovimientoStock.create({
      idMovimientoStock: movimientoId,
      idStock: stock.idStock,
      fechaMovimiento: new Date(),
      cantidad: parseInt(cantidad),
      observaciones: observaciones || 'Sin observaciones'
    }, { transaction: t });

    await t.commit();
    res.json(nuevoMovimiento);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear movimiento de stock:', error);
    res.status(500).json({ error: 'Error al crear movimiento de stock', detalle: error.message });
  }
});

// Actualizar stock
router.put('/stock/:codigoIndumentaria', async (req, res) => {
  const { codigoIndumentaria } = req.params;
  const { idRack } = req.body;

  const t = await sequelize.transaction();
  try {
    const stock = await Stock.findOne({
      where: { codigoIndumentaria },
      transaction: t
    });

    if (!stock) {
      await t.rollback();
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    await stock.update({ idRack }, { transaction: t });
    await t.commit();
    
    res.json({ message: 'Stock actualizado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error al actualizar stock', detalle: error.message });
  }
});

module.exports = router;
