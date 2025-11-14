-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-11-2025 a las 19:28:19
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

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GenerateFictitiousOrders` ()   BEGIN
    -- Declaración de variables
    DECLARE currentMonth DATE;
    DECLARE orderDate DATETIME;
    DECLARE lastNumeroPedido VARCHAR(50);
    DECLARE i INT;
    DECLARE j INT;
    DECLARE numItems INT;
    DECLARE randomDay, randomHour, randomMinute, randomSecond INT;
    DECLARE randomClienteID, randomUsuarioID, randomEmpresaID, randomEstadoID INT;
    DECLARE randomCodigoInd VARCHAR(50);
    DECLARE randomCantidad INT;

    -- --- Configuración de la Simulación ---
    SET @startDate = '2024-01-01'; 
    SET @endDate = '2025-10-31';   
    SET @numPedidosPorMes = 25;    
    -- -------------------------------------

    SET currentMonth = @startDate;

    -- Bucle principal: Itera mes a mes
    WHILE currentMonth <= @endDate DO
        
        SET i = 0;
        -- Bucle interno: Crea N pedidos para el mes actual
        WHILE i < @numPedidosPorMes DO
            
            -- Generar una fecha/hora aleatoria dentro del mes actual
            SET randomDay = FLOOR(1 + RAND() * (DAY(LAST_DAY(currentMonth))));
            SET randomHour = FLOOR(8 + RAND() * 12); 
            SET randomMinute = FLOOR(RAND() * 60);
            SET randomSecond = FLOOR(RAND() * 60);
            SET orderDate = STR_TO_DATE(CONCAT(YEAR(currentMonth), '-', MONTH(currentMonth), '-', randomDay, ' ', randomHour, ':', randomMinute, ':', randomSecond), '%Y-%m-%d %H:%i:%s');

            -- Generar un número de pedido único para la simulación
            SET lastNumeroPedido = CONCAT('PED-SIM-', YEAR(orderDate), LPAD(MONTH(orderDate), 2, '0'), LPAD(randomDay, 2, '0'), '-', i);

            -- Obtener IDs aleatorios de tus tablas (basado en tu BD)
            SET randomClienteID = FLOOR(1 + RAND() * 10); 
            SET randomUsuarioID = ELT(FLOOR(1 + RAND() * 6), 1, 2, 5, 6, 7, 15); 
            SET randomEmpresaID = FLOOR(1 + RAND() * 4); 
            SET randomEstadoID = ELT(FLOOR(1 + RAND() * 3), 3, 4, 5); 

            -- INSERT para `pedido`
            INSERT INTO pedido (
                numeroPedido, 
                idCliente, 
                fechaPedido, 
                idUsuarioCreo, 
                idEmpresaEnvio,
                idEstado,
                estaActivo
            )
            VALUES (
                lastNumeroPedido,
                randomClienteID,
                orderDate,
                randomUsuarioID,
                randomEmpresaID,
                randomEstadoID,
                1
            );

            -- Ahora, insertar 1 a 3 ítems en `detallepedido`
            SET numItems = FLOOR(1 + RAND() * 3); 
            SET j = 0;
            
            WHILE j < numItems DO
                
                -- *** CORRECCIÓN CLAVE AQUÍ: Usamos ELT para seleccionar SOLO los 35 códigos existentes ***
                SET randomCodigoInd = ELT(FLOOR(1 + RAND() * 35), 
                    'IND001', 'IND002', 'IND003', 'IND004', 'IND005', 'IND006', 'IND007', 'IND008', 'IND009', 'IND010',
                    'IND015', 'IND016', 'IND017', 'IND018', 'IND019', 'IND020', 'IND021', 'IND022', 'IND023', 'IND024',
                    'IND025', 'IND026', 'IND027', 'IND028', 'IND029', 'IND030', 'IND031', 'IND032', 'IND033', 'IND034',
                    'IND035', 'IND036', 'IND037', 'IND038', 'IND039'
                );
                SET randomCantidad = FLOOR(1 + RAND() * 5); 
                
                -- INSERT para `detallepedido`
                INSERT INTO detallepedido (
                    idDetallePedido, 
                    numeroPedido, 
                    codigoIndumentaria, 
                    cantidad,
                    descuentoItem
                )
                VALUES (
                    CONCAT('DP-SIM-', lastNumeroPedido, '-', j), 
                    lastNumeroPedido,
                    randomCodigoInd,
                    randomCantidad,
                    0.00
                );
                
                SET j = j + 1;
            END WHILE;

            SET i = i + 1;
        END WHILE;

        -- Avanzar al siguiente mes
        SET currentMonth = DATE_ADD(currentMonth, INTERVAL 1 MONTH);
    END WHILE;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarStock` (IN `p_codigoIndumentaria` VARCHAR(50), IN `p_idRack` INT, IN `p_cantidad` INT)   BEGIN
    DECLARE i INT DEFAULT 0;
    
    -- El bucle ejecuta el INSERT la cantidad de veces especificada (p_cantidad)
    WHILE i < p_cantidad DO
        -- Genera un ID único (UUID) para cada unidad de stock
        INSERT INTO stock (idStock, codigoIndumentaria, idRack)
        VALUES (UUID(), p_codigoIndumentaria, p_idRack);
        
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

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
  `fechaDespachado` datetime DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `completado` tinyint(1) NOT NULL DEFAULT 0,
  `despachado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el encargado ha completado la tarea de Despacho (registro de tracking y entrega a la empresa)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `asignacion_picking`
--

INSERT INTO `asignacion_picking` (`idAsignacion`, `numeroPedido`, `legajoPicker`, `fechaAsignacion`, `fechaCompletado`, `fechaDespachado`, `observaciones`, `completado`, `despachado`) VALUES
(29, 'PED-2025-112', 'LP005', '2025-06-18 06:35:53', '2025-06-18 20:14:32', NULL, 'Asignación desde panel gerente', 1, 0),
(30, 'PED-2025-113', 'LP006', '2025-06-18 06:36:03', '2025-10-28 01:07:38', NULL, 'Tarea completada desde frontend', 1, 0),
(31, 'PED-2025-112', 'LP005', '2025-06-18 20:14:32', NULL, NULL, 'Asignación desde panel gerente', 0, 0),
(32, 'PED-2025-407', 'LP006', '2025-06-19 05:26:00', '2025-11-01 19:23:15', NULL, 'Tarea completada desde frontend', 1, 0),
(35, 'PED-2025-521', 'LP005', '2025-06-20 02:20:08', NULL, NULL, 'Asignación desde panel gerente', 0, 0),
(36, 'PED-2025-747', 'LP006', '2025-07-01 23:48:21', NULL, NULL, 'Asignación desde panel gerente', 0, 0),
(37, 'PED-2025-429', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(38, 'PED-2025-118', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(39, 'PED-2025-109', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(40, 'PED-2025-104', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(41, 'PED-2025-027', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(42, 'PED-2025-023', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(43, 'PED-2025-021', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(44, 'PED-2025-017', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(45, 'PED-2025-016', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0),
(46, 'PED-2025-115', 'LP005', '2025-10-28 01:06:21', '2025-10-28 01:06:21', NULL, 'Asignación automática - sin historial previo', 1, 0);

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
('DP-SIM-PED-SIM-20240102-1-0', 'PED-SIM-20240102-1', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20240102-11-0', 'PED-SIM-20240102-11', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20240102-11-1', 'PED-SIM-20240102-11', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240102-16-0', 'PED-SIM-20240102-16', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20240103-7-0', 'PED-SIM-20240103-7', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20240105-15-0', 'PED-SIM-20240105-15', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20240105-2-0', 'PED-SIM-20240105-2', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240105-2-1', 'PED-SIM-20240105-2', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20240105-2-2', 'PED-SIM-20240105-2', 'IND016', 1, 0.00),
('DP-SIM-PED-SIM-20240105-22-0', 'PED-SIM-20240105-22', 'IND024', 3, 0.00),
('DP-SIM-PED-SIM-20240107-12-0', 'PED-SIM-20240107-12', 'IND016', 2, 0.00),
('DP-SIM-PED-SIM-20240109-21-0', 'PED-SIM-20240109-21', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20240109-3-0', 'PED-SIM-20240109-3', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20240110-0-0', 'PED-SIM-20240110-0', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240110-0-1', 'PED-SIM-20240110-0', 'IND002', 2, 0.00),
('DP-SIM-PED-SIM-20240110-13-0', 'PED-SIM-20240110-13', 'IND038', 3, 0.00),
('DP-SIM-PED-SIM-20240110-13-1', 'PED-SIM-20240110-13', 'IND002', 3, 0.00),
('DP-SIM-PED-SIM-20240111-10-0', 'PED-SIM-20240111-10', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20240111-19-0', 'PED-SIM-20240111-19', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20240114-8-0', 'PED-SIM-20240114-8', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20240114-8-1', 'PED-SIM-20240114-8', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20240114-8-2', 'PED-SIM-20240114-8', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240116-6-0', 'PED-SIM-20240116-6', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20240116-6-1', 'PED-SIM-20240116-6', 'IND038', 4, 0.00),
('DP-SIM-PED-SIM-20240117-17-0', 'PED-SIM-20240117-17', 'IND008', 2, 0.00),
('DP-SIM-PED-SIM-20240118-5-0', 'PED-SIM-20240118-5', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20240118-5-1', 'PED-SIM-20240118-5', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240121-0-0', 'PED-SIM-20240121-0', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20240124-24-0', 'PED-SIM-20240124-24', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240124-24-1', 'PED-SIM-20240124-24', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20240124-24-2', 'PED-SIM-20240124-24', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20240126-4-0', 'PED-SIM-20240126-4', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20240126-4-1', 'PED-SIM-20240126-4', 'IND036', 3, 0.00),
('DP-SIM-PED-SIM-20240126-4-2', 'PED-SIM-20240126-4', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20240127-18-0', 'PED-SIM-20240127-18', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20240127-18-1', 'PED-SIM-20240127-18', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20240127-18-2', 'PED-SIM-20240127-18', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20240127-9-0', 'PED-SIM-20240127-9', 'IND022', 1, 0.00),
('DP-SIM-PED-SIM-20240129-20-0', 'PED-SIM-20240129-20', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20240129-20-1', 'PED-SIM-20240129-20', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20240130-14-0', 'PED-SIM-20240130-14', 'IND021', 2, 0.00),
('DP-SIM-PED-SIM-20240130-14-1', 'PED-SIM-20240130-14', 'IND020', 1, 0.00),
('DP-SIM-PED-SIM-20240130-14-2', 'PED-SIM-20240130-14', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20240131-23-0', 'PED-SIM-20240131-23', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20240131-23-1', 'PED-SIM-20240131-23', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20240131-23-2', 'PED-SIM-20240131-23', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20240201-12-0', 'PED-SIM-20240201-12', 'IND007', 4, 0.00),
('DP-SIM-PED-SIM-20240201-12-1', 'PED-SIM-20240201-12', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20240201-3-0', 'PED-SIM-20240201-3', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20240201-3-1', 'PED-SIM-20240201-3', 'IND025', 1, 0.00),
('DP-SIM-PED-SIM-20240201-3-2', 'PED-SIM-20240201-3', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20240203-14-0', 'PED-SIM-20240203-14', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20240203-14-1', 'PED-SIM-20240203-14', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20240204-11-0', 'PED-SIM-20240204-11', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20240204-11-1', 'PED-SIM-20240204-11', 'IND019', 1, 0.00),
('DP-SIM-PED-SIM-20240204-22-0', 'PED-SIM-20240204-22', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240204-22-1', 'PED-SIM-20240204-22', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20240204-22-2', 'PED-SIM-20240204-22', 'IND005', 4, 0.00),
('DP-SIM-PED-SIM-20240205-2-0', 'PED-SIM-20240205-2', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20240205-2-1', 'PED-SIM-20240205-2', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20240205-2-2', 'PED-SIM-20240205-2', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20240205-7-0', 'PED-SIM-20240205-7', 'IND037', 4, 0.00),
('DP-SIM-PED-SIM-20240205-7-1', 'PED-SIM-20240205-7', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20240205-7-2', 'PED-SIM-20240205-7', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20240206-24-0', 'PED-SIM-20240206-24', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20240207-5-0', 'PED-SIM-20240207-5', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20240207-5-1', 'PED-SIM-20240207-5', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20240208-13-0', 'PED-SIM-20240208-13', 'IND033', 5, 0.00),
('DP-SIM-PED-SIM-20240208-13-1', 'PED-SIM-20240208-13', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20240208-13-2', 'PED-SIM-20240208-13', 'IND022', 1, 0.00),
('DP-SIM-PED-SIM-20240208-16-0', 'PED-SIM-20240208-16', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20240213-23-0', 'PED-SIM-20240213-23', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20240214-6-0', 'PED-SIM-20240214-6', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240216-10-0', 'PED-SIM-20240216-10', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20240223-0-0', 'PED-SIM-20240223-0', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240223-0-1', 'PED-SIM-20240223-0', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20240223-19-0', 'PED-SIM-20240223-19', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20240223-19-1', 'PED-SIM-20240223-19', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20240223-4-0', 'PED-SIM-20240223-4', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20240223-8-0', 'PED-SIM-20240223-8', 'IND031', 4, 0.00),
('DP-SIM-PED-SIM-20240223-8-1', 'PED-SIM-20240223-8', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240223-8-2', 'PED-SIM-20240223-8', 'IND037', 4, 0.00),
('DP-SIM-PED-SIM-20240224-17-0', 'PED-SIM-20240224-17', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20240224-17-1', 'PED-SIM-20240224-17', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20240224-20-0', 'PED-SIM-20240224-20', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240224-20-1', 'PED-SIM-20240224-20', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20240224-20-2', 'PED-SIM-20240224-20', 'IND026', 5, 0.00),
('DP-SIM-PED-SIM-20240226-15-0', 'PED-SIM-20240226-15', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20240226-15-1', 'PED-SIM-20240226-15', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20240226-18-0', 'PED-SIM-20240226-18', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20240226-18-1', 'PED-SIM-20240226-18', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20240226-18-2', 'PED-SIM-20240226-18', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20240226-9-0', 'PED-SIM-20240226-9', 'IND022', 1, 0.00),
('DP-SIM-PED-SIM-20240227-1-0', 'PED-SIM-20240227-1', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20240228-21-0', 'PED-SIM-20240228-21', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20240303-10-0', 'PED-SIM-20240303-10', 'IND027', 1, 0.00),
('DP-SIM-PED-SIM-20240303-10-1', 'PED-SIM-20240303-10', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20240303-3-0', 'PED-SIM-20240303-3', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240303-3-1', 'PED-SIM-20240303-3', 'IND016', 1, 0.00),
('DP-SIM-PED-SIM-20240304-2-0', 'PED-SIM-20240304-2', 'IND036', 3, 0.00),
('DP-SIM-PED-SIM-20240305-15-0', 'PED-SIM-20240305-15', 'IND002', 5, 0.00),
('DP-SIM-PED-SIM-20240305-15-1', 'PED-SIM-20240305-15', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20240305-15-2', 'PED-SIM-20240305-15', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20240306-5-0', 'PED-SIM-20240306-5', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20240306-5-1', 'PED-SIM-20240306-5', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240307-16-0', 'PED-SIM-20240307-16', 'IND016', 5, 0.00),
('DP-SIM-PED-SIM-20240309-13-0', 'PED-SIM-20240309-13', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20240309-13-1', 'PED-SIM-20240309-13', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20240309-13-2', 'PED-SIM-20240309-13', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20240309-17-0', 'PED-SIM-20240309-17', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20240309-17-1', 'PED-SIM-20240309-17', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20240309-17-2', 'PED-SIM-20240309-17', 'IND018', 2, 0.00),
('DP-SIM-PED-SIM-20240309-21-0', 'PED-SIM-20240309-21', 'IND004', 2, 0.00),
('DP-SIM-PED-SIM-20240309-21-1', 'PED-SIM-20240309-21', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20240309-6-0', 'PED-SIM-20240309-6', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20240309-6-1', 'PED-SIM-20240309-6', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20240310-18-0', 'PED-SIM-20240310-18', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20240310-18-1', 'PED-SIM-20240310-18', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240310-20-0', 'PED-SIM-20240310-20', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20240310-20-1', 'PED-SIM-20240310-20', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20240310-20-2', 'PED-SIM-20240310-20', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20240313-0-0', 'PED-SIM-20240313-0', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20240313-0-1', 'PED-SIM-20240313-0', 'IND022', 4, 0.00),
('DP-SIM-PED-SIM-20240316-19-0', 'PED-SIM-20240316-19', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20240316-19-1', 'PED-SIM-20240316-19', 'IND037', 3, 0.00),
('DP-SIM-PED-SIM-20240316-19-2', 'PED-SIM-20240316-19', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20240316-8-0', 'PED-SIM-20240316-8', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20240316-8-1', 'PED-SIM-20240316-8', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20240319-7-0', 'PED-SIM-20240319-7', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20240320-11-0', 'PED-SIM-20240320-11', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20240320-11-1', 'PED-SIM-20240320-11', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240320-14-0', 'PED-SIM-20240320-14', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20240320-14-1', 'PED-SIM-20240320-14', 'IND016', 2, 0.00),
('DP-SIM-PED-SIM-20240320-14-2', 'PED-SIM-20240320-14', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20240323-23-0', 'PED-SIM-20240323-23', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20240323-24-0', 'PED-SIM-20240323-24', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240323-24-1', 'PED-SIM-20240323-24', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240323-24-2', 'PED-SIM-20240323-24', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240323-4-0', 'PED-SIM-20240323-4', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20240326-12-0', 'PED-SIM-20240326-12', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20240326-12-1', 'PED-SIM-20240326-12', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20240328-1-0', 'PED-SIM-20240328-1', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240328-1-1', 'PED-SIM-20240328-1', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20240331-22-0', 'PED-SIM-20240331-22', 'IND020', 1, 0.00),
('DP-SIM-PED-SIM-20240331-9-0', 'PED-SIM-20240331-9', 'IND007', 1, 0.00),
('DP-SIM-PED-SIM-20240401-10-0', 'PED-SIM-20240401-10', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20240401-10-1', 'PED-SIM-20240401-10', 'IND001', 4, 0.00),
('DP-SIM-PED-SIM-20240401-10-2', 'PED-SIM-20240401-10', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20240402-23-0', 'PED-SIM-20240402-23', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240402-23-1', 'PED-SIM-20240402-23', 'IND028', 4, 0.00),
('DP-SIM-PED-SIM-20240402-23-2', 'PED-SIM-20240402-23', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20240406-12-0', 'PED-SIM-20240406-12', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240406-16-0', 'PED-SIM-20240406-16', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20240406-16-1', 'PED-SIM-20240406-16', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20240406-16-2', 'PED-SIM-20240406-16', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20240406-3-0', 'PED-SIM-20240406-3', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20240406-3-1', 'PED-SIM-20240406-3', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20240406-3-2', 'PED-SIM-20240406-3', 'IND019', 3, 0.00),
('DP-SIM-PED-SIM-20240407-24-0', 'PED-SIM-20240407-24', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20240407-24-1', 'PED-SIM-20240407-24', 'IND004', 2, 0.00),
('DP-SIM-PED-SIM-20240408-13-0', 'PED-SIM-20240408-13', 'IND039', 1, 0.00),
('DP-SIM-PED-SIM-20240411-8-0', 'PED-SIM-20240411-8', 'IND015', 1, 0.00),
('DP-SIM-PED-SIM-20240411-8-1', 'PED-SIM-20240411-8', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20240411-8-2', 'PED-SIM-20240411-8', 'IND028', 4, 0.00),
('DP-SIM-PED-SIM-20240413-0-0', 'PED-SIM-20240413-0', 'IND021', 1, 0.00),
('DP-SIM-PED-SIM-20240413-0-1', 'PED-SIM-20240413-0', 'IND002', 5, 0.00),
('DP-SIM-PED-SIM-20240413-0-2', 'PED-SIM-20240413-0', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20240413-19-0', 'PED-SIM-20240413-19', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20240414-1-0', 'PED-SIM-20240414-1', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20240414-1-1', 'PED-SIM-20240414-1', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20240416-14-0', 'PED-SIM-20240416-14', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20240418-5-0', 'PED-SIM-20240418-5', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20240419-2-0', 'PED-SIM-20240419-2', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20240419-2-1', 'PED-SIM-20240419-2', 'IND016', 2, 0.00),
('DP-SIM-PED-SIM-20240419-2-2', 'PED-SIM-20240419-2', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20240419-9-0', 'PED-SIM-20240419-9', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20240421-15-0', 'PED-SIM-20240421-15', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20240421-15-1', 'PED-SIM-20240421-15', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20240421-20-0', 'PED-SIM-20240421-20', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20240421-20-1', 'PED-SIM-20240421-20', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240421-20-2', 'PED-SIM-20240421-20', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20240421-4-0', 'PED-SIM-20240421-4', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20240421-4-1', 'PED-SIM-20240421-4', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20240424-17-0', 'PED-SIM-20240424-17', 'IND001', 4, 0.00),
('DP-SIM-PED-SIM-20240424-17-1', 'PED-SIM-20240424-17', 'IND008', 1, 0.00),
('DP-SIM-PED-SIM-20240424-17-2', 'PED-SIM-20240424-17', 'IND035', 1, 0.00),
('DP-SIM-PED-SIM-20240425-22-0', 'PED-SIM-20240425-22', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20240425-6-0', 'PED-SIM-20240425-6', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20240425-6-1', 'PED-SIM-20240425-6', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240426-11-0', 'PED-SIM-20240426-11', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20240426-11-1', 'PED-SIM-20240426-11', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20240426-21-0', 'PED-SIM-20240426-21', 'IND007', 1, 0.00),
('DP-SIM-PED-SIM-20240426-21-1', 'PED-SIM-20240426-21', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20240426-21-2', 'PED-SIM-20240426-21', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20240427-18-0', 'PED-SIM-20240427-18', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20240427-18-1', 'PED-SIM-20240427-18', 'IND018', 1, 0.00),
('DP-SIM-PED-SIM-20240429-7-0', 'PED-SIM-20240429-7', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20240501-15-0', 'PED-SIM-20240501-15', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20240503-12-0', 'PED-SIM-20240503-12', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20240503-12-1', 'PED-SIM-20240503-12', 'IND003', 1, 0.00),
('DP-SIM-PED-SIM-20240503-12-2', 'PED-SIM-20240503-12', 'IND036', 3, 0.00),
('DP-SIM-PED-SIM-20240503-14-0', 'PED-SIM-20240503-14', 'IND027', 1, 0.00),
('DP-SIM-PED-SIM-20240503-14-1', 'PED-SIM-20240503-14', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240503-14-2', 'PED-SIM-20240503-14', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240503-2-0', 'PED-SIM-20240503-2', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240503-7-0', 'PED-SIM-20240503-7', 'IND019', 3, 0.00),
('DP-SIM-PED-SIM-20240503-9-0', 'PED-SIM-20240503-9', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20240503-9-1', 'PED-SIM-20240503-9', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20240504-16-0', 'PED-SIM-20240504-16', 'IND037', 1, 0.00),
('DP-SIM-PED-SIM-20240504-16-1', 'PED-SIM-20240504-16', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240505-22-0', 'PED-SIM-20240505-22', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20240505-22-1', 'PED-SIM-20240505-22', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20240505-22-2', 'PED-SIM-20240505-22', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20240506-11-0', 'PED-SIM-20240506-11', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20240506-11-1', 'PED-SIM-20240506-11', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20240506-8-0', 'PED-SIM-20240506-8', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20240506-8-1', 'PED-SIM-20240506-8', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20240507-17-0', 'PED-SIM-20240507-17', 'IND007', 1, 0.00),
('DP-SIM-PED-SIM-20240507-17-1', 'PED-SIM-20240507-17', 'IND002', 5, 0.00),
('DP-SIM-PED-SIM-20240507-17-2', 'PED-SIM-20240507-17', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20240510-5-0', 'PED-SIM-20240510-5', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20240510-5-1', 'PED-SIM-20240510-5', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20240510-5-2', 'PED-SIM-20240510-5', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20240512-21-0', 'PED-SIM-20240512-21', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20240512-21-1', 'PED-SIM-20240512-21', 'IND037', 4, 0.00),
('DP-SIM-PED-SIM-20240513-19-0', 'PED-SIM-20240513-19', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20240514-13-0', 'PED-SIM-20240514-13', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20240514-13-1', 'PED-SIM-20240514-13', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20240514-13-2', 'PED-SIM-20240514-13', 'IND023', 3, 0.00),
('DP-SIM-PED-SIM-20240515-23-0', 'PED-SIM-20240515-23', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20240515-23-1', 'PED-SIM-20240515-23', 'IND038', 3, 0.00),
('DP-SIM-PED-SIM-20240515-3-0', 'PED-SIM-20240515-3', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20240518-0-0', 'PED-SIM-20240518-0', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20240519-1-0', 'PED-SIM-20240519-1', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20240519-1-1', 'PED-SIM-20240519-1', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20240519-18-0', 'PED-SIM-20240519-18', 'IND032', 3, 0.00),
('DP-SIM-PED-SIM-20240519-18-1', 'PED-SIM-20240519-18', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20240519-18-2', 'PED-SIM-20240519-18', 'IND022', 5, 0.00),
('DP-SIM-PED-SIM-20240521-10-0', 'PED-SIM-20240521-10', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20240523-20-0', 'PED-SIM-20240523-20', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20240523-20-1', 'PED-SIM-20240523-20', 'IND020', 3, 0.00),
('DP-SIM-PED-SIM-20240523-20-2', 'PED-SIM-20240523-20', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240523-6-0', 'PED-SIM-20240523-6', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20240523-6-1', 'PED-SIM-20240523-6', 'IND005', 4, 0.00),
('DP-SIM-PED-SIM-20240524-4-0', 'PED-SIM-20240524-4', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20240524-4-1', 'PED-SIM-20240524-4', 'IND028', 3, 0.00),
('DP-SIM-PED-SIM-20240528-24-0', 'PED-SIM-20240528-24', 'IND030', 1, 0.00),
('DP-SIM-PED-SIM-20240601-19-0', 'PED-SIM-20240601-19', 'IND028', 4, 0.00),
('DP-SIM-PED-SIM-20240601-19-1', 'PED-SIM-20240601-19', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240601-19-2', 'PED-SIM-20240601-19', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20240602-20-0', 'PED-SIM-20240602-20', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20240602-20-1', 'PED-SIM-20240602-20', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20240602-20-2', 'PED-SIM-20240602-20', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20240610-22-0', 'PED-SIM-20240610-22', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20240611-21-0', 'PED-SIM-20240611-21', 'IND033', 5, 0.00),
('DP-SIM-PED-SIM-20240611-21-1', 'PED-SIM-20240611-21', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20240611-23-0', 'PED-SIM-20240611-23', 'IND032', 3, 0.00),
('DP-SIM-PED-SIM-20240611-23-1', 'PED-SIM-20240611-23', 'IND034', 5, 0.00),
('DP-SIM-PED-SIM-20240614-2-0', 'PED-SIM-20240614-2', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240614-2-1', 'PED-SIM-20240614-2', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20240616-12-0', 'PED-SIM-20240616-12', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20240616-12-1', 'PED-SIM-20240616-12', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20240616-5-0', 'PED-SIM-20240616-5', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240616-5-1', 'PED-SIM-20240616-5', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240617-18-0', 'PED-SIM-20240617-18', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20240617-18-1', 'PED-SIM-20240617-18', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240617-18-2', 'PED-SIM-20240617-18', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240618-16-0', 'PED-SIM-20240618-16', 'IND023', 2, 0.00),
('DP-SIM-PED-SIM-20240618-16-1', 'PED-SIM-20240618-16', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20240618-16-2', 'PED-SIM-20240618-16', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20240619-9-0', 'PED-SIM-20240619-9', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20240619-9-1', 'PED-SIM-20240619-9', 'IND022', 5, 0.00),
('DP-SIM-PED-SIM-20240619-9-2', 'PED-SIM-20240619-9', 'IND037', 5, 0.00),
('DP-SIM-PED-SIM-20240620-6-0', 'PED-SIM-20240620-6', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20240620-6-1', 'PED-SIM-20240620-6', 'IND020', 1, 0.00),
('DP-SIM-PED-SIM-20240620-6-2', 'PED-SIM-20240620-6', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240621-3-0', 'PED-SIM-20240621-3', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20240622-24-0', 'PED-SIM-20240622-24', 'IND031', 4, 0.00),
('DP-SIM-PED-SIM-20240622-24-1', 'PED-SIM-20240622-24', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20240622-24-2', 'PED-SIM-20240622-24', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240624-17-0', 'PED-SIM-20240624-17', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20240625-0-0', 'PED-SIM-20240625-0', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20240625-0-1', 'PED-SIM-20240625-0', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20240625-14-0', 'PED-SIM-20240625-14', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20240625-7-0', 'PED-SIM-20240625-7', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20240625-7-1', 'PED-SIM-20240625-7', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20240626-8-0', 'PED-SIM-20240626-8', 'IND038', 3, 0.00),
('DP-SIM-PED-SIM-20240626-8-1', 'PED-SIM-20240626-8', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20240626-8-2', 'PED-SIM-20240626-8', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20240627-1-0', 'PED-SIM-20240627-1', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240627-15-0', 'PED-SIM-20240627-15', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20240627-15-1', 'PED-SIM-20240627-15', 'IND015', 4, 0.00),
('DP-SIM-PED-SIM-20240627-15-2', 'PED-SIM-20240627-15', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20240627-4-0', 'PED-SIM-20240627-4', 'IND023', 2, 0.00),
('DP-SIM-PED-SIM-20240627-4-1', 'PED-SIM-20240627-4', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20240628-13-0', 'PED-SIM-20240628-13', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240628-13-1', 'PED-SIM-20240628-13', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20240629-11-0', 'PED-SIM-20240629-11', 'IND023', 3, 0.00),
('DP-SIM-PED-SIM-20240630-10-0', 'PED-SIM-20240630-10', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20240702-7-0', 'PED-SIM-20240702-7', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20240702-7-1', 'PED-SIM-20240702-7', 'IND008', 1, 0.00),
('DP-SIM-PED-SIM-20240702-7-2', 'PED-SIM-20240702-7', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20240703-8-0', 'PED-SIM-20240703-8', 'IND033', 5, 0.00),
('DP-SIM-PED-SIM-20240704-11-0', 'PED-SIM-20240704-11', 'IND024', 3, 0.00),
('DP-SIM-PED-SIM-20240704-20-0', 'PED-SIM-20240704-20', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20240704-21-0', 'PED-SIM-20240704-21', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20240704-21-1', 'PED-SIM-20240704-21', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240704-21-2', 'PED-SIM-20240704-21', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20240706-12-0', 'PED-SIM-20240706-12', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20240706-12-1', 'PED-SIM-20240706-12', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20240706-2-0', 'PED-SIM-20240706-2', 'IND016', 5, 0.00),
('DP-SIM-PED-SIM-20240706-2-1', 'PED-SIM-20240706-2', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20240706-2-2', 'PED-SIM-20240706-2', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240707-15-0', 'PED-SIM-20240707-15', 'IND020', 3, 0.00),
('DP-SIM-PED-SIM-20240707-15-1', 'PED-SIM-20240707-15', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20240707-3-0', 'PED-SIM-20240707-3', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20240707-3-1', 'PED-SIM-20240707-3', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20240707-3-2', 'PED-SIM-20240707-3', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240710-10-0', 'PED-SIM-20240710-10', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20240710-14-0', 'PED-SIM-20240710-14', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20240710-14-1', 'PED-SIM-20240710-14', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20240711-22-0', 'PED-SIM-20240711-22', 'IND017', 4, 0.00),
('DP-SIM-PED-SIM-20240711-22-1', 'PED-SIM-20240711-22', 'IND005', 4, 0.00),
('DP-SIM-PED-SIM-20240711-22-2', 'PED-SIM-20240711-22', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20240713-17-0', 'PED-SIM-20240713-17', 'IND030', 1, 0.00),
('DP-SIM-PED-SIM-20240713-17-1', 'PED-SIM-20240713-17', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20240713-17-2', 'PED-SIM-20240713-17', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20240714-5-0', 'PED-SIM-20240714-5', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20240714-5-1', 'PED-SIM-20240714-5', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20240714-5-2', 'PED-SIM-20240714-5', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240715-23-0', 'PED-SIM-20240715-23', 'IND034', 5, 0.00),
('DP-SIM-PED-SIM-20240715-23-1', 'PED-SIM-20240715-23', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20240715-23-2', 'PED-SIM-20240715-23', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20240718-4-0', 'PED-SIM-20240718-4', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20240719-24-0', 'PED-SIM-20240719-24', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20240719-24-1', 'PED-SIM-20240719-24', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20240723-18-0', 'PED-SIM-20240723-18', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20240723-18-1', 'PED-SIM-20240723-18', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20240723-18-2', 'PED-SIM-20240723-18', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20240723-9-0', 'PED-SIM-20240723-9', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20240723-9-1', 'PED-SIM-20240723-9', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20240723-9-2', 'PED-SIM-20240723-9', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20240724-13-0', 'PED-SIM-20240724-13', 'IND008', 2, 0.00),
('DP-SIM-PED-SIM-20240724-13-1', 'PED-SIM-20240724-13', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20240724-13-2', 'PED-SIM-20240724-13', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240725-1-0', 'PED-SIM-20240725-1', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20240725-1-1', 'PED-SIM-20240725-1', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20240727-6-0', 'PED-SIM-20240727-6', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20240727-6-1', 'PED-SIM-20240727-6', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20240728-0-0', 'PED-SIM-20240728-0', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20240731-16-0', 'PED-SIM-20240731-16', 'IND022', 4, 0.00),
('DP-SIM-PED-SIM-20240731-16-1', 'PED-SIM-20240731-16', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20240731-16-2', 'PED-SIM-20240731-16', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20240731-19-0', 'PED-SIM-20240731-19', 'IND016', 5, 0.00),
('DP-SIM-PED-SIM-20240731-19-1', 'PED-SIM-20240731-19', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20240801-17-0', 'PED-SIM-20240801-17', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20240803-18-0', 'PED-SIM-20240803-18', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20240803-7-0', 'PED-SIM-20240803-7', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20240804-10-0', 'PED-SIM-20240804-10', 'IND037', 1, 0.00),
('DP-SIM-PED-SIM-20240804-10-1', 'PED-SIM-20240804-10', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20240806-16-0', 'PED-SIM-20240806-16', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20240806-16-1', 'PED-SIM-20240806-16', 'IND038', 1, 0.00),
('DP-SIM-PED-SIM-20240807-2-0', 'PED-SIM-20240807-2', 'IND035', 1, 0.00),
('DP-SIM-PED-SIM-20240809-6-0', 'PED-SIM-20240809-6', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20240809-6-1', 'PED-SIM-20240809-6', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240810-1-0', 'PED-SIM-20240810-1', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20240810-1-1', 'PED-SIM-20240810-1', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20240810-1-2', 'PED-SIM-20240810-1', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20240810-19-0', 'PED-SIM-20240810-19', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20240811-5-0', 'PED-SIM-20240811-5', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20240811-8-0', 'PED-SIM-20240811-8', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20240811-8-1', 'PED-SIM-20240811-8', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20240815-11-0', 'PED-SIM-20240815-11', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240815-12-0', 'PED-SIM-20240815-12', 'IND018', 2, 0.00),
('DP-SIM-PED-SIM-20240815-24-0', 'PED-SIM-20240815-24', 'IND008', 4, 0.00),
('DP-SIM-PED-SIM-20240817-4-0', 'PED-SIM-20240817-4', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20240821-3-0', 'PED-SIM-20240821-3', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20240821-3-1', 'PED-SIM-20240821-3', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240821-3-2', 'PED-SIM-20240821-3', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20240822-21-0', 'PED-SIM-20240822-21', 'IND015', 3, 0.00),
('DP-SIM-PED-SIM-20240822-21-1', 'PED-SIM-20240822-21', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20240822-23-0', 'PED-SIM-20240822-23', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20240822-23-1', 'PED-SIM-20240822-23', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20240822-23-2', 'PED-SIM-20240822-23', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20240823-22-0', 'PED-SIM-20240823-22', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20240823-22-1', 'PED-SIM-20240823-22', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20240823-22-2', 'PED-SIM-20240823-22', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20240824-9-0', 'PED-SIM-20240824-9', 'IND004', 2, 0.00),
('DP-SIM-PED-SIM-20240824-9-1', 'PED-SIM-20240824-9', 'IND027', 1, 0.00),
('DP-SIM-PED-SIM-20240828-0-0', 'PED-SIM-20240828-0', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20240828-14-0', 'PED-SIM-20240828-14', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20240828-14-1', 'PED-SIM-20240828-14', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20240829-13-0', 'PED-SIM-20240829-13', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20240829-13-1', 'PED-SIM-20240829-13', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20240829-15-0', 'PED-SIM-20240829-15', 'IND036', 3, 0.00),
('DP-SIM-PED-SIM-20240829-15-1', 'PED-SIM-20240829-15', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240829-20-0', 'PED-SIM-20240829-20', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20240829-20-1', 'PED-SIM-20240829-20', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20240902-22-0', 'PED-SIM-20240902-22', 'IND002', 2, 0.00),
('DP-SIM-PED-SIM-20240902-22-1', 'PED-SIM-20240902-22', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20240902-22-2', 'PED-SIM-20240902-22', 'IND024', 3, 0.00),
('DP-SIM-PED-SIM-20240903-2-0', 'PED-SIM-20240903-2', 'IND016', 1, 0.00),
('DP-SIM-PED-SIM-20240903-2-1', 'PED-SIM-20240903-2', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20240903-2-2', 'PED-SIM-20240903-2', 'IND037', 4, 0.00),
('DP-SIM-PED-SIM-20240903-23-0', 'PED-SIM-20240903-23', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20240904-11-0', 'PED-SIM-20240904-11', 'IND020', 3, 0.00),
('DP-SIM-PED-SIM-20240904-6-0', 'PED-SIM-20240904-6', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20240904-6-1', 'PED-SIM-20240904-6', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20240904-6-2', 'PED-SIM-20240904-6', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20240905-17-0', 'PED-SIM-20240905-17', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20240905-17-1', 'PED-SIM-20240905-17', 'IND004', 1, 0.00),
('DP-SIM-PED-SIM-20240905-17-2', 'PED-SIM-20240905-17', 'IND008', 4, 0.00),
('DP-SIM-PED-SIM-20240906-4-0', 'PED-SIM-20240906-4', 'IND025', 1, 0.00),
('DP-SIM-PED-SIM-20240906-4-1', 'PED-SIM-20240906-4', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20240907-18-0', 'PED-SIM-20240907-18', 'IND002', 2, 0.00),
('DP-SIM-PED-SIM-20240907-18-1', 'PED-SIM-20240907-18', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20240908-1-0', 'PED-SIM-20240908-1', 'IND006', 4, 0.00),
('DP-SIM-PED-SIM-20240908-1-1', 'PED-SIM-20240908-1', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20240908-1-2', 'PED-SIM-20240908-1', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20240908-13-0', 'PED-SIM-20240908-13', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20240908-13-1', 'PED-SIM-20240908-13', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20240908-13-2', 'PED-SIM-20240908-13', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20240909-12-0', 'PED-SIM-20240909-12', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20240909-12-1', 'PED-SIM-20240909-12', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20240909-24-0', 'PED-SIM-20240909-24', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20240909-24-1', 'PED-SIM-20240909-24', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20240910-19-0', 'PED-SIM-20240910-19', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20240911-21-0', 'PED-SIM-20240911-21', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20240911-21-1', 'PED-SIM-20240911-21', 'IND032', 5, 0.00),
('DP-SIM-PED-SIM-20240911-21-2', 'PED-SIM-20240911-21', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20240912-16-0', 'PED-SIM-20240912-16', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20240912-7-0', 'PED-SIM-20240912-7', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20240912-7-1', 'PED-SIM-20240912-7', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20240914-8-0', 'PED-SIM-20240914-8', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20240914-8-1', 'PED-SIM-20240914-8', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20240914-8-2', 'PED-SIM-20240914-8', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20240915-15-0', 'PED-SIM-20240915-15', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20240915-15-1', 'PED-SIM-20240915-15', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20240916-10-0', 'PED-SIM-20240916-10', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20240916-10-1', 'PED-SIM-20240916-10', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20240916-10-2', 'PED-SIM-20240916-10', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20240916-14-0', 'PED-SIM-20240916-14', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20240916-14-1', 'PED-SIM-20240916-14', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240916-3-0', 'PED-SIM-20240916-3', 'IND025', 1, 0.00),
('DP-SIM-PED-SIM-20240916-3-1', 'PED-SIM-20240916-3', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20240916-3-2', 'PED-SIM-20240916-3', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20240920-5-0', 'PED-SIM-20240920-5', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20240923-20-0', 'PED-SIM-20240923-20', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20240923-20-1', 'PED-SIM-20240923-20', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20240923-20-2', 'PED-SIM-20240923-20', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20240925-9-0', 'PED-SIM-20240925-9', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20240925-9-1', 'PED-SIM-20240925-9', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20240930-0-0', 'PED-SIM-20240930-0', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20241001-7-0', 'PED-SIM-20241001-7', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20241002-3-0', 'PED-SIM-20241002-3', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20241002-4-0', 'PED-SIM-20241002-4', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20241002-4-1', 'PED-SIM-20241002-4', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20241002-4-2', 'PED-SIM-20241002-4', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20241005-16-0', 'PED-SIM-20241005-16', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20241005-16-1', 'PED-SIM-20241005-16', 'IND021', 1, 0.00),
('DP-SIM-PED-SIM-20241005-16-2', 'PED-SIM-20241005-16', 'IND004', 2, 0.00),
('DP-SIM-PED-SIM-20241005-18-0', 'PED-SIM-20241005-18', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20241005-18-1', 'PED-SIM-20241005-18', 'IND037', 1, 0.00),
('DP-SIM-PED-SIM-20241005-18-2', 'PED-SIM-20241005-18', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20241006-24-0', 'PED-SIM-20241006-24', 'IND020', 1, 0.00),
('DP-SIM-PED-SIM-20241006-24-1', 'PED-SIM-20241006-24', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20241009-1-0', 'PED-SIM-20241009-1', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20241009-19-0', 'PED-SIM-20241009-19', 'IND024', 4, 0.00),
('DP-SIM-PED-SIM-20241009-19-1', 'PED-SIM-20241009-19', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20241009-19-2', 'PED-SIM-20241009-19', 'IND016', 5, 0.00),
('DP-SIM-PED-SIM-20241012-0-0', 'PED-SIM-20241012-0', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20241012-0-1', 'PED-SIM-20241012-0', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20241012-0-2', 'PED-SIM-20241012-0', 'IND039', 3, 0.00),
('DP-SIM-PED-SIM-20241012-6-0', 'PED-SIM-20241012-6', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20241017-8-0', 'PED-SIM-20241017-8', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20241020-10-0', 'PED-SIM-20241020-10', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20241021-15-0', 'PED-SIM-20241021-15', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20241021-15-1', 'PED-SIM-20241021-15', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20241021-15-2', 'PED-SIM-20241021-15', 'IND002', 2, 0.00),
('DP-SIM-PED-SIM-20241022-14-0', 'PED-SIM-20241022-14', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20241022-14-1', 'PED-SIM-20241022-14', 'IND006', 5, 0.00),
('DP-SIM-PED-SIM-20241023-11-0', 'PED-SIM-20241023-11', 'IND015', 3, 0.00),
('DP-SIM-PED-SIM-20241023-11-1', 'PED-SIM-20241023-11', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20241024-2-0', 'PED-SIM-20241024-2', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20241024-2-1', 'PED-SIM-20241024-2', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20241024-2-2', 'PED-SIM-20241024-2', 'IND032', 3, 0.00),
('DP-SIM-PED-SIM-20241024-21-0', 'PED-SIM-20241024-21', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20241024-21-1', 'PED-SIM-20241024-21', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20241024-21-2', 'PED-SIM-20241024-21', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20241025-12-0', 'PED-SIM-20241025-12', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20241025-12-1', 'PED-SIM-20241025-12', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20241025-17-0', 'PED-SIM-20241025-17', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20241025-17-1', 'PED-SIM-20241025-17', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20241025-17-2', 'PED-SIM-20241025-17', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20241026-22-0', 'PED-SIM-20241026-22', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20241026-22-1', 'PED-SIM-20241026-22', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20241026-22-2', 'PED-SIM-20241026-22', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20241026-5-0', 'PED-SIM-20241026-5', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20241027-13-0', 'PED-SIM-20241027-13', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20241027-13-1', 'PED-SIM-20241027-13', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20241027-13-2', 'PED-SIM-20241027-13', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20241027-23-0', 'PED-SIM-20241027-23', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20241027-23-1', 'PED-SIM-20241027-23', 'IND030', 1, 0.00),
('DP-SIM-PED-SIM-20241030-20-0', 'PED-SIM-20241030-20', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20241030-20-1', 'PED-SIM-20241030-20', 'IND022', 1, 0.00),
('DP-SIM-PED-SIM-20241030-20-2', 'PED-SIM-20241030-20', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20241031-9-0', 'PED-SIM-20241031-9', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20241102-2-0', 'PED-SIM-20241102-2', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20241102-2-1', 'PED-SIM-20241102-2', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20241105-5-0', 'PED-SIM-20241105-5', 'IND035', 4, 0.00),
('DP-SIM-PED-SIM-20241105-5-1', 'PED-SIM-20241105-5', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20241105-5-2', 'PED-SIM-20241105-5', 'IND004', 1, 0.00),
('DP-SIM-PED-SIM-20241106-13-0', 'PED-SIM-20241106-13', 'IND032', 1, 0.00),
('DP-SIM-PED-SIM-20241106-13-1', 'PED-SIM-20241106-13', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20241109-10-0', 'PED-SIM-20241109-10', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20241109-10-1', 'PED-SIM-20241109-10', 'IND015', 3, 0.00),
('DP-SIM-PED-SIM-20241109-8-0', 'PED-SIM-20241109-8', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20241110-11-0', 'PED-SIM-20241110-11', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20241110-11-1', 'PED-SIM-20241110-11', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20241110-21-0', 'PED-SIM-20241110-21', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20241111-1-0', 'PED-SIM-20241111-1', 'IND016', 1, 0.00),
('DP-SIM-PED-SIM-20241111-17-0', 'PED-SIM-20241111-17', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20241116-15-0', 'PED-SIM-20241116-15', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20241116-15-1', 'PED-SIM-20241116-15', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20241116-16-0', 'PED-SIM-20241116-16', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20241116-20-0', 'PED-SIM-20241116-20', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20241116-20-1', 'PED-SIM-20241116-20', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20241116-20-2', 'PED-SIM-20241116-20', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20241118-22-0', 'PED-SIM-20241118-22', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20241120-3-0', 'PED-SIM-20241120-3', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20241120-3-1', 'PED-SIM-20241120-3', 'IND002', 3, 0.00),
('DP-SIM-PED-SIM-20241122-6-0', 'PED-SIM-20241122-6', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20241122-6-1', 'PED-SIM-20241122-6', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20241123-0-0', 'PED-SIM-20241123-0', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20241123-0-1', 'PED-SIM-20241123-0', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20241126-23-0', 'PED-SIM-20241126-23', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20241127-12-0', 'PED-SIM-20241127-12', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20241127-4-0', 'PED-SIM-20241127-4', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20241127-4-1', 'PED-SIM-20241127-4', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20241127-4-2', 'PED-SIM-20241127-4', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20241128-14-0', 'PED-SIM-20241128-14', 'IND036', 1, 0.00),
('DP-SIM-PED-SIM-20241128-14-1', 'PED-SIM-20241128-14', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20241128-18-0', 'PED-SIM-20241128-18', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20241128-18-1', 'PED-SIM-20241128-18', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20241128-19-0', 'PED-SIM-20241128-19', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20241128-19-1', 'PED-SIM-20241128-19', 'IND037', 5, 0.00),
('DP-SIM-PED-SIM-20241128-9-0', 'PED-SIM-20241128-9', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20241128-9-1', 'PED-SIM-20241128-9', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20241128-9-2', 'PED-SIM-20241128-9', 'IND022', 4, 0.00),
('DP-SIM-PED-SIM-20241129-24-0', 'PED-SIM-20241129-24', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20241129-24-1', 'PED-SIM-20241129-24', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20241130-7-0', 'PED-SIM-20241130-7', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20241130-7-1', 'PED-SIM-20241130-7', 'IND024', 4, 0.00),
('DP-SIM-PED-SIM-20241201-12-0', 'PED-SIM-20241201-12', 'IND018', 2, 0.00),
('DP-SIM-PED-SIM-20241201-15-0', 'PED-SIM-20241201-15', 'IND001', 4, 0.00),
('DP-SIM-PED-SIM-20241201-15-1', 'PED-SIM-20241201-15', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20241201-15-2', 'PED-SIM-20241201-15', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20241202-13-0', 'PED-SIM-20241202-13', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20241202-13-1', 'PED-SIM-20241202-13', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20241203-14-0', 'PED-SIM-20241203-14', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20241203-2-0', 'PED-SIM-20241203-2', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20241203-23-0', 'PED-SIM-20241203-23', 'IND007', 4, 0.00),
('DP-SIM-PED-SIM-20241203-23-1', 'PED-SIM-20241203-23', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20241203-23-2', 'PED-SIM-20241203-23', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20241207-10-0', 'PED-SIM-20241207-10', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20241208-20-0', 'PED-SIM-20241208-20', 'IND018', 2, 0.00),
('DP-SIM-PED-SIM-20241208-20-1', 'PED-SIM-20241208-20', 'IND006', 1, 0.00),
('DP-SIM-PED-SIM-20241208-20-2', 'PED-SIM-20241208-20', 'IND031', 4, 0.00),
('DP-SIM-PED-SIM-20241209-7-0', 'PED-SIM-20241209-7', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20241210-5-0', 'PED-SIM-20241210-5', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20241210-5-1', 'PED-SIM-20241210-5', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20241212-11-0', 'PED-SIM-20241212-11', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20241212-11-1', 'PED-SIM-20241212-11', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20241213-1-0', 'PED-SIM-20241213-1', 'IND028', 4, 0.00),
('DP-SIM-PED-SIM-20241213-19-0', 'PED-SIM-20241213-19', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20241213-19-1', 'PED-SIM-20241213-19', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20241214-4-0', 'PED-SIM-20241214-4', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20241214-4-1', 'PED-SIM-20241214-4', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20241217-24-0', 'PED-SIM-20241217-24', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20241217-24-1', 'PED-SIM-20241217-24', 'IND016', 5, 0.00),
('DP-SIM-PED-SIM-20241217-6-0', 'PED-SIM-20241217-6', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20241217-6-1', 'PED-SIM-20241217-6', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20241217-6-2', 'PED-SIM-20241217-6', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20241218-22-0', 'PED-SIM-20241218-22', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20241218-22-1', 'PED-SIM-20241218-22', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20241219-0-0', 'PED-SIM-20241219-0', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20241219-0-1', 'PED-SIM-20241219-0', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20241219-0-2', 'PED-SIM-20241219-0', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20241223-9-0', 'PED-SIM-20241223-9', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20241225-21-0', 'PED-SIM-20241225-21', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20241226-8-0', 'PED-SIM-20241226-8', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20241226-8-1', 'PED-SIM-20241226-8', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20241226-8-2', 'PED-SIM-20241226-8', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20241228-17-0', 'PED-SIM-20241228-17', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20241230-16-0', 'PED-SIM-20241230-16', 'IND002', 3, 0.00),
('DP-SIM-PED-SIM-20241230-16-1', 'PED-SIM-20241230-16', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20241230-16-2', 'PED-SIM-20241230-16', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20241230-18-0', 'PED-SIM-20241230-18', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20241230-18-1', 'PED-SIM-20241230-18', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20241230-18-2', 'PED-SIM-20241230-18', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20241230-3-0', 'PED-SIM-20241230-3', 'IND038', 4, 0.00),
('DP-SIM-PED-SIM-20250101-14-0', 'PED-SIM-20250101-14', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20250101-14-1', 'PED-SIM-20250101-14', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20250101-15-0', 'PED-SIM-20250101-15', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20250101-15-1', 'PED-SIM-20250101-15', 'IND038', 1, 0.00),
('DP-SIM-PED-SIM-20250101-15-2', 'PED-SIM-20250101-15', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20250101-24-0', 'PED-SIM-20250101-24', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20250101-9-0', 'PED-SIM-20250101-9', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20250101-9-1', 'PED-SIM-20250101-9', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20250101-9-2', 'PED-SIM-20250101-9', 'IND036', 5, 0.00),
('DP-SIM-PED-SIM-20250102-4-0', 'PED-SIM-20250102-4', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20250102-4-1', 'PED-SIM-20250102-4', 'IND037', 3, 0.00),
('DP-SIM-PED-SIM-20250102-4-2', 'PED-SIM-20250102-4', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20250102-6-0', 'PED-SIM-20250102-6', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20250102-6-1', 'PED-SIM-20250102-6', 'IND023', 3, 0.00),
('DP-SIM-PED-SIM-20250102-6-2', 'PED-SIM-20250102-6', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20250104-19-0', 'PED-SIM-20250104-19', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20250104-19-1', 'PED-SIM-20250104-19', 'IND023', 3, 0.00),
('DP-SIM-PED-SIM-20250106-7-0', 'PED-SIM-20250106-7', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20250106-7-1', 'PED-SIM-20250106-7', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20250108-18-0', 'PED-SIM-20250108-18', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20250108-18-1', 'PED-SIM-20250108-18', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20250108-18-2', 'PED-SIM-20250108-18', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20250110-10-0', 'PED-SIM-20250110-10', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20250110-10-1', 'PED-SIM-20250110-10', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20250111-23-0', 'PED-SIM-20250111-23', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20250111-23-1', 'PED-SIM-20250111-23', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20250112-17-0', 'PED-SIM-20250112-17', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250112-17-1', 'PED-SIM-20250112-17', 'IND028', 2, 0.00);
INSERT INTO `detallepedido` (`idDetallePedido`, `numeroPedido`, `codigoIndumentaria`, `cantidad`, `descuentoItem`) VALUES
('DP-SIM-PED-SIM-20250112-17-2', 'PED-SIM-20250112-17', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20250112-8-0', 'PED-SIM-20250112-8', 'IND030', 1, 0.00),
('DP-SIM-PED-SIM-20250119-2-0', 'PED-SIM-20250119-2', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20250119-2-1', 'PED-SIM-20250119-2', 'IND008', 2, 0.00),
('DP-SIM-PED-SIM-20250119-21-0', 'PED-SIM-20250119-21', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250121-11-0', 'PED-SIM-20250121-11', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20250121-11-1', 'PED-SIM-20250121-11', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20250121-11-2', 'PED-SIM-20250121-11', 'IND027', 1, 0.00),
('DP-SIM-PED-SIM-20250122-22-0', 'PED-SIM-20250122-22', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20250122-22-1', 'PED-SIM-20250122-22', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20250122-3-0', 'PED-SIM-20250122-3', 'IND006', 4, 0.00),
('DP-SIM-PED-SIM-20250123-12-0', 'PED-SIM-20250123-12', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20250123-5-0', 'PED-SIM-20250123-5', 'IND038', 1, 0.00),
('DP-SIM-PED-SIM-20250123-5-1', 'PED-SIM-20250123-5', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20250123-5-2', 'PED-SIM-20250123-5', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250125-16-0', 'PED-SIM-20250125-16', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20250128-0-0', 'PED-SIM-20250128-0', 'IND006', 4, 0.00),
('DP-SIM-PED-SIM-20250128-13-0', 'PED-SIM-20250128-13', 'IND028', 3, 0.00),
('DP-SIM-PED-SIM-20250128-13-1', 'PED-SIM-20250128-13', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250128-13-2', 'PED-SIM-20250128-13', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20250131-1-0', 'PED-SIM-20250131-1', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20250131-1-1', 'PED-SIM-20250131-1', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20250131-20-0', 'PED-SIM-20250131-20', 'IND037', 1, 0.00),
('DP-SIM-PED-SIM-20250201-11-0', 'PED-SIM-20250201-11', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250201-11-1', 'PED-SIM-20250201-11', 'IND002', 3, 0.00),
('DP-SIM-PED-SIM-20250201-11-2', 'PED-SIM-20250201-11', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20250202-14-0', 'PED-SIM-20250202-14', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20250202-14-1', 'PED-SIM-20250202-14', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20250204-19-0', 'PED-SIM-20250204-19', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20250204-19-1', 'PED-SIM-20250204-19', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20250205-13-0', 'PED-SIM-20250205-13', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20250205-13-1', 'PED-SIM-20250205-13', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250206-2-0', 'PED-SIM-20250206-2', 'IND035', 4, 0.00),
('DP-SIM-PED-SIM-20250206-2-1', 'PED-SIM-20250206-2', 'IND038', 4, 0.00),
('DP-SIM-PED-SIM-20250206-2-2', 'PED-SIM-20250206-2', 'IND026', 5, 0.00),
('DP-SIM-PED-SIM-20250209-0-0', 'PED-SIM-20250209-0', 'IND032', 3, 0.00),
('DP-SIM-PED-SIM-20250209-0-1', 'PED-SIM-20250209-0', 'IND018', 2, 0.00),
('DP-SIM-PED-SIM-20250209-1-0', 'PED-SIM-20250209-1', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20250209-22-0', 'PED-SIM-20250209-22', 'IND029', 4, 0.00),
('DP-SIM-PED-SIM-20250209-22-1', 'PED-SIM-20250209-22', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20250210-10-0', 'PED-SIM-20250210-10', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20250210-10-1', 'PED-SIM-20250210-10', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20250210-10-2', 'PED-SIM-20250210-10', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250212-9-0', 'PED-SIM-20250212-9', 'IND016', 2, 0.00),
('DP-SIM-PED-SIM-20250212-9-1', 'PED-SIM-20250212-9', 'IND037', 3, 0.00),
('DP-SIM-PED-SIM-20250212-9-2', 'PED-SIM-20250212-9', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20250213-12-0', 'PED-SIM-20250213-12', 'IND035', 4, 0.00),
('DP-SIM-PED-SIM-20250213-12-1', 'PED-SIM-20250213-12', 'IND008', 4, 0.00),
('DP-SIM-PED-SIM-20250213-20-0', 'PED-SIM-20250213-20', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20250213-20-1', 'PED-SIM-20250213-20', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20250213-20-2', 'PED-SIM-20250213-20', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20250213-21-0', 'PED-SIM-20250213-21', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250213-21-1', 'PED-SIM-20250213-21', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20250213-7-0', 'PED-SIM-20250213-7', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250214-18-0', 'PED-SIM-20250214-18', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20250214-18-1', 'PED-SIM-20250214-18', 'IND037', 3, 0.00),
('DP-SIM-PED-SIM-20250215-16-0', 'PED-SIM-20250215-16', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20250215-16-1', 'PED-SIM-20250215-16', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20250215-16-2', 'PED-SIM-20250215-16', 'IND007', 4, 0.00),
('DP-SIM-PED-SIM-20250217-8-0', 'PED-SIM-20250217-8', 'IND009', 4, 0.00),
('DP-SIM-PED-SIM-20250217-8-1', 'PED-SIM-20250217-8', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20250220-23-0', 'PED-SIM-20250220-23', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250220-23-1', 'PED-SIM-20250220-23', 'IND033', 1, 0.00),
('DP-SIM-PED-SIM-20250220-23-2', 'PED-SIM-20250220-23', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20250222-3-0', 'PED-SIM-20250222-3', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20250222-3-1', 'PED-SIM-20250222-3', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20250222-3-2', 'PED-SIM-20250222-3', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20250222-5-0', 'PED-SIM-20250222-5', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250225-24-0', 'PED-SIM-20250225-24', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20250226-4-0', 'PED-SIM-20250226-4', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20250227-15-0', 'PED-SIM-20250227-15', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20250227-15-1', 'PED-SIM-20250227-15', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20250227-15-2', 'PED-SIM-20250227-15', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250227-17-0', 'PED-SIM-20250227-17', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20250227-17-1', 'PED-SIM-20250227-17', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20250227-6-0', 'PED-SIM-20250227-6', 'IND030', 1, 0.00),
('DP-SIM-PED-SIM-20250227-6-1', 'PED-SIM-20250227-6', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20250227-6-2', 'PED-SIM-20250227-6', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20250304-17-0', 'PED-SIM-20250304-17', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20250306-23-0', 'PED-SIM-20250306-23', 'IND021', 1, 0.00),
('DP-SIM-PED-SIM-20250306-23-1', 'PED-SIM-20250306-23', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20250306-23-2', 'PED-SIM-20250306-23', 'IND015', 4, 0.00),
('DP-SIM-PED-SIM-20250306-6-0', 'PED-SIM-20250306-6', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20250306-6-1', 'PED-SIM-20250306-6', 'IND015', 1, 0.00),
('DP-SIM-PED-SIM-20250306-6-2', 'PED-SIM-20250306-6', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20250307-0-0', 'PED-SIM-20250307-0', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20250307-0-1', 'PED-SIM-20250307-0', 'IND032', 3, 0.00),
('DP-SIM-PED-SIM-20250307-0-2', 'PED-SIM-20250307-0', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20250309-1-0', 'PED-SIM-20250309-1', 'IND006', 5, 0.00),
('DP-SIM-PED-SIM-20250309-1-1', 'PED-SIM-20250309-1', 'IND008', 2, 0.00),
('DP-SIM-PED-SIM-20250309-1-2', 'PED-SIM-20250309-1', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20250309-13-0', 'PED-SIM-20250309-13', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20250309-13-1', 'PED-SIM-20250309-13', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20250309-9-0', 'PED-SIM-20250309-9', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20250309-9-1', 'PED-SIM-20250309-9', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20250310-11-0', 'PED-SIM-20250310-11', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20250310-11-1', 'PED-SIM-20250310-11', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20250310-11-2', 'PED-SIM-20250310-11', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20250311-7-0', 'PED-SIM-20250311-7', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20250311-7-1', 'PED-SIM-20250311-7', 'IND024', 3, 0.00),
('DP-SIM-PED-SIM-20250312-20-0', 'PED-SIM-20250312-20', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20250312-20-1', 'PED-SIM-20250312-20', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250312-8-0', 'PED-SIM-20250312-8', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20250313-2-0', 'PED-SIM-20250313-2', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20250313-2-1', 'PED-SIM-20250313-2', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20250313-2-2', 'PED-SIM-20250313-2', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20250315-10-0', 'PED-SIM-20250315-10', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20250315-10-1', 'PED-SIM-20250315-10', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20250315-10-2', 'PED-SIM-20250315-10', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20250315-21-0', 'PED-SIM-20250315-21', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20250315-21-1', 'PED-SIM-20250315-21', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250317-12-0', 'PED-SIM-20250317-12', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20250317-12-1', 'PED-SIM-20250317-12', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20250317-22-0', 'PED-SIM-20250317-22', 'IND018', 1, 0.00),
('DP-SIM-PED-SIM-20250317-4-0', 'PED-SIM-20250317-4', 'IND016', 2, 0.00),
('DP-SIM-PED-SIM-20250318-16-0', 'PED-SIM-20250318-16', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20250320-18-0', 'PED-SIM-20250320-18', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20250320-18-1', 'PED-SIM-20250320-18', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20250323-14-0', 'PED-SIM-20250323-14', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20250325-19-0', 'PED-SIM-20250325-19', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20250325-19-1', 'PED-SIM-20250325-19', 'IND004', 5, 0.00),
('DP-SIM-PED-SIM-20250325-5-0', 'PED-SIM-20250325-5', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20250328-3-0', 'PED-SIM-20250328-3', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250328-3-1', 'PED-SIM-20250328-3', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20250328-3-2', 'PED-SIM-20250328-3', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20250329-15-0', 'PED-SIM-20250329-15', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20250329-15-1', 'PED-SIM-20250329-15', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20250329-15-2', 'PED-SIM-20250329-15', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20250329-24-0', 'PED-SIM-20250329-24', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20250403-13-0', 'PED-SIM-20250403-13', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20250403-13-1', 'PED-SIM-20250403-13', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20250403-13-2', 'PED-SIM-20250403-13', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20250403-6-0', 'PED-SIM-20250403-6', 'IND020', 5, 0.00),
('DP-SIM-PED-SIM-20250403-6-1', 'PED-SIM-20250403-6', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20250406-2-0', 'PED-SIM-20250406-2', 'IND005', 4, 0.00),
('DP-SIM-PED-SIM-20250406-2-1', 'PED-SIM-20250406-2', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20250406-2-2', 'PED-SIM-20250406-2', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20250407-12-0', 'PED-SIM-20250407-12', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20250407-12-1', 'PED-SIM-20250407-12', 'IND019', 3, 0.00),
('DP-SIM-PED-SIM-20250408-17-0', 'PED-SIM-20250408-17', 'IND024', 5, 0.00),
('DP-SIM-PED-SIM-20250408-17-1', 'PED-SIM-20250408-17', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20250408-17-2', 'PED-SIM-20250408-17', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20250408-21-0', 'PED-SIM-20250408-21', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20250408-4-0', 'PED-SIM-20250408-4', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20250408-4-1', 'PED-SIM-20250408-4', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20250408-4-2', 'PED-SIM-20250408-4', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20250409-20-0', 'PED-SIM-20250409-20', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20250409-23-0', 'PED-SIM-20250409-23', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20250411-22-0', 'PED-SIM-20250411-22', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20250411-22-1', 'PED-SIM-20250411-22', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20250411-9-0', 'PED-SIM-20250411-9', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20250411-9-1', 'PED-SIM-20250411-9', 'IND016', 3, 0.00),
('DP-SIM-PED-SIM-20250412-16-0', 'PED-SIM-20250412-16', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20250412-5-0', 'PED-SIM-20250412-5', 'IND006', 5, 0.00),
('DP-SIM-PED-SIM-20250412-5-1', 'PED-SIM-20250412-5', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20250413-24-0', 'PED-SIM-20250413-24', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20250413-24-1', 'PED-SIM-20250413-24', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20250413-7-0', 'PED-SIM-20250413-7', 'IND036', 1, 0.00),
('DP-SIM-PED-SIM-20250414-3-0', 'PED-SIM-20250414-3', 'IND008', 1, 0.00),
('DP-SIM-PED-SIM-20250415-1-0', 'PED-SIM-20250415-1', 'IND035', 2, 0.00),
('DP-SIM-PED-SIM-20250415-1-1', 'PED-SIM-20250415-1', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20250415-1-2', 'PED-SIM-20250415-1', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20250417-10-0', 'PED-SIM-20250417-10', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20250417-10-1', 'PED-SIM-20250417-10', 'IND022', 2, 0.00),
('DP-SIM-PED-SIM-20250419-14-0', 'PED-SIM-20250419-14', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20250420-0-0', 'PED-SIM-20250420-0', 'IND039', 3, 0.00),
('DP-SIM-PED-SIM-20250420-0-1', 'PED-SIM-20250420-0', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20250420-0-2', 'PED-SIM-20250420-0', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20250422-18-0', 'PED-SIM-20250422-18', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20250422-18-1', 'PED-SIM-20250422-18', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20250422-18-2', 'PED-SIM-20250422-18', 'IND031', 1, 0.00),
('DP-SIM-PED-SIM-20250423-15-0', 'PED-SIM-20250423-15', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250423-15-1', 'PED-SIM-20250423-15', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20250426-19-0', 'PED-SIM-20250426-19', 'IND018', 1, 0.00),
('DP-SIM-PED-SIM-20250426-19-1', 'PED-SIM-20250426-19', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20250427-8-0', 'PED-SIM-20250427-8', 'IND034', 5, 0.00),
('DP-SIM-PED-SIM-20250429-11-0', 'PED-SIM-20250429-11', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20250501-5-0', 'PED-SIM-20250501-5', 'IND004', 1, 0.00),
('DP-SIM-PED-SIM-20250502-19-0', 'PED-SIM-20250502-19', 'IND002', 3, 0.00),
('DP-SIM-PED-SIM-20250502-19-1', 'PED-SIM-20250502-19', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250502-7-0', 'PED-SIM-20250502-7', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20250503-18-0', 'PED-SIM-20250503-18', 'IND015', 1, 0.00),
('DP-SIM-PED-SIM-20250503-23-0', 'PED-SIM-20250503-23', 'IND018', 4, 0.00),
('DP-SIM-PED-SIM-20250503-23-1', 'PED-SIM-20250503-23', 'IND026', 5, 0.00),
('DP-SIM-PED-SIM-20250503-23-2', 'PED-SIM-20250503-23', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20250504-3-0', 'PED-SIM-20250504-3', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250506-0-0', 'PED-SIM-20250506-0', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20250507-15-0', 'PED-SIM-20250507-15', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20250508-10-0', 'PED-SIM-20250508-10', 'IND003', 2, 0.00),
('DP-SIM-PED-SIM-20250509-20-0', 'PED-SIM-20250509-20', 'IND003', 1, 0.00),
('DP-SIM-PED-SIM-20250509-6-0', 'PED-SIM-20250509-6', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20250513-12-0', 'PED-SIM-20250513-12', 'IND001', 4, 0.00),
('DP-SIM-PED-SIM-20250513-12-1', 'PED-SIM-20250513-12', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250513-12-2', 'PED-SIM-20250513-12', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20250517-24-0', 'PED-SIM-20250517-24', 'IND026', 5, 0.00),
('DP-SIM-PED-SIM-20250517-24-1', 'PED-SIM-20250517-24', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20250519-14-0', 'PED-SIM-20250519-14', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20250519-14-1', 'PED-SIM-20250519-14', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20250519-16-0', 'PED-SIM-20250519-16', 'IND001', 4, 0.00),
('DP-SIM-PED-SIM-20250519-16-1', 'PED-SIM-20250519-16', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20250519-16-2', 'PED-SIM-20250519-16', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20250520-1-0', 'PED-SIM-20250520-1', 'IND002', 5, 0.00),
('DP-SIM-PED-SIM-20250520-1-1', 'PED-SIM-20250520-1', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20250520-1-2', 'PED-SIM-20250520-1', 'IND037', 1, 0.00),
('DP-SIM-PED-SIM-20250520-17-0', 'PED-SIM-20250520-17', 'IND035', 1, 0.00),
('DP-SIM-PED-SIM-20250523-13-0', 'PED-SIM-20250523-13', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250523-13-1', 'PED-SIM-20250523-13', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20250526-2-0', 'PED-SIM-20250526-2', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20250526-2-1', 'PED-SIM-20250526-2', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20250526-2-2', 'PED-SIM-20250526-2', 'IND019', 3, 0.00),
('DP-SIM-PED-SIM-20250527-11-0', 'PED-SIM-20250527-11', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20250527-11-1', 'PED-SIM-20250527-11', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20250527-8-0', 'PED-SIM-20250527-8', 'IND036', 2, 0.00),
('DP-SIM-PED-SIM-20250527-8-1', 'PED-SIM-20250527-8', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20250528-22-0', 'PED-SIM-20250528-22', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250528-22-1', 'PED-SIM-20250528-22', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20250528-4-0', 'PED-SIM-20250528-4', 'IND022', 1, 0.00),
('DP-SIM-PED-SIM-20250528-4-1', 'PED-SIM-20250528-4', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20250529-21-0', 'PED-SIM-20250529-21', 'IND015', 4, 0.00),
('DP-SIM-PED-SIM-20250530-9-0', 'PED-SIM-20250530-9', 'IND035', 5, 0.00),
('DP-SIM-PED-SIM-20250530-9-1', 'PED-SIM-20250530-9', 'IND039', 1, 0.00),
('DP-SIM-PED-SIM-20250530-9-2', 'PED-SIM-20250530-9', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20250603-13-0', 'PED-SIM-20250603-13', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20250603-13-1', 'PED-SIM-20250603-13', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20250604-10-0', 'PED-SIM-20250604-10', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20250604-10-1', 'PED-SIM-20250604-10', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20250604-10-2', 'PED-SIM-20250604-10', 'IND035', 1, 0.00),
('DP-SIM-PED-SIM-20250605-18-0', 'PED-SIM-20250605-18', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250605-18-1', 'PED-SIM-20250605-18', 'IND028', 2, 0.00),
('DP-SIM-PED-SIM-20250607-16-0', 'PED-SIM-20250607-16', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20250607-16-1', 'PED-SIM-20250607-16', 'IND016', 1, 0.00),
('DP-SIM-PED-SIM-20250607-16-2', 'PED-SIM-20250607-16', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20250608-11-0', 'PED-SIM-20250608-11', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250608-11-1', 'PED-SIM-20250608-11', 'IND023', 4, 0.00),
('DP-SIM-PED-SIM-20250608-15-0', 'PED-SIM-20250608-15', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20250608-15-1', 'PED-SIM-20250608-15', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20250608-15-2', 'PED-SIM-20250608-15', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20250609-12-0', 'PED-SIM-20250609-12', 'IND005', 4, 0.00),
('DP-SIM-PED-SIM-20250609-12-1', 'PED-SIM-20250609-12', 'IND026', 2, 0.00),
('DP-SIM-PED-SIM-20250609-12-2', 'PED-SIM-20250609-12', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20250609-2-0', 'PED-SIM-20250609-2', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20250609-2-1', 'PED-SIM-20250609-2', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20250609-2-2', 'PED-SIM-20250609-2', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20250610-8-0', 'PED-SIM-20250610-8', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20250610-8-1', 'PED-SIM-20250610-8', 'IND037', 5, 0.00),
('DP-SIM-PED-SIM-20250612-23-0', 'PED-SIM-20250612-23', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20250612-23-1', 'PED-SIM-20250612-23', 'IND006', 2, 0.00),
('DP-SIM-PED-SIM-20250614-19-0', 'PED-SIM-20250614-19', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20250614-19-1', 'PED-SIM-20250614-19', 'IND024', 4, 0.00),
('DP-SIM-PED-SIM-20250614-5-0', 'PED-SIM-20250614-5', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20250614-5-1', 'PED-SIM-20250614-5', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20250614-5-2', 'PED-SIM-20250614-5', 'IND026', 4, 0.00),
('DP-SIM-PED-SIM-20250614-9-0', 'PED-SIM-20250614-9', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20250614-9-1', 'PED-SIM-20250614-9', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20250614-9-2', 'PED-SIM-20250614-9', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20250617-6-0', 'PED-SIM-20250617-6', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20250618-22-0', 'PED-SIM-20250618-22', 'IND023', 2, 0.00),
('DP-SIM-PED-SIM-20250618-22-1', 'PED-SIM-20250618-22', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250618-22-2', 'PED-SIM-20250618-22', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250620-24-0', 'PED-SIM-20250620-24', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20250620-24-1', 'PED-SIM-20250620-24', 'IND025', 1, 0.00),
('DP-SIM-PED-SIM-20250620-24-2', 'PED-SIM-20250620-24', 'IND020', 1, 0.00),
('DP-SIM-PED-SIM-20250621-21-0', 'PED-SIM-20250621-21', 'IND007', 1, 0.00),
('DP-SIM-PED-SIM-20250622-20-0', 'PED-SIM-20250622-20', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20250622-20-1', 'PED-SIM-20250622-20', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20250622-3-0', 'PED-SIM-20250622-3', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250623-1-0', 'PED-SIM-20250623-1', 'IND024', 3, 0.00),
('DP-SIM-PED-SIM-20250623-1-1', 'PED-SIM-20250623-1', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20250623-7-0', 'PED-SIM-20250623-7', 'IND006', 3, 0.00),
('DP-SIM-PED-SIM-20250623-7-1', 'PED-SIM-20250623-7', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20250624-14-0', 'PED-SIM-20250624-14', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20250624-14-1', 'PED-SIM-20250624-14', 'IND001', 2, 0.00),
('DP-SIM-PED-SIM-20250624-17-0', 'PED-SIM-20250624-17', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20250626-4-0', 'PED-SIM-20250626-4', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20250626-4-1', 'PED-SIM-20250626-4', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250626-4-2', 'PED-SIM-20250626-4', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20250629-0-0', 'PED-SIM-20250629-0', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20250629-0-1', 'PED-SIM-20250629-0', 'IND028', 4, 0.00),
('DP-SIM-PED-SIM-20250629-0-2', 'PED-SIM-20250629-0', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250701-8-0', 'PED-SIM-20250701-8', 'IND022', 3, 0.00),
('DP-SIM-PED-SIM-20250701-8-1', 'PED-SIM-20250701-8', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20250702-4-0', 'PED-SIM-20250702-4', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250702-4-1', 'PED-SIM-20250702-4', 'IND038', 5, 0.00),
('DP-SIM-PED-SIM-20250702-4-2', 'PED-SIM-20250702-4', 'IND036', 4, 0.00),
('DP-SIM-PED-SIM-20250702-6-0', 'PED-SIM-20250702-6', 'IND007', 4, 0.00),
('DP-SIM-PED-SIM-20250702-6-1', 'PED-SIM-20250702-6', 'IND006', 4, 0.00),
('DP-SIM-PED-SIM-20250703-11-0', 'PED-SIM-20250703-11', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250703-11-1', 'PED-SIM-20250703-11', 'IND017', 2, 0.00),
('DP-SIM-PED-SIM-20250703-11-2', 'PED-SIM-20250703-11', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20250705-24-0', 'PED-SIM-20250705-24', 'IND035', 4, 0.00),
('DP-SIM-PED-SIM-20250705-24-1', 'PED-SIM-20250705-24', 'IND031', 5, 0.00),
('DP-SIM-PED-SIM-20250705-24-2', 'PED-SIM-20250705-24', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20250708-20-0', 'PED-SIM-20250708-20', 'IND002', 4, 0.00),
('DP-SIM-PED-SIM-20250708-20-1', 'PED-SIM-20250708-20', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20250709-21-0', 'PED-SIM-20250709-21', 'IND019', 1, 0.00),
('DP-SIM-PED-SIM-20250711-12-0', 'PED-SIM-20250711-12', 'IND038', 3, 0.00),
('DP-SIM-PED-SIM-20250711-16-0', 'PED-SIM-20250711-16', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20250711-16-1', 'PED-SIM-20250711-16', 'IND038', 1, 0.00),
('DP-SIM-PED-SIM-20250711-16-2', 'PED-SIM-20250711-16', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250712-15-0', 'PED-SIM-20250712-15', 'IND039', 3, 0.00),
('DP-SIM-PED-SIM-20250712-15-1', 'PED-SIM-20250712-15', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20250712-15-2', 'PED-SIM-20250712-15', 'IND034', 2, 0.00),
('DP-SIM-PED-SIM-20250713-23-0', 'PED-SIM-20250713-23', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20250713-23-1', 'PED-SIM-20250713-23', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250713-23-2', 'PED-SIM-20250713-23', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20250714-10-0', 'PED-SIM-20250714-10', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20250715-13-0', 'PED-SIM-20250715-13', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250715-5-0', 'PED-SIM-20250715-5', 'IND038', 1, 0.00),
('DP-SIM-PED-SIM-20250715-5-1', 'PED-SIM-20250715-5', 'IND033', 4, 0.00),
('DP-SIM-PED-SIM-20250717-18-0', 'PED-SIM-20250717-18', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20250717-18-1', 'PED-SIM-20250717-18', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20250717-18-2', 'PED-SIM-20250717-18', 'IND024', 4, 0.00),
('DP-SIM-PED-SIM-20250718-7-0', 'PED-SIM-20250718-7', 'IND025', 5, 0.00),
('DP-SIM-PED-SIM-20250719-1-0', 'PED-SIM-20250719-1', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20250722-9-0', 'PED-SIM-20250722-9', 'IND038', 2, 0.00),
('DP-SIM-PED-SIM-20250722-9-1', 'PED-SIM-20250722-9', 'IND025', 1, 0.00),
('DP-SIM-PED-SIM-20250725-19-0', 'PED-SIM-20250725-19', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20250725-19-1', 'PED-SIM-20250725-19', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20250725-19-2', 'PED-SIM-20250725-19', 'IND003', 5, 0.00),
('DP-SIM-PED-SIM-20250728-14-0', 'PED-SIM-20250728-14', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20250728-14-1', 'PED-SIM-20250728-14', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20250728-14-2', 'PED-SIM-20250728-14', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20250728-17-0', 'PED-SIM-20250728-17', 'IND002', 5, 0.00),
('DP-SIM-PED-SIM-20250728-3-0', 'PED-SIM-20250728-3', 'IND018', 1, 0.00),
('DP-SIM-PED-SIM-20250728-3-1', 'PED-SIM-20250728-3', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20250728-3-2', 'PED-SIM-20250728-3', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20250729-2-0', 'PED-SIM-20250729-2', 'IND033', 5, 0.00),
('DP-SIM-PED-SIM-20250729-22-0', 'PED-SIM-20250729-22', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250729-22-1', 'PED-SIM-20250729-22', 'IND037', 5, 0.00),
('DP-SIM-PED-SIM-20250729-22-2', 'PED-SIM-20250729-22', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20250730-0-0', 'PED-SIM-20250730-0', 'IND003', 1, 0.00),
('DP-SIM-PED-SIM-20250730-0-1', 'PED-SIM-20250730-0', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20250802-15-0', 'PED-SIM-20250802-15', 'IND003', 4, 0.00),
('DP-SIM-PED-SIM-20250802-9-0', 'PED-SIM-20250802-9', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20250802-9-1', 'PED-SIM-20250802-9', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20250802-9-2', 'PED-SIM-20250802-9', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20250803-23-0', 'PED-SIM-20250803-23', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20250803-23-1', 'PED-SIM-20250803-23', 'IND034', 3, 0.00),
('DP-SIM-PED-SIM-20250803-23-2', 'PED-SIM-20250803-23', 'IND028', 1, 0.00),
('DP-SIM-PED-SIM-20250805-10-0', 'PED-SIM-20250805-10', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20250805-10-1', 'PED-SIM-20250805-10', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20250805-24-0', 'PED-SIM-20250805-24', 'IND006', 5, 0.00),
('DP-SIM-PED-SIM-20250805-24-1', 'PED-SIM-20250805-24', 'IND017', 5, 0.00),
('DP-SIM-PED-SIM-20250805-4-0', 'PED-SIM-20250805-4', 'IND017', 1, 0.00),
('DP-SIM-PED-SIM-20250805-4-1', 'PED-SIM-20250805-4', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20250809-0-0', 'PED-SIM-20250809-0', 'IND024', 2, 0.00),
('DP-SIM-PED-SIM-20250809-3-0', 'PED-SIM-20250809-3', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20250812-11-0', 'PED-SIM-20250812-11', 'IND027', 5, 0.00),
('DP-SIM-PED-SIM-20250812-21-0', 'PED-SIM-20250812-21', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20250812-21-1', 'PED-SIM-20250812-21', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20250812-21-2', 'PED-SIM-20250812-21', 'IND029', 2, 0.00),
('DP-SIM-PED-SIM-20250813-8-0', 'PED-SIM-20250813-8', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250815-20-0', 'PED-SIM-20250815-20', 'IND025', 2, 0.00),
('DP-SIM-PED-SIM-20250816-19-0', 'PED-SIM-20250816-19', 'IND039', 1, 0.00),
('DP-SIM-PED-SIM-20250816-19-1', 'PED-SIM-20250816-19', 'IND004', 3, 0.00),
('DP-SIM-PED-SIM-20250816-19-2', 'PED-SIM-20250816-19', 'IND031', 3, 0.00),
('DP-SIM-PED-SIM-20250816-7-0', 'PED-SIM-20250816-7', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20250816-7-1', 'PED-SIM-20250816-7', 'IND032', 2, 0.00),
('DP-SIM-PED-SIM-20250817-14-0', 'PED-SIM-20250817-14', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20250819-2-0', 'PED-SIM-20250819-2', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20250819-2-1', 'PED-SIM-20250819-2', 'IND015', 4, 0.00),
('DP-SIM-PED-SIM-20250819-2-2', 'PED-SIM-20250819-2', 'IND015', 4, 0.00),
('DP-SIM-PED-SIM-20250820-17-0', 'PED-SIM-20250820-17', 'IND017', 4, 0.00),
('DP-SIM-PED-SIM-20250820-17-1', 'PED-SIM-20250820-17', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20250820-6-0', 'PED-SIM-20250820-6', 'IND032', 4, 0.00),
('DP-SIM-PED-SIM-20250821-12-0', 'PED-SIM-20250821-12', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20250821-12-1', 'PED-SIM-20250821-12', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20250821-12-2', 'PED-SIM-20250821-12', 'IND002', 1, 0.00),
('DP-SIM-PED-SIM-20250821-13-0', 'PED-SIM-20250821-13', 'IND017', 4, 0.00),
('DP-SIM-PED-SIM-20250821-13-1', 'PED-SIM-20250821-13', 'IND034', 5, 0.00),
('DP-SIM-PED-SIM-20250821-13-2', 'PED-SIM-20250821-13', 'IND036', 5, 0.00),
('DP-SIM-PED-SIM-20250821-5-0', 'PED-SIM-20250821-5', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20250821-5-1', 'PED-SIM-20250821-5', 'IND029', 3, 0.00),
('DP-SIM-PED-SIM-20250825-1-0', 'PED-SIM-20250825-1', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20250825-1-1', 'PED-SIM-20250825-1', 'IND034', 1, 0.00),
('DP-SIM-PED-SIM-20250825-1-2', 'PED-SIM-20250825-1', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20250826-18-0', 'PED-SIM-20250826-18', 'IND027', 3, 0.00),
('DP-SIM-PED-SIM-20250826-18-1', 'PED-SIM-20250826-18', 'IND020', 4, 0.00),
('DP-SIM-PED-SIM-20250826-18-2', 'PED-SIM-20250826-18', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20250827-16-0', 'PED-SIM-20250827-16', 'IND007', 5, 0.00),
('DP-SIM-PED-SIM-20250831-22-0', 'PED-SIM-20250831-22', 'IND019', 3, 0.00),
('DP-SIM-PED-SIM-20250831-22-1', 'PED-SIM-20250831-22', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20250901-19-0', 'PED-SIM-20250901-19', 'IND019', 5, 0.00),
('DP-SIM-PED-SIM-20250901-19-1', 'PED-SIM-20250901-19', 'IND005', 5, 0.00),
('DP-SIM-PED-SIM-20250901-19-2', 'PED-SIM-20250901-19', 'IND026', 1, 0.00),
('DP-SIM-PED-SIM-20250903-18-0', 'PED-SIM-20250903-18', 'IND034', 4, 0.00),
('DP-SIM-PED-SIM-20250904-0-0', 'PED-SIM-20250904-0', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20250904-0-1', 'PED-SIM-20250904-0', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20250906-2-0', 'PED-SIM-20250906-2', 'IND009', 1, 0.00),
('DP-SIM-PED-SIM-20250906-2-1', 'PED-SIM-20250906-2', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20250906-2-2', 'PED-SIM-20250906-2', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20250906-3-0', 'PED-SIM-20250906-3', 'IND034', 1, 0.00),
('DP-SIM-PED-SIM-20250906-3-1', 'PED-SIM-20250906-3', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20250907-4-0', 'PED-SIM-20250907-4', 'IND010', 1, 0.00),
('DP-SIM-PED-SIM-20250910-15-0', 'PED-SIM-20250910-15', 'IND006', 5, 0.00),
('DP-SIM-PED-SIM-20250913-22-0', 'PED-SIM-20250913-22', 'IND001', 1, 0.00),
('DP-SIM-PED-SIM-20250913-6-0', 'PED-SIM-20250913-6', 'IND035', 3, 0.00),
('DP-SIM-PED-SIM-20250916-20-0', 'PED-SIM-20250916-20', 'IND009', 3, 0.00),
('DP-SIM-PED-SIM-20250916-20-1', 'PED-SIM-20250916-20', 'IND028', 5, 0.00),
('DP-SIM-PED-SIM-20250916-20-2', 'PED-SIM-20250916-20', 'IND023', 5, 0.00),
('DP-SIM-PED-SIM-20250916-5-0', 'PED-SIM-20250916-5', 'IND005', 3, 0.00),
('DP-SIM-PED-SIM-20250916-5-1', 'PED-SIM-20250916-5', 'IND039', 3, 0.00),
('DP-SIM-PED-SIM-20250916-5-2', 'PED-SIM-20250916-5', 'IND033', 2, 0.00),
('DP-SIM-PED-SIM-20250916-7-0', 'PED-SIM-20250916-7', 'IND018', 5, 0.00),
('DP-SIM-PED-SIM-20250916-7-1', 'PED-SIM-20250916-7', 'IND027', 2, 0.00),
('DP-SIM-PED-SIM-20250920-1-0', 'PED-SIM-20250920-1', 'IND039', 2, 0.00),
('DP-SIM-PED-SIM-20250920-1-1', 'PED-SIM-20250920-1', 'IND034', 1, 0.00),
('DP-SIM-PED-SIM-20250920-16-0', 'PED-SIM-20250920-16', 'IND023', 2, 0.00),
('DP-SIM-PED-SIM-20250922-17-0', 'PED-SIM-20250922-17', 'IND028', 3, 0.00),
('DP-SIM-PED-SIM-20250922-17-1', 'PED-SIM-20250922-17', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20250923-10-0', 'PED-SIM-20250923-10', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20250923-10-1', 'PED-SIM-20250923-10', 'IND002', 2, 0.00),
('DP-SIM-PED-SIM-20250924-11-0', 'PED-SIM-20250924-11', 'IND021', 2, 0.00),
('DP-SIM-PED-SIM-20250925-9-0', 'PED-SIM-20250925-9', 'IND010', 2, 0.00),
('DP-SIM-PED-SIM-20250925-9-1', 'PED-SIM-20250925-9', 'IND007', 2, 0.00),
('DP-SIM-PED-SIM-20250926-21-0', 'PED-SIM-20250926-21', 'IND033', 3, 0.00),
('DP-SIM-PED-SIM-20250926-21-1', 'PED-SIM-20250926-21', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20250926-21-2', 'PED-SIM-20250926-21', 'IND027', 3, 0.00),
('DP-SIM-PED-SIM-20250927-24-0', 'PED-SIM-20250927-24', 'IND005', 1, 0.00),
('DP-SIM-PED-SIM-20250927-24-1', 'PED-SIM-20250927-24', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20250927-24-2', 'PED-SIM-20250927-24', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20250928-14-0', 'PED-SIM-20250928-14', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20250928-14-1', 'PED-SIM-20250928-14', 'IND031', 2, 0.00),
('DP-SIM-PED-SIM-20250929-13-0', 'PED-SIM-20250929-13', 'IND026', 3, 0.00),
('DP-SIM-PED-SIM-20250929-23-0', 'PED-SIM-20250929-23', 'IND032', 5, 0.00),
('DP-SIM-PED-SIM-20250930-12-0', 'PED-SIM-20250930-12', 'IND038', 4, 0.00),
('DP-SIM-PED-SIM-20250930-12-1', 'PED-SIM-20250930-12', 'IND008', 2, 0.00),
('DP-SIM-PED-SIM-20250930-12-2', 'PED-SIM-20250930-12', 'IND021', 4, 0.00),
('DP-SIM-PED-SIM-20250930-8-0', 'PED-SIM-20250930-8', 'IND001', 5, 0.00),
('DP-SIM-PED-SIM-20250930-8-1', 'PED-SIM-20250930-8', 'IND008', 3, 0.00),
('DP-SIM-PED-SIM-20251001-11-0', 'PED-SIM-20251001-11', 'IND034', 5, 0.00),
('DP-SIM-PED-SIM-20251001-11-1', 'PED-SIM-20251001-11', 'IND009', 2, 0.00),
('DP-SIM-PED-SIM-20251001-11-2', 'PED-SIM-20251001-11', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20251002-13-0', 'PED-SIM-20251002-13', 'IND028', 3, 0.00),
('DP-SIM-PED-SIM-20251002-13-1', 'PED-SIM-20251002-13', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20251002-13-2', 'PED-SIM-20251002-13', 'IND007', 3, 0.00),
('DP-SIM-PED-SIM-20251004-0-0', 'PED-SIM-20251004-0', 'IND019', 2, 0.00),
('DP-SIM-PED-SIM-20251004-0-1', 'PED-SIM-20251004-0', 'IND035', 4, 0.00),
('DP-SIM-PED-SIM-20251004-0-2', 'PED-SIM-20251004-0', 'IND039', 4, 0.00),
('DP-SIM-PED-SIM-20251005-22-0', 'PED-SIM-20251005-22', 'IND001', 3, 0.00),
('DP-SIM-PED-SIM-20251006-14-0', 'PED-SIM-20251006-14', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20251006-14-1', 'PED-SIM-20251006-14', 'IND029', 5, 0.00),
('DP-SIM-PED-SIM-20251006-14-2', 'PED-SIM-20251006-14', 'IND006', 1, 0.00),
('DP-SIM-PED-SIM-20251006-24-0', 'PED-SIM-20251006-24', 'IND004', 4, 0.00),
('DP-SIM-PED-SIM-20251008-16-0', 'PED-SIM-20251008-16', 'IND005', 2, 0.00),
('DP-SIM-PED-SIM-20251008-16-1', 'PED-SIM-20251008-16', 'IND010', 3, 0.00),
('DP-SIM-PED-SIM-20251008-16-2', 'PED-SIM-20251008-16', 'IND008', 5, 0.00),
('DP-SIM-PED-SIM-20251008-3-0', 'PED-SIM-20251008-3', 'IND037', 3, 0.00),
('DP-SIM-PED-SIM-20251008-3-1', 'PED-SIM-20251008-3', 'IND027', 4, 0.00),
('DP-SIM-PED-SIM-20251010-9-0', 'PED-SIM-20251010-9', 'IND034', 1, 0.00),
('DP-SIM-PED-SIM-20251010-9-1', 'PED-SIM-20251010-9', 'IND015', 5, 0.00),
('DP-SIM-PED-SIM-20251012-20-0', 'PED-SIM-20251012-20', 'IND030', 3, 0.00),
('DP-SIM-PED-SIM-20251012-20-1', 'PED-SIM-20251012-20', 'IND020', 3, 0.00),
('DP-SIM-PED-SIM-20251012-20-2', 'PED-SIM-20251012-20', 'IND023', 1, 0.00),
('DP-SIM-PED-SIM-20251013-15-0', 'PED-SIM-20251013-15', 'IND003', 3, 0.00),
('DP-SIM-PED-SIM-20251013-21-0', 'PED-SIM-20251013-21', 'IND036', 3, 0.00),
('DP-SIM-PED-SIM-20251013-21-1', 'PED-SIM-20251013-21', 'IND025', 3, 0.00),
('DP-SIM-PED-SIM-20251015-7-0', 'PED-SIM-20251015-7', 'IND021', 3, 0.00),
('DP-SIM-PED-SIM-20251015-7-1', 'PED-SIM-20251015-7', 'IND010', 4, 0.00),
('DP-SIM-PED-SIM-20251018-1-0', 'PED-SIM-20251018-1', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20251018-1-1', 'PED-SIM-20251018-1', 'IND039', 5, 0.00),
('DP-SIM-PED-SIM-20251018-1-2', 'PED-SIM-20251018-1', 'IND004', 1, 0.00),
('DP-SIM-PED-SIM-20251019-17-0', 'PED-SIM-20251019-17', 'IND024', 1, 0.00),
('DP-SIM-PED-SIM-20251019-17-1', 'PED-SIM-20251019-17', 'IND036', 1, 0.00),
('DP-SIM-PED-SIM-20251020-12-0', 'PED-SIM-20251020-12', 'IND020', 2, 0.00),
('DP-SIM-PED-SIM-20251020-12-1', 'PED-SIM-20251020-12', 'IND025', 4, 0.00),
('DP-SIM-PED-SIM-20251020-4-0', 'PED-SIM-20251020-4', 'IND022', 5, 0.00),
('DP-SIM-PED-SIM-20251020-4-1', 'PED-SIM-20251020-4', 'IND016', 4, 0.00),
('DP-SIM-PED-SIM-20251022-23-0', 'PED-SIM-20251022-23', 'IND009', 5, 0.00),
('DP-SIM-PED-SIM-20251022-23-1', 'PED-SIM-20251022-23', 'IND008', 1, 0.00),
('DP-SIM-PED-SIM-20251022-23-2', 'PED-SIM-20251022-23', 'IND038', 3, 0.00),
('DP-SIM-PED-SIM-20251023-5-0', 'PED-SIM-20251023-5', 'IND010', 5, 0.00),
('DP-SIM-PED-SIM-20251023-5-1', 'PED-SIM-20251023-5', 'IND039', 1, 0.00),
('DP-SIM-PED-SIM-20251023-5-2', 'PED-SIM-20251023-5', 'IND015', 2, 0.00),
('DP-SIM-PED-SIM-20251023-6-0', 'PED-SIM-20251023-6', 'IND030', 5, 0.00),
('DP-SIM-PED-SIM-20251023-6-1', 'PED-SIM-20251023-6', 'IND030', 4, 0.00),
('DP-SIM-PED-SIM-20251023-8-0', 'PED-SIM-20251023-8', 'IND019', 4, 0.00),
('DP-SIM-PED-SIM-20251026-19-0', 'PED-SIM-20251026-19', 'IND018', 3, 0.00),
('DP-SIM-PED-SIM-20251030-2-0', 'PED-SIM-20251030-2', 'IND037', 2, 0.00),
('DP-SIM-PED-SIM-20251030-2-1', 'PED-SIM-20251030-2', 'IND007', 4, 0.00),
('DP-SIM-PED-SIM-20251031-10-0', 'PED-SIM-20251031-10', 'IND029', 1, 0.00),
('DP-SIM-PED-SIM-20251031-10-1', 'PED-SIM-20251031-10', 'IND017', 3, 0.00),
('DP-SIM-PED-SIM-20251031-10-2', 'PED-SIM-20251031-10', 'IND021', 5, 0.00),
('DP-SIM-PED-SIM-20251031-18-0', 'PED-SIM-20251031-18', 'IND034', 1, 0.00),
('DPED-043831', 'PED-2025-429', 'IND001', 1, 0.00),
('DPED-192243', 'PED-2025-102', 'IND002', 2, 0.00),
('DPED-222225', 'PED-2025-407', 'IND006', 2, 0.00),
('DPED-282917', 'PED-2025-521', 'IND039', 2, 0.00),
('DPED-322433', 'PED-20251113-001', 'IND001', 11, 0.00),
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
-- Estructura de tabla para la tabla `empresa_envio`
--

CREATE TABLE `empresa_envio` (
  `idEmpresaEnvio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre comercial de la empresa de envío'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `empresa_envio`
--

INSERT INTO `empresa_envio` (`idEmpresaEnvio`, `nombre`) VALUES
(2, 'Andreani'),
(1, 'Correo Argentino'),
(3, 'OCA'),
(4, 'Via Cargo');

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
(2, 'No Apta'),
(3, 'Desechado');

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
-- Estructura de tabla para la tabla `motivo_no_apta`
--

CREATE TABLE `motivo_no_apta` (
  `idMotivo` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `motivo_no_apta`
--

INSERT INTO `motivo_no_apta` (`idMotivo`, `descripcion`) VALUES
(1, 'Defecto de costura'),
(2, 'Mancha irreparable'),
(3, 'Problema de teñido / coloración'),
(4, 'Daño en el empaque / transporte'),
(5, 'Talla o etiqueta incorrecta'),
(6, 'Descosido o costura fallida'),
(7, 'Mancha permanente'),
(8, 'Daño en la tela (roto o quemado)'),
(9, 'Fallo de color o estampado');

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
('MOV-1760665520495-1', 'STK002', '2025-10-17', -3, 'Movimiento a No Apto: Sin especificar'),
('MOV-1760665520496-2', 'STK-NA-1760665520494', '2025-10-17', 3, 'Ingreso desde stock vendible: Sin especificar'),
('MOV-1762025149776', 'STK001', '2025-11-01', 2, 'Incremento manual de stock'),
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
('MOV-NOAPTA-IN-1762025095136', 'STK-NA-1756247729017', '2025-11-01', 2, 'Recibido de Rack 1: Sin observaciones'),
('MOV-NOAPTA-OUT-1762025095133', 'STK001', '2025-11-01', -2, 'Movido a No Apta: Sin observaciones'),
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
('MOV-PED-097882', 'STK-NA-1756247729017', '2025-11-13', -11, 'Descuento por pedido PED-20251113-001'),
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
('MOV-PED-965241', 'STK003', '2025-06-16', -2, 'Descuento por pedido PED-2025-663'),
('MOV-REINGRESO-IN-1762025134444', 'STK001', '2025-11-01', 1, 'Regreso de cuarentena: Reparado'),
('MOV-REINGRESO-OUT-1762025134442', 'STK-NA-1756247729017', '2025-11-01', -1, 'Reingresado a Rack 1: Reparado'),
('MOV-SCRAP-1760918421513', 'STK-NA-1756247729017', '2025-10-20', -2, 'SCRAP (Desecho permanente): Sin motivo especificado'),
('MOV-SCRAP-1760918424267', 'STK-NA-1760665520494', '2025-10-20', -3, 'SCRAP (Desecho permanente): Sin motivo especificado'),
('MOV-SCRAP-1762025117481', 'STK-NA-1756247729017', '2025-11-01', -1, 'SCRAP (Desecho permanente): Sin motivo especificado');

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
  `dummyUpdate` int(11) DEFAULT NULL,
  `idEmpresaEnvio` int(11) DEFAULT NULL COMMENT 'Clave foránea de la empresa de envío seleccionada por el cliente o sistema'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`numeroPedido`, `idCliente`, `idUsuarioCreo`, `idUsuarioModifico`, `fechaPedido`, `fechaModificacion`, `codigoSeguimiento`, `descuentoOrden`, `idMotivoCancelacion`, `observacionCancelacion`, `fechaCancelacion`, `idUsuarioCancelo`, `idEstado`, `estaActivo`, `dummyUpdate`, `idEmpresaEnvio`) VALUES
('PED-20240110-001', 28, 1, NULL, '2024-01-10 10:00:00', '2025-11-14 15:25:23', 'HD-9067-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240115-001', 29, 2, NULL, '2024-01-15 11:00:00', '2025-11-14 15:25:23', 'HD-1396-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240120-001', 30, 1, NULL, '2024-01-21 12:00:00', '2025-11-14 15:25:23', 'HD-5775-AR', 0.00, 1, NULL, '2024-01-21 12:00:00', 2, 6, 0, NULL, 2),
('PED-20240125-001', 31, 2, NULL, '2024-01-25 13:00:00', '2025-11-14 15:25:23', 'HD-5693-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240201-001', 32, 1, NULL, '2024-02-01 14:00:00', '2025-11-14 15:25:23', 'HD-1138-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240205-001', 33, 2, NULL, '2024-02-06 15:00:00', '2025-11-14 15:25:23', 'HD-5610-AR', 0.00, 4, NULL, '2024-02-06 15:00:00', 1, 6, 0, NULL, 2),
('PED-20240210-001', 34, 1, NULL, '2024-02-10 16:00:00', '2025-11-14 15:25:23', 'HD-5640-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240215-001', 35, 2, NULL, '2024-02-16 17:00:00', '2025-11-14 15:25:23', 'HD-1369-AR', 0.00, 6, 'Cliente solicitó envío express no disponible.', '2024-02-16 17:00:00', 1, 6, 0, NULL, 2),
('PED-20240220-001', 36, 1, NULL, '2024-02-20 18:00:00', '2025-11-14 15:25:23', 'HD-6926-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240225-001', 37, 2, NULL, '2024-02-25 19:00:00', '2025-11-14 15:25:23', 'HD-2524-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240410-001', 38, 1, NULL, '2024-04-10 10:00:00', '2025-11-14 15:25:23', 'HD-8841-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240415-001', 39, 2, NULL, '2024-04-16 11:00:00', '2025-11-14 15:25:23', 'HD-8635-AR', 0.00, 2, NULL, '2024-04-16 11:00:00', 1, 6, 0, NULL, 4),
('PED-20240420-001', 40, 1, NULL, '2024-04-20 12:00:00', '2025-11-14 15:25:23', 'HD-6656-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240425-001', 41, 2, NULL, '2024-04-25 13:00:00', '2025-11-14 15:25:23', 'HD-6376-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240501-001', 42, 1, NULL, '2024-05-02 14:00:00', '2025-11-14 15:25:23', 'HD-1913-AR', 0.00, 3, NULL, '2024-05-02 14:00:00', 2, 6, 0, NULL, 1),
('PED-20240505-001', 43, 2, NULL, '2024-05-05 15:00:00', '2025-11-14 15:25:23', 'HD-7435-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240510-001', 44, 1, NULL, '2024-05-10 16:00:00', '2025-11-14 15:25:23', 'HD-3438-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240515-001', 45, 2, NULL, '2024-05-15 17:00:00', '2025-11-14 15:25:23', 'HD-2884-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240520-001', 46, 1, NULL, '2024-05-20 18:00:00', '2025-11-14 15:25:23', 'HD-3109-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240525-001', 47, 2, NULL, '2024-05-26 19:00:00', '2025-11-14 15:25:23', 'HD-5891-AR', 0.00, 5, NULL, '2024-05-26 19:00:00', 1, 6, 0, NULL, 2),
('PED-20240710-001', 1, 1, NULL, '2024-07-10 10:00:00', '2025-11-14 15:25:23', 'HD-1133-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240715-001', 2, 2, NULL, '2024-07-16 11:00:00', '2025-11-14 15:25:23', 'HD-4990-AR', 0.00, 1, NULL, '2024-07-16 11:00:00', 2, 6, 0, NULL, 4),
('PED-20240720-001', 3, 1, NULL, '2024-07-20 12:00:00', '2025-11-14 15:25:23', 'HD-2555-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240725-001', 4, 2, NULL, '2024-07-26 13:00:00', '2025-11-14 15:25:23', 'HD-5803-AR', 0.00, 2, NULL, '2024-07-26 13:00:00', 1, 6, 0, NULL, 2),
('PED-20240801-001', 5, 1, NULL, '2024-08-01 14:00:00', '2025-11-14 15:25:23', 'HD-2353-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240805-001', 6, 2, NULL, '2024-08-05 15:00:00', '2025-11-14 15:25:23', 'HD-2354-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240810-001', 7, 1, NULL, '2024-08-11 16:00:00', '2025-11-14 15:25:23', 'HD-3713-AR', 0.00, 3, NULL, '2024-08-11 16:00:00', 2, 6, 0, NULL, 3),
('PED-20240815-001', 8, 2, NULL, '2024-08-15 17:00:00', '2025-11-14 15:25:23', 'HD-1506-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240820-001', 9, 1, NULL, '2024-08-20 18:00:00', '2025-11-14 15:25:23', 'HD-4389-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240825-001', 10, 2, NULL, '2024-08-25 19:00:00', '2025-11-14 15:25:23', 'HD-7427-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241010-001', 28, 1, NULL, '2024-10-10 10:00:00', '2025-11-14 15:25:23', 'HD-4971-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241015-001', 29, 2, NULL, '2024-10-15 11:00:00', '2025-11-14 15:25:23', 'HD-1575-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241020-001', 30, 1, NULL, '2024-10-21 12:00:00', '2025-11-14 15:25:23', 'HD-9960-AR', 0.00, 4, NULL, '2024-10-21 12:00:00', 2, 6, 0, NULL, 1),
('PED-20241025-001', 31, 2, NULL, '2024-10-25 13:00:00', '2025-11-14 15:25:23', 'HD-8082-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241101-001', 32, 1, NULL, '2024-11-01 14:00:00', '2025-11-14 15:25:23', 'HD-9527-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241105-001', 33, 2, NULL, '2024-11-05 15:00:00', '2025-11-14 15:25:23', 'HD-4395-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241110-001', 34, 1, NULL, '2024-11-10 16:00:00', '2025-11-14 15:25:23', 'HD-1391-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241115-001', 35, 2, NULL, '2024-11-16 17:00:00', '2025-11-14 15:25:23', 'HD-1772-AR', 0.00, 1, NULL, '2024-11-16 17:00:00', 1, 6, 0, NULL, 3),
('PED-20241120-001', 36, 1, NULL, '2024-11-20 18:00:00', '2025-11-14 15:25:23', 'HD-3687-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241125-001', 37, 2, NULL, '2024-11-25 19:00:00', '2025-11-14 15:25:23', 'HD-3119-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-2025-014', 28, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-3537-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 3),
('PED-2025-015', 29, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-7328-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 2),
('PED-2025-016', 28, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-7032-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-2025-017', 30, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-3176-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-2025-018', 31, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-2784-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-2025-019', 32, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-3393-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 3),
('PED-2025-020', 33, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-7612-AR', 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL, 4),
('PED-2025-021', 34, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-8886-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-2025-022', 35, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-2594-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 2),
('PED-2025-023', 33, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-3309-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-2025-024', 36, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-7767-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 2),
('PED-2025-025', 37, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-9909-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 3),
('PED-2025-026', 38, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-7247-AR', 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL, 3),
('PED-2025-027', 39, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-5507-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-2025-028', 40, NULL, NULL, '2025-06-16 15:34:33', '2025-11-13 01:07:22', 'HD-47959-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-2025-029', 36, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-4794-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-2025-030', 41, NULL, NULL, '2025-06-16 15:34:33', '2025-11-14 15:25:23', 'HD-6450-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 4),
('PED-2025-101', 28, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-7871-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 4),
('PED-2025-102', 29, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-1006-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 2),
('PED-2025-103', 30, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-7415-AR', 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL, 1),
('PED-2025-104', 28, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-6061-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-2025-105', 31, NULL, NULL, '2025-06-16 15:44:01', '2025-10-25 17:06:29', 'HD-54545-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-2025-106', 32, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-7061-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-2025-107', 33, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-7125-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 2),
('PED-2025-108', 34, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-4441-AR', 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL, 1),
('PED-2025-109', 35, NULL, NULL, '2025-06-16 15:44:01', '2025-11-14 15:25:23', 'HD-8831-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-2025-110', 36, NULL, NULL, '2025-06-16 15:44:02', '2025-10-25 17:06:29', 'HD112312345AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-2025-111', 37, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-2834-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-2025-112', 37, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-4678-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 1),
('PED-2025-113', 38, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-4888-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-2025-114', 39, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-9407-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-2025-115', 40, NULL, NULL, '2025-06-14 15:44:02', '2025-11-14 15:25:23', 'HD-4376-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-2025-116', 41, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-1658-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-2025-117', 1, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-3160-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 3),
('PED-2025-118', 2, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-9829-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-2025-119', 3, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-2669-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-2025-120', 4, NULL, NULL, '2025-06-16 15:44:02', '2025-11-14 15:25:23', 'HD-9856-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 4),
('PED-2025-172', 1, NULL, NULL, '2025-06-16 03:55:34', '2025-11-14 15:25:23', 'HD-4276-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 1),
('PED-2025-333', 4, NULL, NULL, '2025-06-16 04:01:30', '2025-11-14 15:25:23', 'HD-8811-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 4),
('PED-2025-407', 1, NULL, NULL, '2025-06-18 21:30:36', '2025-11-14 15:25:23', 'HD-3232-AR', 0.00, NULL, NULL, NULL, NULL, 2, 1, NULL, 2),
('PED-2025-429', 28, NULL, NULL, '2025-06-16 20:43:17', '2025-11-14 15:25:23', 'HD-6725-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-2025-521', 1, 2, 1, '2025-06-20 02:19:11', '2025-11-14 15:25:23', 'HD-4932-AR', 0.00, NULL, NULL, NULL, NULL, 1, 1, NULL, 1),
('PED-2025-747', 1, 1, 1, '2025-07-01 23:47:40', '2025-11-14 15:25:23', 'HD-3484-AR', 0.00, 3, NULL, NULL, 1, 6, 0, NULL, 2),
('PED-20251113-001', 1, 1, NULL, '2025-11-13 21:56:23', '2025-11-14 15:25:23', 'HD-1623-AR', 2199.99, NULL, NULL, NULL, NULL, 1, 1, NULL, 1),
('PED-SIM-20240102-1', 3, 6, NULL, '2024-01-02 13:21:16', '2025-11-14 15:25:23', 'HD-5665-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240102-11', 9, 5, NULL, '2024-01-02 18:10:16', '2025-11-14 15:25:23', 'HD-4459-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240102-16', 1, 6, NULL, '2024-01-02 15:48:18', '2025-11-14 15:25:23', 'HD-4298-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240103-7', 1, 5, NULL, '2024-01-03 08:53:20', '2025-11-14 15:25:23', 'HD-7116-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240105-15', 8, 6, NULL, '2024-01-05 11:02:22', '2025-11-14 15:25:23', 'HD-3686-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240105-2', 9, 5, NULL, '2024-01-05 14:09:15', '2025-11-14 15:25:23', 'HD-5082-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240105-22', 8, 2, NULL, '2024-01-05 13:41:09', '2025-11-14 15:25:23', 'HD-4352-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240107-12', 6, 6, NULL, '2024-01-07 14:55:03', '2025-11-14 15:25:23', 'HD-5517-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240109-1', 5, 1, NULL, '2024-01-09 12:56:38', '2025-11-14 15:25:23', 'HD-4530-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240109-21', 9, 6, NULL, '2024-01-09 11:42:36', '2025-11-14 15:25:23', 'HD-5100-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240109-3', 8, 7, NULL, '2024-01-09 10:16:43', '2025-11-14 15:25:23', 'HD-1911-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240110-0', 5, 6, NULL, '2024-01-10 18:35:15', '2025-11-14 15:25:23', 'HD-2253-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240110-13', 2, 6, NULL, '2024-01-10 16:34:46', '2025-11-14 15:25:23', 'HD-4535-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240111-10', 6, 15, NULL, '2024-01-11 10:58:18', '2025-11-14 15:25:23', 'HD-5918-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240111-19', 3, 2, NULL, '2024-01-11 17:00:39', '2025-11-14 15:25:23', 'HD-5983-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240114-8', 1, 7, NULL, '2024-01-14 08:59:48', '2025-11-14 15:25:23', 'HD-2166-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240116-6', 5, 7, NULL, '2024-01-16 18:44:07', '2025-11-14 15:25:23', 'HD-9879-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240117-17', 3, 15, NULL, '2024-01-17 16:53:22', '2025-11-14 15:25:23', 'HD-5903-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240118-5', 2, 1, NULL, '2024-01-18 18:51:32', '2025-11-14 15:25:23', 'HD-7875-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240121-0', 10, 1, NULL, '2024-01-21 19:41:36', '2025-11-14 15:25:23', 'HD-2670-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240124-24', 7, 15, NULL, '2024-01-24 13:58:31', '2025-11-14 15:25:23', 'HD-6724-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240126-4', 10, 7, NULL, '2024-01-26 09:13:43', '2025-11-14 15:25:23', 'HD-6613-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240127-18', 9, 15, NULL, '2024-01-27 13:33:30', '2025-11-14 15:25:23', 'HD-2892-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240127-9', 4, 15, NULL, '2024-01-27 12:13:00', '2025-11-14 15:25:23', 'HD-2623-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240129-20', 2, 5, NULL, '2024-01-29 08:36:47', '2025-11-14 15:25:23', 'HD-3440-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240130-14', 9, 6, NULL, '2024-01-30 13:35:31', '2025-11-14 15:25:23', 'HD-8329-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240131-23', 5, 1, NULL, '2024-01-31 11:25:20', '2025-11-14 15:25:23', 'HD-3331-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240201-12', 7, 2, NULL, '2024-02-01 19:37:17', '2025-11-14 15:25:23', 'HD-8666-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240201-3', 8, 5, NULL, '2024-02-01 11:28:26', '2025-11-14 15:25:23', 'HD-5340-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240203-14', 6, 15, NULL, '2024-02-03 09:30:01', '2025-11-14 15:25:23', 'HD-8701-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240204-11', 8, 7, NULL, '2024-02-04 16:18:20', '2025-11-14 15:25:23', 'HD-8489-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240204-22', 5, 1, NULL, '2024-02-04 19:23:08', '2025-11-14 15:25:23', 'HD-6341-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240205-2', 7, 7, NULL, '2024-02-05 15:41:33', '2025-11-14 15:25:23', 'HD-5239-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240205-7', 2, 2, NULL, '2024-02-05 16:17:12', '2025-11-14 15:25:23', 'HD-6171-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240206-24', 2, 15, NULL, '2024-02-06 14:14:34', '2025-11-14 15:25:23', 'HD-5143-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240207-5', 5, 6, NULL, '2024-02-07 13:39:53', '2025-11-14 15:25:23', 'HD-6201-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240208-13', 2, 5, NULL, '2024-02-08 15:20:50', '2025-11-14 15:25:23', 'HD-5578-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240208-16', 5, 2, NULL, '2024-02-08 11:52:25', '2025-11-14 15:25:23', 'HD-8287-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240213-23', 3, 6, NULL, '2024-02-13 17:47:31', '2025-11-14 15:25:23', 'HD-5702-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240214-6', 7, 1, NULL, '2024-02-14 12:30:26', '2025-11-14 15:25:23', 'HD-2652-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240216-10', 3, 15, NULL, '2024-02-16 15:31:45', '2025-11-14 15:25:23', 'HD-4151-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240223-0', 9, 2, NULL, '2024-02-23 15:50:15', '2025-11-14 15:25:23', 'HD-2801-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240223-19', 6, 15, NULL, '2024-02-23 12:43:20', '2025-11-14 15:25:23', 'HD-9552-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240223-4', 2, 6, NULL, '2024-02-23 08:53:21', '2025-11-14 15:25:23', 'HD-2360-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240223-8', 1, 6, NULL, '2024-02-23 15:44:50', '2025-11-14 15:25:23', 'HD-9143-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240224-17', 3, 6, NULL, '2024-02-24 15:48:07', '2025-11-14 15:25:23', 'HD-1637-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240224-20', 6, 15, NULL, '2024-02-24 11:06:33', '2025-11-14 15:25:23', 'HD-6755-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240226-15', 8, 15, NULL, '2024-02-26 10:27:37', '2025-11-14 15:25:23', 'HD-9867-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240226-18', 6, 7, NULL, '2024-02-26 15:26:22', '2025-11-14 15:25:23', 'HD-1073-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240226-9', 9, 15, NULL, '2024-02-26 09:11:29', '2025-11-14 15:25:23', 'HD-1761-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240227-1', 7, 2, NULL, '2024-02-27 09:02:45', '2025-11-14 15:25:23', 'HD-4588-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240228-21', 2, 1, NULL, '2024-02-28 18:30:56', '2025-11-14 15:25:23', 'HD-7656-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240303-10', 9, 5, NULL, '2024-03-03 19:30:40', '2025-11-14 15:25:23', 'HD-5519-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240303-3', 5, 7, NULL, '2024-03-03 17:38:53', '2025-11-14 15:25:23', 'HD-3627-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240304-2', 5, 7, NULL, '2024-03-04 11:17:27', '2025-11-14 15:25:23', 'HD-9580-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240305-15', 4, 7, NULL, '2024-03-05 12:33:35', '2025-11-14 15:25:23', 'HD-9022-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240306-5', 9, 5, NULL, '2024-03-06 12:20:34', '2025-11-14 15:25:23', 'HD-6372-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240307-16', 9, 7, NULL, '2024-03-07 10:11:29', '2025-11-14 15:25:23', 'HD-3792-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240309-13', 4, 6, NULL, '2024-03-09 14:46:19', '2025-11-14 15:25:23', 'HD-7844-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240309-17', 5, 15, NULL, '2024-03-09 17:09:22', '2025-11-14 15:25:23', 'HD-8846-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240309-21', 1, 5, NULL, '2024-03-09 12:14:57', '2025-11-14 15:25:23', 'HD-1703-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240309-6', 5, 2, NULL, '2024-03-09 10:15:38', '2025-11-14 15:25:23', 'HD-7973-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240310-18', 5, 7, NULL, '2024-03-10 15:13:13', '2025-11-14 15:25:23', 'HD-6760-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240310-20', 6, 7, NULL, '2024-03-10 19:54:39', '2025-11-14 15:25:23', 'HD-8880-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240313-0', 7, 7, NULL, '2024-03-13 18:03:45', '2025-11-14 15:25:23', 'HD-5123-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240316-19', 6, 15, NULL, '2024-03-16 10:44:57', '2025-11-14 15:25:23', 'HD-6975-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240316-8', 6, 15, NULL, '2024-03-16 14:19:53', '2025-11-14 15:25:23', 'HD-9506-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240319-7', 3, 5, NULL, '2024-03-19 17:20:15', '2025-11-14 15:25:23', 'HD-7607-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240320-11', 5, 2, NULL, '2024-03-20 14:00:17', '2025-11-14 15:25:23', 'HD-8521-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240320-14', 1, 2, NULL, '2024-03-20 12:05:15', '2025-11-14 15:25:23', 'HD-9782-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240323-23', 8, 5, NULL, '2024-03-23 15:01:10', '2025-11-14 15:25:23', 'HD-4350-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240323-24', 7, 6, NULL, '2024-03-23 12:35:52', '2025-11-14 15:25:23', 'HD-9401-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240323-4', 6, 15, NULL, '2024-03-23 09:31:13', '2025-11-14 15:25:23', 'HD-5959-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240326-12', 6, 2, NULL, '2024-03-26 11:59:05', '2025-11-14 15:25:23', 'HD-9594-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240328-1', 9, 7, NULL, '2024-03-28 13:24:48', '2025-11-14 15:25:23', 'HD-2094-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240331-22', 7, 6, NULL, '2024-03-31 09:52:50', '2025-11-14 15:25:23', 'HD-7686-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240331-9', 7, 15, NULL, '2024-03-31 17:11:26', '2025-11-14 15:25:23', 'HD-4151-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240401-10', 8, 1, NULL, '2024-04-01 15:06:37', '2025-11-14 15:25:23', 'HD-5697-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240402-23', 4, 6, NULL, '2024-04-02 18:21:05', '2025-11-14 15:25:23', 'HD-6036-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240406-12', 8, 2, NULL, '2024-04-06 10:29:50', '2025-11-14 15:25:23', 'HD-3087-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240406-16', 10, 5, NULL, '2024-04-06 14:58:22', '2025-11-14 15:25:23', 'HD-5327-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240406-3', 9, 6, NULL, '2024-04-06 09:07:15', '2025-11-14 15:25:23', 'HD-7377-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240407-24', 9, 5, NULL, '2024-04-07 16:43:36', '2025-11-14 15:25:23', 'HD-1905-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240408-13', 8, 15, NULL, '2024-04-08 16:44:35', '2025-11-14 15:25:23', 'HD-4394-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240411-8', 9, 7, NULL, '2024-04-11 13:18:09', '2025-11-14 15:25:23', 'HD-6256-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240413-0', 8, 2, NULL, '2024-04-13 18:14:29', '2025-11-14 15:25:23', 'HD-8099-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240413-19', 7, 6, NULL, '2024-04-13 17:32:26', '2025-11-14 15:25:23', 'HD-2728-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240414-1', 5, 7, NULL, '2024-04-14 09:04:08', '2025-11-14 15:25:23', 'HD-6344-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240416-14', 2, 15, NULL, '2024-04-16 11:02:15', '2025-11-14 15:25:23', 'HD-4539-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240418-5', 7, 5, NULL, '2024-04-18 17:02:57', '2025-11-14 15:25:23', 'HD-2663-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240419-2', 5, 6, NULL, '2024-04-19 13:31:11', '2025-11-14 15:25:23', 'HD-7697-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240419-9', 5, 6, NULL, '2024-04-19 18:34:14', '2025-11-14 15:25:23', 'HD-2500-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240421-15', 2, 7, NULL, '2024-04-21 15:16:24', '2025-11-14 15:25:23', 'HD-6409-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240421-20', 3, 7, NULL, '2024-04-21 13:13:46', '2025-11-14 15:25:23', 'HD-5548-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240421-4', 9, 1, NULL, '2024-04-21 16:25:01', '2025-11-14 15:25:23', 'HD-7511-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240424-17', 2, 5, NULL, '2024-04-24 08:41:27', '2025-11-14 15:25:23', 'HD-1915-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240425-22', 8, 5, NULL, '2024-04-25 11:51:27', '2025-11-14 15:25:23', 'HD-4039-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240425-6', 8, 7, NULL, '2024-04-25 08:50:03', '2025-11-14 15:25:23', 'HD-4452-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240426-11', 8, 1, NULL, '2024-04-26 12:10:51', '2025-11-14 15:25:23', 'HD-9144-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240426-21', 6, 2, NULL, '2024-04-26 09:10:24', '2025-11-14 15:25:23', 'HD-4368-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240427-18', 2, 6, NULL, '2024-04-27 08:44:29', '2025-11-14 15:25:23', 'HD-2409-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240429-7', 2, 1, NULL, '2024-04-29 19:43:51', '2025-11-14 15:25:23', 'HD-6937-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240501-15', 1, 2, NULL, '2024-05-01 17:51:54', '2025-11-14 15:25:23', 'HD-8463-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240503-12', 8, 1, NULL, '2024-05-03 17:48:38', '2025-11-14 15:25:23', 'HD-2507-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240503-14', 5, 1, NULL, '2024-05-03 17:54:01', '2025-11-14 15:25:23', 'HD-4144-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240503-2', 4, 1, NULL, '2024-05-03 10:50:34', '2025-11-14 15:25:23', 'HD-3199-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240503-7', 1, 7, NULL, '2024-05-03 12:34:44', '2025-11-14 15:25:23', 'HD-2566-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240503-9', 8, 1, NULL, '2024-05-03 10:55:54', '2025-11-14 15:25:23', 'HD-2233-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240504-16', 10, 7, NULL, '2024-05-04 16:12:54', '2025-11-14 15:25:23', 'HD-2469-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240505-22', 10, 1, NULL, '2024-05-05 12:19:35', '2025-11-14 15:25:23', 'HD-4646-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240506-11', 2, 1, NULL, '2024-05-06 18:59:13', '2025-11-14 15:25:23', 'HD-5822-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240506-8', 4, 5, NULL, '2024-05-06 12:18:27', '2025-11-14 15:25:23', 'HD-5177-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240507-17', 2, 15, NULL, '2024-05-07 17:28:54', '2025-11-14 15:25:23', 'HD-7418-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240510-5', 1, 5, NULL, '2024-05-10 09:33:32', '2025-11-14 15:25:23', 'HD-2561-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240512-21', 7, 6, NULL, '2024-05-12 14:34:16', '2025-11-14 15:25:23', 'HD-7548-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240513-19', 5, 6, NULL, '2024-05-13 08:50:11', '2025-11-14 15:25:23', 'HD-2062-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240514-13', 2, 2, NULL, '2024-05-14 18:06:54', '2025-11-14 15:25:23', 'HD-4666-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240515-23', 10, 15, NULL, '2024-05-15 08:44:38', '2025-11-14 15:25:23', 'HD-7144-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240515-3', 5, 2, NULL, '2024-05-15 09:21:17', '2025-11-14 15:25:23', 'HD-2726-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240518-0', 7, 1, NULL, '2024-05-18 16:59:43', '2025-11-14 15:25:23', 'HD-9196-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240519-1', 9, 1, NULL, '2024-05-19 11:38:20', '2025-11-14 15:25:23', 'HD-9807-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240519-18', 9, 1, NULL, '2024-05-19 18:45:00', '2025-11-14 15:25:23', 'HD-2449-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240521-10', 1, 15, NULL, '2024-05-21 09:28:05', '2025-11-14 15:25:23', 'HD-8820-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240523-20', 10, 2, NULL, '2024-05-23 12:48:53', '2025-11-14 15:25:23', 'HD-8758-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240523-6', 9, 6, NULL, '2024-05-23 08:54:30', '2025-11-14 15:25:23', 'HD-7332-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240524-4', 8, 7, NULL, '2024-05-24 09:20:21', '2025-11-14 15:25:23', 'HD-9387-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240528-24', 10, 2, NULL, '2024-05-28 18:28:52', '2025-11-14 15:25:23', 'HD-5942-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240601-19', 4, 5, NULL, '2024-06-01 17:49:45', '2025-11-14 15:25:23', 'HD-9549-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240602-20', 2, 1, NULL, '2024-06-02 13:02:50', '2025-11-14 15:25:23', 'HD-1921-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240610-22', 6, 5, NULL, '2024-06-10 19:41:43', '2025-11-14 15:25:23', 'HD-6954-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240611-21', 2, 6, NULL, '2024-06-11 13:16:59', '2025-11-14 15:25:23', 'HD-1011-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240611-23', 4, 1, NULL, '2024-06-11 18:27:32', '2025-11-14 15:25:23', 'HD-1194-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240614-2', 9, 7, NULL, '2024-06-14 13:02:47', '2025-11-14 15:25:23', 'HD-1934-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240616-12', 4, 5, NULL, '2024-06-16 12:09:45', '2025-11-14 15:25:23', 'HD-5091-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240616-5', 2, 5, NULL, '2024-06-16 11:05:29', '2025-11-14 15:25:23', 'HD-9653-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240617-18', 1, 2, NULL, '2024-06-17 12:18:24', '2025-11-14 15:25:23', 'HD-4996-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240618-16', 2, 5, NULL, '2024-06-18 12:58:48', '2025-11-14 15:25:23', 'HD-4023-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240619-9', 8, 1, NULL, '2024-06-19 16:35:54', '2025-11-14 15:25:23', 'HD-4124-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240620-6', 9, 7, NULL, '2024-06-20 18:30:52', '2025-11-14 15:25:23', 'HD-7552-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240621-3', 9, 2, NULL, '2024-06-21 13:22:23', '2025-11-14 15:25:23', 'HD-6389-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240622-24', 2, 7, NULL, '2024-06-22 19:52:21', '2025-11-14 15:25:23', 'HD-8291-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240624-17', 2, 1, NULL, '2024-06-24 09:06:18', '2025-11-14 15:25:23', 'HD-3289-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240625-0', 2, 6, NULL, '2024-06-25 09:08:18', '2025-11-14 15:25:23', 'HD-8571-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240625-14', 6, 2, NULL, '2024-06-25 15:52:26', '2025-11-14 15:25:23', 'HD-4993-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240625-7', 5, 5, NULL, '2024-06-25 10:33:13', '2025-11-14 15:25:23', 'HD-7252-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240626-8', 1, 15, NULL, '2024-06-26 13:56:10', '2025-11-14 15:25:23', 'HD-2281-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240627-1', 2, 2, NULL, '2024-06-27 10:16:47', '2025-11-14 15:25:23', 'HD-6647-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240627-15', 2, 1, NULL, '2024-06-27 18:51:32', '2025-11-14 15:25:23', 'HD-7394-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240627-4', 1, 6, NULL, '2024-06-27 08:28:18', '2025-11-14 15:25:23', 'HD-7032-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240628-13', 1, 6, NULL, '2024-06-28 16:57:35', '2025-11-14 15:25:23', 'HD-2979-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240629-11', 1, 1, NULL, '2024-06-29 17:05:03', '2025-11-14 15:25:23', 'HD-1801-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240630-10', 6, 1, NULL, '2024-06-30 08:16:17', '2025-11-14 15:25:23', 'HD-8065-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240702-7', 5, 7, NULL, '2024-07-02 12:47:45', '2025-11-14 15:25:23', 'HD-6924-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240703-8', 9, 6, NULL, '2024-07-03 09:27:50', '2025-11-14 15:25:23', 'HD-9429-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240704-11', 5, 2, NULL, '2024-07-04 17:36:38', '2025-11-14 15:25:23', 'HD-7372-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240704-20', 8, 2, NULL, '2024-07-04 15:43:46', '2025-11-14 15:25:23', 'HD-7575-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240704-21', 5, 1, NULL, '2024-07-04 11:01:17', '2025-11-14 15:25:23', 'HD-5761-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240706-12', 5, 2, NULL, '2024-07-06 10:31:00', '2025-11-14 15:25:23', 'HD-5081-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240706-2', 4, 1, NULL, '2024-07-06 10:21:17', '2025-11-14 15:25:23', 'HD-7123-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240707-15', 5, 6, NULL, '2024-07-07 14:07:58', '2025-11-14 15:25:23', 'HD-1372-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240707-3', 8, 7, NULL, '2024-07-07 14:17:44', '2025-11-14 15:25:23', 'HD-2490-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240710-10', 6, 2, NULL, '2024-07-10 18:39:30', '2025-11-14 15:25:23', 'HD-7336-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240710-14', 8, 1, NULL, '2024-07-10 11:23:10', '2025-11-14 15:25:23', 'HD-1214-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240711-22', 7, 6, NULL, '2024-07-11 08:21:32', '2025-11-14 15:25:23', 'HD-1061-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240713-17', 8, 6, NULL, '2024-07-13 14:32:05', '2025-11-14 15:25:23', 'HD-9663-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240714-5', 3, 7, NULL, '2024-07-14 19:38:14', '2025-11-14 15:25:23', 'HD-8134-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240715-23', 8, 5, NULL, '2024-07-15 10:31:03', '2025-11-14 15:25:23', 'HD-1683-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240718-4', 9, 7, NULL, '2024-07-18 13:24:48', '2025-11-14 15:25:23', 'HD-1013-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240719-24', 2, 6, NULL, '2024-07-19 18:24:28', '2025-11-14 15:25:23', 'HD-8015-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240723-18', 2, 2, NULL, '2024-07-23 18:15:35', '2025-11-14 15:25:23', 'HD-9040-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240723-9', 7, 15, NULL, '2024-07-23 09:16:05', '2025-11-14 15:25:23', 'HD-2155-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240724-13', 7, 6, NULL, '2024-07-24 16:10:50', '2025-11-14 15:25:23', 'HD-9654-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240725-1', 2, 2, NULL, '2024-07-25 14:16:47', '2025-11-14 15:25:23', 'HD-4808-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240727-6', 6, 2, NULL, '2024-07-27 11:57:53', '2025-11-14 15:25:23', 'HD-3077-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240728-0', 8, 2, NULL, '2024-07-28 14:56:06', '2025-11-14 15:25:23', 'HD-8963-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240731-16', 4, 5, NULL, '2024-07-31 11:22:05', '2025-11-14 15:25:23', 'HD-7588-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240731-19', 8, 7, NULL, '2024-07-31 11:20:57', '2025-11-14 15:25:23', 'HD-1053-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240801-17', 3, 6, NULL, '2024-08-01 14:32:10', '2025-11-14 15:25:23', 'HD-8498-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240803-18', 6, 1, NULL, '2024-08-03 09:32:14', '2025-11-14 15:25:23', 'HD-2337-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240803-7', 6, 2, NULL, '2024-08-03 08:04:08', '2025-11-14 15:25:23', 'HD-3186-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240804-10', 7, 1, NULL, '2024-08-04 15:43:46', '2025-11-14 15:25:23', 'HD-7922-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240806-16', 7, 1, NULL, '2024-08-06 17:17:06', '2025-11-14 15:25:23', 'HD-2056-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240807-2', 3, 15, NULL, '2024-08-07 09:57:25', '2025-11-14 15:25:23', 'HD-3510-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240809-6', 8, 5, NULL, '2024-08-09 10:07:00', '2025-11-14 15:25:23', 'HD-1385-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240810-1', 9, 1, NULL, '2024-08-10 17:55:18', '2025-11-14 15:25:23', 'HD-4393-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240810-19', 10, 5, NULL, '2024-08-10 16:31:30', '2025-11-14 15:25:23', 'HD-7812-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240811-5', 7, 15, NULL, '2024-08-11 08:15:04', '2025-11-14 15:25:23', 'HD-6882-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20240811-8', 5, 7, NULL, '2024-08-11 15:04:32', '2025-11-14 15:25:23', 'HD-9975-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240815-11', 3, 2, NULL, '2024-08-15 14:11:22', '2025-11-14 15:25:23', 'HD-1234-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240815-12', 5, 6, NULL, '2024-08-15 16:11:47', '2025-11-14 15:25:23', 'HD-2241-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240815-24', 9, 5, NULL, '2024-08-15 14:28:39', '2025-11-14 15:25:23', 'HD-6504-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240817-4', 8, 1, NULL, '2024-08-17 13:33:28', '2025-11-14 15:25:23', 'HD-6799-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240821-3', 4, 7, NULL, '2024-08-21 09:45:19', '2025-11-14 15:25:23', 'HD-4484-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240822-21', 5, 15, NULL, '2024-08-22 16:30:23', '2025-11-14 15:25:23', 'HD-1023-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240822-23', 9, 7, NULL, '2024-08-22 17:51:53', '2025-11-14 15:25:23', 'HD-8661-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240823-22', 6, 1, NULL, '2024-08-23 12:35:51', '2025-11-14 15:25:23', 'HD-3241-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240824-9', 9, 7, NULL, '2024-08-24 18:56:07', '2025-11-14 15:25:23', 'HD-7220-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240828-0', 1, 5, NULL, '2024-08-28 14:03:38', '2025-11-14 15:25:23', 'HD-7380-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240828-14', 10, 1, NULL, '2024-08-28 18:47:16', '2025-11-14 15:25:23', 'HD-5241-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20240829-13', 5, 1, NULL, '2024-08-29 19:59:05', '2025-11-14 15:25:23', 'HD-3065-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240829-15', 3, 7, NULL, '2024-08-29 19:55:47', '2025-11-14 15:25:23', 'HD-7600-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240829-20', 2, 7, NULL, '2024-08-29 09:52:56', '2025-11-14 15:25:23', 'HD-9811-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240902-22', 1, 15, NULL, '2024-09-02 10:49:30', '2025-11-14 15:25:23', 'HD-7255-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240903-2', 3, 7, NULL, '2024-09-03 17:50:44', '2025-11-14 15:25:23', 'HD-5842-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240903-23', 8, 7, NULL, '2024-09-03 16:26:01', '2025-11-14 15:25:23', 'HD-6446-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20240904-11', 10, 15, NULL, '2024-09-04 11:09:52', '2025-11-14 15:25:23', 'HD-4706-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240904-6', 9, 7, NULL, '2024-09-04 14:34:06', '2025-11-14 15:25:23', 'HD-3191-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240905-17', 3, 1, NULL, '2024-09-05 09:56:24', '2025-11-14 15:25:23', 'HD-9838-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240906-4', 4, 6, NULL, '2024-09-06 18:35:25', '2025-11-14 15:25:23', 'HD-2622-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240907-18', 7, 5, NULL, '2024-09-07 17:24:33', '2025-11-14 15:25:23', 'HD-9593-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240908-1', 2, 15, NULL, '2024-09-08 11:35:10', '2025-11-14 15:25:23', 'HD-3102-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240908-13', 7, 7, NULL, '2024-09-08 16:46:47', '2025-11-14 15:25:23', 'HD-3732-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240909-12', 7, 1, NULL, '2024-09-09 17:12:39', '2025-11-14 15:25:23', 'HD-8355-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240909-24', 5, 2, NULL, '2024-09-09 14:47:22', '2025-11-14 15:25:23', 'HD-2581-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20240910-19', 5, 15, NULL, '2024-09-10 13:14:50', '2025-11-14 15:25:23', 'HD-4840-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240911-21', 1, 2, NULL, '2024-09-11 18:28:41', '2025-11-14 15:25:23', 'HD-6458-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240912-16', 3, 7, NULL, '2024-09-12 19:40:26', '2025-11-14 15:25:23', 'HD-7772-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20240912-7', 10, 2, NULL, '2024-09-12 09:16:09', '2025-11-14 15:25:23', 'HD-9485-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20240914-8', 4, 6, NULL, '2024-09-14 16:13:00', '2025-11-14 15:25:23', 'HD-5113-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240915-15', 4, 1, NULL, '2024-09-15 17:30:09', '2025-11-14 15:25:23', 'HD-5109-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20240916-10', 3, 6, NULL, '2024-09-16 14:18:49', '2025-11-14 15:25:23', 'HD-9208-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240916-14', 8, 15, NULL, '2024-09-16 10:39:31', '2025-11-14 15:25:23', 'HD-2716-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20240916-3', 5, 6, NULL, '2024-09-16 15:31:48', '2025-11-14 15:25:23', 'HD-2956-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20240920-5', 5, 6, NULL, '2024-09-20 11:29:35', '2025-11-14 15:25:23', 'HD-5629-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20240923-20', 1, 1, NULL, '2024-09-23 10:34:21', '2025-11-14 15:25:23', 'HD-9281-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20240925-9', 2, 6, NULL, '2024-09-25 14:20:02', '2025-11-14 15:25:23', 'HD-1520-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20240930-0', 8, 1, NULL, '2024-09-30 17:49:50', '2025-11-14 15:25:23', 'HD-5753-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241001-7', 1, 1, NULL, '2024-10-01 17:48:41', '2025-11-14 15:25:23', 'HD-5210-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20241002-3', 10, 1, NULL, '2024-10-02 18:01:36', '2025-11-14 15:25:23', 'HD-7792-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241002-4', 5, 6, NULL, '2024-10-02 16:37:51', '2025-11-14 15:25:23', 'HD-4333-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241005-16', 9, 1, NULL, '2024-10-05 08:32:41', '2025-11-14 15:25:23', 'HD-6288-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241005-18', 3, 6, NULL, '2024-10-05 11:04:29', '2025-11-14 15:25:23', 'HD-8443-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241006-24', 3, 5, NULL, '2024-10-06 15:27:30', '2025-11-14 15:25:23', 'HD-4355-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241009-1', 10, 1, NULL, '2024-10-09 08:23:48', '2025-11-14 15:25:23', 'HD-4442-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241009-19', 5, 6, NULL, '2024-10-09 12:12:48', '2025-11-14 15:25:23', 'HD-8147-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241012-0', 4, 15, NULL, '2024-10-12 09:37:38', '2025-11-14 15:25:23', 'HD-8412-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241012-6', 5, 1, NULL, '2024-10-12 10:46:21', '2025-11-14 15:25:23', 'HD-7620-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20241017-8', 8, 1, NULL, '2024-10-17 15:24:11', '2025-11-14 15:25:23', 'HD-2867-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241020-10', 5, 6, NULL, '2024-10-20 17:12:37', '2025-11-14 15:25:23', 'HD-8472-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241021-15', 6, 1, NULL, '2024-10-21 18:17:53', '2025-11-14 15:25:23', 'HD-5764-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241022-14', 8, 5, NULL, '2024-10-22 17:44:23', '2025-11-14 15:25:23', 'HD-2405-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20241023-11', 4, 1, NULL, '2024-10-23 19:47:56', '2025-11-14 15:25:23', 'HD-2730-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20241024-2', 1, 1, NULL, '2024-10-24 14:27:41', '2025-11-14 15:25:23', 'HD-5438-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20241024-21', 5, 5, NULL, '2024-10-24 08:48:58', '2025-11-14 15:25:23', 'HD-8999-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20241025-12', 6, 6, NULL, '2024-10-25 17:43:08', '2025-11-14 15:25:23', 'HD-9686-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241025-17', 6, 6, NULL, '2024-10-25 11:08:48', '2025-11-14 15:25:23', 'HD-2435-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241026-22', 7, 15, NULL, '2024-10-26 12:31:26', '2025-11-14 15:25:23', 'HD-9113-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241026-5', 10, 2, NULL, '2024-10-26 17:17:09', '2025-11-14 15:25:23', 'HD-1267-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241027-13', 5, 1, NULL, '2024-10-27 09:10:23', '2025-11-14 15:25:23', 'HD-4992-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241027-23', 1, 2, NULL, '2024-10-27 11:08:41', '2025-11-14 15:25:23', 'HD-2164-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241030-20', 3, 6, NULL, '2024-10-30 17:12:34', '2025-11-14 15:25:23', 'HD-3841-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20241031-9', 2, 15, NULL, '2024-10-31 09:44:16', '2025-11-14 15:25:23', 'HD-2717-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241102-2', 6, 2, NULL, '2024-11-02 14:46:10', '2025-11-14 15:25:23', 'HD-1060-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20241105-5', 6, 15, NULL, '2024-11-05 12:24:57', '2025-11-14 15:25:23', 'HD-5149-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241106-13', 8, 6, NULL, '2024-11-06 13:45:24', '2025-11-14 15:25:23', 'HD-3569-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20241109-10', 3, 5, NULL, '2024-11-09 10:05:54', '2025-11-14 15:25:23', 'HD-1397-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241109-8', 4, 6, NULL, '2024-11-09 09:41:05', '2025-11-14 15:25:23', 'HD-4279-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20241110-11', 10, 15, NULL, '2024-11-10 10:02:36', '2025-11-14 15:25:23', 'HD-7206-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20241110-21', 3, 15, NULL, '2024-11-10 19:00:02', '2025-11-14 15:25:23', 'HD-4194-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241111-1', 7, 15, NULL, '2024-11-11 08:02:09', '2025-11-14 15:25:23', 'HD-7351-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241111-17', 8, 7, NULL, '2024-11-11 17:56:18', '2025-11-14 15:25:23', 'HD-5175-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20241116-15', 10, 7, NULL, '2024-11-16 16:01:00', '2025-11-14 15:25:23', 'HD-2822-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241116-16', 2, 6, NULL, '2024-11-16 08:36:59', '2025-11-14 15:25:23', 'HD-6585-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241116-20', 8, 1, NULL, '2024-11-16 19:06:48', '2025-11-14 15:25:23', 'HD-5462-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20241118-22', 1, 1, NULL, '2024-11-18 18:26:39', '2025-11-14 15:25:23', 'HD-6554-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241120-3', 5, 2, NULL, '2024-11-20 14:57:04', '2025-11-14 15:25:23', 'HD-6388-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241122-6', 6, 2, NULL, '2024-11-22 15:50:24', '2025-11-14 15:25:23', 'HD-2280-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241123-0', 8, 5, NULL, '2024-11-23 18:04:47', '2025-11-14 15:25:23', 'HD-9233-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241126-23', 1, 2, NULL, '2024-11-26 09:55:22', '2025-11-14 15:25:23', 'HD-2329-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241127-12', 4, 1, NULL, '2024-11-27 14:57:14', '2025-11-14 15:25:23', 'HD-9944-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20241127-4', 10, 5, NULL, '2024-11-27 11:34:08', '2025-11-14 15:25:23', 'HD-5736-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1);
INSERT INTO `pedido` (`numeroPedido`, `idCliente`, `idUsuarioCreo`, `idUsuarioModifico`, `fechaPedido`, `fechaModificacion`, `codigoSeguimiento`, `descuentoOrden`, `idMotivoCancelacion`, `observacionCancelacion`, `fechaCancelacion`, `idUsuarioCancelo`, `idEstado`, `estaActivo`, `dummyUpdate`, `idEmpresaEnvio`) VALUES
('PED-SIM-20241128-14', 7, 6, NULL, '2024-11-28 09:59:31', '2025-11-14 15:25:23', 'HD-6849-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241128-18', 6, 7, NULL, '2024-11-28 16:49:00', '2025-11-14 15:25:23', 'HD-7037-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20241128-19', 7, 1, NULL, '2024-11-28 17:09:25', '2025-11-14 15:25:23', 'HD-4640-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20241128-9', 5, 7, NULL, '2024-11-28 08:17:27', '2025-11-14 15:25:23', 'HD-1090-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241129-24', 9, 15, NULL, '2024-11-29 17:01:47', '2025-11-14 15:25:23', 'HD-8527-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241130-7', 7, 6, NULL, '2024-11-30 13:13:52', '2025-11-14 15:25:23', 'HD-2371-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241201-12', 6, 5, NULL, '2024-12-01 16:30:24', '2025-11-14 15:25:23', 'HD-3271-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20241201-15', 3, 2, NULL, '2024-12-01 10:54:59', '2025-11-14 15:25:23', 'HD-8242-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241202-13', 5, 1, NULL, '2024-12-02 14:40:41', '2025-11-14 15:25:23', 'HD-3403-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241203-14', 9, 6, NULL, '2024-12-03 17:52:53', '2025-11-14 15:25:23', 'HD-9287-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241203-2', 8, 6, NULL, '2024-12-03 15:45:00', '2025-11-14 15:25:23', 'HD-8231-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20241203-23', 8, 2, NULL, '2024-12-03 15:01:10', '2025-11-14 15:25:23', 'HD-3293-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241207-10', 4, 7, NULL, '2024-12-07 11:54:36', '2025-11-14 15:25:23', 'HD-8772-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20241208-20', 4, 2, NULL, '2024-12-08 13:39:52', '2025-11-14 15:25:23', 'HD-5986-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241209-7', 4, 15, NULL, '2024-12-09 16:31:34', '2025-11-14 15:25:23', 'HD-2612-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241210-5', 4, 6, NULL, '2024-12-10 14:57:02', '2025-11-14 15:25:23', 'HD-3104-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20241212-11', 9, 7, NULL, '2024-12-12 10:47:26', '2025-11-14 15:25:23', 'HD-6682-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241213-1', 7, 5, NULL, '2024-12-13 09:19:19', '2025-11-14 15:25:23', 'HD-5103-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241213-19', 7, 7, NULL, '2024-12-13 14:29:49', '2025-11-14 15:25:23', 'HD-4467-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241214-4', 7, 2, NULL, '2024-12-14 10:39:44', '2025-11-14 15:25:23', 'HD-6027-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241217-24', 5, 15, NULL, '2024-12-17 08:26:09', '2025-11-14 15:25:23', 'HD-6738-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241217-6', 3, 5, NULL, '2024-12-17 08:29:21', '2025-11-14 15:25:23', 'HD-5609-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20241218-22', 8, 5, NULL, '2024-12-18 15:24:12', '2025-11-14 15:25:23', 'HD-6831-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20241219-0', 4, 6, NULL, '2024-12-19 17:59:39', '2025-11-14 15:25:23', 'HD-7328-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20241223-9', 2, 1, NULL, '2024-12-23 16:12:57', '2025-11-14 15:25:23', 'HD-6149-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241225-21', 9, 2, NULL, '2024-12-25 08:02:59', '2025-11-14 15:25:23', 'HD-7762-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20241226-8', 10, 1, NULL, '2024-12-26 15:32:55', '2025-11-14 15:25:23', 'HD-1367-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20241228-17', 3, 2, NULL, '2024-12-28 16:57:37', '2025-11-14 15:25:23', 'HD-9546-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20241230-16', 7, 15, NULL, '2024-12-30 10:03:46', '2025-11-14 15:25:23', 'HD-6633-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20241230-18', 6, 15, NULL, '2024-12-30 13:29:00', '2025-11-14 15:25:23', 'HD-3529-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20241230-3', 9, 6, NULL, '2024-12-30 10:14:30', '2025-11-14 15:25:23', 'HD-5743-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250101-14', 2, 6, NULL, '2025-01-01 11:23:03', '2025-11-14 15:25:23', 'HD-8132-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250101-15', 5, 1, NULL, '2025-01-01 16:39:05', '2025-11-14 15:25:23', 'HD-4431-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250101-24', 6, 15, NULL, '2025-01-01 15:56:51', '2025-11-14 15:25:23', 'HD-5760-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250101-9', 7, 2, NULL, '2025-01-01 08:59:55', '2025-11-14 15:25:23', 'HD-5510-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250102-4', 2, 1, NULL, '2025-01-02 08:17:11', '2025-11-14 15:25:23', 'HD-9268-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250102-6', 9, 15, NULL, '2025-01-02 09:16:08', '2025-11-14 15:25:23', 'HD-1815-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250104-19', 8, 5, NULL, '2025-01-04 14:30:52', '2025-11-14 15:25:23', 'HD-7268-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250106-7', 10, 2, NULL, '2025-01-06 17:17:09', '2025-11-14 15:25:23', 'HD-2898-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250108-18', 4, 1, NULL, '2025-01-08 11:58:50', '2025-11-14 15:25:23', 'HD-9684-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250110-10', 9, 7, NULL, '2025-01-10 09:43:12', '2025-11-14 15:25:23', 'HD-2729-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250111-23', 10, 6, NULL, '2025-01-11 09:28:04', '2025-11-14 15:25:23', 'HD-1593-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250112-17', 1, 15, NULL, '2025-01-12 14:45:03', '2025-11-14 15:25:23', 'HD-7777-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250112-8', 8, 15, NULL, '2025-01-12 09:28:02', '2025-11-14 15:25:23', 'HD-6109-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250119-2', 7, 6, NULL, '2025-01-19 13:31:15', '2025-11-14 15:25:23', 'HD-6216-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250119-21', 2, 1, NULL, '2025-01-19 17:01:50', '2025-11-14 15:25:23', 'HD-2754-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250121-11', 9, 6, NULL, '2025-01-21 13:18:08', '2025-11-14 15:25:23', 'HD-3119-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250122-22', 8, 5, NULL, '2025-01-22 13:09:26', '2025-11-14 15:25:23', 'HD-6337-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250122-3', 10, 6, NULL, '2025-01-22 16:35:45', '2025-11-14 15:25:23', 'HD-3328-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250123-12', 8, 7, NULL, '2025-01-23 11:13:17', '2025-11-14 15:25:23', 'HD-5630-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250123-5', 7, 6, NULL, '2025-01-23 14:35:17', '2025-11-14 15:25:23', 'HD-8166-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250125-16', 9, 2, NULL, '2025-01-25 09:21:23', '2025-11-14 15:25:23', 'HD-4945-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250128-0', 3, 15, NULL, '2025-01-28 14:51:45', '2025-11-14 15:25:23', 'HD-8226-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250128-13', 4, 15, NULL, '2025-01-28 08:45:30', '2025-11-14 15:25:23', 'HD-7299-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250131-1', 3, 5, NULL, '2025-01-31 18:22:16', '2025-11-14 15:25:23', 'HD-1816-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250131-20', 9, 6, NULL, '2025-01-31 12:55:31', '2025-11-14 15:25:23', 'HD-4184-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250201-11', 9, 7, NULL, '2025-02-01 15:59:10', '2025-11-14 15:25:23', 'HD-5473-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250202-14', 1, 2, NULL, '2025-02-02 18:02:37', '2025-11-14 15:25:23', 'HD-4814-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250204-19', 4, 6, NULL, '2025-02-04 19:14:25', '2025-11-14 15:25:23', 'HD-6652-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250205-13', 4, 15, NULL, '2025-02-05 14:15:37', '2025-11-14 15:25:23', 'HD-8819-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250206-2', 5, 15, NULL, '2025-02-06 08:38:04', '2025-11-14 15:25:23', 'HD-5141-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250209-0', 4, 5, NULL, '2025-02-09 16:47:44', '2025-11-14 15:25:23', 'HD-7248-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250209-1', 4, 1, NULL, '2025-02-09 14:59:16', '2025-11-14 15:25:23', 'HD-1821-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250209-22', 10, 15, NULL, '2025-02-09 11:42:37', '2025-11-14 15:25:23', 'HD-4359-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250210-10', 5, 6, NULL, '2025-02-10 16:23:55', '2025-11-14 15:25:23', 'HD-6334-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250212-9', 3, 1, NULL, '2025-02-12 13:57:25', '2025-11-14 15:25:23', 'HD-8595-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250213-12', 8, 7, NULL, '2025-02-13 18:11:15', '2025-11-14 15:25:23', 'HD-4976-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250213-20', 8, 15, NULL, '2025-02-13 12:24:00', '2025-11-14 15:25:23', 'HD-7094-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250213-21', 2, 7, NULL, '2025-02-13 16:13:57', '2025-11-14 15:25:23', 'HD-1546-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250213-7', 4, 7, NULL, '2025-02-13 12:29:22', '2025-11-14 15:25:23', 'HD-3446-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250214-18', 7, 1, NULL, '2025-02-14 13:44:22', '2025-11-14 15:25:23', 'HD-2595-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250215-16', 6, 1, NULL, '2025-02-15 08:35:51', '2025-11-14 15:25:23', 'HD-1634-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250217-8', 1, 5, NULL, '2025-02-17 17:07:17', '2025-11-14 15:25:23', 'HD-8386-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250220-23', 2, 5, NULL, '2025-02-20 14:26:41', '2025-11-14 15:25:23', 'HD-9033-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250222-3', 2, 2, NULL, '2025-02-22 08:50:07', '2025-11-14 15:25:23', 'HD-1007-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250222-5', 8, 2, NULL, '2025-02-22 10:49:25', '2025-11-14 15:25:23', 'HD-3932-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250225-24', 7, 7, NULL, '2025-02-25 12:23:45', '2025-11-14 15:25:23', 'HD-6644-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250226-4', 9, 2, NULL, '2025-02-26 16:44:36', '2025-11-14 15:25:23', 'HD-2426-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250227-15', 10, 7, NULL, '2025-02-27 17:17:57', '2025-11-14 15:25:23', 'HD-9194-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250227-17', 6, 1, NULL, '2025-02-27 16:32:38', '2025-11-14 15:25:23', 'HD-1699-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250227-6', 8, 2, NULL, '2025-02-27 17:10:26', '2025-11-14 15:25:23', 'HD-6909-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250304-17', 5, 5, NULL, '2025-03-04 15:54:38', '2025-11-14 15:25:23', 'HD-1453-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250306-23', 9, 2, NULL, '2025-03-06 15:42:34', '2025-11-14 15:25:23', 'HD-3537-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250306-6', 2, 2, NULL, '2025-03-06 16:09:31', '2025-11-14 15:25:23', 'HD-3328-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250307-0', 7, 1, NULL, '2025-03-07 12:14:04', '2025-11-14 15:25:23', 'HD-5028-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250309-1', 9, 2, NULL, '2025-03-09 16:54:19', '2025-11-14 15:25:23', 'HD-5160-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250309-13', 6, 15, NULL, '2025-03-09 08:25:58', '2025-11-14 15:25:23', 'HD-9714-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250309-9', 2, 7, NULL, '2025-03-09 13:33:22', '2025-11-14 15:25:23', 'HD-5096-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250310-11', 8, 1, NULL, '2025-03-10 09:33:28', '2025-11-14 15:25:23', 'HD-4336-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250311-7', 10, 1, NULL, '2025-03-11 16:22:48', '2025-11-14 15:25:23', 'HD-5393-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250312-20', 9, 2, NULL, '2025-03-12 09:19:22', '2025-11-14 15:25:23', 'HD-3957-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250312-8', 6, 15, NULL, '2025-03-12 15:53:38', '2025-11-14 15:25:23', 'HD-2607-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250313-2', 6, 1, NULL, '2025-03-13 08:51:13', '2025-11-14 15:25:23', 'HD-9165-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250315-10', 3, 6, NULL, '2025-03-15 15:48:07', '2025-11-14 15:25:23', 'HD-1008-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250315-21', 2, 15, NULL, '2025-03-15 19:16:35', '2025-11-14 15:25:23', 'HD-3541-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250317-12', 1, 15, NULL, '2025-03-17 10:15:45', '2025-11-14 15:25:23', 'HD-4681-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250317-22', 4, 15, NULL, '2025-03-17 10:35:13', '2025-11-14 15:25:23', 'HD-2786-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250317-4', 9, 6, NULL, '2025-03-17 18:45:13', '2025-11-14 15:25:23', 'HD-7888-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250318-16', 5, 6, NULL, '2025-03-18 13:30:11', '2025-11-14 15:25:23', 'HD-3082-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250320-18', 8, 15, NULL, '2025-03-20 17:07:12', '2025-11-14 15:25:23', 'HD-8747-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250323-14', 6, 7, NULL, '2025-03-23 15:44:56', '2025-11-14 15:25:23', 'HD-6490-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250325-19', 1, 7, NULL, '2025-03-25 18:06:52', '2025-11-14 15:25:23', 'HD-5211-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250325-5', 1, 6, NULL, '2025-03-25 18:56:10', '2025-11-14 15:25:23', 'HD-5586-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250328-3', 2, 2, NULL, '2025-03-28 09:53:10', '2025-11-14 15:25:23', 'HD-2299-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250329-15', 4, 15, NULL, '2025-03-29 18:42:53', '2025-11-14 15:25:23', 'HD-2734-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250329-24', 6, 7, NULL, '2025-03-29 11:46:58', '2025-11-14 15:25:23', 'HD-5774-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250403-13', 1, 7, NULL, '2025-04-03 08:49:06', '2025-11-14 15:25:23', 'HD-1669-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250403-6', 7, 2, NULL, '2025-04-03 12:32:38', '2025-11-14 15:25:23', 'HD-8023-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250406-2', 4, 2, NULL, '2025-04-06 12:27:08', '2025-11-14 15:25:23', 'HD-7110-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250407-12', 6, 6, NULL, '2025-04-07 16:58:41', '2025-11-14 15:25:23', 'HD-1485-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250408-17', 3, 7, NULL, '2025-04-08 15:11:09', '2025-11-14 15:25:23', 'HD-3094-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250408-21', 1, 2, NULL, '2025-04-08 09:00:36', '2025-11-14 15:25:23', 'HD-1014-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250408-4', 2, 7, NULL, '2025-04-08 16:45:40', '2025-11-14 15:25:23', 'HD-3791-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250409-20', 5, 5, NULL, '2025-04-09 10:06:57', '2025-11-14 15:25:23', 'HD-5911-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250409-23', 6, 5, NULL, '2025-04-09 11:44:44', '2025-11-14 15:25:23', 'HD-8185-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250411-22', 7, 2, NULL, '2025-04-11 16:33:40', '2025-11-14 15:25:23', 'HD-4195-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250411-9', 7, 6, NULL, '2025-04-11 18:09:13', '2025-11-14 15:25:23', 'HD-4420-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250412-16', 9, 6, NULL, '2025-04-12 08:54:30', '2025-11-14 15:25:23', 'HD-8515-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250412-5', 9, 2, NULL, '2025-04-12 10:41:59', '2025-11-14 15:25:23', 'HD-1319-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250413-24', 4, 5, NULL, '2025-04-13 14:16:50', '2025-11-14 15:25:23', 'HD-7049-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250413-7', 1, 15, NULL, '2025-04-13 17:37:47', '2025-11-14 15:25:23', 'HD-3289-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250414-3', 9, 7, NULL, '2025-04-14 12:30:28', '2025-11-14 15:25:23', 'HD-3299-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250415-1', 9, 15, NULL, '2025-04-15 16:57:44', '2025-11-14 15:25:23', 'HD-5630-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250417-10', 2, 7, NULL, '2025-04-17 10:19:01', '2025-11-14 15:25:23', 'HD-8253-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250419-14', 2, 15, NULL, '2025-04-19 14:59:12', '2025-11-14 15:25:23', 'HD-5375-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250420-0', 2, 1, NULL, '2025-04-20 11:37:12', '2025-11-14 15:25:23', 'HD-1120-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250422-18', 10, 1, NULL, '2025-04-22 11:16:33', '2025-11-14 15:25:23', 'HD-6474-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250423-15', 10, 7, NULL, '2025-04-23 10:52:43', '2025-11-14 15:25:23', 'HD-1012-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250426-19', 3, 15, NULL, '2025-04-26 10:25:30', '2025-11-14 15:25:23', 'HD-2636-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250427-8', 6, 1, NULL, '2025-04-27 08:35:51', '2025-11-14 15:25:23', 'HD-9146-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250429-11', 4, 7, NULL, '2025-04-29 18:31:58', '2025-11-14 15:25:23', 'HD-9827-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250501-5', 10, 6, NULL, '2025-05-01 11:19:47', '2025-11-14 15:25:23', 'HD-2697-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250502-19', 1, 15, NULL, '2025-05-02 16:17:22', '2025-11-14 15:25:23', 'HD-1002-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250502-7', 8, 1, NULL, '2025-05-02 11:25:12', '2025-11-14 15:25:23', 'HD-4917-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250503-18', 2, 5, NULL, '2025-05-03 19:27:30', '2025-11-14 15:25:23', 'HD-2584-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250503-23', 4, 2, NULL, '2025-05-03 09:12:47', '2025-11-14 15:25:23', 'HD-6169-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250504-3', 1, 7, NULL, '2025-05-04 09:18:12', '2025-11-14 15:25:23', 'HD-4094-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250506-0', 4, 5, NULL, '2025-05-06 11:47:08', '2025-11-14 15:25:23', 'HD-9961-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250507-15', 8, 5, NULL, '2025-05-07 18:49:26', '2025-11-14 15:25:23', 'HD-9530-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250508-10', 1, 5, NULL, '2025-05-08 08:19:36', '2025-11-14 15:25:23', 'HD-7766-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250509-20', 10, 7, NULL, '2025-05-09 12:01:00', '2025-11-14 15:25:23', 'HD-9243-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250509-6', 5, 15, NULL, '2025-05-09 19:59:04', '2025-11-14 15:25:23', 'HD-3920-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250513-12', 3, 5, NULL, '2025-05-13 16:21:40', '2025-11-14 15:25:23', 'HD-8867-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250517-24', 9, 5, NULL, '2025-05-17 15:33:54', '2025-11-14 15:25:23', 'HD-4581-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250519-14', 8, 15, NULL, '2025-05-19 11:41:33', '2025-11-14 15:25:23', 'HD-4300-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250519-16', 10, 7, NULL, '2025-05-19 16:44:37', '2025-11-14 15:25:23', 'HD-6760-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250520-1', 6, 15, NULL, '2025-05-20 17:54:14', '2025-11-14 15:25:23', 'HD-1903-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250520-17', 1, 7, NULL, '2025-05-20 12:59:48', '2025-11-14 15:25:23', 'HD-6235-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250523-13', 10, 5, NULL, '2025-05-23 19:36:09', '2025-11-14 15:25:23', 'HD-6466-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250526-2', 9, 15, NULL, '2025-05-26 16:06:25', '2025-11-14 15:25:23', 'HD-3629-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250527-11', 8, 2, NULL, '2025-05-27 15:23:11', '2025-11-14 15:25:23', 'HD-6743-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250527-8', 9, 5, NULL, '2025-05-27 11:58:57', '2025-11-14 15:25:23', 'HD-3834-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250528-22', 5, 7, NULL, '2025-05-28 09:57:27', '2025-11-14 15:25:23', 'HD-6939-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250528-4', 2, 5, NULL, '2025-05-28 15:31:44', '2025-11-14 15:25:23', 'HD-4197-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250529-21', 8, 5, NULL, '2025-05-29 14:06:49', '2025-11-14 15:25:23', 'HD-8165-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250530-9', 10, 5, NULL, '2025-05-30 13:17:10', '2025-11-14 15:25:23', 'HD-9238-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250603-13', 9, 6, NULL, '2025-06-03 18:01:35', '2025-11-14 15:25:23', 'HD-2698-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250604-10', 2, 1, NULL, '2025-06-04 14:32:57', '2025-11-14 15:25:23', 'HD-2775-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250605-18', 4, 6, NULL, '2025-06-05 10:27:45', '2025-11-14 15:25:23', 'HD-4780-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250607-16', 3, 6, NULL, '2025-06-07 14:10:08', '2025-11-14 15:25:23', 'HD-5577-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250608-11', 9, 7, NULL, '2025-06-08 16:47:50', '2025-11-14 15:25:23', 'HD-3547-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250608-15', 5, 2, NULL, '2025-06-08 12:14:02', '2025-11-14 15:25:23', 'HD-9003-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250609-12', 8, 1, NULL, '2025-06-09 09:38:56', '2025-11-14 15:25:23', 'HD-6376-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250609-2', 2, 7, NULL, '2025-06-09 08:11:56', '2025-11-14 15:25:23', 'HD-3872-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250610-8', 4, 2, NULL, '2025-06-10 19:47:08', '2025-11-14 15:25:23', 'HD-8233-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250612-23', 10, 5, NULL, '2025-06-12 18:04:50', '2025-11-14 15:25:23', 'HD-1551-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250614-19', 10, 6, NULL, '2025-06-14 12:21:49', '2025-11-14 15:25:23', 'HD-9053-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250614-5', 8, 5, NULL, '2025-06-14 08:59:44', '2025-11-14 15:25:23', 'HD-3619-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250614-9', 7, 1, NULL, '2025-06-14 15:55:40', '2025-11-14 15:25:23', 'HD-7933-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250617-6', 5, 15, NULL, '2025-06-17 17:07:21', '2025-11-14 15:25:23', 'HD-9811-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250618-22', 7, 1, NULL, '2025-06-18 18:41:44', '2025-11-14 15:25:23', 'HD-6259-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250620-24', 3, 6, NULL, '2025-06-20 15:13:10', '2025-11-14 15:25:23', 'HD-9860-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250621-21', 7, 6, NULL, '2025-06-21 14:34:16', '2025-11-14 15:25:23', 'HD-2527-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250622-20', 5, 6, NULL, '2025-06-22 13:21:19', '2025-11-14 15:25:23', 'HD-9053-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250622-3', 2, 6, NULL, '2025-06-22 15:55:47', '2025-11-14 15:25:23', 'HD-9687-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250623-1', 6, 6, NULL, '2025-06-23 18:13:27', '2025-11-14 15:25:23', 'HD-2278-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250623-7', 10, 5, NULL, '2025-06-23 17:36:44', '2025-11-14 15:25:23', 'HD-8329-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250624-14', 5, 15, NULL, '2025-06-24 17:32:24', '2025-11-14 15:25:23', 'HD-6813-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250624-17', 5, 7, NULL, '2025-06-24 17:30:11', '2025-11-14 15:25:23', 'HD-8078-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250626-4', 9, 7, NULL, '2025-06-26 09:01:46', '2025-11-14 15:25:23', 'HD-9953-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250629-0', 10, 6, NULL, '2025-06-29 11:27:28', '2025-11-14 15:25:23', 'HD-6535-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250701-8', 9, 6, NULL, '2025-07-01 10:53:54', '2025-11-14 15:25:23', 'HD-1815-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250702-4', 10, 2, NULL, '2025-07-02 11:07:52', '2025-11-14 15:25:23', 'HD-6467-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250702-6', 5, 15, NULL, '2025-07-02 09:34:26', '2025-11-14 15:25:23', 'HD-7894-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250703-11', 6, 5, NULL, '2025-07-03 12:26:11', '2025-11-14 15:25:23', 'HD-1072-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250705-24', 1, 2, NULL, '2025-07-05 14:19:00', '2025-11-14 15:25:23', 'HD-7674-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250708-20', 5, 2, NULL, '2025-07-08 14:49:34', '2025-11-14 15:25:23', 'HD-7157-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250709-21', 1, 15, NULL, '2025-07-09 10:17:47', '2025-11-14 15:25:23', 'HD-2764-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250711-12', 9, 15, NULL, '2025-07-11 10:06:50', '2025-11-14 15:25:23', 'HD-9347-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250711-16', 6, 6, NULL, '2025-07-11 15:59:06', '2025-11-14 15:25:23', 'HD-1446-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250712-15', 9, 5, NULL, '2025-07-12 11:25:13', '2025-11-14 15:25:23', 'HD-5190-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250713-23', 9, 7, NULL, '2025-07-13 14:33:05', '2025-11-14 15:25:23', 'HD-2614-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250714-10', 2, 6, NULL, '2025-07-14 08:53:21', '2025-11-14 15:25:23', 'HD-5497-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250715-13', 8, 1, NULL, '2025-07-15 19:25:12', '2025-11-14 15:25:23', 'HD-9646-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250715-5', 2, 2, NULL, '2025-07-15 13:55:11', '2025-11-14 15:25:23', 'HD-3742-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250717-18', 6, 15, NULL, '2025-07-17 18:52:38', '2025-11-14 15:25:23', 'HD-6771-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250718-7', 3, 15, NULL, '2025-07-18 19:07:42', '2025-11-14 15:25:23', 'HD-3631-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250719-1', 7, 1, NULL, '2025-07-19 10:15:40', '2025-11-14 15:25:23', 'HD-5840-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250722-9', 9, 5, NULL, '2025-07-22 15:06:38', '2025-11-14 15:25:23', 'HD-8311-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250725-19', 7, 1, NULL, '2025-07-25 18:55:05', '2025-11-14 15:25:23', 'HD-5038-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250728-14', 9, 7, NULL, '2025-07-28 17:18:09', '2025-11-14 15:25:23', 'HD-8255-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250728-17', 2, 5, NULL, '2025-07-28 12:09:43', '2025-11-14 15:25:23', 'HD-7164-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250728-3', 3, 15, NULL, '2025-07-28 18:32:10', '2025-11-14 15:25:23', 'HD-1056-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250729-2', 4, 5, NULL, '2025-07-29 15:23:06', '2025-11-14 15:25:23', 'HD-9786-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250729-22', 8, 2, NULL, '2025-07-29 13:34:29', '2025-11-14 15:25:23', 'HD-8764-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250730-0', 2, 7, NULL, '2025-07-30 14:55:58', '2025-11-14 15:25:23', 'HD-4466-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250802-15', 2, 6, NULL, '2025-08-02 17:58:25', '2025-11-14 15:25:23', 'HD-4039-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250802-9', 7, 7, NULL, '2025-08-02 16:28:13', '2025-11-14 15:25:23', 'HD-5796-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250803-23', 10, 15, NULL, '2025-08-03 11:18:33', '2025-11-14 15:25:23', 'HD-6863-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250805-10', 10, 2, NULL, '2025-08-05 17:25:50', '2025-11-14 15:25:23', 'HD-6928-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250805-24', 1, 1, NULL, '2025-08-05 15:48:06', '2025-11-14 15:25:23', 'HD-4054-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250805-4', 9, 15, NULL, '2025-08-05 17:28:03', '2025-11-14 15:25:23', 'HD-7484-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250809-0', 2, 6, NULL, '2025-08-09 10:08:07', '2025-11-14 15:25:23', 'HD-6260-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250809-3', 6, 5, NULL, '2025-08-09 13:35:27', '2025-11-14 15:25:23', 'HD-7851-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250812-11', 1, 1, NULL, '2025-08-12 17:48:41', '2025-11-14 15:25:23', 'HD-1475-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250812-21', 2, 7, NULL, '2025-08-12 09:42:03', '2025-11-14 15:25:23', 'HD-9821-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250813-8', 5, 6, NULL, '2025-08-13 19:38:16', '2025-11-14 15:25:23', 'HD-7683-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250815-20', 7, 1, NULL, '2025-08-15 16:15:05', '2025-11-14 15:25:23', 'HD-7955-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250816-19', 4, 7, NULL, '2025-08-16 16:06:19', '2025-11-14 15:25:23', 'HD-6727-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250816-7', 5, 2, NULL, '2025-08-16 10:41:42', '2025-11-14 15:25:23', 'HD-8769-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250817-14', 8, 1, NULL, '2025-08-17 09:58:31', '2025-11-14 15:25:23', 'HD-4666-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250819-2', 5, 15, NULL, '2025-08-19 14:52:49', '2025-11-14 15:25:23', 'HD-5022-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250820-17', 9, 5, NULL, '2025-08-20 15:14:18', '2025-11-14 15:25:23', 'HD-1116-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250820-6', 3, 15, NULL, '2025-08-20 13:34:23', '2025-11-14 15:25:23', 'HD-7509-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250821-12', 3, 7, NULL, '2025-08-21 14:54:46', '2025-11-14 15:25:23', 'HD-6204-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250821-13', 4, 1, NULL, '2025-08-21 17:03:54', '2025-11-14 15:25:23', 'HD-7493-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250821-5', 6, 15, NULL, '2025-08-21 16:33:38', '2025-11-14 15:25:23', 'HD-8856-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250825-1', 10, 2, NULL, '2025-08-25 08:47:52', '2025-11-14 15:25:23', 'HD-2802-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250826-18', 5, 5, NULL, '2025-08-26 18:08:58', '2025-11-14 15:25:23', 'HD-4441-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20250827-16', 9, 15, NULL, '2025-08-27 13:46:25', '2025-11-14 15:25:23', 'HD-3800-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250831-22', 10, 2, NULL, '2025-08-31 12:47:51', '2025-11-14 15:25:23', 'HD-4680-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250901-19', 2, 6, NULL, '2025-09-01 08:01:02', '2025-11-14 15:25:23', 'HD-1999-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250903-18', 9, 1, NULL, '2025-09-03 16:08:38', '2025-11-14 15:25:23', 'HD-3953-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250904-0', 9, 5, NULL, '2025-09-04 09:15:55', '2025-11-14 15:25:23', 'HD-3772-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20250906-2', 1, 2, NULL, '2025-09-06 14:12:19', '2025-11-14 15:25:23', 'HD-6001-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250906-3', 1, 2, NULL, '2025-09-06 10:36:22', '2025-11-14 15:25:23', 'HD-8689-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-SIM-20250907-4', 8, 6, NULL, '2025-09-07 15:30:38', '2025-11-14 15:25:23', 'HD-6446-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250910-15', 7, 5, NULL, '2025-09-10 15:14:16', '2025-11-14 15:25:23', 'HD-5162-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250913-22', 10, 6, NULL, '2025-09-13 16:08:40', '2025-11-14 15:25:23', 'HD-5473-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250913-6', 6, 15, NULL, '2025-09-13 19:38:17', '2025-11-14 15:25:23', 'HD-1881-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250916-20', 1, 6, NULL, '2025-09-16 12:14:08', '2025-11-14 15:25:23', 'HD-9984-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250916-5', 2, 15, NULL, '2025-09-16 13:34:34', '2025-11-14 15:25:23', 'HD-7281-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250916-7', 4, 15, NULL, '2025-09-16 12:13:00', '2025-11-14 15:25:23', 'HD-5455-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250920-1', 1, 5, NULL, '2025-09-20 13:25:40', '2025-11-14 15:25:23', 'HD-4430-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20250920-16', 10, 5, NULL, '2025-09-20 18:15:44', '2025-11-14 15:25:23', 'HD-4788-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20250922-17', 2, 1, NULL, '2025-09-22 18:05:53', '2025-11-14 15:25:23', 'HD-9651-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250923-10', 8, 7, NULL, '2025-09-23 08:58:44', '2025-11-14 15:25:23', 'HD-5895-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250924-11', 7, 5, NULL, '2025-09-24 17:37:42', '2025-11-14 15:25:23', 'HD-8522-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20250925-9', 10, 2, NULL, '2025-09-25 16:55:32', '2025-11-14 15:25:23', 'HD-5925-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20250926-21', 10, 5, NULL, '2025-09-26 15:27:27', '2025-11-14 15:25:23', 'HD-3062-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250927-24', 7, 1, NULL, '2025-09-27 18:49:25', '2025-11-14 15:25:23', 'HD-5533-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20250928-14', 10, 7, NULL, '2025-09-28 08:16:21', '2025-11-14 15:25:23', 'HD-8481-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20250929-13', 1, 7, NULL, '2025-09-29 16:49:54', '2025-11-14 15:25:23', 'HD-6808-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20250929-23', 3, 5, NULL, '2025-09-29 17:12:33', '2025-11-14 15:25:23', 'HD-7597-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20250930-12', 5, 6, NULL, '2025-09-30 09:48:34', '2025-11-14 15:25:23', 'HD-7565-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20250930-8', 9, 7, NULL, '2025-09-30 17:49:52', '2025-11-14 15:25:23', 'HD-5034-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20251001-11', 4, 1, NULL, '2025-10-01 12:51:10', '2025-11-14 15:25:23', 'HD-1476-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20251002-13', 9, 15, NULL, '2025-10-02 19:35:07', '2025-11-14 15:25:23', 'HD-9277-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20251004-0', 6, 5, NULL, '2025-10-04 16:01:07', '2025-11-14 15:25:23', 'HD-4961-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20251005-22', 3, 15, NULL, '2025-10-05 08:33:47', '2025-11-14 15:25:23', 'HD-4972-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20251006-14', 5, 15, NULL, '2025-10-06 10:38:28', '2025-11-14 15:25:23', 'HD-8980-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-SIM-20251006-24', 10, 2, NULL, '2025-10-06 15:36:08', '2025-11-14 15:25:23', 'HD-1988-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20251008-16', 8, 6, NULL, '2025-10-08 17:12:40', '2025-11-14 15:25:23', 'HD-8998-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20251008-3', 2, 15, NULL, '2025-10-08 19:01:14', '2025-11-14 15:25:23', 'HD-2029-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20251010-9', 7, 15, NULL, '2025-10-10 13:17:05', '2025-11-14 15:25:23', 'HD-9150-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 2),
('PED-SIM-20251012-20', 5, 2, NULL, '2025-10-12 12:37:04', '2025-11-14 15:25:23', 'HD-2665-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20251013-15', 8, 7, NULL, '2025-10-13 14:23:23', '2025-11-14 15:25:23', 'HD-2875-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-SIM-20251013-21', 3, 15, NULL, '2025-10-13 19:30:45', '2025-11-14 15:25:23', 'HD-5380-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 1),
('PED-SIM-20251015-7', 9, 2, NULL, '2025-10-15 09:12:42', '2025-11-14 15:25:23', 'HD-8276-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20251018-1', 3, 2, NULL, '2025-10-18 16:47:55', '2025-11-14 15:25:23', 'HD-6242-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20251019-17', 4, 15, NULL, '2025-10-19 12:17:14', '2025-11-14 15:25:23', 'HD-5382-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20251020-12', 6, 7, NULL, '2025-10-20 11:47:59', '2025-11-14 15:25:23', 'HD-7186-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-SIM-20251020-4', 2, 7, NULL, '2025-10-20 19:59:01', '2025-11-14 15:25:23', 'HD-9787-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-SIM-20251022-23', 1, 7, NULL, '2025-10-22 17:44:27', '2025-11-14 15:25:23', 'HD-8378-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20251023-5', 5, 1, NULL, '2025-10-23 12:47:46', '2025-11-14 15:25:23', 'HD-2532-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-SIM-20251023-6', 1, 6, NULL, '2025-10-23 15:51:31', '2025-11-14 15:25:23', 'HD-4524-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20251023-8', 2, 2, NULL, '2025-10-23 14:21:15', '2025-11-14 15:25:23', 'HD-5026-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-SIM-20251026-19', 6, 2, NULL, '2025-10-26 18:03:33', '2025-11-14 15:25:23', 'HD-1559-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 4),
('PED-SIM-20251030-2', 4, 15, NULL, '2025-10-30 15:09:57', '2025-11-14 15:25:23', 'HD-9717-AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-SIM-20251031-10', 9, 2, NULL, '2025-10-31 19:55:44', '2025-11-14 15:25:23', 'HD-6910-AR', 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-SIM-20251031-18', 5, 7, NULL, '2025-10-31 13:32:13', '2025-11-14 15:25:23', 'HD-4399-AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1);

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
('STK-NA-1760665520494', 'IND002', 99),
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
-- Estructura de tabla para la tabla `stock_registro_fallo`
--

CREATE TABLE `stock_registro_fallo` (
  `idRegistroFallo` int(11) NOT NULL,
  `idStock` varchar(50) NOT NULL,
  `fechaRegistro` datetime NOT NULL DEFAULT current_timestamp(),
  `idMotivo` int(11) NOT NULL,
  `estadoPostFallo` int(11) DEFAULT 2,
  `fechaResolucion` datetime DEFAULT NULL,
  `idUsuarioResolucion` int(11) DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `idRackOriginal` int(11) NOT NULL COMMENT 'Rack en el que estaba la unidad antes de ser marcada como No Apta (Para reingreso)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `stock_registro_fallo`
--

INSERT INTO `stock_registro_fallo` (`idRegistroFallo`, `idStock`, `fechaRegistro`, `idMotivo`, `estadoPostFallo`, `fechaResolucion`, `idUsuarioResolucion`, `observaciones`, `idRackOriginal`) VALUES
(1, 'STK-NA-1756247729017', '2025-10-20 00:00:21', 1, NULL, '2025-10-20 00:00:21', NULL, '⚠️ SCRAP: 2 unidades desechadas permanentemente. Sin motivo especificado', 99),
(2, 'STK-NA-1760665520494', '2025-10-20 00:00:24', 1, NULL, '2025-10-20 00:00:24', NULL, '⚠️ SCRAP: 3 unidades desechadas permanentemente. Sin motivo especificado', 99),
(3, 'STK-NA-1756247729017', '2025-11-01 19:24:55', 1, NULL, NULL, NULL, 'Registrado para inspección/reparación', 1),
(4, 'STK-NA-1756247729017', '2025-11-01 19:25:17', 1, NULL, '2025-11-01 19:25:17', NULL, '⚠️ SCRAP: 1 unidades desechadas permanentemente. Sin motivo especificado', 1),
(5, 'STK-NA-1756247729017', '2025-11-01 19:25:34', 1, 1, '2025-11-01 19:25:34', NULL, '✅ REPARADO: 1 unidades arregladas y reingresadas al rack original 1. ', 1);

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
(0, 'Encargado de Pedidos', 'Gestiona el ciclo de vida de los pedidos'),
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
  `contrasena` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `idPersona`, `nombreUsuario`, `contrasena`) VALUES
(1, 10, 'admin', 'admin123'),
(2, 9, 'mariag', '123'),
(5, 5, 'anamtz', '123'),
(6, 6, 'luisrd', '123'),
(7, 7, 'sofiag', '123'),
(15, 8, 'envios', '123');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_tiporol`
--

CREATE TABLE `usuario_tiporol` (
  `idUsuario` int(11) NOT NULL,
  `idTipoRol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `usuario_tiporol`
--

INSERT INTO `usuario_tiporol` (`idUsuario`, `idTipoRol`) VALUES
(1, 1),
(2, 2),
(5, 6),
(6, 6),
(7, 7),
(15, 3);

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
-- Indices de la tabla `empresa_envio`
--
ALTER TABLE `empresa_envio`
  ADD PRIMARY KEY (`idEmpresaEnvio`),
  ADD UNIQUE KEY `uk_nombre_envio` (`nombre`);

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
-- Indices de la tabla `motivo_no_apta`
--
ALTER TABLE `motivo_no_apta`
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
  ADD KEY `fk_pedido_usuario_modifico` (`idUsuarioModifico`),
  ADD KEY `fk_pedido_empresa` (`idEmpresaEnvio`);

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
-- Indices de la tabla `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`idStock`),
  ADD KEY `codigoIndumentaria` (`codigoIndumentaria`),
  ADD KEY `fk_stock_rack` (`idRack`);

--
-- Indices de la tabla `stock_registro_fallo`
--
ALTER TABLE `stock_registro_fallo`
  ADD PRIMARY KEY (`idRegistroFallo`),
  ADD KEY `idStock` (`idStock`),
  ADD KEY `idMotivo` (`idMotivo`),
  ADD KEY `estadoPostFallo` (`estadoPostFallo`),
  ADD KEY `idUsuarioResolucion` (`idUsuarioResolucion`),
  ADD KEY `fk_fallo_rack_original` (`idRackOriginal`);

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
  ADD UNIQUE KEY `idPersona` (`idPersona`);

--
-- Indices de la tabla `usuario_tiporol`
--
ALTER TABLE `usuario_tiporol`
  ADD PRIMARY KEY (`idUsuario`,`idTipoRol`),
  ADD KEY `fk_utr_tiporol` (`idTipoRol`);

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
  MODIFY `idAsignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

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
-- AUTO_INCREMENT de la tabla `empresa_envio`
--
ALTER TABLE `empresa_envio`
  MODIFY `idEmpresaEnvio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT de la tabla `motivo_no_apta`
--
ALTER TABLE `motivo_no_apta`
  MODIFY `idMotivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- AUTO_INCREMENT de la tabla `stock_registro_fallo`
--
ALTER TABLE `stock_registro_fallo`
  MODIFY `idRegistroFallo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  ADD CONSTRAINT `fk_asignacion_pedido_final` FOREIGN KEY (`numeroPedido`) REFERENCES `pedido` (`numeroPedido`),
  ADD CONSTRAINT `fk_asignacion_picker` FOREIGN KEY (`legajoPicker`) REFERENCES `encargadopicker` (`legajo`),
  ADD CONSTRAINT `fk_asignacion_picker_final` FOREIGN KEY (`legajoPicker`) REFERENCES `encargadopicker` (`legajo`);

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
  ADD CONSTRAINT `fk_pedido_empresa` FOREIGN KEY (`idEmpresaEnvio`) REFERENCES `empresa_envio` (`idEmpresaEnvio`),
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
-- Filtros para la tabla `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_rack` FOREIGN KEY (`idRack`) REFERENCES `rack` (`idRack`),
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`codigoIndumentaria`) REFERENCES `indumentaria` (`codigoIndumentaria`);

--
-- Filtros para la tabla `stock_registro_fallo`
--
ALTER TABLE `stock_registro_fallo`
  ADD CONSTRAINT `fk_fallo_motivo` FOREIGN KEY (`idMotivo`) REFERENCES `motivo_no_apta` (`idMotivo`),
  ADD CONSTRAINT `fk_fallo_rack_original` FOREIGN KEY (`idRackOriginal`) REFERENCES `rack` (`idRack`),
  ADD CONSTRAINT `fk_fallo_stock` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`),
  ADD CONSTRAINT `fk_fallo_usuario` FOREIGN KEY (`idUsuarioResolucion`) REFERENCES `usuario` (`idUsuario`),
  ADD CONSTRAINT `stock_registro_fallo_ibfk_1` FOREIGN KEY (`idStock`) REFERENCES `stock` (`idStock`),
  ADD CONSTRAINT `stock_registro_fallo_ibfk_2` FOREIGN KEY (`idMotivo`) REFERENCES `motivo_no_apta` (`idMotivo`),
  ADD CONSTRAINT `stock_registro_fallo_ibfk_4` FOREIGN KEY (`idUsuarioResolucion`) REFERENCES `usuario` (`idUsuario`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_persona` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);

--
-- Filtros para la tabla `usuario_tiporol`
--
ALTER TABLE `usuario_tiporol`
  ADD CONSTRAINT `fk_utr_tiporol` FOREIGN KEY (`idTipoRol`) REFERENCES `tiporol` (`idTipoRol`),
  ADD CONSTRAINT `fk_utr_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`);

--
-- Filtros para la tabla `vendedor`
--
ALTER TABLE `vendedor`
  ADD CONSTRAINT `vendedor_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`idPersona`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
