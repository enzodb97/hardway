// backend/routes/clientesVip.js
const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/database");

// 1. Obtener todos los clientes VIP
router.get("/", async (req, res) => {
  try {
    const [result] = await sequelize.query("SELECT * FROM vista_clientes_vip");
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al obtener clientes VIP", details: err.message });
  }
});

// 2. Obtener el Top N de clientes VIP
router.get("/top", async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const order = req.query.order === "ASC" ? "ASC" : "DESC";
  try {
    const [result] = await sequelize.query(
      `SELECT * FROM vista_clientes_vip ORDER BY monto_total_gastado ${order} LIMIT :limit`,
      { replacements: { limit } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Error al obtener el top de clientes VIP",
      details: err.message,
    });
  }
});

// 3. Buscar cliente VIP por nombre
router.get("/buscar", async (req, res) => {
  const nombre = req.query.nombre;
  if (!nombre)
    return res.status(400).json({ error: "Falta el parámetro nombre" });
  try {
    const [result] = await sequelize.query(
      "SELECT * FROM vista_clientes_vip WHERE nombre = :nombre",
      { replacements: { nombre } }
    );
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al buscar cliente VIP", details: err.message });
  }
});

// 4. Contar la cantidad de clientes VIP
router.get("/count", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT COUNT(*) AS total_vips FROM vista_clientes_vip"
    );
    res.json(result[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al contar clientes VIP", details: err.message });
  }
});

// 6. Obtener el monto mínimo actual para ser VIP
router.get("/vip-threshold", async (req, res) => {
  try {
    const [result] = await sequelize.query(
      "SELECT valor FROM configuracionvip WHERE clave = 'monto_vip'"
    );
    if (result.length === 0) {
      return res.status(404).json({ error: "Configuración no encontrada" });
    }
    res.json({ monto: result[0].valor });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al obtener monto VIP", details: err.message });
  }
});

// 5. Actualizar el monto mínimo para ser VIP
router.put("/vip-threshold", async (req, res) => {
  const { monto } = req.body;
  if (typeof monto !== "number" || monto <= 0) {
    return res.status(400).json({ error: "Monto inválido" });
  }
  try {
    await sequelize.query(
      "UPDATE configuracionvip SET valor = :monto WHERE clave = 'monto_vip'",
      { replacements: { monto } }
    );
    res.json({ success: true, message: "Monto VIP actualizado" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al actualizar monto VIP", details: err.message });
  }
});

module.exports = router;
