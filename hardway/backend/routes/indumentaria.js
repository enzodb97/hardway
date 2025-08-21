const express = require('express');
const router = express.Router();
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
      let stockActual = 0;
      if (item.Stock && item.Stock.MovimientoStocks) {
        stockActual = item.Stock.MovimientoStocks.reduce((total, movimiento) => {
          return total + (movimiento.cantidad || 0);
        }, 0);
      }

      // Agregar el stock calculado al DetalleIndumentarium
      const itemJson = item.toJSON();
      if (itemJson.DetalleIndumentarium) {
        itemJson.DetalleIndumentarium.cantidadIndumentaria = stockActual;
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

// Eliminar indumentaria (soft delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

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
      { estaActivo: 0 },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Indumentaria eliminada correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar indumentaria:", error);
    res.status(500).json({ error: "Error al eliminar indumentaria", detalle: error.message });
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
