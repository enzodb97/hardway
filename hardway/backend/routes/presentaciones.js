const express = require("express");
const router = express.Router();
const { verificarAutenticacion, verificarAccesoConfiguracion } = require("../middleware/auth");
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
router.get("/", async (req, res) => {
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

// ========================================
// ACTUALIZAR PORCENTAJE DE DESCUENTO DE UNA PRESENTACIÓN
// ========================================
router.put(
  "/:id/descuento",
  verificarAccesoConfiguracion,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { porcentajeDescuento } = req.body;

      // Validar que el porcentaje esté presente
      if (porcentajeDescuento === undefined || porcentajeDescuento === null) {
        return res.status(400).json({ error: "El porcentaje de descuento es requerido" });
      }

      // Validar que el porcentaje sea un número entero entre 0 y 100
      const porcentaje = parseInt(porcentajeDescuento);
      if (isNaN(porcentaje) || !Number.isInteger(Number(porcentajeDescuento))) {
        return res.status(400).json({ 
          error: "El porcentaje de descuento debe ser un número entero" 
        });
      }
      
      if (porcentaje < 0 || porcentaje > 100) {
        return res.status(400).json({ 
          error: "El porcentaje de descuento debe estar entre 0 y 100" 
        });
      }

      // Buscar la presentación
      const presentacion = await PresentacionProducto.findByPk(id);

      if (!presentacion) {
        return res.status(404).json({ error: "Presentación no encontrada" });
      }

      // Guardar valor anterior para el log
      const valorAnterior = presentacion.porcentajeDescuento;

      // Actualizar el porcentaje
      await presentacion.update({ porcentajeDescuento: porcentaje });

      // Log de auditoría
      console.log(`✅ Descuento actualizado:`, {
        presentacion: presentacion.nombrePresentacion,
        valorAnterior: `${valorAnterior}%`,
        valorNuevo: `${porcentaje}%`,
        usuario: req.usuarioAutenticado?.nombreUsuario || 'Desconocido',
        fecha: new Date().toISOString()
      });

      res.json({ 
        mensaje: `Descuento actualizado correctamente de ${valorAnterior}% a ${porcentaje}%`,
        presentacion: {
          idPresentacion: presentacion.idPresentacion,
          nombrePresentacion: presentacion.nombrePresentacion,
          porcentajeDescuento: presentacion.porcentajeDescuento,
          valorAnterior
        }
      });
    } catch (error) {
      console.error("Error al actualizar porcentaje de descuento:", error);
      res.status(500).json({ error: "Error al actualizar porcentaje de descuento" });
    }
  }
);

module.exports = router;
