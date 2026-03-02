/**
 * Script para poblar la base de datos con pedidos históricos
 * Período: Noviembre 2025 - Febrero 2026 (hasta día 15)
 * 
 * Este script genera ~88 pedidos con:
 * - Estados: 80% Finalizado, 10% Despachado, 5% Abonado, 3% Pendiente, 2% Cancelado
 * - Empresas de envío con distribución diferente por mes
 * - Presentaciones variadas (Unidad/Caja/Pack)
 * - Pickers alternados (LP005 60% / LP006 40%)
 * - Código de seguimiento HD-XXXX-AR para pedidos despachados/finalizados
 * 
 * Uso: node poblar-pedidos-historicos.js
 */

const { sequelize } = require('./config/database');

// ==================== CONFIGURACIÓN ====================

const CONFIG = {
  // Fechas del período
  FECHA_INICIO: new Date('2025-11-01'),
  FECHA_FIN: new Date('2026-02-15'),
  
  // Pedidos por mes
  PEDIDOS_POR_MES: {
    11: 25, // Noviembre 2025
    12: 25, // Diciembre 2025
    1: 25,  // Enero 2026
    2: 24   // Febrero 2026 (hasta día 24)
  },
  
  // Distribución de estados para meses históricos (Nov, Dic, Ene)
  // Solo Finalizados y Cancelados
  ESTADOS_HISTORICOS: [
    { id: 5, peso: 80 }, // Finalizado
    { id: 6, peso: 20 }  // Cancelado
  ],
  
  // Distribución de estados para febrero (variedad completa)
  // 1=En curso, 2=Pendiente Pago, 3=Abonado, 4=Despachado, 5=Finalizado, 6=Cancelado
  ESTADOS_FEBRERO: [
    { id: 5, peso: 50 }, // Finalizado
    { id: 4, peso: 20 }, // Despachado
    { id: 3, peso: 15 }, // Abonado
    { id: 2, peso: 8 },  // Pendiente Pago
    { id: 1, peso: 5 },  // En curso
    { id: 6, peso: 2 }   // Cancelado
  ],
  
  // Distribución de empresas de envío por mes (%)
  // 1=Correo Argentino, 2=Andreani, 3=OCA, 4=Via Cargo
  EMPRESAS_POR_MES: {
    11: [45, 30, 15, 10], // Nov: Correo Argentino domina
    12: [20, 50, 20, 10], // Dic: Andreani preferida (temporada alta)
    1: [25, 20, 40, 15],  // Ene: OCA más popular
    2: [20, 25, 25, 30]   // Feb: Via Cargo crece
  },
  
  // Pickers disponibles (peso en %)
  PICKERS: [
    { legajo: 'LP005', peso: 60 }, // Ana (más productiva)
    { legajo: 'LP006', peso: 40 }  // Luis
  ],
  
  // Presentaciones (peso en %)
  PRESENTACIONES: [
    { id: 1, nombre: 'Unidad', peso: 50, cantidadMin: 1, cantidadMax: 3, descuento: 0 },
    { id: 2, nombre: 'Caja', peso: 30, cantidadMin: 1, cantidadMax: 5, descuento: 10 },
    { id: 3, nombre: 'Pack', peso: 20, cantidadMin: 2, cantidadMax: 8, descuento: 5 }
  ],
  
  // Productos disponibles
  PRODUCTOS_PRINCIPALES: ['IND001', 'IND002', 'IND003', 'IND004', 'IND005', 'IND007', 'IND008', 'IND009', 'IND010'],
  PRODUCTOS_VARIADOS: ['IND015', 'IND016', 'IND017', 'IND018', 'IND019', 'IND020', 'IND021', 'IND022', 'IND023', 'IND024', 'IND025', 'IND026', 'IND027', 'IND028', 'IND029', 'IND030', 'IND031', 'IND032', 'IND033', 'IND034', 'IND035', 'IND036', 'IND037', 'IND038', 'IND039'],
  
  // Usuario que crea los pedidos (vendedor mariag)
  USUARIO_CREADOR: 2,
  
  // Clientes (se cargarán dinámicamente desde la BD)
  CLIENTES_DISPONIBLES: []
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Selecciona un elemento aleatorio basado en pesos
 */
function seleccionarPorPeso(items) {
  const totalPeso = items.reduce((sum, item) => sum + item.peso, 0);
  let random = Math.random() * totalPeso;
  
  for (const item of items) {
    random -= item.peso;
    if (random <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

/**
 * Genera una fecha aleatoria en horario comercial
 */
function generarFechaAleatoria(año, mes, diaMin = 1, diaMax = 31) {
  // Limitar días según el mes
  const ultimoDia = new Date(año, mes, 0).getDate();
  const diaFinal = Math.min(diaMax, ultimoDia);
  
  const dia = Math.floor(Math.random() * (diaFinal - diaMin + 1)) + diaMin;
  const hora = Math.floor(Math.random() * 12) + 8; // 8-19
  const minuto = Math.floor(Math.random() * 60);
  const segundo = Math.floor(Math.random() * 60);
  
  return new Date(año, mes - 1, dia, hora, minuto, segundo);
}

/**
 * Formatea fecha para MySQL
 */
function formatearFecha(fecha) {
  return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Genera número de pedido único
 */
function generarNumeroPedido(fecha, correlativo) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const corr = String(correlativo).padStart(3, '0');
  
  return `PED-${año}${mes}${dia}-${corr}`;
}

/**
 * Genera código de seguimiento único
 */
function generarCodigoSeguimiento() {
  const numeros = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HD-${numeros}-AR`;
}

/**
 * Selecciona empresa de envío según el mes
 */
function seleccionarEmpresaEnvio(mes) {
  const pesos = CONFIG.EMPRESAS_POR_MES[mes];
  const items = pesos.map((peso, index) => ({ id: index + 1, peso }));
  return seleccionarPorPeso(items).id;
}

/**
 * Selecciona productos aleatorios sin repetir
 */
function seleccionarProductos() {
  const cantidad = Math.floor(Math.random() * 4) + 1; // 1-4 productos
  const productos = [];
  
  // 60% productos principales, 40% variados
  const pool = Math.random() < 0.6 ? CONFIG.PRODUCTOS_PRINCIPALES : CONFIG.PRODUCTOS_VARIADOS;
  
  const disponibles = [...pool];
  for (let i = 0; i < cantidad && disponibles.length > 0; i++) {
    const index = Math.floor(Math.random() * disponibles.length);
    productos.push(disponibles[index]);
    disponibles.splice(index, 1);
  }
  
  return productos;
}

/**
 * Selecciona cliente aleatorio de los disponibles en la BD
 */
function seleccionarCliente() {
  if (CONFIG.CLIENTES_DISPONIBLES.length === 0) {
    throw new Error('No hay clientes disponibles. Asegúrate de cargar los clientes desde la BD.');
  }
  const index = Math.floor(Math.random() * CONFIG.CLIENTES_DISPONIBLES.length);
  return CONFIG.CLIENTES_DISPONIBLES[index];
}

/**
 * Obtiene datos del producto desde la BD
 */
async function obtenerDatosProducto(codigoIndumentaria) {
  const [resultado] = await sequelize.query(`
    SELECT 
      ni.nombre as nombreProducto,
      co.color as colorProducto,
      ta.talle as talleProducto,
      cat.categoria as categoriaProducto,
      te.tipoTela as telaProducto,
      pr.precio as precioUnitario
    FROM indumentaria i
    JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
    LEFT JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
    LEFT JOIN precioindumentaria pr ON di.idPrecio = pr.idPrecio
    LEFT JOIN color co ON di.idColor = co.idColor
    LEFT JOIN talle ta ON di.idTalle = ta.idTalle
    LEFT JOIN categoriaindumentaria cat ON di.idCategoria = cat.idCategoria
    LEFT JOIN tela te ON di.idTela = te.idTela
    WHERE i.codigoIndumentaria = ?
    LIMIT 1
  `, {
    replacements: [codigoIndumentaria]
  });
  
  return resultado[0] || null;
}

/**
 * Verifica si un número de pedido ya existe
 */
async function existeNumeroPedido(numeroPedido) {
  const [resultado] = await sequelize.query(
    'SELECT COUNT(*) as count FROM pedido WHERE numeroPedido = ?',
    { replacements: [numeroPedido] }
  );
  return resultado[0].count > 0;
}

// ==================== FUNCIÓN PRINCIPAL ====================

async function poblarPedidos() {
  console.log('🛒 Iniciando población de pedidos históricos...\n');
  console.log('📅 Período: Noviembre 2025 - Febrero 2026 (24)');
  console.log('📊 Distribución:');
  console.log('  • Nov-Ene: 80% Finalizado, 20% Cancelado');
  console.log('  • Febrero: Variedad de estados (50% Finalizado, 20% Despachado, 15% Abonado, 8% Pendiente, 5% En curso, 2% Cancelado)\n');
  
  const estadisticas = {
    pedidosCreados: 0,
    detallesCreados: 0,
    asignacionesCreadas: 0,
    porEstado: {},
    porEmpresa: {},
    porPresentacion: {},
    porMes: {},
    errores: [] // Registrar errores durante la ejecución
  };
  
  let idAsignacionGlobal = 1000; // Empezar desde 1000 para evitar conflictos
  
  try {
    // 1. Cargar clientes disponibles desde la base de datos
    console.log('🔍 Consultando clientes disponibles en la base de datos...');
    const [clientesResult] = await sequelize.query(
      'SELECT idCliente FROM cliente WHERE estaActivo = 1 ORDER BY idCliente'
    );
    
    if (clientesResult.length === 0) {
      throw new Error('❌ No se encontraron clientes activos en la base de datos. Verifica la tabla cliente.');
    }
    
    CONFIG.CLIENTES_DISPONIBLES = clientesResult.map(c => c.idCliente);
    console.log(`✅ Se encontraron ${CONFIG.CLIENTES_DISPONIBLES.length} clientes activos`);
    console.log(`   IDs disponibles: ${CONFIG.CLIENTES_DISPONIBLES.slice(0, 10).join(', ')}${CONFIG.CLIENTES_DISPONIBLES.length > 10 ? '...' : ''}\n`);
    
    // 2. Obtener el último ID de asignación existente
    const [maxId] = await sequelize.query('SELECT MAX(idAsignacion) as maxId FROM asignacion_picking');
    if (maxId[0].maxId) {
      idAsignacionGlobal = maxId[0].maxId + 1;
    }
    
    // Procesar cada mes
    for (const [mesStr, cantidadPedidos] of Object.entries(CONFIG.PEDIDOS_POR_MES)) {
      const mes = parseInt(mesStr);
      const año = mes <= 2 ? 2026 : 2025;
      const nombreMes = new Date(año, mes - 1).toLocaleString('es', { month: 'long' });
      
      console.log(`\n📦 Generando ${cantidadPedidos} pedidos para ${nombreMes} ${año}...`);
      
      estadisticas.porMes[`${año}-${mes}`] = {
        pedidos: 0,
        estados: {},
        empresas: {}
      };
      
      for (let i = 0; i < cantidadPedidos; i++) {
        try {
          // Generar datos del pedido
          const fecha = generarFechaAleatoria(año, mes, 1, mes === 2 ? 24 : 31);
          const correlativo = i + 1;
          let numeroPedido = generarNumeroPedido(fecha, correlativo);
          
          // Verificar unicidad del número de pedido
          let intentos = 0;
          while (await existeNumeroPedido(numeroPedido) && intentos < 10) {
            const nuevoCorrelativo = correlativo + 100 + intentos;
            numeroPedido = generarNumeroPedido(fecha, nuevoCorrelativo);
            intentos++;
          }
          
          // Seleccionar distribución de estados según el mes
          // Meses históricos (Nov, Dic, Ene): Solo Finalizados o Cancelados
          // Febrero: Variedad completa de estados
          const estadosDisponibles = (mes === 2) ? CONFIG.ESTADOS_FEBRERO : CONFIG.ESTADOS_HISTORICOS;
          const estado = seleccionarPorPeso(estadosDisponibles);
          const idCliente = seleccionarCliente();
          const idEmpresaEnvio = seleccionarEmpresaEnvio(mes);
          const codigoSeguimiento = (estado.id >= 4) ? generarCodigoSeguimiento() : null;
          
          // Seleccionar motivo de cancelación si el pedido está cancelado (estado 6)
          // Motivos disponibles: 1-5 (excluir 6 = "Otro motivo")
          let idMotivoCancelacion = null;
          let fechaCancelacion = null;
          
          if (estado.id === 6) {
            idMotivoCancelacion = Math.floor(Math.random() * 5) + 1; // Motivos 1-5 solamente
            // Fecha de cancelación: 1-3 días después del pedido
            const diasCancelacion = Math.floor(Math.random() * 3) + 1;
            fechaCancelacion = new Date(fecha.getTime() + diasCancelacion * 24 * 60 * 60 * 1000);
          }
          
          // Insertar pedido
          await sequelize.query(`
            INSERT INTO pedido (
              numeroPedido, idCliente, idUsuarioCreo, fechaPedido,
              idEmpresaEnvio, idEstado, estaActivo, descuentoOrden,
              codigoSeguimiento, idMotivoCancelacion, fechaCancelacion, idUsuarioCancelo
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 0.00, ?, ?, ?, ?)
          `, {
            replacements: [
              numeroPedido,
              idCliente,
              CONFIG.USUARIO_CREADOR,
              formatearFecha(fecha),
              idEmpresaEnvio,
              estado.id,
              codigoSeguimiento,
              idMotivoCancelacion,
              fechaCancelacion ? formatearFecha(fechaCancelacion) : null,
              idMotivoCancelacion ? CONFIG.USUARIO_CREADOR : null // Usuario que canceló
            ]
          });
          
          estadisticas.pedidosCreados++;
          estadisticas.porEstado[estado.id] = (estadisticas.porEstado[estado.id] || 0) + 1;
          estadisticas.porEmpresa[idEmpresaEnvio] = (estadisticas.porEmpresa[idEmpresaEnvio] || 0) + 1;
          estadisticas.porMes[`${año}-${mes}`].pedidos++;
          estadisticas.porMes[`${año}-${mes}`].estados[estado.id] = (estadisticas.porMes[`${año}-${mes}`].estados[estado.id] || 0) + 1;
          estadisticas.porMes[`${año}-${mes}`].empresas[idEmpresaEnvio] = (estadisticas.porMes[`${año}-${mes}`].empresas[idEmpresaEnvio] || 0) + 1;
          
          // Generar detalles del pedido
          const productos = seleccionarProductos();
          
          for (let j = 0; j < productos.length; j++) {
            try {
              const codigoIndumentaria = productos[j];
              const datosProducto = await obtenerDatosProducto(codigoIndumentaria);
              
              if (!datosProducto) {
                console.warn(`  ⚠️  Producto ${codigoIndumentaria} no encontrado, omitiendo...`);
                continue;
              }
              
              const presentacion = seleccionarPorPeso(CONFIG.PRESENTACIONES);
              const cantidad = Math.floor(Math.random() * (presentacion.cantidadMax - presentacion.cantidadMin + 1)) + presentacion.cantidadMin;
              const cantidadPresentaciones = presentacion.id === 1 ? 1 : cantidad;
              
              // Calcular descuento del item
              const subtotal = datosProducto.precioUnitario * cantidad;
              const descuentoItem = subtotal * (presentacion.descuento / 100);
              
              const idDetallePedido = `DP-${numeroPedido}-${j}`;
              
              await sequelize.query(`
                INSERT INTO detallepedido (
                  idDetallePedido, numeroPedido, codigoIndumentaria,
                  cantidad, descuentoItem, idPresentacion, cantidadPresentaciones,
                  nombreProducto, colorProducto, talleProducto,
                  categoriaProducto, telaProducto, precioUnitario, nombrePresentacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, {
                replacements: [
                  idDetallePedido,
                  numeroPedido,
                  codigoIndumentaria,
                  cantidad,
                  descuentoItem,
                  presentacion.id,
                  cantidadPresentaciones,
                  datosProducto.nombreProducto,
                  datosProducto.colorProducto,
                  datosProducto.talleProducto,
                  datosProducto.categoriaProducto,
                  datosProducto.telaProducto,
                  datosProducto.precioUnitario,
                  presentacion.nombre
                ]
              });
              
              estadisticas.detallesCreados++;
              estadisticas.porPresentacion[presentacion.id] = (estadisticas.porPresentacion[presentacion.id] || 0) + 1;
            } catch (errorDetalle) {
              console.error(`  ❌ ERROR al crear detalle de pedido ${numeroPedido} - Item ${j + 1}`);
              console.error(`     Producto: ${productos[j]}`);
              console.error(`     Error: ${errorDetalle.message}`);
              
              estadisticas.errores.push({
                mes: nombreMes,
                año: año,
                pedido: numeroPedido,
                tipo: 'Error en Detalle',
                mensaje: `Item ${j + 1} (${productos[j]}): ${errorDetalle.message}`,
                sqlCode: errorDetalle.parent?.code || null
              });
            }
          }
          
          // Crear asignación de picking si el estado lo requiere
          // Todos los estados necesitan picking EXCEPTO Cancelado (6)
          // 1=En curso, 2=Pendiente Pago, 3=Abonado, 4=Despachado, 5=Finalizado
          if (estado.id !== 6) {
            try {
              const picker = seleccionarPorPeso(CONFIG.PICKERS);
              
              // Calcular fechas de completado y despacho según estado
              let fechaCompletado = null;
              let fechaDespachado = null;
              let completado = 0;
              let despachado = 0;
              
              if (estado.id >= 4) {
                // Pedido despachado o finalizado
                const diasCompletado = Math.floor(Math.random() * 3) + 1; // 1-3 días después
                fechaCompletado = new Date(fecha.getTime() + diasCompletado * 24 * 60 * 60 * 1000);
                
                const diasDespachado = Math.floor(Math.random() * 2) + 1; // 1-2 días después de completar
                fechaDespachado = new Date(fechaCompletado.getTime() + diasDespachado * 24 * 60 * 60 * 1000);
                
                completado = 1;
                despachado = 1;
              } else if (estado.id === 1 || estado.id === 2) {
                // En curso o Pendiente de Pago: asignado pero no completado ni despachado
                completado = 0;
                despachado = 0;
              } else if (estado.id === 3) {
                // Abonado: asignado pero no completado ni despachado aún
                completado = 0;
                despachado = 0;
              }
              
              await sequelize.query(`
                INSERT INTO asignacion_picking (
                  idAsignacion, numeroPedido, legajoPicker, fechaAsignacion,
                  fechaCompletado, fechaDespachado, observaciones,
                  tieneProblemas, completado, despachado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
              `, {
                replacements: [
                  idAsignacionGlobal++,
                  numeroPedido,
                  picker.legajo,
                  formatearFecha(fecha),
                  fechaCompletado ? formatearFecha(fechaCompletado) : null,
                  fechaDespachado ? formatearFecha(fechaDespachado) : null,
                  'Asignación automática generada por script',
                  completado,
                  despachado
                ]
              });
              
              estadisticas.asignacionesCreadas++;
            } catch (errorPicking) {
              console.error(`  ❌ ERROR al crear asignación de picking para ${numeroPedido}`);
              console.error(`     Error: ${errorPicking.message}`);
              
              estadisticas.errores.push({
                mes: nombreMes,
                año: año,
                pedido: numeroPedido,
                tipo: 'Error en Asignación Picking',
                mensaje: errorPicking.message,
                sqlCode: errorPicking.parent?.code || null
              });
            }
          }
          
        } catch (error) {
          console.error(`\n  ❌ ERROR al crear pedido ${i + 1} (${nombreMes} ${año})`);
          console.error(`  📋 Detalles del error:`);
          console.error(`     Tipo: ${error.name}`);
          console.error(`     Mensaje: ${error.message}`);
          
          // Intentar extraer información específica del error de SQL
          if (error.parent) {
            console.error(`     SQL Code: ${error.parent.code || 'N/A'}`);
            console.error(`     SQL State: ${error.parent.sqlState || 'N/A'}`);
            if (error.parent.sql) {
              console.error(`     Query: ${error.parent.sql.substring(0, 100)}...`);
            }
          }
          
          // Registrar error para el resumen final
          estadisticas.errores.push({
            mes: nombreMes,
            año: año,
            pedido: i + 1,
            tipo: error.name,
            mensaje: error.message,
            sqlCode: error.parent?.code || null
          });
          
          console.error(`  ⚠️  Continuando con el siguiente pedido...\n`);
        }
        
        // Mostrar progreso
        if ((i + 1) % 10 === 0 || (i + 1) === cantidadPedidos) {
          console.log(`  ✅ Progreso: ${i + 1}/${cantidadPedidos} pedidos`);
        }
      }
    }
    
    // Mostrar estadísticas finales
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTADÍSTICAS FINALES');
    console.log('='.repeat(60));
    
    console.log('\n📦 Totales:');
    console.log(`  • Pedidos creados: ${estadisticas.pedidosCreados}`);
    console.log(`  • Detalles creados: ${estadisticas.detallesCreados}`);
    console.log(`  • Asignaciones creadas: ${estadisticas.asignacionesCreadas}`);
    
    console.log('\n📋 Por Estado:');
    const nombresEstado = { 1: 'En curso', 2: 'Pendiente Pago', 3: 'Abonado', 4: 'Despachado', 5: 'Finalizado', 6: 'Cancelado' };
    Object.entries(estadisticas.porEstado).sort((a, b) => b[1] - a[1]).forEach(([estado, count]) => {
      const porcentaje = ((count / estadisticas.pedidosCreados) * 100).toFixed(1);
      console.log(`  • ${nombresEstado[estado]}: ${count} (${porcentaje}%)`);
    });
    
    console.log('\n🚚 Por Empresa de Envío:');
    const nombresEmpresa = { 1: 'Correo Argentino', 2: 'Andreani', 3: 'OCA', 4: 'Via Cargo' };
    Object.entries(estadisticas.porEmpresa).sort((a, b) => a[0] - b[0]).forEach(([empresa, count]) => {
      const porcentaje = ((count / estadisticas.pedidosCreados) * 100).toFixed(1);
      console.log(`  • ${nombresEmpresa[empresa]}: ${count} (${porcentaje}%)`);
    });
    
    console.log('\n📦 Por Presentación:');
    const nombresPresentacion = { 1: 'Unidad', 2: 'Caja', 3: 'Pack' };
    Object.entries(estadisticas.porPresentacion).sort((a, b) => b[1] - a[1]).forEach(([pres, count]) => {
      const porcentaje = ((count / estadisticas.detallesCreados) * 100).toFixed(1);
      console.log(`  • ${nombresPresentacion[pres]}: ${count} (${porcentaje}%)`);
    });
    
    console.log('\n📅 Distribución por Mes y Empresa:');
    const mesesNombres = {
      '2025-11': 'Noviembre 2025',
      '2025-12': 'Diciembre 2025',
      '2026-1': 'Enero 2026',
      '2026-2': 'Febrero 2026'
    };
    
    Object.entries(estadisticas.porMes).forEach(([mes, datos]) => {
      console.log(`\n  ${mesesNombres[mes]}: ${datos.pedidos} pedidos`);
      console.log(`    Empresas de envío:`);
      Object.entries(datos.empresas).sort((a, b) => b[1] - a[1]).forEach(([empresa, count]) => {
        const porcentaje = ((count / datos.pedidos) * 100).toFixed(1);
        console.log(`      - ${nombresEmpresa[empresa]}: ${count} (${porcentaje}%)`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Mostrar resumen de errores si hubo
    if (estadisticas.errores.length > 0) {
      console.log('⚠️  RESUMEN DE ERRORES');
      console.log('='.repeat(60));
      console.log(`\n❌ Se encontraron ${estadisticas.errores.length} errores durante la ejecución:\n`);
      
      estadisticas.errores.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.mes} ${err.año} - Pedido #${err.pedido}`);
        console.log(`   Error: ${err.mensaje}`);
        if (err.sqlCode) {
          console.log(`   SQL Code: ${err.sqlCode}`);
        }
        console.log('');
      });
      
      console.log('='.repeat(60));
      console.log(`⚠️  Población completada con ${estadisticas.errores.length} error(es)`);
      console.log(`✅ Pedidos creados exitosamente: ${estadisticas.pedidosCreados}`);
    } else {
      console.log('✅ ¡Población de pedidos completada exitosamente sin errores!');
    }
    
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la población de pedidos:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
poblarPedidos();
