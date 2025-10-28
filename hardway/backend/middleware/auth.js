const { Usuario, Rol, TipoRol, EncargadoPicker } = require('../models');

// Middleware de autorización para endpoints de pedidos
const verificarAccesoPedidos = async (req, res, next) => {
  console.log('🔍 Verificando acceso pedidos...');
  
  // Intentar obtener nombreUsuario de headers o del token
  let nombreUsuario = req.headers.nombreusuario;
  
  // Si no hay nombreUsuario en headers, intentar extraerlo del token
  if (!nombreUsuario) {
    const authorization = req.headers.authorization;
    console.log('🔑 Authorization header:', authorization);
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      console.log('🎫 Token extraído:', token);
      
      // Para tokens temporales del formato "temp-token-{idUsuario}"
      if (token.startsWith('temp-token-')) {
        const idUsuario = token.replace('temp-token-', '');
        console.log('👤 ID Usuario del token:', idUsuario);
        
        try {
          // Buscar el usuario por ID
          const usuarioToken = await Usuario.findOne({
            where: { idUsuario: parseInt(idUsuario) },
            attributes: ['idUsuario', 'nombreUsuario']
          });
          
          console.log('👤 Usuario del token:', usuarioToken ? { id: usuarioToken.idUsuario, nombre: usuarioToken.nombreUsuario } : 'null');
          
          if (usuarioToken) {
            nombreUsuario = usuarioToken.nombreUsuario;
            console.log('✅ NombreUsuario extraído del token:', nombreUsuario);
          }
        } catch (error) {
          console.error('❌ Error extrayendo usuario del token:', error);
        }
      }
    }
  }

  if (!nombreUsuario) {
    console.log('❌ No se pudo obtener nombreUsuario');
    return res.status(401).json({
      error: "Acceso denegado: necesitas iniciar sesión para gestionar pedidos",
      codigo: "NO_AUTH",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: {
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["idTipoRol", "tipoRol"],
        },
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    const idTipoRol = usuario.Rol?.TipoRol?.idTipoRol;

    // Solo Administrador (1) y Vendedor (2) pueden acceder a pedidos
    if (idTipoRol !== 1 && idTipoRol !== 2) {
      return res.status(403).json({
        error: "Acceso denegado: permisos insuficientes para gestionar pedidos",
        codigo: "INSUFFICIENT_PERMISSIONS",
        rolActual: usuario.Rol?.TipoRol?.tipoRol,
      });
    }

    console.log('✅ Acceso autorizado para pedidos:', nombreUsuario);

    // Pasar información del usuario al siguiente middleware/endpoint
    req.usuarioAutenticado = {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      idTipoRol: idTipoRol,
      tipoRol: usuario.Rol?.TipoRol?.tipoRol,
    };

    next();
  } catch (error) {
    console.error("Error en verificarAccesoPedidos:", error);
    return res.status(500).json({
      error: "Error interno al verificar permisos",
      codigo: "INTERNAL_ERROR",
    });
  }
};

// Middleware genérico de autenticación
const verificarAutenticacion = async (req, res, next) => {
  const nombreUsuario = req.headers.nombreusuario;

  if (!nombreUsuario) {
    return res.status(401).json({
      error: "Acceso denegado: necesitas iniciar sesión",
      codigo: "NO_AUTH",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: {
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["idTipoRol", "tipoRol"],
        },
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    req.usuarioAutenticado = {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      idTipoRol: usuario.Rol?.TipoRol?.idTipoRol,
      tipoRol: usuario.Rol?.TipoRol?.tipoRol,
    };

    next();
  } catch (error) {
    console.error("Error en verificarAutenticacion:", error);
    return res.status(500).json({
      error: "Error interno al verificar autenticación",
      codigo: "INTERNAL_ERROR",
    });
  }
};

// Middleware de autorización para endpoints de picking
const verificarAccesoPicking = async (req, res, next) => {
  console.log('🔍 Verificando acceso picking...');
  
  let legajoPicker = req.headers.legajopicker;
  let nombreUsuario = req.headers.nombreusuario;
  
  console.log('📋 Headers recibidos:', {
    legajopicker: legajoPicker,
    nombreusuario: nombreUsuario,
    authorization: req.headers.authorization ? 'Presente' : 'Ausente'
  });
  
  // Si no hay legajo en headers, intentar extraerlo del token o del nombreUsuario
  if (!legajoPicker) {
    const authorization = req.headers.authorization;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      console.log('🎫 Token detectado:', token.substring(0, 20) + '...');
      
      // Para tokens temporales del formato "temp-token-{idUsuario}"
      if (token.startsWith('temp-token-')) {
        const idUsuario = token.replace('temp-token-', '');
        console.log('👤 Extrayendo legajo del token para usuario ID:', idUsuario);
        
        try {
          // Buscar el usuario y su legajo
          const usuario = await Usuario.findOne({
            where: { idUsuario: parseInt(idUsuario) },
            attributes: ['idUsuario', 'idPersona']
          });
          
          if (usuario && usuario.idPersona) {
            const picker = await EncargadoPicker.findOne({
              where: { idPersona: usuario.idPersona }
            });
            
            if (picker) {
              legajoPicker = picker.legajo;
              console.log('✅ Legajo extraído del token:', legajoPicker);
            }
          }
        } catch (error) {
          console.error('❌ Error extrayendo legajo del token:', error);
        }
      }
    } else if (nombreUsuario) {
      // Fallback: intentar obtener legajo desde el nombreUsuario
      console.log('🔄 Intentando obtener legajo desde nombreUsuario:', nombreUsuario);
      
      try {
        const usuario = await Usuario.findOne({
          where: { nombreUsuario },
          attributes: ['idUsuario', 'idPersona']
        });
        
        if (usuario && usuario.idPersona) {
          const picker = await EncargadoPicker.findOne({
            where: { idPersona: usuario.idPersona }
          });
          
          if (picker) {
            legajoPicker = picker.legajo;
            console.log('✅ Legajo extraído del nombreUsuario:', legajoPicker);
          }
        }
      } catch (error) {
        console.error('❌ Error extrayendo legajo del nombreUsuario:', error);
      }
    }
  }

  // Si es un administrador, permitir acceso sin legajo de picker
  if (!legajoPicker && nombreUsuario) {
    try {
      // Verificar si el usuario es un administrador
      const usuario = await Usuario.findOne({
        where: { nombreUsuario },
        include: [{
          model: Rol,
          include: [TipoRol]
        }]
      });

      if (usuario && usuario.Rol && usuario.Rol.TipoRol && usuario.Rol.TipoRol.tipoRol === 'Administrador') {
        console.log('✅ Usuario administrador verificado, permitiendo acceso sin legajo de picker');
        // Crear un legajo especial para administradores
        req.esAdmin = true;  // Flag para indicar que es administrador
        
        // Establecer un objeto pickerAutenticado vacío para administradores
        // para evitar errores de referencia nula
        req.pickerAutenticado = {
          esAdmin: true,
          idPersona: usuario.idPersona || null
        };
        
        next();
        return;  // Importante: salir de la función aquí para evitar verificaciones adicionales
      }
    } catch (error) {
      console.error('❌ Error al verificar si el usuario es administrador:', error);
    }
  }

  // Para usuarios no administradores, exigir legajo de picker
  if (!legajoPicker) {
    console.log('❌ No se pudo obtener legajo del picker y el usuario no es administrador');
    return res.status(401).json({
      error: "Acceso denegado: legajo de picker requerido",
      codigo: "NO_PICKER_ID",
    });
  }

  console.log('🎯 Legajo final obtenido:', legajoPicker);

  try {
    // Verificar que el picker existe
    const picker = await EncargadoPicker.findOne({
      where: { legajo: legajoPicker }
    });

    if (!picker) {
      console.log('❌ Picker no encontrado para legajo:', legajoPicker);
      return res.status(401).json({
        error: "Picker no encontrado",
        codigo: "PICKER_NOT_FOUND",
      });
    }

    console.log('✅ Picker autenticado:', { legajo: picker.legajo, idPersona: picker.idPersona });

    // Pasar información del picker al siguiente middleware/endpoint
    req.pickerAutenticado = {
      legajo: picker.legajo,
      idPersona: picker.idPersona,
    };

    next();
  } catch (error) {
    console.error("Error en verificación de picker:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      codigo: "INTERNAL_ERROR",
    });
  }
};

// Middleware para verificar acceso a gestión de envíos
const verificarAccesoEnvios = async (req, res, next) => {
  console.log('🚚 Verificando acceso envíos...');
  
  const nombreUsuario = req.headers.nombreusuario;
  console.log('🔑 Authorization header:', req.headers.authorization);

  if (!nombreUsuario) {
    console.log('❌ No se pudo obtener nombreUsuario');
    return res.status(401).json({
      error: "Acceso denegado: necesitas iniciar sesión para gestionar envíos",
      codigo: "NO_AUTH_HEADER",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: {
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["idTipoRol", "tipoRol"],
        },
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    const idTipoRol = usuario.Rol?.TipoRol?.idTipoRol;
    const tipoRol = usuario.Rol?.TipoRol?.tipoRol;

    // Administrador (1), Envíos (3) y Picker (6) pueden acceder a envíos
    // Los pickers necesitan acceso porque son responsables del despacho en el flujo unificado
    if (idTipoRol !== 1 && idTipoRol !== 3 && idTipoRol !== 6) {
      return res.status(403).json({
        error: "Acceso denegado: permisos insuficientes para gestionar envíos",
        codigo: "INSUFFICIENT_PERMISSIONS",
        rolActual: tipoRol,
        rolesPermitidos: ["Administrador", "Envios", "Picker"]
      });
    }

    console.log('✅ Acceso autorizado para envíos:', nombreUsuario, `(${tipoRol})`);

    // Si es un picker, obtener su legajo para filtrar sus pedidos
    let legajoPicker = null;
    if (idTipoRol === 6 && usuario.idPersona) {
      try {
        const picker = await EncargadoPicker.findOne({
          where: { idPersona: usuario.idPersona }
        });
        
        if (picker) {
          legajoPicker = picker.legajo;
          console.log('📋 Legajo del picker:', legajoPicker);
        }
      } catch (error) {
        console.error('❌ Error obteniendo legajo del picker:', error);
      }
    }

    // Pasar información del usuario al siguiente middleware/endpoint
    req.usuarioAutenticado = {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      idTipoRol: idTipoRol,
      tipoRol: tipoRol,
      legajoPicker: legajoPicker, // Incluir legajo si es picker
    };

    next();
  } catch (error) {
    console.error("Error en verificarAccesoEnvios:", error);
    return res.status(500).json({
      error: "Error interno al verificar permisos",
      codigo: "INTERNAL_ERROR",
    });
  }
};

module.exports = {
  verificarAccesoPedidos,
  verificarAutenticacion,
  verificarAccesoPicking,
  verificarAccesoEnvios,
};
