const { Usuario, TipoRol, EncargadoPicker } = require('../models');

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
          
          console.log('� Usuario del token:', usuarioToken ? { id: usuarioToken.idUsuario, nombre: usuarioToken.nombreUsuario } : 'null');
          
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
      include: [{
        model: TipoRol,
        as: 'roles',
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] } // Excluir atributos de la tabla intermedia
      }]
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    // Verificar si el usuario tiene rol de Administrador (1) o Vendedor (2)
    const tieneAcceso = usuario.roles?.some(rol => 
      rol.idTipoRol === 1 || rol.idTipoRol === 2  || rol.idTipoRol === 0 
    );

    if (!tieneAcceso) {
      return res.status(403).json({
        error: "Acceso denegado: permisos insuficientes para gestionar pedidos",
        codigo: "INSUFFICIENT_PERMISSIONS",
        rolesActuales: usuario.roles?.map(r => r.tipoRol) || [],
      });
    }

    console.log('✅ Acceso autorizado para pedidos:', nombreUsuario);

    // Pasar información del usuario al siguiente middleware/endpoint
    req.usuarioAutenticado = {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || [],
      // Mantener compatibilidad con código legacy
      idTipoRol: usuario.roles?.[0]?.idTipoRol,
      tipoRol: usuario.roles?.[0]?.tipoRol,
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
  let nombreUsuario = req.headers.nombreusuario;
  
  // Si no hay nombreUsuario en headers, intentar extraerlo del token Bearer
  if (!nombreUsuario) {
    const authorization = req.headers.authorization;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      
      // Para tokens temporales del formato "temp-token-{idUsuario}"
      if (token.startsWith('temp-token-')) {
        const idUsuario = token.replace('temp-token-', '');
        
        try {
          // Buscar el usuario por ID
          const usuarioToken = await Usuario.findOne({
            where: { idUsuario: parseInt(idUsuario) },
            attributes: ['idUsuario', 'nombreUsuario']
          });
          
          if (usuarioToken) {
            nombreUsuario = usuarioToken.nombreUsuario;
          }
        } catch (error) {
          console.error('Error extrayendo usuario del token:', error);
        }
      }
    }
  }

  if (!nombreUsuario) {
    return res.status(401).json({
      error: "Acceso denegado: necesitas iniciar sesión",
      codigo: "NO_AUTH",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: [{
        model: TipoRol,
        as: 'roles',
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] }
      }]
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
      roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || [],
      // Mantener compatibilidad
      idTipoRol: usuario.roles?.[0]?.idTipoRol,
      tipoRol: usuario.roles?.[0]?.tipoRol,
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

  // ✅ PRIMERO: Verificar si es Administrador (acceso total sin restricciones)
  if (nombreUsuario) {
    try {
      const usuario = await Usuario.findOne({
        where: { nombreUsuario },
        include: [{
          model: TipoRol,
          as: 'roles',
          attributes: ["idTipoRol", "tipoRol"],
          through: { attributes: [] }
        }]
      });

      // Verificar si tiene el rol de Administrador (ID=1)
      const esAdmin = usuario?.roles?.some(rol => 
        rol.tipoRol === 'Administrador' || rol.idTipoRol === 1
      );

      if (esAdmin) {
        console.log('👑 Administrador detectado: Acceso total sin restricciones');
        req.esAdmin = true;
        req.pickerAutenticado = {
          esAdmin: true,
          idPersona: usuario.idPersona || null,
          nombreUsuario: usuario.nombreUsuario
        };
        req.usuarioAutenticado = {
          idUsuario: usuario.idUsuario,
          nombreUsuario: usuario.nombreUsuario,
          roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || []
        };
        next();
        return; // Salir inmediatamente, sin más validaciones
      }
    } catch (error) {
      console.error('❌ Error al verificar si el usuario es administrador:', error);
    }
  }
  
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

  // Para usuarios no administradores, exigir legajo de picker
  if (!legajoPicker) {
    console.log('❌ No se pudo obtener legajo del picker y el usuario no es administrador');
    
    // Verificar si el usuario tiene el rol de Picker pero no está configurado correctamente
    try {
      const usuario = await Usuario.findOne({
        where: { nombreUsuario },
        include: [{
          model: TipoRol,
          as: 'roles',
          attributes: ["idTipoRol", "tipoRol"],
          through: { attributes: [] }
        }]
      });
      
      const esPicker = usuario?.roles?.some(rol => 
        rol.tipoRol === 'Picker' || rol.tipoRol === 'Encargado de Picking'
      );
      
      if (esPicker) {
        console.log('⚠️ Usuario tiene rol Picker pero no está configurado en EncargadoPicker');
        console.log('💡 SOLUCIÓN: Este usuario debería haberse creado con persona y legajo automáticamente.');
        console.log('💡 Si es un usuario antiguo, ejecute el script: backend/fix-usuario-jorge.sql');
        return res.status(403).json({
          error: "Usuario Picker no configurado correctamente. Contacte al administrador para completar su registro.",
          codigo: "PICKER_NOT_CONFIGURED",
          mensaje: "Todavía no tiene ningún pedido asignado",
          ayuda: "Este usuario necesita tener un registro en la tabla encargadopicker con un legajo asignado."
        });
      }
    } catch (error) {
      console.error('Error verificando roles del usuario:', error);
    }
    
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
      include: [{
        model: TipoRol,
        as: 'roles',
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] }
      }]
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    // ✅ ADMINISTRADOR: Acceso total sin restricciones
    const esAdmin = usuario.roles?.some(rol => rol.idTipoRol === 1);
    
    if (esAdmin) {
      console.log('👑 Administrador detectado: Acceso total a envíos');
      req.usuarioAutenticado = {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || [],
        idTipoRol: 1,
        tipoRol: 'Administrador',
        esAdmin: true,
        legajoPicker: null // Admin no necesita legajo
      };
      next();
      return; // Salir sin más validaciones
    }

    // Administrador (1), Envíos (3) y Picker (6) pueden acceder a envíos
    const tieneAcceso = usuario.roles?.some(rol => 
      rol.idTipoRol === 1 || rol.idTipoRol === 3 || rol.idTipoRol === 6
    );

    if (!tieneAcceso) {
      return res.status(403).json({
        error: "Acceso denegado: permisos insuficientes para gestionar envíos",
        codigo: "INSUFFICIENT_PERMISSIONS",
        rolesActuales: usuario.roles?.map(r => r.tipoRol) || [],
        rolesPermitidos: ["Administrador", "Envios", "Picker"]
      });
    }

    const rolesString = usuario.roles?.map(r => r.tipoRol).join(", ") || "";
    console.log('✅ Acceso autorizado para envíos:', nombreUsuario, `(${rolesString})`);

    // Si es un picker, obtener su legajo para filtrar sus pedidos
    let legajoPicker = null;
    const esPicker = usuario.roles?.some(rol => rol.idTipoRol === 6);
    
    if (esPicker && usuario.idPersona) {
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
      roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || [],
      // Mantener compatibilidad
      idTipoRol: usuario.roles?.[0]?.idTipoRol,
      tipoRol: usuario.roles?.[0]?.tipoRol,
      legajoPicker: legajoPicker, // Incluir legajo si es picker
      esAdmin: false
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

// Middleware de autorización para configuración de descuentos
const verificarAccesoConfiguracion = async (req, res, next) => {
  console.log('🔍 Verificando acceso a configuración de descuentos...');
  
  let nombreUsuario = req.headers.nombreusuario;
  
  // Si no hay nombreUsuario en headers, intentar extraerlo del token Bearer
  if (!nombreUsuario) {
    const authorization = req.headers.authorization;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      
      // Para tokens temporales del formato "temp-token-{idUsuario}"
      if (token.startsWith('temp-token-')) {
        const idUsuario = token.replace('temp-token-', '');
        
        try {
          const usuarioToken = await Usuario.findOne({
            where: { idUsuario: parseInt(idUsuario) },
            attributes: ['idUsuario', 'nombreUsuario']
          });
          
          if (usuarioToken) {
            nombreUsuario = usuarioToken.nombreUsuario;
          }
        } catch (error) {
          console.error('Error extrayendo usuario del token:', error);
        }
      }
    }
  }

  if (!nombreUsuario) {
    return res.status(401).json({
      error: "Acceso denegado: necesitas iniciar sesión para configurar descuentos",
      codigo: "NO_AUTH",
    });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      include: [{
        model: TipoRol,
        as: 'roles',
        attributes: ["idTipoRol", "tipoRol"],
        through: { attributes: [] }
      }]
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no encontrado",
        codigo: "USER_NOT_FOUND",
      });
    }

    // Verificar si el usuario tiene rol de Administrador (1) o Encargado de Stock (7)
    const tieneAcceso = usuario.roles?.some(rol => 
      rol.idTipoRol === 1 || rol.idTipoRol === 7
    );

    if (!tieneAcceso) {
      return res.status(403).json({
        error: "Acceso denegado: solo Administradores y Encargados de Stock pueden configurar descuentos",
        codigo: "INSUFFICIENT_PERMISSIONS",
        rolesActuales: usuario.roles?.map(r => r.tipoRol) || [],
      });
    }

    console.log('✅ Acceso autorizado para configurar descuentos:', nombreUsuario);

    // Pasar información del usuario al siguiente middleware/endpoint
    req.usuarioAutenticado = {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      roles: usuario.roles?.map(r => ({ idTipoRol: r.idTipoRol, tipoRol: r.tipoRol })) || [],
    };

    next();
  } catch (error) {
    console.error("Error en verificarAccesoConfiguracion:", error);
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
  verificarAccesoConfiguracion,
};
