-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-08-2025 a las 00:36:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


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

CREATE TABLE `adminsistemas` (
  `idAdminSis` int(11) NOT NULL,
  `legajo` int(11) DEFAULT NULL,
  `idPersona` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `adminsistemas`
--

INSERT INTO `adminsistemas` (`idAdminSis`, `legajo`, `idPersona`) VALUES
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

CREATE TABLE `asignacion_picking` (
  `idAsignacion` int(11) NOT NULL,
  `numeroPedido` varchar(50) NOT NULL,
  `legajoPicker` varchar(20) NOT NULL,
  `fechaAsignacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaCompletado` datetime DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `completado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `asignacion_picking`
--

INSERT INTO `asignacion_picking` (`idAsignacion`, `numeroPedido`, `legajoPicker`, `fechaAsignacion`, `fechaCompletado`, `observaciones`, `completado`) VALUES
(29, 'PED-2025-112', 'LP005', '2025-06-18 06:35:53', '2025-06-18 20:14:32', 'Asignación desde panel gerente', 1),
(30, 'PED-2025-113', 'LP006', '2025-06-18 06:36:03', NULL, 'Asignación desde panel gerente', 0),
(31, 'PED-2025-112', 'LP005', '2025-06-18 20:14:32', NULL, 'Asignación desde panel gerente', 0),
(32, 'PED-2025-407', 'LP006', '2025-06-19 05:26:00', NULL, 'Asignación desde panel gerente', 0),
(35, 'PED-2025-521', 'LP005', '2025-06-20 02:20:08', NULL, 'Asignación desde panel gerente', 0),
(36, 'PED-2025-747', 'LP006', '2025-07-01 23:48:21', NULL, 'Asignación desde panel gerente', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `barrio`
--

CREATE TABLE `barrio` (
  `idBarrio` int(11) NOT NULL,
  `nombreBarrio` varchar(100) DEFAULT NULL,
  `idCiudad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `barrio`
--

INSERT INTO `barrio` (`idBarrio`, `nombreBarrio`, `idCiudad`) VALUES
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

CREATE TABLE `categoriaindumentaria` (
  `idCategoria` int(11) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `categoriaindumentaria`
--

INSERT INTO `categoriaindumentaria` (`idCategoria`, `categoria`) VALUES
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

CREATE TABLE `ciudad` (
  `idCiudad` int(11) NOT NULL,
  `nombreCiudad` varchar(100) DEFAULT NULL,
  `codigoPostal` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `ciudad`
--

INSERT INTO `ciudad` (`idCiudad`, `nombreCiudad`, `codigoPostal`) VALUES
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
(26, 'San Fernando del Valle de Catamarca', 'K4700'),
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

CREATE TABLE `cliente` (
  `idCliente` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT 1,
  `idPersona` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`idCliente`, `email`, `telefono`, `estaActivo`, `idPersona`) VALUES
(1, 'juanperez@mail.com', '123456789', 1, 1),
(2, 'maria@mail.com', '987654321', 1, 2),
(3, 'carlos@mail.com', '111222333', 1, 3),
(4, 'laura@mail.com', '444555666', 1, 4),
(5, 'ana@mail.com', '777888999', 1, 5),
(6, 'luis@mail.com', '000111222', 1, 6),
(7, 'sofia@mail.com', '333444555', 1, 7),
(8, 'diego@mail.com', '666777888', 1, 8),
(9, 'lucia@mail.com', '999000111', 1, 9),
(10, 'pedro@mail.com', '222333444', 1, 10),
(28, 'martin.gomez1@test.com', '5551101', 1, 34),
(29, 'sofia.rodriguez1@test.com', '5551102', 1, 35),
(30, 'diego.fernandez1@test.com', '5551103', 1, 36),
(31, 'lucia.diaz1@test.com', '5551104', 1, 37),
(32, 'carlos.lopez1@test.com', '5551105', 1, 38),
(33, 'martin.gomez2@test.com', '5551106', 1, 39),
(34, 'sofia.rodriguez2@test.com', '5551107', 1, 40),
(35, 'valeria.paz1@test.com', '5551108', 1, 41),
(36, 'javier.sosa1@test.com', '5551109', 1, 42),
(37, 'carolina.vega1@test.com', '5551110', 1, 43),
(38, 'diego.fernandez2@test.com', '5551111', 1, 44),
(39, 'lucia.diaz2@test.com', '5551112', 1, 45),
(40, 'carlos.lopez2@test.com', '5551113', 1, 46),
(41, 'andrea.moreno1@test.com', '5551114', 1, 47),
(42, 'hernan.alonso1@test.com', '5551115', 1, 48),
(43, 'martin.gomez3@test.com', '5551116', 1, 49),
(44, 'gabriela.torres1@test.com', '5551117', 1, 50),
(45, 'matias.romero1@test.com', '5551118', 1, 51),
(46, 'paula.suarez1@test.com', '5551119', 1, 52),
(47, 'martin.gomez4@test.com', '5551120', 1, 53);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_estados`
--

CREATE TABLE `cliente_estados` (
  `idEstado` tinyint(1) NOT NULL,
  `descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `cliente_estados`
--

INSERT INTO `cliente_estados` (`idEstado`, `descripcion`) VALUES
(0, 'Inactivo'),
(1, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente_historial_estado`
--

CREATE TABLE `cliente_historial_estado` (
  `idHistorial` int(11) NOT NULL,
  `idCliente` int(11) NOT NULL,
  `idEstado` tinyint(1) NOT NULL,
  `fechaCambio` datetime NOT NULL DEFAULT current_timestamp(),
  `idUsuarioModifico` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `color`
--

CREATE TABLE `color` (
  `idColor` int(11) NOT NULL,
  `color` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `color`
--

INSERT INTO `color` (`idColor`, `color`) VALUES
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
-- Estructura de tabla para la tabla `configuracionvip`
--

CREATE TABLE `configuracionvip` (
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `configuracionvip`
--

INSERT INTO `configuracionvip` (`clave`, `valor`) VALUES
('monto_vip', '15000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalleindumentaria`
--

CREATE TABLE `detalleindumentaria` (
  `idDetalle` int(11) NOT NULL,
  `idNombre` int(11) DEFAULT NULL,
  `idPrecio` int(11) DEFAULT NULL,
  `idCategoria` int(11) DEFAULT NULL,
  `idColor` int(11) DEFAULT NULL,
  `idTalle` int(11) DEFAULT NULL,
  `idEstado` int(11) DEFAULT NULL,
  `idTela` int(11) DEFAULT NULL,
  `idUnidadMedida` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `detalleindumentaria`
--

INSERT INTO `detalleindumentaria` (`idDetalle`, `idNombre`, `idPrecio`, `idCategoria`, `idColor`, `idTalle`, `idEstado`, `idTela`, `idUnidadMedida`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1),
(2, 2, 2, 2, 2, 2, 1, 2, 1),
(3, 3, 3, 3, 3, 3, 1, 3, 1),
(4, 4, 4, 4, 4, 4, 1, 4, 1),
(5, 5, 5, 5, 5, 5, 1, 5, 2),
(6, 6, 6, 6, 6, 6, 1, 6, 1),
(7, 7, 7, 7, 7, 7, 1, 7, 1),
(8, 8, 8, 8, 8, 8, 1, 8, 2),
(9, 9, 9, 9, 9, 9, 1, 9, 1),
(10, 10, 10, 10, 10, 10, 1, 10, 2),
(16, 10, 10, 3, 3, 6, 1, 3, 2),
(17, 1, 7, 7, 1, 1, 1, 10, 1),
(18, 3, 5, 7, 3, 15, 1, 5, 1),
(19, 2, 2, 6, 4, 2, 1, 7, 1),
(20, 4, 4, 3, 2, 16, 1, 2, 1),
(21, 5, 8, 5, 1, 3, 1, 5, 2),
(22, 6, 6, 7, 7, 18, 1, 3, 1),
(23, 7, 7, 2, 2, 14, 1, 6, 1),
(24, 8, 9, 7, 3, 15, 1, 9, 2),
(25, 9, 10, 1, 8, 16, 1, 5, 1),
(26, 10, 1, 3, 4, 17, 1, 2, 2),
(27, 1, 8, 1, 11, 1, 1, 4, 1),
(28, 2, 5, 4, 7, 5, 1, 11, 1),
(29, 3, 7, 12, 5, 12, 1, 12, 1),
(30, 4, 3, 2, 9, 14, 1, 1, 1),
(31, 5, 5, 3, 5, 4, 1, 5, 2),
(32, 6, 9, 1, 10, 18, 1, 4, 1),
(33, 1, 6, 2, 7, 15, 1, 7, 1),
(34, 2, 7, 2, 2, 1, 1, 6, 1),
(35, 3, 8, 11, 1, 16, 1, 2, 1),
(36, 4, 9, 7, 3, 17, 1, 3, 1),
(37, 5, 4, 2, 4, 5, 1, 1, 2),
(38, 8, 3, 6, 5, 15, 1, 7, 2),
(39, 3, 9, 1, 3, 16, 1, 9, 1),
(40, 9, 6, 2, 1, 14, 1, 5, 1),
(41, 7, 2, 7, 7, 17, 1, 10, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallepedido`
--

CREATE TABLE `detallepedido` (
  `idDetallePedido` varchar(50) NOT NULL,
  `numeroPedido` varchar(50) DEFAULT NULL,
  `codigoIndumentaria` varchar(50) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `descuentoItem` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `detallepedido`
--

INSERT INTO `detallepedido` (`idDetallePedido`, `numeroPedido`, `codigoIndumentaria`, `cantidad`, `descuentoItem`) VALUES
('DP-015', 'PED-2025-014', 'IND001', 2, 0.00),
('DP-016', 'PED-2025-015', 'IND002', 1, 0.00),
('DP-017', 'PED-2025-016', 'IND006', 3, 0.00),
('DP-018', 'PED-2025-017', 'IND008', 2, 0.00),
('DP-019', 'PED-2025-018', 'IND010', 1, 0.00),
('DP-020', 'PED-2025-019', 'IND003', 2, 0.00),
('DP-021', 'PED-2025-020', 'IND004', 3, 0.00),
('DP-022', 'PED-2025-021', 'IND005', 1, 0.00),
('DP-023', 'PED-2025-022', 'IND007', 2, 0.00),
('DP-024', 'PED-2025-023', 'IND009', 1, 0.00),
('DP-025', 'PED-2025-024', 'IND001', 1, 0.00),
('DP-026', 'PED-2025-025', 'IND002', 2, 0.00),
('DP-027', 'PED-2025-026', 'IND003', 3, 0.00),
('DP-028', 'PED-2025-027', 'IND004', 1, 0.00),
('DP-029', 'PED-2025-028', 'IND005', 2, 0.00),
('DP-030', 'PED-2025-029', 'IND006', 1, 0.00),
('DP-031', 'PED-2025-030', 'IND007', 3, 0.00),
('DP-101', 'PED-2025-101', 'IND001', 2, 0.00),
('DP-103', 'PED-2025-103', 'IND003', 1, 0.00),
('DP-104', 'PED-2025-104', 'IND004', 2, 0.00),
('DP-105', 'PED-2025-105', 'IND005', 1, 0.00),
('DP-106', 'PED-2025-106', 'IND006', 2, 0.00),
('DP-107', 'PED-2025-107', 'IND007', 3, 0.00),
('DP-108', 'PED-2025-108', 'IND008', 1, 0.00),
('DP-109', 'PED-2025-109', 'IND009', 2, 0.00),
('DP-110', 'PED-2025-110', 'IND010', 1, 0.00),
('DP-113', 'PED-2025-113', 'IND003', 1, 0.00),
('DP-114', 'PED-2025-114', 'IND004', 3, 0.00),
('DP-115', 'PED-2025-115', 'IND005', 2, 0.00),
('DP-116', 'PED-2025-116', 'IND006', 1, 0.00),
('DP-117', 'PED-2025-117', 'IND007', 2, 0.00),
('DP-118', 'PED-2025-118', 'IND008', 1, 0.00),
('DP-119', 'PED-2025-119', 'IND009', 3, 0.00),
('DP-20240110-001', 'PED-20240110-001', 'IND007', 3, 0.00),
('DP-20240115-001', 'PED-20240115-001', 'IND004', 5, 0.00),
('DP-20240120-001', 'PED-20240120-001', 'IND005', 1, 0.00),
('DP-20240125-001', 'PED-20240125-001', 'IND001', 2, 0.00),
('DP-20240201-001', 'PED-20240201-001', 'IND017', 2, 0.00),
('DP-20240205-001', 'PED-20240205-001', 'IND007', 4, 0.00),
('DP-20240210-001', 'PED-20240210-001', 'IND004', 3, 0.00),
('DP-20240215-001', 'PED-20240215-001', 'IND010', 6, 0.00),
('DP-20240220-001', 'PED-20240220-001', 'IND001', 3, 0.00),
('DP-20240225-001', 'PED-20240225-001', 'IND005', 2, 0.00),
('DP-20240410-001', 'PED-20240410-001', 'IND002', 4, 0.00),
('DP-20240415-001', 'PED-20240415-001', 'IND003', 2, 0.00),
('DP-20240420-001', 'PED-20240420-001', 'IND009', 3, 0.00),
('DP-20240425-001', 'PED-20240425-001', 'IND001', 5, 0.00),
('DP-20240501-001', 'PED-20240501-001', 'IND008', 2, 0.00),
('DP-20240505-001', 'PED-20240505-001', 'IND002', 3, 0.00),
('DP-20240510-001', 'PED-20240510-001', 'IND006', 4, 0.00),
('DP-20240515-001', 'PED-20240515-001', 'IND003', 3, 0.00),
('DP-20240520-001', 'PED-20240520-001', 'IND001', 4, 0.00),
('DP-20240525-001', 'PED-20240525-001', 'IND004', 2, 0.00),
('DP-20240710-001', 'PED-20240710-001', 'IND003', 8, 0.00),
('DP-20240715-001', 'PED-20240715-001', 'IND006', 10, 0.00),
('DP-20240720-001', 'PED-20240720-001', 'IND008', 5, 0.00),
('DP-20240725-001', 'PED-20240725-001', 'IND003', 6, 0.00),
('DP-20240801-001', 'PED-20240801-001', 'IND006', 11, 0.00),
('DP-20240805-001', 'PED-20240805-001', 'IND002', 3, 0.00),
('DP-20240810-001', 'PED-20240810-001', 'IND001', 4, 0.00),
('DP-20240815-001', 'PED-20240815-001', 'IND008', 6, 0.00),
('DP-20240820-001', 'PED-20240820-001', 'IND003', 5, 0.00),
('DP-20240825-001', 'PED-20240825-001', 'IND006', 8, 0.00),
('DP-20241010-001', 'PED-20241010-001', 'IND001', 6, 0.00),
('DP-20241015-001', 'PED-20241015-001', 'IND004', 4, 0.00),
('DP-20241020-001', 'PED-20241020-001', 'IND005', 2, 0.00),
('DP-20241025-001', 'PED-20241025-001', 'IND002', 5, 0.00),
('DP-20241101-001', 'PED-20241101-001', 'IND001', 3, 0.00),
('DP-20241105-001', 'PED-20241105-001', 'IND007', 4, 0.00),
('DP-20241110-001', 'PED-20241110-001', 'IND005', 3, 0.00),
('DP-20241115-001', 'PED-20241115-001', 'IND004', 5, 0.00),
('DP-20241120-001', 'PED-20241120-001', 'IND010', 7, 0.00),
('DP-20241125-001', 'PED-20241125-001', 'IND009', 4, 0.00),
('DPED-043831', 'PED-2025-429', 'IND001', 1, 0.00),
('DPED-192243', 'PED-2025-102', 'IND002', 2, 0.00),
('DPED-222225', 'PED-2025-407', 'IND006', 2, 0.00),
('DPED-282917', 'PED-2025-521', 'IND039', 2, 0.00),
('DPED-368986', 'PED-2025-333', 'IND001', 2, 0.00),
('DPED-379606', 'PED-2025-407', 'IND001', 2, 0.00),
('DPED-472999', 'PED-2025-172', 'IND003', 6, 0.00),
('DPED-476959', 'PED-2025-521', 'IND001', 2, 0.00),
('DPED-483076', 'PED-2025-112', 'IND002', 2, 0.00),
('DPED-497690', 'PED-2025-407', 'IND003', 2, 0.00),
('DPED-532448', 'PED-2025-172', 'IND002', 4, 0.00),
('DPED-618710', 'PED-2025-429', 'IND002', 1, 0.00),
('DPED-635910', 'PED-2025-120', 'IND010', 10, 0.00),
('DPED-691464', 'PED-2025-172', 'IND001', 2, 0.00),
('DPED-825563', 'PED-2025-521', 'IND003', 2, 0.00),
('DPED-911321', 'PED-2025-111', 'IND001', 1, 0.00),
('DPED-961264', 'PED-2025-747', 'IND001', 3, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `domicilio`
--

CREATE TABLE `domicilio` (
  `idDomicilio` int(11) NOT NULL,
  `calle` varchar(100) DEFAULT NULL,
  `altura` varchar(10) DEFAULT NULL,
  `piso` varchar(10) DEFAULT NULL,
  `departamento` varchar(10) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `idBarrio` int(11) NOT NULL,
  `idCiudad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `domicilio`
--

INSERT INTO `domicilio` (`idDomicilio`, `calle`, `altura`, `piso`, `departamento`, `observaciones`, `idBarrio`, `idCiudad`) VALUES
(1, 'Av. Santa Fe', '1234', '5', 'A', 'Frente al parque', 1, 1),
(2, 'Calle Falsa', '742', NULL, NULL, 'Cerca de la plaza', 3, 2),
(3, '9 de Julio', '500', '2', 'B', '', 2, 1),
(4, 'Mitre', '1020', '1', 'C', 'Edificio viejo', 4, 3),
(5, 'San Martín', '150', NULL, NULL, 'Zona comercial', 5, 4),
(6, 'Belgrano', '2555', '10', 'D', 'Vista al mar', 6, 6),
(7, 'Independencia', '360', NULL, NULL, '', 7, 7),
(8, 'Av. Salta', '890', '3', 'E', '', 8, 8),
(9, 'Colon', '123', NULL, NULL, 'Residencial', 9, 9),
(10, 'Alsinaa', '456', '4', 'F', '', 10, 10),
(35, 'Calle Sol', '1100', NULL, NULL, NULL, 1, 1),
(36, 'Calle Luna', '1200', NULL, NULL, NULL, 2, 1),
(37, 'Calle Estrella', '1300', NULL, NULL, NULL, 3, 2),
(38, 'Calle Cometa', '1400', NULL, NULL, NULL, 4, 3),
(39, 'Calle Planeta', '1500', NULL, NULL, NULL, 5, 4),
(40, 'Av. Sol', '1600', NULL, NULL, NULL, 6, 6),
(41, 'Av. Luna', '1700', NULL, NULL, NULL, 7, 7),
(42, 'Av. Estrella', '1800', NULL, NULL, NULL, 8, 8),
(43, 'Av. Cometa', '1900', NULL, NULL, NULL, 9, 9),
(44, 'Av. Planeta', '2000', NULL, NULL, NULL, 10, 10),
(45, 'Pasaje Sol', '2100', NULL, NULL, NULL, 1, 1),
(46, 'Pasaje Luna', '2200', NULL, NULL, NULL, 2, 1),
(47, 'Pasaje Estrella', '2300', NULL, NULL, NULL, 3, 2),
(48, 'Pasaje Cometa', '2400', NULL, NULL, NULL, 4, 3),
(49, 'Pasaje Planeta', '2500', NULL, NULL, NULL, 5, 4),
(50, 'Ruta Sol', '2600', NULL, NULL, NULL, 6, 6),
(51, 'Ruta Luna', '2700', NULL, NULL, NULL, 7, 7),
(52, 'Ruta Estrella', '2800', NULL, NULL, NULL, 8, 8),
(53, 'Ruta Cometa', '2900', NULL, NULL, NULL, 9, 9),
(54, 'Ruta Planeta', '3000', NULL, NULL, NULL, 10, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargadoindumentaria`
--

CREATE TABLE `encargadoindumentaria` (
  `legajo` varchar(20) NOT NULL,
  `codigoIndumentaria` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargadopedidos`
--

CREATE TABLE `encargadopedidos` (
  `legajo` varchar(50) NOT NULL,
  `numeroPedido` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargadopicker`
--

CREATE TABLE `encargadopicker` (
  `legajo` varchar(20) NOT NULL,
  `idPersona` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `encargadopicker`
--

INSERT INTO `encargadopicker` (`legajo`, `idPersona`) VALUES
('LP005', 5),
('LP006', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargadopicker_stock`
--

CREATE TABLE `encargadopicker_stock` (
  `id` int(11) NOT NULL,
  `legajo` varchar(20) DEFAULT NULL,
  `idStock` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadoindumentaria`
--

CREATE TABLE `estadoindumentaria` (
  `idEstado` int(11) NOT NULL,
  `estadoIndumentaria` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `estadoindumentaria`
--

INSERT INTO `estadoindumentaria` (`idEstado`, `estadoIndumentaria`) VALUES
(1, 'Apta'),
(2, 'No Apta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estadopedido`
--

CREATE TABLE `estadopedido` (
  `idEstado` int(11) NOT NULL,
  `tipoEstado` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `estadopedido`
--

INSERT INTO `estadopedido` (`idEstado`, `tipoEstado`) VALUES
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

CREATE TABLE `gerentegeneral` (
  `idGerente` int(11) NOT NULL,
  `legajo` int(11) DEFAULT NULL,
  `idPersona` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `gerentegeneral`
--

INSERT INTO `gerentegeneral` (`idGerente`, `legajo`, `idPersona`) VALUES
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

CREATE TABLE `indumentaria` (
  `codigoIndumentaria` varchar(50) NOT NULL,
  `idDetalle` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `indumentaria`
--

INSERT INTO `indumentaria` (`codigoIndumentaria`, `idDetalle`) VALUES
('IND001', 1),
('IND002', 2),
('IND003', 3),
('IND004', 4),
('IND005', 5),
('IND006', 6),
('IND007', 7),
('IND008', 8),
('IND009', 9),
('IND010', 16),
('IND015', 17),
('IND016', 18),
('IND017', 19),
('IND018', 20),
('IND019', 21),
('IND020', 22),
('IND021', 23),
('IND022', 24),
('IND023', 25),
('IND024', 26),
('IND025', 27),
('IND026', 28),
('IND027', 29),
('IND028', 30),
('IND029', 31),
('IND030', 32),
('IND031', 33),
('IND032', 34),
('IND033', 35),
('IND034', 36),
('IND035', 37),
('IND036', 38),
('IND037', 39),
('IND038', 40),
('IND039', 41);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `motivo_cancelacion`
--

CREATE TABLE `motivo_cancelacion` (
  `idMotivo` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `motivo_cancelacion`
--

INSERT INTO `motivo_cancelacion` (`idMotivo`, `descripcion`) VALUES
(1, 'El cliente se arrepintió'),
(2, 'Falta de stock de un producto'),
(3, 'Problema con el pago'),
(4, 'Dirección de envío incorrecta'),
(5, 'Pedido duplicado'),
(6, 'Otro motivo (especificar en observaciones)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientostock`
--

CREATE TABLE `movimientostock` (
  `idMovimientoStock` varchar(50) NOT NULL,
  `idStock` varchar(50) DEFAULT NULL,
  `fechaMovimiento` date DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `movimientostock`
--

INSERT INTO `movimientostock` (`idMovimientoStock`, `idStock`, `fechaMovimiento`, `cantidad`, `observaciones`) VALUES
('MOV-1756247729019-1', 'STK001', '2025-08-26', -2, 'Movimiento a No Apto: prueba'),
('MOV-1756247729020-2', 'STK-NA-1756247729017', '2025-08-26', 2, 'Ingreso desde stock vendible: prueba'),
('MOV-20240110-001', 'STK007', '2024-01-10', -3, 'Venta Pedido PED-20240110-001'),
('MOV-20240115-001', 'STK004', '2024-01-15', -5, 'Venta Pedido PED-20240115-001'),
('MOV-20240125-001', 'STK001', '2024-01-25', -2, 'Venta Pedido PED-20240125-001'),
('MOV-20240201-001', 'STK017', '2024-02-01', -2, 'Venta Pedido PED-20240201-001'),
('MOV-20240210-001', 'STK004', '2024-02-10', -3, 'Venta Pedido PED-20240210-001'),
('MOV-20240220-001', 'STK001', '2024-02-20', -3, 'Venta Pedido PED-20240220-001'),
('MOV-20240225-001', 'STK005', '2024-02-25', -2, 'Venta Pedido PED-20240225-001'),
('MOV-20240410-001', 'STK002', '2024-04-10', -4, 'Venta Pedido PED-20240410-001'),
('MOV-20240420-001', 'STK009', '2024-04-20', -3, 'Venta Pedido PED-20240420-001'),
('MOV-20240425-001', 'STK001', '2024-04-25', -5, 'Venta Pedido PED-20240425-001'),
('MOV-20240505-001', 'STK002', '2024-05-05', -3, 'Venta Pedido PED-20240505-001'),
('MOV-20240510-001', 'STK006', '2024-05-10', -4, 'Venta Pedido PED-20240510-001'),
('MOV-20240515-001', 'STK003', '2024-05-15', -3, 'Venta Pedido PED-20240515-001'),
('MOV-20240520-001', 'STK001', '2024-05-20', -4, 'Venta Pedido PED-20240520-001'),
('MOV-20240710-001', 'STK003', '2024-07-10', -8, 'Venta Pedido PED-20240710-001'),
('MOV-20240720-001', 'STK008', '2024-07-20', -5, 'Venta Pedido PED-20240720-001'),
('MOV-20240801-001', 'STK006', '2024-08-01', -11, 'Venta Pedido PED-20240801-001'),
('MOV-20240805-001', 'STK002', '2024-08-05', -3, 'Venta Pedido PED-20240805-001'),
('MOV-20240815-001', 'STK008', '2024-08-15', -6, 'Venta Pedido PED-20240815-001'),
('MOV-20240820-001', 'STK003', '2024-08-20', -5, 'Venta Pedido PED-20240820-001'),
('MOV-20240825-001', 'STK006', '2024-08-25', -8, 'Venta Pedido PED-20240825-001'),
('MOV-20241010-001', 'STK001', '2024-10-10', -6, 'Venta Pedido PED-20241010-001'),
('MOV-20241015-001', 'STK004', '2024-10-15', -4, 'Venta Pedido PED-20241015-001'),
('MOV-20241025-001', 'STK002', '2024-10-25', -5, 'Venta Pedido PED-20241025-001'),
('MOV-20241101-001', 'STK001', '2024-11-01', -3, 'Venta Pedido PED-20241101-001'),
('MOV-20241105-001', 'STK007', '2024-11-05', -4, 'Venta Pedido PED-20241105-001'),
('MOV-20241110-001', 'STK005', '2024-11-10', -3, 'Venta Pedido PED-20241110-001'),
('MOV-20241120-001', 'STK010', '2024-11-20', -7, 'Venta Pedido PED-20241120-001'),
('MOV-20241125-001', 'STK009', '2024-11-25', -4, 'Venta Pedido PED-20241125-001'),
('MOV-604887', 'STK010', '2025-06-14', 2, 'Ajuste manual desde edición'),
('MOV-845053', 'STK010', '2025-06-14', -2, 'Ajuste manual desde edición'),
('MOV-CANC-1751396519802-omh58', 'STK006', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751396519809-7u66q', 'STK001', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751396519812-gutz0', 'STK003', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751400893511-wvqql', 'STK006', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751400893519-n265t', 'STK001', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751400893521-uekkv', 'STK003', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401185776-w703e', 'STK006', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401185783-o12vi', 'STK001', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401185784-4fk3w', 'STK003', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401885619-38d07', 'STK006', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401885626-kc68m', 'STK001', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751401885628-sdudi', 'STK003', '2025-07-01', 2, 'Devolución por cancelación de pedido PED-2025-407'),
('MOV-CANC-1751414082038-ool4c', 'STK001', '2025-07-01', 3, 'Devolución por cancelación de pedido PED-2025-747'),
('MOV-CANCEL-343967', 'STK039', '2025-06-20', 2, 'Devolución por cancelación de pedido PED-2025-521'),
('MOV-CANCEL-379834', 'STK003', '2025-06-20', 2, 'Devolución por cancelación de pedido PED-2025-708'),
('MOV-CANCEL-717261', 'STK039', '2025-06-20', 3, 'Devolución por cancelación de pedido PED-2025-708'),
('MOV-CANCEL-815856', 'STK001', '2025-06-20', 1, 'Devolución por cancelación de pedido PED-2025-708'),
('MOV-CANCEL-838704', 'STK001', '2025-06-20', 2, 'Devolución por cancelación de pedido PED-2025-521'),
('MOV-CANCEL-848686', 'STK003', '2025-06-20', 2, 'Devolución por cancelación de pedido PED-2025-521'),
('MOV-DEL-109900', 'STK003', '2025-06-16', 2, 'Devolución por eliminación de pedido PED-2025-663'),
('MOV-DEL-148817', 'STK003', '2025-06-16', 1, 'Devolución por eliminación de pedido PED-2025-823'),
('MOV-DEL-264368', 'STK001', '2025-06-16', 12, 'Devolución por eliminación de pedido PED-2025-663'),
('MOV-DEL-272563', 'STK001', '2025-06-18', 3, 'Devolución por eliminación de pedido PED-2025-561'),
('MOV-DEL-317A', 'STK001', '2025-06-19', 3, 'Devolución por borrado de pedido PED-2025-317'),
('MOV-DEL-317B', 'STK003', '2025-06-19', 4, 'Devolución por borrado de pedido PED-2025-317'),
('MOV-DEL-317C', 'STK039', '2025-06-19', 3, 'Devolución por borrado de pedido PED-2025-317'),
('MOV-DEL-381517', 'STK001', '2025-06-16', 1, 'Devolución por eliminación de pedido PED-2025-885'),
('MOV-DEL-418634', 'STK003', '2025-06-18', 3, 'Devolución por eliminación de pedido PED-2025-561'),
('MOV-DEL-423999', 'STK003', '2025-06-16', 2, 'Devolución por eliminación de pedido PED-2025-885'),
('MOV-DEL-438380', 'STK001', '2025-06-16', 2, 'Devolución por eliminación de pedido PED-2025-002'),
('MOV-DEL-547462', 'STK001', '2025-06-16', 4, 'Devolución por eliminación de pedido PED-2025-446'),
('MOV-DEL-561610', 'STK003', '2025-06-16', 2, 'Devolución por eliminación de pedido PED-2025-446'),
('MOV-DEL-579352', 'STK005', '2025-06-16', 8, 'Devolución por eliminación de pedido PED-2025-973'),
('MOV-DEL-646992', 'STK003', '2025-06-16', 2, 'Devolución por eliminación de pedido PED-2025-576'),
('MOV-DEL-659172', 'STK001', '2025-06-16', 1, 'Devolución por eliminación de pedido PED-2025-576'),
('MOV-DEL-724299', 'STK005', '2025-06-16', 12, 'Devolución por eliminación de pedido PED-2025-663'),
('MOV-DEL-938189', 'STK001', '2025-06-16', 1, 'Devolución por eliminación de pedido PED-2025-823'),
('MOV-EDIT-DESC-013982', 'STK001', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-016961', 'STK001', '2025-07-01', -3, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-044093', 'STK002', '2025-07-01', -4, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-048909', 'STK005', '2025-06-16', -8, 'Descuento por edición de pedido PED-2025-973'),
('MOV-EDIT-DESC-058906', 'STK005', '2025-06-16', -8, 'Descuento por edición de pedido PED-2025-973'),
('MOV-EDIT-DESC-100080', 'STK002', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-112'),
('MOV-EDIT-DESC-108420', 'STK002', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-102'),
('MOV-EDIT-DESC-122896', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-129750', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-134413', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-139546', 'STK039', '2025-07-01', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-160539', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-708'),
('MOV-EDIT-DESC-169481', 'STK005', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-180683', 'STK006', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-182533', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-185294', 'STK005', '2025-06-16', -16, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-188450', 'STK001', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-190535', 'STK002', '2025-07-01', -2, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-215905', 'STK002', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-112'),
('MOV-EDIT-DESC-234815', 'STK001', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-241110', 'STK001', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-267547', 'STK005', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-289981', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-446'),
('MOV-EDIT-DESC-324512', 'STK001', '2025-07-01', -3, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-328881', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-333034', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-341771', 'STK005', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-973'),
('MOV-EDIT-DESC-355568', 'STK001', '2025-06-20', -1, 'Descuento por edición de pedido PED-2025-708'),
('MOV-EDIT-DESC-382177', 'STK010', '2025-06-20', -10, 'Descuento por edición de pedido PED-2025-120'),
('MOV-EDIT-DESC-383890', 'STK001', '2025-06-20', -4, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-392085', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-392479', 'STK001', '2025-07-01', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-409849', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-415749', 'STK001', '2025-06-16', -12, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-418381', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-422511', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-424959', 'STK005', '2025-06-16', -12, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-440387', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-451916', 'STK005', '2025-06-16', -14, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-454311', 'STK005', '2025-06-16', -12, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-459778', 'STK002', '2025-07-01', -3, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-466865', 'STK001', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-002'),
('MOV-EDIT-DESC-489201', 'STK001', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-112'),
('MOV-EDIT-DESC-503907', 'STK039', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-508535', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-513756', 'STK005', '2025-06-16', -1, 'Descuento por edición de pedido PED-2025-002'),
('MOV-EDIT-DESC-515585', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-446'),
('MOV-EDIT-DESC-521655', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-542629', 'STK003', '2025-07-01', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-555850', 'STK001', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-446'),
('MOV-EDIT-DESC-558772', 'STK005', '2025-06-16', -8, 'Descuento por edición de pedido PED-2025-973'),
('MOV-EDIT-DESC-568211', 'STK005', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-973'),
('MOV-EDIT-DESC-571593', 'STK002', '2025-07-01', -4, 'Descuento por edición de pedido PED-2025-747'),
('MOV-EDIT-DESC-572598', 'STK039', '2025-06-20', -3, 'Descuento por edición de pedido PED-2025-708'),
('MOV-EDIT-DESC-574305', 'STK005', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-590075', 'STK005', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-598528', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-614628', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-617106', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-446'),
('MOV-EDIT-DESC-638609', 'STK006', '2025-06-20', -1, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-645745', 'STK006', '2025-06-20', -1, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-684918', 'STK005', '2025-06-16', -16, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-695666', 'STK003', '2025-06-20', -3, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-716274', 'STK039', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-521'),
('MOV-EDIT-DESC-716976', 'STK001', '2025-06-16', -1, 'Descuento por edición de pedido PED-2025-111'),
('MOV-EDIT-DESC-736685', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-756529', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-756819', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-761677', 'STK001', '2025-06-16', -10, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-776923', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-777062', 'STK006', '2025-06-20', -1, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-784970', 'STK001', '2025-06-16', -4, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-786503', 'STK002', '2025-06-17', -1, 'Descuento por edición de pedido PED-2025-429'),
('MOV-EDIT-DESC-814511', 'STK003', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-824333', 'STK010', '2025-06-20', -1, 'Descuento por edición de pedido PED-2025-120'),
('MOV-EDIT-DESC-838648', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-846283', 'STK001', '2025-06-20', -2, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-860534', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-861777', 'STK001', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-002'),
('MOV-EDIT-DESC-878969', 'STK001', '2025-06-17', -1, 'Descuento por edición de pedido PED-2025-429'),
('MOV-EDIT-DESC-907812', 'STK003', '2025-06-16', -2, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DESC-920625', 'STK001', '2025-06-20', -4, 'Descuento por edición de pedido PED-2025-407'),
('MOV-EDIT-DESC-938865', 'STK005', '2025-06-16', -16, 'Descuento por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-009527', 'STK001', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-446'),
('MOV-EDIT-DEV-012834', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-022238', 'STK001', '2025-07-01', 3, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-028788', 'STK001', '2025-06-16', 1, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-034202', 'STK005', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-973'),
('MOV-EDIT-DEV-038662', 'STK002', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-102'),
('MOV-EDIT-DEV-061252', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-065823', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-121463', 'STK003', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-124081', 'STK005', '2025-06-16', 16, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-128772', 'STK010', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-120'),
('MOV-EDIT-DEV-131152', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-134631', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-170032', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-446'),
('MOV-EDIT-DEV-210059', 'STK001', '2025-06-17', 1, 'Devolución por edición de pedido PED-2025-429'),
('MOV-EDIT-DEV-211124', 'STK003', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-216002', 'STK005', '2025-06-16', 8, 'Devolución por edición de pedido PED-2025-973'),
('MOV-EDIT-DEV-231203', 'STK001', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-235744', 'STK005', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-241249', 'STK001', '2025-07-01', 3, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-258762', 'STK001', '2025-06-20', 4, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-259441', 'STK003', '2025-07-01', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-293018', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-298916', 'STK001', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-306124', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-309231', 'STK005', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-354160', 'STK039', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-362418', 'STK005', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-973'),
('MOV-EDIT-DEV-365563', 'STK002', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-112'),
('MOV-EDIT-DEV-376428', 'STK001', '2025-06-16', 3, 'Devolución por edición de pedido PED-2025-111'),
('MOV-EDIT-DEV-391331', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-397519', 'STK005', '2025-06-16', 1, 'Devolución por edición de pedido PED-2025-002'),
('MOV-EDIT-DEV-403024', 'STK001', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-436940', 'STK005', '2025-06-16', 12, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-443547', 'STK006', '2025-06-20', 1, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-463893', 'STK001', '2025-07-01', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-495360', 'STK002', '2025-07-01', 3, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-507330', 'STK005', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-973'),
('MOV-EDIT-DEV-510870', 'STK002', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-112'),
('MOV-EDIT-DEV-515959', 'STK006', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-524352', 'STK003', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-708'),
('MOV-EDIT-DEV-532693', 'STK039', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-542624', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-544504', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-548392', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-560199', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-560562', 'STK003', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-573919', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-580297', 'STK001', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-708'),
('MOV-EDIT-DEV-580892', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-593845', 'STK005', '2025-06-16', 16, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-597888', 'STK005', '2025-06-16', 1, 'Devolución por edición de pedido PED-2025-002'),
('MOV-EDIT-DEV-611280', 'STK005', '2025-06-16', 8, 'Devolución por edición de pedido PED-2025-973'),
('MOV-EDIT-DEV-612150', 'STK002', '2025-07-01', 3, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-618804', 'STK001', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-112'),
('MOV-EDIT-DEV-622945', 'STK005', '2025-06-16', 16, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-637531', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-642911', 'STK005', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-645008', 'STK005', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-653528', 'STK002', '2025-07-01', 4, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-668877', 'STK005', '2025-06-16', 14, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-694175', 'STK039', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-708'),
('MOV-EDIT-DEV-704967', 'STK006', '2025-06-20', 1, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-706358', 'STK002', '2025-07-01', 4, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-726457', 'STK001', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-446'),
('MOV-EDIT-DEV-729872', 'STK002', '2025-07-01', 2, 'Devolución por edición de pedido PED-2025-747'),
('MOV-EDIT-DEV-734115', 'STK006', '2025-06-20', 1, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-743934', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-774000', 'STK003', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-774661', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-784949', 'STK001', '2025-06-16', 10, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-787123', 'STK039', '2025-07-01', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-793652', 'STK001', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-002'),
('MOV-EDIT-DEV-814253', 'STK010', '2025-06-20', 1, 'Devolución por edición de pedido PED-2025-120'),
('MOV-EDIT-DEV-849620', 'STK001', '2025-06-20', 4, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-862392', 'STK001', '2025-06-20', 4, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-895624', 'STK003', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-913606', 'STK001', '2025-06-20', 2, 'Devolución por edición de pedido PED-2025-521'),
('MOV-EDIT-DEV-972203', 'STK003', '2025-06-20', 3, 'Devolución por edición de pedido PED-2025-407'),
('MOV-EDIT-DEV-984975', 'STK003', '2025-06-16', 2, 'Devolución por edición de pedido PED-2025-663'),
('MOV-EDIT-DEV-987082', 'STK001', '2025-06-16', 4, 'Devolución por edición de pedido PED-2025-663'),
('MOV-INIT-001', 'STK001', '2025-06-13', 100, 'Carga Inicial de Stock'),
('MOV-INIT-002', 'STK002', '2025-06-13', 80, 'Carga Inicial de Stock'),
('MOV-INIT-003', 'STK003', '2025-06-13', 120, 'Carga Inicial de Stock'),
('MOV-INIT-004', 'STK004', '2025-06-13', 75, 'Carga Inicial de Stock'),
('MOV-INIT-005', 'STK005', '2025-06-13', 90, 'Carga Inicial de Stock'),
('MOV-INIT-006', 'STK006', '2025-06-13', 150, 'Carga Inicial de Stock'),
('MOV-INIT-007', 'STK007', '2025-06-13', 60, 'Carga Inicial de Stock'),
('MOV-INIT-008', 'STK008', '2025-06-13', 200, 'Carga Inicial de Stock'),
('MOV-INIT-009', 'STK009', '2025-06-13', 110, 'Carga Inicial de Stock'),
('MOV-INIT-010', 'STK010', '2025-06-13', 130, 'Carga Inicial de Stock'),
('MOV-INIT-015', 'STK015', '2025-06-18', 95, 'Carga Inicial de Stock'),
('MOV-INIT-016', 'STK016', '2025-06-18', 75, 'Carga Inicial de Stock'),
('MOV-INIT-017', 'STK017', '2025-06-18', 90, 'Carga Inicial de Stock'),
('MOV-INIT-018', 'STK018', '2025-06-18', 110, 'Carga Inicial de Stock'),
('MOV-INIT-019', 'STK019', '2025-06-18', 40, 'Carga Inicial de Stock'),
('MOV-INIT-020', 'STK020', '2025-06-18', 150, 'Carga Inicial de Stock'),
('MOV-INIT-021', 'STK021', '2025-06-18', 65, 'Carga Inicial de Stock'),
('MOV-INIT-022', 'STK022', '2025-06-18', 180, 'Carga Inicial de Stock'),
('MOV-INIT-023', 'STK023', '2025-06-18', 130, 'Carga Inicial de Stock'),
('MOV-INIT-024', 'STK024', '2025-06-18', 250, 'Carga Inicial de Stock'),
('MOV-INIT-025', 'STK025', '2025-06-18', 60, 'Carga Inicial de Stock'),
('MOV-INIT-026', 'STK026', '2025-06-18', 100, 'Carga Inicial de Stock'),
('MOV-INIT-027', 'STK027', '2025-06-18', 85, 'Carga Inicial de Stock'),
('MOV-INIT-028', 'STK028', '2025-06-18', 140, 'Carga Inicial de Stock'),
('MOV-INIT-029', 'STK029', '2025-06-18', 70, 'Carga Inicial de Stock'),
('MOV-INIT-030', 'STK030', '2025-06-18', 115, 'Carga Inicial de Stock'),
('MOV-INIT-031', 'STK031', '2025-06-18', 95, 'Carga Inicial de Stock'),
('MOV-INIT-032', 'STK032', '2025-06-18', 125, 'Carga Inicial de Stock'),
('MOV-INIT-033', 'STK033', '2025-06-18', 88, 'Carga Inicial de Stock'),
('MOV-INIT-034', 'STK034', '2025-06-18', 105, 'Carga Inicial de Stock'),
('MOV-INIT-035', 'STK035', '2025-06-18', 90, 'Carga Inicial de Stock'),
('MOV-INIT-036', 'STK036', '2025-06-18', 25, 'Carga Inicial de Stock (Bajo)'),
('MOV-INIT-037', 'STK037', '2025-06-18', 15, 'Carga Inicial de Stock (Bajo)'),
('MOV-INIT-038', 'STK038', '2025-06-18', 10, 'Carga Inicial de Stock (Bajo)'),
('MOV-INIT-039', 'STK039', '2025-06-18', 5, 'Carga Inicial de Stock (Muy Bajo)'),
('MOV-PED-014', 'STK001', '2025-06-16', -2, 'Venta Pedido PED-2025-014'),
('MOV-PED-015', 'STK002', '2025-06-16', -1, 'Venta Pedido PED-2025-015'),
('MOV-PED-016', 'STK006', '2025-06-16', -3, 'Venta Pedido PED-2025-016'),
('MOV-PED-017', 'STK008', '2025-06-16', -2, 'Venta Pedido PED-2025-017'),
('MOV-PED-018', 'STK010', '2025-06-16', -1, 'Venta Pedido PED-2025-018'),
('MOV-PED-019', 'STK003', '2025-06-16', -2, 'Venta Pedido PED-2025-019'),
('MOV-PED-020', 'STK004', '2025-06-16', -3, 'Venta Pedido PED-2025-020'),
('MOV-PED-021', 'STK005', '2025-06-16', -1, 'Venta Pedido PED-2025-021'),
('MOV-PED-022', 'STK007', '2025-06-16', -2, 'Venta Pedido PED-2025-022'),
('MOV-PED-023', 'STK009', '2025-06-16', -1, 'Venta Pedido PED-2025-023'),
('MOV-PED-024', 'STK001', '2025-06-16', -1, 'Venta Pedido PED-2025-024'),
('MOV-PED-025', 'STK002', '2025-06-16', -2, 'Venta Pedido PED-2025-025'),
('MOV-PED-026', 'STK003', '2025-06-16', -3, 'Venta Pedido PED-2025-026'),
('MOV-PED-027', 'STK004', '2025-06-16', -1, 'Venta Pedido PED-2025-027'),
('MOV-PED-028', 'STK005', '2025-06-16', -2, 'Venta Pedido PED-2025-028'),
('MOV-PED-029', 'STK006', '2025-06-16', -1, 'Venta Pedido PED-2025-029'),
('MOV-PED-030', 'STK007', '2025-06-16', -3, 'Venta Pedido PED-2025-030'),
('MOV-PED-076453', 'STK003', '2025-06-20', -4, 'Descuento por pedido PED-2025-317'),
('MOV-PED-101', 'STK001', '2025-06-16', -2, 'Venta Pedido PED-2025-101'),
('MOV-PED-102', 'STK002', '2025-06-16', -3, 'Venta Pedido PED-2025-102'),
('MOV-PED-103', 'STK003', '2025-06-16', -1, 'Venta Pedido PED-2025-103'),
('MOV-PED-104', 'STK004', '2025-06-16', -2, 'Venta Pedido PED-2025-104'),
('MOV-PED-105', 'STK005', '2025-06-16', -1, 'Venta Pedido PED-2025-105'),
('MOV-PED-106', 'STK006', '2025-06-16', -2, 'Venta Pedido PED-2025-106'),
('MOV-PED-107', 'STK007', '2025-06-16', -3, 'Venta Pedido PED-2025-107'),
('MOV-PED-108', 'STK008', '2025-06-16', -1, 'Venta Pedido PED-2025-108'),
('MOV-PED-109', 'STK009', '2025-06-16', -2, 'Venta Pedido PED-2025-109'),
('MOV-PED-110', 'STK010', '2025-06-16', -1, 'Venta Pedido PED-2025-110'),
('MOV-PED-111', 'STK001', '2025-06-16', -3, 'Venta Pedido PED-2025-111'),
('MOV-PED-112', 'STK002', '2025-06-16', -2, 'Venta Pedido PED-2025-112'),
('MOV-PED-113', 'STK003', '2025-06-16', -1, 'Venta Pedido PED-2025-113'),
('MOV-PED-114', 'STK004', '2025-06-16', -3, 'Venta Pedido PED-2025-114'),
('MOV-PED-115', 'STK005', '2025-06-16', -2, 'Venta Pedido PED-2025-115'),
('MOV-PED-116', 'STK006', '2025-06-16', -1, 'Venta Pedido PED-2025-116'),
('MOV-PED-117', 'STK007', '2025-06-16', -2, 'Venta Pedido PED-2025-117'),
('MOV-PED-118', 'STK008', '2025-06-16', -1, 'Venta Pedido PED-2025-118'),
('MOV-PED-119', 'STK009', '2025-06-16', -3, 'Venta Pedido PED-2025-119'),
('MOV-PED-120', 'STK010', '2025-06-16', -2, 'Venta Pedido PED-2025-120'),
('MOV-PED-131967', 'STK002', '2025-06-16', -4, 'Descuento por pedido PED-2025-172'),
('MOV-PED-139633', 'STK001', '2025-06-20', -2, 'Descuento por pedido PED-2025-708'),
('MOV-PED-183627', 'STK001', '2025-06-18', -3, 'Descuento por pedido PED-2025-561'),
('MOV-PED-216017', 'STK001', '2025-06-16', -1, 'Descuento por pedido PED-2025-885'),
('MOV-PED-254626', 'STK001', '2025-06-20', -3, 'Descuento por pedido PED-2025-317'),
('MOV-PED-263644', 'STK003', '2025-06-16', -1, 'Descuento por pedido PED-2025-823'),
('MOV-PED-280052', 'STK003', '2025-06-16', -2, 'Descuento por pedido PED-2025-576'),
('MOV-PED-299447', 'STK001', '2025-06-16', -2, 'Descuento por pedido PED-2025-172'),
('MOV-PED-339799', 'STK006', '2025-06-18', -3, 'Descuento por pedido PED-2025-407'),
('MOV-PED-342218', 'STK001', '2025-06-20', -2, 'Descuento por pedido PED-2025-521'),
('MOV-PED-409936', 'STK001', '2025-06-18', -4, 'Descuento por pedido PED-2025-407'),
('MOV-PED-479663', 'STK039', '2025-06-20', -3, 'Descuento por pedido PED-2025-708'),
('MOV-PED-533530', 'STK001', '2025-06-16', -1, 'Descuento por pedido PED-2025-663'),
('MOV-PED-537460', 'STK039', '2025-06-20', -3, 'Descuento por pedido PED-2025-521'),
('MOV-PED-539885', 'STK003', '2025-06-18', -3, 'Descuento por pedido PED-2025-407'),
('MOV-PED-563744', 'STK001', '2025-06-16', -1, 'Descuento por pedido PED-2025-576'),
('MOV-PED-626653', 'STK001', '2025-07-01', -3, 'Descuento por pedido PED-2025-747'),
('MOV-PED-645037', 'STK005', '2025-06-16', -10, 'Descuento por pedido PED-2025-973'),
('MOV-PED-670457', 'STK003', '2025-06-16', -6, 'Descuento por pedido PED-2025-172'),
('MOV-PED-704202', 'STK001', '2025-06-16', -2, 'Descuento por pedido PED-2025-333'),
('MOV-PED-707737', 'STK003', '2025-06-16', -2, 'Descuento por pedido PED-2025-885'),
('MOV-PED-756345', 'STK003', '2025-06-18', -3, 'Descuento por pedido PED-2025-561'),
('MOV-PED-792885', 'STK001', '2025-06-16', -1, 'Descuento por pedido PED-2025-429'),
('MOV-PED-821632', 'STK039', '2025-06-20', -3, 'Descuento por pedido PED-2025-317'),
('MOV-PED-828852', 'STK003', '2025-06-20', -2, 'Descuento por pedido PED-2025-521'),
('MOV-PED-829049', 'STK002', '2025-07-01', -3, 'Descuento por pedido PED-2025-747'),
('MOV-PED-852855', 'STK003', '2025-06-20', -2, 'Descuento por pedido PED-2025-708'),
('MOV-PED-870580', 'STK001', '2025-06-16', -1, 'Descuento por pedido PED-2025-823'),
('MOV-PED-943756', 'STK001', '2025-06-16', -2, 'Descuento por pedido PED-2025-446'),
('MOV-PED-965241', 'STK003', '2025-06-16', -2, 'Descuento por pedido PED-2025-663');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nombreindumentaria`
--

CREATE TABLE `nombreindumentaria` (
  `idNombre` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `nombreindumentaria`
--

INSERT INTO `nombreindumentaria` (`idNombre`, `nombre`) VALUES
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

CREATE TABLE `pedido` (
  `numeroPedido` varchar(50) NOT NULL,
  `idCliente` int(11) NOT NULL,
  `idUsuarioCreo` int(11) DEFAULT NULL,
  `idUsuarioModifico` int(11) DEFAULT NULL,
  `fechaPedido` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaModificacion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `codigoSeguimiento` varchar(100) DEFAULT NULL,
  `descuentoOrden` decimal(10,2) DEFAULT 0.00,
  `idMotivoCancelacion` int(11) DEFAULT NULL,
  `observacionCancelacion` text DEFAULT NULL,
  `fechaCancelacion` datetime DEFAULT NULL,
  `idUsuarioCancelo` int(11) DEFAULT NULL,
  `idEstado` int(11) DEFAULT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT 1,
  `dummyUpdate` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`numeroPedido`, `idCliente`, `idUsuarioCreo`, `idUsuarioModifico`, `fechaPedido`, `fechaModificacion`, `codigoSeguimiento`, `descuentoOrden`, `idMotivoCancelacion`, `observacionCancelacion`, `fechaCancelacion`, `idUsuarioCancelo`, `idEstado`, `estaActivo`, `dummyUpdate`) VALUES
('PED-20240110-001', 28, 1, NULL, '2024-01-10 10:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240115-001', 29, 2, NULL, '2024-01-15 11:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240120-001', 30, 1, NULL, '2024-01-21 12:00:00', '2025-07-23 13:29:15', NULL, 0.00, 1, NULL, '2024-01-21 12:00:00', 2, 6, 0, NULL),
('PED-20240125-001', 31, 2, NULL, '2024-01-25 13:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240201-001', 32, 1, NULL, '2024-02-01 14:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240205-001', 33, 2, NULL, '2024-02-06 15:00:00', '2025-07-23 13:33:48', NULL, 0.00, 4, NULL, '2024-02-06 15:00:00', 1, 6, 0, NULL),
('PED-20240210-001', 34, 1, NULL, '2024-02-10 16:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240215-001', 35, 2, NULL, '2024-02-16 17:00:00', '2025-07-23 13:33:57', NULL, 0.00, 6, 'Cliente solicitó envío express no disponible.', '2024-02-16 17:00:00', 1, 6, 0, NULL),
('PED-20240220-001', 36, 1, NULL, '2024-02-20 18:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240225-001', 37, 2, NULL, '2024-02-25 19:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240410-001', 38, 1, NULL, '2024-04-10 10:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240415-001', 39, 2, NULL, '2024-04-16 11:00:00', '2025-07-23 13:35:51', NULL, 0.00, 2, NULL, '2024-04-16 11:00:00', 1, 6, 0, NULL),
('PED-20240420-001', 40, 1, NULL, '2024-04-20 12:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240425-001', 41, 2, NULL, '2024-04-25 13:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240501-001', 42, 1, NULL, '2024-05-02 14:00:00', '2025-07-23 13:34:07', NULL, 0.00, 3, NULL, '2024-05-02 14:00:00', 2, 6, 0, NULL),
('PED-20240505-001', 43, 2, NULL, '2024-05-05 15:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240510-001', 44, 1, NULL, '2024-05-10 16:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240515-001', 45, 2, NULL, '2024-05-15 17:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240520-001', 46, 1, NULL, '2024-05-20 18:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240525-001', 47, 2, NULL, '2024-05-26 19:00:00', '2025-07-23 13:34:14', NULL, 0.00, 5, NULL, '2024-05-26 19:00:00', 1, 6, 0, NULL),
('PED-20240710-001', 1, 1, NULL, '2024-07-10 10:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240715-001', 2, 2, NULL, '2024-07-16 11:00:00', '2025-07-23 13:34:22', NULL, 0.00, 1, NULL, '2024-07-16 11:00:00', 2, 6, 0, NULL),
('PED-20240720-001', 3, 1, NULL, '2024-07-20 12:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240725-001', 4, 2, NULL, '2024-07-26 13:00:00', '2025-07-23 13:34:30', NULL, 0.00, 2, NULL, '2024-07-26 13:00:00', 1, 6, 0, NULL),
('PED-20240801-001', 5, 1, NULL, '2024-08-01 14:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240805-001', 6, 2, NULL, '2024-08-05 15:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240810-001', 7, 1, NULL, '2024-08-11 16:00:00', '2025-07-23 13:34:37', NULL, 0.00, 3, NULL, '2024-08-11 16:00:00', 2, 6, 0, NULL),
('PED-20240815-001', 8, 2, NULL, '2024-08-15 17:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240820-001', 9, 1, NULL, '2024-08-20 18:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20240825-001', 10, 2, NULL, '2024-08-25 19:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241010-001', 28, 1, NULL, '2024-10-10 10:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241015-001', 29, 2, NULL, '2024-10-15 11:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241020-001', 30, 1, NULL, '2024-10-21 12:00:00', '2025-07-23 13:34:45', NULL, 0.00, 4, NULL, '2024-10-21 12:00:00', 2, 6, 0, NULL),
('PED-20241025-001', 31, 2, NULL, '2024-10-25 13:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241101-001', 32, 1, NULL, '2024-11-01 14:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241105-001', 33, 2, NULL, '2024-11-05 15:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241110-001', 34, 1, NULL, '2024-11-10 16:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241115-001', 35, 2, NULL, '2024-11-16 17:00:00', '2025-07-23 13:34:52', NULL, 0.00, 1, NULL, '2024-11-16 17:00:00', 1, 6, 0, NULL),
('PED-20241120-001', 36, 1, NULL, '2024-11-20 18:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-20241125-001', 37, 2, NULL, '2024-11-25 19:00:00', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-014', 28, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-015', 29, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-016', 28, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-017', 30, NULL, NULL, '2025-06-16 15:34:33', '2025-06-18 13:52:53', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-018', 31, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-019', 32, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-020', 33, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL),
('PED-2025-021', 34, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-022', 35, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-023', 33, NULL, NULL, '2025-06-16 15:34:33', '2025-06-18 13:53:07', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-024', 36, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-025', 37, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-026', 38, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL),
('PED-2025-027', 39, NULL, NULL, '2025-06-16 15:34:33', '2025-06-18 13:51:00', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-028', 40, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL),
('PED-2025-029', 36, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-030', 41, NULL, NULL, '2025-06-16 15:34:33', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-101', 28, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-102', 29, NULL, NULL, '2025-06-16 15:44:01', '2025-06-20 00:16:13', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-103', 30, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL),
('PED-2025-104', 28, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-105', 31, NULL, NULL, '2025-06-16 15:44:01', '2025-06-18 20:13:57', 'HD-54545-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-106', 32, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-107', 33, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-108', 34, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL),
('PED-2025-109', 35, NULL, NULL, '2025-06-16 15:44:01', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-110', 36, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 20:07:18', 'HD112312345AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-111', 37, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 20:08:48', NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-112', 37, NULL, NULL, '2025-06-16 15:44:02', '2025-06-20 00:17:38', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-113', 38, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 03:35:37', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-114', 39, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 20:09:22', NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-115', 40, NULL, NULL, '2025-06-14 15:44:02', '2025-06-18 13:53:01', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-116', 41, NULL, NULL, '2025-06-16 15:44:02', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-117', 1, NULL, NULL, '2025-06-16 15:44:02', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-118', 2, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 20:09:51', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-119', 3, NULL, NULL, '2025-06-16 15:44:02', '2025-06-18 20:11:36', NULL, 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL),
('PED-2025-120', 4, NULL, NULL, '2025-06-16 15:44:02', '2025-06-20 00:16:52', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-172', 1, NULL, NULL, '2025-06-16 03:55:34', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-333', 4, NULL, NULL, '2025-06-16 04:01:30', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-407', 1, NULL, NULL, '2025-06-18 21:30:36', '2025-07-01 17:46:08', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-429', 28, NULL, NULL, '2025-06-16 20:43:17', '2025-06-18 19:59:09', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL),
('PED-2025-521', 1, 2, 1, '2025-06-20 02:19:11', '2025-07-01 23:45:18', NULL, 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL),
('PED-2025-747', 1, 1, 1, '2025-07-01 23:47:40', '2025-07-01 23:54:42', NULL, 0.00, 3, NULL, NULL, 1, 6, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `idPersona` int(11) NOT NULL,
  `dni` int(11) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `idDomicilio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`idPersona`, `dni`, `nombre`, `apellido`, `direccion`, `idDomicilio`) VALUES
(1, 12345678, 'Juan Pérez  ', '', 'Av. Santa Fe 1234', 1),
(2, 87654321, 'María', 'González', 'Calle Falsa 742', 2),
(3, 23456789, 'Carlos', 'Lopez', '9 de Julio 500', 3),
(4, 98765432, 'Laura', 'Fernandez', 'Mitre 1020', 4),
(5, 34567890, 'Ana', 'Martínez', 'San Martín 150', 5),
(6, 45678901, 'Luis', 'Rodríguez', 'Belgrano 2555', 6),
(7, 56789012, 'Sofía', 'Gómez', 'Independencia 360', 7),
(8, 67890123, 'Diego', 'Silva', 'Av. Salta 890', 8),
(9, 78901234, 'Lucía', 'Vargas', 'Colon 123', 9),
(10, 89012345, 'Pedro Molina ', '', 'Alsina 456', 10),
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

CREATE TABLE `precioindumentaria` (
  `idPrecio` int(11) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `precioindumentaria`
--

INSERT INTO `precioindumentaria` (`idPrecio`, `precio`) VALUES
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

CREATE TABLE `rack` (
  `idRack` int(11) NOT NULL,
  `numeroRack` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `rack`
--

INSERT INTO `rack` (`idRack`, `numeroRack`, `descripcion`) VALUES
(1, 1, 'Rack 1'),
(2, 2, 'Rack 2'),
(3, 3, 'Rack 3'),
(4, 4, 'Rack 4'),
(5, 5, 'Rack 5'),
(6, 6, 'Rack 6'),
(7, 7, 'Rack 7'),
(8, 8, 'Rack 8'),
(9, 9, 'Rack 9'),
(10, 10, 'Rack 10'),
(99, 0, 'Depósito de Indumentaria No Apta / Merma');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL,
  `idTipoRol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`idRol`, `idTipoRol`) VALUES
(1, 1),
(2, 2),
(3, 3),
(5, 5),
(6, 6),
(7, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stock`
--

CREATE TABLE `stock` (
  `idStock` varchar(50) NOT NULL,
  `codigoIndumentaria` varchar(50) DEFAULT NULL,
  `idRack` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `stock`
--

INSERT INTO `stock` (`idStock`, `codigoIndumentaria`, `idRack`) VALUES
('STK-NA-1756247729017', 'IND001', 99),
('STK001', 'IND001', 1),
('STK002', 'IND002', 2),
('STK003', 'IND003', 3),
('STK004', 'IND004', 4),
('STK005', 'IND005', 5),
('STK006', 'IND006', 6),
('STK007', 'IND007', 7),
('STK008', 'IND008', 8),
('STK009', 'IND009', 9),
('STK010', 'IND010', 10),
('STK015', 'IND015', 5),
('STK016', 'IND016', 1),
('STK017', 'IND017', 2),
('STK018', 'IND018', 3),
('STK019', 'IND019', 4),
('STK020', 'IND020', 5),
('STK021', 'IND021', 6),
('STK022', 'IND022', 7),
('STK023', 'IND023', 8),
('STK024', 'IND024', 9),
('STK025', 'IND025', 10),
('STK026', 'IND026', 1),
('STK027', 'IND027', 2),
('STK028', 'IND028', 3),
('STK029', 'IND029', 4),
('STK030', 'IND030', 5),
('STK031', 'IND031', 6),
('STK032', 'IND032', 7),
('STK033', 'IND033', 8),
('STK034', 'IND034', 9),
('STK035', 'IND035', 10),
('STK036', 'IND036', 7),
('STK037', 'IND037', 8),
('STK038', 'IND038', 9),
('STK039', 'IND039', 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talle`
--

CREATE TABLE `talle` (
  `idTalle` int(11) NOT NULL,
  `talle` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `talle`
--

INSERT INTO `talle` (`idTalle`, `talle`) VALUES
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
(13, 'XS'),
(14, 'S'),
(15, 'M'),
(16, 'L'),
(17, 'XL'),
(18, 'P');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tela`
--

CREATE TABLE `tela` (
  `idTela` int(11) NOT NULL,
  `tipoTela` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tela`
--

INSERT INTO `tela` (`idTela`, `tipoTela`) VALUES
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

CREATE TABLE `tiporol` (
  `idTipoRol` int(11) NOT NULL,
  `tipoRol` varchar(50) DEFAULT NULL,
  `descripcionRol` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `tiporol`
--

INSERT INTO `tiporol` (`idTipoRol`, `tipoRol`, `descripcionRol`) VALUES
(1, 'Administrador', 'Acceso completo al sistema'),
(2, 'Vendedor', 'Puede realizar ventas'),
(3, 'Envios', 'Encargado de Envios'),
(5, 'Gerente', 'Supervisa operaciones'),
(6, 'Picker', 'Encargado de picking'),
(7, 'Encargado de Stock', 'Gestiona stock');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidad_medida`
--

CREATE TABLE `unidad_medida` (
  `idUnidadMedida` int(11) NOT NULL,
  `nombreUnidad` varchar(50) NOT NULL,
  `abreviatura` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `unidad_medida`
--

INSERT INTO `unidad_medida` (`idUnidadMedida`, `nombreUnidad`, `abreviatura`) VALUES
(1, 'Unidad', 'un.'),
(2, 'Par', 'par'),
(3, 'Set', 'set'),
(4, 'Pack', 'pack');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `idPersona` int(11) DEFAULT NULL,
  `nombreUsuario` varchar(100) DEFAULT NULL,
  `contrasena` varchar(100) DEFAULT NULL,
  `idRol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `idPersona`, `nombreUsuario`, `contrasena`, `idRol`) VALUES
(1, 10, 'admin', 'admin123', 1),
(2, 9, 'mariag', '123', 2),
(5, 5, 'anamtz', '123', 6),
(6, 6, 'luisrd', '123', 6),
(7, 7, 'sofiag', '123', 7),
(15, 8, 'envios', '123', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vendedor`
--

CREATE TABLE `vendedor` (
  `idVendedor` int(11) NOT NULL,
  `legajo` int(11) DEFAULT NULL,
  `idPersona` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `vendedor`
--

INSERT INTO `vendedor` (`idVendedor`, `legajo`, `idPersona`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_clientes_vip`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_clientes_vip` (
`idCliente` int(11)
,`nombre` varchar(100)
,`apellido` varchar(100)
,`email` varchar(100)
,`monto_total_gastado` decimal(42,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_clientes_vip`
--
DROP TABLE IF EXISTS `vista_clientes_vip`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_clientes_vip`  AS SELECT `c`.`idCliente` AS `idCliente`, `pe`.`nombre` AS `nombre`, `pe`.`apellido` AS `apellido`, `c`.`email` AS `email`, sum(`pr`.`precio` * `dp`.`cantidad`) AS `monto_total_gastado` FROM ((((((`pedido` `p` join `cliente` `c` on(`p`.`idCliente` = `c`.`idCliente`)) join `persona` `pe` on(`c`.`idPersona` = `pe`.`idPersona`)) join `detallepedido` `dp` on(`p`.`numeroPedido` = `dp`.`numeroPedido`)) join `indumentaria` `i` on(`dp`.`codigoIndumentaria` = `i`.`codigoIndumentaria`)) join `detalleindumentaria` `di` on(`i`.`idDetalle` = `di`.`idDetalle`)) join `precioindumentaria` `pr` on(`di`.`idPrecio` = `pr`.`idPrecio`)) WHERE `p`.`estaActivo` = 1 AND `p`.`idEstado` <> 6 GROUP BY `c`.`idCliente`, `pe`.`nombre`, `pe`.`apellido`, `c`.`email` HAVING `monto_total_gastado` > (select cast(`configuracionvip`.`valor` as decimal(10,2)) from `configuracionvip` where `configuracionvip`.`clave` = 'monto_vip') ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adminsistemas`
--
ALTER TABLE `adminsistemas`
  ADD PRIMARY KEY (`idAdminSis`),
  ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking`
  ADD PRIMARY KEY (`idAsignacion`),
  ADD KEY `fk_asignacion_pedido` (`numeroPedido`),
  ADD KEY `fk_asignacion_picker` (`legajoPicker`);

--
-- Indices de la tabla `barrio`
--
ALTER TABLE `barrio`
  ADD PRIMARY KEY (`idBarrio`),
  ADD KEY `idCiudad` (`idCiudad`);

--
-- Indices de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria`
  ADD PRIMARY KEY (`idCategoria`);

--
-- Indices de la tabla `ciudad`
--
ALTER TABLE `ciudad`
  ADD PRIMARY KEY (`idCiudad`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`idCliente`),
  ADD KEY `idPersona` (`idPersona`),
  ADD KEY `fk_cliente_estado` (`estaActivo`);

--
-- Indices de la tabla `cliente_estados`
--
ALTER TABLE `cliente_estados`
  ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `cliente_historial_estado`
--
ALTER TABLE `cliente_historial_estado`
  ADD PRIMARY KEY (`idHistorial`),
  ADD KEY `fk_historial_cliente` (`idCliente`),
  ADD KEY `fk_historial_estado` (`idEstado`),
  ADD KEY `fk_historial_usuario` (`idUsuarioModifico`);

--
-- Indices de la tabla `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`idColor`);

--
-- Indices de la tabla `configuracionvip`
--
ALTER TABLE `configuracionvip`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria`
  ADD PRIMARY KEY (`idDetalle`),
  ADD KEY `idPrecio` (`idPrecio`),
  ADD KEY `idCategoria` (`idCategoria`),
  ADD KEY `idColor` (`idColor`),
  ADD KEY `idTalle` (`idTalle`),
  ADD KEY `idEstado` (`idEstado`),
  ADD KEY `idTela` (`idTela`),
  ADD KEY `fk_detalle_nombre` (`idNombre`),
  ADD KEY `fk_detalle_unidad_medida` (`idUnidadMedida`);

--
-- Indices de la tabla `detallepedido`
--
ALTER TABLE `detallepedido`
  ADD PRIMARY KEY (`idDetallePedido`),
  ADD KEY `numeroPedido` (`numeroPedido`),
  ADD KEY `codigoIndumentaria` (`codigoIndumentaria`);

--
-- Indices de la tabla `domicilio`
--
ALTER TABLE `domicilio`
  ADD PRIMARY KEY (`idDomicilio`),
  ADD KEY `idBarrio` (`idBarrio`),
  ADD KEY `idCiudad` (`idCiudad`);

--
-- Indices de la tabla `encargadoindumentaria`
--
ALTER TABLE `encargadoindumentaria`
  ADD PRIMARY KEY (`legajo`),
  ADD KEY `codigoIndumentaria` (`codigoIndumentaria`);

--
-- Indices de la tabla `encargadopedidos`
--
ALTER TABLE `encargadopedidos`
  ADD PRIMARY KEY (`legajo`),
  ADD KEY `numeroPedido` (`numeroPedido`);

--
-- Indices de la tabla `encargadopicker`
--
ALTER TABLE `encargadopicker`
  ADD PRIMARY KEY (`legajo`),
  ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `legajo` (`legajo`),
  ADD KEY `idStock` (`idStock`);

--
-- Indices de la tabla `estadoindumentaria`
--
ALTER TABLE `estadoindumentaria`
  ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `estadopedido`
--
ALTER TABLE `estadopedido`
  ADD PRIMARY KEY (`idEstado`);

--
-- Indices de la tabla `gerentegeneral`
--
ALTER TABLE `gerentegeneral`
  ADD PRIMARY KEY (`idGerente`),
  ADD KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `indumentaria`
--
ALTER TABLE `indumentaria`
  ADD PRIMARY KEY (`codigoIndumentaria`),
  ADD KEY `idDetalle` (`idDetalle`);

--
-- Indices de la tabla `motivo_cancelacion`
--
ALTER TABLE `motivo_cancelacion`
  ADD PRIMARY KEY (`idMotivo`);

--
-- Indices de la tabla `movimientostock`
--
ALTER TABLE `movimientostock`
  ADD PRIMARY KEY (`idMovimientoStock`),
  ADD KEY `idStock` (`idStock`);

--
-- Indices de la tabla `nombreindumentaria`
--
ALTER TABLE `nombreindumentaria`
  ADD PRIMARY KEY (`idNombre`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`numeroPedido`),
  ADD KEY `idEstado` (`idEstado`),
  ADD KEY `pedido_ibfk_cliente` (`idCliente`),
  ADD KEY `fk_pedido_motivo_cancelacion` (`idMotivoCancelacion`),
  ADD KEY `fk_pedido_usuario_cancelo` (`idUsuarioCancelo`),
  ADD KEY `fk_pedido_usuario_creo` (`idUsuarioCreo`),
  ADD KEY `fk_pedido_usuario_modifico` (`idUsuarioModifico`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`idPersona`),
  ADD KEY `idDomicilio` (`idDomicilio`);

--
-- Indices de la tabla `precioindumentaria`
--
ALTER TABLE `precioindumentaria`
  ADD PRIMARY KEY (`idPrecio`);

--
-- Indices de la tabla `rack`
--
ALTER TABLE `rack`
  ADD PRIMARY KEY (`idRack`),
  ADD UNIQUE KEY `idx_numeroRack` (`numeroRack`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`idRol`),
  ADD KEY `idTipoRol` (`idTipoRol`);

--
-- Indices de la tabla `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`idStock`),
  ADD KEY `codigoIndumentaria` (`codigoIndumentaria`),
  ADD KEY `fk_stock_rack` (`idRack`);

--
-- Indices de la tabla `talle`
--
ALTER TABLE `talle`
  ADD PRIMARY KEY (`idTalle`);

--
-- Indices de la tabla `tela`
--
ALTER TABLE `tela`
  ADD PRIMARY KEY (`idTela`);

--
-- Indices de la tabla `tiporol`
--
ALTER TABLE `tiporol`
  ADD PRIMARY KEY (`idTipoRol`);

--
-- Indices de la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  ADD PRIMARY KEY (`idUnidadMedida`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `idPersona` (`idPersona`),
  ADD KEY `idRol` (`idRol`);

--
-- Indices de la tabla `vendedor`
--
ALTER TABLE `vendedor`
  ADD PRIMARY KEY (`idVendedor`),
  ADD KEY `idPersona` (`idPersona`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking`
  MODIFY `idAsignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `barrio`
--
ALTER TABLE `barrio`
  MODIFY `idBarrio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `ciudad`
--
ALTER TABLE `ciudad`
  MODIFY `idCiudad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT de la tabla `cliente_historial_estado`
--
ALTER TABLE `cliente_historial_estado`
  MODIFY `idHistorial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `color`
--
ALTER TABLE `color`
  MODIFY `idColor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria`
  MODIFY `idDetalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `domicilio`
--
ALTER TABLE `domicilio`
  MODIFY `idDomicilio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `estadoindumentaria`
--
ALTER TABLE `estadoindumentaria`
  MODIFY `idEstado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `motivo_cancelacion`
--
ALTER TABLE `motivo_cancelacion`
  MODIFY `idMotivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `nombreindumentaria`
--
ALTER TABLE `nombreindumentaria`
  MODIFY `idNombre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `idPersona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `precioindumentaria`
--
ALTER TABLE `precioindumentaria`
  MODIFY `idPrecio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `rack`
--
ALTER TABLE `rack`
  MODIFY `idRack` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT de la tabla `talle`
--
ALTER TABLE `talle`
  MODIFY `idTalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `tela`
--
ALTER TABLE `tela`
  MODIFY `idTela` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `unidad_medida`
--
ALTER TABLE `unidad_medida`
  MODIFY `idUnidadMedida` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adminsistemas`
--
ALTER TABLE `adminsistemas`
  ADD CONSTRAINT `adminsistemas_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `asignacion_picking`
--
ALTER TABLE `asignacion_picking`
  ADD CONSTRAINT `fk_asignacion_pedido` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`),
  ADD CONSTRAINT `fk_asignacion_picker` FOREIGN KEY (`legajoPicker`) REFERENCES `encargadopicker` (`legajo`);

--
-- Filtros para la tabla `barrio`
--
ALTER TABLE `barrio`
  ADD CONSTRAINT `barrio_ibfk_1` FOREIGN KEY (`idCiudad`) REFERENCES `ciudad` (`idCiudad`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`),
  ADD CONSTRAINT `fk_cliente_estado` FOREIGN KEY (`estaActivo`) REFERENCES `cliente_estados` (`idEstado`);

--
-- Filtros para la tabla `cliente_historial_estado`
--
ALTER TABLE `cliente_historial_estado`
  ADD CONSTRAINT `fk_historial_cliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`),
  ADD CONSTRAINT `fk_historial_estado` FOREIGN KEY (`idEstado`) REFERENCES `cliente_estados` (`idEstado`),
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`idUsuarioModifico`) REFERENCES `usuario` (`idUsuario`);

--
-- Filtros para la tabla `detalleindumentaria`
--
ALTER TABLE `detalleindumentaria`
  ADD CONSTRAINT `detalleindumentaria_ibfk_1` FOREIGN KEY (`idPrecio`) REFERENCES `precioindumentaria` (`idPrecio`),
  ADD CONSTRAINT `detalleindumentaria_ibfk_2` FOREIGN KEY (`idCategoria`) REFERENCES `categoriaindumentaria` (`idCategoria`),
  ADD CONSTRAINT `detalleindumentaria_ibfk_3` FOREIGN KEY (`idColor`) REFERENCES `color` (`idColor`),
  ADD CONSTRAINT `detalleindumentaria_ibfk_4` FOREIGN KEY (`idTalle`) REFERENCES `talle` (`idTalle`),
  ADD CONSTRAINT `detalleindumentaria_ibfk_5` FOREIGN KEY (`idEstado`) REFERENCES `estadoindumentaria` (`idEstado`),
  ADD CONSTRAINT `detalleindumentaria_ibfk_6` FOREIGN KEY (`idTela`) REFERENCES `tela` (`idTela`),
  ADD CONSTRAINT `fk_detalle_nombre` FOREIGN KEY (`idNombre`) REFERENCES `nombreindumentaria` (`idNombre`),
  ADD CONSTRAINT `fk_detalle_unidad_medida` FOREIGN KEY (`idUnidadMedida`) REFERENCES `unidad_medida` (`idUnidadMedida`);

--
-- Filtros para la tabla `detallepedido`
--
ALTER TABLE `detallepedido`
  ADD CONSTRAINT `detallepedido_ibfk_1` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`),
  ADD CONSTRAINT `detallepedido_ibfk_2` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `domicilio`
--
ALTER TABLE `domicilio`
  ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`idBarrio`) REFERENCES `barrio` (`idBarrio`),
  ADD CONSTRAINT `domicilio_ibfk_2` FOREIGN KEY (`idCiudad`) REFERENCES `ciudad` (`idCiudad`);

--
-- Filtros para la tabla `encargadoindumentaria`
--
ALTER TABLE `encargadoindumentaria`
  ADD CONSTRAINT `encargadoindumentaria_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `encargadopedidos`
--
ALTER TABLE `encargadopedidos`
  ADD CONSTRAINT `encargadopedidos_ibfk_1` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`);

--
-- Filtros para la tabla `encargadopicker`
--
ALTER TABLE `encargadopicker`
  ADD CONSTRAINT `encargadopicker_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `encargadopicker_stock`
--
ALTER TABLE `encargadopicker_stock`
  ADD CONSTRAINT `encargadopicker_stock_ibfk_1` FOREIGN KEY (`legajo`) REFERENCES `encargadopicker` (`legajo`),
  ADD CONSTRAINT `encargadopicker_stock_ibfk_2` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`);

--
-- Filtros para la tabla `gerentegeneral`
--
ALTER TABLE `gerentegeneral`
  ADD CONSTRAINT `gerentegeneral_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `indumentaria`
--
ALTER TABLE `indumentaria`
  ADD CONSTRAINT `indumentaria_ibfk_1` FOREIGN KEY (`idDetalle`) REFERENCES `detalleindumentaria` (`idDetalle`);

--
-- Filtros para la tabla `movimientostock`
--
ALTER TABLE `movimientostock`
  ADD CONSTRAINT `movimientostock_ibfk_1` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_motivo_cancelacion` FOREIGN KEY (`idMotivoCancelacion`) REFERENCES `motivo_cancelacion` (`idMotivo`),
  ADD CONSTRAINT `fk_pedido_usuario_cancelo` FOREIGN KEY (`idUsuarioCancelo`) REFERENCES `usuario` (`idUsuario`),
  ADD CONSTRAINT `fk_pedido_usuario_creo` FOREIGN KEY (`idUsuarioCreo`) REFERENCES `usuario` (`idUsuario`),
  ADD CONSTRAINT `fk_pedido_usuario_modifico` FOREIGN KEY (`idUsuarioModifico`) REFERENCES `usuario` (`idUsuario`),
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`idEstado`) REFERENCES `estadopedido` (`idEstado`),
  ADD CONSTRAINT `pedido_ibfk_cliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`);

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`idDomicilio`) REFERENCES `domicilio` (`idDomicilio`);

--
-- Filtros para la tabla `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `rol_ibfk_1` FOREIGN KEY (`idTipoRol`) REFERENCES `tiporol` (`idTipoRol`);

--
-- Filtros para la tabla `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_rack` FOREIGN KEY (`idRack`) REFERENCES `rack` (`idRack`),
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`),
  ADD CONSTRAINT `usuario_ibfk_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `vendedor`
--
ALTER TABLE `vendedor`
  ADD CONSTRAINT `vendedor_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;