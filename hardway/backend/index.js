const express = require("express");
require("dotenv").config();

console.log("🚀 Iniciando backend refactorizado...");

const app = express();

// Importar configuraciones
const { corsConfig } = require("./config/cors");
const { connectDB } = require("./config/database");

// Importar modelos y configurar relaciones
const { setupAssociations } = require("./models");

// Middlewares globales
app.use(corsConfig);
// Parsear bodies JSON y guardar rawBody para diagnóstico cuando haga falta
app.use(express.json({ verify: (req, _res, buf) => { try { req.rawBody = buf.toString(); } catch (e) { req.rawBody = ''; } } }));
// Parsear bodies urlencoded por compatibilidad
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
connectDB();

// Configurar relaciones entre modelos
setupAssociations();

// Registrar ruta pública de envios antes de cualquier router montado en '/api'
const consultaInvitadoHandler = require("./routes/enviosPublico");
app.post("/api/envios/consulta-invitado", consultaInvitadoHandler);

// Registrar endpoint público para detalle de pedido
const detallePedidoPublicoHandler = require("./routes/detallePedidoPublico");
app.post("/api/pedidos/detalle-publico", detallePedidoPublicoHandler);

// Importar rutas
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const clientesRoutes = require("./routes/clientes");
const pedidosRoutes = require("./routes/pedidos");
const indumentariaRoutes = require("./routes/indumentaria");
const auxiliaresRoutes = require("./routes/auxiliares");
const reportesRoutes = require("./routes/reportes");
const pickingRoutes = require("./routes/picking");
const ubicacionRoutes = require("./routes/ubicacion");
const clientesVipRoutes = require("./routes/clientesVip");
const presentacionesRoutes = require("./routes/presentaciones");

// Usar rutas

// Las rutas VIP deben ser públicas y estar antes que cualquier autenticación
app.use("/api/clientes/vip", clientesVipRoutes);
app.use("/api/auth", authRoutes);  // Cambiar de "/api" a "/api/auth"
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/indumentaria", indumentariaRoutes);
app.use("/api", auxiliaresRoutes);
app.use("/api/auxiliares", auxiliaresRoutes);
app.use("/api", ubicacionRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/picking", pickingRoutes);
// (La ruta pública de envíos ya fue registrada arriba)

const { verificarAccesoEnvios } = require("./middleware/auth");
app.use("/api/envios", verificarAccesoEnvios, require("./routes/envios"));


// Endpoint de prueba
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend refactorizado funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `📊 Health check disponible en http://localhost:${PORT}/api/health`
  );
});

module.exports = app;
