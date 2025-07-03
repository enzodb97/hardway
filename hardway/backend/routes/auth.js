const express = require('express');
const router = express.Router();
const { Usuario, Rol, TipoRol, Persona } = require('../models');

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
  const { nombreUsuario, password, contrasena } = req.body;
  // Acepta tanto 'password' como 'contrasena' para compatibilidad
  const passwordToCheck = password || contrasena;
  
  console.log(`🔐 Intento de login: ${nombreUsuario}`);
  
  try {
    // Busca el usuario y su rol
    const usuario = await Usuario.findOne({
      where: { nombreUsuario },
      attributes: ['idUsuario', 'nombreUsuario', 'contrasena', 'idRol', 'idPersona'], // Incluir idPersona
      include: {
        model: Rol,
        include: { model: TipoRol },
      },
    });
    
    console.log(`📋 Usuario encontrado:`, usuario ? {
      id: usuario.idUsuario,
      nombre: usuario.nombreUsuario,
      idPersona: usuario.idPersona,
      rol: usuario.Rol?.TipoRol?.tipoRol
    } : 'No encontrado');
    
    if (!usuario || usuario.contrasena !== passwordToCheck) {
      console.log(`❌ Credenciales inválidas para ${nombreUsuario}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    // Si es picker, buscar el legajo real
    let legajoPicker = null;
    if (
      usuario.Rol &&
      usuario.Rol.TipoRol &&
      usuario.Rol.TipoRol.tipoRol &&
      usuario.Rol.TipoRol.tipoRol.toLowerCase().includes("picker")
    ) {
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
    
    res.json({
      token: 'temp-token-' + usuario.idUsuario, // Token temporal para testing
      id: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      rolNombre: usuario.Rol?.TipoRol?.tipoRol || "",
      tipoRol: usuario.Rol?.TipoRol?.tipoRol || "",
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
