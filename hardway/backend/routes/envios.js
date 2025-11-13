const express = require('express');
const router = express.Router();
const { verificarAccesoEnvios } = require('../middleware/auth');
const { 
  Pedido,
  Cliente,
  Persona,
  DetallePedido,
  sequelize 
} = require('../models');
const { Domicilio, Ciudad } = require('../models/Ubicacion');

// Obtener todos los pedidos 'Abonado' (idEstado = 3) y 'Despachado' (idEstado = 4) para despacho
router.get("/pendientes", verificarAccesoEnvios, async (req, res) => {
  try {
    const { rol, legajoPicker } = req.query;
    
    // Si es Picker, solo traer sus pedidos asignados
    let whereClause = 'p.idEstado IN (3, 4) AND p.estaActivo = 1';
    if (rol === 'Picker' && legajoPicker) {
      whereClause += ` AND ap.legajoPicker = '${legajoPicker}'`;
    }
    
    const [result] = await sequelize.query(`
      SELECT
        p.numeroPedido,
        p.fechaPedido,
        c.email AS cliente_email,
        pe.nombre,
        pe.apellido,
        CONCAT(d.calle, ' ', d.altura, ', ', ci.nombreCiudad) AS direccion_envio,
        SUM(dp.cantidad) AS total_items,
        p.codigoSeguimiento,
        p.idEmpresaEnvio,
        ee.nombre AS empresaEnvio,
        p.idEstado,
        ap.legajoPicker AS despachadorAsignado,
        CONCAT(p_picker.nombre, ' ', COALESCE(p_picker.apellido, '')) AS nombreDespachador
      FROM pedido p
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN persona pe ON c.idPersona = pe.idPersona
      JOIN domicilio d ON pe.idDomicilio = d.idDomicilio
      JOIN ciudad ci ON d.idCiudad = ci.idCiudad
      JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
      LEFT JOIN empresa_envio ee ON p.idEmpresaEnvio = ee.idEmpresaEnvio
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = ap.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN persona p_picker ON ep.idPersona = p_picker.idPersona
      WHERE ${whereClause}
      GROUP BY p.numeroPedido, c.email, pe.nombre, pe.apellido, p.fechaPedido, direccion_envio, 
               p.codigoSeguimiento, p.idEmpresaEnvio, ee.nombre, p.idEstado, 
               ap.legajoPicker, p_picker.nombre, p_picker.apellido
      ORDER BY p.fechaPedido DESC
    `);
    
    console.log(`📦 Pedidos para envío: ${result.length} (Abonados + Despachados)`);
    console.log(`   - Rol: ${rol || 'Administrador'}`);
    if (legajoPicker) {
      console.log(`   - Filtrado por despachador: ${legajoPicker}`);
    }
    console.log(`   - Pendientes: ${result.filter(p => p.idEstado === 3).length}`);
    console.log(`   - Despachados: ${result.filter(p => p.idEstado === 4).length}`);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener pedidos para despacho:", error);
    res.status(500).json({ error: "Error al obtener pedidos para despacho" });
  }
});

// Marcar pedido como despachado y guardar código de seguimiento
router.put("/despachar/:numeroPedido", verificarAccesoEnvios, async (req, res) => {
  try {
    const { codigoSeguimiento } = req.body;
    const { numeroPedido } = req.params;
    
    if (!codigoSeguimiento) {
      return res.status(400).json({ error: "El código de seguimiento es requerido" });
    }
    
    // Iniciar transacción para actualizar ambas tablas
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Actualizar el pedido (idEstado = 4 significa "Despachado")
      const [updated] = await Pedido.update(
        { 
          codigoSeguimiento, 
          idEstado: 4, 
          fechaModificacion: new Date() 
        },
        { 
          where: { numeroPedido, estaActivo: 1 },
          transaction
        }
      );
      
      if (updated === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: "Pedido no encontrado o no se pudo actualizar" });
      }
      
      // 2. Actualizar la asignación de picking más reciente con el flag despachado
      const [asignacionResult] = await sequelize.query(`
        UPDATE asignacion_picking
        SET despachado = 1, 
            fechaDespachado = NOW()
        WHERE numeroPedido = :numeroPedido
          AND idAsignacion = (
            SELECT MAX(ap2.idAsignacion) 
            FROM (SELECT * FROM asignacion_picking) ap2 
            WHERE ap2.numeroPedido = :numeroPedido
          )
      `, {
        replacements: { numeroPedido },
        transaction
      });
      
      await transaction.commit();
      
      console.log(`📦 Pedido ${numeroPedido} despachado con código: ${codigoSeguimiento}`);
      console.log(`✅ Asignación actualizada: despachado=1, fechaDespachado registrada`);
      
      res.json({ 
        success: true, 
        message: "Pedido despachado correctamente",
        numeroPedido,
        codigoSeguimiento
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al despachar el pedido:", error);
    res.status(500).json({ error: "Error al despachar el pedido" });
  }
});

// Actualizar código de seguimiento de un pedido ya despachado
router.put("/actualizar-codigo/:numeroPedido", verificarAccesoEnvios, async (req, res) => {
  try {
    const { codigoSeguimiento } = req.body;
    const { numeroPedido } = req.params;
    
    if (!codigoSeguimiento) {
      return res.status(400).json({ error: "El código de seguimiento es requerido" });
    }
    
    // Verificar que el pedido esté despachado (idEstado = 4)
    const pedido = await Pedido.findOne({
      where: { numeroPedido, estaActivo: 1, idEstado: 4 }
    });
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado o no está despachado" });
    }
    
    // Actualizar solo el código de seguimiento
    const [updated] = await Pedido.update(
      { 
        codigoSeguimiento, 
        fechaModificacion: new Date() 
      },
      { 
        where: { numeroPedido, estaActivo: 1 }
      }
    );
    
    if (updated === 0) {
      return res.status(404).json({ error: "No se pudo actualizar el código de seguimiento" });
    }
    
    console.log(`✏️ Código de seguimiento actualizado para pedido ${numeroPedido}: ${codigoSeguimiento}`);
    
    res.json({ 
      success: true, 
      message: "Código de seguimiento actualizado correctamente",
      numeroPedido,
      codigoSeguimiento
    });
  } catch (error) {
    console.error("Error al actualizar código de seguimiento:", error);
    res.status(500).json({ error: "Error al actualizar código de seguimiento" });
  }
});

module.exports = router;
