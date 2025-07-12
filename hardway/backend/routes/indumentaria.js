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
  UnidadMedida, // Nuevo modelo
  Stock,
  MovimientoStock,
  sequelize 
} = require('../models');

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
    idDetalle
  } = req.body;

  const t = await sequelize.transaction();
  try {
    const nuevaIndumentaria = await Indumentaria.create(
      {
        codigoIndumentaria,
        descripcion,
        idDetalle,
        estaActivo: 1,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(nuevaIndumentaria);
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

module.exports = router;
