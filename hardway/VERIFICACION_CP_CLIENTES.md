# Verificación y Corrección del Campo CP en Clientes

## Resumen de los cambios realizados

### 1. Corrección de importación en AltaCliente.tsx
- Cambiado `import axios from "axios"` por `import axiosInstance from "../../config/axios"` para asegurar el uso correcto del cliente HTTP que incluye los headers de autenticación.
- Reemplazados todos los usos de `axios` por `axiosInstance` en el formulario de edición de clientes.

### 2. Implementación de endpoints para gestión de ciudades y barrios
- Creadas nuevas rutas en `routes/auxiliares.js`:
  - `POST /api/ciudades/find-or-create`: Crea o busca una ciudad con nombre y código postal específicos.
  - `POST /api/barrios/find-or-create`: Crea o busca un barrio asociado a una ciudad.
  - `GET /api/ciudades`: Obtiene listado de ciudades.
  - `GET /api/barrios`: Obtiene listado de barrios.

### 3. Validaciones realizadas

#### Backend
- Verificado el flujo de datos entre Cliente -> Persona -> Domicilio -> Ciudad/Barrio.
- Confirmado que el CP se almacena correctamente en la base de datos.
- Verificado que el endpoint `/api/clientes` devuelve correctamente el campo CP.
- Pruebas automatizadas para confirmar la creación y actualización de ciudades y barrios.

#### Frontend
- Confirmado que el formulario de edición de clientes muestra correctamente el campo CP.
- Verificado que el CP se envía correctamente al editar un cliente.
- Confirmado que los nuevos endpoints para ciudades y barrios funcionan correctamente.

## Pruebas realizadas

1. **Test de datos del Cliente**: Verificado que el cliente tiene el campo CP y que se obtiene correctamente desde la base de datos.
2. **Test de Ciudades/Barrios**: Confirmado que es posible crear o buscar ciudades con CP específicos.
3. **Test de Edición**: Verificado que al editar un cliente, se actualiza correctamente el CP en la base de datos.
4. **Prueba Frontend**: Confirmado visualmente que el campo CP se muestra en el formulario de edición de clientes.

## Estructura de base de datos

La información del código postal (CP) sigue el siguiente camino:
- Cliente -> Persona -> Domicilio -> Ciudad (aquí se almacena el CP)

## Conclusión

El sistema ahora maneja correctamente el código postal (CP) de los clientes en todo el flujo, desde la base de datos hasta la interfaz de usuario. Se han implementado las rutas necesarias para gestionar ciudades y barrios, y se ha verificado que el campo CP se muestra correctamente en el formulario de edición de clientes.
