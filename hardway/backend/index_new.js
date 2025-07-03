const express = require("express");
require("dotenv").config();

console.log("🚀 Iniciando backend refactorizado...");

const app = express();

// Importar configuraciones
const { corsConfig } = require('./config/cors');
const { connectDB } = require('./config/database');

// Importar modelos y configurar relaciones
const { setupAssociations } = require('./models');

// Middlewares globales
app.use(corsConfig);
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Configurar relaciones entre modelos
setupAssociations();

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const pedidosRoutes = require('./routes/pedidos');

// Usar rutas
app.use('/api', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Endpoint de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend refactorizado funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/api/health`);
});

module.exports = app;
