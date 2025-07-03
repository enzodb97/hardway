const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const { Cliente, Persona, Domicilio, Barrio, Ciudad, Pedido } = require('../models');

// Obtener todos los clientes
router.get("/", async (req, res) => {
  try {
    // Obtén todos los idPersona que están en la tabla usuario
    const usuarios = await sequelize.query(
      "SELECT idPersona FROM usuario WHERE idPersona IS NOT NULL"
    );
    const idsPersonasUsuarios = usuarios[0].map((u) => u.idPersona);

    // Busca solo los clientes cuyo idPersona NO está en la tabla usuario
    const clientes = await Cliente.findAll({
      where: idsPersonasUsuarios.length
        ? { idPersona: { [Sequelize.Op.notIn]: idsPersonasUsuarios } }
        : {},
      include: {
        model: Persona,
        attributes: ["dni", "nombre", "apellido", "direccion"],
        include: {
          model: Domicilio,
          attributes: [
            "calle",
            "altura",
            "piso",
            "departamento",
            "observaciones",
          ],
          include: [
            {
              model: Barrio,
              attributes: ["nombreBarrio"],
            },
            {
              model: Ciudad,
              attributes: ["nombreCiudad", "codigoPostal"],
            },
          ],
        },
      },
    });

    // Formatea la respuesta para el frontend
    const clientesFormateados = clientes.map((c) => ({
      id: c.idCliente,
      email: c.email || "",
      telefono: c.telefono || "",
      tipoDocumento: "DNI", // Tipo de documento por defecto
      numeroDocumento: String(c.Persona?.dni || ""), // Convertir a string
      nombre: (c.Persona?.nombre || "").trim(), // Eliminar espacios extra
      apellido: (c.Persona?.apellido || "").trim(),
      domicilio: c.Persona?.direccion || "",
      calle: c.Persona?.Domicilio?.calle || "",
      altura: c.Persona?.Domicilio?.altura || "",
      piso: c.Persona?.Domicilio?.piso || "",
      numeroDepartamento: c.Persona?.Domicilio?.departamento || "",
      observaciones: c.Persona?.Domicilio?.observaciones || "",
      barrio: c.Persona?.Domicilio?.Barrio?.nombreBarrio || "",
      localidad: c.Persona?.Domicilio?.Ciudad?.nombreCiudad || "", // Cambiado de ciudad a localidad
      ciudad: c.Persona?.Domicilio?.Ciudad?.nombreCiudad || "", // Mantener ambos para compatibilidad
      cp: c.Persona?.Domicilio?.Ciudad?.codigoPostal || "", // Cambiado de codigoPostal a cp
      codigoPostal: c.Persona?.Domicilio?.Ciudad?.codigoPostal || "", // Mantener ambos para compatibilidad
    }));

    res.json(clientesFormateados);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// Crear nuevo cliente
router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Crear domicilio
    const domicilio = await Domicilio.create(
      {
        calle: req.body.calle,
        altura: req.body.altura,
        piso: req.body.piso,
        departamento: req.body.numeroDepartamento,
        observaciones: req.body.observaciones,
        idBarrio: req.body.idBarrio,
        idCiudad: req.body.idCiudad,
      },
      { transaction: t }
    );

    // Crear persona
    const persona = await Persona.create(
      {
        dni: req.body.numeroDocumento,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        direccion: req.body.domicilio,
        idDomicilio: domicilio.idDomicilio,
      },
      { transaction: t }
    );

    // Crear cliente
    const cliente = await Cliente.create(
      {
        email: req.body.email,
        telefono: req.body.telefono,
        idPersona: persona.idPersona,
      },
      { transaction: t }
    );

    await t.commit();

    const clienteFormateado = {
      id: cliente.idCliente,
      email: cliente.email,
      telefono: cliente.telefono,
      numeroDocumento: persona.dni,
      nombre: persona.nombre,
      apellido: persona.apellido,
      domicilio: persona.direccion,
    };

    res.json(clienteFormateado);
  } catch (error) {
    await t.rollback();
    console.error("Error al crear cliente:", error);
    res
      .status(500)
      .json({ error: "Error al crear cliente", detalle: error.message });
  }
});

// Editar cliente
router.put("/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 1. Buscar cliente y persona
    const cliente = await Cliente.findByPk(req.params.id, { transaction: t });
    if (!cliente) {
      await t.rollback();
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const persona = await Persona.findByPk(cliente.idPersona, {
      transaction: t,
    });
    if (!persona) {
      await t.rollback();
      return res.status(404).json({ error: "Persona no encontrada" });
    }

    // 2. Actualizar domicilio
    await Domicilio.update(
      {
        calle: req.body.calle,
        altura: req.body.altura,
        piso: req.body.piso,
        departamento: req.body.numeroDepartamento,
        observaciones: req.body.observaciones,
        idBarrio: req.body.idBarrio,
        idCiudad: req.body.idCiudad,
      },
      { where: { idDomicilio: persona.idDomicilio }, transaction: t }
    );

    // 3. Actualizar persona
    await Persona.update(
      {
        dni: req.body.numeroDocumento,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        direccion: req.body.domicilio,
      },
      { where: { idPersona: persona.idPersona }, transaction: t }
    );

    // 4. Actualizar cliente
    await Cliente.update(
      {
        email: req.body.email,
        telefono: req.body.telefono,
      },
      { where: { idCliente: req.params.id }, transaction: t }
    );

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error("Error al editar cliente:", error);
    res
      .status(500)
      .json({ error: "Error al editar cliente", detalle: error.message });
  }
});

// Eliminar cliente
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Verifica si tiene pedidos asociados
    const pedidos = await Pedido.findAll({ where: { idCliente: id } });
    if (pedidos.length > 0) {
      return res
        .status(400)
        .json({ error: "No se puede eliminar: cliente tiene pedidos asociados" });
    }
    
    const deleted = await Cliente.destroy({ where: { idCliente: id } });
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar cliente", detalle: error.message });
  }
});

module.exports = router;
