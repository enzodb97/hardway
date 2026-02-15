const express = require('express');
const router = express.Router();
const { Usuario, TipoRol, sequelize, EncargadoPicker, Persona } = require('../models'); // ✅ Agregados EncargadoPicker y Persona
const { Domicilio } = require('../models/Ubicacion'); // ✅ Importar Domicilio

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

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: {
        model: TipoRol,
        as: "roles", // ✅ Usar alias definido en la relación N:M
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] } // No incluir campos de la tabla intermedia
      },
    });

    // Formatea la respuesta para el frontend
    const usuariosFormateados = usuarios.map((u) => ({
      id: u.idUsuario,
      username: u.nombreUsuario,
      roles: u.roles.map(r => r.tipoRol), // Array de strings: ["Vendedor", "Admin"]
      rolesIds: u.roles.map(r => r.idTipoRol) // Array de IDs: [2, 8]
    }));

    res.json(usuariosFormateados);
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

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const idUsuario = req.params.id;

    // 1. Primero eliminar las relaciones en usuario_tiporol
    await sequelize.query(
      'DELETE FROM usuario_tiporol WHERE idUsuario = :idUsuario',
      {
        replacements: { idUsuario },
        type: sequelize.QueryTypes.DELETE,
        transaction: t
      }
    );

    // 2. Luego eliminar el usuario
    await Usuario.destroy({ 
      where: { idUsuario },
      transaction: t
    });

    await t.commit();
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar usuario:", error);
    res.status(400).json({ error: "No se pudo eliminar el usuario" });
  }
});

// Actualizar usuario (nombre de usuario y roles)
router.put("/:id", async (req, res) => {
  const { username, roles } = req.body; // ✅ Ahora recibe array: roles: [2, 8]
  try {
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

module.exports = router;
