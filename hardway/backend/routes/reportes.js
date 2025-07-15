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
      WITH VentasConTemporada AS (
        SELECT
          CASE
            WHEN MONTH(p.fechaPedido) IN (12, 1, 2) THEN 'Verano'
            WHEN MONTH(p.fechaPedido) IN (3, 4, 5) THEN 'Otoño'
            WHEN MONTH(p.fechaPedido) IN (6, 7, 8) THEN 'Invierno'
            ELSE 'Primavera'
          END AS temporada,
          ni.nombre AS nombre_producto,
          i.codigoIndumentaria,
          ta.talle,
          te.tipoTela AS tela,
          co.color,
          SUM(dp.cantidad) AS total_vendido
        FROM
          pedido p
        JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
        JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
        JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
        JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
        JOIN talle ta ON di.idTalle = ta.idTalle
        JOIN tela te ON di.idTela = te.idTela
        JOIN color co ON di.idColor = co.idColor
        WHERE
          p.estaActivo = 1 AND p.idEstado != 6
        GROUP BY
          temporada, ni.nombre, i.codigoIndumentaria, ta.talle, te.tipoTela, co.color
      ),
      VentasRankeadas AS (
        SELECT
          temporada,
          nombre_producto,
          codigoIndumentaria,
          talle,
          tela,
          color,
          total_vendido,
          ROW_NUMBER() OVER(PARTITION BY temporada ORDER BY total_vendido DESC) AS ranking
        FROM
          VentasConTemporada
      )
      SELECT
        temporada,
        ranking,
        nombre_producto,
        codigoIndumentaria,
        talle,
        tela,
        color,
        total_vendido
      FROM
        VentasRankeadas
      WHERE
        ranking <= 10
      ORDER BY
        temporada, ranking;
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en productos-mas-pedidos:", error);
    res.status(500).json({ error: "Error al obtener productos más pedidos" });
  }
});

// Reporte: Porcentaje de cancelaciones por motivo
router.get("/cancelaciones-motivo", async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      WITH TotalCancelados AS (
        SELECT COUNT(*) AS total_general
        FROM pedido
        WHERE idMotivoCancelacion IS NOT NULL AND estaActivo = 0
      )
      SELECT
        mc.descripcion AS motivo,
        COUNT(p.numeroPedido) AS cantidad_de_pedidos,
        ROUND((COUNT(p.numeroPedido) * 100.0 / (SELECT total_general FROM TotalCancelados)), 2) AS porcentaje
      FROM pedido p
      JOIN motivo_cancelacion mc ON p.idMotivoCancelacion = mc.idMotivo
      WHERE p.idMotivoCancelacion IS NOT NULL AND p.estaActivo = 0
      GROUP BY mc.descripcion
      ORDER BY porcentaje DESC;
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en cancelaciones-motivo:", error);
    res
      .status(500)
      .json({ error: "Error al obtener reporte de cancelaciones por motivo" });
  }
});

module.exports = router;
