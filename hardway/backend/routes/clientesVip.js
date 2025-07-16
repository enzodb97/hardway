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
    res
      .status(500)
      .json({
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

module.exports = router;
