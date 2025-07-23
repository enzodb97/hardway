# 🚀 Sistema de Gestión HARDWAY

## Descripción General

Este sistema de gestión integral permite administrar clientes, pedidos, stock de indumentaria, picking, envíos y reportes. Está desarrollado con una arquitectura moderna que separa el frontend (React/Ionic) del backend (Node.js/Express).

## 🛠️ Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- Base de datos configurada con las tablas necesarias

## 📋 Estructura del Proyecto

```
hardway/
├── backend/           # Servidor API REST
│   ├── config/        # Configuración (base de datos, etc.)
│   ├── middleware/    # Middleware de autenticación y autorización
│   ├── models/        # Modelos Sequelize para la base de datos
│   ├── routes/        # Rutas API organizadas por funcionalidad
│   ├── services/      # Lógica de negocio compleja
│   └── utils/         # Funciones auxiliares
│
├── src/               # Frontend React/Ionic
│   ├── assets/        # Imágenes y recursos estáticos
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Contextos de React (autenticación, etc.)
│   ├── pages/         # Páginas de la aplicación
│   └── utils/         # Utilidades y servicios
```

## 📂 Detalle de Carpetas del Backend

Para nuevos usuarios que necesitan entender cómo está estructurado el sistema:

### 1. 📂 `/config`

**¿Qué contiene?**

- `database.js`: Configuración de conexión a la base de datos MySQL

**¿Qué hace?**

- Establece la conexión con la base de datos usando Sequelize
- Define parámetros como host, usuario, contraseña (desde variables de entorno)
- Proporciona la función `connectDB()` para verificar la conexión

### 2. 📂 `/models`

**¿Qué contiene?**

- `index.js`: Configura y exporta todos los modelos
- Archivos individuales por cada modelo (Usuario.js, Cliente.js, etc.)

**¿Qué hace?**

- Define la estructura de las tablas usando Sequelize
- Establece relaciones entre tablas (uno a muchos, muchos a muchos)
- Configura validaciones de datos

### 3. 📂 `/routes`

**¿Qué contiene?**

- Archivos separados por funcionalidad (usuarios.js, pedidos.js, picking.js)

**¿Qué hace?**

- Define los endpoints de la API (URLs)
- Especifica qué métodos HTTP acepta cada ruta (GET, POST, PUT, DELETE)
- Controla la lógica de negocio para cada operación
- Aplica middleware de autenticación donde sea necesario

### 4. 📂 `/middleware`

**¿Qué contiene?**

- `auth.js`: Funciones de autenticación y autorización
- `errorHandler.js`: Manejador de errores
- `validators.js`: Validación de datos

**¿Qué hace?**

- Verifica tokens de autenticación
- Valida permisos según roles de usuario
- Verifica y sanitiza datos de entrada
- Maneja errores de manera consistente

### 5. 📂 `/services`

**¿Qué contiene?**

- Archivos con lógica de negocio compleja (pedidoService.js, stockService.js)

**¿Qué hace?**

- Implementa lógica de negocio separada de las rutas
- Coordina operaciones entre múltiples modelos
- Gestiona transacciones de base de datos
- Procesa datos y realiza cálculoss

### 6. 📂 `/utils`

**¿Qué contiene?**

- Funciones auxiliares (dateUtils.js, formatters.js)

**¿Qué hace?**

- Proporciona funciones auxiliares reutilizables
- Formatea datos para respuestas de API
- Valida formatos (email, teléfono, etc.)

### 7. 📄 `index.js` (archivo principal)

**¿Qué hace?**

- Inicializa el servidor Express
- Conecta con la base de datos
- Configura middleware global (CORS, body-parser)
- Registra todas las rutas
- Inicia el servidor en el puerto configurado

## 🔄 Flujo de una petición típica

Para entender mejor cómo funciona todo junto, veamos el flujo de una petición para ver los pedidos pendientes:

1. El frontend hace una petición a `GET /api/pedidos?estado=pendiente`
2. El servidor recibe la petición en `index.js`
3. Pasa por middleware global (CORS, etc.)
4. La ruta coincide con una definida en `routes/pedidos.js`
5. Se ejecuta el middleware de autenticación para verificar el token
6. Si está autenticado, se ejecuta el controlador de la ruta
7. El controlador usa los modelos (`Pedido`, `Cliente`, etc.) para consultar la base de datos
8. Posiblemente utilice servicios de `services/pedidoService.js`
9. Se procesa la respuesta y se envía al cliente

## 🚀 Cómo Iniciar el Sistema

### Iniciar el Backend

1. Abre una terminal y navega a la carpeta del backend:

```powershell
cd C:\Users\[TuUsuario]\Desktop\Pegasus\hardway\hardway\backend
```

2. Instala las dependencias (solo la primera vez):

```powershell
npm install
```

3. Inicia el servidor:

```powershell
node index.js
```

El backend estará disponible en `http://localhost:3001`

### Iniciar el Frontend

1. Abre otra terminal y navega a la carpeta raíz del proyecto:

```powershell
cd C:\Users\[TuUsuario]\Desktop\Pegasus\hardway\hardway
```

2. Instala las dependencias (solo la primera vez):

```powershell
npm install
```

3. Inicia la aplicación:

```powershell
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 👥 Usuarios de Prueba

### Lista completa de usuarios

| ID  | Usuario | Contraseña | Rol                | Descripción                |
| --- | ------- | ---------- | ------------------ | -------------------------- |
| 1   | admin   | admin123   | Administrador      | Acceso completo al sistema |
| 2   | mariag  | 1234       | Vendedor           | Puede realizar ventas      |
| 5   | anamtz  | 123        | Picker             | Encargado de picking       |
| 6   | luisrd  | 123        | Picker             | Encargado de picking       |
| 7   | sofiag  | 123        | Encargado de Stock | Gestiona stock             |
| 15  | envios  | 123        | Envíos             | Encargado de Envíos        |

### Detalles por rol

#### Administrador

- **Usuario:** admin
- **Contraseña:** admin123
- **Permisos:** Acceso completo al sistema

#### Pickers

- **Usuario:** anamtz
- **Contraseña:** 123
- **Legajo:** LP005

- **Usuario:** luisrd
- **Contraseña:** 123
- **Legajo:** LP006

#### Vendedores

- **Usuario:** mariag
- **Contraseña:** 1234

- **Usuario:** lucianom
- **Contraseña:** 12345

#### Encargado de Stock

- **Usuario:** sofiag
- **Contraseña:** 123

#### Encargado de Envíos

- **Usuario:** envios
- **Contraseña:** 123

## 📱 Módulos Principales

### Gestión de Clientes

- Agregar, editar y eliminar clientes
- Consultar historial de pedidos por cliente

### Gestión de Pedidos

- Crear nuevos pedidos
- Seguimiento de estados (Pendiente, Pagado, Finalizado, etc.)
- Cancelación de pedidos

### Gestión de Stock

- Control de inventario
- Movimientos de entrada/salida
- Visualización por racks

### Sistema de Picking

- Asignación de tareas a pickers
- Visualización de tareas pendientes
- Interfaz optimizada para pickers
- Completar tareas

### Gestión de Envíos

- Seguimiento de pedidos listos para despacho
- Asignación de códigos de seguimiento
- Marcado como despachado

### Reportes

- Clientes con más pedidos
- Productos más vendidos
- Stock actual
- Ventas de la última semana

## 🔄 Flujo de Trabajo Típico

1. **Cliente realiza pedido**

   - Se registra el cliente (si es nuevo)
   - Se crea el pedido con estado "Pendiente"
   - Se descuenta stock de los productos

2. **Picking**

   - Administrador asigna tarea a un picker
   - Picker ve tarea en su panel
   - Picker prepara productos según ubicación (rack)
   - Picker marca tarea como completada
   - Pedido cambia a "Pendiente de Pago"

3. **Pago**

   - Administrador registra pago
   - Pedido cambia a "Abonado"

4. **Envío**

   - Se registra código de seguimiento
   - Se despacha pedido
   - Pedido cambia a "Despachado"

5. **Finalización**
   - Cliente recibe producto
   - Pedido cambia a "Finalizado"

## 🐛 Solución de Problemas Comunes

### El sistema no se conecta a la base de datos

- Verificar que MySQL esté corriendo
- Revisar credenciales en `backend/config/database.js`

### Error al cargar tareas de picking

- Verificar que el usuario tenga el legajo de picker asignado correctamente
- Confirmar que existan asignaciones para ese picker

### No se muestran los racks en el picking

- Asegurarse que los productos tengan asignado un rack en la tabla `stock`
- Verificar la relación entre stock e indumentaria

## 🔒 Seguridad

- Sistema de autenticación basado en usuarios y roles
- Middleware de autorización para acceso a rutas protegidas
- Validación de permisos por tipo de usuario

## ⚙️ Entorno de desarrollo

El archivo `.env` (no incluido en el repositorio por seguridad) contiene variables de entorno esenciales:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hardway1_db
DB_USER=root
DB_PASSWORD=tu_contraseña
PORT=3001
JWT_SECRET=tu_clave_secreta
```

Deberás crear este archivo con los valores correctos para tu entorno.

## 💡 Consejos para nuevos desarrolladores

1. **Comienza por `index.js`** para entender cómo se conecta todo
2. **Explora los modelos** para comprender la estructura de datos
3. **Revisa las rutas** para ver qué endpoints están disponibles
4. **Entiende los middleware** de autenticación para saber cómo se protegen las rutas

## 📚 Más Información

Para más detalles sobre el sistema de picking, consultar el archivo `SOLUCION_PICKING.md`.

---

© 2025 HARDWAY - Sistema de Gestión de Indumentaria
