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

// Obtener todos los pedidos 'Abonado' (idEstado = 3) para despacho
router.get("/pendientes", verificarAccesoEnvios, async (req, res) => {
  try {
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
        ee.nombre AS empresaEnvio
      FROM pedido p
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN persona pe ON c.idPersona = pe.idPersona
      JOIN domicilio d ON pe.idDomicilio = d.idDomicilio
      JOIN ciudad ci ON d.idCiudad = ci.idCiudad
      JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
      LEFT JOIN empresa_envio ee ON p.idEmpresaEnvio = ee.idEmpresaEnvio
      WHERE p.idEstado = 3 AND p.estaActivo = 1
      GROUP BY p.numeroPedido, c.email, pe.nombre, pe.apellido, p.fechaPedido, direccion_envio, p.codigoSeguimiento, p.idEmpresaEnvio, ee.nombre
      ORDER BY p.fechaPedido DESC
    `);
    
    console.log(`📦 Pedidos pendientes de envío: ${result.length}`);
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
    
    // Actualiza el pedido (idEstado = 4 significa "Despachado")
    const [updated] = await Pedido.update(
      { 
        codigoSeguimiento, 
        idEstado: 4, 
        fechaModificacion: new Date() 
      },
      { where: { numeroPedido, estaActivo: 1 } }
    );
    
    if (updated === 0) {
      return res.status(404).json({ error: "Pedido no encontrado o no se pudo actualizar" });
    }
    
    console.log(`📦 Pedido ${numeroPedido} despachado con código: ${codigoSeguimiento}`);
    res.json({ 
      success: true, 
      message: "Pedido despachado correctamente",
      numeroPedido,
      codigoSeguimiento
    });
  } catch (error) {
    console.error("Error al despachar el pedido:", error);
    res.status(500).json({ error: "Error al despachar el pedido" });
  }
});

module.exports = router;
