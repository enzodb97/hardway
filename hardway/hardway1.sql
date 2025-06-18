-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-06-2025 a las 18:38:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30
SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

/*!40101 SET NAMES utf8mb4 */;

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
-- Estructura de tabla para la tabla `asignacion_picking`
--
CREATE TABLE
  `asignacion_picking` (
    `idAsignacion` int (11) NOT NULL,
    `numeroPedido` varchar(50) NOT NULL,
    `legajoPicker` varchar(20) NOT NULL,
    `fechaAsignacion` datetime NOT NULL DEFAULT current_timestamp(),
    `fechaCompletado` datetime DEFAULT NULL,
    `observaciones` varchar(255) DEFAULT NULL,
    `completado` tinyint (1) NOT NULL DEFAULT 0
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `asignacion_picking`
--
INSERT INTO
  `asignacion_picking` (
    `idAsignacion`,
    `numeroPedido`,
    `legajoPicker`,
    `fechaAsignacion`,
    `fechaCompletado`,
    `observaciones`,
    `completado`
  )
VALUES
  (
    29,
    'PED-2025-112',
    'LP005',
    '2025-06-18 06:35:53',
    NULL,
    'Asignación desde panel gerente',
    0
  ),
  (
    30,
    'PED-2025-113',
    'LP006',
    '2025-06-18 06:36:03',
    NULL,
    'Asignación desde panel gerente',
    0
  );

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
  (11, 'Sport'),
  (12, 'Utilitario');

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
  (10, 'pedro@mail.com', '222333444', 10),
  (28, 'martin.gomez1@test.com', '555-1101', 34),
  (29, 'sofia.rodriguez1@test.com', '555-1102', 35),
  (30, 'diego.fernandez1@test.com', '555-1103', 36),
  (31, 'lucia.diaz1@test.com', '555-1104', 37),
  (32, 'carlos.lopez1@test.com', '555-1105', 38),
  (33, 'martin.gomez2@test.com', '555-1106', 39),
  (34, 'sofia.rodriguez2@test.com', '555-1107', 40),
  (35, 'valeria.paz1@test.com', '555-1108', 41),
  (36, 'javier.sosa1@test.com', '555-1109', 42),
  (37, 'carolina.vega1@test.com', '555-1110', 43),
  (38, 'diego.fernandez2@test.com', '555-1111', 44),
  (39, 'lucia.diaz2@test.com', '555-1112', 45),
  (40, 'carlos.lopez2@test.com', '555-1113', 46),
  (41, 'andrea.moreno1@test.com', '555-1114', 47),
  (42, 'hernan.alonso1@test.com', '555-1115', 48),
  (43, 'martin.gomez3@test.com', '555-1116', 49),
  (44, 'gabriela.torres1@test.com', '555-1117', 50),
  (45, 'matias.romero1@test.com', '555-1118', 51),
  (46, 'paula.suarez1@test.com', '555-1119', 52),
  (47, 'martin.gomez4@test.com', '555-1120', 53);

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
  (11, 'Morado');

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `detalleindumentaria`
--
CREATE TABLE
  `detalleindumentaria` (
    `idDetalle` int (11) NOT NULL,
    `idNombre` int (11) DEFAULT NULL,
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
    `idNombre`,
    `idPrecio`,
    `idCategoria`,
    `idColor`,
    `idTalle`,
    `idEstado`,
    `idTela`
  )
VALUES
  (1, 1, 1, 1, 1, 1, 1, 1),
  (2, 2, 2, 2, 2, 2, 1, 2),
  (3, 3, 3, 3, 3, 3, 1, 3),
  (4, 4, 4, 4, 4, 4, 1, 4),
  (5, 5, 5, 5, 5, 5, 1, 5),
  (6, 6, 6, 6, 6, 6, 1, 6),
  (7, 7, 7, 7, 7, 7, 1, 7),
  (8, 8, 8, 8, 8, 8, 1, 8),
  (9, 9, 9, 9, 9, 9, 1, 9),
  (10, 10, 10, 10, 10, 10, 1, 10),
  (16, 10, 10, 3, 3, 6, 1, 3);

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
  ('DP-015', 'PED-2025-014', 'IND001', 2),
  ('DP-016', 'PED-2025-015', 'IND002', 1),
  ('DP-017', 'PED-2025-016', 'IND006', 3),
  ('DP-018', 'PED-2025-017', 'IND008', 2),
  ('DP-019', 'PED-2025-018', 'IND010', 1),
  ('DP-020', 'PED-2025-019', 'IND003', 2),
  ('DP-021', 'PED-2025-020', 'IND004', 3),
  ('DP-022', 'PED-2025-021', 'IND005', 1),
  ('DP-023', 'PED-2025-022', 'IND007', 2),
  ('DP-024', 'PED-2025-023', 'IND009', 1),
  ('DP-025', 'PED-2025-024', 'IND001', 1),
  ('DP-026', 'PED-2025-025', 'IND002', 2),
  ('DP-027', 'PED-2025-026', 'IND003', 3),
  ('DP-028', 'PED-2025-027', 'IND004', 1),
  ('DP-029', 'PED-2025-028', 'IND005', 2),
  ('DP-030', 'PED-2025-029', 'IND006', 1),
  ('DP-031', 'PED-2025-030', 'IND007', 3),
  ('DP-101', 'PED-2025-101', 'IND001', 2),
  ('DP-102', 'PED-2025-102', 'IND002', 3),
  ('DP-103', 'PED-2025-103', 'IND003', 1),
  ('DP-104', 'PED-2025-104', 'IND004', 2),
  ('DP-105', 'PED-2025-105', 'IND005', 1),
  ('DP-106', 'PED-2025-106', 'IND006', 2),
  ('DP-107', 'PED-2025-107', 'IND007', 3),
  ('DP-108', 'PED-2025-108', 'IND008', 1),
  ('DP-109', 'PED-2025-109', 'IND009', 2),
  ('DP-110', 'PED-2025-110', 'IND010', 1),
  ('DP-112', 'PED-2025-112', 'IND002', 2),
  ('DP-113', 'PED-2025-113', 'IND003', 1),
  ('DP-114', 'PED-2025-114', 'IND004', 3),
  ('DP-115', 'PED-2025-115', 'IND005', 2),
  ('DP-116', 'PED-2025-116', 'IND006', 1),
  ('DP-117', 'PED-2025-117', 'IND007', 2),
  ('DP-118', 'PED-2025-118', 'IND008', 1),
  ('DP-119', 'PED-2025-119', 'IND009', 3),
  ('DP-120', 'PED-2025-120', 'IND010', 2),
  ('DPED-043831', 'PED-2025-429', 'IND001', 1),
  ('DPED-242246', 'PED-2025-561', 'IND003', 3),
  ('DPED-368986', 'PED-2025-333', 'IND001', 2),
  ('DPED-472999', 'PED-2025-172', 'IND003', 6),
  ('DPED-532448', 'PED-2025-172', 'IND002', 4),
  ('DPED-618710', 'PED-2025-429', 'IND002', 1),
  ('DPED-691464', 'PED-2025-172', 'IND001', 2),
  ('DPED-693468', 'PED-2025-561', 'IND001', 3),
  ('DPED-911321', 'PED-2025-111', 'IND001', 1);

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
  (10, 'Alsinaa', '456', '4', 'F', '', 10, 10),
  (35, 'Calle Sol', '1100', NULL, NULL, NULL, 1, 1),
  (36, 'Calle Luna', '1200', NULL, NULL, NULL, 2, 1),
  (
    37,
    'Calle Estrella',
    '1300',
    NULL,
    NULL,
    NULL,
    3,
    2
  ),
  (
    38,
    'Calle Cometa',
    '1400',
    NULL,
    NULL,
    NULL,
    4,
    3
  ),
  (
    39,
    'Calle Planeta',
    '1500',
    NULL,
    NULL,
    NULL,
    5,
    4
  ),
  (40, 'Av. Sol', '1600', NULL, NULL, NULL, 6, 6),
  (41, 'Av. Luna', '1700', NULL, NULL, NULL, 7, 7),
  (
    42,
    'Av. Estrella',
    '1800',
    NULL,
    NULL,
    NULL,
    8,
    8
  ),
  (43, 'Av. Cometa', '1900', NULL, NULL, NULL, 9, 9),
  (
    44,
    'Av. Planeta',
    '2000',
    NULL,
    NULL,
    NULL,
    10,
    10
  ),
  (45, 'Pasaje Sol', '2100', NULL, NULL, NULL, 1, 1),
  (46, 'Pasaje Luna', '2200', NULL, NULL, NULL, 2, 1),
  (
    47,
    'Pasaje Estrella',
    '2300',
    NULL,
    NULL,
    NULL,
    3,
    2
  ),
  (
    48,
    'Pasaje Cometa',
    '2400',
    NULL,
    NULL,
    NULL,
    4,
    3
  ),
  (
    49,
    'Pasaje Planeta',
    '2500',
    NULL,
    NULL,
    NULL,
    5,
    4
  ),
  (50, 'Ruta Sol', '2600', NULL, NULL, NULL, 6, 6),
  (51, 'Ruta Luna', '2700', NULL, NULL, NULL, 7, 7),
  (
    52,
    'Ruta Estrella',
    '2800',
    NULL,
    NULL,
    NULL,
    8,
    8
  ),
  (53, 'Ruta Cometa', '2900', NULL, NULL, NULL, 9, 9),
  (
    54,
    'Ruta Planeta',
    '3000',
    NULL,
    NULL,
    NULL,
    10,
    10
  );

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
  ('LP005', 5),
  ('LP006', 6);

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
  (1, 'Apta'),
  (2, 'No Apta');

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
  ('IND010', 16);

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

--
-- Volcado de datos para la tabla `movimientostock`
--
INSERT INTO
  `movimientostock` (
    `idMovimientoStock`,
    `idStock`,
    `fechaMovimiento`,
    `cantidad`,
    `observaciones`
  )
VALUES
  (
    'MOV-604887',
    'STK010',
    '2025-06-14',
    2,
    'Ajuste manual desde edición'
  ),
  (
    'MOV-845053',
    'STK010',
    '2025-06-14',
    -2,
    'Ajuste manual desde edición'
  ),
  (
    'MOV-DEL-109900',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por eliminación de pedido PED-2025-663'
  ),
  (
    'MOV-DEL-148817',
    'STK003',
    '2025-06-16',
    1,
    'Devolución por eliminación de pedido PED-2025-823'
  ),
  (
    'MOV-DEL-264368',
    'STK001',
    '2025-06-16',
    12,
    'Devolución por eliminación de pedido PED-2025-663'
  ),
  (
    'MOV-DEL-381517',
    'STK001',
    '2025-06-16',
    1,
    'Devolución por eliminación de pedido PED-2025-885'
  ),
  (
    'MOV-DEL-423999',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por eliminación de pedido PED-2025-885'
  ),
  (
    'MOV-DEL-438380',
    'STK001',
    '2025-06-16',
    2,
    'Devolución por eliminación de pedido PED-2025-002'
  ),
  (
    'MOV-DEL-547462',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por eliminación de pedido PED-2025-446'
  ),
  (
    'MOV-DEL-561610',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por eliminación de pedido PED-2025-446'
  ),
  (
    'MOV-DEL-579352',
    'STK005',
    '2025-06-16',
    8,
    'Devolución por eliminación de pedido PED-2025-973'
  ),
  (
    'MOV-DEL-646992',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por eliminación de pedido PED-2025-576'
  ),
  (
    'MOV-DEL-659172',
    'STK001',
    '2025-06-16',
    1,
    'Devolución por eliminación de pedido PED-2025-576'
  ),
  (
    'MOV-DEL-724299',
    'STK005',
    '2025-06-16',
    12,
    'Devolución por eliminación de pedido PED-2025-663'
  ),
  (
    'MOV-DEL-938189',
    'STK001',
    '2025-06-16',
    1,
    'Devolución por eliminación de pedido PED-2025-823'
  ),
  (
    'MOV-EDIT-DESC-048909',
    'STK005',
    '2025-06-16',
    -8,
    'Descuento por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DESC-058906',
    'STK005',
    '2025-06-16',
    -8,
    'Descuento por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DESC-122896',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-129750',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-169481',
    'STK005',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-182533',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-185294',
    'STK005',
    '2025-06-16',
    -16,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-234815',
    'STK001',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-267547',
    'STK005',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-289981',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DESC-328881',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-333034',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-341771',
    'STK005',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DESC-392085',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-415749',
    'STK001',
    '2025-06-16',
    -12,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-418381',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-422511',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-424959',
    'STK005',
    '2025-06-16',
    -12,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-440387',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-451916',
    'STK005',
    '2025-06-16',
    -14,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-454311',
    'STK005',
    '2025-06-16',
    -12,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-466865',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DESC-513756',
    'STK005',
    '2025-06-16',
    -1,
    'Descuento por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DESC-515585',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DESC-521655',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-555850',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DESC-558772',
    'STK005',
    '2025-06-16',
    -8,
    'Descuento por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DESC-568211',
    'STK005',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DESC-574305',
    'STK005',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-590075',
    'STK005',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-598528',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-614628',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-617106',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DESC-684918',
    'STK005',
    '2025-06-16',
    -16,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-716976',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por edición de pedido PED-2025-111'
  ),
  (
    'MOV-EDIT-DESC-736685',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-756529',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-756819',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-761677',
    'STK001',
    '2025-06-16',
    -10,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-784970',
    'STK001',
    '2025-06-16',
    -4,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-786503',
    'STK002',
    '2025-06-17',
    -1,
    'Descuento por edición de pedido PED-2025-429'
  ),
  (
    'MOV-EDIT-DESC-838648',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-860534',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-861777',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DESC-878969',
    'STK001',
    '2025-06-17',
    -1,
    'Descuento por edición de pedido PED-2025-429'
  ),
  (
    'MOV-EDIT-DESC-907812',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DESC-938865',
    'STK005',
    '2025-06-16',
    -16,
    'Descuento por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-009527',
    'STK001',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DEV-012834',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-028788',
    'STK001',
    '2025-06-16',
    1,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-034202',
    'STK005',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DEV-061252',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-065823',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-124081',
    'STK005',
    '2025-06-16',
    16,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-131152',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-134631',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-170032',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DEV-210059',
    'STK001',
    '2025-06-17',
    1,
    'Devolución por edición de pedido PED-2025-429'
  ),
  (
    'MOV-EDIT-DEV-216002',
    'STK005',
    '2025-06-16',
    8,
    'Devolución por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DEV-231203',
    'STK001',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-235744',
    'STK005',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-293018',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-306124',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-309231',
    'STK005',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-362418',
    'STK005',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DEV-376428',
    'STK001',
    '2025-06-16',
    3,
    'Devolución por edición de pedido PED-2025-111'
  ),
  (
    'MOV-EDIT-DEV-391331',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-397519',
    'STK005',
    '2025-06-16',
    1,
    'Devolución por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DEV-436940',
    'STK005',
    '2025-06-16',
    12,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-507330',
    'STK005',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DEV-542624',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-544504',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-548392',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-560199',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-573919',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-580892',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-593845',
    'STK005',
    '2025-06-16',
    16,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-597888',
    'STK005',
    '2025-06-16',
    1,
    'Devolución por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DEV-611280',
    'STK005',
    '2025-06-16',
    8,
    'Devolución por edición de pedido PED-2025-973'
  ),
  (
    'MOV-EDIT-DEV-622945',
    'STK005',
    '2025-06-16',
    16,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-637531',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-642911',
    'STK005',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-645008',
    'STK005',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-668877',
    'STK005',
    '2025-06-16',
    14,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-726457',
    'STK001',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-446'
  ),
  (
    'MOV-EDIT-DEV-743934',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-774661',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-784949',
    'STK001',
    '2025-06-16',
    10,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-793652',
    'STK001',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-002'
  ),
  (
    'MOV-EDIT-DEV-984975',
    'STK003',
    '2025-06-16',
    2,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-EDIT-DEV-987082',
    'STK001',
    '2025-06-16',
    4,
    'Devolución por edición de pedido PED-2025-663'
  ),
  (
    'MOV-INIT-001',
    'STK001',
    '2025-06-13',
    100,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-002',
    'STK002',
    '2025-06-13',
    80,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-003',
    'STK003',
    '2025-06-13',
    120,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-004',
    'STK004',
    '2025-06-13',
    75,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-005',
    'STK005',
    '2025-06-13',
    90,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-006',
    'STK006',
    '2025-06-13',
    150,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-007',
    'STK007',
    '2025-06-13',
    60,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-008',
    'STK008',
    '2025-06-13',
    200,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-009',
    'STK009',
    '2025-06-13',
    110,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-INIT-010',
    'STK010',
    '2025-06-13',
    130,
    'Carga Inicial de Stock'
  ),
  (
    'MOV-PED-014',
    'STK001',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-014'
  ),
  (
    'MOV-PED-015',
    'STK002',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-015'
  ),
  (
    'MOV-PED-016',
    'STK006',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-016'
  ),
  (
    'MOV-PED-017',
    'STK008',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-017'
  ),
  (
    'MOV-PED-018',
    'STK010',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-018'
  ),
  (
    'MOV-PED-019',
    'STK003',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-019'
  ),
  (
    'MOV-PED-020',
    'STK004',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-020'
  ),
  (
    'MOV-PED-021',
    'STK005',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-021'
  ),
  (
    'MOV-PED-022',
    'STK007',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-022'
  ),
  (
    'MOV-PED-023',
    'STK009',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-023'
  ),
  (
    'MOV-PED-024',
    'STK001',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-024'
  ),
  (
    'MOV-PED-025',
    'STK002',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-025'
  ),
  (
    'MOV-PED-026',
    'STK003',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-026'
  ),
  (
    'MOV-PED-027',
    'STK004',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-027'
  ),
  (
    'MOV-PED-028',
    'STK005',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-028'
  ),
  (
    'MOV-PED-029',
    'STK006',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-029'
  ),
  (
    'MOV-PED-030',
    'STK007',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-030'
  ),
  (
    'MOV-PED-101',
    'STK001',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-101'
  ),
  (
    'MOV-PED-102',
    'STK002',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-102'
  ),
  (
    'MOV-PED-103',
    'STK003',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-103'
  ),
  (
    'MOV-PED-104',
    'STK004',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-104'
  ),
  (
    'MOV-PED-105',
    'STK005',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-105'
  ),
  (
    'MOV-PED-106',
    'STK006',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-106'
  ),
  (
    'MOV-PED-107',
    'STK007',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-107'
  ),
  (
    'MOV-PED-108',
    'STK008',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-108'
  ),
  (
    'MOV-PED-109',
    'STK009',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-109'
  ),
  (
    'MOV-PED-110',
    'STK010',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-110'
  ),
  (
    'MOV-PED-111',
    'STK001',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-111'
  ),
  (
    'MOV-PED-112',
    'STK002',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-112'
  ),
  (
    'MOV-PED-113',
    'STK003',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-113'
  ),
  (
    'MOV-PED-114',
    'STK004',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-114'
  ),
  (
    'MOV-PED-115',
    'STK005',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-115'
  ),
  (
    'MOV-PED-116',
    'STK006',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-116'
  ),
  (
    'MOV-PED-117',
    'STK007',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-117'
  ),
  (
    'MOV-PED-118',
    'STK008',
    '2025-06-16',
    -1,
    'Venta Pedido PED-2025-118'
  ),
  (
    'MOV-PED-119',
    'STK009',
    '2025-06-16',
    -3,
    'Venta Pedido PED-2025-119'
  ),
  (
    'MOV-PED-120',
    'STK010',
    '2025-06-16',
    -2,
    'Venta Pedido PED-2025-120'
  ),
  (
    'MOV-PED-131967',
    'STK002',
    '2025-06-16',
    -4,
    'Descuento por pedido PED-2025-172'
  ),
  (
    'MOV-PED-183627',
    'STK001',
    '2025-06-18',
    -3,
    'Descuento por pedido PED-2025-561'
  ),
  (
    'MOV-PED-216017',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-885'
  ),
  (
    'MOV-PED-263644',
    'STK003',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-823'
  ),
  (
    'MOV-PED-280052',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-576'
  ),
  (
    'MOV-PED-299447',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-172'
  ),
  (
    'MOV-PED-533530',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-663'
  ),
  (
    'MOV-PED-563744',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-576'
  ),
  (
    'MOV-PED-645037',
    'STK005',
    '2025-06-16',
    -10,
    'Descuento por pedido PED-2025-973'
  ),
  (
    'MOV-PED-670457',
    'STK003',
    '2025-06-16',
    -6,
    'Descuento por pedido PED-2025-172'
  ),
  (
    'MOV-PED-704202',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-333'
  ),
  (
    'MOV-PED-707737',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-885'
  ),
  (
    'MOV-PED-756345',
    'STK003',
    '2025-06-18',
    -3,
    'Descuento por pedido PED-2025-561'
  ),
  (
    'MOV-PED-792885',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-429'
  ),
  (
    'MOV-PED-870580',
    'STK001',
    '2025-06-16',
    -1,
    'Descuento por pedido PED-2025-823'
  ),
  (
    'MOV-PED-943756',
    'STK001',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-446'
  ),
  (
    'MOV-PED-965241',
    'STK003',
    '2025-06-16',
    -2,
    'Descuento por pedido PED-2025-663'
  );

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
    `fechaModificacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
    `codigoSeguimiento` varchar(100) DEFAULT NULL,
    `idEstado` int (11) DEFAULT NULL,
    `dummyUpdate` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `pedido`
--
INSERT INTO
  `pedido` (
    `numeroPedido`,
    `idCliente`,
    `fechaPedido`,
    `fechaModificacion`,
    `codigoSeguimiento`,
    `idEstado`,
    `dummyUpdate`
  )
VALUES
  (
    'PED-2025-014',
    28,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-015',
    29,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-016',
    28,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-017',
    30,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-018',
    31,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    5,
    NULL
  ),
  (
    'PED-2025-019',
    32,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-020',
    33,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-021',
    34,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-022',
    35,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-023',
    33,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-024',
    36,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-025',
    37,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-026',
    38,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-027',
    39,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-028',
    40,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-029',
    36,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    5,
    NULL
  ),
  (
    'PED-2025-030',
    41,
    '2025-06-16 15:34:33',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-101',
    28,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-102',
    29,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-103',
    30,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-104',
    28,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-105',
    31,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-106',
    32,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    5,
    NULL
  ),
  (
    'PED-2025-107',
    33,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-108',
    34,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-109',
    35,
    '2025-06-16 15:44:01',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-110',
    36,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-111',
    37,
    '2025-06-16 15:44:02',
    '2025-06-18 02:32:53',
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-112',
    37,
    '2025-06-16 15:44:02',
    '2025-06-18 03:35:41',
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-113',
    38,
    '2025-06-16 15:44:02',
    '2025-06-18 03:35:37',
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-114',
    39,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-115',
    40,
    '2025-06-14 15:44:02',
    '2025-06-16 15:47:35',
    NULL,
    4,
    NULL
  ),
  (
    'PED-2025-116',
    41,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    5,
    NULL
  ),
  (
    'PED-2025-117',
    1,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-118',
    2,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-119',
    3,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    3,
    NULL
  ),
  (
    'PED-2025-120',
    4,
    '2025-06-16 15:44:02',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-172',
    1,
    '2025-06-16 03:55:34',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-333',
    4,
    '2025-06-16 04:01:30',
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'PED-2025-429',
    28,
    '2025-06-16 20:43:17',
    '2025-06-18 13:26:38',
    NULL,
    2,
    NULL
  ),
  (
    'PED-2025-561',
    8,
    '2025-06-18 16:36:33',
    NULL,
    NULL,
    1,
    NULL
  );

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
  ),
  (34, 89100101, 'Martin', 'Gomez', NULL, 35),
  (35, 89100102, 'Sofia', 'Rodriguez', NULL, 36),
  (36, 89100103, 'Diego', 'Fernandez', NULL, 37),
  (37, 89100104, 'Lucia', 'Diaz', NULL, 38),
  (38, 89100105, 'Carlos', 'Lopez', NULL, 39),
  (39, 89100106, 'Martin', 'Gomez', NULL, 40),
  (40, 89100107, 'Sofia', 'Rodriguez', NULL, 41),
  (41, 89100108, 'Valeria', 'Paz', NULL, 42),
  (42, 89100109, 'Javier', 'Sosa', NULL, 43),
  (43, 89100110, 'Carolina', 'Vega', NULL, 44),
  (44, 89100111, 'Diego', 'Fernandez', NULL, 45),
  (45, 89100112, 'Lucia', 'Diaz', NULL, 46),
  (46, 89100113, 'Carlos', 'Lopez', NULL, 47),
  (47, 89100114, 'Andrea', 'Moreno', NULL, 48),
  (48, 89100115, 'Hernan', 'Alonso', NULL, 49),
  (49, 89100116, 'Martin', 'Gomez', NULL, 50),
  (50, 89100117, 'Gabriela', 'Torres', NULL, 51),
  (51, 89100118, 'Matias', 'Romero', NULL, 52),
  (52, 89100119, 'Paula', 'Suarez', NULL, 53),
  (53, 89100120, 'Martin', 'Gomez', NULL, 54);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `precioindumentaria`
--
CREATE TABLE
  `precioindumentaria` (
    `idPrecio` int (11) NOT NULL,
    `precio` decimal(10, 2) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `precioindumentaria`
--
INSERT INTO
  `precioindumentaria` (`idPrecio`, `precio`)
VALUES
  (1, 1999.99),
  (2, 2499.50),
  (3, 1799.00),
  (4, 1599.99),
  (5, 2999.95),
  (6, 1099.00),
  (7, 1899.25),
  (8, 2150.75),
  (9, 1750.00),
  (10, 2200.00);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `rack`
--
CREATE TABLE
  `rack` (
    `idRack` int (11) NOT NULL,
    `numeroRack` int (11) NOT NULL,
    `descripcion` varchar(255) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `rack`
--
INSERT INTO
  `rack` (`idRack`, `numeroRack`, `descripcion`)
VALUES
  (1, 1, 'Rack 1'),
  (2, 2, 'Rack 2'),
  (3, 3, 'Rack 3'),
  (4, 4, 'Rack 4'),
  (5, 5, 'Rack 5'),
  (6, 6, 'Rack 6'),
  (7, 7, 'Rack 7'),
  (8, 8, 'Rack 8'),
  (9, 9, 'Rack 9'),
  (10, 10, 'Rack 10');

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
  (5, 5),
  (6, 6),
  (7, 7);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `stock`
--
CREATE TABLE
  `stock` (
    `idStock` varchar(50) NOT NULL,
    `codigoIndumentaria` varchar(50) DEFAULT NULL,
    `idRack` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_spanish_ci;

--
-- Volcado de datos para la tabla `stock`
--
INSERT INTO
  `stock` (`idStock`, `codigoIndumentaria`, `idRack`)
VALUES
  ('STK001', 'IND001', 1),
  ('STK002', 'IND002', 2),
  ('STK003', 'IND003', 3),
  ('STK004', 'IND004', 4),
  ('STK005', 'IND005', 5),
  ('STK006', 'IND006', 6),
  ('STK007', 'IND007', 7),
  ('STK008', 'IND008', 8),
  ('STK009', 'IND009', 9),
  ('STK010', 'IND010', 10);

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
  (12, 'XXL'),
  (13, 'XS');

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
  (11, 'Gabardina'),
  (12, 'Sarga');

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
  (5, 'Gerente', 'Supervisa operaciones'),
  (6, 'Picker', 'Encargado de picking'),
  (7, 'Encargado de Stock', 'Gestiona stock');

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
  (1, 10, 'admin', 'admin123', 1),
  (2, 9, 'mariag', '123', 2),
  (5, 5, 'anamtz', '123', 6),
  (6, 6, 'luisrd', '123', 6),
  (7, 7, 'sofiag', '123', 7);

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
-- Indices de la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking` ADD PRIMARY KEY (`idAsignacion`),
ADD KEY `fk_asignacion_pedido` (`numeroPedido`),
ADD KEY `fk_asignacion_picker` (`legajoPicker`);

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
ADD KEY `idTela` (`idTela`),
ADD KEY `fk_detalle_nombre` (`idNombre`);

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
-- Indices de la tabla `rack`
--
ALTER TABLE `rack` ADD PRIMARY KEY (`idRack`),
ADD UNIQUE KEY `idx_numeroRack` (`numeroRack`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol` ADD PRIMARY KEY (`idRol`),
ADD KEY `idTipoRol` (`idTipoRol`);

--
-- Indices de la tabla `stock`
--
ALTER TABLE `stock` ADD PRIMARY KEY (`idStock`),
ADD KEY `codigoIndumentaria` (`codigoIndumentaria`),
ADD KEY `fk_stock_rack` (`idRack`);

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
-- AUTO_INCREMENT de la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking` MODIFY `idAsignacion` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 31;

--
-- AUTO_INCREMENT de la tabla `barrio`
--
ALTER TABLE `barrio` MODIFY `idBarrio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 37;

--
-- AUTO_INCREMENT de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria` MODIFY `idCategoria` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 13;

--
-- AUTO_INCREMENT de la tabla `ciudad`
--
ALTER TABLE `ciudad` MODIFY `idCiudad` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 62;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente` MODIFY `idCliente` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 48;

--
-- AUTO_INCREMENT de la tabla `color`
--
ALTER TABLE `color` MODIFY `idColor` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 12;

--
-- AUTO_INCREMENT de la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria` MODIFY `idDetalle` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 17;

--
-- AUTO_INCREMENT de la tabla `domicilio`
--
ALTER TABLE `domicilio` MODIFY `idDomicilio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 55;

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
AUTO_INCREMENT = 54;

--
-- AUTO_INCREMENT de la tabla `precioindumentaria`
--
ALTER TABLE `precioindumentaria` MODIFY `idPrecio` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 16;

--
-- AUTO_INCREMENT de la tabla `rack`
--
ALTER TABLE `rack` MODIFY `idRack` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 11;

--
-- AUTO_INCREMENT de la tabla `talle`
--
ALTER TABLE `talle` MODIFY `idTalle` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 14;

--
-- AUTO_INCREMENT de la tabla `tela`
--
ALTER TABLE `tela` MODIFY `idTela` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 13;

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
-- Filtros para la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking` ADD CONSTRAINT `fk_asignacion_pedido` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`),
ADD CONSTRAINT `fk_asignacion_picker` FOREIGN KEY (`legajoPicker`) REFERENCES `encargadopicker` (`legajo`);

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
ADD CONSTRAINT `detalleindumentaria_ibfk_6` FOREIGN KEY (`idTela`) REFERENCES `tela` (`idTela`),
ADD CONSTRAINT `fk_detalle_nombre` FOREIGN KEY (`idNombre`) REFERENCES `nombreindumentaria` (`idNombre`);

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
ALTER TABLE `stock` ADD CONSTRAINT `fk_stock_rack` FOREIGN KEY (`idRack`) REFERENCES `rack` (`idRack`),
ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

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