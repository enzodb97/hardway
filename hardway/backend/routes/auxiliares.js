const express = require("express");
const router = express.Router();
const {
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  NombreIndumentaria,
  DetalleIndumentaria, // Agregamos este modelo
  UnidadMedida, // Nuevo modelo
  TipoRol,
  MotivoCancelacion,
  sequelize,
} = require("../models");
const { Ciudad, Barrio } = require("../models/Ubicacion");

// Rutas para Colores
router.get("/colores", async (req, res) => {
  try {
    const colores = await Color.findAll();
    res.json(colores);
  } catch (error) {
    console.error("Error al obtener colores:", error);
    res.status(500).json({ error: "Error al obtener colores" });
  }
});

router.post("/colores", async (req, res) => {
  try {
    const { color } = req.body;
    const nuevoColor = await Color.create({ color });
    res.status(201).json(nuevoColor);
  } catch (error) {
    console.error("Error al crear color:", error);
    res.status(500).json({ error: "Error al crear color" });
  }
});

// Rutas para Talles
router.get("/talles", async (req, res) => {
  try {
    const talles = await Talle.findAll();
    res.json(talles);
  } catch (error) {
    console.error("Error al obtener talles:", error);
    res.status(500).json({ error: "Error al obtener talles" });
  }
});

router.post("/talles", async (req, res) => {
  try {
    const { talle } = req.body;
    const nuevoTalle = await Talle.create({ talle });
    res.status(201).json(nuevoTalle);
  } catch (error) {
    console.error("Error al crear talle:", error);
    res.status(500).json({ error: "Error al crear talle" });
  }
});

// Rutas para Telas
router.get("/telas", async (req, res) => {
  try {
    const telas = await Tela.findAll();
    res.json(telas);
  } catch (error) {
    console.error("Error al obtener telas:", error);
    res.status(500).json({ error: "Error al obtener telas" });
  }
});

router.post("/telas", async (req, res) => {
  try {
    const { tela } = req.body;
    const nuevaTela = await Tela.create({ tela });
    res.status(201).json(nuevaTela);
  } catch (error) {
    console.error("Error al crear tela:", error);
    res.status(500).json({ error: "Error al crear tela" });
  }
});

// Rutas para Categorías
router.get("/categorias", async (req, res) => {
  try {
    const categorias = await CategoriaIndumentaria.findAll();
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

router.post("/categorias", async (req, res) => {
  try {
    const { categoria } = req.body;
    const nuevaCategoria = await CategoriaIndumentaria.create({ categoria });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: "Error al crear categoría" });
  }
});

// Rutas para Estados de Indumentaria
router.get("/estados-indumentaria", async (req, res) => {
  try {
    const estados = await EstadoIndumentaria.findAll();
    res.json(estados);
  } catch (error) {
    console.error("Error al obtener estados de indumentaria:", error);
    res.status(500).json({ error: "Error al obtener estados de indumentaria" });
  }
});

router.post("/estados-indumentaria", async (req, res) => {
  try {
    const { estado } = req.body;
    const nuevoEstado = await EstadoIndumentaria.create({ estado });
    res.status(201).json(nuevoEstado);
  } catch (error) {
    console.error("Error al crear estado de indumentaria:", error);
    res.status(500).json({ error: "Error al crear estado de indumentaria" });
  }
});

// Rutas para Precios
router.get("/precios", async (req, res) => {
  try {
    const precios = await PrecioIndumentaria.findAll();
    res.json(precios);
  } catch (error) {
    console.error("Error al obtener precios:", error);
    res.status(500).json({ error: "Error al obtener precios" });
  }
});

router.post("/precios", async (req, res) => {
  try {
    const { precio } = req.body;
    const nuevoPrecio = await PrecioIndumentaria.create({ precio });
    res.status(201).json(nuevoPrecio);
  } catch (error) {
    console.error("Error al crear precio:", error);
    res.status(500).json({ error: "Error al crear precio" });
  }
});

// Rutas para Nombres de Indumentaria
router.get("/nombres-indumentaria", async (req, res) => {
  try {
    const nombres = await NombreIndumentaria.findAll();
    res.json(nombres);
  } catch (error) {
    console.error("Error al obtener nombres de indumentaria:", error);
    res.status(500).json({ error: "Error al obtener nombres de indumentaria" });
  }
});

router.post("/nombres-indumentaria/find-or-create", async (req, res) => {
  try {
    const { nombre } = req.body;
    const [nombreIndumentaria, created] = await NombreIndumentaria.findOrCreate(
      {
        where: { nombre },
        defaults: { nombre },
      }
    );
    res.json(nombreIndumentaria);
  } catch (error) {
    console.error("Error al crear/encontrar nombre de indumentaria:", error);
    res
      .status(500)
      .json({ error: "Error al crear/encontrar nombre de indumentaria" });
  }
});

// Rutas para Tipos de Rol
router.get("/tiporoles", async (req, res) => {
  try {
    const tipoRoles = await TipoRol.findAll();
    res.json(tipoRoles);
  } catch (error) {
    console.error("Error al obtener tipos de rol:", error);
    res.status(500).json({ error: "Error al obtener tipos de rol" });
  }
});

// Rutas para Motivos de Cancelación
router.get("/motivos-cancelacion", async (req, res) => {
  try {
    const motivos = await MotivoCancelacion.findAll({
      attributes: ["idMotivo", "descripcion"],
      order: [["descripcion", "ASC"]],
    });
    res.json(motivos);
  } catch (error) {
    console.error("Error al obtener motivos de cancelación:", error);
    res.status(500).json({
      error: "Error al obtener motivos de cancelación",
      detalle: error.message,
    });
  }
});

// Rutas para Ciudades
router.get("/ciudades", async (req, res) => {
  try {
    const ciudades = await Ciudad.findAll({
      order: [["nombreCiudad", "ASC"]],
    });
    res.json(ciudades);
  } catch (error) {
    console.error("Error al obtener ciudades:", error);
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

router.post("/ciudades/find-or-create", async (req, res) => {
  try {
    const { nombreCiudad, codigoPostal } = req.body;
    if (!nombreCiudad) {
      return res.status(400).json({ error: "Nombre de Localidad requerido" });
    }

    // Primero busca una ciudad con el mismo nombre y código postal
    let ciudad = await Ciudad.findOne({
      where: {
        nombreCiudad,
        codigoPostal: codigoPostal || "",
      },
    });

    // Si no existe, créala
    if (!ciudad) {
      ciudad = await Ciudad.create({
        nombreCiudad,
        codigoPostal: codigoPostal || "",
      });
      console.log(
        `Ciudad creada: ${nombreCiudad} (CP: ${codigoPostal || "N/A"})`
      );
    } else {
      console.log(
        `Ciudad encontrada: ${nombreCiudad} (ID: ${ciudad.idCiudad})`
      );
    }

    res.json({
      idCiudad: ciudad.idCiudad,
      nombreCiudad: ciudad.nombreCiudad,
      codigoPostal: ciudad.codigoPostal,
    });
  } catch (error) {
    console.error("Error al crear/encontrar ciudad:", error);
    res.status(500).json({ error: "Error al crear/encontrar ciudad" });
  }
});

// Rutas para Barrios
router.get("/barrios", async (req, res) => {
  try {
    const barrios = await Barrio.findAll({
      include: [{ model: Ciudad, as: "Ciudad" }],
      order: [["nombreBarrio", "ASC"]],
    });
    res.json(barrios);
  } catch (error) {
    console.error("Error al obtener barrios:", error);
    res.status(500).json({ error: "Error al obtener barrios" });
  }
});

router.post("/barrios/find-or-create", async (req, res) => {
  try {
    const { nombreBarrio, idCiudad } = req.body;
    if (!nombreBarrio || !idCiudad) {
      return res.status(400).json({
        error: "Nombre de barrio y ID de ciudad son requeridos",
      });
    }

    // Primero busca un barrio con el mismo nombre y ciudad
    let barrio = await Barrio.findOne({
      where: {
        nombreBarrio,
        idCiudad,
      },
    });

    // Si no existe, créalo
    if (!barrio) {
      barrio = await Barrio.create({
        nombreBarrio,
        idCiudad,
      });
      console.log(`Barrio creado: ${nombreBarrio} (Ciudad ID: ${idCiudad})`);
    } else {
      console.log(
        `Barrio encontrado: ${nombreBarrio} (ID: ${barrio.idBarrio})`
      );
    }

    res.json({
      idBarrio: barrio.idBarrio,
      nombreBarrio: barrio.nombreBarrio,
      idCiudad: barrio.idCiudad,
    });
  } catch (error) {
    console.error("Error al crear/encontrar barrio:", error);
    res.status(500).json({ error: "Error al crear/encontrar barrio" });
  }
});

// Rutas para Unidades de Medida
router.get("/unidades-medida", async (req, res) => {
  try {
    const unidades = await UnidadMedida.findAll({
      order: [["nombreUnidad", "ASC"]],
    });
    res.json(unidades);
  } catch (error) {
    console.error("Error al obtener unidades de medida:", error);
    res.status(500).json({ error: "Error al obtener unidades de medida" });
  }
});

router.post("/unidades-medida", async (req, res) => {
  try {
    const { nombreUnidad, abreviatura } = req.body;
    const nuevaUnidad = await UnidadMedida.create({
      nombreUnidad,
      abreviatura,
    });
    res.status(201).json(nuevaUnidad);
  } catch (error) {
    console.error("Error al crear unidad de medida:", error);
    res.status(500).json({ error: "Error al crear unidad de medida" });
  }
});

router.put("/unidades-medida/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUnidad, abreviatura } = req.body;

    const unidad = await UnidadMedida.findByPk(id);
    if (!unidad) {
      return res.status(404).json({ error: "Unidad de medida no encontrada" });
    }

    await unidad.update({ nombreUnidad, abreviatura });
    res.json(unidad);
  } catch (error) {
    console.error("Error al actualizar unidad de medida:", error);
    res.status(500).json({ error: "Error al actualizar unidad de medida" });
  }
});

router.delete("/unidades-medida/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const unidad = await UnidadMedida.findByPk(id);

    if (!unidad) {
      return res.status(404).json({ error: "Unidad de medida no encontrada" });
    }

    await unidad.destroy();
    res.json({ message: "Unidad de medida eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar unidad de medida:", error);
    res.status(500).json({ error: "Error al eliminar unidad de medida" });
  }
});

// Endpoint para buscar o crear detalle de indumentaria
router.post("/detalle-indumentaria/find-or-create", async (req, res) => {
  try {
    const {
      idNombre,
      idPrecio,
      idCategoria,
      idColor,
      idTalle,
      idEstado,
      idTela,
      idUnidadMedida,
    } = req.body;

    // Buscar si ya existe un detalle con estas características
    let detalle = await DetalleIndumentaria.findOne({
      where: {
        idNombre,
        idPrecio,
        idCategoria,
        idColor,
        idTalle,
        idEstado,
        idTela,
        idUnidadMedida,
      },
    });

    // Si no existe, crear uno nuevo
    if (!detalle) {
      detalle = await DetalleIndumentaria.create({
        idNombre,
        idPrecio,
        idCategoria,
        idColor,
        idTalle,
        idEstado,
        idTela,
        idUnidadMedida,
        cantidadIndumentaria: 0, // Inicializar en 0
      });
    }

    res.json(detalle);
  } catch (error) {
    console.error("Error al buscar o crear detalle de indumentaria:", error);
    res
      .status(500)
      .json({ error: "Error al procesar detalle de indumentaria" });
  }
});

// Endpoint para actualizar precio de un detalle de indumentaria
router.put("/detalle-indumentaria/:id/precio", async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;

    const detalle = await DetalleIndumentaria.findByPk(id);

    if (!detalle) {
      return res
        .status(404)
        .json({ error: "Detalle de indumentaria no encontrado" });
    }

    // Buscar o crear el precio
    const [precioObj] = await PrecioIndumentaria.findOrCreate({
      where: { precio },
      defaults: { precio },
    });

    // Actualizar el detalle con el nuevo precio
    await detalle.update({ idPrecio: precioObj.idPrecio });

    res.json({ message: "Precio actualizado correctamente", detalle });
  } catch (error) {
    console.error("Error al actualizar precio del detalle:", error);
    res.status(500).json({ error: "Error al actualizar precio del detalle" });
  }
});

module.exports = router;
