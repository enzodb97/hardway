const express = require("express");
const router = express.Router();
const { verificarAutenticacion } = require("../middleware/auth");
const {
  PresentacionProducto,
  ConfiguracionPresentacion,
  Indumentaria,
} = require("../models");

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// ========================================
// OBTENER TODAS LAS PRESENTACIONES
// ========================================
router.get("/presentaciones", async (req, res) => {
  try {
    const presentaciones = await PresentacionProducto.findAll({
      order: [["idPresentacion", "ASC"]],
    });
    res.json(presentaciones);
  } catch (error) {
    console.error("Error al obtener presentaciones:", error);
    res.status(500).json({ error: "Error al obtener presentaciones" });
  }
});

// ========================================
// OBTENER CONFIGURACIONES DE PRESENTACIÓN POR PRODUCTO
// ========================================
router.get(
  "/configuraciones/:codigoIndumentaria",
  async (req, res) => {
    try {
      const { codigoIndumentaria } = req.params;

      const configuraciones = await ConfiguracionPresentacion.findAll({
        where: {
          codigoIndumentaria,
          estaActivo: 1,
        },
        include: [
          {
            model: PresentacionProducto,
            as: "Presentacion",
          },
        ],
        order: [["cantidadUnidades", "ASC"]],
      });

      res.json(configuraciones);
    } catch (error) {
      console.error("Error al obtener configuraciones:", error);
      res
        .status(500)
        .json({ error: "Error al obtener configuraciones de presentación" });
    }
  }
);

// ========================================
// VERIFICAR SI HAY CONFIGURACIONES
// ========================================
router.get("/configuraciones/verificar/estado", async (req, res) => {
  try {
    const count = await ConfiguracionPresentacion.count();
    const hayConfiguraciones = count > 0;

    // Si no hay configuraciones, crear configuración por defecto para todos los productos
    if (!hayConfiguraciones) {
      const productos = await Indumentaria.findAll();
      const configuracionesDefault = [];

      for (const producto of productos) {
        configuracionesDefault.push({
          codigoIndumentaria: producto.codigoIndumentaria,
          idPresentacion: 1, // Unidad
          cantidadUnidades: 1,
          precioBase: null,
          estaActivo: 1,
        });
      }

      if (configuracionesDefault.length > 0) {
        await ConfiguracionPresentacion.bulkCreate(configuracionesDefault);
      }

      return res.json({
        hayConfiguraciones: false,
        configuracionesCreadas: configuracionesDefault.length,
        mensaje:
          "Se crearon configuraciones por defecto (venta por unidad) para todos los productos",
      });
    }

    res.json({
      hayConfiguraciones: true,
      totalConfiguraciones: count,
    });
  } catch (error) {
    console.error("Error al verificar configuraciones:", error);
    res.status(500).json({ error: "Error al verificar configuraciones" });
  }
});

// ========================================
// CREAR/ACTUALIZAR CONFIGURACIÓN DE PRESENTACIÓN
// ========================================
router.post("/configuraciones", async (req, res) => {
  try {
    const {
      codigoIndumentaria,
      idPresentacion,
      cantidadUnidades,
      precioBase,
    } = req.body;

    // Validaciones
    if (!codigoIndumentaria || !idPresentacion || !cantidadUnidades) {
      return res.status(400).json({
        error: "Faltan campos requeridos",
      });
    }

    // Verificar si ya existe
    const existente = await ConfiguracionPresentacion.findOne({
      where: {
        codigoIndumentaria,
        idPresentacion,
      },
    });

    if (existente) {
      // Actualizar
      await existente.update({
        cantidadUnidades,
        precioBase,
        estaActivo: 1,
      });

      return res.json({
        mensaje: "Configuración actualizada",
        configuracion: existente,
      });
    }

    // Crear nueva
    const nuevaConfig = await ConfiguracionPresentacion.create({
      codigoIndumentaria,
      idPresentacion,
      cantidadUnidades,
      precioBase,
      estaActivo: 1,
    });

    res.status(201).json({
      mensaje: "Configuración creada",
      configuracion: nuevaConfig,
    });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    res.status(500).json({ error: "Error al guardar configuración" });
  }
});

// ========================================
// ELIMINAR (DESACTIVAR) CONFIGURACIÓN
// ========================================
router.delete("/configuraciones/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const configuracion = await ConfiguracionPresentacion.findByPk(id);

    if (!configuracion) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }

    await configuracion.update({ estaActivo: 0 });

    res.json({ mensaje: "Configuración desactivada" });
  } catch (error) {
    console.error("Error al eliminar configuración:", error);
    res.status(500).json({ error: "Error al eliminar configuración" });
  }
});

module.exports = router;
