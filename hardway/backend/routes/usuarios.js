const express = require('express');
const router = express.Router();
const { Usuario, Rol, TipoRol } = require('../models');

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

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: {
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["tipoRol"],
        },
      },
    });

    // Formatea la respuesta para el frontend
    const usuariosFormateados = usuarios.map((u) => ({
      id: u.idUsuario,
      username: u.nombreUsuario,
      rol: u.Rol?.TipoRol?.tipoRol || "",
    }));

    res.json(usuariosFormateados);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Crear usuario
router.post("/", async (req, res) => {
  const { username, password, rol } = req.body;
  try {
    // Validar contraseña
    const errorPassword = validarPassword(password);
    if (errorPassword) {
      return res.status(400).json({ error: errorPassword });
    }

    // Busca el idRol correspondiente al tipoRol recibido
    const rolDB = await Rol.findOne({
      include: {
        model: TipoRol,
        where: { tipoRol: rol },
      },
    });
    if (!rolDB) {
      return res.status(400).json({ error: "Rol no válido" });
    }
    const nuevo = await Usuario.create({
      nombreUsuario: username,
      contrasena: password,
      idRol: rolDB.idRol,
    });
    res.json({ id: nuevo.idUsuario, username: nuevo.nombreUsuario, rol });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(400).json({ error: "No se pudo crear el usuario" });
  }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    await Usuario.destroy({ where: { idUsuario: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(400).json({ error: "No se pudo eliminar el usuario" });
  }
});

// Actualizar usuario (nombre de usuario y rol)
router.put("/:id", async (req, res) => {
  const { username, rol } = req.body;
  try {
    // Busca el idRol correspondiente al tipoRol recibido
    const rolDB = await Rol.findOne({
      include: {
        model: TipoRol,
        where: { tipoRol: rol },
      },
    });
    if (!rolDB) {
      return res.status(400).json({ error: "Rol no válido" });
    }
    await Usuario.update(
      { nombreUsuario: username, idRol: rolDB.idRol },
      { where: { idUsuario: req.params.id } }
    );
    res.json({ success: true });
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
        model: Rol,
        include: {
          model: TipoRol,
          attributes: ["tipoRol"],
        },
      },
    });

    if (usuario) {
      res.json({ 
        valid: true, 
        rol: usuario.Rol?.TipoRol?.tipoRol || "" 
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
