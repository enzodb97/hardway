const express = require('express');
const router = express.Router();
const { Usuario, TipoRol, Persona } = require('../models'); // ❌ Eliminado: Rol

// Modelo EncargadoPicker (temporal hasta que se mueva)
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const EncargadoPicker = sequelize.define(
  "EncargadoPicker",
  {
    legajo: { type: DataTypes.STRING, primaryKey: true },
    idPersona: DataTypes.INTEGER,
  },
  { tableName: "encargadopicker", timestamps: false }
);

// Endpoint de login
router.post("/login", async (req, res) => {
  console.log('🔗 URL recibida:', req.originalUrl);
  const { nombreUsuario, password, contrasena } = req.body;
  // Acepta tanto 'password' como 'contrasena' para compatibilidad
  const passwordToCheck = password || contrasena;
  
  console.log(`🔐 Intento de login: ${nombreUsuario}`);
  
  try {
    // ✅ Busca el usuario con sus MÚLTIPLES roles
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      attributes: ['idUsuario', 'nombreUsuario', 'contrasena', 'idPersona', 'estaActivo'],
      include: {
        model: TipoRol,
        as: "roles", // Usar alias de la relación N:M
        attributes: ['idTipoRol', 'tipoRol'],
        through: { attributes: [] } // No incluir campos de usuario_tiporol
      },
    });
    
    console.log(`📋 Usuario encontrado:`, usuario ? {
      id: usuario.idUsuario,
      nombre: usuario.nombreUsuario,
      idPersona: usuario.idPersona,
      roles: usuario.roles?.map(r => r.tipoRol) || []
    } : 'No encontrado');
    
    if (!usuario || usuario.contrasena !== passwordToCheck) {
      console.log(`❌ Credenciales inválidas para ${nombreUsuario}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    // ✅ Verificar que el usuario esté activo
    if (usuario.estaActivo === 0 || usuario.estaActivo === false) {
      console.log(`❌ Usuario inactivo: ${nombreUsuario}`);
      return res.status(403).json({ 
        error: "Usuario inactivo. Consulte con el administrador.",
        codigo: "USUARIO_INACTIVO"
      });
    }
    
    // ✅ Verificar si tiene algún rol de tipo "Picker"
    let legajoPicker = null;
    const esPicker = usuario.roles?.some(rol => 
      rol.tipoRol && rol.tipoRol.toLowerCase().includes("picker")
    );
    
    if (esPicker) {
      console.log(`🏷️ Buscando legajo para picker ${nombreUsuario}...`);
      
      // Verificar que el usuario tenga idPersona válido
      if (usuario.idPersona) {
        // Buscar en la tabla encargadopicker por idPersona del usuario
        const picker = await EncargadoPicker.findOne({
          where: { idPersona: usuario.idPersona },
        });
        if (picker) {
          legajoPicker = picker.legajo;
          console.log(`✓ Legajo encontrado: ${legajoPicker}`);
        } else {
          console.log(`⚠️ No se encontró legajo para picker ${nombreUsuario}`);
        }
      } else {
        console.log(`⚠️ Usuario picker ${nombreUsuario} no tiene idPersona válido`);
      }
    }
    
    console.log(`✅ Login exitoso para ${nombreUsuario}`);
    
    // ✅ Devolver array de roles
    res.json({
      token: 'temp-token-' + usuario.idUsuario, // Token temporal para testing
      id: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      roles: usuario.roles?.map(r => r.tipoRol) || [], // Array: ["Vendedor", "Admin"]
      rolesIds: usuario.roles?.map(r => r.idTipoRol) || [], // Array: [2, 8]
      // Mantener compatibilidad temporal con código antiguo
      rolNombre: usuario.roles?.[0]?.tipoRol || "", // Primer rol (deprecated)
      tipoRol: usuario.roles?.[0]?.tipoRol || "", // Primer rol (deprecated)
      legajoPicker, // null si no es picker
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en login" });
  }
});

// Endpoint para buscar usuario por nombre de usuario (para cancelaciones)
router.get("/usuarios/buscar-por-nombre/:nombreUsuario", async (req, res) => {
  const { nombreUsuario } = req.params;
  try {
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      attributes: ["idUsuario", "nombreUsuario"],
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
    });
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
