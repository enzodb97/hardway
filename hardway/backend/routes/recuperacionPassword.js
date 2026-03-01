const express = require('express');
const router = express.Router();
const { Usuario, SolicitudRecuperacionPassword, MotivoRecuperacionPassword } = require('../models');
const { Op } = require('sequelize');

// ✅ Endpoint 0: Obtener catálogo de motivos (PÚBLICO)
router.get('/motivos', async (req, res) => {
  try {
    const motivos = await MotivoRecuperacionPassword.findAll({
      where: { activo: true },
      attributes: ['idMotivo', 'descripcion'],
      order: [['orden', 'ASC']]
    });

    res.json(motivos);
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    res.status(500).json({ error: 'Error al obtener motivos' });
  }
});

// ✅ Endpoint 1: Solicitar restablecimiento (PÚBLICO - no requiere auth)
router.post('/solicitar', async (req, res) => {
  const { nombreUsuario, idMotivo, motivoSolicitud } = req.body;
  const ipOrigen = req.ip || req.connection.remoteAddress;

  // Validación
  if (!nombreUsuario) {
    return res.status(400).json({ error: 'Debe ingresar un nombre de usuario' });
  }

  try {
    // ✅ Verificar que el usuario EXISTE
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      attributes: ['idUsuario', 'nombreUsuario', 'estaActivo']
    });

    if (!usuario) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        codigo: 'USUARIO_NO_EXISTE'
      });
    }

    // ✅ Verificar que el usuario esté ACTIVO
    if (usuario.estaActivo === 0 || usuario.estaActivo === false) {
      return res.status(403).json({ 
        error: 'Usuario inactivo. Consulte con el administrador.',
        codigo: 'USUARIO_INACTIVO'
      });
    }

    // ✅ Verificar que NO tenga solicitud PENDIENTE o APROBADA reciente
    const solicitudExistente = await SolicitudRecuperacionPassword.findOne({
      where: {
        idUsuario: usuario.idUsuario,
        estado: ['PENDIENTE', 'APROBADA'],
        fechaExpiracion: { [Op.gt]: new Date() }
      }
    });

    if (solicitudExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una solicitud pendiente para este usuario',
        codigo: 'SOLICITUD_EXISTENTE'
      });
    }

    // ✅ Validar motivo si viene idMotivo
    if (idMotivo) {
      const motivoValido = await MotivoRecuperacionPassword.findByPk(idMotivo);
      if (!motivoValido) {
        return res.status(400).json({ 
          error: 'Motivo no válido',
          codigo: 'MOTIVO_INVALIDO'
        });
      }
    }

    // ✅ Crear nueva solicitud (SIN código todavía - se genera al aprobar)
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24); // 24 horas

    const nuevaSolicitud = await SolicitudRecuperacionPassword.create({
      idUsuario: usuario.idUsuario,
      idMotivo: idMotivo || null,
      motivoSolicitud: motivoSolicitud || null,
      codigo: '0000', // Placeholder - se genera al aprobar
      estado: 'PENDIENTE',
      fechaExpiracion,
      ipOrigen
    });

    console.log(`📬 Nueva solicitud de recuperación - Usuario: ${nombreUsuario}, ID: ${nuevaSolicitud.idSolicitud}`);

    res.json({
      mensaje: 'Solicitud enviada correctamente',
      idSolicitud: nuevaSolicitud.idSolicitud
    });

  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// ✅ Endpoint 2: Verificar código de recuperación (PÚBLICO)
router.post('/verificar-codigo', async (req, res) => {
  let { nombreUsuario, codigo } = req.body;

  // Limpiar espacios en blanco
  if (nombreUsuario) nombreUsuario = nombreUsuario.trim();
  if (codigo) codigo = codigo.trim();

  try {
    // Validar datos requeridos
    if (!nombreUsuario || !codigo) {
      return res.status(400).json({ error: 'Nombre de usuario y código son requeridos' });
    }

    // Validar formato del código
    if (codigo.length !== 4 || !/^\d{4}$/.test(codigo)) {
      return res.status(400).json({ error: 'Código inválido (debe ser 4 dígitos)' });
    }

    console.log('🔍 Verificando código - Usuario:', nombreUsuario, 'Código:', codigo.substring(0, 2) + '**');

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { nombreUsuario, estaActivo: true },
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado o inactivo:', nombreUsuario);
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
    }

    console.log('🔍 Buscando solicitud APROBADA con código correcto para usuario ID:', usuario.idUsuario);

    // Buscar solicitud APROBADA con el código exacto
    const solicitud = await SolicitudRecuperacionPassword.findOne({
      where: {
        idUsuario: usuario.idUsuario,
        codigo: codigo,
        estado: 'APROBADA',
        fechaExpiracion: { [Op.gt]: new Date() },
      },
    });

    if (solicitud) {
      // Código correcto
      console.log('✅ Código verificado correctamente');
      return res.json({ 
        valido: true, 
        mensaje: 'Código verificado correctamente' 
      });
    }

    // Código incorrecto - buscar solicitud para incrementar intentos
    console.log('❌ Código incorrecto - buscando solicitud para contar intento');
    const solicitudParaIntentos = await SolicitudRecuperacionPassword.findOne({
      where: {
        idUsuario: usuario.idUsuario,
        estado: 'APROBADA',
        fechaExpiracion: { [Op.gt]: new Date() },
      },
    });

    if (solicitudParaIntentos) {
      // Incrementar intentos erróneos
      const nuevosIntentos = solicitudParaIntentos.intentosErroneos + 1;
      await solicitudParaIntentos.update({ intentosErroneos: nuevosIntentos });

      console.log('⚠️ Código incorrecto - Intento', nuevosIntentos, 'de 5');

      // Si alcanzó el máximo, marcar como expirada
      if (nuevosIntentos >= 5) {
        await solicitudParaIntentos.update({ estado: 'EXPIRADA' });
        console.log('🚫 Solicitud bloqueada por múltiples intentos fallidos');
        return res.status(403).json({
          error: 'Código bloqueado por múltiples intentos fallidos. Solicita una nueva recuperación.',
          codigo: 'CODIGO_BLOQUEADO',
        });
      }

      const intentosRestantes = 5 - nuevosIntentos;
      return res.status(400).json({
        error: `Código incorrecto. Te quedan ${intentosRestantes} ${intentosRestantes === 1 ? 'intento' : 'intentos'}.`,
        intentosRestantes,
      });
    }

    // No hay solicitud aprobada válida
    console.log('❌ No hay solicitud APROBADA para este usuario');
    return res.status(404).json({
      error: 'No hay una solicitud de recuperación aprobada o el código ha expirado',
    });

  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ error: 'Error al verificar el código' });
  }
});

// ✅ Endpoint 3: Verificar código y restablecer contraseña (PÚBLICO)
router.post('/restablecer', async (req, res) => {
  let { nombreUsuario, codigo, nuevaPassword } = req.body;

  // Limpiar espacios en blanco
  if (nombreUsuario) nombreUsuario = nombreUsuario.trim();
  if (codigo) codigo = codigo.trim();

  // Validaciones
  if (!nombreUsuario || !codigo || !nuevaPassword) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  if (codigo.length !== 4 || !/^\d{4}$/.test(codigo)) {
    return res.status(400).json({ error: 'Código inválido (debe ser 4 dígitos)' });
  }

  // Validar requisitos de contraseña
  if (nuevaPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (!/\d/.test(nuevaPassword)) {
    return res.status(400).json({ error: 'La contraseña debe contener al menos un número' });
  }
  if (!/[a-zA-Z]/.test(nuevaPassword)) {
    return res.status(400).json({ error: 'La contraseña debe contener al menos una letra' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nuevaPassword)) {
    return res.status(400).json({ error: 'La contraseña debe contener al menos un carácter especial' });
  }

  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      attributes: ['idUsuario', 'nombreUsuario', 'contrasena']
    });

    console.log(`🔍 Intento de restablecimiento - Usuario: ${nombreUsuario}, Código: ${codigo.substring(0, 2)}**, Usuario encontrado: ${!!usuario}`);

    if (!usuario) {
      console.log(`❌ Usuario no encontrado: ${nombreUsuario}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log(`🔍 Buscando solicitud APROBADA para usuario ID ${usuario.idUsuario} con código ${codigo.substring(0, 2)}**`);

    // Buscar solicitud APROBADA con ese código
    const solicitud = await SolicitudRecuperacionPassword.findOne({
      where: {
        idUsuario: usuario.idUsuario,
        codigo: codigo,
        estado: 'APROBADA',
        fechaExpiracion: { [Op.gt]: new Date() }
      }
    });

    console.log(`🔍 Solicitud encontrada: ${!!solicitud}, Estado: ${solicitud?.estado || 'N/A'}, Código correcto: ${solicitud?.codigo === codigo}`);

    if (!solicitud) {
      console.log(`❌ No hay solicitud APROBADA válida - buscando solicitud para contar intento`);
      // Registrar intento erróneo
      const solicitudParaIntentos = await SolicitudRecuperacionPassword.findOne({
        where: {
          idUsuario: usuario.idUsuario,
          estado: 'APROBADA',
          fechaExpiracion: { [Op.gt]: new Date() }
        }
      });

      if (solicitudParaIntentos) {
        console.log(`⚠️ Código incorrecto - Intento ${solicitudParaIntentos.intentosErroneos + 1}/5`);
        await solicitudParaIntentos.update({
          intentosErroneos: solicitudParaIntentos.intentosErroneos + 1
        });

        // Bloquear después de 5 intentos
        if (solicitudParaIntentos.intentosErroneos >= 4) {
          await solicitudParaIntentos.update({ estado: 'EXPIRADA' });
          console.log(`🔒 Código bloqueado por múltiples intentos - Usuario: ${nombreUsuario}`);
          return res.status(403).json({ 
            error: 'Código bloqueado por múltiples intentos erróneos',
            codigo: 'CODIGO_BLOQUEADO'
          });
        }
      }

      return res.status(400).json({ 
        error: 'Código incorrecto o expirado',
        codigo: 'CODIGO_INVALIDO'
      });
    }

    // ✅ TODO CORRECTO - Actualizar contraseña
    await usuario.update({ contrasena: nuevaPassword });

    // Marcar solicitud como FINALIZADA
    await solicitud.update({
      estado: 'FINALIZADA',
      fechaFinalizacion: new Date()
    });

    console.log(`✅ Contraseña restablecida - Usuario: ${nombreUsuario}`);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

module.exports = router;
