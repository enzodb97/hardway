# CORRECCIONES APLICADAS AL SISTEMA DE PICKING

## Fecha: 2 de julio de 2025

### ✅ PROBLEMAS RESUELTOS:

#### 1. **Modelo Usuario sin campo idPersona**
- **Problema**: El modelo Usuario no incluía el campo `idPersona` necesario para relacionar con EncargadoPicker
- **Solución**: Agregado `idPersona: DataTypes.INTEGER` al modelo Usuario
- **Archivo**: `backend/models/Usuario.js`

#### 2. **Middleware de Picking no extraía legajo del token**
- **Problema**: El middleware esperaba el legajo en headers, pero el frontend enviaba solo el token
- **Solución**: Modificado middleware para extraer el legajo del token temporal
- **Archivo**: `backend/middleware/auth.js`

#### 3. **Rutas de Picking verificaban headers duplicadamente**
- **Problema**: Las rutas verificaban `req.headers.legajopicker` después del middleware
- **Solución**: Corregidas rutas para usar `req.pickerAutenticado.legajo` del middleware
- **Archivo**: `backend/routes/picking.js`
- **Rutas corregidas**:
  - `GET /api/picking/tareas`
  - `GET /api/picking/tareas/:numeroPedido`
  - `POST /api/picking/tareas/:numeroPedido/completar`

#### 4. **URLs incorrectas en Frontend**
- **Problema**: El frontend usaba URLs que no existían en el backend
- **Soluciones aplicadas**:
  - `completarTareaPicking`: Cambiado de `/api/picking/completar` a `/api/picking/tareas/${numeroPedido}/completar`
  - `verPickingList`: Cambiado de `/api/picking/lista?numeroPedido=${numeroPedido}` a `/api/picking/tareas/${numeroPedido}`
  - `cargarTareasPicking`: Simplificado para pickers (ya no envía legajo en headers)
- **Archivo**: `frontend/src/utils/pickingUtils.ts`

### ✅ RESULTADO FINAL:

#### **PICKING COMPLETAMENTE FUNCIONAL:**
- **✅ Administradores**: Pueden ver todas las tareas (4 tareas encontradas)
- **✅ Pickers**: Pueden ver sus tareas asignadas (2 tareas asignadas)
- **✅ Legajo automático**: Se extrae del token sin headers adicionales
- **✅ Completar tareas**: URLs corregidas para funcionar correctamente

#### **CREDENCIALES DE PRUEBA:**
- **Admin**: `admin` / `admin123`
- **Picker**: `luisrd` / `123` (Legajo: LP006)

#### **ENDPOINTS VERIFICADOS:**
- `GET /api/picking/tareas-admin` - Administradores ✅
- `GET /api/picking/tareas` - Pickers ✅
- `GET /api/picking/tareas/{numeroPedido}` - Detalle de tarea ✅
- `POST /api/picking/tareas/{numeroPedido}/completar` - Completar tarea ✅

### 🔧 PRÓXIMO PASO:
Resolver el último problema del endpoint `/api/pedidos` (Error 401) para tener el sistema 100% funcional.
