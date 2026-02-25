const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/database");

// Obtener clientes con más pedidos (solo pedidos finalizados - estado 5)
router.get("/clientes-mas-pedidos", async (req, res) => {
  try {
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
      WHERE ped.idEstado = 5
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
      WHERE
          r.idRack != 99
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

// Obtener tendencias estratégicas por categoría (nuevo endpoint)
router.get("/tendencias-categorias", async (req, res) => {
  try {
    // Obtener el parámetro de meses (por defecto 12)
    const meses = parseInt(req.query.meses) || 12;
    
    const [result] = await sequelize.query(`
      WITH PeriodosReales AS (
        -- Generar períodos basados en datos reales de pedidos
        SELECT DISTINCT
          CONCAT(YEAR(p.fechaPedido), '-', LPAD(MONTH(p.fechaPedido), 2, '0')) AS periodo,
          YEAR(p.fechaPedido) AS anio,
          MONTH(p.fechaPedido) AS mes
        FROM pedido p
        WHERE 
          p.estaActivo = 1 
          AND p.idEstado != 6
          AND p.fechaPedido >= DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH)
      ),
      PeriodosCompletos AS (
        -- Completar con períodos faltantes
        SELECT 
          DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL n.num MONTH), '%Y-%m') AS periodo,
          YEAR(DATE_SUB(CURDATE(), INTERVAL n.num MONTH)) AS anio,
          MONTH(DATE_SUB(CURDATE(), INTERVAL n.num MONTH)) AS mes
        FROM (
          SELECT 0 AS num ${Array.from({length: meses}, (_, i) => `UNION SELECT ${i + 1}`).join(' ')}
        ) n
      ),
      TodosLosPeriodos AS (
        -- Unir períodos reales y completos (sin duplicados)
        SELECT periodo, anio, mes FROM PeriodosReales
        UNION
        SELECT periodo, anio, mes FROM PeriodosCompletos
      ),
      CategoriasActivas AS (
        SELECT DISTINCT ci.categoria
        FROM pedido p
        JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
        JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
        JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
        JOIN CategoriaIndumentaria ci ON di.idCategoria = ci.idCategoria
        WHERE p.estaActivo = 1 AND p.idEstado != 6
      ),
      CrucePeriodosCategories AS (
        SELECT 
          pc.periodo, pc.anio, pc.mes, ca.categoria
        FROM TodosLosPeriodos pc
        CROSS JOIN CategoriasActivas ca
      ),
      VentasPorCategoriaMes AS (
        SELECT
          ci.categoria,
          YEAR(p.fechaPedido) AS anio,
          MONTH(p.fechaPedido) AS mes,
          CONCAT(YEAR(p.fechaPedido), '-', 
                 LPAD(MONTH(p.fechaPedido), 2, '0')) AS periodo,
          SUM(dp.cantidad) AS total_vendido,
          COUNT(DISTINCT p.numeroPedido) AS total_pedidos,
          COUNT(DISTINCT i.codigoIndumentaria) AS productos_diferentes,
          COALESCE(ROUND(AVG(pr.precio), 2), 0) AS precio_promedio,
          COALESCE(SUM(dp.cantidad * pr.precio), 0) AS valor_total
        FROM
          pedido p
        JOIN detallepedido dp ON p.numeroPedido = dp.numeroPedido
        JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
        JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
        JOIN CategoriaIndumentaria ci ON di.idCategoria = ci.idCategoria
        JOIN PrecioIndumentaria pr ON di.idPrecio = pr.idPrecio
        WHERE
          p.estaActivo = 1 
          AND p.idEstado != 6
          AND p.fechaPedido >= DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH)
        GROUP BY
          ci.categoria, YEAR(p.fechaPedido), MONTH(p.fechaPedido)
      ),
      DatosCompletos AS (
        SELECT 
          cpc.categoria,
          cpc.anio,
          cpc.mes,
          cpc.periodo,
          COALESCE(v.total_vendido, 0) AS total_vendido,
          COALESCE(v.total_pedidos, 0) AS total_pedidos,
          COALESCE(v.productos_diferentes, 0) AS productos_diferentes,
          COALESCE(v.precio_promedio, 0) AS precio_promedio,
          COALESCE(v.valor_total, 0) AS valor_total
        FROM CrucePeriodosCategories cpc
        LEFT JOIN VentasPorCategoriaMes v ON cpc.categoria = v.categoria 
          AND cpc.periodo = v.periodo
      ),
      TendenciasConMetricas AS (
        SELECT 
          categoria,
          anio,
          mes,
          periodo,
          total_vendido,
          total_pedidos,
          productos_diferentes,
          precio_promedio,
          valor_total,
          -- Cálculo de tendencia (comparación con mes anterior)
          LAG(total_vendido, 1) OVER(PARTITION BY categoria ORDER BY anio, mes) AS vendido_anterior,
          -- Promedio móvil de 3 meses anteriores para cálculos más exactos
          AVG(total_vendido) OVER(
            PARTITION BY categoria 
            ORDER BY anio, mes 
            ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING
          ) AS promedio_anterior,
          -- Participación de la categoría en el total del mes
          CASE 
            WHEN SUM(total_vendido) OVER(PARTITION BY periodo) = 0 THEN 0
            ELSE ROUND(100.0 * total_vendido / SUM(total_vendido) OVER(PARTITION BY periodo), 2)
          END AS participacion_mes,
          -- Ranking de la categoría en el mes
          ROW_NUMBER() OVER(PARTITION BY periodo ORDER BY total_vendido DESC) AS ranking_mes
        FROM 
          DatosCompletos
      )
      SELECT
        categoria,
        anio,
        mes,
        periodo,
        total_vendido,
        total_pedidos,
        productos_diferentes,
        precio_promedio,
        valor_total,
        participacion_mes,
        ranking_mes,
        CASE 
          WHEN vendido_anterior IS NULL THEN 0
          -- Si el valor anterior es 0, usar promedio móvil como base
          WHEN vendido_anterior = 0 AND promedio_anterior > 0 THEN
            ROUND(((total_vendido - promedio_anterior) * 100.0 / promedio_anterior), 2)
          -- Si no hay promedio histórico, usar valor base mínimo de 1
          WHEN vendido_anterior = 0 AND (promedio_anterior IS NULL OR promedio_anterior = 0) THEN
            CASE 
              WHEN total_vendido > 0 THEN ROUND(((total_vendido - 1) * 100.0 / 1), 2)
              ELSE 0
            END
          -- Cálculo normal cuando hay valor anterior
          ELSE ROUND(((total_vendido - vendido_anterior) * 100.0 / vendido_anterior), 2)
        END AS tendencia_porcentual,
        CASE
          WHEN vendido_anterior IS NULL THEN 'NUEVO'
          -- Usar promedio móvil para determinar tendencia cuando valor anterior es 0
          WHEN vendido_anterior = 0 AND promedio_anterior > 0 THEN
            CASE
              WHEN total_vendido > promedio_anterior * 1.1 THEN 'CRECIMIENTO'
              WHEN total_vendido < promedio_anterior * 0.9 THEN 'DECREMENTO'
              ELSE 'ESTABLE'
            END
          -- Sin historial, solo comparar si hay actividad
          WHEN vendido_anterior = 0 AND (promedio_anterior IS NULL OR promedio_anterior = 0) THEN
            CASE
              WHEN total_vendido > 0 THEN 'CRECIMIENTO'
              ELSE 'ESTABLE'
            END
          -- Lógica normal con tolerancia del 5%
          WHEN total_vendido > vendido_anterior * 1.05 THEN 'CRECIMIENTO'
          WHEN total_vendido < vendido_anterior * 0.95 THEN 'DECREMENTO'
          ELSE 'ESTABLE'
        END AS direccion_tendencia
      FROM 
        TendenciasConMetricas
      ORDER BY 
        categoria, anio DESC, mes DESC;
    `);
    res.json(result);
  } catch (error) {
    console.error("Error en tendencias-categorias:", error);
    res.status(500).json({ error: "Error al obtener tendencias por categoría" });
  }
});

// Reporte: Porcentaje de cancelaciones por motivo
router.get("/cancelaciones-motivo", async (req, res) => {
  try {
    // Primero, verificar TODOS los estados de pedidos cancelados
    // ✅ Consulta: Análisis de cancelaciones por motivo
    // Incluye TODOS los pedidos con motivo de cancelación (sin filtro de estaActivo)
    const [result] = await sequelize.query(`
      WITH TotalCancelados AS (
        SELECT COUNT(*) AS total_general
        FROM pedido
        WHERE idMotivoCancelacion IS NOT NULL
      )
      SELECT
        mc.descripcion AS motivo,
        COUNT(p.numeroPedido) AS cantidad_de_pedidos,
        ROUND((COUNT(p.numeroPedido) * 100.0 / (SELECT total_general FROM TotalCancelados)), 2) AS porcentaje
      FROM pedido p
      JOIN motivo_cancelacion mc ON p.idMotivoCancelacion = mc.idMotivo
      WHERE p.idMotivoCancelacion IS NOT NULL
      GROUP BY mc.idMotivo, mc.descripcion
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

// Reporte: Tendencias de empresas de envío
router.get("/tendencias-empresas-envio", async (req, res) => {
  try {
    // Obtener filtro de tiempo (3, 6, 12 meses - por defecto 12)
    const meses = parseInt(req.query.meses) || 12;
    
    const [result] = await sequelize.query(`
      SELECT
        T_ACTUAL.Mes,
        T_ACTUAL.EmpresaEnvio,
        T_ACTUAL.TotalPedidos,
        
        -- Utiliza el TotalPedidos de la tabla anterior (T_ANTERIOR).
        -- Si no hay registro anterior (ej. primer mes), se usa COALESCE para poner 0.
        COALESCE(T_ANTERIOR.TotalPedidos, 0) AS PedidosMesAnterior,
        
        -- CALCULA LA DIFERENCIA (Actual - Anterior)
        T_ACTUAL.TotalPedidos - COALESCE(T_ANTERIOR.TotalPedidos, 0) AS Diferencia,
        
        -- CALCULA EL PORCENTAJE DE CRECIMIENTO INTERMENSUAL
        CASE
          -- El denominador debe ser PedidosMesAnterior y debe ser > 0 para evitar error
          WHEN COALESCE(T_ANTERIOR.TotalPedidos, 0) > 0 THEN 
            ROUND((
              (T_ACTUAL.TotalPedidos - T_ANTERIOR.TotalPedidos) 
              / T_ANTERIOR.TotalPedidos
            ) * 100, 2)
          ELSE 
            NULL -- No se puede calcular la tendencia si el mes anterior fue 0
        END AS PorcentajeCrecimiento

      FROM (
        -- TABLA A (T_ACTUAL): Conteo de pedidos por Mes y Empresa (ACTUAL)
        SELECT
          DATE_FORMAT(p.fechaPedido, '%Y-%m') AS Mes,
          e.nombre AS EmpresaEnvio,
          COUNT(p.numeroPedido) AS TotalPedidos
        FROM 
          pedido p
        JOIN 
          empresa_envio e ON p.idEmpresaEnvio = e.idEmpresaEnvio
        WHERE
          p.fechaPedido >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH), '%Y-%m-01') -- Filtro desde inicio del mes
          AND p.estaActivo = 1
          AND p.idEstado != 6
        GROUP BY 
          Mes, EmpresaEnvio
      ) AS T_ACTUAL
      -- AUTOUNIÓN (SELF-JOIN)
      LEFT JOIN (
        -- TABLA B (T_ANTERIOR): Conteo de pedidos por Mes y Empresa (MES ANTERIOR)
        SELECT
          DATE_FORMAT(p.fechaPedido, '%Y-%m') AS MesAnterior,
          e.nombre AS EmpresaEnvio,
          COUNT(p.numeroPedido) AS TotalPedidos
        FROM 
          pedido p
        JOIN 
          empresa_envio e ON p.idEmpresaEnvio = e.idEmpresaEnvio
        WHERE
          -- Restringe el rango de fechas para no sobrecargar el JOIN
          p.fechaPedido >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ${meses + 1} MONTH), '%Y-%m-01') 
          AND p.estaActivo = 1
          AND p.idEstado != 6
        GROUP BY 
          MesAnterior, EmpresaEnvio
      ) AS T_ANTERIOR ON 
        -- 1. Une por la MISMA EMPRESA
        T_ACTUAL.EmpresaEnvio = T_ANTERIOR.EmpresaEnvio AND
        -- 2. Une cuando el MES ANTERIOR sea exactamente 1 mes antes que el MES ACTUAL
        DATE_FORMAT(DATE_SUB(STR_TO_DATE(CONCAT(T_ACTUAL.Mes, '-01'), '%Y-%m-%d'), INTERVAL 1 MONTH), '%Y-%m') = T_ANTERIOR.MesAnterior

      ORDER BY T_ACTUAL.EmpresaEnvio, T_ACTUAL.Mes;
    `);
    
    console.log(`📈 Tendencias empresas envío con crecimiento (${meses} meses): ${result.length} registros`);
    res.json(result);
  } catch (error) {
    console.error("Error en tendencias-empresas-envio:", error);
    res.status(500).json({ error: "Error al obtener tendencias de empresas de envío" });
  }
});

module.exports = router;
