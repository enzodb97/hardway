const express = require('express');
const router = express.Router();
const { Usuario, TipoRol, sequelize, EncargadoPicker, Persona, MotivoInactivacionUsuario } = require('../models'); // ✅ Agregado MotivoInactivacionUsuario
const { Domicilio } = require('../models/Ubicacion'); // ✅ Importar Domicilio
const { verificarAccesoPedidos } = require('../middleware/auth'); // ✅ Importar middleware de autenticación
const { Op } = require('sequelize'); // ✅ Importar operadores de Sequelize

// ✅ NUEVO: Función para obtener o crear domicilio genérico
async function obtenerDomicilioGenerico() {
  try {
    // Buscar si existe un domicilio genérico marcado como tal
    let domicilioGenerico = await Domicilio.findOne({
      where: { 
        calle: 'PENDIENTE',
        altura: 'S/N'
      }
    });

    // Si no existe, crear uno
    if (!domicilioGenerico) {
      console.log('📍 Creando domicilio genérico...');
      domicilioGenerico = await Domicilio.create({
        calle: 'PENDIENTE',
        altura: 'S/N',
        piso: null,
        departamento: null,
        observaciones: 'Domicilio genérico para usuarios sin datos personales completos',
        idBarrio: 1, // Usar barrio por defecto (debe existir en BD)
        idCiudad: 1  // Usar ciudad por defecto (debe existir en BD)
      });
      console.log(`✅ Domicilio genérico creado con ID: ${domicilioGenerico.idDomicilio}`);
    }

    return domicilioGenerico.idDomicilio;
  } catch (error) {
    console.error('Error al obtener/crear domicilio genérico:', error);
    throw new Error('No se pudo obtener domicilio genérico');
  }
}

// ✅ NUEVO: Función para crear persona genérica para usuario
async function crearPersonaGenerica(nombreUsuario) {
  try {
    const idDomicilio = await obtenerDomicilioGenerico();
    
    // Generar DNI temporal único basado en timestamp
    const dniTemporal = 90000000 + Math.floor(Math.random() * 9999999);
    
    const persona = await Persona.create({
      dni: dniTemporal,
      tipoDocumento: 'DNI',
      nombre: nombreUsuario.toUpperCase(),
      apellido: 'PENDIENTE',
      direccion: null,
      idDomicilio: idDomicilio
    });

    console.log(`✅ Persona genérica creada: ID=${persona.idPersona}, DNI=${dniTemporal}`);
    return persona.idPersona;
  } catch (error) {
    console.error('Error al crear persona genérica:', error);
    throw new Error('No se pudo crear persona genérica');
  }
}

// ✅ NUEVO: Función para generar legajo único de picker
async function generarLegajoPicker() {
  try {
    // Buscar el último legajo creado con formato LP###
    const ultimoPicker = await EncargadoPicker.findOne({
      where: {
        legajo: {
          [sequelize.Sequelize.Op.like]: 'LP%'
        }
      },
      order: [['legajo', 'DESC']]
    });

    let nuevoNumero = 1;
    
    if (ultimoPicker && ultimoPicker.legajo) {
      // Extraer el número del legajo (ej: "LP007" -> 7)
      const numeroActual = parseInt(ultimoPicker.legajo.substring(2));
      if (!isNaN(numeroActual)) {
        nuevoNumero = numeroActual + 1;
      }
    }

    // Formatear con padding de 3 dígitos (ej: 1 -> "001", 15 -> "015")
    const legajo = `LP${String(nuevoNumero).padStart(3, '0')}`;
    console.log(`📋 Legajo generado: ${legajo}`);
    return legajo;
  } catch (error) {
    console.error("Error al generar legajo:", error);
    throw new Error("No se pudo generar el legajo");
  }
}

// ✅ NUEVO: Función para gestionar alta/baja de picker
async function gestionarRolPicker(usuario, rolesIds) {
  const ID_ROL_PICKER = 6; // ID del rol Picker según tu BD
  const tieneRolPicker = rolesIds.includes(ID_ROL_PICKER);
  
  try {
    // Verificar si el usuario ya tiene registro en encargadopicker
    const pickerExistente = await EncargadoPicker.findOne({
      where: { idPersona: usuario.idPersona }
    });

    if (tieneRolPicker && !pickerExistente) {
      // ✅ ALTA: Usuario recibe rol Picker por primera vez
      if (!usuario.idPersona) {
        throw new Error("El usuario debe tener una persona asociada para ser Picker");
      }

      const legajo = await generarLegajoPicker();
      
      await EncargadoPicker.create({
        legajo: legajo,
        idPersona: usuario.idPersona
      });

      console.log(`✅ Picker creado: legajo=${legajo}, idPersona=${usuario.idPersona}`);
      return { accion: 'ALTA', legajo };
      
    } else if (!tieneRolPicker && pickerExistente) {
      // ✅ BAJA: Usuario pierde rol Picker (opcional: eliminar o mantener)
      // Por ahora solo registramos en consola, no eliminamos por integridad referencial
      console.log(`⚠️ Usuario perdió rol Picker, pero se mantiene legajo ${pickerExistente.legajo}`);
      return { accion: 'BAJA', legajo: pickerExistente.legajo };
    }

    return { accion: 'NINGUNA' };
  } catch (error) {
    console.error("Error al gestionar rol picker:", error);
    throw error;
  }
}

// Función de validación de contraseña
function validarPassword(password) {
  if (!password || password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/\d/.test(password)) {
    return 'La contraseña debe contener al menos 1 número.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'La contraseña debe contener al menos 1 letra.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'La contraseña debe contener al menos 1 carácter especial.';
  }
  return null;
}

// ✅ NUEVO: Obtener todos los tipos de rol disponibles
router.get("/tipos-rol", async (req, res) => {
  try {
    const tiposRol = await TipoRol.findAll({
      attributes: ["idTipoRol", "tipoRol", "descripcionRol"],
      order: [["tipoRol", "ASC"]]
    });
    res.json(tiposRol);
  } catch (error) {
    console.error("Error al obtener tipos de rol:", error);
    res.status(500).json({ error: "Error al obtener tipos de rol" });
  }
});

// ✅ NUEVO: Obtener motivos de inactivación de usuarios
router.get("/motivos-inactivacion", async (req, res) => {
  try {
    const motivos = await MotivoInactivacionUsuario.findAll({
      where: { activo: 1 },
      attributes: ["idMotivo", "descripcion"],
      order: [["idMotivo", "ASC"]]
    });
    res.json(motivos);
  } catch (error) {
    console.error("Error al obtener motivos de inactivación:", error);
    res.status(500).json({ error: "Error al obtener motivos de inactivación" });
  }
});

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const incluirInactivos = req.query.incluirInactivos === 'true';
    const soloInactivos = req.query.soloInactivos === 'true';
    
    // Si solo inactivos
    if (soloInactivos) {
      const usuarios = await sequelize.query(`
        SELECT 
          u.idUsuario,
          u.nombreUsuario,
          u.estaActivo,
          GROUP_CONCAT(tr.idTipoRol ORDER BY tr.idTipoRol) as rolesIds,
          GROUP_CONCAT(tr.tipoRol ORDER BY tr.idTipoRol SEPARATOR '|||') as rolesNombres
        FROM usuario u
        LEFT JOIN usuario_tiporol utr ON u.idUsuario = utr.idUsuario
        LEFT JOIN tiporol tr ON utr.idTipoRol = tr.idTipoRol
        WHERE u.estaActivo = 0
        GROUP BY u.idUsuario, u.nombreUsuario, u.estaActivo
        ORDER BY u.idUsuario
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      const usuariosFormateados = usuarios.map((u) => ({
        id: u.idUsuario,
        username: u.nombreUsuario,
        roles: u.rolesNombres ? u.rolesNombres.split('|||') : [],
        rolesIds: u.rolesIds ? u.rolesIds.split(',').map(Number) : [],
        estaActivo: false
      }));

      console.log(`📋 Devolviendo ${usuariosFormateados.length} usuarios INACTIVOS`);
      return res.json(usuariosFormateados);
    }
    
    // Si incluye inactivos (TODOS)
    if (incluirInactivos) {
      // Incluir todos
      const usuarios = await Usuario.findAll({
        include: {
          model: TipoRol,
          as: "roles",
          attributes: ["idTipoRol", "tipoRol"],
          through: { attributes: [] }
        },
      });

      const usuariosFormateados = usuarios.map((u) => ({
        id: u.idUsuario,
        username: u.nombreUsuario,
        roles: u.roles.map(r => r.tipoRol),
        rolesIds: u.roles.map(r => r.idTipoRol),
        estaActivo: u.estaActivo === 1 || u.estaActivo === true || u.estaActivo === null
      }));

      console.log(`📋 Devolviendo ${usuariosFormateados.length} usuarios TODOS`);
      return res.json(usuariosFormateados);
    } else {
      // Solo activos (estaActivo = 1 o NULL)
      const usuarios = await sequelize.query(`
        SELECT 
          u.idUsuario,
          u.nombreUsuario,
          u.estaActivo,
          GROUP_CONCAT(tr.idTipoRol ORDER BY tr.idTipoRol) as rolesIds,
          GROUP_CONCAT(tr.tipoRol ORDER BY tr.idTipoRol SEPARATOR '|||') as rolesNombres
        FROM usuario u
        LEFT JOIN usuario_tiporol utr ON u.idUsuario = utr.idUsuario
        LEFT JOIN tiporol tr ON utr.idTipoRol = tr.idTipoRol
        WHERE COALESCE(u.estaActivo, 1) = 1
        GROUP BY u.idUsuario, u.nombreUsuario, u.estaActivo
        ORDER BY u.idUsuario
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      const usuariosFormateados = usuarios.map((u) => ({
        id: u.idUsuario,
        username: u.nombreUsuario,
        roles: u.rolesNombres ? u.rolesNombres.split('|||') : [],
        rolesIds: u.rolesIds ? u.rolesIds.split(',').map(Number) : [],
        estaActivo: true
      }));

      console.log(`📋 Devolviendo ${usuariosFormateados.length} usuarios ACTIVOS`);
      return res.json(usuariosFormateados);
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear usuario
router.post("/", async (req, res) => {
  const { username, password, roles } = req.body; // ✅ Ahora recibe array: roles: [2, 8]
  const t = await sequelize.transaction();
  
  try {
    // Validar que el nombre de usuario no exista (case-insensitive)
    const usuarioExistente = await Usuario.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nombreUsuario')),
        sequelize.fn('LOWER', username)
      )
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: `Ya existe un usuario con el nombre: ${username} (no se distingue entre mayúsculas y minúsculas)` 
      });
    }

    // Validar contraseña
    const errorPassword = validarPassword(password);
    if (errorPassword) {
      return res.status(400).json({ error: errorPassword });
    }

    // Validar que se enviaron roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Debe asignar al menos un rol" });
    }

    // Verificar que todos los roles existen
    const rolesDB = await TipoRol.findAll({
      where: { idTipoRol: roles },
      transaction: t
    });

    if (rolesDB.length !== roles.length) {
      await t.rollback();
      return res.status(400).json({ error: "Uno o más roles no son válidos" });
    }

    // ✅ NUEVO: Si el usuario tiene rol Picker (ID=6), crear persona genérica
    const ID_ROL_PICKER = 6;
    const tieneRolPicker = roles.includes(ID_ROL_PICKER);
    let idPersonaAsignada = null;

    if (tieneRolPicker) {
      console.log(`🔧 Usuario ${username} tiene rol Picker, creando persona genérica...`);
      idPersonaAsignada = await crearPersonaGenerica(username);
    }

    // Crear usuario con idPersona si corresponde
    const nuevoUsuario = await Usuario.create({
      nombreUsuario: username,
      contrasena: password,
      idPersona: idPersonaAsignada // NULL si no es picker, o ID de persona si lo es
    }, { transaction: t });

    // Asignar roles mediante la tabla intermedia usuario_tiporol
    await nuevoUsuario.setRoles(roles, { transaction: t }); // Sequelize maneja el INSERT en usuario_tiporol

    // ✅ NUEVO: Gestionar alta de picker si corresponde
    let resultadoPicker = { accion: 'NINGUNA' };
    if (nuevoUsuario.idPersona) {
      resultadoPicker = await gestionarRolPicker(nuevoUsuario, roles);
      console.log(`✅ Resultado gestión picker:`, resultadoPicker);
    }

    // Obtener usuario con roles para responder
    const usuarioConRoles = await Usuario.findByPk(nuevoUsuario.idUsuario, {
      include: {
        model: TipoRol,
        as: "roles",
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] }
      },
      transaction: t
    });

    await t.commit();
    
    res.json({ 
      id: usuarioConRoles.idUsuario, 
      username: usuarioConRoles.nombreUsuario, 
      roles: usuarioConRoles.roles.map(r => r.tipoRol),
      picker: resultadoPicker.accion === 'ALTA' ? { legajo: resultadoPicker.legajo } : null
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear usuario:", error);
    res.status(400).json({ error: error.message || "No se pudo crear el usuario" });
  }
});

// Eliminar usuario - OBSOLETO: Ahora se usa inactivación
router.delete("/:id", async (req, res) => {
  return res.status(400).json({ 
    error: "Eliminación directa no permitida",
    message: "Los usuarios deben inactivarse en lugar de eliminarse. Use el endpoint PATCH /:id/inactivar"
  });
});

// Actualizar usuario (nombre de usuario y roles)
router.put("/:id", async (req, res) => {
  const { username, roles } = req.body; // ✅ Ahora recibe array: roles: [2, 8]
  try {
    // Validar que el nombre de usuario no exista en otro usuario (case-insensitive)
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('nombreUsuario')),
            sequelize.fn('LOWER', username)
          ),
          {
            idUsuario: {
              [Op.ne]: req.params.id
            }
          }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: `Ya existe otro usuario con el nombre: ${username} (no se distingue entre mayúsculas y minúsculas)` 
      });
    }

    // Validar que se enviaron roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "Debe asignar al menos un rol" });
    }

    // Verificar que todos los roles existen
    const rolesDB = await TipoRol.findAll({
      where: { idTipoRol: roles }
    });

    if (rolesDB.length !== roles.length) {
      return res.status(400).json({ error: "Uno o más roles no son válidos" });
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar nombre de usuario
    await usuario.update({ nombreUsuario: username });

    // Actualizar roles (reemplaza los anteriores)
    await usuario.setRoles(roles); // Sequelize hace DELETE + INSERT en usuario_tiporol

    // ✅ NUEVO: Gestionar alta/baja de picker según cambios en roles
    let resultadoPicker = { accion: 'NINGUNA' };
    if (usuario.idPersona) {
      resultadoPicker = await gestionarRolPicker(usuario, roles);
    } else if (roles.includes(6)) { // Si intentan asignar rol Picker pero no tiene idPersona
      console.warn(`⚠️ Usuario ${usuario.nombreUsuario} recibió rol Picker pero no tiene idPersona asociado`);
    }

    res.json({ 
      success: true,
      picker: resultadoPicker.accion !== 'NINGUNA' ? resultadoPicker : null
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(400).json({ error: "No se pudo actualizar el usuario" });
  }
});

// Cambiar contraseña
router.put("/:id/password", async (req, res) => {
  const { password } = req.body;
  try {
    // Validar contraseña
    const errorPassword = validarPassword(password);
    if (errorPassword) {
      return res.status(400).json({ error: errorPassword });
    }

    const [updated] = await Usuario.update(
      { contrasena: password },
      { where: { idUsuario: req.params.id } }
    );
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(400).json({ error: "No se pudo cambiar la contraseña" });
  }
});

// Validar si un usuario existe y está activo
router.get("/validate", async (req, res) => {
  const { username } = req.query;
  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario: username },
      include: {
        model: TipoRol,
        as: "roles",
        attributes: ["tipoRol"],
        through: { attributes: [] }
      },
    });

    if (usuario) {
      res.json({ 
        valid: true, 
        roles: usuario.roles.map(r => r.tipoRol) // Array: ["Vendedor", "Admin"]
      });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error("Error al validar usuario:", error);
    res.status(500).json({ error: "Error al validar usuario" });
  }
});

// ========== NUEVOS ENDPOINTS PARA SISTEMA DE USUARIOS INACTIVOS ==========

// Obtener pedidos activos de un usuario
router.get("/:id/pedidos-activos", async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const ESTADOS_ACTIVOS = [1, 2, 3, 4]; // En curso, Pendiente de Pago, Abonado, Despachado

    // ✅ Buscar pedidos donde el usuario es:
    // 1. El creador del pedido (idUsuarioCreo) - VENDEDORES
    // 2. El picker asignado (via asignacion_picking) - PICKERS
    const resultados = await sequelize.query(`
      SELECT DISTINCT
        p.numeroPedido,
        p.fechaPedido,
        p.idEstado,
        ep_estado.tipoEstado as nombreEstado,
        p.idCliente,
        CONCAT(per.nombre, ' ', per.apellido) as nombreCliente
      FROM pedido p
      LEFT JOIN cliente c ON p.idCliente = c.idCliente
      LEFT JOIN persona per ON c.idPersona = per.idPersona
      LEFT JOIN estadopedido ep_estado ON p.idEstado = ep_estado.idEstado
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = p.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario upicker ON ep.idPersona = upicker.idPersona
      WHERE p.idEstado IN (:estadosActivos)
        AND p.estaActivo = 1
        AND (
          p.idUsuarioCreo = :idUsuario  -- Usuario creó el pedido (vendedor)
          OR upicker.idUsuario = :idUsuario  -- Usuario es el picker asignado
        )
      ORDER BY p.fechaPedido DESC
    `, {
      replacements: { idUsuario, estadosActivos: ESTADOS_ACTIVOS },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`📦 Pedidos activos del usuario ${idUsuario}:`);
    console.log(`   - Total pedidos únicos: ${resultados.length}`);
    console.log(`   - Detalle: ${resultados.map(p => `${p.numeroPedido} (${p.nombreEstado || 'Estado ' + p.idEstado})`).join(', ')}`);

    res.json({
      count: resultados.length,
      pedidos: resultados
    });
  } catch (error) {
    console.error("Error al obtener pedidos activos:", error);
    res.status(500).json({ error: "Error al obtener pedidos activos" });
  }
});

// Obtener roles de un usuario específico
router.get("/:id/roles", async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: {
        model: TipoRol,
        as: "roles",
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const rolesIds = usuario.roles.map(r => r.idTipoRol);
    const rolesNombres = usuario.roles.map(r => r.tipoRol);

    console.log(`📋 Roles del usuario ${usuario.nombreUsuario}:`, {
      rolesIds,
      rolesNombres
    });

    res.json({
      rolesIds,
      rolesNombres
    });
  } catch (error) {
    console.error("Error al obtener roles del usuario:", error);
    res.status(500).json({ error: "Error al obtener roles del usuario" });
  }
});

// Obtener usuarios por roles (para reasignación)
router.get("/por-roles", async (req, res) => {
  try {
    const rolesIds = req.query.rolesIds ? req.query.rolesIds.split(',').map(Number) : [];
    const excluirId = req.query.excluirId ? parseInt(req.query.excluirId) : null;

    console.log('🔍 Buscando usuarios compatibles:');
    console.log('   - Roles requeridos:', rolesIds);
    console.log('   - Excluir usuario ID:', excluirId);

    if (rolesIds.length === 0) {
      return res.status(400).json({ error: "Debe especificar al menos un rol" });
    }

    // Buscar usuarios que tengan TODOS los roles especificados y estén activos
    // ✅ SIN desestructuración - sequelize.query con QueryTypes.SELECT retorna directamente el array
    const usuarios = await sequelize.query(`
      SELECT 
        u.idUsuario as id,
        u.nombreUsuario as username,
        GROUP_CONCAT(tr.tipoRol ORDER BY tr.tipoRol SEPARATOR ', ') as roles
      FROM usuario u
      JOIN usuario_tiporol utr ON u.idUsuario = utr.idUsuario
      JOIN tiporol tr ON utr.idTipoRol = tr.idTipoRol
      WHERE u.estaActivo = 1
        ${excluirId ? 'AND u.idUsuario != :excluirId' : ''}
        AND u.idUsuario IN (
          SELECT idUsuario 
          FROM usuario_tiporol 
          WHERE idTipoRol IN (:rolesIds)
          GROUP BY idUsuario
          HAVING COUNT(DISTINCT idTipoRol) = :countRoles
        )
      GROUP BY u.idUsuario, u.nombreUsuario
      ORDER BY u.nombreUsuario
    `, {
      replacements: { 
        rolesIds, 
        countRoles: rolesIds.length,
        excluirId 
      },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Encontrados ${usuarios.length} usuarios compatibles:`, usuarios);

    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios por roles:", error);
    res.status(500).json({ error: "Error al obtener usuarios por roles" });
  }
});

// Inactivar usuario (solo si no tiene pedidos activos)
router.patch("/:id/inactivar", verificarAccesoPedidos, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const idUsuario = req.params.id;
    const { idMotivoInactivacion, observacionInactivacion } = req.body; // ✅ Recibir motivo y observación
    const ESTADOS_ACTIVOS = [1, 2, 3, 4];

    // Validar motivo (requerido)
    if (!idMotivoInactivacion) {
      await t.rollback();
      return res.status(400).json({ error: "Debe especificar el motivo de inactivación" });
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(idUsuario, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si ya está inactivo
    if (usuario.estaActivo === 0 || usuario.estaActivo === false) {
      await t.rollback();
      return res.status(400).json({ error: "El usuario ya está inactivo" });
    }

    // Verificar que el motivo existe
    const motivo = await MotivoInactivacionUsuario.findByPk(idMotivoInactivacion, { transaction: t });
    if (!motivo) {
      await t.rollback();
      return res.status(404).json({ error: "Motivo de inactivación no encontrado" });
    }

    // Verificar pedidos activos (tanto creados como asignados via picking)
    const [pedidosActivos] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.numeroPedido) as total
      FROM pedido p
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = p.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario upicker ON ep.idPersona = upicker.idPersona
      WHERE p.idEstado IN (:estadosActivos)
        AND p.estaActivo = 1
        AND (
          p.idUsuarioCreo = :idUsuario
          OR upicker.idUsuario = :idUsuario
        )
    `, {
      replacements: { idUsuario, estadosActivos: ESTADOS_ACTIVOS },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (pedidosActivos.total > 0) {
      await t.rollback();
      return res.status(400).json({
        error: "No se puede inactivar el usuario",
        message: `Este usuario tiene ${pedidosActivos.total} pedido(s) activo(s). Debe reasignarlos primero.`,
        tipo: "TIENE_PEDIDOS_ACTIVOS",
        cantidadPedidos: pedidosActivos.total
      });
    }

    // Marcar como inactivo con motivo y fecha
    await Usuario.update(
      { 
        estaActivo: 0,
        idMotivoInactivacion,
        fechaInactivacion: new Date(),
        observacionInactivacion: observacionInactivacion || null
      },
      { where: { idUsuario }, transaction: t }
    );

    // ✅ NUEVO: Registrar en historial
    await sequelize.query(
      `INSERT INTO usuario_historial_estado 
        (idUsuario, estaActivo, fechaCambio, idUsuarioModifico, idMotivoInactivacion, observaciones) 
      VALUES (?, 0, NOW(), ?, ?, ?)`,
      {
        replacements: [idUsuario, req.usuarioAutenticado?.idUsuario || null, idMotivoInactivacion, observacionInactivacion || null],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    console.log(`✅ Usuario ${usuario.nombreUsuario} marcado como inactivo`);
    console.log(`   Motivo: ${motivo.descripcion}`);
    res.json({ 
      success: true, 
      message: "Usuario inactivado correctamente",
      motivo: motivo.descripcion
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al inactivar usuario:", error);
    res.status(500).json({ error: "Error al inactivar usuario" });
  }
});

// Reasignar pedidos activos e inactivar usuario
router.post("/reasignar-y-inactivar", verificarAccesoPedidos, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idUsuarioOrigen, idUsuarioDestino, idMotivoInactivacion, observacionInactivacion } = req.body;
    const ESTADOS_ACTIVOS = [1, 2, 3, 4];

    // Validar parámetros
    if (!idUsuarioOrigen || !idUsuarioDestino) {
      await t.rollback();
      return res.status(400).json({ 
        error: "Debe especificar idUsuarioOrigen e idUsuarioDestino" 
      });
    }

    if (!idMotivoInactivacion) {
      await t.rollback();
      return res.status(400).json({ 
        error: "Debe especificar el motivo de inactivación" 
      });
    }

    if (idUsuarioOrigen === idUsuarioDestino) {
      await t.rollback();
      return res.status(400).json({ 
        error: "El usuario origen y destino no pueden ser el mismo" 
      });
    }

    // Verificar que el motivo existe
    const motivo = await MotivoInactivacionUsuario.findByPk(idMotivoInactivacion, { transaction: t });
    if (!motivo) {
      await t.rollback();
      return res.status(404).json({ error: "Motivo de inactivación no encontrado" });
    }

    // Verificar que ambos usuarios existen
    const [usuarioOrigen, usuarioDestino] = await Promise.all([
      Usuario.findByPk(idUsuarioOrigen, {
        include: { model: TipoRol, as: "roles", through: { attributes: [] } },
        transaction: t
      }),
      Usuario.findByPk(idUsuarioDestino, {
        include: { model: TipoRol, as: "roles", through: { attributes: [] } },
        transaction: t
      })
    ]);

    if (!usuarioOrigen) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario origen no encontrado" });
    }

    if (!usuarioDestino) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario destino no encontrado" });
    }

    // Verificar que usuario destino esté activo
    if (usuarioDestino.estaActivo === 0 || usuarioDestino.estaActivo === false) {
      await t.rollback();
      return res.status(400).json({ 
        error: "El usuario destino debe estar activo" 
      });
    }

    // Verificar que usuario destino tenga los mismos roles
    const rolesOrigen = usuarioOrigen.roles.map(r => r.idTipoRol).sort();
    const rolesDestino = usuarioDestino.roles.map(r => r.idTipoRol).sort();

    const tieneLosMismosRoles = rolesOrigen.length === rolesDestino.length &&
      rolesOrigen.every((rol, index) => rol === rolesDestino[index]);

    if (!tieneLosMismosRoles) {
      await t.rollback();
      return res.status(400).json({
        error: "El usuario destino debe tener exactamente los mismos roles que el usuario origen",
        rolesOrigen: usuarioOrigen.roles.map(r => r.tipoRol),
        rolesDestino: usuarioDestino.roles.map(r => r.tipoRol)
      });
    }

    // 🔍 ANTES DE REASIGNAR: Contar pedidos únicos del usuario ORIGEN
    const [conteoAntes] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.numeroPedido) as totalOrigen
      FROM pedido p
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = p.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario upicker ON ep.idPersona = upicker.idPersona
      WHERE p.idEstado IN (:estadosActivos)
        AND p.estaActivo = 1
        AND (
          p.idUsuarioCreo = :idUsuarioOrigen
          OR upicker.idUsuario = :idUsuarioOrigen
        )
    `, {
      replacements: { 
        idUsuarioOrigen,
        estadosActivos: ESTADOS_ACTIVOS 
      },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    console.log(`📊 ANTES de reasignar: Usuario origen tiene ${conteoAntes.totalOrigen} pedidos únicos activos`);

    // 1. Reasignar pedidos donde el usuario es el creador
    const [resultadoPedidos] = await sequelize.query(`
      UPDATE pedido
      SET 
        idUsuarioCreo = :idUsuarioDestino,
        idUsuarioModifico = :idUsuarioDestino,
        fechaModificacion = NOW()
      WHERE idUsuarioCreo = :idUsuarioOrigen
        AND idEstado IN (:estadosActivos)
        AND estaActivo = 1
    `, {
      replacements: { 
        idUsuarioOrigen, 
        idUsuarioDestino, 
        estadosActivos: ESTADOS_ACTIVOS 
      },
      transaction: t
    });

    // 2. Reasignar asignaciones de picking
    // Primero obtener los legajos de ambos usuarios (si son pickers)
    const [pickerOrigen] = await sequelize.query(`
      SELECT ep.legajo
      FROM encargadopicker ep
      JOIN usuario u ON ep.idPersona = u.idPersona
      WHERE u.idUsuario = :idUsuario
    `, {
      replacements: { idUsuario: idUsuarioOrigen },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    const [pickerDestino] = await sequelize.query(`
      SELECT ep.legajo
      FROM encargadopicker ep
      JOIN usuario u ON ep.idPersona = u.idPersona
      WHERE u.idUsuario = :idUsuario
    `, {
      replacements: { idUsuario: idUsuarioDestino },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    let pedidosPickingReasignados = 0;
    if (pickerOrigen && pickerDestino) {
      // Reasignar picking solo si ambos son pickers
      // ✅ Reasignar TODAS las asignaciones activas, incluso si picking está completado
      const [resultadoPicking] = await sequelize.query(`
        UPDATE asignacion_picking ap
        JOIN pedido p ON ap.numeroPedido = p.numeroPedido
        SET ap.legajoPicker = :legajoDestino
        WHERE ap.legajoPicker = :legajoOrigen
          AND p.idEstado IN (:estadosActivos)
          AND p.estaActivo = 1
      `, {
        replacements: {
          legajoOrigen: pickerOrigen.legajo,
          legajoDestino: pickerDestino.legajo,
          estadosActivos: ESTADOS_ACTIVOS
        },
        transaction: t
      });
      pedidosPickingReasignados = resultadoPicking.affectedRows || 0;
    }
    
    console.log(`📋 Reasignación completada:`);
    console.log(`   - Pedidos creados actualizados (idUsuarioCreo): ${resultadoPedidos.affectedRows || 0}`);
    console.log(`   - Asignaciones de picking actualizadas: ${pedidosPickingReasignados}`);
    console.log(`   - Nota: Un pedido puede aparecer en ambos si el usuario es creador Y picker`);

    // 🔍 LOGS DETALLADOS: Listar pedidos específicos reasignados
    const pedidosReasignadosDetalle = await sequelize.query(`
      SELECT DISTINCT p.numeroPedido, p.idEstado, ep_estado.tipoEstado
      FROM pedido p
      LEFT JOIN estadopedido ep_estado ON p.idEstado = ep_estado.idEstado
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = p.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario upicker ON ep.idPersona = upicker.idPersona
      WHERE p.idEstado IN (:estadosActivos)
        AND p.estaActivo = 1
        AND (
          p.idUsuarioCreo = :idUsuarioDestino
          OR upicker.idUsuario = :idUsuarioDestino
        )
      ORDER BY p.numeroPedido
    `, {
      replacements: { 
        idUsuarioDestino,
        estadosActivos: ESTADOS_ACTIVOS 
      },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    console.log(`📦 Pedidos ahora asignados a ${usuarioDestino.nombreUsuario} (${pedidosReasignadosDetalle.length} total):`, 
      pedidosReasignadosDetalle.map(p => `${p.numeroPedido} (${p.tipoEstado})`).join(', '));

    // 🔍 VERIFICACIÓN: Contar si quedaron pedidos sin reasignar
    const [verificacion] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.numeroPedido) as totalPendientes
      FROM pedido p
      LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
        AND ap.idAsignacion = (
          SELECT MAX(ap2.idAsignacion) 
          FROM asignacion_picking ap2 
          WHERE ap2.numeroPedido = p.numeroPedido
        )
      LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
      LEFT JOIN usuario upicker ON ep.idPersona = upicker.idPersona
      WHERE p.idEstado IN (:estadosActivos)
        AND p.estaActivo = 1
        AND (
          p.idUsuarioCreo = :idUsuarioOrigen
          OR upicker.idUsuario = :idUsuarioOrigen
        )
    `, {
      replacements: { 
        idUsuarioOrigen,
        estadosActivos: ESTADOS_ACTIVOS 
      },
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (verificacion.totalPendientes > 0) {
      console.error(`⚠️ ADVERTENCIA: Quedaron ${verificacion.totalPendientes} pedidos SIN reasignar`);
      await t.rollback();
      return res.status(500).json({
        error: "Error en la reasignación",
        message: `Quedaron ${verificacion.totalPendientes} pedidos sin reasignar correctamente. Operación cancelada.`
      });
    }

    // 📊 EL NÚMERO CORRECTO de pedidos reasignados es el que tenía el usuario ORIGEN
    // (que ya contamos al principio con conteoAntes)
    const pedidosUnicosReasignados = conteoAntes.totalOrigen;
    
    console.log(`✅ Verificación exitosa: Todos los ${pedidosUnicosReasignados} pedidos del usuario origen fueron reasignados`);

    // Marcar usuario origen como inactivo con motivo y fecha
    await Usuario.update(
      { 
        estaActivo: 0,
        idMotivoInactivacion,
        fechaInactivacion: new Date(),
        observacionInactivacion: observacionInactivacion || null
      },
      { where: { idUsuario: idUsuarioOrigen }, transaction: t }
    );

    // ✅ NUEVO: Registrar en historial
    await sequelize.query(
      `INSERT INTO usuario_historial_estado 
        (idUsuario, estaActivo, fechaCambio, idUsuarioModifico, idMotivoInactivacion, observaciones) 
      VALUES (?, 0, NOW(), ?, ?, ?)`,
      {
        replacements: [idUsuarioOrigen, req.usuarioAutenticado?.idUsuario || null, idMotivoInactivacion, observacionInactivacion || null],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    console.log(`✅ Usuario ${usuarioOrigen.nombreUsuario} marcado como inactivo`);
    console.log(`   Motivo: ${motivo.descripcion}`);
    console.log(`✅ Reasignados ${pedidosUnicosReasignados} pedidos únicos a ${usuarioDestino.nombreUsuario}`);

    res.json({
      success: true,
      message: "Pedidos reasignados y usuario inactivado correctamente",
      pedidosReasignados: pedidosUnicosReasignados, // ✅ Contador preciso sin duplicados
      usuarioOrigen: usuarioOrigen.nombreUsuario,
      usuarioDestino: usuarioDestino.nombreUsuario
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al reasignar pedidos e inactivar usuario:", error);
    res.status(500).json({ error: "Error al reasignar pedidos e inactivar usuario" });
  }
});

// Reactivar usuario
router.patch("/:id/reactivar", verificarAccesoPedidos, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const idUsuario = req.params.id;

    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(idUsuario, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si ya está activo
    if (usuario.estaActivo === 1 || usuario.estaActivo === true) {
      await t.rollback();
      return res.status(400).json({ error: "El usuario ya está activo" });
    }

    // Reactivar y limpiar campos de inactivación
    await Usuario.update(
      { 
        estaActivo: 1,
        idMotivoInactivacion: null,
        fechaInactivacion: null,
        observacionInactivacion: null
      },
      { where: { idUsuario }, transaction: t }
    );

    // ✅ NUEVO: Registrar en historial
    await sequelize.query(
      `INSERT INTO usuario_historial_estado 
        (idUsuario, estaActivo, fechaCambio, idUsuarioModifico, observaciones) 
      VALUES (?, 1, NOW(), ?, 'Usuario reactivado')`,
      {
        replacements: [idUsuario, req.usuarioAutenticado?.idUsuario || null],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );

    await t.commit();
    console.log(`✅ Usuario ${usuario.nombreUsuario} reactivado`);
    res.json({ 
      success: true, 
      message: "Usuario reactivado correctamente" 
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al reactivar usuario:", error);
    res.status(500).json({ error: "Error al reactivar usuario" });
  }
});

// ✅ NUEVO: Obtener historial de activaciones/inactivaciones de un usuario
router.get("/:id/historial", async (req, res) => {
  const { id } = req.params;
  console.log(`📊 Obteniendo historial de estado para usuario ID: ${id}`);
  
  try {
    const historial = await sequelize.query(
      `SELECT 
        h.idHistorial,
        h.idUsuario,
        h.estaActivo,
        h.fechaCambio,
        h.idUsuarioModifico,
        COALESCE(u.nombreUsuario, 'Sistema') AS usuarioModifico,
        h.idMotivoInactivacion,
        m.descripcion AS motivoDescripcion,
        h.observaciones
      FROM usuario_historial_estado h
      LEFT JOIN usuario u ON h.idUsuarioModifico = u.idUsuario
      LEFT JOIN motivo_inactivacion_usuario m ON h.idMotivoInactivacion = m.idMotivo
      WHERE h.idUsuario = ?
      ORDER BY h.fechaCambio DESC`,
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log(`✅ Historial obtenido: ${historial.length} registros`);
    res.json(historial);
    
  } catch (error) {
    console.error("❌ Error al obtener historial de usuario:", error);
    res.status(500).json({ 
      error: "Error al obtener historial de usuario", 
      detalle: error.message 
    });
  }
});

module.exports = router;
