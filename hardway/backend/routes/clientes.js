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
      attributes: ['idCliente', 'idPersona', 'email', 'telefono', 'estaActivo'], // Especificar explícitamente los atributos
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
        estaActivo: c.estaActivo, // Mapear el estado activo sin valor por defecto
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
  const { idUsuario = 1 } = req.body; // ID del usuario que realiza la acción
  console.log(`🔄 Intentando dar de baja al cliente con ID: ${id}`);
  
  const t = await sequelize.transaction();
  
  try {
    // Primero verificamos si el cliente existe
    const clienteExistente = await Cliente.findByPk(id);
    if (!clienteExistente) {
      console.log(`❌ Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    console.log(`✅ Cliente encontrado: ${clienteExistente.idCliente}, Estado actual: ${clienteExistente.estaActivo}`);
    
    // Verificar si el cliente ya está inactivo
    if (clienteExistente.estaActivo === 0) {
      console.log(`⚠️ Cliente ${id} ya está inactivo`);
      await t.rollback();
      return res.json({ 
        success: true, 
        message: "Cliente ya está inactivo",
        idCliente: id 
      });
    }
    
    // PASO 1: Actualizar el estado del cliente
    await Cliente.update(
      { estaActivo: 0 },
      { where: { idCliente: id }, transaction: t }
    );
    
    // PASO 2: Registrar en el historial
    await sequelize.query(
      'INSERT INTO cliente_historial_estado (idCliente, idEstado, idUsuarioModifico, fechaCambio) VALUES (?, ?, ?, NOW())',
      {
        replacements: [id, 0, idUsuario],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );
    
    await t.commit();
    console.log(`✅ Cliente ${id} dado de baja exitosamente con registro en historial`);
    res.json({ 
      success: true, 
      message: "Cliente dado de baja exitosamente",
      idCliente: id 
    });
    
  } catch (error) {
    await t.rollback();
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
  const { idUsuario = 1 } = req.body; // ID del usuario que realiza la acción
  console.log(`🔄 Intentando dar de alta al cliente con ID: ${id}`);
  
  const t = await sequelize.transaction();
  
  try {
    // Primero verificamos si el cliente existe
    const clienteExistente = await Cliente.findByPk(id);
    if (!clienteExistente) {
      console.log(`❌ Cliente con ID ${id} no encontrado`);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    console.log(`✅ Cliente encontrado: ${clienteExistente.idCliente}, Estado actual: ${clienteExistente.estaActivo}`);
    
    // Verificar si el cliente ya está activo
    if (clienteExistente.estaActivo === 1) {
      console.log(`⚠️ Cliente ${id} ya está activo`);
      await t.rollback();
      return res.json({ 
        success: true, 
        message: "Cliente ya está activo",
        idCliente: id 
      });
    }
    
    // PASO 1: Actualizar el estado del cliente
    await Cliente.update(
      { estaActivo: 1 },
      { where: { idCliente: id }, transaction: t }
    );
    
    // PASO 2: Registrar en el historial
    await sequelize.query(
      'INSERT INTO cliente_historial_estado (idCliente, idEstado, idUsuarioModifico, fechaCambio) VALUES (?, ?, ?, NOW())',
      {
        replacements: [id, 1, idUsuario],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );
    
    await t.commit();
    console.log(`✅ Cliente ${id} dado de alta exitosamente con registro en historial`);
    res.json({ 
      success: true, 
      message: "Cliente dado de alta exitosamente",
      idCliente: id 
    });
    
  } catch (error) {
    await t.rollback();
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

// Obtener historial de cambios de estado de un cliente
router.get("/:id/historial", async (req, res) => {
  const { id } = req.params;
  console.log(`📊 Obteniendo historial de estado para cliente ID: ${id}`);
  
  try {
    const historial = await sequelize.query(
      `SELECT 
        h.idHistorial,
        h.idCliente,
        h.idEstado,
        e.descripcion AS estadoDescripcion,
        h.fechaCambio,
        h.idUsuarioModifico,
        COALESCE(CONCAT(p.nombre, ' ', p.apellido), 'Sistema') AS usuarioModifico
      FROM cliente_historial_estado h
      INNER JOIN cliente_estados e ON h.idEstado = e.idEstado
      LEFT JOIN usuario u ON h.idUsuarioModifico = u.idUsuario
      LEFT JOIN persona p ON u.idPersona = p.idPersona
      WHERE h.idCliente = ?
      ORDER BY h.fechaCambio DESC`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log(`✅ Historial obtenido: ${historial.length} registros`);
    res.json(historial);
    
  } catch (error) {
    console.error("❌ Error al obtener historial de cliente:", error);
    res.status(500).json({ 
      error: "Error al obtener historial de cliente", 
      detalle: error.message 
    });
  }
});

// Obtener estado actual de un cliente
router.get("/:id/estado", async (req, res) => {
  const { id } = req.params;
  console.log(`📊 Obteniendo estado actual para cliente ID: ${id}`);
  
  try {
    const estado = await sequelize.query(
      `SELECT 
        c.idCliente,
        c.estaActivo,
        e.descripcion AS estadoDescripcion,
        CONCAT(p.nombre, ' ', p.apellido) AS nombreCompleto,
        (SELECT MAX(h.fechaCambio) 
         FROM cliente_historial_estado h 
         WHERE h.idCliente = c.idCliente) AS ultimoCambio,
        (SELECT COUNT(*) 
         FROM cliente_historial_estado h 
         WHERE h.idCliente = c.idCliente) AS totalCambios
      FROM cliente c
      INNER JOIN persona p ON c.idPersona = p.idPersona
      INNER JOIN cliente_estados e ON c.estaActivo = e.idEstado
      WHERE c.idCliente = ?`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log(`✅ Estado obtenido para cliente ${id}`);
    res.json(estado[0] || null);
    
  } catch (error) {
    console.error("❌ Error al obtener estado de cliente:", error);
    res.status(500).json({ 
      error: "Error al obtener estado de cliente", 
      detalle: error.message 
    });
  }
});

// Obtener estadísticas generales de clientes
router.get("/estadisticas/estados", async (req, res) => {
  console.log(`📊 Obteniendo estadísticas de estados de clientes`);
  
  try {
    const estadisticas = await sequelize.query(
      `SELECT 
        e.idEstado,
        e.descripcion,
        COUNT(c.idCliente) AS totalClientes,
        ROUND((COUNT(c.idCliente) * 100.0 / (SELECT COUNT(*) FROM cliente)), 2) AS porcentaje
      FROM cliente_estados e
      LEFT JOIN cliente c ON e.idEstado = c.estaActivo
      GROUP BY e.idEstado, e.descripcion
      ORDER BY e.idEstado`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log(`✅ Estadísticas obtenidas: ${estadisticas.length} registros`);
    res.json(estadisticas);
    
  } catch (error) {
    console.error("❌ Error al obtener estadísticas de clientes:", error);
    res.status(500).json({ 
      error: "Error al obtener estadísticas de clientes", 
      detalle: error.message 
    });
  }
});

// Reactivar múltiples clientes en lote
router.put("/reactivar/lote", async (req, res) => {
  const { clientesIds, idUsuario = 1 } = req.body;
  console.log(`🔄 Reactivando clientes en lote: ${clientesIds}`);
  
  const t = await sequelize.transaction();
  
  try {
    if (!clientesIds || !Array.isArray(clientesIds) || clientesIds.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs de clientes" });
    }
    
    let clientesReactivados = 0;
    
    for (const clienteId of clientesIds) {
      // Solo reactivar si el cliente está inactivo
      const cliente = await Cliente.findByPk(clienteId);
      if (cliente && cliente.estaActivo === 0) {
        // Actualizar estado
        await Cliente.update(
          { estaActivo: 1 },
          { where: { idCliente: clienteId }, transaction: t }
        );
        
        // Registrar en historial
        await sequelize.query(
          'INSERT INTO cliente_historial_estado (idCliente, idEstado, idUsuarioModifico, fechaCambio) VALUES (?, ?, ?, NOW())',
          {
            replacements: [clienteId, 1, idUsuario],
            type: sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );
        
        clientesReactivados++;
      }
    }
    
    await t.commit();
    console.log(`✅ ${clientesReactivados} clientes reactivados en lote exitosamente`);
    res.json({ 
      success: true, 
      message: `${clientesReactivados} clientes reactivados exitosamente`,
      clientesReactivados: clientesReactivados,
      totalProcesados: clientesIds.length
    });
    
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al reactivar clientes en lote:", error);
    res.status(500).json({ 
      error: "Error al reactivar clientes en lote", 
      detalle: error.message 
    });
  }
});

module.exports = router;
