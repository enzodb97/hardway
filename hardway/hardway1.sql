--
-- Base de datos: `hardway1`
--
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `adminsistemas`
--
CREATE TABLE
  `adminsistemas` (
    `idAdminSis` int (11) NOT NULL,
    `legajo` int (11) DEFAULT NULL,
    `idPersona` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `adminsistemas`
--
INSERT INTO
  `adminsistemas` (`idAdminSis`, `legajo`, `idPersona`)
VALUES
  (1, 2001, 1),
  (2, 2002, 2),
  (3, 2003, 3),
  (4, 2004, 4),
  (5, 2005, 5),
  (6, 2006, 6),
  (7, 2007, 7),
  (8, 2008, 8),
  (9, 2009, 9),
  (10, 2010, 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `barrio`
--
CREATE TABLE
  `barrio` (
    `idBarrio` int (11) NOT NULL,
    `nombreBarrio` varchar(100) DEFAULT NULL,
    `idCiudad` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `barrio`
--
INSERT INTO
  `barrio` (`idBarrio`, `nombreBarrio`, `idCiudad`)
VALUES
  (1, 'Palermo', 1),
  (2, 'Recoleta', 1),
  (3, 'Nueva Córdoba', 2),
  (4, 'Centro', 3),
  (5, 'Godoy Cruz', 4),
  (6, 'La Perla', 6),
  (7, 'Yerba Buena', 7),
  (8, 'Cerrillos', 8),
  (9, 'Barrio Roma', 9),
  (10, 'Villa Mitre', 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `categoriaindumentaria`
--
CREATE TABLE
  `categoriaindumentaria` (
    `idCategoria` int (11) NOT NULL,
    `categoria` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `categoriaindumentaria`
--
INSERT INTO
  `categoriaindumentaria` (`idCategoria`, `categoria`)
VALUES
  (1, 'Formal'),
  (2, 'Casual'),
  (3, 'Deportivo'),
  (4, 'Trabajo'),
  (5, 'Fiesta'),
  (6, 'Verano'),
  (7, 'Invierno'),
  (8, 'Ropa Interior'),
  (9, 'Uniforme'),
  (10, 'Exteriores'),
  (11, 'Sport');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `ciudad`
--
CREATE TABLE
  `ciudad` (
    `idCiudad` int (11) NOT NULL,
    `nombreCiudad` varchar(100) DEFAULT NULL,
    `codigoPostal` varchar(20) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `ciudad`
--
INSERT INTO
  `ciudad` (`idCiudad`, `nombreCiudad`, `codigoPostal`)
VALUES
  (1, 'Buenos Aires', 'C1000'),
  (2, 'Córdoba', 'X5000'),
  (3, 'Rosario', 'S2000'),
  (4, 'Mendoza', 'M5500'),
  (5, 'La Plata', 'B1900'),
  (6, 'Mar del Plata', 'B7600'),
  (7, 'San Miguel de Tucumán', 'T4000'),
  (8, 'Salta', 'A4400'),
  (9, 'Santa Fe', 'S3000'),
  (10, 'Bahía Blanca', 'B8000'),
  (23, 'Paraná', 'E3100'),
  (24, 'Santa Rosa', 'L6300'),
  (25, 'San Luis', 'D5700'),
  (
    26,
    'San Fernando del Valle de Catamarca',
    'K4700'
  ),
  (27, 'Viedma', 'R8500'),
  (28, 'Rawson', 'U9103'),
  (29, 'Río Gallegos', 'Z9400'),
  (30, 'Formosa', 'P3600'),
  (31, 'Santiago del Estero', 'G4200'),
  (32, 'Tandil', 'B7000'),
  (33, 'Comodoro Rivadavia', 'U9000'),
  (34, 'San Rafael', 'M5600'),
  (35, 'Concordia', 'E3200'),
  (36, 'Goya', 'W3450'),
  (37, 'Villa María', 'X5900'),
  (38, 'Río Cuarto', 'X5800'),
  (39, 'San Martín de los Andes', 'Q8370'),
  (40, 'Trelew', 'U9100'),
  (41, 'Oberá', 'N3360'),
  (42, 'Gualeguaychú', 'E2820'),
  (43, 'Rafaela', 'S2300'),
  (44, 'Villa Mercedes', 'D5730'),
  (45, 'Presidencia Roque Sáenz Peña', 'H3700'),
  (46, 'El Calafate', 'Z9405'),
  (47, 'Paso de los Libres', 'W3230'),
  (48, 'Reconquista', 'S3560'),
  (49, 'Olavarría', 'B7400'),
  (50, 'Cipolletti', 'R8324'),
  (51, 'La Banda', 'G4300'),
  (52, 'Río Grande', 'V9420');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `cliente`
--
CREATE TABLE
  `cliente` (
    `idCliente` int (11) NOT NULL,
    `email` varchar(100) DEFAULT NULL,
    `telefono` varchar(20) DEFAULT NULL,
    `idPersona` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `cliente`
--
INSERT INTO
  `cliente` (`idCliente`, `email`, `telefono`, `idPersona`)
VALUES
  (1, 'juanperez@mail.com', '123456789', 1),
  (2, 'maria@mail.com', '987654321', 2),
  (3, 'carlos@mail.com', '111222333', 3),
  (4, 'laura@mail.com', '444555666', 4),
  (5, 'ana@mail.com', '777888999', 5),
  (6, 'luis@mail.com', '000111222', 6),
  (7, 'sofia@mail.com', '333444555', 7),
  (8, 'diego@mail.com', '666777888', 8),
  (9, 'lucia@mail.com', '999000111', 9),
  (10, 'pedro@mail.com', '222333444', 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `color`
--
CREATE TABLE
  `color` (
    `idColor` int (11) NOT NULL,
    `color` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `color`
--
INSERT INTO
  `color` (`idColor`, `color`)
VALUES
  (1, 'Rojo'),
  (2, 'Azul'),
  (3, 'Negro'),
  (4, 'Blanco'),
  (5, 'Verde'),
  (6, 'Amarillo'),
  (7, 'Gris'),
  (8, 'Marrón'),
  (9, 'Naranja'),
  (10, 'Violeta'),
  (11, 'morado');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `detalleindumentaria`
--
CREATE TABLE
  `detalleindumentaria` (
    `idDetalle` int (11) NOT NULL,
    `idPrecio` int (11) DEFAULT NULL,
    `idCategoria` int (11) DEFAULT NULL,
    `idColor` int (11) DEFAULT NULL,
    `idTalle` int (11) DEFAULT NULL,
    `idEstado` int (11) DEFAULT NULL,
    `idTela` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `detalleindumentaria`
--
INSERT INTO
  `detalleindumentaria` (
    `idDetalle`,
    `idPrecio`,
    `idCategoria`,
    `idColor`,
    `idTalle`,
    `idEstado`,
    `idTela`
  )
VALUES
  (1, 1, 1, 1, 1, 1, 1),
  (2, 2, 2, 2, 2, 2, 2),
  (3, 3, 3, 3, 3, 3, 3),
  (4, 4, 4, 4, 4, 4, 4),
  (5, 5, 5, 5, 5, 5, 5),
  (6, 6, 6, 6, 6, 6, 6),
  (7, 7, 7, 7, 7, 7, 7),
  (8, 8, 8, 8, 8, 8, 8),
  (9, 9, 9, 9, 9, 9, 9),
  (10, 10, 10, 10, 10, 10, 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `detallepedido`
--
CREATE TABLE
  `detallepedido` (
    `idDetallePedido` varchar(50) NOT NULL,
    `numeroPedido` varchar(50) DEFAULT NULL,
    `codigoIndumentaria` varchar(50) DEFAULT NULL,
    `cantidad` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `detallepedido`
--
INSERT INTO
  `detallepedido` (
    `idDetallePedido`,
    `numeroPedido`,
    `codigoIndumentaria`,
    `cantidad`
  )
VALUES
  ('DP-003', 'PED-2025-002', 'IND005', 1);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `domicilio`
--
CREATE TABLE
  `domicilio` (
    `idDomicilio` int (11) NOT NULL,
    `calle` varchar(100) DEFAULT NULL,
    `altura` varchar(10) DEFAULT NULL,
    `piso` varchar(10) DEFAULT NULL,
    `departamento` varchar(10) DEFAULT NULL,
    `observaciones` varchar(255) DEFAULT NULL,
    `idBarrio` int (11) NOT NULL,
    `idCiudad` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `domicilio`
--
INSERT INTO
  `domicilio` (
    `idDomicilio`,
    `calle`,
    `altura`,
    `piso`,
    `departamento`,
    `observaciones`,
    `idBarrio`,
    `idCiudad`
  )
VALUES
  (
    1,
    'Av. Santa Fe',
    '1234',
    '5',
    'A',
    'Frente al parque',
    1,
    1
  ),
  (
    2,
    'Calle Falsa',
    '742',
    NULL,
    NULL,
    'Cerca de la plaza',
    3,
    2
  ),
  (3, '9 de Julio', '500', '2', 'B', '', 2, 1),
  (
    4,
    'Mitre',
    '1020',
    '1',
    'C',
    'Edificio viejo',
    4,
    3
  ),
  (
    5,
    'San Martín',
    '150',
    NULL,
    NULL,
    'Zona comercial',
    5,
    4
  ),
  (
    6,
    'Belgrano',
    '2555',
    '10',
    'D',
    'Vista al mar',
    6,
    6
  ),
  (7, 'Independencia', '360', NULL, NULL, '', 7, 7),
  (8, 'Av. Salta', '890', '3', 'E', '', 8, 8),
  (
    9,
    'Colon',
    '123',
    NULL,
    NULL,
    'Residencial',
    9,
    9
  ),
  (10, 'Alsinaa', '456', '4', 'F', '', 10, 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `encargadoindumentaria`
--
CREATE TABLE
  `encargadoindumentaria` (
    `legajo` varchar(20) NOT NULL,
    `codigoIndumentaria` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `encargadopedidos`
--
CREATE TABLE
  `encargadopedidos` (
    `legajo` varchar(50) NOT NULL,
    `numeroPedido` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `encargadopicker`
--
CREATE TABLE
  `encargadopicker` (
    `legajo` varchar(20) NOT NULL,
    `idPersona` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `encargadopicker`
--
INSERT INTO
  `encargadopicker` (`legajo`, `idPersona`)
VALUES
  ('LP001', 1),
  ('LP002', 2),
  ('LP003', 3),
  ('LP004', 4),
  ('LP005', 5),
  ('LP006', 6),
  ('LP007', 7),
  ('LP008', 8),
  ('LP009', 9),
  ('LP010', 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `encargadopicker_stock`
--
CREATE TABLE
  `encargadopicker_stock` (
    `id` int (11) NOT NULL,
    `legajo` varchar(20) DEFAULT NULL,
    `idStock` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `encargadopicker_stock`
--
INSERT INTO
  `encargadopicker_stock` (`id`, `legajo`, `idStock`)
VALUES
  (1, 'LP001', 'STK001'),
  (2, 'LP002', 'STK002');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `estadoindumentaria`
--
CREATE TABLE
  `estadoindumentaria` (
    `idEstado` int (11) NOT NULL,
    `estadoIndumentaria` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `estadoindumentaria`
--
INSERT INTO
  `estadoindumentaria` (`idEstado`, `estadoIndumentaria`)
VALUES
  (1, 'Nuevo'),
  (2, 'Usado'),
  (3, 'Reacondicionado'),
  (4, 'Exhibición'),
  (5, 'Defectuoso'),
  (6, 'En reparación'),
  (7, 'Prueba'),
  (8, 'Liquidación'),
  (9, 'Demostración'),
  (10, 'Reservado'),
  (11, 'Apto');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `estadopedido`
--
CREATE TABLE
  `estadopedido` (
    `idEstado` int (11) NOT NULL,
    `tipoEstado` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `estadopedido`
--
INSERT INTO
  `estadopedido` (`idEstado`, `tipoEstado`)
VALUES
  (1, 'En curso'),
  (2, 'Pendiente de Pago'),
  (3, 'Abonado'),
  (4, 'Despachado'),
  (5, 'Finalizado'),
  (6, 'Cancelado');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `gerentegeneral`
--
CREATE TABLE
  `gerentegeneral` (
    `idGerente` int (11) NOT NULL,
    `legajo` int (11) DEFAULT NULL,
    `idPersona` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `gerentegeneral`
--
INSERT INTO
  `gerentegeneral` (`idGerente`, `legajo`, `idPersona`)
VALUES
  (1, 1001, 1),
  (2, 1002, 2),
  (3, 1003, 3),
  (4, 1004, 4),
  (5, 1005, 5),
  (6, 1006, 6),
  (7, 1007, 7),
  (8, 1008, 8),
  (9, 1009, 9),
  (10, 1010, 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `indumentaria`
--
CREATE TABLE
  `indumentaria` (
    `codigoIndumentaria` varchar(50) NOT NULL,
    `idDetalle` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `indumentaria`
--
INSERT INTO
  `indumentaria` (`codigoIndumentaria`, `idDetalle`)
VALUES
  ('IND001', 1),
  ('IND002', 2),
  ('IND003', 3),
  ('IND004', 4),
  ('IND005', 5),
  ('IND006', 6),
  ('IND007', 7),
  ('IND008', 8),
  ('IND009', 9),
  ('IND010', 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `movimientostock`
--
CREATE TABLE
  `movimientostock` (
    `idMovimientoStock` varchar(50) NOT NULL,
    `idStock` varchar(50) DEFAULT NULL,
    `fechaMovimiento` date DEFAULT NULL,
    `cantidad` int (11) DEFAULT NULL,
    `observaciones` varchar(255) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `nombreindumentaria`
--
CREATE TABLE
  `nombreindumentaria` (
    `idNombre` int (11) NOT NULL,
    `nombre` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `nombreindumentaria`
--
INSERT INTO
  `nombreindumentaria` (`idNombre`, `nombre`)
VALUES
  (1, 'Camisa'),
  (2, 'Pantalón'),
  (3, 'Chaqueta'),
  (4, 'Polera'),
  (5, 'Zapatos'),
  (6, 'Bufanda'),
  (7, 'Sombrero'),
  (8, 'Guantes'),
  (9, 'Cinturón'),
  (10, 'Calcetines');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `pedido`
--
CREATE TABLE
  `pedido` (
    `numeroPedido` varchar(50) NOT NULL,
    `idCliente` int (11) NOT NULL,
    `fechaPedido` datetime NOT NULL DEFAULT current_timestamp(),
    `idEstado` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `pedido`
--
INSERT INTO
  `pedido` (
    `numeroPedido`,
    `idCliente`,
    `fechaPedido`,
    `idEstado`
  )
VALUES
  ('PED-2025-002', 2, '2025-06-13 17:33:01', 1);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `persona`
--
CREATE TABLE
  `persona` (
    `idPersona` int (11) NOT NULL,
    `dni` int (11) DEFAULT NULL,
    `nombre` varchar(100) DEFAULT NULL,
    `apellido` varchar(100) DEFAULT NULL,
    `direccion` varchar(200) DEFAULT NULL,
    `idDomicilio` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `persona`
--
INSERT INTO
  `persona` (
    `idPersona`,
    `dni`,
    `nombre`,
    `apellido`,
    `direccion`,
    `idDomicilio`
  )
VALUES
  (
    1,
    12345678,
    'Juan Pérez  ',
    '',
    'Av. Santa Fe 1234',
    1
  ),
  (
    2,
    87654321,
    'María',
    'González',
    'Calle Falsa 742',
    2
  ),
  (
    3,
    23456789,
    'Carlos',
    'Lopez',
    '9 de Julio 500',
    3
  ),
  (
    4,
    98765432,
    'Laura',
    'Fernandez',
    'Mitre 1020',
    4
  ),
  (
    5,
    34567890,
    'Ana',
    'Martínez',
    'San Martín 150',
    5
  ),
  (
    6,
    45678901,
    'Luis',
    'Rodríguez',
    'Belgrano 2555',
    6
  ),
  (
    7,
    56789012,
    'Sofía',
    'Gómez',
    'Independencia 360',
    7
  ),
  (8, 67890123, 'Diego', 'Silva', 'Av. Salta 890', 8),
  (9, 78901234, 'Lucía', 'Vargas', 'Colon 123', 9),
  (
    10,
    89012345,
    'Pedro Molina ',
    '',
    'Alsina 456',
    10
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `precioindumentaria`
--
CREATE TABLE
  `precioindumentaria` (
    `idPrecio` int (11) NOT NULL,
    `precio` double DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `precioindumentaria`
--
INSERT INTO
  `precioindumentaria` (`idPrecio`, `precio`)
VALUES
  (1, 1999.99),
  (2, 2499.5),
  (3, 1799),
  (4, 1599.99),
  (5, 2999.95),
  (6, 1099),
  (7, 1899.25),
  (8, 2150.75),
  (9, 1750),
  (10, 2200.5),
  (11, 2001),
  (12, 2000);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `rol`
--
CREATE TABLE
  `rol` (
    `idRol` int (11) NOT NULL,
    `idTipoRol` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `rol`
--
INSERT INTO
  `rol` (`idRol`, `idTipoRol`)
VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `stock`
--
CREATE TABLE
  `stock` (
    `idStock` varchar(50) NOT NULL,
    `codigoIndumentaria` varchar(50) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `stock`
--
INSERT INTO
  `stock` (`idStock`, `codigoIndumentaria`)
VALUES
  ('STK001', 'IND001'),
  ('STK002', 'IND002'),
  ('STK003', 'IND003'),
  ('STK004', 'IND004'),
  ('STK005', 'IND005'),
  ('STK006', 'IND006'),
  ('STK007', 'IND007'),
  ('STK008', 'IND008'),
  ('STK009', 'IND009'),
  ('STK010', 'IND010');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `talle`
--
CREATE TABLE
  `talle` (
    `idTalle` int (11) NOT NULL,
    `talle` varchar(10) CHARACTER
    SET
      utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `talle`
--
INSERT INTO
  `talle` (`idTalle`, `talle`)
VALUES
  (1, '36'),
  (2, '38'),
  (3, '40'),
  (4, '42'),
  (5, '44'),
  (6, '46'),
  (7, '48'),
  (8, '50'),
  (9, '52'),
  (10, '54'),
  (12, 'XXL');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `tela`
--
CREATE TABLE
  `tela` (
    `idTela` int (11) NOT NULL,
    `tipoTela` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tela`
--
INSERT INTO
  `tela` (`idTela`, `tipoTela`)
VALUES
  (1, 'Algodón'),
  (2, 'Poliéster'),
  (3, 'Lana'),
  (4, 'Seda'),
  (5, 'Cuero'),
  (6, 'Denim'),
  (7, 'Lino'),
  (8, 'Nylon'),
  (9, 'Cachemira'),
  (10, 'Franela'),
  (11, 'Harina');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `tiporol`
--
CREATE TABLE
  `tiporol` (
    `idTipoRol` int (11) NOT NULL,
    `tipoRol` varchar(50) DEFAULT NULL,
    `descripcionRol` varchar(255) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tiporol`
--
INSERT INTO
  `tiporol` (`idTipoRol`, `tipoRol`, `descripcionRol`)
VALUES
  (1, 'Administrador', 'Acceso completo al sistema'),
  (2, 'Vendedor', 'Puede realizar ventas'),
  (3, 'Cliente', 'Cliente registrado'),
  (4, 'Invitado', 'Acceso limitado'),
  (5, 'Gerente', 'Supervisa operaciones'),
  (6, 'Picker', 'Encargado de picking'),
  (7, 'Encargado de Stock', 'Gestiona stock'),
  (8, 'Proveedor', 'Suministra productos'),
  (9, 'Contabilidad', 'Maneja finanzas'),
  (10, 'Soporte', 'Asistencia técnica');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `usuario`
--
CREATE TABLE
  `usuario` (
    `idUsuario` int (11) NOT NULL,
    `idPersona` int (11) DEFAULT NULL,
    `nombreUsuario` varchar(100) DEFAULT NULL,
    `contrasena` varchar(100) DEFAULT NULL,
    `idRol` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuario`
--
INSERT INTO
  `usuario` (
    `idUsuario`,
    `idPersona`,
    `nombreUsuario`,
    `contrasena`,
    `idRol`
  )
VALUES
  (1, NULL, 'admin', 'admin123', 1),
  (2, NULL, 'mariag', '123', 1),
  (3, NULL, 'carlosl', 'abc123', 3),
  (4, NULL, 'lauraf', '123456', 4),
  (5, NULL, 'anamtz', 'qwerty', 5),
  (6, NULL, 'luisrd', 'asdfgh', 6),
  (7, NULL, 'sofiag', 'zxcvbn', 7),
  (8, NULL, 'diegos', 'password', 8),
  (9, NULL, 'luciav', 'letmein', 9);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `vendedor`
--
CREATE TABLE
  `vendedor` (
    `idVendedor` int (11) NOT NULL,
    `legajo` int (11) DEFAULT NULL,
    `idPersona` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `vendedor`
--
INSERT INTO
  `vendedor` (`idVendedor`, `legajo`, `idPersona`)
VALUES
  (1, 3001, 1),
  (2, 3002, 2),
  (3, 3003, 3),
  (4, 3004, 4),
  (5, 3005, 5),
  (6, 3006, 6),
  (7, 3007, 7),
  (8, 3008, 8),
  (9, 3009, 9),
  (10, 3010, 10);

--
-- Índices para tablas volcadas
--
--
-- Indices de la tabla `adminsistemas`
--
ALTER TABLE `adminsistemas` ADD PRIMARY KEY (`idAdminSis`),
ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `barrio`
--
ALTER TABLE `barrio` ADD PRIMARY KEY (`idBarrio`),
ADD KEY `idCiudad` (`idCiudad`);

--
-- Indices de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria` ADD PRIMARY KEY (`idCategoria`);

--
-- Indices de la tabla `ciudad`
--
ALTER TABLE `ciudad` ADD PRIMARY KEY (`idCiudad`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente` ADD PRIMARY KEY (`idCliente`),
ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `color`
--
ALTER TABLE `color` ADD PRIMARY KEY (`idColor`);

--
-- Indices de la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria` ADD PRIMARY KEY (`idDetalle`),
ADD KEY `idPrecio` (`idPrecio`),
ADD KEY `idCategoria` (`idCategoria`),
ADD KEY `idColor` (`idColor`),
ADD KEY `idTalle` (`idTalle`),
ADD KEY `idEstado` (`idEstado`),
ADD KEY `idTela` (`idTela`);

--
-- Indices de la tabla `detallepedido`
--
ALTER TABLE `detallepedido` ADD PRIMARY KEY (`idDetallePedido`),
ADD KEY `numeroPedido` (`numeroPedido`),
ADD KEY `codigoIndumentaria` (`codigoIndumentaria`);

--
-- Indices de la tabla `domicilio`
--
ALTER TABLE `domicilio` ADD PRIMARY KEY (`idDomicilio`),
ADD KEY `idBarrio` (`idBarrio`),
ADD KEY `idCiudad` (`idCiudad`);

--
-- Indices de la tabla `encargadoindumentaria`
--
ALTER TABLE `encargadoindumentaria` ADD PRIMARY KEY (`legajo`),
ADD KEY `codigoIndumentaria` (`codigoIndumentaria`);

--
-- Indices de la tabla `encargadopedidos`
--
ALTER TABLE `encargadopedidos` ADD PRIMARY KEY (`legajo`),
ADD KEY `numeroPedido` (`numeroPedido`);

--
-- Indices de la tabla `encargadopicker`
--
ALTER TABLE `encargadopicker` ADD PRIMARY KEY (`legajo`),
ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock` ADD PRIMARY KEY (`id`),
ADD KEY `legajo` (`legajo`),
ADD KEY `idStock` (`idStock`);

--
-- Indices de la tabla `estadoindumentaria`
--
ALTER TABLE `estadoindumentaria` ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `estadopedido`
--
ALTER TABLE `estadopedido` ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `gerentegeneral`
--
ALTER TABLE `gerentegeneral` ADD PRIMARY KEY (`idGerente`),
ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `indumentaria`
--
ALTER TABLE `indumentaria` ADD PRIMARY KEY (`codigoIndumentaria`),
ADD KEY `idDetalle` (`idDetalle`);

--
-- Indices de la tabla `movimientostock`
--
ALTER TABLE `movimientostock` ADD PRIMARY KEY (`idMovimientoStock`),
ADD KEY `idStock` (`idStock`);

--
-- Indices de la tabla `nombreindumentaria`
--
ALTER TABLE `nombreindumentaria` ADD PRIMARY KEY (`idNombre`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido` ADD PRIMARY KEY (`numeroPedido`),
ADD KEY `idEstado` (`idEstado`),
ADD KEY `pedido_ibfk_cliente` (`idCliente`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona` ADD PRIMARY KEY (`idPersona`),
ADD KEY `idDomicilio` (`idDomicilio`);

--
-- Indices de la tabla `precioindumentaria`
--
ALTER TABLE `precioindumentaria` ADD PRIMARY KEY (`idPrecio`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol` ADD PRIMARY KEY (`idRol`),
ADD KEY `idTipoRol` (`idTipoRol`);

--
-- Indices de la tabla `stock`
--
ALTER TABLE `stock` ADD PRIMARY KEY (`idStock`),
ADD KEY `codigoIndumentaria` (`codigoIndumentaria`);

--
-- Indices de la tabla `talle`
--
ALTER TABLE `talle` ADD PRIMARY KEY (`idTalle`);

--
-- Indices de la tabla `tela`
--
ALTER TABLE `tela` ADD PRIMARY KEY (`idTela`);

--
-- Indices de la tabla `tiporol`
--
ALTER TABLE `tiporol` ADD PRIMARY KEY (`idTipoRol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario` ADD PRIMARY KEY (`idUsuario`),
ADD UNIQUE KEY `idPersona` (`idPersona`),
ADD KEY `idRol` (`idRol`);

--
-- Indices de la tabla `vendedor`
--
ALTER TABLE `vendedor` ADD PRIMARY KEY (`idVendedor`),
ADD KEY `idPersona` (`idPersona`);

--
-- AUTO_INCREMENT de las tablas volcadas
--
--
-- AUTO_INCREMENT de la tabla `barrio`
--
ALTER TABLE `barrio` MODIFY `idBarrio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 37;

--
-- AUTO_INCREMENT de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria` MODIFY `idCategoria` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 12;

--
-- AUTO_INCREMENT de la tabla `ciudad`
--
ALTER TABLE `ciudad` MODIFY `idCiudad` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 62;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente` MODIFY `idCliente` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 28;

--
-- AUTO_INCREMENT de la tabla `color`
--
ALTER TABLE `color` MODIFY `idColor` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 12;

--
-- AUTO_INCREMENT de la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria` MODIFY `idDetalle` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 13;

--
-- AUTO_INCREMENT de la tabla `domicilio`
--
ALTER TABLE `domicilio` MODIFY `idDomicilio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 35;

--
-- AUTO_INCREMENT de la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock` MODIFY `id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de la tabla `estadoindumentaria`
--
ALTER TABLE `estadoindumentaria` MODIFY `idEstado` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 12;

--
-- AUTO_INCREMENT de la tabla `nombreindumentaria`
--
ALTER TABLE `nombreindumentaria` MODIFY `idNombre` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 11;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona` MODIFY `idPersona` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 34;

--
-- AUTO_INCREMENT de la tabla `precioindumentaria`
--
ALTER TABLE `precioindumentaria` MODIFY `idPrecio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 13;

--
-- AUTO_INCREMENT de la tabla `talle`
--
ALTER TABLE `talle` MODIFY `idTalle` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 13;

--
-- AUTO_INCREMENT de la tabla `tela`
--
ALTER TABLE `tela` MODIFY `idTela` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 12;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario` MODIFY `idUsuario` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 15;

--
-- Restricciones para tablas volcadas
--
--
-- Filtros para la tabla `adminsistemas`
--
ALTER TABLE `adminsistemas` ADD CONSTRAINT `adminsistemas_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `barrio`
--
ALTER TABLE `barrio` ADD CONSTRAINT `barrio_ibfk_1` FOREIGN KEY (`idCiudad`) REFERENCES `ciudad` (`idCiudad`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente` ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria` ADD CONSTRAINT `detalleindumentaria_ibfk_1` FOREIGN KEY (`idPrecio`) REFERENCES `precioindumentaria` (`idPrecio`),
ADD CONSTRAINT `detalleindumentaria_ibfk_2` FOREIGN KEY (`idCategoria`) REFERENCES `categoriaindumentaria` (`idCategoria`),
ADD CONSTRAINT `detalleindumentaria_ibfk_3` FOREIGN KEY (`idColor`) REFERENCES `color` (`idColor`),
ADD CONSTRAINT `detalleindumentaria_ibfk_4` FOREIGN KEY (`idTalle`) REFERENCES `talle` (`idTalle`),
ADD CONSTRAINT `detalleindumentaria_ibfk_5` FOREIGN KEY (`idEstado`) REFERENCES `estadoindumentaria` (`idEstado`),
ADD CONSTRAINT `detalleindumentaria_ibfk_6` FOREIGN KEY (`idTela`) REFERENCES `tela` (`idTela`);

--
-- Filtros para la tabla `detallepedido`
--
ALTER TABLE `detallepedido` ADD CONSTRAINT `detallepedido_ibfk_1` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`),
ADD CONSTRAINT `detallepedido_ibfk_2` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `domicilio`
--
ALTER TABLE `domicilio` ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`idBarrio`) REFERENCES `barrio` (`idBarrio`),
ADD CONSTRAINT `domicilio_ibfk_2` FOREIGN KEY (`idCiudad`) REFERENCES `ciudad` (`idCiudad`);

--
-- Filtros para la tabla `encargadoindumentaria`
--
ALTER TABLE `encargadoindumentaria` ADD CONSTRAINT `encargadoindumentaria_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `encargadopedidos`
--
ALTER TABLE `encargadopedidos` ADD CONSTRAINT `encargadopedidos_ibfk_1` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`);

--
-- Filtros para la tabla `encargadopicker`
--
ALTER TABLE `encargadopicker` ADD CONSTRAINT `encargadopicker_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock` ADD CONSTRAINT `encargadopicker_stock_ibfk_1` FOREIGN KEY (`legajo`) REFERENCES `encargadopicker` (`legajo`),
ADD CONSTRAINT `encargadopicker_stock_ibfk_2` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`);

--
-- Filtros para la tabla `gerentegeneral`
--
ALTER TABLE `gerentegeneral` ADD CONSTRAINT `gerentegeneral_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `indumentaria`
--
ALTER TABLE `indumentaria` ADD CONSTRAINT `indumentaria_ibfk_1` FOREIGN KEY (`idDetalle`) REFERENCES `detalleindumentaria` (`idDetalle`);

--
-- Filtros para la tabla `movimientostock`
--
ALTER TABLE `movimientostock` ADD CONSTRAINT `movimientostock_ibfk_1` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`idEstado`) REFERENCES `estadopedido` (`idEstado`),
ADD CONSTRAINT `pedido_ibfk_cliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`);

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona` ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`idDomicilio`) REFERENCES `domicilio` (`idDomicilio`);

--
-- Filtros para la tabla `rol`
--
ALTER TABLE `rol` ADD CONSTRAINT `rol_ibfk_1` FOREIGN KEY (`idTipoRol`) REFERENCES `tiporol` (`idTipoRol`);

--
-- Filtros para la tabla `stock`
--
ALTER TABLE `stock` ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`),
ADD CONSTRAINT `usuario_ibfk_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `vendedor`
--
ALTER TABLE `vendedor` ADD CONSTRAINT `vendedor_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;