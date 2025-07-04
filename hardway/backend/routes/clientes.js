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
    const clientesFormateados = clientes.map((c) => {
      const clienteFormateado = {
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
        estaActivo: c.estaActivo || 1, // Mapear el estado activo
      };
      
      
      return clienteFormateado;
    });

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
        estaActivo: 1, // Cliente activo por defecto
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

// Dar de baja a un cliente (cambiar estaActivo a 0)
router.put("/:id/baja", async (req, res) => {
  const { id } = req.params;
  console.log(`🔄 Intentando dar de baja al cliente con ID: ${id}`);
  
  try {
    // Primero verificamos si el cliente existe
    const clienteExistente = await Cliente.findByPk(id);
    if (!clienteExistente) {
      console.log(`❌ Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    console.log(`✅ Cliente encontrado: ${clienteExistente.idCliente}, Estado actual: ${clienteExistente.estaActivo}`);
    
    const [updated] = await Cliente.update(
      { estaActivo: 0 },
      { where: { idCliente: id } }
    );
    
    console.log(`📝 Filas actualizadas: ${updated}`);
    
    if (updated) {
      console.log(`✅ Cliente ${id} dado de baja exitosamente`);
      res.json({ 
        success: true, 
        message: "Cliente dado de baja exitosamente",
        idCliente: id 
      });
    } else {
      console.log(`❌ No se pudo actualizar el cliente ${id}`);
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error al dar de baja cliente:", error);
    res.status(500).json({ 
      error: "Error al dar de baja cliente", 
      detalle: error.message 
    });
  }
});

// Dar de alta a un cliente (cambiar estaActivo a 1)
router.put("/:id/alta", async (req, res) => {
  const { id } = req.params;
  console.log(`🔄 Intentando dar de alta al cliente con ID: ${id}`);
  
  try {
    // Primero verificamos si el cliente existe
    const clienteExistente = await Cliente.findByPk(id);
    if (!clienteExistente) {
      console.log(`❌ Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    console.log(`✅ Cliente encontrado: ${clienteExistente.idCliente}, Estado actual: ${clienteExistente.estaActivo}`);
    
    const [updated] = await Cliente.update(
      { estaActivo: 1 },
      { where: { idCliente: id } }
    );
    
    console.log(`📝 Filas actualizadas: ${updated}`);
    
    if (updated) {
      console.log(`✅ Cliente ${id} dado de alta exitosamente`);
      res.json({ 
        success: true, 
        message: "Cliente dado de alta exitosamente",
        idCliente: id 
      });
    } else {
      console.log(`❌ No se pudo actualizar el cliente ${id}`);
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error al dar de alta cliente:", error);
    res.status(500).json({ 
      error: "Error al dar de alta cliente", 
      detalle: error.message 
    });
  }
});

// Eliminar cliente (mantener por compatibilidad, pero ahora solo da de baja)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // En lugar de eliminar físicamente, damos de baja al cliente
    const [updated] = await Cliente.update(
      { estaActivo: 0 },
      { where: { idCliente: id } }
    );
    
    if (updated) {
      res.json({ 
        success: true, 
        message: "Cliente dado de baja exitosamente (borrado lógico)",
        idCliente: id 
      });
    } else {
      res.status(404).json({ error: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("Error al dar de baja cliente:", error);
    res.status(500).json({ 
      error: "Error al dar de baja cliente", 
      detalle: error.message 
    });
  }
});

module.exports = router;
