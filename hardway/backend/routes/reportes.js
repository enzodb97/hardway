const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/database");

// Obtener clientes con más pedidos
router.get("/clientes-mas-pedidos", async (req, res) => {
  try {
    // Excluir pedidos cancelados (idEstado = 6) si se solicita
    const incluirCancelados = req.query.incluirCancelados === "true";
    const whereEstado = incluirCancelados ? "" : "WHERE ped.idEstado != 6";
    const [result] = await sequelize.query(`
      SELECT
        c.idCliente,
        p.nombre,
        p.apellido,
        c.email,
        COUNT(DISTINCT ped.numeroPedido) AS total_pedidos,
        COALESCE(SUM(dp.cantidad * pr.precio), 0) AS total_valor
      FROM
        pedido ped
      JOIN
        cliente c ON ped.idCliente = c.idCliente
      JOIN
        persona p ON c.idPersona = p.idPersona
      JOIN
        detallepedido dp ON ped.numeroPedido = dp.numeroPedido
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        precioindumentaria pr ON di.idPrecio = pr.idPrecio
      ${whereEstado}
      GROUP BY
        c.idCliente, p.nombre, p.apellido, c.email
      ORDER BY
        total_valor DESC
      LIMIT 10
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en clientes-mas-pedidos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener clientes con más pedidos" });
  }
});

// Obtener stock actual
router.get("/stock-actual", async (req, res) => {
  try {
    console.log("Stock-actual: Iniciando consulta completa...");
    const [result] = await sequelize.query(`
      SELECT
          i.codigoIndumentaria AS codigo,
          ni.nombre AS producto,
          ta.talle,
          co.color,
          te.tipoTela AS tela,
          r.numeroRack AS rack,
          SUM(ms.cantidad) AS stock_actual
      FROM
          movimientostock ms
      JOIN
          stock s ON ms.idStock = s.idStock
      JOIN
          rack r ON s.idRack = r.idRack
      JOIN
          indumentaria i ON s.codigoIndumentaria = i.codigoIndumentaria
      JOIN
          detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
          nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
          talle ta ON di.idTalle = ta.idTalle
      JOIN
          color co ON di.idColor = co.idColor
      JOIN
          tela te ON di.idTela = te.idTela
      GROUP BY
          i.codigoIndumentaria,
          ni.nombre,
          ta.talle,
          co.color,
          te.tipoTela,
          r.numeroRack
      ORDER BY
          stock_actual ASC
    `);
    console.log("Stock-actual: Consulta exitosa, registros:", result.length);
    res.json(result);
  } catch (error) {
    console.error("Error en stock-actual:", error);
    res.status(500).json({ error: "Error al obtener reporte de stock" });
  }
});

// Obtener productos más pedidos
router.get("/productos-mas-pedidos", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        ni.nombre AS nombre_indumentaria,
        dp.codigoIndumentaria,
        SUM(dp.cantidad) AS cantidad_total_vendida,
        ta.talle,
        te.tipoTela AS tela,
        co.color
      FROM
        detallepedido dp
      JOIN
        pedido p ON dp.numeroPedido = p.numeroPedido
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
        talle ta ON di.idTalle = ta.idTalle
      JOIN
        tela te ON di.idTela = te.idTela
      JOIN
        color co ON di.idColor = co.idColor
      WHERE
        p.idEstado != 6
      GROUP BY
        dp.codigoIndumentaria,
        ni.nombre,
        ta.talle,
        te.tipoTela,
        co.color
      ORDER BY
        cantidad_total_vendida DESC
      LIMIT 10
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en productos-mas-pedidos:", error);
    res.status(500).json({ error: "Error al obtener productos más pedidos" });
  }
});

// Obtener ventas de los últimos 7 días
router.get("/ventas-ultimos-7-dias", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        DATE(p.fechaPedido) AS dia,
        SUM(pr.precio * dp.cantidad) AS total_ventas_del_dia
      FROM
        pedido p
      JOIN
        detallepedido dp ON p.numeroPedido = dp.numeroPedido
      JOIN
        indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN
        detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
        precioindumentaria pr ON di.idPrecio = pr.idPrecio
      WHERE
        p.fechaPedido >= CURDATE() - INTERVAL 7 DAY
        AND p.idEstado != 6
      GROUP BY
        dia
      ORDER BY
        dia ASC
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en ventas-ultimos-7-dias:", error);
    res
      .status(500)
      .json({ error: "Error al obtener ventas de la última semana" });
  }
});

// Alias para compatibilidad con el frontend
router.get("/ultima-semana-venta", async (req, res) => {
  // Redirigir a ventas-ultimos-7-dias
  req.url = "/ventas-ultimos-7-dias";
  router.handle(req, res);
});

module.exports = router;
