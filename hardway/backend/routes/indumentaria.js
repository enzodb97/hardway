const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const { 
  Indumentaria,
  DetalleIndumentaria,
  NombreIndumentaria,
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  UnidadMedida,
  Stock,
  MovimientoStock,
  Rack,
  MotivoNoApta,
  StockRegistroFallo,
  sequelize
} = require('../models');

// Rutas de Racks
router.get("/racks", async (req, res) => {
  try {
    const racks = await Rack.findAll({
      order: [['numeroRack', 'ASC']]
    });
    res.json(racks);
  } catch (error) {
    console.error('Error al obtener racks:', error);
    res.status(500).json({ error: 'Error al obtener racks', detalle: error.message });
  }
});

// Obtener racks disponibles para registro/edición (excluye rack de No Apta)
router.get("/racks/disponibles", async (req, res) => {
  try {
    const racks = await Rack.findAll({
      where: {
        idRack: { [Op.ne]: 99 } // Excluir el rack de indumentaria no apta
      },
      order: [['numeroRack', 'ASC']]
    });
    res.json(racks);
  } catch (error) {
    console.error('Error al obtener racks disponibles:', error);
    res.status(500).json({ error: 'Error al obtener racks disponibles', detalle: error.message });
  }
});

// Obtener motivos predefinidos para marcar como No Apta
router.get("/motivos-no-apta", async (req, res) => {
  try {
    const motivos = await MotivoNoApta.findAll({
      order: [['idMotivo', 'ASC']]
    });
    res.json(motivos);
  } catch (error) {
    console.error('Error al obtener motivos de no apta:', error);
    res.status(500).json({ error: 'Error al obtener motivos', detalle: error.message });
  }
});

// Obtener un rack por ID
router.get("/racks/:id", async (req, res) => {
  try {
    const rack = await Rack.findByPk(req.params.id);
    if (!rack) {
      return res.status(404).json({ error: 'Rack no encontrado' });
    }
    res.json(rack);
  } catch (error) {
    console.error('Error al obtener rack:', error);
    res.status(500).json({ error: 'Error al obtener rack', detalle: error.message });
  }
});

// Crear nuevo rack
router.post("/racks", async (req, res) => {
  const { numeroRack, descripcion } = req.body;
  
  const t = await sequelize.transaction();
  try {
    const nuevoRack = await Rack.create({
      numeroRack,
      descripcion
    }, { transaction: t });

    await t.commit();
    res.status(201).json(nuevoRack);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear rack:', error);
    res.status(500).json({ error: 'Error al crear rack', detalle: error.message });
  }
});

// Obtener el siguiente código autoincremental
router.get("/siguiente-codigo", async (req, res) => {
  try {
    // Obtener el último código de indumentaria que comience con "IND"
    const ultimaIndumentaria = await Indumentaria.findOne({
      where: {
        codigoIndumentaria: {
          [Op.like]: 'IND%'
        }
      },
      order: [
        [Sequelize.literal("CAST(SUBSTRING(codigoIndumentaria, 4) AS UNSIGNED)"), 'DESC']
      ],
      limit: 1
    });

    let siguienteNumero = 1;
    
    if (ultimaIndumentaria) {
      const ultimoCodigo = ultimaIndumentaria.codigoIndumentaria;
      // Extraer el número después de "IND"
      const numeroActual = parseInt(ultimoCodigo.substring(3));
      siguienteNumero = numeroActual + 1;
    }

    // Formatear con ceros a la izquierda (3 dígitos)
    const siguienteCodigo = `IND${siguienteNumero.toString().padStart(3, '0')}`;
    
    res.json({ siguienteCodigo });
  } catch (error) {
    console.error('Error al generar siguiente código:', error);
    res.status(500).json({ error: 'Error al generar código', detalle: error.message });
  }
});

// Obtener toda la indumentaria
router.get("/", async (req, res) => {
  try {
    const indumentaria = await Indumentaria.findAll({
      include: [
        {
          model: DetalleIndumentaria,
          as: "DetalleIndumentarium",
          include: [
            { model: NombreIndumentaria, as: "NombreIndumentarium" },
            { model: Color },
            { model: Talle },
            { model: Tela, as: "TelaIndumentarium" },
            { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
            { model: EstadoIndumentaria, as: "EstadoIndumentarium" },
            { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
            { model: UnidadMedida, as: "UnidadMedidum" },
          ],
        },
        {
          model: Stock,
          where: {
            idRack: { [Op.ne]: 99 } // Excluir el rack de No Aptos
          },
          required: false, // LEFT JOIN para permitir indumentaria sin stock
          include: [
            { model: MovimientoStock },
            { model: Rack },
          ],
        },
      ],
    });

    // Calcular stock actual para cada indumentaria
    const indumentariaConStock = indumentaria.map(item => {
      const itemJson = item.toJSON();
      
      // Calcular stock disponible (ya filtrado para excluir rack No Apto)
      let stockDisponible = 0;
      if (item.Stock && item.Stock.MovimientoStocks) {
        stockDisponible = item.Stock.MovimientoStocks.reduce((total, movimiento) => {
          return total + (movimiento.cantidad || 0);
        }, 0);
      }

      // Agregar el stock calculado al DetalleIndumentarium
      if (itemJson.DetalleIndumentarium) {
        itemJson.DetalleIndumentarium.cantidadIndumentaria = stockDisponible;
      }

      return itemJson;
    });

    res.json(indumentariaConStock);
  } catch (error) {
    console.error("Error al obtener indumentaria:", error);
    res.status(500).json({ error: "Error al obtener indumentaria", detalle: error.message });
  }
});

// Obtener indumentarias no aptas (en rack 99)
router.get("/no-aptas", async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT
        I.codigoIndumentaria AS Codigo_Indumentaria,
        S.idStock AS Id_Stock,
        R.numeroRack AS Rack_Numero,
        R.idRack AS Id_Rack,
        R.descripcion AS Estado_Rack,
        DI.idNombre,
        DI.idColor,
        DI.idTalle,
        DI.idTela,
        DI.idCategoria,
        DI.idEstado,
        DI.idPrecio,
        DI.idUnidadMedida
      FROM
        indumentaria AS I
      JOIN
        stock AS S ON I.codigoIndumentaria = S.codigoIndumentaria
      JOIN
        rack AS R ON S.idRack = R.idRack
      JOIN
        detalleindumentaria AS DI ON I.idDetalle = DI.idDetalle
      WHERE
        R.idRack = 99
      ORDER BY
        I.codigoIndumentaria
    `, {
      type: Sequelize.QueryTypes.SELECT
    });

    // Agrupar por código de indumentaria y calcular cantidades
    const indumentariasAgrupadas = {};
    
    for (const item of result) {
      const codigo = item.Codigo_Indumentaria;
      
      if (!indumentariasAgrupadas[codigo]) {
        indumentariasAgrupadas[codigo] = {
          codigoIndumentaria: codigo,
          idStock: item.Id_Stock,
          rackNumero: item.Rack_Numero,
          idRack: item.Id_Rack,
          estadoRack: item.Estado_Rack,
          idNombre: item.idNombre,
          idColor: item.idColor,
          idTalle: item.idTalle,
          idTela: item.idTela,
          idCategoria: item.idCategoria,
          idEstado: item.idEstado,
          idPrecio: item.idPrecio,
          idUnidadMedida: item.idUnidadMedida,
          stockIds: []
        };
      }
      
      indumentariasAgrupadas[codigo].stockIds.push(item.Id_Stock);
    }

    // Obtener detalles completos y calcular cantidades reales
    const indumentariasNoAptas = await Promise.all(
      Object.values(indumentariasAgrupadas).map(async (item) => {
        const indumentaria = await Indumentaria.findOne({
          where: { codigoIndumentaria: item.codigoIndumentaria },
          include: [
            {
              model: DetalleIndumentaria,
              as: "DetalleIndumentarium",
              include: [
                { model: NombreIndumentaria, as: "NombreIndumentarium" },
                { model: Color },
                { model: Talle },
                { model: Tela, as: "TelaIndumentarium" },
                { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
                { model: EstadoIndumentaria, as: "EstadoIndumentarium" },
                { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
                { model: UnidadMedida, as: "UnidadMedidum" },
              ],
            },
          ],
        });

        if (indumentaria) {
          const itemJson = indumentaria.toJSON();
          
          // Calcular la cantidad total de stock no apto sumando los movimientos
          let cantidadTotal = 0;
          for (const stockId of item.stockIds) {
            const movimientos = await MovimientoStock.findAll({
              where: { idStock: stockId }
            });
            
            const cantidadStock = movimientos.reduce((total, mov) => {
              return total + (mov.cantidad || 0);
            }, 0);
            
            cantidadTotal += cantidadStock;
          }
          
          // Agregar la cantidad no apta al DetalleIndumentarium
          if (itemJson.DetalleIndumentarium) {
            itemJson.DetalleIndumentarium.cantidadIndumentaria = cantidadTotal;
          }
          
          // Agregar información del rack
          itemJson.Stock = {
            numeroRack: item.rackNumero,
            idRack: item.idRack,
            Rack: {
              numeroRack: item.rackNumero,
              idRack: item.idRack,
              descripcion: item.estadoRack
            }
          };
          
          return itemJson;
        }
        return null;
      })
    );

    // Filtrar nulos Y stock 0 (solo mostrar si tiene stock disponible > 0)
    const indumentariasFiltradas = indumentariasNoAptas.filter(item => {
      if (item === null) return false;
      
      const cantidadDisponible = item.DetalleIndumentarium?.cantidadIndumentaria || 0;
      return cantidadDisponible > 0; // ⚠️ Solo mostrar si tiene stock disponible
    });

    // Log para depuración
    console.log(`✅ Indumentarias No Aptas encontradas (con stock > 0): ${indumentariasFiltradas.length}`);
    if (indumentariasFiltradas.length > 0) {
      console.log('Ejemplo de datos:', JSON.stringify({
        codigo: indumentariasFiltradas[0].codigoIndumentaria,
        cantidad: indumentariasFiltradas[0].DetalleIndumentarium?.cantidadIndumentaria,
        rack: indumentariasFiltradas[0].Stock
      }, null, 2));
    }

    res.json(indumentariasFiltradas);
  } catch (error) {
    console.error("Error al obtener indumentarias no aptas:", error);
    res.status(500).json({ error: "Error al obtener indumentarias no aptas", detalle: error.message });
  }
});

// Crear nueva indumentaria
router.post("/", async (req, res) => {
  const {
    codigoIndumentaria,
    descripcion,
    idDetalle,
    cantidadInicial = 0, // Stock inicial
    idRack // Ubicación del stock
  } = req.body;

  // Validar que no se use el rack de indumentaria no apta (ID 99)
  if (idRack && parseInt(idRack) === 99) {
    return res.status(400).json({ 
      error: "No se puede registrar indumentaria directamente en el rack de 'No Apta'. Este rack está reservado para movimientos de stock no apto." 
    });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Crear la indumentaria
    const nuevaIndumentaria = await Indumentaria.create(
      {
        codigoIndumentaria,
        descripcion,
        idDetalle,
        estaActivo: 1,
      },
      { transaction: t }
    );

    // 2. Crear el registro de stock
    const stockId = `STK-${Date.now()}`;
    const nuevoStock = await Stock.create(
      {
        idStock: stockId,
        codigoIndumentaria: nuevaIndumentaria.codigoIndumentaria,
        idRack: idRack || null
      },
      { transaction: t }
    );

    // 3. Si hay stock inicial o rack asignado, crear el movimiento inicial
    if (cantidadInicial > 0 || idRack) {
      const movimientoId = `MOV-${Date.now()}`;
      await MovimientoStock.create(
        {
          idMovimientoStock: movimientoId,
          idStock: stockId,
          fechaMovimiento: new Date(),
          cantidad: cantidadInicial || 0,
          observaciones: 'Stock inicial'
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({
      indumentaria: nuevaIndumentaria,
      stock: nuevoStock,
      stockInicial: cantidadInicial
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear indumentaria:", error);
    res.status(500).json({ error: "Error al crear indumentaria", detalle: error.message });
  }
});

// Obtener indumentaria por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const indumentaria = await Indumentaria.findOne({
      where: { codigoIndumentaria: id },
      include: [
        {
          model: DetalleIndumentaria,
          as: "DetalleIndumentarium",
          include: [
            { model: NombreIndumentaria, as: "NombreIndumentarium" },
            { model: Color },
            { model: Talle },
            { model: Tela, as: "TelaIndumentarium" },
            { model: CategoriaIndumentaria, as: "CategoriaIndumentarium" },
            { model: EstadoIndumentaria, as: "EstadoIndumentarium" },
            { model: PrecioIndumentaria, as: "PrecioIndumentarium" },
            { model: UnidadMedida, as: "UnidadMedidum" }, // Nuevo JOIN
          ],
        },
        {
          model: Stock,
          where: {
            idRack: { [Op.ne]: 99 } // Excluir el rack de No Aptos
          },
          required: false, // LEFT JOIN para permitir indumentaria sin stock
          include: [
            {
              model: MovimientoStock,
            },
            {
              model: Rack,
            },
          ],
        },
      ],
    });

    if (!indumentaria) {
      return res.status(404).json({ error: "Indumentaria no encontrada" });
    }

    // Calcular stock actual
    let stockActual = 0;
    if (indumentaria.Stock && indumentaria.Stock.MovimientoStocks) {
      stockActual = indumentaria.Stock.MovimientoStocks.reduce((total, movimiento) => {
        return total + (movimiento.cantidad || 0);
      }, 0);
    }

    // Agregar el stock calculado al DetalleIndumentarium
    const indumentariaJson = indumentaria.toJSON();
    if (indumentariaJson.DetalleIndumentarium) {
      indumentariaJson.DetalleIndumentarium.cantidadIndumentaria = stockActual;
    }

    res.json(indumentariaJson);
  } catch (error) {
    console.error("Error al obtener indumentaria:", error);
    res.status(500).json({ error: "Error al obtener indumentaria", detalle: error.message });
  }
});

// Actualizar indumentaria
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { descripcion, idDetalle } = req.body;

  const t = await sequelize.transaction();
  try {
    const indumentaria = await Indumentaria.findOne({
      where: { codigoIndumentaria: id },
      transaction: t,
    });

    if (!indumentaria) {
      await t.rollback();
      return res.status(404).json({ error: "Indumentaria no encontrada" });
    }

    await indumentaria.update(
      { descripcion, idDetalle },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Indumentaria actualizada correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar indumentaria:", error);
    res.status(500).json({ error: "Error al actualizar indumentaria", detalle: error.message });
  }
});

// Mover indumentaria a No Apta (con registro del rack original)
router.post("/:id/no-apta", async (req, res) => {
  const { id } = req.params;
  const { cantidad, idMotivo, observaciones } = req.body;

  console.log('📦 Recibiendo solicitud para marcar como no apta:', {
    id,
    cantidad,
    idMotivo,
    observaciones
  });

  // Validar datos de entrada
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ 
      error: "La cantidad debe ser un número mayor a 0"
    });
  }

  if (!idMotivo) {
    return res.status(400).json({ 
      error: "Debe seleccionar un motivo para marcar como No Apta"
    });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Obtener el stock actual y su rack original
    const stockActual = await Stock.findOne({
      where: { 
        codigoIndumentaria: id,
        idRack: { [Op.ne]: 99 } // Excluir el rack de No Aptos
      },
      include: [{ 
        model: MovimientoStock,
        attributes: ['cantidad', 'fechaMovimiento', 'observaciones']
      }],
      transaction: t
    });

    if (!stockActual) {
      console.log('❌ Stock no encontrado para:', id);
      await t.rollback();
      return res.status(404).json({ error: "Stock no encontrado" });
    }

    // Guardar el rack original (para recuperarlo después)
    const idRackOriginal = stockActual.idRack;
    
    console.log('✅ Stock encontrado:', {
      idStock: stockActual.idStock,
      idRackOriginal,
      movimientos: stockActual.MovimientoStocks.length
    });

    // Calcular stock disponible
    const stockDisponible = stockActual.MovimientoStocks.reduce((total, mov) => {
      return total + (Number(mov.cantidad) || 0);
    }, 0);
    
    if (stockDisponible < cantidad) {
      console.log('❌ Stock insuficiente', { stockDisponible, cantidadSolicitada: cantidad });
      await t.rollback();
      return res.status(400).json({ 
        error: "No hay suficiente stock disponible",
        detalles: { stockDisponible, cantidadSolicitada: cantidad }
      });
    }

    // 2. Crear movimiento NEGATIVO en el rack original (salida)
    const movSalidaId = `MOV-NOAPTA-OUT-${Date.now()}`;
    await MovimientoStock.create({
      idMovimientoStock: movSalidaId,
      idStock: stockActual.idStock,
      cantidad: -cantidad, // ⚠️ Negativo = salida del rack original
      fechaMovimiento: new Date(),
      observaciones: `Movido a No Apta: ${observaciones || 'Sin observaciones'}`
    }, { transaction: t });

    console.log('✅ Movimiento negativo creado en rack original:', idRackOriginal);

    // 3. Buscar o crear stock en Rack 99 (Cuarentena)
    let stockCuarentena = await Stock.findOne({
      where: {
        codigoIndumentaria: id,
        idRack: 99
      },
      transaction: t
    });

    if (!stockCuarentena) {
      // Crear registro de stock en cuarentena
      const stockId = `STK-${id}-R99-${Date.now()}`;
      stockCuarentena = await Stock.create({
        idStock: stockId,
        codigoIndumentaria: id,
        idRack: 99
      }, { transaction: t });
      console.log('✅ Nuevo registro de stock creado en Rack 99');
    }

    // 4. Crear movimiento POSITIVO en Rack 99 (entrada)
    const movEntradaId = `MOV-NOAPTA-IN-${Date.now()}`;
    await MovimientoStock.create({
      idMovimientoStock: movEntradaId,
      idStock: stockCuarentena.idStock,
      cantidad: cantidad, // ⚠️ Positivo = entrada al rack de cuarentena
      fechaMovimiento: new Date(),
      observaciones: `Recibido de Rack ${idRackOriginal}: ${observaciones || 'Sin observaciones'}`
    }, { transaction: t });

    console.log('✅ Movimiento positivo creado en Rack 99 (Cuarentena)');

    // 5. Registrar el fallo en stock_registro_fallo (GUARDAR RACK ORIGINAL)
    await StockRegistroFallo.create({
      idStock: stockCuarentena.idStock, // 🎯 Stock de cuarentena
      idMotivo,
      idRackOriginal, // 🎯 Aquí guardamos el rack original
      observaciones: observaciones || 'Registrado para inspección/reparación',
      fechaRegistro: new Date(),
      estadoPostFallo: null, // Pendiente
      fechaResolucion: null,
      idUsuarioResolucion: null
    }, { transaction: t });

    console.log('✅ Registro de fallo creado con rack original:', idRackOriginal);

    await t.commit();
    res.json({ 
      message: "Stock movido a No Apto correctamente",
      rackOriginal: idRackOriginal
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al mover stock a No Apto:", error);
    res.status(500).json({ error: "Error al mover stock a No Apto", detalle: error.message });
  }
});

// Rutas de Racks

// Rutas de Stock

// Crear movimiento de stock
router.post('/stock/movimiento', async (req, res) => {
  const { codigoIndumentaria, cantidad, observaciones } = req.body;
  
  if (!codigoIndumentaria || !cantidad) {
    return res.status(400).json({ error: 'Se requiere codigoIndumentaria y cantidad' });
  }

  const t = await sequelize.transaction();
  try {
    // Primero buscamos el stock correspondiente (excluyendo el rack de No Aptos)
    let stock = await Stock.findOne({
      where: { 
        codigoIndumentaria,
        idRack: { [Op.ne]: 99 } // Excluir el rack de No Aptos
      },
      transaction: t
    });

    // Si no existe el stock normal, lo creamos (sin rack especificado inicialmente)
    if (!stock) {
      const stockId = `STK-${Date.now()}`;
      stock = await Stock.create({
        idStock: stockId,
        codigoIndumentaria,
        idRack: null // Se asignará el rack cuando se especifique
      }, { transaction: t });
    }

    const movimientoId = `MOV-${Date.now()}`;
    const nuevoMovimiento = await MovimientoStock.create({
      idMovimientoStock: movimientoId,
      idStock: stock.idStock,
      fechaMovimiento: new Date(),
      cantidad: parseInt(cantidad),
      observaciones: observaciones || 'Sin observaciones'
    }, { transaction: t });

    await t.commit();
    res.json(nuevoMovimiento);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear movimiento de stock:', error);
    res.status(500).json({ error: 'Error al crear movimiento de stock', detalle: error.message });
  }
});

// Actualizar stock
router.put('/stock/:codigoIndumentaria', async (req, res) => {
  const { codigoIndumentaria } = req.params;
  const { idRack } = req.body;

  // Validar que no se use el rack de indumentaria no apta (ID 99)
  if (idRack && parseInt(idRack) === 99) {
    return res.status(400).json({ 
      error: "No se puede mover indumentaria directamente al rack de 'No Apta'. Use la función específica para marcar como no apta." 
    });
  }

  const t = await sequelize.transaction();
  try {
    const stock = await Stock.findOne({
      where: { codigoIndumentaria },
      transaction: t
    });

    if (!stock) {
      await t.rollback();
      return res.status(404).json({ error: 'Stock no encontrado' });
    }

    await stock.update({ idRack }, { transaction: t });
    await t.commit();
    
    res.json({ message: 'Stock actualizado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error al actualizar stock', detalle: error.message });
  }
});

// Reingresar indumentaria a stock (después de reparación)
router.post("/:id/reingreso", async (req, res) => {
  const { id } = req.params;
  const { cantidad, observaciones, idUsuario } = req.body;

  console.log('✅ Recibiendo solicitud de reingreso:', {
    id,
    cantidad,
    observaciones,
    idUsuario
  });

  // Validar datos de entrada
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ 
      error: "La cantidad debe ser un número mayor a 0"
    });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Obtener el stock en Rack 99 (Cuarentena)
    const stockNoApto = await Stock.findOne({
      where: { 
        codigoIndumentaria: id,
        idRack: 99 // Rack de cuarentena
      },
      transaction: t
    });

    if (!stockNoApto) {
      console.log('❌ Stock No Apto no encontrado para:', id);
      await t.rollback();
      return res.status(404).json({ error: "No se encontró stock en cuarentena para esta indumentaria" });
    }

    // 2. Buscar el registro de fallo más reciente (resuelto o no) para obtener el rack original
    const registroFallo = await StockRegistroFallo.findOne({
      where: {
        idStock: stockNoApto.idStock
      },
      order: [['idRegistroFallo', 'DESC']], // El más reciente
      transaction: t
    });

    if (!registroFallo) {
      console.log('❌ No se encontró registro de fallo para esta indumentaria');
      await t.rollback();
      return res.status(404).json({ error: "No se encontró información del rack original para esta indumentaria" });
    }

    const idRackOriginal = registroFallo.idRackOriginal;
    const idMotivoOriginal = registroFallo.idMotivo;
    console.log('✅ Rack original recuperado:', idRackOriginal);

    // 3. Verificar stock disponible en cuarentena
    const movimientosCuarentena = await MovimientoStock.findAll({
      where: { idStock: stockNoApto.idStock },
      transaction: t
    });

    const stockDisponibleCuarentena = movimientosCuarentena.reduce((total, mov) => {
      return total + (Number(mov.cantidad) || 0);
    }, 0);

    if (stockDisponibleCuarentena < cantidad) {
      console.log('❌ Stock insuficiente en cuarentena', { 
        stockDisponible: stockDisponibleCuarentena, 
        cantidadSolicitada: cantidad 
      });
      await t.rollback();
      return res.status(400).json({ 
        error: "No hay suficiente stock en cuarentena",
        detalles: { stockDisponible: stockDisponibleCuarentena, cantidadSolicitada: cantidad }
      });
    }

    // 4. Crear movimiento NEGATIVO en Rack 99 (salida de cuarentena)
    const movSalidaCuarentenaId = `MOV-REINGRESO-OUT-${Date.now()}`;
    await MovimientoStock.create({
      idMovimientoStock: movSalidaCuarentenaId,
      idStock: stockNoApto.idStock,
      cantidad: -cantidad, // ⚠️ Negativo = salida de cuarentena
      fechaMovimiento: new Date(),
      observaciones: `Reingresado a Rack ${idRackOriginal}: ${observaciones || 'Reparado'}`
    }, { transaction: t });

    console.log('✅ Movimiento negativo creado en Rack 99 (salida)');

    // 5. Buscar o crear stock en rack original
    let stockOriginal = await Stock.findOne({
      where: {
        codigoIndumentaria: id,
        idRack: idRackOriginal
      },
      transaction: t
    });

    if (!stockOriginal) {
      // Crear registro de stock en rack original
      const stockId = `STK-${id}-R${idRackOriginal}-${Date.now()}`;
      stockOriginal = await Stock.create({
        idStock: stockId,
        codigoIndumentaria: id,
        idRack: idRackOriginal
      }, { transaction: t });
      console.log('✅ Nuevo registro de stock creado en Rack original:', idRackOriginal);
    }

    // 6. Crear movimiento POSITIVO en rack original (entrada)
    const movEntradaOriginalId = `MOV-REINGRESO-IN-${Date.now()}`;
    await MovimientoStock.create({
      idMovimientoStock: movEntradaOriginalId,
      idStock: stockOriginal.idStock,
      cantidad: cantidad, // ⚠️ Positivo = entrada al rack original
      fechaMovimiento: new Date(),
      observaciones: `Regreso de cuarentena: ${observaciones || 'Reparado'}`
    }, { transaction: t });

    console.log('✅ Movimiento positivo creado en Rack original:', idRackOriginal);

    // 7. CREAR NUEVO registro de fallo específico para REINGRESO
    // No modificamos el registro anterior, creamos uno nuevo para trazabilidad
    await StockRegistroFallo.create({
      idStock: stockNoApto.idStock,
      idMotivo: idMotivoOriginal,
      idRackOriginal: idRackOriginal,
      observaciones: `✅ REPARADO: ${cantidad} unidades arregladas y reingresadas al rack original ${idRackOriginal}. ${observaciones || ''}`,
      fechaRegistro: new Date(),
      estadoPostFallo: 1, // 1 = Apta (Reparado)
      fechaResolucion: new Date(), // Ya está resuelto como reparado
      idUsuarioResolucion: idUsuario || null
    }, { transaction: t });

    console.log('✅ Nuevo registro de fallo REPARADO creado');

    await t.commit();
    res.json({ 
      message: `Indumentaria reparada y reingresada al rack original ${idRackOriginal}`,
      rackDestino: idRackOriginal
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al reingresar stock:", error);
    res.status(500).json({ error: "Error al reingresar stock", detalle: error.message });
  }
});

// Marcar indumentaria como Scrap (Desecho permanente)
router.post("/:id/scrap", async (req, res) => {
  const { id } = req.params;
  const { cantidad, observaciones, idUsuario } = req.body;

  console.log('🗑️ Recibiendo solicitud de scrap:', {
    id,
    cantidad,
    observaciones,
    idUsuario
  });

  // Validar datos de entrada
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ 
      error: "La cantidad debe ser un número mayor a 0"
    });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Obtener el stock en Rack 99 (Cuarentena)
    const stockNoApto = await Stock.findOne({
      where: { 
        codigoIndumentaria: id,
        idRack: 99 // Rack de cuarentena
      },
      transaction: t
    });

    if (!stockNoApto) {
      console.log('❌ Stock No Apto no encontrado para:', id);
      await t.rollback();
      return res.status(404).json({ error: "No se encontró stock en cuarentena para esta indumentaria" });
    }

    // 2. Verificar stock disponible en cuarentena
    const movimientosCuarentena = await MovimientoStock.findAll({
      where: { idStock: stockNoApto.idStock },
      transaction: t
    });

    const stockDisponibleCuarentena = movimientosCuarentena.reduce((total, mov) => {
      return total + (Number(mov.cantidad) || 0);
    }, 0);

    if (stockDisponibleCuarentena < cantidad) {
      console.log('❌ Stock insuficiente en cuarentena para scrap', { 
        stockDisponible: stockDisponibleCuarentena, 
        cantidadSolicitada: cantidad 
      });
      await t.rollback();
      return res.status(400).json({ 
        error: "No hay suficiente stock en cuarentena",
        detalles: { stockDisponible: stockDisponibleCuarentena, cantidadSolicitada: cantidad }
      });
    }

    // 3. Buscar el registro de fallo original (puede estar resuelto o pendiente)
    // Solo para obtener el idRackOriginal y el motivo
    const registroFalloOriginal = await StockRegistroFallo.findOne({
      where: {
        idStock: stockNoApto.idStock
      },
      order: [['idRegistroFallo', 'DESC']],
      transaction: t
    });

    let idMotivoScrap = registroFalloOriginal ? registroFalloOriginal.idMotivo : null;
    let idRackOriginal = registroFalloOriginal ? registroFalloOriginal.idRackOriginal : null;

    console.log('ℹ️ Registro original encontrado:', {
      idRegistro: registroFalloOriginal?.idRegistroFallo,
      idMotivo: idMotivoScrap,
      idRackOriginal
    });

    // 4. Crear movimiento NEGATIVO (salida permanente por scrap)
    const movScrapId = `MOV-SCRAP-${Date.now()}`;
    await MovimientoStock.create({
      idMovimientoStock: movScrapId,
      idStock: stockNoApto.idStock,
      fechaMovimiento: new Date(),
      cantidad: -cantidad, // ⚠️ Negativo = salida permanente
      observaciones: `SCRAP (Desecho permanente): ${observaciones || 'Sin motivo especificado'}`
    }, { transaction: t });

    console.log('✅ Movimiento de scrap registrado (salida permanente)');

    // 5. CREAR NUEVO registro de fallo específico para SCRAP
    // No modificamos el registro anterior, creamos uno nuevo para trazabilidad
    await StockRegistroFallo.create({
      idStock: stockNoApto.idStock,
      idMotivo: idMotivoScrap || 1, // Usar motivo original o 1 por defecto
      idRackOriginal: idRackOriginal || 99, // Usar rack original o 99
      observaciones: `⚠️ SCRAP: ${cantidad} unidades desechadas permanentemente. ${observaciones || 'Sin motivo especificado'}`,
      fechaRegistro: new Date(),
      estadoPostFallo: null, // NULL para SCRAP (diferenciado por observaciones y fechaResolucion)
      fechaResolucion: new Date(), // Ya está resuelto como SCRAP
      idUsuarioResolucion: idUsuario || null
    }, { transaction: t });

    console.log('✅ Nuevo registro de fallo SCRAP creado');

    await t.commit();
    res.json({ 
      message: `${cantidad} unidades marcadas como scrap (desechadas permanentemente)`,
      estadoPostFallo: 'SCRAP'
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error al marcar como scrap:", error);
    res.status(500).json({ error: "Error al marcar como scrap", detalle: error.message });
  }
});

module.exports = router;
