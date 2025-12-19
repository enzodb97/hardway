-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 18:25:04
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
            SET lastNumeroPedido = CONCAT('PED-', YEAR(orderDate), LPAD(MONTH(orderDate), 2, '0'), LPAD(randomDay, 2, '0'), '-', i);

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
                    CONCAT('DP-', lastNumeroPedido, '-', j), 
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
(47, 'PED-20251015-15', 'LP005', '2025-11-19 11:22:23', NULL, NULL, 'Asignación automática - Pendiente de picking', 0, 0),
(48, 'PED-20251021-16', 'LP005', '2025-11-19 11:22:23', NULL, NULL, 'Asignación automática - Pendiente de picking', 0, 0),
(49, 'PED-20251026-5', 'LP005', '2025-11-19 11:22:23', NULL, NULL, 'Asignación automática - Pendiente de picking', 0, 0),
(50, 'PED-20251029-14', 'LP005', '2025-11-19 11:22:23', NULL, '2025-11-23 20:28:52', 'Asignación automática - Pendiente de picking', 0, 1),
(54, 'PED-20240101-3', 'LP005', '2024-01-01 17:55:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(55, 'PED-20240103-4', 'LP006', '2024-01-03 08:48:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(56, 'PED-20240105-5', 'LP005', '2024-01-05 14:20:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(57, 'PED-20240110-001', 'LP006', '2024-01-10 10:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(58, 'PED-20240110-20', 'LP006', '2024-01-10 08:21:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(59, 'PED-20240110-24', 'LP006', '2024-01-10 09:54:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(60, 'PED-20240110-8', 'LP005', '2024-01-10 10:04:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(61, 'PED-20240111-21', 'LP006', '2024-01-11 19:35:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(62, 'PED-20240112-0', 'LP006', '2024-01-12 09:30:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(63, 'PED-20240112-17', 'LP005', '2024-01-12 09:34:29', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(64, 'PED-20240112-2', 'LP006', '2024-01-12 18:06:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(65, 'PED-20240113-16', 'LP005', '2024-01-13 13:13:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(66, 'PED-20240114-23', 'LP005', '2024-01-14 12:42:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(67, 'PED-20240115-001', 'LP006', '2024-01-15 11:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(68, 'PED-20240115-11', 'LP006', '2024-01-15 11:52:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(69, 'PED-20240115-9', 'LP006', '2024-01-15 18:08:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(70, 'PED-20240116-12', 'LP006', '2024-01-16 12:32:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(71, 'PED-20240117-14', 'LP005', '2024-01-17 08:27:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(72, 'PED-20240117-22', 'LP005', '2024-01-17 19:15:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(73, 'PED-20240120-7', 'LP006', '2024-01-20 19:58:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(74, 'PED-20240124-6', 'LP005', '2024-01-24 17:40:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(75, 'PED-20240125-001', 'LP006', '2024-01-25 13:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(76, 'PED-20240125-1', 'LP005', '2024-01-25 12:19:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(77, 'PED-20240126-13', 'LP006', '2024-01-26 10:35:19', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(78, 'PED-20240127-10', 'LP006', '2024-01-27 18:53:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(79, 'PED-20240127-18', 'LP005', '2024-01-27 13:34:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(80, 'PED-20240128-15', 'LP006', '2024-01-28 14:53:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(81, 'PED-20240130-19', 'LP005', '2024-01-30 19:56:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(82, 'PED-20240201-001', 'LP005', '2024-02-01 14:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(83, 'PED-20240201-23', 'LP006', '2024-02-01 15:57:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(84, 'PED-20240201-6', 'LP006', '2024-02-01 15:57:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(85, 'PED-20240202-19', 'LP006', '2024-02-02 15:02:14', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(86, 'PED-20240203-20', 'LP006', '2024-02-03 19:18:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(87, 'PED-20240203-8', 'LP005', '2024-02-03 17:37:49', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(88, 'PED-20240205-15', 'LP005', '2024-02-05 16:06:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(89, 'PED-20240206-21', 'LP005', '2024-02-06 08:39:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(90, 'PED-20240209-17', 'LP005', '2024-02-09 15:19:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(91, 'PED-20240209-5', 'LP006', '2024-02-09 14:42:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(92, 'PED-20240209-9', 'LP006', '2024-02-09 13:12:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(93, 'PED-20240210-001', 'LP005', '2024-02-10 16:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(94, 'PED-20240211-24', 'LP005', '2024-02-11 12:45:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(95, 'PED-20240212-10', 'LP006', '2024-02-12 17:42:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(96, 'PED-20240214-18', 'LP005', '2024-02-14 14:27:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(97, 'PED-20240215-11', 'LP005', '2024-02-15 10:32:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(98, 'PED-20240215-7', 'LP005', '2024-02-15 18:47:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(99, 'PED-20240218-22', 'LP005', '2024-02-18 12:03:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(100, 'PED-20240218-3', 'LP006', '2024-02-18 08:22:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(101, 'PED-20240220-001', 'LP006', '2024-02-20 18:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(102, 'PED-20240221-14', 'LP005', '2024-02-21 18:16:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(103, 'PED-20240223-12', 'LP006', '2024-02-23 19:36:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(104, 'PED-20240223-2', 'LP006', '2024-02-23 08:00:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(105, 'PED-20240224-1', 'LP006', '2024-02-24 14:30:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(106, 'PED-20240224-13', 'LP006', '2024-02-24 15:49:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(107, 'PED-20240225-001', 'LP006', '2024-02-25 19:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(108, 'PED-20240226-0', 'LP005', '2024-02-26 09:04:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(109, 'PED-20240227-16', 'LP006', '2024-02-27 17:17:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(110, 'PED-20240228-4', 'LP006', '2024-02-28 10:20:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(111, 'PED-20240302-17', 'LP005', '2024-03-02 10:42:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(112, 'PED-20240304-7', 'LP005', '2024-03-04 08:51:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(113, 'PED-20240305-12', 'LP005', '2024-03-05 08:47:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(114, 'PED-20240306-16', 'LP005', '2024-03-06 10:41:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(115, 'PED-20240307-2', 'LP006', '2024-03-07 16:55:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(116, 'PED-20240308-20', 'LP005', '2024-03-08 10:27:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(117, 'PED-20240308-6', 'LP006', '2024-03-08 14:06:52', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(118, 'PED-20240310-14', 'LP006', '2024-03-10 19:46:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(119, 'PED-20240313-9', 'LP006', '2024-03-13 10:45:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(120, 'PED-20240316-10', 'LP005', '2024-03-16 11:06:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(121, 'PED-20240316-15', 'LP006', '2024-03-16 16:01:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(122, 'PED-20240316-4', 'LP006', '2024-03-16 14:16:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(123, 'PED-20240317-13', 'LP006', '2024-03-17 18:38:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(124, 'PED-20240319-23', 'LP005', '2024-03-19 08:25:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(125, 'PED-20240321-18', 'LP006', '2024-03-21 16:35:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(126, 'PED-20240323-3', 'LP005', '2024-03-23 17:49:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(127, 'PED-20240324-0', 'LP005', '2024-03-24 13:00:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(128, 'PED-20240325-5', 'LP006', '2024-03-25 19:16:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(129, 'PED-20240325-8', 'LP005', '2024-03-25 13:55:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(130, 'PED-20240326-11', 'LP006', '2024-03-26 11:54:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(131, 'PED-20240326-19', 'LP005', '2024-03-26 15:34:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(132, 'PED-20240326-21', 'LP005', '2024-03-26 09:06:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(133, 'PED-20240328-22', 'LP006', '2024-03-28 16:40:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(134, 'PED-20240328-24', 'LP006', '2024-03-28 17:20:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(135, 'PED-20240330-1', 'LP006', '2024-03-30 19:47:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(136, 'PED-20240401-23', 'LP006', '2024-04-01 10:59:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(137, 'PED-20240405-11', 'LP006', '2024-04-05 19:29:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(138, 'PED-20240405-16', 'LP005', '2024-04-05 11:05:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(139, 'PED-20240406-12', 'LP006', '2024-04-06 13:30:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(140, 'PED-20240407-5', 'LP005', '2024-04-07 08:30:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(141, 'PED-20240407-9', 'LP005', '2024-04-07 10:12:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(142, 'PED-20240410-001', 'LP005', '2024-04-10 10:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(143, 'PED-20240410-4', 'LP006', '2024-04-10 14:51:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(144, 'PED-20240410-8', 'LP005', '2024-04-10 18:34:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(145, 'PED-20240411-1', 'LP005', '2024-04-11 12:57:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(146, 'PED-20240411-10', 'LP006', '2024-04-11 14:45:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(147, 'PED-20240414-22', 'LP005', '2024-04-14 08:43:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(148, 'PED-20240415-21', 'LP006', '2024-04-15 09:15:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(149, 'PED-20240415-24', 'LP005', '2024-04-15 11:57:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(150, 'PED-20240417-2', 'LP006', '2024-04-17 10:12:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(151, 'PED-20240418-6', 'LP005', '2024-04-18 15:31:39', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(152, 'PED-20240419-0', 'LP006', '2024-04-19 08:19:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(153, 'PED-20240420-001', 'LP005', '2024-04-20 12:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(154, 'PED-20240421-13', 'LP005', '2024-04-21 19:37:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(155, 'PED-20240424-14', 'LP006', '2024-04-24 12:24:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(156, 'PED-20240425-001', 'LP005', '2024-04-25 13:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(157, 'PED-20240425-3', 'LP005', '2024-04-25 17:34:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(158, 'PED-20240426-7', 'LP005', '2024-04-26 13:44:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(159, 'PED-20240428-17', 'LP006', '2024-04-28 11:50:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(160, 'PED-20240428-19', 'LP006', '2024-04-28 19:06:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(161, 'PED-20240429-18', 'LP006', '2024-04-29 19:07:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(162, 'PED-20240430-20', 'LP005', '2024-04-30 15:14:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(163, 'PED-20240501-22', 'LP005', '2024-05-01 09:39:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(164, 'PED-20240504-6', 'LP005', '2024-05-04 14:15:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(165, 'PED-20240504-8', 'LP006', '2024-05-04 19:24:14', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(166, 'PED-20240505-001', 'LP006', '2024-05-05 15:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(167, 'PED-20240507-1', 'LP005', '2024-05-07 16:56:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(168, 'PED-20240508-13', 'LP006', '2024-05-08 08:30:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(169, 'PED-20240509-19', 'LP005', '2024-05-09 16:42:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(170, 'PED-20240510-001', 'LP006', '2024-05-10 16:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(171, 'PED-20240510-21', 'LP005', '2024-05-10 19:53:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(172, 'PED-20240512-18', 'LP005', '2024-05-12 17:53:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(173, 'PED-20240515-001', 'LP006', '2024-05-15 17:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(174, 'PED-20240515-15', 'LP006', '2024-05-15 17:45:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(175, 'PED-20240515-9', 'LP006', '2024-05-15 10:33:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(176, 'PED-20240516-24', 'LP006', '2024-05-16 14:07:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(177, 'PED-20240519-11', 'LP005', '2024-05-19 09:53:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(178, 'PED-20240520-001', 'LP005', '2024-05-20 18:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(179, 'PED-20240522-5', 'LP006', '2024-05-22 10:51:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(180, 'PED-20240524-0', 'LP006', '2024-05-24 11:20:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(181, 'PED-20240524-17', 'LP005', '2024-05-24 13:53:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(182, 'PED-20240525-10', 'LP006', '2024-05-25 16:11:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(183, 'PED-20240525-3', 'LP005', '2024-05-25 09:16:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(184, 'PED-20240526-23', 'LP005', '2024-05-26 14:22:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(185, 'PED-20240527-14', 'LP005', '2024-05-27 17:28:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(186, 'PED-20240529-16', 'LP005', '2024-05-29 16:38:07', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(187, 'PED-20240529-2', 'LP006', '2024-05-29 18:44:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(188, 'PED-20240530-4', 'LP005', '2024-05-30 17:04:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(189, 'PED-20240530-7', 'LP005', '2024-05-30 10:59:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(190, 'PED-20240602-0', 'LP005', '2024-06-02 19:37:14', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(191, 'PED-20240602-11', 'LP006', '2024-06-02 13:58:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(192, 'PED-20240602-5', 'LP005', '2024-06-02 17:41:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(193, 'PED-20240603-12', 'LP006', '2024-06-03 13:07:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(194, 'PED-20240604-10', 'LP005', '2024-06-04 17:39:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(195, 'PED-20240606-20', 'LP005', '2024-06-06 14:04:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(196, 'PED-20240607-24', 'LP005', '2024-06-07 19:12:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(197, 'PED-20240611-13', 'LP005', '2024-06-11 18:12:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(198, 'PED-20240612-18', 'LP005', '2024-06-12 19:43:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(199, 'PED-20240613-17', 'LP006', '2024-06-13 13:56:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(200, 'PED-20240617-9', 'LP005', '2024-06-17 18:36:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(201, 'PED-20240618-2', 'LP006', '2024-06-18 08:24:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(202, 'PED-20240619-14', 'LP006', '2024-06-19 14:01:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(203, 'PED-20240620-16', 'LP005', '2024-06-20 19:55:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(204, 'PED-20240621-6', 'LP005', '2024-06-21 09:28:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(205, 'PED-20240622-19', 'LP006', '2024-06-22 11:10:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(206, 'PED-20240622-23', 'LP006', '2024-06-22 17:45:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(207, 'PED-20240623-7', 'LP006', '2024-06-23 19:35:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(208, 'PED-20240625-21', 'LP005', '2024-06-25 09:04:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(209, 'PED-20240625-22', 'LP006', '2024-06-25 13:48:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(210, 'PED-20240626-8', 'LP006', '2024-06-26 09:15:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(211, 'PED-20240627-4', 'LP006', '2024-06-27 14:15:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(212, 'PED-20240629-1', 'LP005', '2024-06-29 19:58:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(213, 'PED-20240629-15', 'LP005', '2024-06-29 17:17:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(214, 'PED-20240701-11', 'LP006', '2024-07-01 11:26:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(215, 'PED-20240701-3', 'LP005', '2024-07-01 18:25:29', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(216, 'PED-20240703-1', 'LP005', '2024-07-03 10:49:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(217, 'PED-20240703-17', 'LP005', '2024-07-03 15:51:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(218, 'PED-20240705-12', 'LP006', '2024-07-05 18:56:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(219, 'PED-20240707-23', 'LP006', '2024-07-07 09:51:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(220, 'PED-20240707-24', 'LP006', '2024-07-07 17:10:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(221, 'PED-20240707-9', 'LP005', '2024-07-07 13:48:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(222, 'PED-20240709-7', 'LP005', '2024-07-09 19:51:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(223, 'PED-20240710-001', 'LP005', '2024-07-10 10:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(224, 'PED-20240710-6', 'LP005', '2024-07-10 18:17:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(225, 'PED-20240713-5', 'LP005', '2024-07-13 08:00:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(226, 'PED-20240713-8', 'LP006', '2024-07-13 09:26:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(227, 'PED-20240714-2', 'LP006', '2024-07-14 15:37:19', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(228, 'PED-20240716-10', 'LP005', '2024-07-16 11:56:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(229, 'PED-20240718-16', 'LP006', '2024-07-18 09:08:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(230, 'PED-20240720-001', 'LP005', '2024-07-20 12:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(231, 'PED-20240720-18', 'LP005', '2024-07-20 13:36:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(232, 'PED-20240721-21', 'LP005', '2024-07-21 18:15:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(233, 'PED-20240721-22', 'LP005', '2024-07-21 19:49:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(234, 'PED-20240722-13', 'LP006', '2024-07-22 13:14:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(235, 'PED-20240722-15', 'LP006', '2024-07-22 13:08:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(236, 'PED-20240722-4', 'LP005', '2024-07-22 19:46:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(237, 'PED-20240727-19', 'LP005', '2024-07-27 09:58:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(238, 'PED-20240731-0', 'LP005', '2024-07-31 15:10:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(239, 'PED-20240731-20', 'LP005', '2024-07-31 18:25:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(240, 'PED-20240801-001', 'LP005', '2024-08-01 14:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(241, 'PED-20240801-21', 'LP005', '2024-08-01 16:37:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(242, 'PED-20240802-11', 'LP005', '2024-08-02 16:16:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(243, 'PED-20240802-24', 'LP005', '2024-08-02 14:37:29', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(244, 'PED-20240802-3', 'LP005', '2024-08-02 19:35:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(245, 'PED-20240803-20', 'LP006', '2024-08-03 18:06:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(246, 'PED-20240803-7', 'LP005', '2024-08-03 08:09:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(247, 'PED-20240805-001', 'LP005', '2024-08-05 15:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(248, 'PED-20240806-13', 'LP005', '2024-08-06 13:45:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(249, 'PED-20240808-2', 'LP005', '2024-08-08 19:55:49', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(250, 'PED-20240809-6', 'LP006', '2024-08-09 15:19:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(251, 'PED-20240810-10', 'LP006', '2024-08-10 10:02:39', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(252, 'PED-20240811-5', 'LP005', '2024-08-11 18:18:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(253, 'PED-20240815-001', 'LP006', '2024-08-15 17:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(254, 'PED-20240815-22', 'LP006', '2024-08-15 09:09:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(255, 'PED-20240815-8', 'LP005', '2024-08-15 09:01:49', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(256, 'PED-20240817-1', 'LP005', '2024-08-17 13:30:18', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(257, 'PED-20240817-9', 'LP005', '2024-08-17 10:37:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(258, 'PED-20240818-15', 'LP006', '2024-08-18 11:41:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(259, 'PED-20240820-001', 'LP006', '2024-08-20 18:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(260, 'PED-20240821-0', 'LP005', '2024-08-21 09:38:49', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(261, 'PED-20240821-12', 'LP005', '2024-08-21 16:24:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(262, 'PED-20240821-18', 'LP006', '2024-08-21 18:29:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(263, 'PED-20240823-4', 'LP005', '2024-08-23 19:43:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(264, 'PED-20240824-16', 'LP006', '2024-08-24 12:25:07', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(265, 'PED-20240824-17', 'LP006', '2024-08-24 18:15:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(266, 'PED-20240825-001', 'LP006', '2024-08-25 19:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(267, 'PED-20240906-22', 'LP006', '2024-09-06 14:13:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(268, 'PED-20240908-12', 'LP005', '2024-09-08 11:48:05', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(269, 'PED-20240910-24', 'LP006', '2024-09-10 19:54:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(270, 'PED-20240910-6', 'LP006', '2024-09-10 16:35:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(271, 'PED-20240912-20', 'LP005', '2024-09-12 15:57:54', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(272, 'PED-20240912-9', 'LP006', '2024-09-12 12:38:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(273, 'PED-20240914-10', 'LP006', '2024-09-14 13:49:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(274, 'PED-20240914-15', 'LP006', '2024-09-14 19:37:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(275, 'PED-20240914-18', 'LP006', '2024-09-14 17:38:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(276, 'PED-20240915-16', 'LP005', '2024-09-15 17:25:49', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(277, 'PED-20240916-21', 'LP005', '2024-09-16 17:33:18', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(278, 'PED-20240917-19', 'LP006', '2024-09-17 15:28:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(279, 'PED-20240918-5', 'LP006', '2024-09-18 10:28:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(280, 'PED-20240918-7', 'LP005', '2024-09-18 09:45:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(281, 'PED-20240921-0', 'LP005', '2024-09-21 11:21:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(282, 'PED-20240923-2', 'LP005', '2024-09-23 15:54:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(283, 'PED-20240923-3', 'LP006', '2024-09-23 09:22:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(284, 'PED-20240923-4', 'LP006', '2024-09-23 09:21:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(285, 'PED-20240923-8', 'LP006', '2024-09-23 09:18:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(286, 'PED-20240925-1', 'LP005', '2024-09-25 09:12:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(287, 'PED-20240925-23', 'LP005', '2024-09-25 10:38:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(288, 'PED-20240926-17', 'LP006', '2024-09-26 09:02:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(289, 'PED-20240928-13', 'LP006', '2024-09-28 08:17:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(290, 'PED-20240930-11', 'LP006', '2024-09-30 13:30:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(291, 'PED-20240930-14', 'LP006', '2024-09-30 17:01:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(292, 'PED-20241004-23', 'LP006', '2024-10-04 11:09:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(293, 'PED-20241005-15', 'LP005', '2024-10-05 13:48:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(294, 'PED-20241005-18', 'LP005', '2024-10-05 11:48:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(295, 'PED-20241007-14', 'LP005', '2024-10-07 16:51:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(296, 'PED-20241010-001', 'LP006', '2024-10-10 10:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(297, 'PED-20241010-16', 'LP005', '2024-10-10 09:39:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(298, 'PED-20241012-17', 'LP005', '2024-10-12 15:05:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(299, 'PED-20241013-2', 'LP005', '2024-10-13 09:29:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(300, 'PED-20241013-6', 'LP005', '2024-10-13 19:44:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(301, 'PED-20241014-20', 'LP005', '2024-10-14 08:40:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(302, 'PED-20241015-001', 'LP006', '2024-10-15 11:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(303, 'PED-20241016-1', 'LP006', '2024-10-16 09:20:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(304, 'PED-20241016-24', 'LP006', '2024-10-16 16:07:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(305, 'PED-20241020-11', 'LP005', '2024-10-20 14:38:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(306, 'PED-20241021-19', 'LP005', '2024-10-21 19:59:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(307, 'PED-20241022-0', 'LP006', '2024-10-22 12:39:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(308, 'PED-20241023-12', 'LP005', '2024-10-23 16:24:52', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(309, 'PED-20241023-7', 'LP006', '2024-10-23 12:37:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(310, 'PED-20241024-3', 'LP006', '2024-10-24 12:48:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(311, 'PED-20241024-8', 'LP006', '2024-10-24 15:46:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(312, 'PED-20241025-001', 'LP005', '2024-10-25 13:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(313, 'PED-20241026-10', 'LP005', '2024-10-26 18:02:29', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(314, 'PED-20241027-13', 'LP005', '2024-10-27 08:46:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(315, 'PED-20241027-21', 'LP005', '2024-10-27 18:45:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(316, 'PED-20241030-5', 'LP005', '2024-10-30 17:12:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(317, 'PED-20241031-22', 'LP006', '2024-10-31 13:23:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(318, 'PED-20241031-4', 'LP005', '2024-10-31 13:27:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(319, 'PED-20241101-001', 'LP005', '2024-11-01 14:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(320, 'PED-20241101-18', 'LP006', '2024-11-01 09:44:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(321, 'PED-20241102-12', 'LP006', '2024-11-02 13:00:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(322, 'PED-20241105-001', 'LP006', '2024-11-05 15:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(323, 'PED-20241105-4', 'LP006', '2024-11-05 08:49:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(324, 'PED-20241107-0', 'LP006', '2024-11-07 17:19:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(325, 'PED-20241108-11', 'LP006', '2024-11-08 14:04:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(326, 'PED-20241108-23', 'LP006', '2024-11-08 13:23:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(327, 'PED-20241109-19', 'LP006', '2024-11-09 19:10:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(328, 'PED-20241109-8', 'LP006', '2024-11-09 12:53:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(329, 'PED-20241110-001', 'LP005', '2024-11-10 16:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(330, 'PED-20241110-24', 'LP006', '2024-11-10 11:24:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(331, 'PED-20241110-3', 'LP005', '2024-11-10 17:54:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(332, 'PED-20241113-2', 'LP005', '2024-11-13 09:12:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(333, 'PED-20241113-7', 'LP006', '2024-11-13 16:08:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(334, 'PED-20241114-15', 'LP006', '2024-11-14 12:19:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(335, 'PED-20241115-17', 'LP006', '2024-11-15 09:06:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(336, 'PED-20241117-14', 'LP006', '2024-11-17 19:00:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(337, 'PED-20241119-16', 'LP005', '2024-11-19 17:19:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(338, 'PED-20241120-001', 'LP006', '2024-11-20 18:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(339, 'PED-20241120-21', 'LP005', '2024-11-20 10:00:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(340, 'PED-20241121-10', 'LP005', '2024-11-21 14:33:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(341, 'PED-20241121-13', 'LP006', '2024-11-21 12:02:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(342, 'PED-20241123-22', 'LP005', '2024-11-23 14:36:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(343, 'PED-20241123-5', 'LP005', '2024-11-23 14:25:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(344, 'PED-20241124-20', 'LP006', '2024-11-24 15:56:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(345, 'PED-20241124-9', 'LP006', '2024-11-24 19:38:14', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(346, 'PED-20241125-001', 'LP006', '2024-11-25 19:00:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(347, 'PED-20241201-13', 'LP005', '2024-12-01 08:01:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(348, 'PED-20241202-23', 'LP005', '2024-12-02 19:32:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(349, 'PED-20241204-16', 'LP005', '2024-12-04 11:10:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(350, 'PED-20241204-5', 'LP006', '2024-12-04 17:43:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(351, 'PED-20241207-22', 'LP005', '2024-12-07 10:17:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(352, 'PED-20241210-3', 'LP006', '2024-12-10 08:16:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(353, 'PED-20241211-15', 'LP006', '2024-12-11 18:10:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(354, 'PED-20241211-17', 'LP006', '2024-12-11 15:55:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(355, 'PED-20241212-24', 'LP006', '2024-12-12 09:26:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(356, 'PED-20241213-7', 'LP006', '2024-12-13 16:05:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(357, 'PED-20241215-10', 'LP006', '2024-12-15 10:41:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(358, 'PED-20241215-12', 'LP006', '2024-12-15 15:39:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(359, 'PED-20241216-8', 'LP005', '2024-12-16 14:13:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(360, 'PED-20241217-11', 'LP006', '2024-12-17 09:51:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(361, 'PED-20241217-19', 'LP005', '2024-12-17 08:28:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(362, 'PED-20241221-18', 'LP005', '2024-12-21 13:11:39', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(363, 'PED-20241221-2', 'LP005', '2024-12-21 11:25:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(364, 'PED-20241223-20', 'LP006', '2024-12-23 18:06:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(365, 'PED-20241225-6', 'LP005', '2024-12-25 16:00:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(366, 'PED-20241227-0', 'LP006', '2024-12-27 14:59:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(367, 'PED-20241227-4', 'LP006', '2024-12-27 15:23:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(368, 'PED-20241228-1', 'LP005', '2024-12-28 11:39:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(369, 'PED-20241228-9', 'LP006', '2024-12-28 19:07:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1);
INSERT INTO `asignacion_picking` (`idAsignacion`, `numeroPedido`, `legajoPicker`, `fechaAsignacion`, `fechaCompletado`, `fechaDespachado`, `observaciones`, `completado`, `despachado`) VALUES
(370, 'PED-20241230-14', 'LP006', '2024-12-30 18:20:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(371, 'PED-20241230-21', 'LP006', '2024-12-30 08:32:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(400, 'PED-20250102-12', 'LP005', '2025-01-02 09:18:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(401, 'PED-20250102-22', 'LP006', '2025-01-02 09:16:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(402, 'PED-20250103-2', 'LP006', '2025-01-03 10:39:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(403, 'PED-20250107-21', 'LP005', '2025-01-07 14:08:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(404, 'PED-20250108-13', 'LP006', '2025-01-08 16:52:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(405, 'PED-20250108-18', 'LP005', '2025-01-08 17:10:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(406, 'PED-20250109-14', 'LP005', '2025-01-09 10:15:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(407, 'PED-20250112-8', 'LP006', '2025-01-12 17:55:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(408, 'PED-20250116-20', 'LP005', '2025-01-16 10:34:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(409, 'PED-20250117-15', 'LP006', '2025-01-17 18:36:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(410, 'PED-20250118-19', 'LP006', '2025-01-18 10:23:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(411, 'PED-20250119-16', 'LP005', '2025-01-19 12:55:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(412, 'PED-20250120-17', 'LP006', '2025-01-20 15:26:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(413, 'PED-20250121-10', 'LP006', '2025-01-21 11:19:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(414, 'PED-20250122-0', 'LP006', '2025-01-22 12:41:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(415, 'PED-20250123-5', 'LP006', '2025-01-23 09:34:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(416, 'PED-20250123-6', 'LP006', '2025-01-23 13:14:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(417, 'PED-20250124-7', 'LP005', '2025-01-24 11:07:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(418, 'PED-20250126-4', 'LP006', '2025-01-26 14:22:07', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(419, 'PED-20250126-9', 'LP006', '2025-01-26 11:56:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(420, 'PED-20250128-11', 'LP005', '2025-01-28 08:22:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(421, 'PED-20250130-23', 'LP006', '2025-01-30 17:02:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(422, 'PED-20250131-3', 'LP005', '2025-01-31 19:40:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(423, 'PED-20250201-15', 'LP005', '2025-02-01 10:53:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(424, 'PED-20250203-20', 'LP006', '2025-02-03 14:16:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(425, 'PED-20250205-16', 'LP006', '2025-02-05 17:19:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(426, 'PED-20250205-21', 'LP005', '2025-02-05 13:52:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(427, 'PED-20250206-8', 'LP006', '2025-02-06 17:25:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(428, 'PED-20250207-13', 'LP006', '2025-02-07 14:54:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(429, 'PED-20250208-4', 'LP005', '2025-02-08 13:28:01', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(430, 'PED-20250209-19', 'LP005', '2025-02-09 11:39:19', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(431, 'PED-20250213-12', 'LP005', '2025-02-13 08:53:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(432, 'PED-20250215-10', 'LP005', '2025-02-15 09:56:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(433, 'PED-20250216-7', 'LP006', '2025-02-16 12:20:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(434, 'PED-20250217-3', 'LP005', '2025-02-17 11:50:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(435, 'PED-20250218-11', 'LP005', '2025-02-18 10:16:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(436, 'PED-20250218-6', 'LP006', '2025-02-18 14:45:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(437, 'PED-20250219-14', 'LP005', '2025-02-19 12:05:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(438, 'PED-20250220-0', 'LP006', '2025-02-20 10:49:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(439, 'PED-20250221-2', 'LP006', '2025-02-21 13:15:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(440, 'PED-20250221-23', 'LP006', '2025-02-21 16:22:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(441, 'PED-20250222-5', 'LP005', '2025-02-22 08:43:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(442, 'PED-20250223-18', 'LP006', '2025-02-23 15:42:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(443, 'PED-20250225-17', 'LP005', '2025-02-25 17:18:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(444, 'PED-20250226-22', 'LP005', '2025-02-26 15:25:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(445, 'PED-20250227-24', 'LP005', '2025-02-27 17:08:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(446, 'PED-20250228-9', 'LP006', '2025-02-28 11:36:05', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(447, 'PED-20250301-20', 'LP005', '2025-03-01 15:11:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(448, 'PED-20250305-10', 'LP005', '2025-03-05 10:36:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(449, 'PED-20250307-13', 'LP006', '2025-03-07 09:04:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(450, 'PED-20250307-9', 'LP006', '2025-03-07 15:26:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(451, 'PED-20250308-4', 'LP005', '2025-03-08 13:30:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(452, 'PED-20250309-23', 'LP006', '2025-03-09 12:06:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(453, 'PED-20250309-7', 'LP005', '2025-03-09 12:48:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(454, 'PED-20250310-16', 'LP005', '2025-03-10 13:33:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(455, 'PED-20250316-18', 'LP005', '2025-03-16 09:07:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(456, 'PED-20250316-3', 'LP006', '2025-03-16 15:40:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(457, 'PED-20250318-11', 'LP006', '2025-03-18 15:32:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(458, 'PED-20250318-15', 'LP006', '2025-03-18 12:05:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(459, 'PED-20250318-24', 'LP005', '2025-03-18 15:30:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(460, 'PED-20250320-8', 'LP005', '2025-03-20 12:52:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(461, 'PED-20250321-5', 'LP005', '2025-03-21 19:47:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(462, 'PED-20250322-14', 'LP006', '2025-03-22 16:34:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(463, 'PED-20250323-21', 'LP006', '2025-03-23 08:07:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(464, 'PED-20250325-19', 'LP005', '2025-03-25 15:55:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(465, 'PED-20250327-0', 'LP005', '2025-03-27 18:57:05', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(466, 'PED-20250328-1', 'LP005', '2025-03-28 08:39:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(467, 'PED-20250329-17', 'LP005', '2025-03-29 15:29:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(468, 'PED-20250330-2', 'LP006', '2025-03-30 16:46:42', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(469, 'PED-20250330-22', 'LP006', '2025-03-30 10:09:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(470, 'PED-20250331-12', 'LP005', '2025-03-31 18:26:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(471, 'PED-20250331-6', 'LP006', '2025-03-31 09:27:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(472, 'PED-20250401-9', 'LP005', '2025-04-01 15:15:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(473, 'PED-20250403-1', 'LP005', '2025-04-03 12:30:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(474, 'PED-20250403-2', 'LP006', '2025-04-03 09:27:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(475, 'PED-20250403-23', 'LP006', '2025-04-03 09:34:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(476, 'PED-20250405-24', 'LP006', '2025-04-05 08:59:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(477, 'PED-20250406-11', 'LP006', '2025-04-06 19:01:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(478, 'PED-20250406-21', 'LP006', '2025-04-06 14:12:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(479, 'PED-20250410-8', 'LP005', '2025-04-10 19:03:19', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(480, 'PED-20250411-15', 'LP005', '2025-04-11 14:43:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(481, 'PED-20250411-5', 'LP005', '2025-04-11 14:47:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(482, 'PED-20250412-14', 'LP005', '2025-04-12 19:49:07', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(483, 'PED-20250412-19', 'LP006', '2025-04-12 11:13:18', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(484, 'PED-20250413-13', 'LP005', '2025-04-13 17:36:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(485, 'PED-20250415-10', 'LP005', '2025-04-15 10:33:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(486, 'PED-20250416-22', 'LP005', '2025-04-16 16:51:14', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(487, 'PED-20250417-12', 'LP005', '2025-04-17 18:37:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(488, 'PED-20250417-7', 'LP006', '2025-04-17 08:41:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(489, 'PED-20250418-20', 'LP006', '2025-04-18 16:53:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(490, 'PED-20250418-6', 'LP005', '2025-04-18 12:11:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(491, 'PED-20250425-4', 'LP006', '2025-04-25 17:35:30', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(492, 'PED-20250426-0', 'LP005', '2025-04-26 13:36:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(493, 'PED-20250427-17', 'LP005', '2025-04-27 09:03:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(494, 'PED-20250429-18', 'LP005', '2025-04-29 08:30:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(495, 'PED-20250430-16', 'LP006', '2025-04-30 17:05:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(496, 'PED-20250430-3', 'LP006', '2025-04-30 13:09:32', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(497, 'PED-20250501-2', 'LP006', '2025-05-01 16:38:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(498, 'PED-20250501-7', 'LP005', '2025-05-01 14:36:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(499, 'PED-20250502-22', 'LP006', '2025-05-02 17:42:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(500, 'PED-20250503-1', 'LP005', '2025-05-03 19:43:39', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(501, 'PED-20250504-16', 'LP006', '2025-05-04 18:04:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(502, 'PED-20250506-0', 'LP006', '2025-05-06 17:16:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(503, 'PED-20250511-24', 'LP006', '2025-05-11 17:01:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(504, 'PED-20250512-3', 'LP006', '2025-05-12 13:13:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(505, 'PED-20250514-4', 'LP005', '2025-05-14 13:53:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(506, 'PED-20250517-15', 'LP006', '2025-05-17 10:39:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(507, 'PED-20250518-5', 'LP006', '2025-05-18 19:13:07', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(508, 'PED-20250519-13', 'LP006', '2025-05-19 15:15:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(509, 'PED-20250523-10', 'LP005', '2025-05-23 08:03:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(510, 'PED-20250525-20', 'LP005', '2025-05-25 09:17:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(511, 'PED-20250526-18', 'LP005', '2025-05-26 10:29:54', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(512, 'PED-20250527-11', 'LP006', '2025-05-27 14:18:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(513, 'PED-20250527-9', 'LP006', '2025-05-27 17:14:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(514, 'PED-20250529-19', 'LP006', '2025-05-29 09:03:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(515, 'PED-20250529-21', 'LP006', '2025-05-29 15:13:18', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(516, 'PED-20250530-23', 'LP006', '2025-05-30 11:43:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(517, 'PED-20250531-12', 'LP005', '2025-05-31 13:22:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(518, 'PED-20250531-17', 'LP006', '2025-05-31 08:23:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(519, 'PED-20250601-17', 'LP006', '2025-06-01 16:24:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(520, 'PED-20250604-3', 'LP005', '2025-06-04 15:54:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(521, 'PED-20250604-8', 'LP005', '2025-06-04 15:50:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(522, 'PED-20250605-11', 'LP005', '2025-06-05 19:12:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(523, 'PED-20250613-20', 'LP006', '2025-06-13 14:25:29', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(524, 'PED-20250614-19', 'LP006', '2025-06-14 14:19:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(525, 'PED-20250615-18', 'LP005', '2025-06-15 18:43:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(526, 'PED-20250615-24', 'LP005', '2025-06-15 08:46:45', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(527, 'PED-20250616-10', 'LP006', '2025-06-16 09:56:24', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(528, 'PED-20250616-16', 'LP005', '2025-06-16 13:34:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(529, 'PED-20250617-12', 'LP006', '2025-06-17 17:16:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(530, 'PED-20250617-13', 'LP005', '2025-06-17 16:49:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(531, 'PED-20250618-6', 'LP005', '2025-06-18 13:22:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(532, 'PED-20250620-0', 'LP006', '2025-06-20 14:46:16', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(533, 'PED-20250620-1', 'LP005', '2025-06-20 11:28:28', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(534, 'PED-20250621-2', 'LP006', '2025-06-21 08:58:50', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(535, 'PED-20250621-9', 'LP005', '2025-06-21 14:27:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(536, 'PED-20250622-22', 'LP005', '2025-06-22 08:02:05', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(537, 'PED-20250622-7', 'LP005', '2025-06-22 17:48:40', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(538, 'PED-20250623-15', 'LP006', '2025-06-23 18:56:09', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(539, 'PED-20250624-14', 'LP006', '2025-06-24 19:12:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(540, 'PED-20250625-21', 'LP006', '2025-06-25 15:38:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(541, 'PED-20250628-23', 'LP006', '2025-06-28 15:23:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(542, 'PED-20250629-4', 'LP005', '2025-06-29 18:21:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(543, 'PED-20250629-5', 'LP006', '2025-06-29 09:35:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(544, 'PED-20250702-24', 'LP006', '2025-07-02 10:04:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(545, 'PED-20250703-16', 'LP006', '2025-07-03 13:17:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(546, 'PED-20250706-21', 'LP005', '2025-07-06 18:46:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(547, 'PED-20250706-9', 'LP005', '2025-07-06 14:15:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(548, 'PED-20250708-11', 'LP006', '2025-07-08 09:54:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(549, 'PED-20250708-8', 'LP006', '2025-07-08 15:17:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(550, 'PED-20250709-1', 'LP006', '2025-07-09 12:13:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(551, 'PED-20250713-20', 'LP006', '2025-07-13 17:54:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(552, 'PED-20250714-6', 'LP005', '2025-07-14 19:29:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(553, 'PED-20250715-23', 'LP006', '2025-07-15 13:43:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(554, 'PED-20250716-13', 'LP006', '2025-07-16 17:30:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(555, 'PED-20250718-5', 'LP006', '2025-07-18 18:49:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(556, 'PED-20250719-0', 'LP006', '2025-07-19 12:09:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(557, 'PED-20250719-10', 'LP005', '2025-07-19 17:15:52', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(558, 'PED-20250720-2', 'LP006', '2025-07-20 09:43:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(559, 'PED-20250726-19', 'LP006', '2025-07-26 19:25:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(560, 'PED-20250726-7', 'LP005', '2025-07-26 18:56:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(561, 'PED-20250727-17', 'LP006', '2025-07-27 19:15:23', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(562, 'PED-20250727-22', 'LP006', '2025-07-27 09:10:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(563, 'PED-20250727-3', 'LP005', '2025-07-27 13:36:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(564, 'PED-20250727-4', 'LP005', '2025-07-27 10:31:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(565, 'PED-20250729-12', 'LP005', '2025-07-29 13:24:43', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(566, 'PED-20250729-18', 'LP006', '2025-07-29 08:24:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(567, 'PED-20250730-15', 'LP006', '2025-07-30 18:28:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(568, 'PED-20250731-14', 'LP005', '2025-07-31 16:42:17', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(569, 'PED-20250801-1', 'LP005', '2025-08-01 08:13:56', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(570, 'PED-20250801-12', 'LP005', '2025-08-01 19:48:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(571, 'PED-20250801-14', 'LP006', '2025-08-01 16:31:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(572, 'PED-20250802-7', 'LP005', '2025-08-02 12:39:13', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(573, 'PED-20250803-3', 'LP005', '2025-08-03 11:05:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(574, 'PED-20250803-6', 'LP005', '2025-08-03 13:52:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(575, 'PED-20250805-15', 'LP006', '2025-08-05 08:34:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(576, 'PED-20250806-20', 'LP006', '2025-08-06 15:33:59', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(577, 'PED-20250806-4', 'LP005', '2025-08-06 16:06:22', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(578, 'PED-20250806-8', 'LP006', '2025-08-06 08:26:11', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(579, 'PED-20250807-11', 'LP006', '2025-08-07 18:31:06', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(580, 'PED-20250807-2', 'LP006', '2025-08-07 14:16:36', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(581, 'PED-20250809-17', 'LP006', '2025-08-09 11:35:08', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(582, 'PED-20250809-5', 'LP006', '2025-08-09 10:21:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(583, 'PED-20250814-0', 'LP005', '2025-08-14 14:29:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(584, 'PED-20250816-16', 'LP006', '2025-08-16 16:09:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(585, 'PED-20250822-9', 'LP006', '2025-08-22 15:55:51', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(586, 'PED-20250824-24', 'LP005', '2025-08-24 11:09:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(587, 'PED-20250825-10', 'LP006', '2025-08-25 08:48:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(588, 'PED-20250826-22', 'LP006', '2025-08-26 18:58:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(589, 'PED-20250826-23', 'LP005', '2025-08-26 12:33:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(590, 'PED-20250829-21', 'LP006', '2025-08-29 17:18:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(591, 'PED-20250831-13', 'LP006', '2025-08-31 09:39:55', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(592, 'PED-20250831-18', 'LP005', '2025-08-31 17:51:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(593, 'PED-20250902-0', 'LP005', '2025-09-02 19:37:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(594, 'PED-20250902-9', 'LP005', '2025-09-02 16:24:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(595, 'PED-20250903-22', 'LP005', '2025-09-03 10:41:54', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(596, 'PED-20250904-7', 'LP005', '2025-09-04 11:06:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(597, 'PED-20250906-19', 'LP006', '2025-09-06 19:24:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(598, 'PED-20250907-1', 'LP005', '2025-09-07 13:29:10', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(599, 'PED-20250911-18', 'LP006', '2025-09-11 13:01:53', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(600, 'PED-20250912-20', 'LP005', '2025-09-12 12:47:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(601, 'PED-20250913-24', 'LP005', '2025-09-13 14:26:37', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(602, 'PED-20250913-4', 'LP006', '2025-09-13 14:24:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(603, 'PED-20250914-6', 'LP006', '2025-09-14 16:17:15', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(604, 'PED-20250915-14', 'LP005', '2025-09-15 17:41:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(605, 'PED-20250916-16', 'LP006', '2025-09-16 09:55:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(606, 'PED-20250916-17', 'LP006', '2025-09-16 10:39:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(607, 'PED-20250918-11', 'LP006', '2025-09-18 14:04:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(608, 'PED-20250918-2', 'LP005', '2025-09-18 18:24:33', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(609, 'PED-20250918-21', 'LP005', '2025-09-18 08:33:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(610, 'PED-20250919-8', 'LP005', '2025-09-19 14:03:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(611, 'PED-20250920-23', 'LP005', '2025-09-20 14:56:58', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(612, 'PED-20250920-5', 'LP005', '2025-09-20 12:46:47', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(613, 'PED-20250921-13', 'LP005', '2025-09-21 08:01:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(614, 'PED-20250923-3', 'LP006', '2025-09-23 19:30:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(615, 'PED-20250924-10', 'LP006', '2025-09-24 11:05:35', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(616, 'PED-20250927-12', 'LP006', '2025-09-27 18:46:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(617, 'PED-20250930-15', 'LP005', '2025-09-30 10:02:38', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(618, 'PED-20251001-8', 'LP006', '2025-10-01 16:39:05', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(619, 'PED-20251002-1', 'LP006', '2025-10-02 17:52:00', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(620, 'PED-20251002-20', 'LP005', '2025-10-02 12:50:02', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(621, 'PED-20251004-0', 'LP005', '2025-10-04 17:31:20', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(622, 'PED-20251004-13', 'LP006', '2025-10-04 10:33:12', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(623, 'PED-20251006-19', 'LP005', '2025-10-06 09:14:44', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(624, 'PED-20251007-12', 'LP006', '2025-10-07 12:12:57', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(625, 'PED-20251008-10', 'LP006', '2025-10-08 14:01:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(626, 'PED-20251010-4', 'LP006', '2025-10-10 17:57:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(627, 'PED-20251012-17', 'LP006', '2025-10-12 15:09:48', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(628, 'PED-20251013-24', 'LP006', '2025-10-13 19:40:25', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(629, 'PED-20251015-21', 'LP006', '2025-10-15 17:24:46', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(630, 'PED-20251017-3', 'LP006', '2025-10-17 18:49:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(631, 'PED-20251018-22', 'LP006', '2025-10-18 17:12:41', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(632, 'PED-20251019-2', 'LP006', '2025-10-19 09:59:31', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(633, 'PED-20251019-6', 'LP006', '2025-10-19 18:25:34', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(634, 'PED-20251023-9', 'LP006', '2025-10-23 10:01:21', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(635, 'PED-20251024-11', 'LP005', '2025-10-24 09:30:03', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(636, 'PED-20251025-7', 'LP005', '2025-10-25 09:23:27', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 5', 1, 1),
(637, 'PED-20251027-23', 'LP005', '2025-10-27 11:59:04', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1),
(638, 'PED-20251028-18', 'LP006', '2025-10-28 17:08:26', '2025-11-19 11:29:55', '2025-11-19 11:29:55', 'Asignación histórica - Pedido ya en estado 4', 1, 1);

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
(10, 'Villa Mitre', 10),
(37, 'Calle Falsa 742', 62);

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
(52, 'Río Grande', 'V9420'),
(62, 'Calle Falsa 742', '');

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
(47, 'martin.gomez4@test.com', '5551120', 1, 53),
(48, 'maria.garcia@email.com', '1150005678', 1, 54),
(49, 'luis.rodriguez@email.com', '2214561234', 1, 55),
(50, 'sofia.fernandez@email.com', '3416785432', 1, 56),
(51, 'carlos.lopez@email.com', '1150004444', 1, 57),
(52, 'ana.martinez@email.com', '2214565555', 1, 58),
(53, 'pablo.gomez@email.com', '3416786666', 1, 59),
(54, 'laura.diaz@email.com', '1150007777', 1, 60),
(55, 'martin.acosta@email.com', '2214568888', 1, 61),
(56, 'florencia.blanco@email.com', '3416789999', 1, 62),
(57, 'ventas@soldsur.com', '1143331111', 1, 63),
(58, 'contacto@logisticarapida.com', '2214442222', 1, 64),
(59, 'administracion@textileslitoral.com', '3416663333', 1, 65),
(60, 'gerencia@maderasnorte.com', '1143334444', 1, 66),
(61, 'soporte@tecnoglobal.com', '2214445555', 1, 67),
(62, 'pedidos@puravida.com', '3416666666', 1, 68),
(63, 'obra@constructoracima.com', '1143337777', 1, 69),
(64, 'distribucion@paginassa.com', '2214448888', 1, 70),
(65, 'info@webpro.com', '3416669999', 1, 71),
(66, 'ventas@herramientasmetalicas.com', '1143330000', 1, 72);

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
  `idUsuarioModifico` int(11) NOT NULL,
  `idMotivo` int(11) DEFAULT NULL COMMENT 'FK al motivo de baja. NULL si es un Alta',
  `observaciones` varchar(255) DEFAULT NULL COMMENT 'Detalle adicional opcional'
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
('monto_vip', '150000');

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
('DP-PED-20240101-3-0', 'PED-20240101-3', 'IND003', 4, 0.00),
('DP-PED-20240101-3-1', 'PED-20240101-3', 'IND004', 3, 0.00),
('DP-PED-20240103-4-0', 'PED-20240103-4', 'IND037', 1, 0.00),
('DP-PED-20240103-4-1', 'PED-20240103-4', 'IND015', 3, 0.00),
('DP-PED-20240105-5-0', 'PED-20240105-5', 'IND018', 2, 0.00),
('DP-PED-20240105-5-1', 'PED-20240105-5', 'IND023', 4, 0.00),
('DP-PED-20240110-20-0', 'PED-20240110-20', 'IND009', 3, 0.00),
('DP-PED-20240110-20-1', 'PED-20240110-20', 'IND021', 1, 0.00),
('DP-PED-20240110-20-2', 'PED-20240110-20', 'IND028', 2, 0.00),
('DP-PED-20240110-24-0', 'PED-20240110-24', 'IND021', 4, 0.00),
('DP-PED-20240110-24-1', 'PED-20240110-24', 'IND033', 1, 0.00),
('DP-PED-20240110-24-2', 'PED-20240110-24', 'IND034', 1, 0.00),
('DP-PED-20240110-8-0', 'PED-20240110-8', 'IND020', 3, 0.00),
('DP-PED-20240110-8-1', 'PED-20240110-8', 'IND029', 2, 0.00),
('DP-PED-20240110-8-2', 'PED-20240110-8', 'IND019', 1, 0.00),
('DP-PED-20240111-21-0', 'PED-20240111-21', 'IND028', 3, 0.00),
('DP-PED-20240111-21-1', 'PED-20240111-21', 'IND008', 4, 0.00),
('DP-PED-20240111-21-2', 'PED-20240111-21', 'IND035', 2, 0.00),
('DP-PED-20240112-0-0', 'PED-20240112-0', 'IND024', 5, 0.00),
('DP-PED-20240112-17-0', 'PED-20240112-17', 'IND039', 5, 0.00),
('DP-PED-20240112-2-0', 'PED-20240112-2', 'IND024', 4, 0.00),
('DP-PED-20240112-2-1', 'PED-20240112-2', 'IND010', 5, 0.00),
('DP-PED-20240112-2-2', 'PED-20240112-2', 'IND036', 4, 0.00),
('DP-PED-20240113-16-0', 'PED-20240113-16', 'IND028', 1, 0.00),
('DP-PED-20240113-16-1', 'PED-20240113-16', 'IND010', 2, 0.00),
('DP-PED-20240114-23-0', 'PED-20240114-23', 'IND015', 3, 0.00),
('DP-PED-20240115-11-0', 'PED-20240115-11', 'IND032', 1, 0.00),
('DP-PED-20240115-11-1', 'PED-20240115-11', 'IND032', 5, 0.00),
('DP-PED-20240115-11-2', 'PED-20240115-11', 'IND031', 2, 0.00),
('DP-PED-20240115-9-0', 'PED-20240115-9', 'IND007', 5, 0.00),
('DP-PED-20240115-9-1', 'PED-20240115-9', 'IND022', 1, 0.00),
('DP-PED-20240115-9-2', 'PED-20240115-9', 'IND001', 4, 0.00),
('DP-PED-20240116-12-0', 'PED-20240116-12', 'IND019', 2, 0.00),
('DP-PED-20240116-12-1', 'PED-20240116-12', 'IND009', 2, 0.00),
('DP-PED-20240117-14-0', 'PED-20240117-14', 'IND035', 5, 0.00),
('DP-PED-20240117-14-1', 'PED-20240117-14', 'IND009', 2, 0.00),
('DP-PED-20240117-22-0', 'PED-20240117-22', 'IND021', 3, 0.00),
('DP-PED-20240117-22-1', 'PED-20240117-22', 'IND026', 5, 0.00),
('DP-PED-20240117-22-2', 'PED-20240117-22', 'IND008', 4, 0.00),
('DP-PED-20240120-7-0', 'PED-20240120-7', 'IND003', 2, 0.00),
('DP-PED-20240120-7-1', 'PED-20240120-7', 'IND036', 5, 0.00),
('DP-PED-20240124-6-0', 'PED-20240124-6', 'IND031', 2, 0.00),
('DP-PED-20240124-6-1', 'PED-20240124-6', 'IND020', 2, 0.00),
('DP-PED-20240124-6-2', 'PED-20240124-6', 'IND028', 4, 0.00),
('DP-PED-20240125-1-0', 'PED-20240125-1', 'IND001', 4, 0.00),
('DP-PED-20240126-13-0', 'PED-20240126-13', 'IND007', 2, 0.00),
('DP-PED-20240127-10-0', 'PED-20240127-10', 'IND020', 5, 0.00),
('DP-PED-20240127-10-1', 'PED-20240127-10', 'IND020', 2, 0.00),
('DP-PED-20240127-18-0', 'PED-20240127-18', 'IND034', 3, 0.00),
('DP-PED-20240127-18-1', 'PED-20240127-18', 'IND039', 3, 0.00),
('DP-PED-20240127-18-2', 'PED-20240127-18', 'IND010', 5, 0.00),
('DP-PED-20240128-15-0', 'PED-20240128-15', 'IND018', 3, 0.00),
('DP-PED-20240130-19-0', 'PED-20240130-19', 'IND023', 3, 0.00),
('DP-PED-20240130-19-1', 'PED-20240130-19', 'IND027', 5, 0.00),
('DP-PED-20240201-23-0', 'PED-20240201-23', 'IND025', 3, 0.00),
('DP-PED-20240201-23-1', 'PED-20240201-23', 'IND002', 3, 0.00),
('DP-PED-20240201-23-2', 'PED-20240201-23', 'IND032', 1, 0.00),
('DP-PED-20240201-6-0', 'PED-20240201-6', 'IND006', 3, 0.00),
('DP-PED-20240201-6-1', 'PED-20240201-6', 'IND026', 5, 0.00),
('DP-PED-20240202-19-0', 'PED-20240202-19', 'IND007', 3, 0.00),
('DP-PED-20240203-20-0', 'PED-20240203-20', 'IND038', 4, 0.00),
('DP-PED-20240203-8-0', 'PED-20240203-8', 'IND003', 5, 0.00),
('DP-PED-20240203-8-1', 'PED-20240203-8', 'IND035', 5, 0.00),
('DP-PED-20240203-8-2', 'PED-20240203-8', 'IND038', 1, 0.00),
('DP-PED-20240205-15-0', 'PED-20240205-15', 'IND039', 4, 0.00),
('DP-PED-20240205-15-1', 'PED-20240205-15', 'IND016', 4, 0.00),
('DP-PED-20240205-15-2', 'PED-20240205-15', 'IND021', 2, 0.00),
('DP-PED-20240206-21-0', 'PED-20240206-21', 'IND025', 5, 0.00),
('DP-PED-20240209-17-0', 'PED-20240209-17', 'IND030', 2, 0.00),
('DP-PED-20240209-17-1', 'PED-20240209-17', 'IND018', 5, 0.00),
('DP-PED-20240209-17-2', 'PED-20240209-17', 'IND021', 3, 0.00),
('DP-PED-20240209-5-0', 'PED-20240209-5', 'IND001', 5, 0.00),
('DP-PED-20240209-9-0', 'PED-20240209-9', 'IND036', 3, 0.00),
('DP-PED-20240211-24-0', 'PED-20240211-24', 'IND018', 4, 0.00),
('DP-PED-20240212-10-0', 'PED-20240212-10', 'IND023', 4, 0.00),
('DP-PED-20240212-10-1', 'PED-20240212-10', 'IND022', 4, 0.00),
('DP-PED-20240212-10-2', 'PED-20240212-10', 'IND036', 3, 0.00),
('DP-PED-20240214-18-0', 'PED-20240214-18', 'IND009', 3, 0.00),
('DP-PED-20240215-11-0', 'PED-20240215-11', 'IND017', 5, 0.00),
('DP-PED-20240215-7-0', 'PED-20240215-7', 'IND027', 2, 0.00),
('DP-PED-20240218-22-0', 'PED-20240218-22', 'IND016', 5, 0.00),
('DP-PED-20240218-22-1', 'PED-20240218-22', 'IND002', 5, 0.00),
('DP-PED-20240218-3-0', 'PED-20240218-3', 'IND016', 3, 0.00),
('DP-PED-20240218-3-1', 'PED-20240218-3', 'IND034', 3, 0.00),
('DP-PED-20240221-14-0', 'PED-20240221-14', 'IND023', 3, 0.00),
('DP-PED-20240221-14-1', 'PED-20240221-14', 'IND018', 4, 0.00),
('DP-PED-20240221-14-2', 'PED-20240221-14', 'IND028', 1, 0.00),
('DP-PED-20240223-12-0', 'PED-20240223-12', 'IND030', 5, 0.00),
('DP-PED-20240223-2-0', 'PED-20240223-2', 'IND036', 3, 0.00),
('DP-PED-20240223-2-1', 'PED-20240223-2', 'IND032', 2, 0.00),
('DP-PED-20240223-2-2', 'PED-20240223-2', 'IND024', 4, 0.00),
('DP-PED-20240224-1-0', 'PED-20240224-1', 'IND010', 5, 0.00),
('DP-PED-20240224-1-1', 'PED-20240224-1', 'IND037', 5, 0.00),
('DP-PED-20240224-1-2', 'PED-20240224-1', 'IND010', 5, 0.00),
('DP-PED-20240224-13-0', 'PED-20240224-13', 'IND020', 5, 0.00),
('DP-PED-20240224-13-1', 'PED-20240224-13', 'IND035', 5, 0.00),
('DP-PED-20240226-0-0', 'PED-20240226-0', 'IND029', 5, 0.00),
('DP-PED-20240226-0-1', 'PED-20240226-0', 'IND036', 1, 0.00),
('DP-PED-20240226-0-2', 'PED-20240226-0', 'IND023', 3, 0.00),
('DP-PED-20240227-16-0', 'PED-20240227-16', 'IND001', 2, 0.00),
('DP-PED-20240228-4-0', 'PED-20240228-4', 'IND032', 5, 0.00),
('DP-PED-20240228-4-1', 'PED-20240228-4', 'IND015', 4, 0.00),
('DP-PED-20240302-17-0', 'PED-20240302-17', 'IND034', 4, 0.00),
('DP-PED-20240302-17-1', 'PED-20240302-17', 'IND029', 3, 0.00),
('DP-PED-20240304-7-0', 'PED-20240304-7', 'IND009', 1, 0.00),
('DP-PED-20240304-7-1', 'PED-20240304-7', 'IND029', 1, 0.00),
('DP-PED-20240305-12-0', 'PED-20240305-12', 'IND024', 1, 0.00),
('DP-PED-20240305-12-1', 'PED-20240305-12', 'IND037', 2, 0.00),
('DP-PED-20240306-16-0', 'PED-20240306-16', 'IND036', 5, 0.00),
('DP-PED-20240306-16-1', 'PED-20240306-16', 'IND037', 5, 0.00),
('DP-PED-20240306-16-2', 'PED-20240306-16', 'IND025', 2, 0.00),
('DP-PED-20240307-2-0', 'PED-20240307-2', 'IND008', 5, 0.00),
('DP-PED-20240307-2-1', 'PED-20240307-2', 'IND024', 2, 0.00),
('DP-PED-20240308-20-0', 'PED-20240308-20', 'IND038', 4, 0.00),
('DP-PED-20240308-20-1', 'PED-20240308-20', 'IND003', 1, 0.00),
('DP-PED-20240308-6-0', 'PED-20240308-6', 'IND024', 3, 0.00),
('DP-PED-20240308-6-1', 'PED-20240308-6', 'IND006', 1, 0.00),
('DP-PED-20240308-6-2', 'PED-20240308-6', 'IND002', 5, 0.00),
('DP-PED-20240310-14-0', 'PED-20240310-14', 'IND021', 2, 0.00),
('DP-PED-20240310-14-1', 'PED-20240310-14', 'IND027', 3, 0.00),
('DP-PED-20240310-14-2', 'PED-20240310-14', 'IND034', 4, 0.00),
('DP-PED-20240313-9-0', 'PED-20240313-9', 'IND015', 3, 0.00),
('DP-PED-20240313-9-1', 'PED-20240313-9', 'IND010', 1, 0.00),
('DP-PED-20240316-10-0', 'PED-20240316-10', 'IND030', 3, 0.00),
('DP-PED-20240316-15-0', 'PED-20240316-15', 'IND036', 4, 0.00),
('DP-PED-20240316-15-1', 'PED-20240316-15', 'IND001', 5, 0.00),
('DP-PED-20240316-15-2', 'PED-20240316-15', 'IND003', 5, 0.00),
('DP-PED-20240316-4-0', 'PED-20240316-4', 'IND016', 2, 0.00),
('DP-PED-20240317-13-0', 'PED-20240317-13', 'IND035', 1, 0.00),
('DP-PED-20240319-23-0', 'PED-20240319-23', 'IND023', 4, 0.00),
('DP-PED-20240319-23-1', 'PED-20240319-23', 'IND003', 1, 0.00),
('DP-PED-20240319-23-2', 'PED-20240319-23', 'IND026', 3, 0.00),
('DP-PED-20240321-18-0', 'PED-20240321-18', 'IND006', 5, 0.00),
('DP-PED-20240323-3-0', 'PED-20240323-3', 'IND038', 4, 0.00),
('DP-PED-20240323-3-1', 'PED-20240323-3', 'IND001', 4, 0.00),
('DP-PED-20240323-3-2', 'PED-20240323-3', 'IND024', 4, 0.00),
('DP-PED-20240324-0-0', 'PED-20240324-0', 'IND003', 2, 0.00),
('DP-PED-20240324-0-1', 'PED-20240324-0', 'IND003', 4, 0.00),
('DP-PED-20240324-0-2', 'PED-20240324-0', 'IND033', 2, 0.00),
('DP-PED-20240325-5-0', 'PED-20240325-5', 'IND004', 2, 0.00),
('DP-PED-20240325-5-1', 'PED-20240325-5', 'IND018', 5, 0.00),
('DP-PED-20240325-8-0', 'PED-20240325-8', 'IND030', 2, 0.00),
('DP-PED-20240325-8-1', 'PED-20240325-8', 'IND039', 2, 0.00),
('DP-PED-20240326-11-0', 'PED-20240326-11', 'IND036', 1, 0.00),
('DP-PED-20240326-11-1', 'PED-20240326-11', 'IND031', 3, 0.00),
('DP-PED-20240326-11-2', 'PED-20240326-11', 'IND008', 3, 0.00),
('DP-PED-20240326-19-0', 'PED-20240326-19', 'IND003', 1, 0.00),
('DP-PED-20240326-19-1', 'PED-20240326-19', 'IND019', 4, 0.00),
('DP-PED-20240326-19-2', 'PED-20240326-19', 'IND018', 4, 0.00),
('DP-PED-20240326-21-0', 'PED-20240326-21', 'IND026', 5, 0.00),
('DP-PED-20240328-22-0', 'PED-20240328-22', 'IND030', 5, 0.00),
('DP-PED-20240328-24-0', 'PED-20240328-24', 'IND002', 2, 0.00),
('DP-PED-20240330-1-0', 'PED-20240330-1', 'IND024', 1, 0.00),
('DP-PED-20240330-1-1', 'PED-20240330-1', 'IND025', 5, 0.00),
('DP-PED-20240401-23-0', 'PED-20240401-23', 'IND039', 4, 0.00),
('DP-PED-20240405-11-0', 'PED-20240405-11', 'IND038', 4, 0.00),
('DP-PED-20240405-11-1', 'PED-20240405-11', 'IND002', 5, 0.00),
('DP-PED-20240405-11-2', 'PED-20240405-11', 'IND037', 1, 0.00),
('DP-PED-20240405-16-0', 'PED-20240405-16', 'IND010', 4, 0.00),
('DP-PED-20240406-12-0', 'PED-20240406-12', 'IND004', 4, 0.00),
('DP-PED-20240406-12-1', 'PED-20240406-12', 'IND023', 2, 0.00),
('DP-PED-20240406-12-2', 'PED-20240406-12', 'IND001', 1, 0.00),
('DP-PED-20240407-5-0', 'PED-20240407-5', 'IND017', 4, 0.00),
('DP-PED-20240407-9-0', 'PED-20240407-9', 'IND015', 1, 0.00),
('DP-PED-20240407-9-1', 'PED-20240407-9', 'IND025', 3, 0.00),
('DP-PED-20240407-9-2', 'PED-20240407-9', 'IND009', 3, 0.00),
('DP-PED-20240410-4-0', 'PED-20240410-4', 'IND018', 4, 0.00),
('DP-PED-20240410-8-0', 'PED-20240410-8', 'IND009', 4, 0.00),
('DP-PED-20240410-8-1', 'PED-20240410-8', 'IND020', 2, 0.00),
('DP-PED-20240411-1-0', 'PED-20240411-1', 'IND021', 2, 0.00),
('DP-PED-20240411-1-1', 'PED-20240411-1', 'IND021', 1, 0.00),
('DP-PED-20240411-10-0', 'PED-20240411-10', 'IND024', 3, 0.00),
('DP-PED-20240411-10-1', 'PED-20240411-10', 'IND018', 4, 0.00),
('DP-PED-20240411-10-2', 'PED-20240411-10', 'IND024', 3, 0.00),
('DP-PED-20240414-22-0', 'PED-20240414-22', 'IND022', 1, 0.00),
('DP-PED-20240414-22-1', 'PED-20240414-22', 'IND004', 1, 0.00),
('DP-PED-20240414-22-2', 'PED-20240414-22', 'IND010', 5, 0.00),
('DP-PED-20240415-21-0', 'PED-20240415-21', 'IND035', 3, 0.00),
('DP-PED-20240415-24-0', 'PED-20240415-24', 'IND019', 2, 0.00),
('DP-PED-20240415-24-1', 'PED-20240415-24', 'IND001', 2, 0.00),
('DP-PED-20240415-24-2', 'PED-20240415-24', 'IND009', 3, 0.00),
('DP-PED-20240417-2-0', 'PED-20240417-2', 'IND010', 4, 0.00),
('DP-PED-20240417-2-1', 'PED-20240417-2', 'IND034', 1, 0.00),
('DP-PED-20240418-6-0', 'PED-20240418-6', 'IND015', 5, 0.00),
('DP-PED-20240419-0-0', 'PED-20240419-0', 'IND019', 1, 0.00),
('DP-PED-20240421-13-0', 'PED-20240421-13', 'IND036', 3, 0.00),
('DP-PED-20240421-13-1', 'PED-20240421-13', 'IND025', 3, 0.00),
('DP-PED-20240424-14-0', 'PED-20240424-14', 'IND034', 1, 0.00),
('DP-PED-20240425-3-0', 'PED-20240425-3', 'IND030', 5, 0.00),
('DP-PED-20240425-3-1', 'PED-20240425-3', 'IND036', 5, 0.00),
('DP-PED-20240426-7-0', 'PED-20240426-7', 'IND020', 1, 0.00),
('DP-PED-20240426-7-1', 'PED-20240426-7', 'IND032', 5, 0.00),
('DP-PED-20240426-7-2', 'PED-20240426-7', 'IND038', 2, 0.00),
('DP-PED-20240428-17-0', 'PED-20240428-17', 'IND004', 2, 0.00),
('DP-PED-20240428-19-0', 'PED-20240428-19', 'IND010', 2, 0.00),
('DP-PED-20240428-19-1', 'PED-20240428-19', 'IND015', 4, 0.00),
('DP-PED-20240429-15-0', 'PED-20240429-15', 'IND028', 1, 0.00),
('DP-PED-20240429-15-1', 'PED-20240429-15', 'IND021', 1, 0.00),
('DP-PED-20240429-15-2', 'PED-20240429-15', 'IND035', 1, 0.00),
('DP-PED-20240429-18-0', 'PED-20240429-18', 'IND028', 1, 0.00),
('DP-PED-20240429-18-1', 'PED-20240429-18', 'IND025', 3, 0.00),
('DP-PED-20240430-20-0', 'PED-20240430-20', 'IND016', 5, 0.00),
('DP-PED-20240430-20-1', 'PED-20240430-20', 'IND006', 2, 0.00),
('DP-PED-20240430-20-2', 'PED-20240430-20', 'IND039', 1, 0.00),
('DP-PED-20240501-22-0', 'PED-20240501-22', 'IND026', 3, 0.00),
('DP-PED-20240501-22-1', 'PED-20240501-22', 'IND005', 5, 0.00),
('DP-PED-20240504-6-0', 'PED-20240504-6', 'IND001', 5, 0.00),
('DP-PED-20240504-6-1', 'PED-20240504-6', 'IND036', 3, 0.00),
('DP-PED-20240504-8-0', 'PED-20240504-8', 'IND031', 1, 0.00),
('DP-PED-20240504-8-1', 'PED-20240504-8', 'IND005', 2, 0.00),
('DP-PED-20240507-1-0', 'PED-20240507-1', 'IND030', 5, 0.00),
('DP-PED-20240507-1-1', 'PED-20240507-1', 'IND018', 2, 0.00),
('DP-PED-20240508-13-0', 'PED-20240508-13', 'IND018', 5, 0.00),
('DP-PED-20240509-19-0', 'PED-20240509-19', 'IND023', 5, 0.00),
('DP-PED-20240509-19-1', 'PED-20240509-19', 'IND035', 4, 0.00),
('DP-PED-20240510-21-0', 'PED-20240510-21', 'IND025', 1, 0.00),
('DP-PED-20240510-21-1', 'PED-20240510-21', 'IND026', 5, 0.00),
('DP-PED-20240510-21-2', 'PED-20240510-21', 'IND015', 5, 0.00),
('DP-PED-20240512-18-0', 'PED-20240512-18', 'IND015', 4, 0.00),
('DP-PED-20240512-18-1', 'PED-20240512-18', 'IND023', 3, 0.00),
('DP-PED-20240515-15-0', 'PED-20240515-15', 'IND018', 4, 0.00),
('DP-PED-20240515-15-1', 'PED-20240515-15', 'IND028', 5, 0.00),
('DP-PED-20240515-9-0', 'PED-20240515-9', 'IND018', 1, 0.00),
('DP-PED-20240515-9-1', 'PED-20240515-9', 'IND027', 4, 0.00),
('DP-PED-20240516-24-0', 'PED-20240516-24', 'IND005', 2, 0.00),
('DP-PED-20240516-24-1', 'PED-20240516-24', 'IND026', 5, 0.00),
('DP-PED-20240516-24-2', 'PED-20240516-24', 'IND018', 3, 0.00),
('DP-PED-20240519-11-0', 'PED-20240519-11', 'IND010', 2, 0.00),
('DP-PED-20240519-11-1', 'PED-20240519-11', 'IND021', 4, 0.00),
('DP-PED-20240519-11-2', 'PED-20240519-11', 'IND025', 1, 0.00),
('DP-PED-20240522-20-0', 'PED-20240522-20', 'IND007', 1, 0.00),
('DP-PED-20240522-20-1', 'PED-20240522-20', 'IND030', 3, 0.00),
('DP-PED-20240522-5-0', 'PED-20240522-5', 'IND018', 1, 0.00),
('DP-PED-20240522-5-1', 'PED-20240522-5', 'IND019', 4, 0.00),
('DP-PED-20240524-0-0', 'PED-20240524-0', 'IND038', 3, 0.00),
('DP-PED-20240524-0-1', 'PED-20240524-0', 'IND030', 1, 0.00),
('DP-PED-20240524-0-2', 'PED-20240524-0', 'IND007', 4, 0.00),
('DP-PED-20240524-17-0', 'PED-20240524-17', 'IND007', 2, 0.00),
('DP-PED-20240524-17-1', 'PED-20240524-17', 'IND038', 5, 0.00),
('DP-PED-20240524-17-2', 'PED-20240524-17', 'IND029', 4, 0.00),
('DP-PED-20240525-10-0', 'PED-20240525-10', 'IND001', 2, 0.00),
('DP-PED-20240525-10-1', 'PED-20240525-10', 'IND017', 5, 0.00),
('DP-PED-20240525-3-0', 'PED-20240525-3', 'IND024', 4, 0.00),
('DP-PED-20240525-3-1', 'PED-20240525-3', 'IND020', 2, 0.00),
('DP-PED-20240525-3-2', 'PED-20240525-3', 'IND009', 2, 0.00),
('DP-PED-20240526-23-0', 'PED-20240526-23', 'IND037', 4, 0.00),
('DP-PED-20240527-14-0', 'PED-20240527-14', 'IND026', 4, 0.00),
('DP-PED-20240527-14-1', 'PED-20240527-14', 'IND025', 5, 0.00),
('DP-PED-20240529-16-0', 'PED-20240529-16', 'IND027', 4, 0.00),
('DP-PED-20240529-16-1', 'PED-20240529-16', 'IND026', 5, 0.00),
('DP-PED-20240529-16-2', 'PED-20240529-16', 'IND034', 3, 0.00),
('DP-PED-20240529-2-0', 'PED-20240529-2', 'IND033', 4, 0.00),
('DP-PED-20240529-2-1', 'PED-20240529-2', 'IND034', 2, 0.00),
('DP-PED-20240530-4-0', 'PED-20240530-4', 'IND026', 4, 0.00),
('DP-PED-20240530-4-1', 'PED-20240530-4', 'IND021', 3, 0.00),
('DP-PED-20240530-7-0', 'PED-20240530-7', 'IND025', 4, 0.00),
('DP-PED-20240530-7-1', 'PED-20240530-7', 'IND007', 3, 0.00),
('DP-PED-20240531-12-0', 'PED-20240531-12', 'IND036', 2, 0.00),
('DP-PED-20240602-0-0', 'PED-20240602-0', 'IND010', 3, 0.00),
('DP-PED-20240602-0-1', 'PED-20240602-0', 'IND009', 5, 0.00),
('DP-PED-20240602-11-0', 'PED-20240602-11', 'IND007', 2, 0.00),
('DP-PED-20240602-11-1', 'PED-20240602-11', 'IND017', 4, 0.00),
('DP-PED-20240602-5-0', 'PED-20240602-5', 'IND038', 1, 0.00),
('DP-PED-20240603-12-0', 'PED-20240603-12', 'IND036', 4, 0.00),
('DP-PED-20240604-10-0', 'PED-20240604-10', 'IND036', 5, 0.00),
('DP-PED-20240606-20-0', 'PED-20240606-20', 'IND001', 4, 0.00),
('DP-PED-20240606-20-1', 'PED-20240606-20', 'IND008', 1, 0.00),
('DP-PED-20240606-20-2', 'PED-20240606-20', 'IND037', 2, 0.00),
('DP-PED-20240607-24-0', 'PED-20240607-24', 'IND028', 1, 0.00),
('DP-PED-20240607-24-1', 'PED-20240607-24', 'IND027', 4, 0.00),
('DP-PED-20240608-3-0', 'PED-20240608-3', 'IND022', 2, 0.00),
('DP-PED-20240611-13-0', 'PED-20240611-13', 'IND038', 3, 0.00),
('DP-PED-20240611-13-1', 'PED-20240611-13', 'IND037', 5, 0.00),
('DP-PED-20240611-13-2', 'PED-20240611-13', 'IND006', 5, 0.00),
('DP-PED-20240612-18-0', 'PED-20240612-18', 'IND036', 2, 0.00),
('DP-PED-20240612-18-1', 'PED-20240612-18', 'IND009', 1, 0.00),
('DP-PED-20240613-17-0', 'PED-20240613-17', 'IND015', 2, 0.00),
('DP-PED-20240613-17-1', 'PED-20240613-17', 'IND028', 2, 0.00),
('DP-PED-20240613-17-2', 'PED-20240613-17', 'IND038', 4, 0.00),
('DP-PED-20240617-9-0', 'PED-20240617-9', 'IND022', 3, 0.00),
('DP-PED-20240617-9-1', 'PED-20240617-9', 'IND035', 5, 0.00),
('DP-PED-20240618-2-0', 'PED-20240618-2', 'IND018', 1, 0.00),
('DP-PED-20240618-2-1', 'PED-20240618-2', 'IND023', 2, 0.00),
('DP-PED-20240618-2-2', 'PED-20240618-2', 'IND021', 4, 0.00),
('DP-PED-20240619-14-0', 'PED-20240619-14', 'IND004', 4, 0.00),
('DP-PED-20240620-16-0', 'PED-20240620-16', 'IND016', 5, 0.00),
('DP-PED-20240621-6-0', 'PED-20240621-6', 'IND019', 3, 0.00),
('DP-PED-20240622-19-0', 'PED-20240622-19', 'IND025', 4, 0.00),
('DP-PED-20240622-23-0', 'PED-20240622-23', 'IND031', 1, 0.00),
('DP-PED-20240622-23-1', 'PED-20240622-23', 'IND019', 4, 0.00),
('DP-PED-20240623-7-0', 'PED-20240623-7', 'IND038', 2, 0.00),
('DP-PED-20240623-7-1', 'PED-20240623-7', 'IND033', 1, 0.00),
('DP-PED-20240623-7-2', 'PED-20240623-7', 'IND003', 1, 0.00),
('DP-PED-20240625-21-0', 'PED-20240625-21', 'IND039', 3, 0.00),
('DP-PED-20240625-22-0', 'PED-20240625-22', 'IND028', 5, 0.00),
('DP-PED-20240625-22-1', 'PED-20240625-22', 'IND015', 5, 0.00),
('DP-PED-20240626-8-0', 'PED-20240626-8', 'IND038', 2, 0.00),
('DP-PED-20240627-4-0', 'PED-20240627-4', 'IND005', 3, 0.00),
('DP-PED-20240629-1-0', 'PED-20240629-1', 'IND035', 4, 0.00),
('DP-PED-20240629-15-0', 'PED-20240629-15', 'IND025', 1, 0.00),
('DP-PED-20240701-11-0', 'PED-20240701-11', 'IND010', 5, 0.00),
('DP-PED-20240701-11-1', 'PED-20240701-11', 'IND028', 4, 0.00),
('DP-PED-20240701-3-0', 'PED-20240701-3', 'IND027', 2, 0.00),
('DP-PED-20240701-3-1', 'PED-20240701-3', 'IND009', 3, 0.00),
('DP-PED-20240703-1-0', 'PED-20240703-1', 'IND023', 2, 0.00),
('DP-PED-20240703-17-0', 'PED-20240703-17', 'IND033', 2, 0.00),
('DP-PED-20240705-12-0', 'PED-20240705-12', 'IND007', 2, 0.00),
('DP-PED-20240705-12-1', 'PED-20240705-12', 'IND007', 5, 0.00),
('DP-PED-20240705-12-2', 'PED-20240705-12', 'IND001', 2, 0.00),
('DP-PED-20240707-23-0', 'PED-20240707-23', 'IND017', 3, 0.00),
('DP-PED-20240707-23-1', 'PED-20240707-23', 'IND003', 1, 0.00),
('DP-PED-20240707-24-0', 'PED-20240707-24', 'IND027', 2, 0.00),
('DP-PED-20240707-24-1', 'PED-20240707-24', 'IND020', 2, 0.00),
('DP-PED-20240707-9-0', 'PED-20240707-9', 'IND004', 4, 0.00),
('DP-PED-20240707-9-1', 'PED-20240707-9', 'IND027', 5, 0.00),
('DP-PED-20240707-9-2', 'PED-20240707-9', 'IND006', 2, 0.00),
('DP-PED-20240709-7-0', 'PED-20240709-7', 'IND020', 4, 0.00),
('DP-PED-20240709-7-1', 'PED-20240709-7', 'IND037', 4, 0.00),
('DP-PED-20240709-7-2', 'PED-20240709-7', 'IND028', 2, 0.00),
('DP-PED-20240710-6-0', 'PED-20240710-6', 'IND017', 3, 0.00),
('DP-PED-20240713-5-0', 'PED-20240713-5', 'IND007', 3, 0.00),
('DP-PED-20240713-8-0', 'PED-20240713-8', 'IND008', 1, 0.00),
('DP-PED-20240714-2-0', 'PED-20240714-2', 'IND025', 1, 0.00),
('DP-PED-20240714-2-1', 'PED-20240714-2', 'IND022', 2, 0.00),
('DP-PED-20240714-2-2', 'PED-20240714-2', 'IND015', 2, 0.00),
('DP-PED-20240716-10-0', 'PED-20240716-10', 'IND036', 1, 0.00),
('DP-PED-20240716-10-1', 'PED-20240716-10', 'IND001', 4, 0.00),
('DP-PED-20240718-16-0', 'PED-20240718-16', 'IND034', 5, 0.00),
('DP-PED-20240720-18-0', 'PED-20240720-18', 'IND038', 3, 0.00),
('DP-PED-20240720-18-1', 'PED-20240720-18', 'IND022', 1, 0.00),
('DP-PED-20240721-21-0', 'PED-20240721-21', 'IND016', 5, 0.00),
('DP-PED-20240721-21-1', 'PED-20240721-21', 'IND035', 3, 0.00),
('DP-PED-20240721-22-0', 'PED-20240721-22', 'IND027', 1, 0.00),
('DP-PED-20240721-22-1', 'PED-20240721-22', 'IND036', 5, 0.00),
('DP-PED-20240722-13-0', 'PED-20240722-13', 'IND034', 1, 0.00),
('DP-PED-20240722-13-1', 'PED-20240722-13', 'IND001', 4, 0.00),
('DP-PED-20240722-13-2', 'PED-20240722-13', 'IND028', 1, 0.00),
('DP-PED-20240722-14-0', 'PED-20240722-14', 'IND032', 1, 0.00),
('DP-PED-20240722-15-0', 'PED-20240722-15', 'IND020', 4, 0.00),
('DP-PED-20240722-15-1', 'PED-20240722-15', 'IND033', 2, 0.00),
('DP-PED-20240722-4-0', 'PED-20240722-4', 'IND017', 2, 0.00),
('DP-PED-20240722-4-1', 'PED-20240722-4', 'IND015', 4, 0.00),
('DP-PED-20240727-19-0', 'PED-20240727-19', 'IND034', 4, 0.00),
('DP-PED-20240731-0-0', 'PED-20240731-0', 'IND034', 2, 0.00),
('DP-PED-20240731-0-1', 'PED-20240731-0', 'IND010', 2, 0.00),
('DP-PED-20240731-0-2', 'PED-20240731-0', 'IND028', 3, 0.00),
('DP-PED-20240731-20-0', 'PED-20240731-20', 'IND036', 2, 0.00),
('DP-PED-20240731-20-1', 'PED-20240731-20', 'IND006', 4, 0.00),
('DP-PED-20240731-20-2', 'PED-20240731-20', 'IND036', 3, 0.00),
('DP-PED-20240801-21-0', 'PED-20240801-21', 'IND008', 3, 0.00),
('DP-PED-20240801-21-1', 'PED-20240801-21', 'IND038', 2, 0.00),
('DP-PED-20240801-21-2', 'PED-20240801-21', 'IND008', 3, 0.00),
('DP-PED-20240802-11-0', 'PED-20240802-11', 'IND030', 1, 0.00),
('DP-PED-20240802-11-1', 'PED-20240802-11', 'IND034', 2, 0.00),
('DP-PED-20240802-11-2', 'PED-20240802-11', 'IND033', 2, 0.00),
('DP-PED-20240802-24-0', 'PED-20240802-24', 'IND029', 4, 0.00),
('DP-PED-20240802-24-1', 'PED-20240802-24', 'IND008', 1, 0.00),
('DP-PED-20240802-3-0', 'PED-20240802-3', 'IND019', 2, 0.00),
('DP-PED-20240802-3-1', 'PED-20240802-3', 'IND037', 5, 0.00),
('DP-PED-20240803-20-0', 'PED-20240803-20', 'IND001', 4, 0.00),
('DP-PED-20240803-20-1', 'PED-20240803-20', 'IND008', 1, 0.00),
('DP-PED-20240803-7-0', 'PED-20240803-7', 'IND015', 2, 0.00),
('DP-PED-20240803-7-1', 'PED-20240803-7', 'IND036', 3, 0.00),
('DP-PED-20240806-13-0', 'PED-20240806-13', 'IND017', 3, 0.00),
('DP-PED-20240806-13-1', 'PED-20240806-13', 'IND010', 5, 0.00),
('DP-PED-20240806-13-2', 'PED-20240806-13', 'IND035', 3, 0.00),
('DP-PED-20240807-23-0', 'PED-20240807-23', 'IND003', 3, 0.00),
('DP-PED-20240807-23-1', 'PED-20240807-23', 'IND017', 2, 0.00),
('DP-PED-20240808-2-0', 'PED-20240808-2', 'IND022', 1, 0.00),
('DP-PED-20240809-6-0', 'PED-20240809-6', 'IND005', 1, 0.00),
('DP-PED-20240810-10-0', 'PED-20240810-10', 'IND025', 4, 0.00),
('DP-PED-20240810-10-1', 'PED-20240810-10', 'IND007', 3, 0.00),
('DP-PED-20240811-14-0', 'PED-20240811-14', 'IND032', 1, 0.00),
('DP-PED-20240811-5-0', 'PED-20240811-5', 'IND016', 2, 0.00),
('DP-PED-20240814-19-0', 'PED-20240814-19', 'IND001', 3, 0.00),
('DP-PED-20240814-19-1', 'PED-20240814-19', 'IND027', 3, 0.00),
('DP-PED-20240814-19-2', 'PED-20240814-19', 'IND034', 3, 0.00),
('DP-PED-20240815-22-0', 'PED-20240815-22', 'IND025', 3, 0.00),
('DP-PED-20240815-8-0', 'PED-20240815-8', 'IND007', 2, 0.00),
('DP-PED-20240815-8-1', 'PED-20240815-8', 'IND005', 3, 0.00),
('DP-PED-20240815-8-2', 'PED-20240815-8', 'IND022', 5, 0.00),
('DP-PED-20240817-1-0', 'PED-20240817-1', 'IND034', 4, 0.00),
('DP-PED-20240817-9-0', 'PED-20240817-9', 'IND007', 4, 0.00),
('DP-PED-20240818-15-0', 'PED-20240818-15', 'IND037', 2, 0.00),
('DP-PED-20240818-15-1', 'PED-20240818-15', 'IND004', 3, 0.00),
('DP-PED-20240818-15-2', 'PED-20240818-15', 'IND028', 1, 0.00),
('DP-PED-20240821-0-0', 'PED-20240821-0', 'IND022', 2, 0.00),
('DP-PED-20240821-0-1', 'PED-20240821-0', 'IND034', 3, 0.00),
('DP-PED-20240821-12-0', 'PED-20240821-12', 'IND004', 3, 0.00),
('DP-PED-20240821-12-1', 'PED-20240821-12', 'IND031', 3, 0.00),
('DP-PED-20240821-12-2', 'PED-20240821-12', 'IND019', 3, 0.00),
('DP-PED-20240821-18-0', 'PED-20240821-18', 'IND005', 1, 0.00),
('DP-PED-20240821-18-1', 'PED-20240821-18', 'IND019', 3, 0.00),
('DP-PED-20240823-4-0', 'PED-20240823-4', 'IND032', 5, 0.00),
('DP-PED-20240824-16-0', 'PED-20240824-16', 'IND024', 2, 0.00),
('DP-PED-20240824-17-0', 'PED-20240824-17', 'IND032', 5, 0.00),
('DP-PED-20240824-17-1', 'PED-20240824-17', 'IND005', 5, 0.00),
('DP-PED-20240824-17-2', 'PED-20240824-17', 'IND009', 3, 0.00),
('DP-PED-20240906-22-0', 'PED-20240906-22', 'IND038', 5, 0.00),
('DP-PED-20240908-12-0', 'PED-20240908-12', 'IND038', 5, 0.00),
('DP-PED-20240908-12-1', 'PED-20240908-12', 'IND001', 2, 0.00),
('DP-PED-20240910-24-0', 'PED-20240910-24', 'IND021', 4, 0.00),
('DP-PED-20240910-24-1', 'PED-20240910-24', 'IND036', 3, 0.00),
('DP-PED-20240910-24-2', 'PED-20240910-24', 'IND006', 1, 0.00),
('DP-PED-20240910-6-0', 'PED-20240910-6', 'IND001', 4, 0.00),
('DP-PED-20240910-6-1', 'PED-20240910-6', 'IND006', 5, 0.00),
('DP-PED-20240910-6-2', 'PED-20240910-6', 'IND028', 5, 0.00),
('DP-PED-20240912-20-0', 'PED-20240912-20', 'IND018', 5, 0.00),
('DP-PED-20240912-9-0', 'PED-20240912-9', 'IND035', 5, 0.00),
('DP-PED-20240912-9-1', 'PED-20240912-9', 'IND023', 1, 0.00),
('DP-PED-20240912-9-2', 'PED-20240912-9', 'IND008', 4, 0.00),
('DP-PED-20240914-10-0', 'PED-20240914-10', 'IND001', 5, 0.00),
('DP-PED-20240914-10-1', 'PED-20240914-10', 'IND034', 2, 0.00),
('DP-PED-20240914-10-2', 'PED-20240914-10', 'IND029', 5, 0.00),
('DP-PED-20240914-15-0', 'PED-20240914-15', 'IND034', 5, 0.00),
('DP-PED-20240914-15-1', 'PED-20240914-15', 'IND002', 3, 0.00),
('DP-PED-20240914-18-0', 'PED-20240914-18', 'IND033', 3, 0.00),
('DP-PED-20240914-18-1', 'PED-20240914-18', 'IND005', 1, 0.00),
('DP-PED-20240914-18-2', 'PED-20240914-18', 'IND005', 2, 0.00),
('DP-PED-20240915-16-0', 'PED-20240915-16', 'IND024', 4, 0.00),
('DP-PED-20240916-21-0', 'PED-20240916-21', 'IND021', 5, 0.00),
('DP-PED-20240916-21-1', 'PED-20240916-21', 'IND039', 2, 0.00),
('DP-PED-20240916-21-2', 'PED-20240916-21', 'IND006', 1, 0.00),
('DP-PED-20240917-19-0', 'PED-20240917-19', 'IND033', 5, 0.00),
('DP-PED-20240917-19-1', 'PED-20240917-19', 'IND028', 5, 0.00),
('DP-PED-20240917-19-2', 'PED-20240917-19', 'IND022', 4, 0.00),
('DP-PED-20240918-5-0', 'PED-20240918-5', 'IND025', 2, 0.00),
('DP-PED-20240918-5-1', 'PED-20240918-5', 'IND037', 3, 0.00),
('DP-PED-20240918-5-2', 'PED-20240918-5', 'IND005', 5, 0.00),
('DP-PED-20240918-7-0', 'PED-20240918-7', 'IND032', 2, 0.00),
('DP-PED-20240918-7-1', 'PED-20240918-7', 'IND009', 2, 0.00),
('DP-PED-20240918-7-2', 'PED-20240918-7', 'IND023', 5, 0.00),
('DP-PED-20240921-0-0', 'PED-20240921-0', 'IND026', 2, 0.00),
('DP-PED-20240921-0-1', 'PED-20240921-0', 'IND001', 5, 0.00),
('DP-PED-20240923-2-0', 'PED-20240923-2', 'IND006', 2, 0.00),
('DP-PED-20240923-2-1', 'PED-20240923-2', 'IND016', 3, 0.00),
('DP-PED-20240923-3-0', 'PED-20240923-3', 'IND017', 3, 0.00),
('DP-PED-20240923-3-1', 'PED-20240923-3', 'IND032', 2, 0.00),
('DP-PED-20240923-4-0', 'PED-20240923-4', 'IND023', 2, 0.00),
('DP-PED-20240923-8-0', 'PED-20240923-8', 'IND030', 2, 0.00),
('DP-PED-20240923-8-1', 'PED-20240923-8', 'IND036', 5, 0.00),
('DP-PED-20240923-8-2', 'PED-20240923-8', 'IND018', 3, 0.00),
('DP-PED-20240925-1-0', 'PED-20240925-1', 'IND008', 1, 0.00),
('DP-PED-20240925-1-1', 'PED-20240925-1', 'IND028', 1, 0.00),
('DP-PED-20240925-1-2', 'PED-20240925-1', 'IND026', 4, 0.00),
('DP-PED-20240925-23-0', 'PED-20240925-23', 'IND024', 1, 0.00),
('DP-PED-20240926-17-0', 'PED-20240926-17', 'IND009', 4, 0.00),
('DP-PED-20240926-17-1', 'PED-20240926-17', 'IND009', 5, 0.00),
('DP-PED-20240928-13-0', 'PED-20240928-13', 'IND007', 4, 0.00),
('DP-PED-20240930-11-0', 'PED-20240930-11', 'IND003', 1, 0.00),
('DP-PED-20240930-11-1', 'PED-20240930-11', 'IND020', 5, 0.00),
('DP-PED-20240930-11-2', 'PED-20240930-11', 'IND036', 1, 0.00),
('DP-PED-20240930-14-0', 'PED-20240930-14', 'IND025', 3, 0.00),
('DP-PED-20240930-14-1', 'PED-20240930-14', 'IND019', 4, 0.00),
('DP-PED-20241004-23-0', 'PED-20241004-23', 'IND015', 3, 0.00),
('DP-PED-20241004-23-1', 'PED-20241004-23', 'IND020', 5, 0.00),
('DP-PED-20241004-23-2', 'PED-20241004-23', 'IND033', 3, 0.00),
('DP-PED-20241004-9-0', 'PED-20241004-9', 'IND026', 4, 0.00),
('DP-PED-20241005-15-0', 'PED-20241005-15', 'IND021', 1, 0.00),
('DP-PED-20241005-18-0', 'PED-20241005-18', 'IND007', 5, 0.00),
('DP-PED-20241005-18-1', 'PED-20241005-18', 'IND033', 3, 0.00),
('DP-PED-20241007-14-0', 'PED-20241007-14', 'IND015', 3, 0.00),
('DP-PED-20241010-16-0', 'PED-20241010-16', 'IND031', 3, 0.00),
('DP-PED-20241010-16-1', 'PED-20241010-16', 'IND016', 1, 0.00),
('DP-PED-20241012-17-0', 'PED-20241012-17', 'IND005', 3, 0.00),
('DP-PED-20241013-2-0', 'PED-20241013-2', 'IND018', 1, 0.00),
('DP-PED-20241013-2-1', 'PED-20241013-2', 'IND019', 4, 0.00),
('DP-PED-20241013-2-2', 'PED-20241013-2', 'IND018', 4, 0.00),
('DP-PED-20241013-6-0', 'PED-20241013-6', 'IND017', 5, 0.00),
('DP-PED-20241013-6-1', 'PED-20241013-6', 'IND024', 1, 0.00),
('DP-PED-20241014-20-0', 'PED-20241014-20', 'IND034', 1, 0.00),
('DP-PED-20241014-20-1', 'PED-20241014-20', 'IND007', 3, 0.00),
('DP-PED-20241016-1-0', 'PED-20241016-1', 'IND031', 1, 0.00),
('DP-PED-20241016-1-1', 'PED-20241016-1', 'IND022', 5, 0.00),
('DP-PED-20241016-24-0', 'PED-20241016-24', 'IND031', 1, 0.00),
('DP-PED-20241020-11-0', 'PED-20241020-11', 'IND015', 2, 0.00),
('DP-PED-20241020-11-1', 'PED-20241020-11', 'IND022', 4, 0.00),
('DP-PED-20241021-19-0', 'PED-20241021-19', 'IND021', 2, 0.00),
('DP-PED-20241021-19-1', 'PED-20241021-19', 'IND033', 2, 0.00),
('DP-PED-20241021-19-2', 'PED-20241021-19', 'IND039', 1, 0.00),
('DP-PED-20241022-0-0', 'PED-20241022-0', 'IND036', 2, 0.00),
('DP-PED-20241022-0-1', 'PED-20241022-0', 'IND017', 1, 0.00),
('DP-PED-20241023-12-0', 'PED-20241023-12', 'IND030', 1, 0.00),
('DP-PED-20241023-12-1', 'PED-20241023-12', 'IND022', 1, 0.00),
('DP-PED-20241023-7-0', 'PED-20241023-7', 'IND021', 3, 0.00),
('DP-PED-20241023-7-1', 'PED-20241023-7', 'IND025', 1, 0.00),
('DP-PED-20241023-7-2', 'PED-20241023-7', 'IND030', 2, 0.00),
('DP-PED-20241024-3-0', 'PED-20241024-3', 'IND039', 5, 0.00),
('DP-PED-20241024-3-1', 'PED-20241024-3', 'IND002', 5, 0.00),
('DP-PED-20241024-8-0', 'PED-20241024-8', 'IND026', 5, 0.00),
('DP-PED-20241026-10-0', 'PED-20241026-10', 'IND019', 2, 0.00),
('DP-PED-20241026-10-1', 'PED-20241026-10', 'IND036', 5, 0.00),
('DP-PED-20241027-13-0', 'PED-20241027-13', 'IND030', 3, 0.00),
('DP-PED-20241027-13-1', 'PED-20241027-13', 'IND004', 1, 0.00),
('DP-PED-20241027-21-0', 'PED-20241027-21', 'IND002', 3, 0.00),
('DP-PED-20241027-21-1', 'PED-20241027-21', 'IND005', 2, 0.00),
('DP-PED-20241027-21-2', 'PED-20241027-21', 'IND008', 1, 0.00),
('DP-PED-20241030-5-0', 'PED-20241030-5', 'IND015', 4, 0.00),
('DP-PED-20241031-22-0', 'PED-20241031-22', 'IND017', 3, 0.00),
('DP-PED-20241031-22-1', 'PED-20241031-22', 'IND009', 4, 0.00),
('DP-PED-20241031-4-0', 'PED-20241031-4', 'IND021', 5, 0.00),
('DP-PED-20241031-4-1', 'PED-20241031-4', 'IND031', 2, 0.00),
('DP-PED-20241031-4-2', 'PED-20241031-4', 'IND004', 4, 0.00),
('DP-PED-20241101-18-0', 'PED-20241101-18', 'IND016', 1, 0.00),
('DP-PED-20241101-18-1', 'PED-20241101-18', 'IND005', 4, 0.00),
('DP-PED-20241101-18-2', 'PED-20241101-18', 'IND028', 3, 0.00),
('DP-PED-20241102-1-0', 'PED-20241102-1', 'IND023', 3, 0.00),
('DP-PED-20241102-1-1', 'PED-20241102-1', 'IND030', 2, 0.00),
('DP-PED-20241102-12-0', 'PED-20241102-12', 'IND023', 3, 0.00),
('DP-PED-20241102-12-1', 'PED-20241102-12', 'IND032', 3, 0.00),
('DP-PED-20241102-12-2', 'PED-20241102-12', 'IND004', 5, 0.00),
('DP-PED-20241105-4-0', 'PED-20241105-4', 'IND002', 2, 0.00),
('DP-PED-20241105-4-1', 'PED-20241105-4', 'IND006', 1, 0.00),
('DP-PED-20241107-0-0', 'PED-20241107-0', 'IND037', 5, 0.00),
('DP-PED-20241107-0-1', 'PED-20241107-0', 'IND036', 4, 0.00),
('DP-PED-20241107-0-2', 'PED-20241107-0', 'IND034', 1, 0.00),
('DP-PED-20241107-6-0', 'PED-20241107-6', 'IND037', 5, 0.00),
('DP-PED-20241107-6-1', 'PED-20241107-6', 'IND026', 3, 0.00),
('DP-PED-20241108-11-0', 'PED-20241108-11', 'IND017', 3, 0.00),
('DP-PED-20241108-11-1', 'PED-20241108-11', 'IND005', 2, 0.00),
('DP-PED-20241108-23-0', 'PED-20241108-23', 'IND007', 5, 0.00),
('DP-PED-20241108-23-1', 'PED-20241108-23', 'IND019', 1, 0.00),
('DP-PED-20241109-19-0', 'PED-20241109-19', 'IND029', 5, 0.00),
('DP-PED-20241109-19-1', 'PED-20241109-19', 'IND027', 2, 0.00),
('DP-PED-20241109-19-2', 'PED-20241109-19', 'IND039', 4, 0.00),
('DP-PED-20241109-8-0', 'PED-20241109-8', 'IND028', 5, 0.00),
('DP-PED-20241110-24-0', 'PED-20241110-24', 'IND007', 1, 0.00),
('DP-PED-20241110-24-1', 'PED-20241110-24', 'IND030', 3, 0.00),
('DP-PED-20241110-24-2', 'PED-20241110-24', 'IND005', 2, 0.00),
('DP-PED-20241110-3-0', 'PED-20241110-3', 'IND017', 5, 0.00),
('DP-PED-20241110-3-1', 'PED-20241110-3', 'IND031', 5, 0.00),
('DP-PED-20241113-2-0', 'PED-20241113-2', 'IND004', 5, 0.00),
('DP-PED-20241113-7-0', 'PED-20241113-7', 'IND016', 4, 0.00),
('DP-PED-20241113-7-1', 'PED-20241113-7', 'IND021', 2, 0.00),
('DP-PED-20241113-7-2', 'PED-20241113-7', 'IND039', 1, 0.00),
('DP-PED-20241114-15-0', 'PED-20241114-15', 'IND032', 2, 0.00),
('DP-PED-20241115-17-0', 'PED-20241115-17', 'IND016', 2, 0.00),
('DP-PED-20241115-17-1', 'PED-20241115-17', 'IND030', 4, 0.00),
('DP-PED-20241117-14-0', 'PED-20241117-14', 'IND029', 2, 0.00),
('DP-PED-20241119-16-0', 'PED-20241119-16', 'IND029', 3, 0.00),
('DP-PED-20241119-16-1', 'PED-20241119-16', 'IND021', 4, 0.00),
('DP-PED-20241120-21-0', 'PED-20241120-21', 'IND004', 3, 0.00),
('DP-PED-20241121-10-0', 'PED-20241121-10', 'IND005', 2, 0.00),
('DP-PED-20241121-10-1', 'PED-20241121-10', 'IND035', 3, 0.00),
('DP-PED-20241121-13-0', 'PED-20241121-13', 'IND020', 5, 0.00),
('DP-PED-20241121-13-1', 'PED-20241121-13', 'IND002', 3, 0.00),
('DP-PED-20241121-13-2', 'PED-20241121-13', 'IND030', 5, 0.00),
('DP-PED-20241123-22-0', 'PED-20241123-22', 'IND007', 5, 0.00),
('DP-PED-20241123-5-0', 'PED-20241123-5', 'IND016', 4, 0.00),
('DP-PED-20241123-5-1', 'PED-20241123-5', 'IND035', 5, 0.00),
('DP-PED-20241123-5-2', 'PED-20241123-5', 'IND010', 2, 0.00),
('DP-PED-20241124-20-0', 'PED-20241124-20', 'IND033', 5, 0.00),
('DP-PED-20241124-20-1', 'PED-20241124-20', 'IND006', 1, 0.00),
('DP-PED-20241124-9-0', 'PED-20241124-9', 'IND036', 3, 0.00),
('DP-PED-20241124-9-1', 'PED-20241124-9', 'IND009', 3, 0.00),
('DP-PED-20241124-9-2', 'PED-20241124-9', 'IND028', 5, 0.00),
('DP-PED-20241201-13-0', 'PED-20241201-13', 'IND005', 5, 0.00),
('DP-PED-20241201-13-1', 'PED-20241201-13', 'IND008', 2, 0.00),
('DP-PED-20241202-23-0', 'PED-20241202-23', 'IND022', 3, 0.00),
('DP-PED-20241204-16-0', 'PED-20241204-16', 'IND007', 5, 0.00),
('DP-PED-20241204-16-1', 'PED-20241204-16', 'IND038', 1, 0.00),
('DP-PED-20241204-5-0', 'PED-20241204-5', 'IND003', 1, 0.00),
('DP-PED-20241204-5-1', 'PED-20241204-5', 'IND004', 2, 0.00),
('DP-PED-20241204-5-2', 'PED-20241204-5', 'IND017', 4, 0.00),
('DP-PED-20241207-22-0', 'PED-20241207-22', 'IND022', 4, 0.00),
('DP-PED-20241207-22-1', 'PED-20241207-22', 'IND022', 1, 0.00),
('DP-PED-20241210-3-0', 'PED-20241210-3', 'IND034', 1, 0.00),
('DP-PED-20241210-3-1', 'PED-20241210-3', 'IND038', 3, 0.00),
('DP-PED-20241210-3-2', 'PED-20241210-3', 'IND031', 2, 0.00),
('DP-PED-20241211-15-0', 'PED-20241211-15', 'IND033', 3, 0.00),
('DP-PED-20241211-15-1', 'PED-20241211-15', 'IND005', 1, 0.00),
('DP-PED-20241211-17-0', 'PED-20241211-17', 'IND021', 4, 0.00),
('DP-PED-20241212-24-0', 'PED-20241212-24', 'IND004', 4, 0.00),
('DP-PED-20241212-24-1', 'PED-20241212-24', 'IND026', 4, 0.00),
('DP-PED-20241212-24-2', 'PED-20241212-24', 'IND029', 2, 0.00),
('DP-PED-20241213-7-0', 'PED-20241213-7', 'IND035', 3, 0.00),
('DP-PED-20241213-7-1', 'PED-20241213-7', 'IND005', 5, 0.00),
('DP-PED-20241215-10-0', 'PED-20241215-10', 'IND021', 4, 0.00),
('DP-PED-20241215-10-1', 'PED-20241215-10', 'IND028', 3, 0.00),
('DP-PED-20241215-12-0', 'PED-20241215-12', 'IND029', 3, 0.00),
('DP-PED-20241215-12-1', 'PED-20241215-12', 'IND025', 2, 0.00),
('DP-PED-20241216-8-0', 'PED-20241216-8', 'IND003', 2, 0.00),
('DP-PED-20241216-8-1', 'PED-20241216-8', 'IND005', 5, 0.00),
('DP-PED-20241216-8-2', 'PED-20241216-8', 'IND038', 1, 0.00),
('DP-PED-20241217-11-0', 'PED-20241217-11', 'IND005', 3, 0.00),
('DP-PED-20241217-11-1', 'PED-20241217-11', 'IND037', 2, 0.00),
('DP-PED-20241217-19-0', 'PED-20241217-19', 'IND008', 1, 0.00),
('DP-PED-20241217-19-1', 'PED-20241217-19', 'IND015', 5, 0.00),
('DP-PED-20241221-18-0', 'PED-20241221-18', 'IND038', 5, 0.00),
('DP-PED-20241221-18-1', 'PED-20241221-18', 'IND038', 5, 0.00),
('DP-PED-20241221-2-0', 'PED-20241221-2', 'IND003', 3, 0.00),
('DP-PED-20241221-2-1', 'PED-20241221-2', 'IND025', 2, 0.00),
('DP-PED-20241221-2-2', 'PED-20241221-2', 'IND015', 5, 0.00),
('DP-PED-20241223-20-0', 'PED-20241223-20', 'IND036', 3, 0.00),
('DP-PED-20241223-20-1', 'PED-20241223-20', 'IND036', 5, 0.00),
('DP-PED-20241223-20-2', 'PED-20241223-20', 'IND026', 3, 0.00),
('DP-PED-20241225-6-0', 'PED-20241225-6', 'IND019', 1, 0.00),
('DP-PED-20241227-0-0', 'PED-20241227-0', 'IND008', 3, 0.00),
('DP-PED-20241227-0-1', 'PED-20241227-0', 'IND019', 5, 0.00),
('DP-PED-20241227-0-2', 'PED-20241227-0', 'IND006', 1, 0.00),
('DP-PED-20241227-4-0', 'PED-20241227-4', 'IND009', 1, 0.00),
('DP-PED-20241227-4-1', 'PED-20241227-4', 'IND007', 3, 0.00),
('DP-PED-20241227-4-2', 'PED-20241227-4', 'IND025', 3, 0.00),
('DP-PED-20241228-1-0', 'PED-20241228-1', 'IND003', 5, 0.00),
('DP-PED-20241228-1-1', 'PED-20241228-1', 'IND005', 1, 0.00),
('DP-PED-20241228-9-0', 'PED-20241228-9', 'IND028', 4, 0.00),
('DP-PED-20241230-14-0', 'PED-20241230-14', 'IND023', 5, 0.00),
('DP-PED-20241230-14-1', 'PED-20241230-14', 'IND021', 5, 0.00),
('DP-PED-20241230-21-0', 'PED-20241230-21', 'IND006', 5, 0.00),
('DP-PED-20241230-21-1', 'PED-20241230-21', 'IND002', 3, 0.00),
('DP-PED-20241230-21-2', 'PED-20241230-21', 'IND022', 5, 0.00),
('DP-PED-20250102-12-0', 'PED-20250102-12', 'IND002', 4, 0.00),
('DP-PED-20250102-12-1', 'PED-20250102-12', 'IND027', 5, 0.00),
('DP-PED-20250102-12-2', 'PED-20250102-12', 'IND038', 5, 0.00),
('DP-PED-20250102-22-0', 'PED-20250102-22', 'IND024', 2, 0.00),
('DP-PED-20250103-2-0', 'PED-20250103-2', 'IND020', 3, 0.00),
('DP-PED-20250103-2-1', 'PED-20250103-2', 'IND016', 1, 0.00),
('DP-PED-20250103-2-2', 'PED-20250103-2', 'IND023', 2, 0.00),
('DP-PED-20250107-21-0', 'PED-20250107-21', 'IND008', 4, 0.00),
('DP-PED-20250108-13-0', 'PED-20250108-13', 'IND019', 4, 0.00),
('DP-PED-20250108-18-0', 'PED-20250108-18', 'IND022', 2, 0.00),
('DP-PED-20250109-14-0', 'PED-20250109-14', 'IND029', 2, 0.00),
('DP-PED-20250109-14-1', 'PED-20250109-14', 'IND022', 3, 0.00),
('DP-PED-20250109-14-2', 'PED-20250109-14', 'IND038', 2, 0.00),
('DP-PED-20250112-8-0', 'PED-20250112-8', 'IND008', 1, 0.00),
('DP-PED-20250112-8-1', 'PED-20250112-8', 'IND029', 2, 0.00),
('DP-PED-20250112-8-2', 'PED-20250112-8', 'IND008', 2, 0.00),
('DP-PED-20250116-20-0', 'PED-20250116-20', 'IND007', 4, 0.00),
('DP-PED-20250116-20-1', 'PED-20250116-20', 'IND039', 5, 0.00),
('DP-PED-20250116-24-0', 'PED-20250116-24', 'IND010', 1, 0.00),
('DP-PED-20250117-15-0', 'PED-20250117-15', 'IND006', 1, 0.00),
('DP-PED-20250117-15-1', 'PED-20250117-15', 'IND030', 3, 0.00),
('DP-PED-20250118-19-0', 'PED-20250118-19', 'IND016', 1, 0.00),
('DP-PED-20250119-16-0', 'PED-20250119-16', 'IND007', 5, 0.00),
('DP-PED-20250119-16-1', 'PED-20250119-16', 'IND027', 4, 0.00),
('DP-PED-20250119-16-2', 'PED-20250119-16', 'IND010', 3, 0.00),
('DP-PED-20250120-17-0', 'PED-20250120-17', 'IND024', 2, 0.00),
('DP-PED-20250120-17-1', 'PED-20250120-17', 'IND032', 1, 0.00),
('DP-PED-20250121-10-0', 'PED-20250121-10', 'IND023', 3, 0.00),
('DP-PED-20250122-0-0', 'PED-20250122-0', 'IND036', 5, 0.00),
('DP-PED-20250122-0-1', 'PED-20250122-0', 'IND001', 1, 0.00),
('DP-PED-20250123-5-0', 'PED-20250123-5', 'IND039', 4, 0.00),
('DP-PED-20250123-6-0', 'PED-20250123-6', 'IND020', 2, 0.00),
('DP-PED-20250123-6-1', 'PED-20250123-6', 'IND005', 5, 0.00),
('DP-PED-20250124-7-0', 'PED-20250124-7', 'IND039', 4, 0.00),
('DP-PED-20250126-4-0', 'PED-20250126-4', 'IND039', 4, 0.00),
('DP-PED-20250126-4-1', 'PED-20250126-4', 'IND022', 3, 0.00),
('DP-PED-20250126-4-2', 'PED-20250126-4', 'IND029', 1, 0.00),
('DP-PED-20250126-9-0', 'PED-20250126-9', 'IND031', 4, 0.00),
('DP-PED-20250126-9-1', 'PED-20250126-9', 'IND020', 5, 0.00),
('DP-PED-20250128-1-0', 'PED-20250128-1', 'IND007', 4, 0.00),
('DP-PED-20250128-11-0', 'PED-20250128-11', 'IND008', 1, 0.00),
('DP-PED-20250128-11-1', 'PED-20250128-11', 'IND019', 1, 0.00),
('DP-PED-20250130-23-0', 'PED-20250130-23', 'IND034', 5, 0.00),
('DP-PED-20250131-3-0', 'PED-20250131-3', 'IND029', 1, 0.00),
('DP-PED-20250201-15-0', 'PED-20250201-15', 'IND007', 4, 0.00),
('DP-PED-20250201-15-1', 'PED-20250201-15', 'IND030', 4, 0.00),
('DP-PED-20250203-20-0', 'PED-20250203-20', 'IND031', 1, 0.00),
('DP-PED-20250205-16-0', 'PED-20250205-16', 'IND030', 5, 0.00),
('DP-PED-20250205-16-1', 'PED-20250205-16', 'IND010', 4, 0.00),
('DP-PED-20250205-16-2', 'PED-20250205-16', 'IND033', 5, 0.00),
('DP-PED-20250205-21-0', 'PED-20250205-21', 'IND018', 5, 0.00),
('DP-PED-20250205-21-1', 'PED-20250205-21', 'IND007', 2, 0.00),
('DP-PED-20250206-1-0', 'PED-20250206-1', 'IND005', 1, 0.00),
('DP-PED-20250206-1-1', 'PED-20250206-1', 'IND031', 4, 0.00),
('DP-PED-20250206-1-2', 'PED-20250206-1', 'IND003', 2, 0.00),
('DP-PED-20250206-8-0', 'PED-20250206-8', 'IND021', 1, 0.00),
('DP-PED-20250206-8-1', 'PED-20250206-8', 'IND016', 1, 0.00),
('DP-PED-20250207-13-0', 'PED-20250207-13', 'IND020', 4, 0.00),
('DP-PED-20250207-13-1', 'PED-20250207-13', 'IND022', 2, 0.00),
('DP-PED-20250207-13-2', 'PED-20250207-13', 'IND025', 2, 0.00),
('DP-PED-20250208-4-0', 'PED-20250208-4', 'IND029', 1, 0.00),
('DP-PED-20250208-4-1', 'PED-20250208-4', 'IND023', 2, 0.00),
('DP-PED-20250208-4-2', 'PED-20250208-4', 'IND039', 5, 0.00),
('DP-PED-20250209-19-0', 'PED-20250209-19', 'IND029', 1, 0.00),
('DP-PED-20250209-19-1', 'PED-20250209-19', 'IND036', 5, 0.00),
('DP-PED-20250209-19-2', 'PED-20250209-19', 'IND038', 5, 0.00),
('DP-PED-20250213-12-0', 'PED-20250213-12', 'IND031', 5, 0.00),
('DP-PED-20250215-10-0', 'PED-20250215-10', 'IND038', 2, 0.00),
('DP-PED-20250216-7-0', 'PED-20250216-7', 'IND024', 5, 0.00),
('DP-PED-20250216-7-1', 'PED-20250216-7', 'IND025', 2, 0.00),
('DP-PED-20250217-3-0', 'PED-20250217-3', 'IND004', 3, 0.00),
('DP-PED-20250217-3-1', 'PED-20250217-3', 'IND018', 2, 0.00),
('DP-PED-20250218-11-0', 'PED-20250218-11', 'IND034', 2, 0.00),
('DP-PED-20250218-6-0', 'PED-20250218-6', 'IND001', 3, 0.00),
('DP-PED-20250218-6-1', 'PED-20250218-6', 'IND007', 3, 0.00),
('DP-PED-20250218-6-2', 'PED-20250218-6', 'IND018', 1, 0.00),
('DP-PED-20250219-14-0', 'PED-20250219-14', 'IND020', 5, 0.00),
('DP-PED-20250219-14-1', 'PED-20250219-14', 'IND002', 4, 0.00),
('DP-PED-20250220-0-0', 'PED-20250220-0', 'IND037', 1, 0.00),
('DP-PED-20250220-0-1', 'PED-20250220-0', 'IND029', 1, 0.00),
('DP-PED-20250220-0-2', 'PED-20250220-0', 'IND029', 1, 0.00),
('DP-PED-20250221-2-0', 'PED-20250221-2', 'IND020', 5, 0.00),
('DP-PED-20250221-2-1', 'PED-20250221-2', 'IND035', 4, 0.00),
('DP-PED-20250221-2-2', 'PED-20250221-2', 'IND018', 3, 0.00),
('DP-PED-20250221-23-0', 'PED-20250221-23', 'IND039', 5, 0.00),
('DP-PED-20250222-5-0', 'PED-20250222-5', 'IND018', 3, 0.00),
('DP-PED-20250222-5-1', 'PED-20250222-5', 'IND004', 1, 0.00),
('DP-PED-20250223-18-0', 'PED-20250223-18', 'IND034', 1, 0.00),
('DP-PED-20250223-18-1', 'PED-20250223-18', 'IND017', 2, 0.00),
('DP-PED-20250223-18-2', 'PED-20250223-18', 'IND009', 3, 0.00),
('DP-PED-20250225-17-0', 'PED-20250225-17', 'IND002', 5, 0.00),
('DP-PED-20250225-17-1', 'PED-20250225-17', 'IND003', 4, 0.00),
('DP-PED-20250226-22-0', 'PED-20250226-22', 'IND022', 4, 0.00),
('DP-PED-20250227-24-0', 'PED-20250227-24', 'IND024', 1, 0.00),
('DP-PED-20250228-9-0', 'PED-20250228-9', 'IND025', 5, 0.00),
('DP-PED-20250301-20-0', 'PED-20250301-20', 'IND037', 3, 0.00),
('DP-PED-20250305-10-0', 'PED-20250305-10', 'IND039', 4, 0.00),
('DP-PED-20250307-13-0', 'PED-20250307-13', 'IND002', 3, 0.00),
('DP-PED-20250307-9-0', 'PED-20250307-9', 'IND031', 3, 0.00),
('DP-PED-20250308-4-0', 'PED-20250308-4', 'IND003', 4, 0.00),
('DP-PED-20250308-4-1', 'PED-20250308-4', 'IND016', 3, 0.00),
('DP-PED-20250308-4-2', 'PED-20250308-4', 'IND015', 1, 0.00),
('DP-PED-20250309-23-0', 'PED-20250309-23', 'IND037', 1, 0.00),
('DP-PED-20250309-7-0', 'PED-20250309-7', 'IND016', 4, 0.00),
('DP-PED-20250309-7-1', 'PED-20250309-7', 'IND008', 1, 0.00),
('DP-PED-20250309-7-2', 'PED-20250309-7', 'IND037', 2, 0.00),
('DP-PED-20250310-16-0', 'PED-20250310-16', 'IND038', 4, 0.00),
('DP-PED-20250310-16-1', 'PED-20250310-16', 'IND001', 4, 0.00),
('DP-PED-20250310-16-2', 'PED-20250310-16', 'IND027', 5, 0.00),
('DP-PED-20250316-18-0', 'PED-20250316-18', 'IND028', 5, 0.00),
('DP-PED-20250316-18-1', 'PED-20250316-18', 'IND029', 4, 0.00),
('DP-PED-20250316-18-2', 'PED-20250316-18', 'IND008', 1, 0.00),
('DP-PED-20250316-3-0', 'PED-20250316-3', 'IND021', 2, 0.00),
('DP-PED-20250316-3-1', 'PED-20250316-3', 'IND028', 4, 0.00),
('DP-PED-20250316-3-2', 'PED-20250316-3', 'IND024', 3, 0.00),
('DP-PED-20250318-11-0', 'PED-20250318-11', 'IND018', 1, 0.00),
('DP-PED-20250318-15-0', 'PED-20250318-15', 'IND017', 3, 0.00),
('DP-PED-20250318-15-1', 'PED-20250318-15', 'IND033', 2, 0.00),
('DP-PED-20250318-24-0', 'PED-20250318-24', 'IND035', 2, 0.00),
('DP-PED-20250318-24-1', 'PED-20250318-24', 'IND009', 1, 0.00),
('DP-PED-20250318-24-2', 'PED-20250318-24', 'IND027', 5, 0.00),
('DP-PED-20250320-8-0', 'PED-20250320-8', 'IND028', 1, 0.00),
('DP-PED-20250320-8-1', 'PED-20250320-8', 'IND038', 2, 0.00),
('DP-PED-20250320-8-2', 'PED-20250320-8', 'IND006', 1, 0.00),
('DP-PED-20250321-5-0', 'PED-20250321-5', 'IND017', 4, 0.00),
('DP-PED-20250322-14-0', 'PED-20250322-14', 'IND039', 3, 0.00),
('DP-PED-20250322-14-1', 'PED-20250322-14', 'IND016', 2, 0.00),
('DP-PED-20250322-14-2', 'PED-20250322-14', 'IND018', 1, 0.00),
('DP-PED-20250323-21-0', 'PED-20250323-21', 'IND036', 1, 0.00),
('DP-PED-20250323-21-1', 'PED-20250323-21', 'IND004', 1, 0.00),
('DP-PED-20250323-21-2', 'PED-20250323-21', 'IND032', 5, 0.00),
('DP-PED-20250325-19-0', 'PED-20250325-19', 'IND033', 5, 0.00),
('DP-PED-20250325-19-1', 'PED-20250325-19', 'IND016', 5, 0.00),
('DP-PED-20250327-0-0', 'PED-20250327-0', 'IND022', 4, 0.00),
('DP-PED-20250327-0-1', 'PED-20250327-0', 'IND002', 1, 0.00),
('DP-PED-20250327-0-2', 'PED-20250327-0', 'IND010', 1, 0.00),
('DP-PED-20250328-1-0', 'PED-20250328-1', 'IND009', 4, 0.00),
('DP-PED-20250328-1-1', 'PED-20250328-1', 'IND036', 2, 0.00),
('DP-PED-20250329-17-0', 'PED-20250329-17', 'IND002', 1, 0.00),
('DP-PED-20250330-2-0', 'PED-20250330-2', 'IND008', 3, 0.00),
('DP-PED-20250330-2-1', 'PED-20250330-2', 'IND005', 5, 0.00),
('DP-PED-20250330-22-0', 'PED-20250330-22', 'IND025', 1, 0.00),
('DP-PED-20250331-12-0', 'PED-20250331-12', 'IND025', 4, 0.00),
('DP-PED-20250331-12-1', 'PED-20250331-12', 'IND027', 1, 0.00),
('DP-PED-20250331-12-2', 'PED-20250331-12', 'IND036', 5, 0.00),
('DP-PED-20250331-6-0', 'PED-20250331-6', 'IND030', 4, 0.00),
('DP-PED-20250331-6-1', 'PED-20250331-6', 'IND022', 2, 0.00),
('DP-PED-20250401-9-0', 'PED-20250401-9', 'IND029', 1, 0.00),
('DP-PED-20250401-9-1', 'PED-20250401-9', 'IND032', 3, 0.00),
('DP-PED-20250401-9-2', 'PED-20250401-9', 'IND028', 1, 0.00),
('DP-PED-20250403-1-0', 'PED-20250403-1', 'IND007', 3, 0.00),
('DP-PED-20250403-1-1', 'PED-20250403-1', 'IND039', 3, 0.00),
('DP-PED-20250403-2-0', 'PED-20250403-2', 'IND027', 5, 0.00),
('DP-PED-20250403-2-1', 'PED-20250403-2', 'IND030', 5, 0.00),
('DP-PED-20250403-23-0', 'PED-20250403-23', 'IND034', 3, 0.00),
('DP-PED-20250405-24-0', 'PED-20250405-24', 'IND019', 2, 0.00),
('DP-PED-20250405-24-1', 'PED-20250405-24', 'IND010', 2, 0.00),
('DP-PED-20250406-11-0', 'PED-20250406-11', 'IND019', 5, 0.00),
('DP-PED-20250406-11-1', 'PED-20250406-11', 'IND033', 4, 0.00),
('DP-PED-20250406-11-2', 'PED-20250406-11', 'IND032', 5, 0.00),
('DP-PED-20250406-21-0', 'PED-20250406-21', 'IND027', 2, 0.00),
('DP-PED-20250406-21-1', 'PED-20250406-21', 'IND027', 2, 0.00),
('DP-PED-20250410-8-0', 'PED-20250410-8', 'IND021', 3, 0.00),
('DP-PED-20250411-15-0', 'PED-20250411-15', 'IND031', 3, 0.00),
('DP-PED-20250411-15-1', 'PED-20250411-15', 'IND004', 1, 0.00),
('DP-PED-20250411-5-0', 'PED-20250411-5', 'IND024', 5, 0.00);
INSERT INTO `detallepedido` (`idDetallePedido`, `numeroPedido`, `codigoIndumentaria`, `cantidad`, `descuentoItem`) VALUES
('DP-PED-20250411-5-1', 'PED-20250411-5', 'IND015', 3, 0.00),
('DP-PED-20250412-14-0', 'PED-20250412-14', 'IND003', 4, 0.00),
('DP-PED-20250412-19-0', 'PED-20250412-19', 'IND022', 2, 0.00),
('DP-PED-20250412-19-1', 'PED-20250412-19', 'IND017', 4, 0.00),
('DP-PED-20250413-13-0', 'PED-20250413-13', 'IND028', 1, 0.00),
('DP-PED-20250413-13-1', 'PED-20250413-13', 'IND026', 4, 0.00),
('DP-PED-20250415-10-0', 'PED-20250415-10', 'IND023', 2, 0.00),
('DP-PED-20250415-10-1', 'PED-20250415-10', 'IND017', 4, 0.00),
('DP-PED-20250415-10-2', 'PED-20250415-10', 'IND038', 1, 0.00),
('DP-PED-20250416-22-0', 'PED-20250416-22', 'IND004', 1, 0.00),
('DP-PED-20250416-22-1', 'PED-20250416-22', 'IND008', 4, 0.00),
('DP-PED-20250417-12-0', 'PED-20250417-12', 'IND036', 3, 0.00),
('DP-PED-20250417-7-0', 'PED-20250417-7', 'IND020', 1, 0.00),
('DP-PED-20250417-7-1', 'PED-20250417-7', 'IND034', 1, 0.00),
('DP-PED-20250418-20-0', 'PED-20250418-20', 'IND001', 3, 0.00),
('DP-PED-20250418-6-0', 'PED-20250418-6', 'IND034', 1, 0.00),
('DP-PED-20250418-6-1', 'PED-20250418-6', 'IND031', 3, 0.00),
('DP-PED-20250425-4-0', 'PED-20250425-4', 'IND035', 2, 0.00),
('DP-PED-20250425-4-1', 'PED-20250425-4', 'IND003', 2, 0.00),
('DP-PED-20250425-4-2', 'PED-20250425-4', 'IND027', 1, 0.00),
('DP-PED-20250426-0-0', 'PED-20250426-0', 'IND037', 5, 0.00),
('DP-PED-20250426-0-1', 'PED-20250426-0', 'IND018', 3, 0.00),
('DP-PED-20250426-0-2', 'PED-20250426-0', 'IND037', 2, 0.00),
('DP-PED-20250427-17-0', 'PED-20250427-17', 'IND034', 5, 0.00),
('DP-PED-20250429-18-0', 'PED-20250429-18', 'IND028', 2, 0.00),
('DP-PED-20250429-18-1', 'PED-20250429-18', 'IND035', 1, 0.00),
('DP-PED-20250430-16-0', 'PED-20250430-16', 'IND023', 5, 0.00),
('DP-PED-20250430-16-1', 'PED-20250430-16', 'IND028', 4, 0.00),
('DP-PED-20250430-3-0', 'PED-20250430-3', 'IND030', 4, 0.00),
('DP-PED-20250430-3-1', 'PED-20250430-3', 'IND020', 1, 0.00),
('DP-PED-20250430-3-2', 'PED-20250430-3', 'IND039', 4, 0.00),
('DP-PED-20250501-2-0', 'PED-20250501-2', 'IND039', 5, 0.00),
('DP-PED-20250501-2-1', 'PED-20250501-2', 'IND015', 5, 0.00),
('DP-PED-20250501-2-2', 'PED-20250501-2', 'IND027', 3, 0.00),
('DP-PED-20250501-7-0', 'PED-20250501-7', 'IND024', 1, 0.00),
('DP-PED-20250501-7-1', 'PED-20250501-7', 'IND008', 3, 0.00),
('DP-PED-20250502-22-0', 'PED-20250502-22', 'IND010', 5, 0.00),
('DP-PED-20250502-22-1', 'PED-20250502-22', 'IND004', 4, 0.00),
('DP-PED-20250502-22-2', 'PED-20250502-22', 'IND030', 5, 0.00),
('DP-PED-20250503-1-0', 'PED-20250503-1', 'IND023', 3, 0.00),
('DP-PED-20250503-1-1', 'PED-20250503-1', 'IND038', 2, 0.00),
('DP-PED-20250503-1-2', 'PED-20250503-1', 'IND015', 4, 0.00),
('DP-PED-20250504-16-0', 'PED-20250504-16', 'IND002', 5, 0.00),
('DP-PED-20250504-16-1', 'PED-20250504-16', 'IND029', 4, 0.00),
('DP-PED-20250506-0-0', 'PED-20250506-0', 'IND031', 5, 0.00),
('DP-PED-20250506-0-1', 'PED-20250506-0', 'IND020', 2, 0.00),
('DP-PED-20250506-0-2', 'PED-20250506-0', 'IND008', 1, 0.00),
('DP-PED-20250510-14-0', 'PED-20250510-14', 'IND021', 2, 0.00),
('DP-PED-20250510-14-1', 'PED-20250510-14', 'IND016', 4, 0.00),
('DP-PED-20250510-14-2', 'PED-20250510-14', 'IND005', 4, 0.00),
('DP-PED-20250511-24-0', 'PED-20250511-24', 'IND002', 3, 0.00),
('DP-PED-20250512-3-0', 'PED-20250512-3', 'IND001', 5, 0.00),
('DP-PED-20250514-4-0', 'PED-20250514-4', 'IND031', 3, 0.00),
('DP-PED-20250514-4-1', 'PED-20250514-4', 'IND003', 5, 0.00),
('DP-PED-20250517-15-0', 'PED-20250517-15', 'IND039', 3, 0.00),
('DP-PED-20250517-15-1', 'PED-20250517-15', 'IND021', 5, 0.00),
('DP-PED-20250518-5-0', 'PED-20250518-5', 'IND001', 1, 0.00),
('DP-PED-20250519-13-0', 'PED-20250519-13', 'IND024', 3, 0.00),
('DP-PED-20250519-13-1', 'PED-20250519-13', 'IND027', 5, 0.00),
('DP-PED-20250519-13-2', 'PED-20250519-13', 'IND006', 2, 0.00),
('DP-PED-20250523-10-0', 'PED-20250523-10', 'IND031', 2, 0.00),
('DP-PED-20250523-10-1', 'PED-20250523-10', 'IND020', 2, 0.00),
('DP-PED-20250523-6-0', 'PED-20250523-6', 'IND026', 1, 0.00),
('DP-PED-20250523-6-1', 'PED-20250523-6', 'IND009', 1, 0.00),
('DP-PED-20250523-6-2', 'PED-20250523-6', 'IND003', 5, 0.00),
('DP-PED-20250524-8-0', 'PED-20250524-8', 'IND025', 4, 0.00),
('DP-PED-20250524-8-1', 'PED-20250524-8', 'IND007', 3, 0.00),
('DP-PED-20250524-8-2', 'PED-20250524-8', 'IND009', 3, 0.00),
('DP-PED-20250525-20-0', 'PED-20250525-20', 'IND010', 4, 0.00),
('DP-PED-20250525-20-1', 'PED-20250525-20', 'IND018', 1, 0.00),
('DP-PED-20250526-18-0', 'PED-20250526-18', 'IND018', 5, 0.00),
('DP-PED-20250527-11-0', 'PED-20250527-11', 'IND019', 5, 0.00),
('DP-PED-20250527-11-1', 'PED-20250527-11', 'IND021', 3, 0.00),
('DP-PED-20250527-9-0', 'PED-20250527-9', 'IND020', 2, 0.00),
('DP-PED-20250529-19-0', 'PED-20250529-19', 'IND004', 1, 0.00),
('DP-PED-20250529-19-1', 'PED-20250529-19', 'IND030', 3, 0.00),
('DP-PED-20250529-21-0', 'PED-20250529-21', 'IND030', 5, 0.00),
('DP-PED-20250530-23-0', 'PED-20250530-23', 'IND024', 2, 0.00),
('DP-PED-20250530-23-1', 'PED-20250530-23', 'IND017', 4, 0.00),
('DP-PED-20250530-23-2', 'PED-20250530-23', 'IND002', 2, 0.00),
('DP-PED-20250531-12-0', 'PED-20250531-12', 'IND028', 1, 0.00),
('DP-PED-20250531-17-0', 'PED-20250531-17', 'IND035', 2, 0.00),
('DP-PED-20250531-17-1', 'PED-20250531-17', 'IND020', 4, 0.00),
('DP-PED-20250601-17-0', 'PED-20250601-17', 'IND003', 3, 0.00),
('DP-PED-20250604-3-0', 'PED-20250604-3', 'IND018', 4, 0.00),
('DP-PED-20250604-3-1', 'PED-20250604-3', 'IND039', 5, 0.00),
('DP-PED-20250604-8-0', 'PED-20250604-8', 'IND027', 2, 0.00),
('DP-PED-20250605-11-0', 'PED-20250605-11', 'IND016', 2, 0.00),
('DP-PED-20250613-20-0', 'PED-20250613-20', 'IND009', 4, 0.00),
('DP-PED-20250613-20-1', 'PED-20250613-20', 'IND032', 5, 0.00),
('DP-PED-20250614-19-0', 'PED-20250614-19', 'IND016', 3, 0.00),
('DP-PED-20250614-19-1', 'PED-20250614-19', 'IND018', 3, 0.00),
('DP-PED-20250615-18-0', 'PED-20250615-18', 'IND001', 5, 0.00),
('DP-PED-20250615-24-0', 'PED-20250615-24', 'IND034', 3, 0.00),
('DP-PED-20250615-24-1', 'PED-20250615-24', 'IND018', 2, 0.00),
('DP-PED-20250615-24-2', 'PED-20250615-24', 'IND036', 5, 0.00),
('DP-PED-20250616-10-0', 'PED-20250616-10', 'IND038', 2, 0.00),
('DP-PED-20250616-10-1', 'PED-20250616-10', 'IND019', 2, 0.00),
('DP-PED-20250616-16-0', 'PED-20250616-16', 'IND022', 5, 0.00),
('DP-PED-20250616-16-1', 'PED-20250616-16', 'IND017', 5, 0.00),
('DP-PED-20250617-12-0', 'PED-20250617-12', 'IND022', 1, 0.00),
('DP-PED-20250617-13-0', 'PED-20250617-13', 'IND039', 2, 0.00),
('DP-PED-20250618-6-0', 'PED-20250618-6', 'IND006', 3, 0.00),
('DP-PED-20250618-6-1', 'PED-20250618-6', 'IND015', 5, 0.00),
('DP-PED-20250618-6-2', 'PED-20250618-6', 'IND020', 4, 0.00),
('DP-PED-20250620-0-0', 'PED-20250620-0', 'IND023', 3, 0.00),
('DP-PED-20250620-0-1', 'PED-20250620-0', 'IND005', 1, 0.00),
('DP-PED-20250620-1-0', 'PED-20250620-1', 'IND010', 2, 0.00),
('DP-PED-20250620-1-1', 'PED-20250620-1', 'IND036', 3, 0.00),
('DP-PED-20250621-2-0', 'PED-20250621-2', 'IND026', 4, 0.00),
('DP-PED-20250621-2-1', 'PED-20250621-2', 'IND005', 2, 0.00),
('DP-PED-20250621-9-0', 'PED-20250621-9', 'IND039', 3, 0.00),
('DP-PED-20250622-22-0', 'PED-20250622-22', 'IND017', 1, 0.00),
('DP-PED-20250622-22-1', 'PED-20250622-22', 'IND023', 2, 0.00),
('DP-PED-20250622-7-0', 'PED-20250622-7', 'IND015', 1, 0.00),
('DP-PED-20250622-7-1', 'PED-20250622-7', 'IND032', 3, 0.00),
('DP-PED-20250622-7-2', 'PED-20250622-7', 'IND006', 2, 0.00),
('DP-PED-20250623-15-0', 'PED-20250623-15', 'IND021', 5, 0.00),
('DP-PED-20250623-15-1', 'PED-20250623-15', 'IND037', 1, 0.00),
('DP-PED-20250624-14-0', 'PED-20250624-14', 'IND024', 1, 0.00),
('DP-PED-20250624-14-1', 'PED-20250624-14', 'IND028', 1, 0.00),
('DP-PED-20250624-14-2', 'PED-20250624-14', 'IND034', 4, 0.00),
('DP-PED-20250625-21-0', 'PED-20250625-21', 'IND016', 4, 0.00),
('DP-PED-20250625-21-1', 'PED-20250625-21', 'IND015', 3, 0.00),
('DP-PED-20250628-23-0', 'PED-20250628-23', 'IND003', 1, 0.00),
('DP-PED-20250628-23-1', 'PED-20250628-23', 'IND003', 1, 0.00),
('DP-PED-20250629-4-0', 'PED-20250629-4', 'IND030', 4, 0.00),
('DP-PED-20250629-4-1', 'PED-20250629-4', 'IND006', 5, 0.00),
('DP-PED-20250629-4-2', 'PED-20250629-4', 'IND026', 3, 0.00),
('DP-PED-20250629-5-0', 'PED-20250629-5', 'IND039', 3, 0.00),
('DP-PED-20250702-24-0', 'PED-20250702-24', 'IND003', 3, 0.00),
('DP-PED-20250702-24-1', 'PED-20250702-24', 'IND022', 5, 0.00),
('DP-PED-20250702-24-2', 'PED-20250702-24', 'IND002', 3, 0.00),
('DP-PED-20250703-16-0', 'PED-20250703-16', 'IND032', 3, 0.00),
('DP-PED-20250706-21-0', 'PED-20250706-21', 'IND002', 5, 0.00),
('DP-PED-20250706-21-1', 'PED-20250706-21', 'IND032', 1, 0.00),
('DP-PED-20250706-9-0', 'PED-20250706-9', 'IND001', 4, 0.00),
('DP-PED-20250708-11-0', 'PED-20250708-11', 'IND028', 2, 0.00),
('DP-PED-20250708-11-1', 'PED-20250708-11', 'IND024', 5, 0.00),
('DP-PED-20250708-11-2', 'PED-20250708-11', 'IND017', 3, 0.00),
('DP-PED-20250708-8-0', 'PED-20250708-8', 'IND024', 4, 0.00),
('DP-PED-20250708-8-1', 'PED-20250708-8', 'IND017', 5, 0.00),
('DP-PED-20250708-8-2', 'PED-20250708-8', 'IND027', 3, 0.00),
('DP-PED-20250709-1-0', 'PED-20250709-1', 'IND002', 2, 0.00),
('DP-PED-20250713-20-0', 'PED-20250713-20', 'IND024', 1, 0.00),
('DP-PED-20250713-20-1', 'PED-20250713-20', 'IND021', 2, 0.00),
('DP-PED-20250714-6-0', 'PED-20250714-6', 'IND015', 5, 0.00),
('DP-PED-20250714-6-1', 'PED-20250714-6', 'IND028', 4, 0.00),
('DP-PED-20250714-6-2', 'PED-20250714-6', 'IND002', 2, 0.00),
('DP-PED-20250715-23-0', 'PED-20250715-23', 'IND016', 1, 0.00),
('DP-PED-20250716-13-0', 'PED-20250716-13', 'IND033', 3, 0.00),
('DP-PED-20250716-13-1', 'PED-20250716-13', 'IND025', 4, 0.00),
('DP-PED-20250716-13-2', 'PED-20250716-13', 'IND029', 3, 0.00),
('DP-PED-20250718-5-0', 'PED-20250718-5', 'IND034', 3, 0.00),
('DP-PED-20250719-0-0', 'PED-20250719-0', 'IND032', 2, 0.00),
('DP-PED-20250719-10-0', 'PED-20250719-10', 'IND039', 5, 0.00),
('DP-PED-20250719-10-1', 'PED-20250719-10', 'IND002', 4, 0.00),
('DP-PED-20250719-10-2', 'PED-20250719-10', 'IND028', 1, 0.00),
('DP-PED-20250720-2-0', 'PED-20250720-2', 'IND027', 5, 0.00),
('DP-PED-20250726-19-0', 'PED-20250726-19', 'IND038', 1, 0.00),
('DP-PED-20250726-7-0', 'PED-20250726-7', 'IND005', 3, 0.00),
('DP-PED-20250726-7-1', 'PED-20250726-7', 'IND037', 1, 0.00),
('DP-PED-20250727-17-0', 'PED-20250727-17', 'IND026', 3, 0.00),
('DP-PED-20250727-17-1', 'PED-20250727-17', 'IND035', 4, 0.00),
('DP-PED-20250727-17-2', 'PED-20250727-17', 'IND032', 5, 0.00),
('DP-PED-20250727-22-0', 'PED-20250727-22', 'IND010', 2, 0.00),
('DP-PED-20250727-22-1', 'PED-20250727-22', 'IND021', 4, 0.00),
('DP-PED-20250727-22-2', 'PED-20250727-22', 'IND032', 5, 0.00),
('DP-PED-20250727-3-0', 'PED-20250727-3', 'IND016', 5, 0.00),
('DP-PED-20250727-3-1', 'PED-20250727-3', 'IND003', 5, 0.00),
('DP-PED-20250727-3-2', 'PED-20250727-3', 'IND022', 4, 0.00),
('DP-PED-20250727-4-0', 'PED-20250727-4', 'IND031', 5, 0.00),
('DP-PED-20250729-12-0', 'PED-20250729-12', 'IND009', 3, 0.00),
('DP-PED-20250729-12-1', 'PED-20250729-12', 'IND031', 2, 0.00),
('DP-PED-20250729-12-2', 'PED-20250729-12', 'IND008', 2, 0.00),
('DP-PED-20250729-18-0', 'PED-20250729-18', 'IND037', 1, 0.00),
('DP-PED-20250729-18-1', 'PED-20250729-18', 'IND005', 1, 0.00),
('DP-PED-20250730-15-0', 'PED-20250730-15', 'IND032', 4, 0.00),
('DP-PED-20250730-15-1', 'PED-20250730-15', 'IND008', 5, 0.00),
('DP-PED-20250731-14-0', 'PED-20250731-14', 'IND031', 4, 0.00),
('DP-PED-20250801-1-0', 'PED-20250801-1', 'IND035', 1, 0.00),
('DP-PED-20250801-12-0', 'PED-20250801-12', 'IND033', 3, 0.00),
('DP-PED-20250801-12-1', 'PED-20250801-12', 'IND023', 5, 0.00),
('DP-PED-20250801-14-0', 'PED-20250801-14', 'IND007', 4, 0.00),
('DP-PED-20250801-14-1', 'PED-20250801-14', 'IND038', 3, 0.00),
('DP-PED-20250802-7-0', 'PED-20250802-7', 'IND007', 5, 0.00),
('DP-PED-20250802-7-1', 'PED-20250802-7', 'IND021', 2, 0.00),
('DP-PED-20250803-3-0', 'PED-20250803-3', 'IND004', 4, 0.00),
('DP-PED-20250803-3-1', 'PED-20250803-3', 'IND007', 5, 0.00),
('DP-PED-20250803-3-2', 'PED-20250803-3', 'IND024', 2, 0.00),
('DP-PED-20250803-6-0', 'PED-20250803-6', 'IND004', 2, 0.00),
('DP-PED-20250805-15-0', 'PED-20250805-15', 'IND008', 3, 0.00),
('DP-PED-20250805-15-1', 'PED-20250805-15', 'IND026', 4, 0.00),
('DP-PED-20250805-15-2', 'PED-20250805-15', 'IND036', 2, 0.00),
('DP-PED-20250806-20-0', 'PED-20250806-20', 'IND033', 4, 0.00),
('DP-PED-20250806-20-1', 'PED-20250806-20', 'IND025', 3, 0.00),
('DP-PED-20250806-20-2', 'PED-20250806-20', 'IND036', 5, 0.00),
('DP-PED-20250806-4-0', 'PED-20250806-4', 'IND034', 2, 0.00),
('DP-PED-20250806-4-1', 'PED-20250806-4', 'IND039', 1, 0.00),
('DP-PED-20250806-8-0', 'PED-20250806-8', 'IND036', 2, 0.00),
('DP-PED-20250807-11-0', 'PED-20250807-11', 'IND033', 4, 0.00),
('DP-PED-20250807-2-0', 'PED-20250807-2', 'IND016', 3, 0.00),
('DP-PED-20250807-2-1', 'PED-20250807-2', 'IND003', 1, 0.00),
('DP-PED-20250809-17-0', 'PED-20250809-17', 'IND004', 1, 0.00),
('DP-PED-20250809-5-0', 'PED-20250809-5', 'IND009', 2, 0.00),
('DP-PED-20250809-5-1', 'PED-20250809-5', 'IND034', 2, 0.00),
('DP-PED-20250814-0-0', 'PED-20250814-0', 'IND006', 1, 0.00),
('DP-PED-20250814-0-1', 'PED-20250814-0', 'IND020', 4, 0.00),
('DP-PED-20250816-16-0', 'PED-20250816-16', 'IND025', 1, 0.00),
('DP-PED-20250820-19-0', 'PED-20250820-19', 'IND022', 5, 0.00),
('DP-PED-20250820-19-1', 'PED-20250820-19', 'IND019', 1, 0.00),
('DP-PED-20250822-9-0', 'PED-20250822-9', 'IND023', 3, 0.00),
('DP-PED-20250822-9-1', 'PED-20250822-9', 'IND017', 5, 0.00),
('DP-PED-20250824-24-0', 'PED-20250824-24', 'IND025', 4, 0.00),
('DP-PED-20250825-10-0', 'PED-20250825-10', 'IND032', 1, 0.00),
('DP-PED-20250825-10-1', 'PED-20250825-10', 'IND003', 1, 0.00),
('DP-PED-20250826-22-0', 'PED-20250826-22', 'IND017', 3, 0.00),
('DP-PED-20250826-23-0', 'PED-20250826-23', 'IND017', 1, 0.00),
('DP-PED-20250829-21-0', 'PED-20250829-21', 'IND030', 3, 0.00),
('DP-PED-20250831-13-0', 'PED-20250831-13', 'IND026', 1, 0.00),
('DP-PED-20250831-13-1', 'PED-20250831-13', 'IND039', 2, 0.00),
('DP-PED-20250831-13-2', 'PED-20250831-13', 'IND039', 4, 0.00),
('DP-PED-20250831-18-0', 'PED-20250831-18', 'IND033', 2, 0.00),
('DP-PED-20250831-18-1', 'PED-20250831-18', 'IND039', 1, 0.00),
('DP-PED-20250902-0-0', 'PED-20250902-0', 'IND029', 5, 0.00),
('DP-PED-20250902-0-1', 'PED-20250902-0', 'IND029', 3, 0.00),
('DP-PED-20250902-0-2', 'PED-20250902-0', 'IND029', 5, 0.00),
('DP-PED-20250902-9-0', 'PED-20250902-9', 'IND022', 4, 0.00),
('DP-PED-20250902-9-1', 'PED-20250902-9', 'IND028', 3, 0.00),
('DP-PED-20250902-9-2', 'PED-20250902-9', 'IND004', 2, 0.00),
('DP-PED-20250903-22-0', 'PED-20250903-22', 'IND005', 2, 0.00),
('DP-PED-20250904-7-0', 'PED-20250904-7', 'IND038', 2, 0.00),
('DP-PED-20250904-7-1', 'PED-20250904-7', 'IND018', 1, 0.00),
('DP-PED-20250906-19-0', 'PED-20250906-19', 'IND008', 1, 0.00),
('DP-PED-20250906-19-1', 'PED-20250906-19', 'IND023', 3, 0.00),
('DP-PED-20250906-19-2', 'PED-20250906-19', 'IND006', 1, 0.00),
('DP-PED-20250907-1-0', 'PED-20250907-1', 'IND027', 4, 0.00),
('DP-PED-20250911-18-0', 'PED-20250911-18', 'IND010', 4, 0.00),
('DP-PED-20250911-18-1', 'PED-20250911-18', 'IND033', 5, 0.00),
('DP-PED-20250911-18-2', 'PED-20250911-18', 'IND037', 5, 0.00),
('DP-PED-20250912-20-0', 'PED-20250912-20', 'IND039', 2, 0.00),
('DP-PED-20250912-20-1', 'PED-20250912-20', 'IND022', 4, 0.00),
('DP-PED-20250913-24-0', 'PED-20250913-24', 'IND002', 2, 0.00),
('DP-PED-20250913-24-1', 'PED-20250913-24', 'IND033', 5, 0.00),
('DP-PED-20250913-4-0', 'PED-20250913-4', 'IND038', 5, 0.00),
('DP-PED-20250913-4-1', 'PED-20250913-4', 'IND003', 2, 0.00),
('DP-PED-20250913-4-2', 'PED-20250913-4', 'IND023', 4, 0.00),
('DP-PED-20250914-6-0', 'PED-20250914-6', 'IND001', 1, 0.00),
('DP-PED-20250914-6-1', 'PED-20250914-6', 'IND029', 1, 0.00),
('DP-PED-20250914-6-2', 'PED-20250914-6', 'IND016', 3, 0.00),
('DP-PED-20250915-14-0', 'PED-20250915-14', 'IND033', 5, 0.00),
('DP-PED-20250916-16-0', 'PED-20250916-16', 'IND033', 2, 0.00),
('DP-PED-20250916-16-1', 'PED-20250916-16', 'IND039', 1, 0.00),
('DP-PED-20250916-17-0', 'PED-20250916-17', 'IND023', 4, 0.00),
('DP-PED-20250918-11-0', 'PED-20250918-11', 'IND033', 1, 0.00),
('DP-PED-20250918-11-1', 'PED-20250918-11', 'IND032', 5, 0.00),
('DP-PED-20250918-2-0', 'PED-20250918-2', 'IND038', 5, 0.00),
('DP-PED-20250918-21-0', 'PED-20250918-21', 'IND037', 4, 0.00),
('DP-PED-20250918-21-1', 'PED-20250918-21', 'IND003', 1, 0.00),
('DP-PED-20250919-8-0', 'PED-20250919-8', 'IND018', 5, 0.00),
('DP-PED-20250920-23-0', 'PED-20250920-23', 'IND016', 3, 0.00),
('DP-PED-20250920-23-1', 'PED-20250920-23', 'IND038', 1, 0.00),
('DP-PED-20250920-23-2', 'PED-20250920-23', 'IND021', 1, 0.00),
('DP-PED-20250920-5-0', 'PED-20250920-5', 'IND037', 5, 0.00),
('DP-PED-20250921-13-0', 'PED-20250921-13', 'IND016', 3, 0.00),
('DP-PED-20250921-13-1', 'PED-20250921-13', 'IND018', 3, 0.00),
('DP-PED-20250923-3-0', 'PED-20250923-3', 'IND023', 1, 0.00),
('DP-PED-20250924-10-0', 'PED-20250924-10', 'IND007', 3, 0.00),
('DP-PED-20250927-12-0', 'PED-20250927-12', 'IND025', 2, 0.00),
('DP-PED-20250927-12-1', 'PED-20250927-12', 'IND017', 1, 0.00),
('DP-PED-20250930-15-0', 'PED-20250930-15', 'IND031', 5, 0.00),
('DP-PED-20250930-15-1', 'PED-20250930-15', 'IND024', 5, 0.00),
('DP-PED-20251001-8-0', 'PED-20251001-8', 'IND016', 1, 0.00),
('DP-PED-20251001-8-1', 'PED-20251001-8', 'IND028', 5, 0.00),
('DP-PED-20251001-8-2', 'PED-20251001-8', 'IND036', 3, 0.00),
('DP-PED-20251002-1-0', 'PED-20251002-1', 'IND025', 3, 0.00),
('DP-PED-20251002-1-1', 'PED-20251002-1', 'IND017', 3, 0.00),
('DP-PED-20251002-1-2', 'PED-20251002-1', 'IND024', 2, 0.00),
('DP-PED-20251002-20-0', 'PED-20251002-20', 'IND026', 5, 0.00),
('DP-PED-20251004-0-0', 'PED-20251004-0', 'IND024', 5, 0.00),
('DP-PED-20251004-0-1', 'PED-20251004-0', 'IND008', 1, 0.00),
('DP-PED-20251004-13-0', 'PED-20251004-13', 'IND035', 5, 0.00),
('DP-PED-20251004-13-1', 'PED-20251004-13', 'IND034', 3, 0.00),
('DP-PED-20251004-13-2', 'PED-20251004-13', 'IND038', 2, 0.00),
('DP-PED-20251006-19-0', 'PED-20251006-19', 'IND039', 3, 0.00),
('DP-PED-20251007-12-0', 'PED-20251007-12', 'IND038', 4, 0.00),
('DP-PED-20251007-12-1', 'PED-20251007-12', 'IND036', 2, 0.00),
('DP-PED-20251007-12-2', 'PED-20251007-12', 'IND020', 3, 0.00),
('DP-PED-20251008-10-0', 'PED-20251008-10', 'IND031', 2, 0.00),
('DP-PED-20251010-4-0', 'PED-20251010-4', 'IND010', 1, 0.00),
('DP-PED-20251010-4-1', 'PED-20251010-4', 'IND016', 3, 0.00),
('DP-PED-20251010-4-2', 'PED-20251010-4', 'IND030', 5, 0.00),
('DP-PED-20251012-17-0', 'PED-20251012-17', 'IND039', 3, 0.00),
('DP-PED-20251013-24-0', 'PED-20251013-24', 'IND005', 5, 0.00),
('DP-PED-20251013-24-1', 'PED-20251013-24', 'IND037', 1, 0.00),
('DP-PED-20251015-15-0', 'PED-20251015-15', 'IND036', 4, 0.00),
('DP-PED-20251015-15-1', 'PED-20251015-15', 'IND015', 4, 0.00),
('DP-PED-20251015-21-0', 'PED-20251015-21', 'IND001', 2, 0.00),
('DP-PED-20251015-21-1', 'PED-20251015-21', 'IND015', 4, 0.00),
('DP-PED-20251017-3-0', 'PED-20251017-3', 'IND032', 2, 0.00),
('DP-PED-20251017-3-1', 'PED-20251017-3', 'IND001', 2, 0.00),
('DP-PED-20251017-3-2', 'PED-20251017-3', 'IND005', 5, 0.00),
('DP-PED-20251018-22-0', 'PED-20251018-22', 'IND010', 5, 0.00),
('DP-PED-20251018-22-1', 'PED-20251018-22', 'IND005', 4, 0.00),
('DP-PED-20251019-2-0', 'PED-20251019-2', 'IND027', 3, 0.00),
('DP-PED-20251019-2-1', 'PED-20251019-2', 'IND029', 5, 0.00),
('DP-PED-20251019-6-0', 'PED-20251019-6', 'IND037', 4, 0.00),
('DP-PED-20251019-6-1', 'PED-20251019-6', 'IND021', 3, 0.00),
('DP-PED-20251019-6-2', 'PED-20251019-6', 'IND027', 5, 0.00),
('DP-PED-20251021-16-0', 'PED-20251021-16', 'IND032', 4, 0.00),
('DP-PED-20251023-9-0', 'PED-20251023-9', 'IND035', 5, 0.00),
('DP-PED-20251023-9-1', 'PED-20251023-9', 'IND017', 5, 0.00),
('DP-PED-20251023-9-2', 'PED-20251023-9', 'IND003', 5, 0.00),
('DP-PED-20251024-11-0', 'PED-20251024-11', 'IND031', 5, 0.00),
('DP-PED-20251025-7-0', 'PED-20251025-7', 'IND002', 3, 0.00),
('DP-PED-20251026-5-0', 'PED-20251026-5', 'IND039', 4, 0.00),
('DP-PED-20251027-23-0', 'PED-20251027-23', 'IND028', 4, 0.00),
('DP-PED-20251028-18-0', 'PED-20251028-18', 'IND017', 4, 0.00),
('DP-PED-20251028-18-1', 'PED-20251028-18', 'IND001', 2, 0.00),
('DP-PED-20251029-14-0', 'PED-20251029-14', 'IND003', 4, 0.00);

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
(54, 'Ruta Planeta', '3000', NULL, NULL, NULL, 10, 10),
(55, 'Av. Corrientes', '800', '1', '', 'Oficina 101', 2, 1),
(56, 'Rivadavia', '3560', '7', 'D', 'Bloque 3', 3, 2),
(57, 'San Martín', '50', '2', 'A', 'Primer timbre', 4, 3),
(58, 'Chile', '100', '10', 'C', 'Al lado del ascensor', 5, 1),
(59, 'Córdoba', '2000', '', '', 'Casa azul', 1, 2),
(60, 'Santa Fe', '555', '3', '3', 'Edificio nuevo', 2, 3),
(61, 'Libertador', '400', '1', '1', 'Departamento al frente', 3, 1),
(62, 'Tucumán', '999', '', '', 'Casa con jardín', 4, 2),
(63, 'Paraná', '12', '8', 'F', 'Acceso por calle lateral', 5, 3),
(64, 'Lima', '500', '1', 'Oficina', 'Edificio central', 1, 1),
(65, 'Santa Cruz', '1200', '', '', 'Galpón industrial', 2, 2),
(66, 'Constitución', '88', 'Piso 3', 'A', 'Frente a plaza', 3, 3),
(67, 'Alem', '300', '12', 'B', 'Al lado del banco', 4, 1),
(68, 'Defensa', '950', '2', 'C', 'Timbre D', 5, 2),
(69, 'Juncal', '700', '3', '3', 'Edificio moderno', 1, 3),
(70, 'Perú', '15', '4', '4', 'Frente a la municipalidad', 2, 1),
(71, 'Independencia', '800', '1', '1', 'Puerta verde', 3, 2),
(72, 'Belgrano', '1100', '5', 'C', 'Cerca de la escalera', 4, 3),
(73, 'Salta', '15', '20', '20', 'Último piso', 5, 1),
(74, 'Calle Falsa 742', '742', '742', '742', '', 37, 62);

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
-- Estructura de tabla para la tabla `motivo_baja_cliente`
--

CREATE TABLE `motivo_baja_cliente` (
  `idMotivo` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `motivo_baja_cliente`
--

INSERT INTO `motivo_baja_cliente` (`idMotivo`, `descripcion`) VALUES
(1, 'Cliente moroso'),
(2, 'Cierre del negocio del cliente'),
(3, 'Intento de microgestión'),
(4, 'Comunicación deficiente'),
(5, 'Exigencias poco razonables'),
(6, 'Otro (Ver observaciones)');

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
('MOV-PED-965241', 'STK003', '2025-06-16', -2, 'Descuento por pedido PED-2025-663'),
('MOV-SCRAP-1760918421513', 'STK-NA-1756247729017', '2025-10-20', -2, 'SCRAP (Desecho permanente): Sin motivo especificado'),
('MOV-SCRAP-1760918424267', 'STK-NA-1760665520494', '2025-10-20', -3, 'SCRAP (Desecho permanente): Sin motivo especificado');

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
('PED-20240101-3', 4, 1, NULL, '2024-01-01 17:55:13', '2025-11-22 18:40:51', 'HD6014AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240103-4', 5, 2, NULL, '2024-01-03 08:48:58', '2025-11-22 18:40:51', 'HD4202AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240105-5', 1, 5, NULL, '2024-01-05 14:20:01', '2025-12-04 00:44:37', 'HD6424AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240110-001', 28, 1, NULL, '2024-01-10 10:00:00', '2025-11-22 18:40:51', 'HD6858AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240110-20', 10, 7, NULL, '2024-01-10 08:21:35', '2025-11-22 18:40:51', 'HD6248AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240110-24', 7, 2, NULL, '2024-01-10 09:54:04', '2025-12-04 00:40:22', 'HD2349AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240110-8', 7, 2, NULL, '2024-01-10 10:04:46', '2025-12-04 00:40:22', 'HD9668AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240111-21', 1, 2, NULL, '2024-01-11 19:35:10', '2025-12-04 00:40:22', 'HD7138AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240112-0', 4, 5, NULL, '2024-01-12 09:30:11', '2025-11-22 18:40:51', 'HD1599AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240112-17', 7, 1, NULL, '2024-01-12 09:34:29', '2025-11-22 18:40:51', 'HD4986AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240112-2', 6, 2, NULL, '2024-01-12 18:06:58', '2025-12-04 00:40:22', 'HD1138AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240113-16', 8, 7, NULL, '2024-01-13 13:13:41', '2025-12-04 00:44:37', 'HD3242AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240114-23', 4, 7, NULL, '2024-01-14 12:42:17', '2025-12-04 00:44:37', 'HD7361AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240115-001', 29, 2, NULL, '2024-01-15 11:00:00', '2025-11-22 18:40:51', 'HD7728AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240115-11', 5, 6, NULL, '2024-01-15 11:52:37', '2025-11-22 18:40:51', 'HD7231AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240115-9', 6, 2, NULL, '2024-01-15 18:08:00', '2025-12-04 00:44:37', 'HD7429AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240116-12', 10, 2, NULL, '2024-01-16 12:32:31', '2025-12-04 00:44:37', 'HD2139AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240117-14', 1, 2, NULL, '2024-01-17 08:27:16', '2025-11-22 18:40:51', 'HD2972AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240117-22', 1, 2, NULL, '2024-01-17 19:15:21', '2025-12-04 00:44:37', 'HD1614AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240120-001', 30, 1, NULL, '2024-01-21 12:00:00', '2025-11-14 20:39:57', NULL, 0.00, 1, NULL, '2024-01-21 12:00:00', 2, 6, 0, NULL, 2),
('PED-20240120-7', 10, 7, NULL, '2024-01-20 19:58:58', '2025-11-22 18:40:51', 'HD9648AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240124-6', 10, 7, NULL, '2024-01-24 17:40:59', '2025-11-22 18:40:51', 'HD1166AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240125-001', 31, 2, NULL, '2024-01-25 13:00:00', '2025-11-22 18:40:51', 'HD4914AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240125-1', 1, 2, NULL, '2024-01-25 12:19:36', '2025-12-04 00:44:37', 'HD4585AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240126-13', 9, 2, NULL, '2024-01-26 10:35:19', '2025-12-04 00:44:37', 'HD8607AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240127-10', 3, 7, NULL, '2024-01-27 18:53:46', '2025-11-22 18:40:51', 'HD2074AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240127-18', 4, 7, NULL, '2024-01-27 13:34:36', '2025-12-04 00:44:37', 'HD6578AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240128-15', 10, 1, NULL, '2024-01-28 14:53:56', '2025-12-04 00:44:37', 'HD1054AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240130-19', 4, 5, NULL, '2024-01-30 19:56:50', '2025-11-22 18:40:51', 'HD3629AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240201-001', 32, 1, NULL, '2024-02-01 14:00:00', '2025-11-22 18:40:51', 'HD1924AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240201-23', 9, 6, NULL, '2024-02-01 15:57:57', '2025-12-04 00:44:37', 'HD6949AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240201-6', 2, 2, NULL, '2024-02-01 15:57:00', '2025-12-04 00:44:37', 'HD8217AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240202-19', 1, 6, NULL, '2024-02-02 15:02:14', '2025-12-04 00:44:37', 'HD1242AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240203-20', 10, 5, NULL, '2024-02-03 19:18:46', '2025-11-22 18:40:51', 'HD7829AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240203-8', 3, 7, NULL, '2024-02-03 17:37:49', '2025-11-22 18:40:51', 'HD9202AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240205-001', 33, 2, NULL, '2024-02-06 15:00:00', '2025-11-14 20:39:57', NULL, 0.00, 4, NULL, '2024-02-06 15:00:00', 1, 6, 0, NULL, 2),
('PED-20240205-15', 7, 2, NULL, '2024-02-05 16:06:23', '2025-12-04 00:44:37', 'HD4752AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240206-21', 1, 6, NULL, '2024-02-06 08:39:12', '2025-11-22 18:40:51', 'HD6734AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240209-17', 6, 6, NULL, '2024-02-09 15:19:42', '2025-11-22 18:40:51', 'HD8901AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240209-5', 1, 2, NULL, '2024-02-09 14:42:02', '2025-11-22 18:40:51', 'HD5305AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240209-9', 3, 2, NULL, '2024-02-09 13:12:46', '2025-12-04 00:40:22', 'HD3523AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240210-001', 34, 1, NULL, '2024-02-10 16:00:00', '2025-11-22 18:40:51', 'HD7819AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240211-24', 3, 1, NULL, '2024-02-11 12:45:42', '2025-12-04 00:44:37', 'HD1369AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240212-10', 7, 2, NULL, '2024-02-12 17:42:09', '2025-12-04 00:40:22', 'HD7008AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240214-18', 6, 1, NULL, '2024-02-14 14:27:35', '2025-11-22 18:40:51', 'HD4186AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240215-001', 35, 2, NULL, '2024-02-16 17:00:00', '2025-11-14 20:39:57', NULL, 0.00, 6, 'Cliente solicitó envío express no disponible.', '2024-02-16 17:00:00', 1, 6, 0, NULL, 2),
('PED-20240215-11', 7, 1, NULL, '2024-02-15 10:32:03', '2025-11-22 18:40:51', 'HD5470AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240215-7', 7, 2, NULL, '2024-02-15 18:47:24', '2025-12-04 00:44:37', 'HD8732AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240218-22', 9, 7, NULL, '2024-02-18 12:03:12', '2025-11-22 18:40:51', 'HD5472AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240218-3', 9, 2, NULL, '2024-02-18 08:22:48', '2025-12-04 00:44:37', 'HD7942AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240220-001', 36, 1, NULL, '2024-02-20 18:00:00', '2025-11-22 18:40:51', 'HD4794AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240221-14', 1, 7, NULL, '2024-02-21 18:16:46', '2025-11-22 18:40:51', 'HD5338AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240223-12', 4, 2, NULL, '2024-02-23 19:36:02', '2025-12-04 00:40:22', 'HD6561AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240223-2', 3, 7, NULL, '2024-02-23 08:00:51', '2025-12-04 00:44:37', 'HD6477AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240224-1', 5, 2, NULL, '2024-02-24 14:30:47', '2025-12-04 00:44:37', 'HD6538AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240224-13', 3, 7, NULL, '2024-02-24 15:49:08', '2025-11-22 18:40:51', 'HD9273AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240225-001', 37, 2, NULL, '2024-02-25 19:00:00', '2025-11-22 18:40:51', 'HD8425AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240226-0', 5, 5, NULL, '2024-02-26 09:04:55', '2025-11-22 18:40:51', 'HD3442AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240227-16', 2, 2, NULL, '2024-02-27 17:17:00', '2025-12-04 00:40:22', 'HD8936AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240228-4', 2, 5, NULL, '2024-02-28 10:20:01', '2025-11-22 18:40:51', 'HD6358AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240302-17', 9, 5, NULL, '2024-03-02 10:42:59', '2025-12-04 00:44:37', 'HD3394AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240304-7', 5, 6, NULL, '2024-03-04 08:51:12', '2025-11-22 18:40:51', 'HD2356AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240305-12', 8, 1, NULL, '2024-03-05 08:47:48', '2025-11-22 18:40:51', 'HD3982AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240306-16', 6, 7, NULL, '2024-03-06 10:41:44', '2025-11-22 18:40:51', 'HD8836AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240307-2', 6, 2, NULL, '2024-03-07 16:55:27', '2025-12-04 00:44:37', 'HD1035AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240308-20', 5, 5, NULL, '2024-03-08 10:27:33', '2025-11-22 18:40:51', 'HD9959AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240308-6', 1, 6, NULL, '2024-03-08 14:06:52', '2025-12-04 00:44:37', 'HD7554AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240310-14', 1, 1, NULL, '2024-03-10 19:46:04', '2025-11-22 18:40:51', 'HD4236AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240313-9', 8, 2, NULL, '2024-03-13 10:45:11', '2025-12-04 00:40:22', 'HD5732AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240316-10', 5, 5, NULL, '2024-03-16 11:06:32', '2025-12-04 00:44:37', 'HD3033AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240316-15', 10, 7, NULL, '2024-03-16 16:01:00', '2025-12-04 00:44:37', 'HD7463AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240316-4', 10, 5, NULL, '2024-03-16 14:16:45', '2025-11-22 18:40:51', 'HD2673AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240317-13', 4, 7, NULL, '2024-03-17 18:38:38', '2025-12-04 00:44:37', 'HD4707AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240319-23', 8, 2, NULL, '2024-03-19 08:25:00', '2025-12-04 00:40:22', 'HD6783AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240321-18', 1, 7, NULL, '2024-03-21 16:35:45', '2025-12-04 00:44:37', 'HD4276AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240323-3', 1, 1, NULL, '2024-03-23 17:49:41', '2025-11-22 18:40:51', 'HD6722AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240324-0', 3, 2, NULL, '2024-03-24 13:00:38', '2025-11-22 18:40:51', 'HD3259AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240325-5', 9, 7, NULL, '2024-03-25 19:16:31', '2025-11-22 18:40:51', 'HD8656AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240325-8', 6, 2, NULL, '2024-03-25 13:55:16', '2025-12-04 00:44:37', 'HD7331AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240326-11', 1, 1, NULL, '2024-03-26 11:54:45', '2025-12-04 00:44:37', 'HD2067AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240326-19', 4, 7, NULL, '2024-03-26 15:34:00', '2025-11-22 18:40:51', 'HD4128AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240326-21', 6, 2, NULL, '2024-03-26 09:06:10', '2025-11-22 18:40:51', 'HD7265AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240328-22', 8, 6, NULL, '2024-03-28 16:40:20', '2025-12-04 00:44:37', 'HD8532AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240328-24', 7, 2, NULL, '2024-03-28 17:20:20', '2025-11-22 18:40:51', 'HD9356AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240330-1', 4, 5, NULL, '2024-03-30 19:47:08', '2025-11-22 18:40:51', 'HD5988AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240401-23', 8, 7, NULL, '2024-04-01 10:59:21', '2025-12-04 00:44:37', 'HD7819AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240405-11', 1, 7, NULL, '2024-04-05 19:29:30', '2025-11-22 18:40:51', 'HD9867AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240405-16', 5, 5, NULL, '2024-04-05 11:05:32', '2025-11-22 18:40:51', 'HD9873AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240406-12', 8, 1, NULL, '2024-04-06 13:30:15', '2025-12-04 00:44:37', 'HD1234AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240407-5', 7, 7, NULL, '2024-04-07 08:30:25', '2025-12-04 00:44:37', 'HD3867AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240407-9', 1, 7, NULL, '2024-04-07 10:12:32', '2025-11-22 18:40:51', 'HD8952AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240410-001', 38, 1, NULL, '2024-04-10 10:00:00', '2025-11-22 18:40:51', 'HD3404AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240410-4', 7, 2, NULL, '2024-04-10 14:51:38', '2025-11-22 18:40:51', 'HD5160AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240410-8', 10, 6, NULL, '2024-04-10 18:34:08', '2025-12-04 00:44:37', 'HD9234AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240411-1', 1, 5, NULL, '2024-04-11 12:57:34', '2025-11-22 18:40:51', 'HD6946AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240411-10', 10, 7, NULL, '2024-04-11 14:45:02', '2025-11-22 18:40:51', 'HD4398AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240414-22', 8, 2, NULL, '2024-04-14 08:43:35', '2025-11-22 18:40:51', 'HD1780AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240415-001', 39, 2, NULL, '2024-04-16 11:00:00', '2025-11-14 20:39:57', NULL, 0.00, 2, NULL, '2024-04-16 11:00:00', 1, 6, 0, NULL, 4),
('PED-20240415-21', 7, 6, NULL, '2024-04-15 09:15:53', '2025-12-04 00:44:37', 'HD4590AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240415-24', 2, 6, NULL, '2024-04-15 11:57:00', '2025-12-04 00:44:37', 'HD8431AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240417-2', 2, 2, NULL, '2024-04-17 10:12:33', '2025-11-22 18:40:51', 'HD3705AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240418-6', 8, 7, NULL, '2024-04-18 15:31:39', '2025-11-22 18:40:51', 'HD9249AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240419-0', 7, 2, NULL, '2024-04-19 08:19:32', '2025-12-04 00:40:22', 'HD6408AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240420-001', 40, 1, NULL, '2024-04-20 12:00:00', '2025-11-22 18:40:51', 'HD3187AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240421-13', 10, 6, NULL, '2024-04-21 19:37:21', '2025-11-22 18:40:51', 'HD3819AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240424-14', 10, 7, NULL, '2024-04-24 12:24:02', '2025-12-04 00:44:37', 'HD8278AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240425-001', 41, 2, NULL, '2024-04-25 13:00:00', '2025-11-22 18:40:51', 'HD8536AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240425-3', 8, 5, NULL, '2024-04-25 17:34:30', '2025-11-22 18:40:51', 'HD3297AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240426-7', 3, 5, NULL, '2024-04-26 13:44:17', '2025-12-04 00:44:37', 'HD3617AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240428-17', 7, 5, NULL, '2024-04-28 11:50:13', '2025-11-22 18:40:51', 'HD5257AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240428-19', 9, 5, NULL, '2024-04-28 19:06:38', '2025-12-04 00:44:37', 'HD4179AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240429-15', 1, 2, NULL, '2024-04-29 14:43:02', '2025-12-04 00:40:22', NULL, 0.00, 2, NULL, NULL, NULL, 6, 1, NULL, 4),
('PED-20240429-18', 9, 5, NULL, '2024-04-29 19:07:38', '2025-11-22 18:40:51', 'HD3227AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240430-20', 7, 6, NULL, '2024-04-30 15:14:16', '2025-11-22 18:40:51', 'HD7526AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240501-001', 42, 1, NULL, '2024-05-02 14:00:00', '2025-11-14 20:39:57', NULL, 0.00, 3, NULL, '2024-05-02 14:00:00', 2, 6, 0, NULL, 1),
('PED-20240501-22', 5, 7, NULL, '2024-05-01 09:39:53', '2025-11-22 18:40:51', 'HD6398AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240504-6', 10, 6, NULL, '2024-05-04 14:15:44', '2025-12-04 00:44:37', 'HD9559AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240504-8', 10, 2, NULL, '2024-05-04 19:24:14', '2025-12-04 00:44:37', 'HD1602AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240505-001', 43, 2, NULL, '2024-05-05 15:00:00', '2025-11-22 18:40:51', 'HD8950AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240507-1', 2, 2, NULL, '2024-05-07 16:56:35', '2025-12-04 00:40:22', 'HD3177AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240508-13', 6, 5, NULL, '2024-05-08 08:30:24', '2025-12-04 00:44:37', 'HD6198AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240509-19', 8, 5, NULL, '2024-05-09 16:42:21', '2025-11-22 18:40:51', 'HD6220AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240510-001', 44, 1, NULL, '2024-05-10 16:00:00', '2025-11-22 18:40:51', 'HD6031AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240510-21', 4, 7, NULL, '2024-05-10 19:53:35', '2025-11-22 18:40:51', 'HD1905AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240512-18', 7, 1, NULL, '2024-05-12 17:53:04', '2025-11-22 18:40:51', 'HD1629AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240515-001', 45, 2, NULL, '2024-05-15 17:00:00', '2025-11-22 18:40:51', 'HD7050AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240515-15', 1, 5, NULL, '2024-05-15 17:45:15', '2025-11-22 18:40:51', 'HD7866AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240515-9', 5, 5, NULL, '2024-05-15 10:33:12', '2025-12-04 00:44:37', 'HD8400AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240516-24', 8, 7, NULL, '2024-05-16 14:07:01', '2025-11-22 18:40:51', 'HD5619AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240519-11', 6, 6, NULL, '2024-05-19 09:53:02', '2025-12-04 00:44:37', 'HD5528AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240520-001', 46, 1, NULL, '2024-05-20 18:00:00', '2025-11-22 18:40:51', 'HD2368AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240522-20', 3, 2, NULL, '2024-05-22 14:36:25', '2025-11-14 21:19:32', NULL, 0.00, 4, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20240522-5', 2, 7, NULL, '2024-05-22 10:51:45', '2025-11-22 18:40:51', 'HD3498AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240524-0', 8, 2, NULL, '2024-05-24 11:20:44', '2025-11-22 18:40:51', 'HD8632AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240524-17', 1, 6, NULL, '2024-05-24 13:53:08', '2025-12-04 00:44:37', 'HD1925AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240525-001', 47, 2, NULL, '2024-05-26 19:00:00', '2025-11-14 20:39:57', NULL, 0.00, 5, NULL, '2024-05-26 19:00:00', 1, 6, 0, NULL, 2),
('PED-20240525-10', 7, 2, NULL, '2024-05-25 16:11:51', '2025-12-04 00:40:22', 'HD7686AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240525-3', 1, 2, NULL, '2024-05-25 09:16:57', '2025-12-04 00:44:37', 'HD9311AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240526-23', 8, 2, NULL, '2024-05-26 14:22:10', '2025-12-04 00:44:37', 'HD3030AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240527-14', 4, 7, NULL, '2024-05-27 17:28:56', '2025-12-04 00:44:37', 'HD4218AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240529-16', 8, 5, NULL, '2024-05-29 16:38:07', '2025-11-22 18:40:51', 'HD4669AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240529-2', 10, 5, NULL, '2024-05-29 18:44:01', '2025-11-22 18:40:51', 'HD5450AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240530-4', 7, 5, NULL, '2024-05-30 17:04:58', '2025-11-22 18:40:51', 'HD3332AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240530-7', 4, 1, NULL, '2024-05-30 10:59:27', '2025-11-22 18:40:51', 'HD1598AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240531-12', 5, 6, NULL, '2024-05-31 13:13:48', '2025-11-14 21:19:32', NULL, 0.00, 1, NULL, NULL, NULL, 6, 1, NULL, 4),
('PED-20240602-0', 4, 7, NULL, '2024-06-02 19:37:14', '2025-11-22 18:40:51', 'HD5996AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240602-11', 2, 7, NULL, '2024-06-02 13:58:36', '2025-11-22 18:40:51', 'HD6188AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240602-5', 8, 2, NULL, '2024-06-02 17:41:09', '2025-11-22 18:40:51', 'HD2954AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240603-12', 8, 2, NULL, '2024-06-03 13:07:13', '2025-11-22 18:40:51', 'HD4206AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240604-10', 5, 5, NULL, '2024-06-04 17:39:53', '2025-11-22 18:40:51', 'HD3245AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240606-20', 8, 2, NULL, '2024-06-06 14:04:47', '2025-11-22 18:40:51', 'HD2170AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240607-24', 3, 6, NULL, '2024-06-07 19:12:10', '2025-11-22 18:40:51', 'HD7875AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240608-3', 9, 1, NULL, '2024-06-08 19:12:05', '2025-11-14 21:19:32', NULL, 0.00, 1, NULL, NULL, NULL, 6, 1, NULL, 2),
('PED-20240611-13', 10, 5, NULL, '2024-06-11 18:12:31', '2025-11-22 18:40:51', 'HD1644AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240612-18', 3, 1, NULL, '2024-06-12 19:43:40', '2025-11-22 18:40:51', 'HD1593AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240613-17', 1, 2, NULL, '2024-06-13 13:56:22', '2025-12-04 00:44:37', 'HD6348AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240617-9', 8, 1, NULL, '2024-06-17 18:36:30', '2025-11-22 18:40:51', 'HD6229AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240618-2', 5, 5, NULL, '2024-06-18 08:24:56', '2025-12-04 00:44:37', 'HD1800AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240619-14', 2, 5, NULL, '2024-06-19 14:01:26', '2025-12-04 00:44:37', 'HD9292AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240620-16', 8, 7, NULL, '2024-06-20 19:55:42', '2025-11-22 18:40:51', 'HD2035AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240621-6', 9, 2, NULL, '2024-06-21 09:28:02', '2025-12-04 00:44:37', 'HD9453AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240622-19', 10, 6, NULL, '2024-06-22 11:10:06', '2025-11-22 18:40:51', 'HD4393AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240622-23', 1, 2, NULL, '2024-06-22 17:45:27', '2025-12-04 00:40:22', 'HD5639AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240623-7', 5, 1, NULL, '2024-06-23 19:35:02', '2025-12-04 00:44:37', 'HD7726AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240625-21', 1, 2, NULL, '2024-06-25 09:04:03', '2025-11-22 18:40:51', 'HD5863AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240625-22', 10, 7, NULL, '2024-06-25 13:48:40', '2025-12-04 00:44:37', 'HD2187AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240626-8', 3, 1, NULL, '2024-06-26 09:15:48', '2025-12-04 00:44:37', 'HD4915AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240627-4', 1, 7, NULL, '2024-06-27 14:15:34', '2025-11-22 18:40:51', 'HD8508AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240629-1', 9, 2, NULL, '2024-06-29 19:58:56', '2025-11-22 18:40:51', 'HD6139AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240629-15', 1, 2, NULL, '2024-06-29 17:17:59', '2025-11-22 18:40:51', 'HD6627AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240701-11', 1, 5, NULL, '2024-07-01 11:26:16', '2025-12-04 00:44:37', 'HD4266AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240701-3', 2, 5, NULL, '2024-07-01 18:25:29', '2025-11-22 18:40:51', 'HD3106AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240703-1', 7, 2, NULL, '2024-07-03 10:49:25', '2025-11-22 18:40:51', 'HD6610AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240703-17', 8, 1, NULL, '2024-07-03 15:51:27', '2025-11-22 18:40:51', 'HD3172AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240705-12', 5, 1, NULL, '2024-07-05 18:56:03', '2025-11-22 18:40:51', 'HD4027AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240707-23', 5, 2, NULL, '2024-07-07 09:51:00', '2025-11-22 18:40:51', 'HD5115AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240707-24', 7, 2, NULL, '2024-07-07 17:10:38', '2025-11-22 18:40:51', 'HD9620AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240707-9', 8, 7, NULL, '2024-07-07 13:48:37', '2025-11-22 18:40:51', 'HD6255AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240709-7', 10, 5, NULL, '2024-07-09 19:51:30', '2025-11-22 18:40:51', 'HD5934AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240710-001', 1, 1, NULL, '2024-07-10 10:00:00', '2025-11-22 18:40:51', 'HD8023AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240710-6', 7, 5, NULL, '2024-07-10 18:17:53', '2025-11-22 18:40:51', 'HD9905AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240713-5', 7, 6, NULL, '2024-07-13 08:00:56', '2025-11-22 18:40:51', 'HD3725AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240713-8', 10, 1, NULL, '2024-07-13 09:26:51', '2025-11-22 18:40:51', 'HD1257AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240714-2', 8, 7, NULL, '2024-07-14 15:37:19', '2025-11-22 18:40:51', 'HD8213AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240715-001', 2, 2, NULL, '2024-07-16 11:00:00', '2025-11-14 20:39:57', NULL, 0.00, 1, NULL, '2024-07-16 11:00:00', 2, 6, 0, NULL, 4),
('PED-20240716-10', 4, 5, NULL, '2024-07-16 11:56:50', '2025-12-04 00:44:37', 'HD1840AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240718-16', 6, 2, NULL, '2024-07-18 09:08:11', '2025-12-04 00:44:37', 'HD4869AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240720-001', 3, 1, NULL, '2024-07-20 12:00:00', '2025-11-22 18:40:51', 'HD9299AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240720-18', 9, 7, NULL, '2024-07-20 13:36:32', '2025-12-04 00:44:37', 'HD1530AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240721-21', 10, 6, NULL, '2024-07-21 18:15:44', '2025-11-22 18:40:51', 'HD5910AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240721-22', 9, 2, NULL, '2024-07-21 19:49:15', '2025-12-04 00:44:37', 'HD3259AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240722-13', 2, 5, NULL, '2024-07-22 13:14:46', '2025-11-22 18:40:51', 'HD8374AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240722-14', 6, 6, NULL, '2024-07-22 08:15:03', '2025-11-14 21:19:32', NULL, 0.00, 5, NULL, NULL, NULL, 6, 1, NULL, 4),
('PED-20240722-15', 5, 1, NULL, '2024-07-22 13:08:22', '2025-11-22 18:40:51', 'HD5144AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240722-4', 7, 1, NULL, '2024-07-22 19:46:59', '2025-11-22 18:40:51', 'HD8599AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240725-001', 4, 2, NULL, '2024-07-26 13:00:00', '2025-11-14 20:39:57', NULL, 0.00, 2, NULL, '2024-07-26 13:00:00', 1, 6, 0, NULL, 2),
('PED-20240727-19', 9, 6, NULL, '2024-07-27 09:58:33', '2025-12-04 00:44:37', 'HD7793AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240731-0', 3, 5, NULL, '2024-07-31 15:10:57', '2025-12-04 00:44:37', 'HD6046AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240731-20', 3, 6, NULL, '2024-07-31 18:25:30', '2025-11-22 18:40:51', 'HD2856AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240801-001', 5, 1, NULL, '2024-08-01 14:00:00', '2025-11-22 18:40:51', 'HD3381AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240801-21', 6, 1, NULL, '2024-08-01 16:37:53', '2025-11-22 18:40:51', 'HD8564AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240802-11', 9, 2, NULL, '2024-08-02 16:16:20', '2025-11-22 18:40:51', 'HD7025AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240802-24', 6, 2, NULL, '2024-08-02 14:37:29', '2025-12-04 00:44:37', 'HD7782AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240802-3', 8, 6, NULL, '2024-08-02 19:35:06', '2025-11-22 18:40:51', 'HD8434AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240803-20', 5, 5, NULL, '2024-08-03 18:06:57', '2025-11-22 18:40:51', 'HD2099AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240803-7', 5, 5, NULL, '2024-08-03 08:09:35', '2025-12-04 00:44:37', 'HD9174AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240805-001', 6, 2, NULL, '2024-08-05 15:00:00', '2025-11-22 18:40:51', 'HD7340AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240806-13', 9, 7, NULL, '2024-08-06 13:45:25', '2025-12-04 00:44:37', 'HD4190AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240807-23', 7, 6, NULL, '2024-08-07 10:29:49', '2025-11-14 21:19:32', NULL, 0.00, 1, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20240808-2', 4, 2, NULL, '2024-08-08 19:55:49', '2025-12-04 00:44:37', 'HD6035AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240809-6', 7, 1, NULL, '2024-08-09 15:19:43', '2025-11-22 18:40:51', 'HD2189AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240810-001', 7, 1, NULL, '2024-08-11 16:00:00', '2025-11-14 20:39:57', NULL, 0.00, 3, NULL, '2024-08-11 16:00:00', 2, 6, 0, NULL, 3),
('PED-20240810-10', 2, 7, NULL, '2024-08-10 10:02:39', '2025-11-22 18:40:51', 'HD7557AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240811-14', 9, 2, NULL, '2024-08-11 18:24:24', '2025-12-04 00:40:22', NULL, 0.00, 3, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20240811-5', 10, 7, NULL, '2024-08-11 18:18:58', '2025-12-04 00:44:37', 'HD5554AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240814-19', 8, 2, NULL, '2024-08-14 15:49:15', '2025-11-14 21:19:32', NULL, 0.00, 6, NULL, NULL, NULL, 6, 1, NULL, 3),
('PED-20240815-001', 8, 2, NULL, '2024-08-15 17:00:00', '2025-11-22 18:40:51', 'HD5768AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240815-22', 7, 1, NULL, '2024-08-15 09:09:25', '2025-12-04 00:44:37', 'HD6261AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240815-8', 1, 2, NULL, '2024-08-15 09:01:49', '2025-12-04 00:40:22', 'HD3649AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240817-1', 1, 1, NULL, '2024-08-17 13:30:18', '2025-12-04 00:44:37', 'HD5832AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240817-9', 1, 2, NULL, '2024-08-17 10:37:23', '2025-11-22 18:40:51', 'HD1681AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240818-15', 1, 5, NULL, '2024-08-18 11:41:37', '2025-11-22 18:40:51', 'HD5456AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240820-001', 9, 1, NULL, '2024-08-20 18:00:00', '2025-11-22 18:40:51', 'HD5167AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240821-0', 3, 7, NULL, '2024-08-21 09:38:49', '2025-12-04 00:44:37', 'HD1517AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240821-12', 9, 2, NULL, '2024-08-21 16:24:01', '2025-12-04 00:44:37', 'HD2424AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240821-18', 3, 1, NULL, '2024-08-21 18:29:44', '2025-11-22 18:40:51', 'HD7535AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240823-4', 10, 1, NULL, '2024-08-23 19:43:37', '2025-11-22 18:40:51', 'HD3241AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240824-16', 4, 2, NULL, '2024-08-24 12:25:07', '2025-11-22 18:40:51', 'HD3173AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240824-17', 3, 5, NULL, '2024-08-24 18:15:36', '2025-12-04 00:44:37', 'HD4103AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240825-001', 10, 2, NULL, '2024-08-25 19:00:00', '2025-11-22 18:40:51', 'HD1263AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240906-22', 5, 2, NULL, '2024-09-06 14:13:25', '2025-12-04 00:44:37', 'HD9793AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240908-12', 1, 7, NULL, '2024-09-08 11:48:05', '2025-12-04 00:44:37', 'HD8909AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240910-24', 6, 2, NULL, '2024-09-10 19:54:40', '2025-12-04 00:44:37', 'HD5165AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240910-6', 5, 2, NULL, '2024-09-10 16:35:51', '2025-12-04 00:44:37', 'HD7100AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240912-20', 7, 5, NULL, '2024-09-12 15:57:54', '2025-11-22 18:40:51', 'HD4794AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240912-9', 8, 5, NULL, '2024-09-12 12:38:08', '2025-11-22 18:40:51', 'HD1183AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240914-10', 6, 5, NULL, '2024-09-14 13:49:48', '2025-12-04 00:44:37', 'HD8650AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240914-15', 9, 7, NULL, '2024-09-14 19:37:08', '2025-12-04 00:44:37', 'HD4050AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240914-18', 1, 2, NULL, '2024-09-14 17:38:48', '2025-12-04 00:40:22', 'HD7836AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240915-16', 9, 7, NULL, '2024-09-15 17:25:49', '2025-11-22 18:40:51', 'HD8534AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240916-21', 9, 5, NULL, '2024-09-16 17:33:18', '2025-12-04 00:44:37', 'HD1842AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240917-19', 10, 5, NULL, '2024-09-17 15:28:28', '2025-12-04 00:44:37', 'HD4164AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240918-5', 7, 2, NULL, '2024-09-18 10:28:36', '2025-12-04 00:44:37', 'HD5299AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240918-7', 3, 2, NULL, '2024-09-18 09:45:30', '2025-12-04 00:40:22', 'HD2122AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240921-0', 6, 1, NULL, '2024-09-21 11:21:55', '2025-12-04 00:44:37', 'HD3114AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240923-2', 4, 2, NULL, '2024-09-23 15:54:37', '2025-12-04 00:44:37', 'HD2566AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240923-3', 3, 2, NULL, '2024-09-23 09:22:28', '2025-12-04 00:40:22', 'HD1458AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240923-4', 1, 7, NULL, '2024-09-23 09:21:24', '2025-11-22 18:40:51', 'HD2008AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240923-8', 2, 2, NULL, '2024-09-23 09:18:13', '2025-11-22 18:40:51', 'HD9783AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240925-1', 8, 6, NULL, '2024-09-25 09:12:40', '2025-12-04 00:44:37', 'HD2877AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20240925-23', 10, 7, NULL, '2024-09-25 10:38:33', '2025-12-04 00:44:37', 'HD9736AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240926-17', 2, 2, NULL, '2024-09-26 09:02:51', '2025-11-22 18:40:51', 'HD2675AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20240928-13', 3, 1, NULL, '2024-09-28 08:17:25', '2025-12-04 00:44:37', 'HD3066AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20240930-11', 6, 2, NULL, '2024-09-30 13:30:01', '2025-12-04 00:40:22', 'HD7542AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20240930-14', 6, 6, NULL, '2024-09-30 17:01:43', '2025-11-22 18:40:51', 'HD6351AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241004-23', 10, 1, NULL, '2024-10-04 11:09:53', '2025-11-22 18:40:51', 'HD7365AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241004-9', 7, 2, NULL, '2024-10-04 14:30:50', '2025-12-04 00:40:22', NULL, 0.00, 2, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20241005-15', 1, 2, NULL, '2024-10-05 13:48:41', '2025-11-22 18:40:51', 'HD4199AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241005-18', 1, 2, NULL, '2024-10-05 11:48:17', '2025-11-22 18:40:51', 'HD4733AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241007-14', 6, 1, NULL, '2024-10-07 16:51:13', '2025-11-22 18:40:51', 'HD6898AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241010-001', 28, 1, NULL, '2024-10-10 10:00:00', '2025-11-22 18:40:51', 'HD3611AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241010-16', 7, 6, NULL, '2024-10-10 09:39:55', '2025-12-04 00:44:37', 'HD2623AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241012-17', 4, 2, NULL, '2024-10-12 15:05:31', '2025-11-22 18:40:51', 'HD2895AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241013-2', 6, 6, NULL, '2024-10-13 09:29:59', '2025-11-22 18:40:51', 'HD2859AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241013-6', 7, 2, NULL, '2024-10-13 19:44:46', '2025-12-04 00:40:22', 'HD2460AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241014-20', 8, 7, NULL, '2024-10-14 08:40:21', '2025-12-04 00:44:37', 'HD1121AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241015-001', 29, 2, NULL, '2024-10-15 11:00:00', '2025-11-22 18:40:51', 'HD2724AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241016-1', 9, 7, NULL, '2024-10-16 09:20:10', '2025-11-22 18:40:51', 'HD1783AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241016-24', 9, 1, NULL, '2024-10-16 16:07:27', '2025-11-22 18:40:51', 'HD5240AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241020-001', 30, 1, NULL, '2024-10-21 12:00:00', '2025-11-14 20:39:57', NULL, 0.00, 4, NULL, '2024-10-21 12:00:00', 2, 6, 0, NULL, 1),
('PED-20241020-11', 7, 2, NULL, '2024-10-20 14:38:42', '2025-12-04 00:40:22', 'HD8031AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241021-19', 2, 6, NULL, '2024-10-21 19:59:01', '2025-11-22 18:40:51', 'HD8228AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241022-0', 4, 2, NULL, '2024-10-22 12:39:16', '2025-12-04 00:44:37', 'HD2801AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241023-12', 2, 2, NULL, '2024-10-23 16:24:52', '2025-11-22 18:40:51', 'HD5437AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241023-7', 4, 7, NULL, '2024-10-23 12:37:02', '2025-11-22 18:40:51', 'HD7795AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241024-3', 7, 7, NULL, '2024-10-24 12:48:48', '2025-11-22 18:40:51', 'HD2092AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241024-8', 10, 6, NULL, '2024-10-24 15:46:03', '2025-12-04 00:44:37', 'HD6470AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241025-001', 31, 2, NULL, '2024-10-25 13:00:00', '2025-11-22 18:40:51', 'HD2148AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241026-10', 4, 2, NULL, '2024-10-26 18:02:29', '2025-11-22 18:40:51', 'HD3463AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241027-13', 10, 6, NULL, '2024-10-27 08:46:38', '2025-12-04 00:44:37', 'HD2854AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241027-21', 9, 5, NULL, '2024-10-27 18:45:13', '2025-11-22 18:40:51', 'HD4293AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241030-5', 3, 6, NULL, '2024-10-30 17:12:34', '2025-11-22 18:40:51', 'HD9873AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241031-22', 8, 1, NULL, '2024-10-31 13:23:35', '2025-11-22 18:40:51', 'HD1979AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241031-4', 9, 6, NULL, '2024-10-31 13:27:50', '2025-11-22 18:40:51', 'HD6079AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241101-001', 32, 1, NULL, '2024-11-01 14:00:00', '2025-11-22 18:40:51', 'HD6275AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241101-18', 1, 6, NULL, '2024-11-01 09:44:15', '2025-12-04 00:44:37', 'HD5522AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241102-1', 5, 2, NULL, '2024-11-02 19:28:33', '2025-11-14 21:19:32', NULL, 0.00, 1, NULL, NULL, NULL, 6, 1, NULL, 2),
('PED-20241102-12', 7, 1, NULL, '2024-11-02 13:00:44', '2025-11-22 18:40:51', 'HD7517AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241105-001', 33, 2, NULL, '2024-11-05 15:00:00', '2025-11-22 18:40:51', 'HD6442AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241105-4', 5, 2, NULL, '2024-11-05 08:49:58', '2025-12-04 00:44:37', 'HD9328AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241107-0', 1, 7, NULL, '2024-11-07 17:19:12', '2025-11-22 18:40:51', 'HD9350AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241107-6', 4, 5, NULL, '2024-11-07 18:45:07', '2025-11-14 21:19:32', NULL, 0.00, 4, NULL, NULL, NULL, 6, 1, NULL, 3),
('PED-20241108-11', 2, 7, NULL, '2024-11-08 14:04:40', '2025-11-22 18:40:51', 'HD3383AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241108-23', 3, 1, NULL, '2024-11-08 13:23:40', '2025-12-04 00:44:37', 'HD7542AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241109-19', 10, 2, NULL, '2024-11-09 19:10:53', '2025-12-04 00:40:22', 'HD5200AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241109-8', 2, 5, NULL, '2024-11-09 12:53:21', '2025-11-22 18:40:51', 'HD5950AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241110-001', 34, 1, NULL, '2024-11-10 16:00:00', '2025-11-22 18:40:51', 'HD5592AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241110-24', 9, 7, NULL, '2024-11-10 11:24:13', '2025-11-22 18:40:51', 'HD7809AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241110-3', 6, 2, NULL, '2024-11-10 17:54:15', '2025-11-22 18:40:51', 'HD4153AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241113-2', 4, 2, NULL, '2024-11-13 09:12:47', '2025-12-04 00:44:37', 'HD6402AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241113-7', 2, 5, NULL, '2024-11-13 16:08:42', '2025-11-22 18:40:51', 'HD1913AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241114-15', 10, 1, NULL, '2024-11-14 12:19:35', '2025-11-22 18:40:51', 'HD5105AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241115-001', 35, 2, NULL, '2024-11-16 17:00:00', '2025-11-14 20:39:57', NULL, 0.00, 1, NULL, '2024-11-16 17:00:00', 1, 6, 0, NULL, 3),
('PED-20241115-17', 6, 1, NULL, '2024-11-15 09:06:09', '2025-11-22 18:40:51', 'HD3274AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241117-14', 3, 6, NULL, '2024-11-17 19:00:15', '2025-11-22 18:40:51', 'HD9790AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241119-16', 9, 6, NULL, '2024-11-19 17:19:09', '2025-11-22 18:40:51', 'HD5636AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241120-001', 36, 1, NULL, '2024-11-20 18:00:00', '2025-11-22 18:40:51', 'HD9940AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241120-21', 2, 5, NULL, '2024-11-20 10:00:25', '2025-11-22 18:40:51', 'HD2885AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241121-10', 7, 5, NULL, '2024-11-21 14:33:16', '2025-11-22 18:40:51', 'HD6810AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241121-13', 7, 5, NULL, '2024-11-21 12:02:57', '2025-11-22 18:40:51', 'HD1601AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241123-22', 6, 1, NULL, '2024-11-23 14:36:16', '2025-12-04 00:44:37', 'HD8246AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241123-5', 5, 5, NULL, '2024-11-23 14:25:32', '2025-12-04 00:44:37', 'HD6991AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241124-20', 10, 6, NULL, '2024-11-24 15:56:45', '2025-11-22 18:40:51', 'HD7145AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241124-9', 3, 6, NULL, '2024-11-24 19:38:14', '2025-12-04 00:44:37', 'HD6124AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241125-001', 37, 2, NULL, '2024-11-25 19:00:00', '2025-11-22 18:40:51', 'HD7352AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241201-13', 3, 2, NULL, '2024-12-01 08:01:03', '2025-12-04 00:40:22', 'HD5297AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241202-23', 9, 6, NULL, '2024-12-02 19:32:53', '2025-11-22 18:40:51', 'HD3958AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241204-16', 2, 2, NULL, '2024-12-04 11:10:55', '2025-12-04 00:40:22', 'HD4049AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241204-5', 8, 2, NULL, '2024-12-04 17:43:10', '2025-11-22 18:40:51', 'HD5733AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241207-22', 9, 5, NULL, '2024-12-07 10:17:57', '2025-12-04 00:44:37', 'HD7972AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241210-3', 6, 2, NULL, '2024-12-10 08:16:16', '2025-12-04 00:40:22', 'HD6795AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241211-15', 4, 7, NULL, '2024-12-11 18:10:22', '2025-11-22 18:40:51', 'HD3356AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241211-17', 7, 6, NULL, '2024-12-11 15:55:53', '2025-11-22 18:40:51', 'HD3633AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241212-24', 2, 2, NULL, '2024-12-12 09:26:53', '2025-12-04 00:44:37', 'HD7873AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241213-7', 9, 1, NULL, '2024-12-13 16:05:25', '2025-11-22 18:40:51', 'HD7098AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241215-10', 2, 1, NULL, '2024-12-15 10:41:50', '2025-12-04 00:44:37', 'HD8632AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241215-12', 4, 2, NULL, '2024-12-15 15:39:27', '2025-11-22 18:40:51', 'HD5592AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241216-8', 8, 2, NULL, '2024-12-16 14:13:28', '2025-11-22 18:40:51', 'HD5668AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241217-11', 8, 6, NULL, '2024-12-17 09:51:04', '2025-12-04 00:44:37', 'HD9409AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241217-19', 4, 7, NULL, '2024-12-17 08:28:21', '2025-11-22 18:40:51', 'HD6776AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241221-18', 8, 7, NULL, '2024-12-21 13:11:39', '2025-11-22 18:40:51', 'HD3498AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241221-2', 1, 6, NULL, '2024-12-21 11:25:16', '2025-11-22 18:40:51', 'HD5160AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241223-20', 5, 6, NULL, '2024-12-23 18:06:57', '2025-11-22 18:40:51', 'HD1565AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241225-6', 10, 7, NULL, '2024-12-25 16:00:59', '2025-11-22 18:40:51', 'HD7819AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241227-0', 3, 1, NULL, '2024-12-27 14:59:27', '2025-11-22 18:40:51', 'HD5310AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241227-4', 9, 7, NULL, '2024-12-27 15:23:12', '2025-11-22 18:40:51', 'HD1070AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20241228-1', 4, 5, NULL, '2024-12-28 11:39:27', '2025-11-22 18:40:51', 'HD6406AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20241228-9', 6, 2, NULL, '2024-12-28 19:07:46', '2025-12-04 00:44:37', 'HD5328AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20241230-14', 9, 6, NULL, '2024-12-30 18:20:10', '2025-11-22 18:40:51', 'HD6420AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20241230-21', 6, 6, NULL, '2024-12-30 08:32:26', '2025-12-04 00:44:37', 'HD2505AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250102-12', 4, 1, NULL, '2025-01-02 09:18:15', '2025-12-04 00:44:37', 'HD8186AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250102-22', 8, 2, NULL, '2025-01-02 09:16:06', '2025-11-22 18:40:51', 'HD2795AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250103-2', 7, 2, NULL, '2025-01-03 10:39:43', '2025-11-22 18:40:51', 'HD8341AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250107-21', 9, 2, NULL, '2025-01-07 14:08:03', '2025-11-22 18:40:51', 'HD1234AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250108-13', 6, 2, NULL, '2025-01-08 16:52:13', '2025-12-04 00:40:22', 'HD5784AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250108-18', 2, 1, NULL, '2025-01-08 17:10:31', '2025-11-22 18:40:51', 'HD6219AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250109-14', 5, 5, NULL, '2025-01-09 10:15:38', '2025-11-22 18:40:51', 'HD3747AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250112-8', 3, 7, NULL, '2025-01-12 17:55:12', '2025-11-22 18:40:51', 'HD8990AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250116-20', 3, 7, NULL, '2025-01-16 10:34:11', '2025-12-04 00:44:37', 'HD8151AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250116-24', 9, 7, NULL, '2025-01-16 09:10:28', '2025-11-14 21:19:32', NULL, 0.00, 1, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20250117-15', 9, 6, NULL, '2025-01-17 18:36:32', '2025-11-22 18:40:51', 'HD8076AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250118-19', 3, 2, NULL, '2025-01-18 10:23:16', '2025-11-22 18:40:51', 'HD9927AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250119-16', 2, 2, NULL, '2025-01-19 12:55:34', '2025-12-04 00:40:22', 'HD3671AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250120-17', 8, 2, NULL, '2025-01-20 15:26:13', '2025-12-04 00:44:37', 'HD2110AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250121-10', 5, 6, NULL, '2025-01-21 11:19:53', '2025-11-22 18:40:51', 'HD5571AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250122-0', 10, 5, NULL, '2025-01-22 12:41:23', '2025-12-04 00:44:37', 'HD3179AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250123-5', 3, 1, NULL, '2025-01-23 09:34:23', '2025-11-22 18:40:51', 'HD1144AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250123-6', 10, 5, NULL, '2025-01-23 13:14:43', '2025-11-22 18:40:51', 'HD6844AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250124-7', 6, 2, NULL, '2025-01-24 11:07:46', '2025-11-22 18:40:51', 'HD7508AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250126-4', 6, 2, NULL, '2025-01-26 14:22:07', '2025-11-22 18:40:51', 'HD7490AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250126-9', 5, 2, NULL, '2025-01-26 11:56:51', '2025-12-04 00:44:37', 'HD9465AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250128-1', 6, 1, NULL, '2025-01-28 19:05:33', '2025-11-14 21:19:32', NULL, 0.00, 4, NULL, NULL, NULL, 6, 1, NULL, 2),
('PED-20250128-11', 2, 2, NULL, '2025-01-28 08:22:51', '2025-11-22 18:40:51', 'HD6019AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250130-23', 4, 2, NULL, '2025-01-30 17:02:53', '2025-12-04 00:40:22', 'HD6628AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250131-3', 2, 2, NULL, '2025-01-31 19:40:38', '2025-12-04 00:40:22', 'HD7010AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250201-15', 8, 2, NULL, '2025-02-01 10:53:53', '2025-11-22 18:40:51', 'HD2526AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250203-20', 5, 7, NULL, '2025-02-03 14:16:51', '2025-11-22 18:40:51', 'HD8599AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250205-16', 9, 2, NULL, '2025-02-05 17:19:22', '2025-11-22 18:40:51', 'HD7423AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250205-21', 3, 1, NULL, '2025-02-05 13:52:57', '2025-11-22 18:40:51', 'HD1317AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250206-1', 10, 5, NULL, '2025-02-06 16:11:41', '2025-11-14 21:19:32', NULL, 0.00, 3, NULL, NULL, NULL, 6, 1, NULL, 2),
('PED-20250206-8', 4, 5, NULL, '2025-02-06 17:25:43', '2025-12-04 00:44:37', 'HD6781AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2);
INSERT INTO `pedido` (`numeroPedido`, `idCliente`, `idUsuarioCreo`, `idUsuarioModifico`, `fechaPedido`, `fechaModificacion`, `codigoSeguimiento`, `descuentoOrden`, `idMotivoCancelacion`, `observacionCancelacion`, `fechaCancelacion`, `idUsuarioCancelo`, `idEstado`, `estaActivo`, `dummyUpdate`, `idEmpresaEnvio`) VALUES
('PED-20250207-13', 2, 7, NULL, '2025-02-07 14:54:58', '2025-11-22 18:40:51', 'HD1317AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250208-4', 7, 5, NULL, '2025-02-08 13:28:01', '2025-11-22 18:40:51', 'HD1634AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250209-19', 7, 2, NULL, '2025-02-09 11:39:19', '2025-12-04 00:44:37', 'HD6419AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250213-12', 8, 2, NULL, '2025-02-13 08:53:16', '2025-12-04 00:44:37', 'HD6673AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250215-10', 2, 7, NULL, '2025-02-15 09:56:24', '2025-11-22 18:40:51', 'HD3219AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250216-7', 5, 2, NULL, '2025-02-16 12:20:30', '2025-12-04 00:44:37', 'HD8514AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250217-3', 7, 5, NULL, '2025-02-17 11:50:13', '2025-12-04 00:44:37', 'HD2256AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250218-11', 6, 2, NULL, '2025-02-18 10:16:40', '2025-12-04 00:40:22', 'HD1196AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250218-6', 10, 1, NULL, '2025-02-18 14:45:15', '2025-12-04 00:44:37', 'HD5903AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250219-14', 8, 1, NULL, '2025-02-19 12:05:11', '2025-12-04 00:44:37', 'HD2314AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250220-0', 5, 5, NULL, '2025-02-20 10:49:35', '2025-11-22 18:40:51', 'HD5082AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250221-2', 3, 7, NULL, '2025-02-21 13:15:47', '2025-11-22 18:40:51', 'HD4527AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250221-23', 8, 2, NULL, '2025-02-21 16:22:46', '2025-11-22 18:40:51', 'HD4319AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250222-5', 8, 2, NULL, '2025-02-22 08:43:35', '2025-11-22 18:40:51', 'HD6388AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250223-18', 4, 7, NULL, '2025-02-23 15:42:41', '2025-12-04 00:44:37', 'HD6432AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250225-17', 1, 7, NULL, '2025-02-25 17:18:12', '2025-12-04 00:44:37', 'HD6410AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250226-22', 1, 2, NULL, '2025-02-26 15:25:15', '2025-12-04 00:44:37', 'HD2757AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250227-24', 3, 5, NULL, '2025-02-27 17:08:20', '2025-12-04 00:44:37', 'HD2553AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250228-9', 7, 1, NULL, '2025-02-28 11:36:05', '2025-11-22 18:40:51', 'HD8012AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250301-20', 5, 1, NULL, '2025-03-01 15:11:59', '2025-11-22 18:40:51', 'HD8106AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250305-10', 3, 1, NULL, '2025-03-05 10:36:24', '2025-12-04 00:44:37', 'HD5570AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250307-13', 5, 2, NULL, '2025-03-07 09:04:55', '2025-11-22 18:40:51', 'HD8362AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250307-9', 8, 2, NULL, '2025-03-07 15:26:24', '2025-12-04 00:44:37', 'HD2395AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250308-4', 5, 7, NULL, '2025-03-08 13:30:11', '2025-11-22 18:40:51', 'HD6493AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250309-23', 5, 5, NULL, '2025-03-09 12:06:21', '2025-12-04 00:44:37', 'HD4377AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250309-7', 9, 2, NULL, '2025-03-09 12:48:03', '2025-11-22 18:40:51', 'HD7149AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250310-16', 8, 1, NULL, '2025-03-10 13:33:17', '2025-11-22 18:40:51', 'HD3650AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250316-18', 10, 1, NULL, '2025-03-16 09:07:16', '2025-11-22 18:40:51', 'HD1161AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250316-3', 1, 1, NULL, '2025-03-16 15:40:24', '2025-11-22 18:40:51', 'HD2857AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250318-11', 5, 7, NULL, '2025-03-18 15:32:48', '2025-11-22 18:40:51', 'HD9801AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250318-15', 6, 7, NULL, '2025-03-18 12:05:21', '2025-11-22 18:40:51', 'HD3440AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250318-24', 7, 2, NULL, '2025-03-18 15:30:38', '2025-11-22 18:40:51', 'HD4794AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250320-8', 8, 7, NULL, '2025-03-20 12:52:15', '2025-11-22 18:40:51', 'HD6266AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250321-5', 2, 5, NULL, '2025-03-21 19:47:06', '2025-11-22 18:40:51', 'HD8884AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250322-14', 7, 5, NULL, '2025-03-22 16:34:40', '2025-12-04 00:44:37', 'HD9094AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250323-21', 10, 6, NULL, '2025-03-23 08:07:28', '2025-11-22 18:40:51', 'HD3653AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250325-19', 5, 2, NULL, '2025-03-25 15:55:38', '2025-12-04 00:44:37', 'HD7419AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250327-0', 6, 6, NULL, '2025-03-27 18:57:05', '2025-12-04 00:44:37', 'HD3875AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250328-1', 3, 1, NULL, '2025-03-28 08:39:02', '2025-11-22 18:40:51', 'HD2883AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250329-17', 1, 7, NULL, '2025-03-29 15:29:30', '2025-11-22 18:40:51', 'HD2456AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250330-2', 3, 2, NULL, '2025-03-30 16:46:42', '2025-12-04 00:40:22', 'HD6624AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250330-22', 4, 1, NULL, '2025-03-30 10:09:09', '2025-11-22 18:40:51', 'HD5471AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250331-12', 6, 2, NULL, '2025-03-31 18:26:34', '2025-12-04 00:44:37', 'HD2329AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250331-6', 9, 2, NULL, '2025-03-31 09:27:03', '2025-11-22 18:40:51', 'HD6482AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250401-9', 6, 1, NULL, '2025-04-01 15:15:15', '2025-11-22 18:40:51', 'HD2633AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250403-1', 9, 2, NULL, '2025-04-03 12:30:28', '2025-12-04 00:40:22', 'HD5999AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250403-2', 1, 7, NULL, '2025-04-03 09:27:53', '2025-11-22 18:40:51', 'HD9547AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250403-23', 4, 5, NULL, '2025-04-03 09:34:24', '2025-11-22 18:40:51', 'HD4798AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250405-24', 5, 2, NULL, '2025-04-05 08:59:40', '2025-11-22 18:40:51', 'HD1745AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250406-11', 9, 1, NULL, '2025-04-06 19:01:23', '2025-11-22 18:40:51', 'HD6090AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250406-21', 4, 6, NULL, '2025-04-06 14:12:23', '2025-11-22 18:40:51', 'HD6081AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250410-8', 5, 2, NULL, '2025-04-10 19:03:19', '2025-12-04 00:44:37', 'HD3025AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250411-15', 9, 5, NULL, '2025-04-11 14:43:00', '2025-11-22 18:40:51', 'HD6057AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250411-5', 10, 2, NULL, '2025-04-11 14:47:15', '2025-12-04 00:40:22', 'HD6170AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250412-14', 2, 6, NULL, '2025-04-12 19:49:07', '2025-11-22 18:40:51', 'HD2017AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250412-19', 9, 5, NULL, '2025-04-12 11:13:18', '2025-11-22 18:40:51', 'HD8912AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250413-13', 9, 2, NULL, '2025-04-13 17:36:43', '2025-12-04 00:40:22', 'HD1516AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250415-10', 2, 2, NULL, '2025-04-15 10:33:10', '2025-12-04 00:44:37', 'HD3442AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250416-22', 7, 5, NULL, '2025-04-16 16:51:14', '2025-11-22 18:40:51', 'HD2612AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250417-12', 9, 7, NULL, '2025-04-17 18:37:33', '2025-12-04 00:44:37', 'HD5946AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250417-7', 3, 5, NULL, '2025-04-17 08:41:15', '2025-12-04 00:44:37', 'HD7568AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250418-20', 7, 6, NULL, '2025-04-18 16:53:16', '2025-11-22 18:40:51', 'HD2546AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250418-6', 5, 7, NULL, '2025-04-18 12:11:47', '2025-11-22 18:40:51', 'HD6841AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250425-4', 8, 5, NULL, '2025-04-25 17:35:30', '2025-11-22 18:40:51', 'HD1659AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250426-0', 9, 2, NULL, '2025-04-26 13:36:43', '2025-12-04 00:40:22', 'HD4773AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250427-17', 1, 7, NULL, '2025-04-27 09:03:50', '2025-12-04 00:44:37', 'HD3156AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250429-18', 3, 1, NULL, '2025-04-29 08:30:21', '2025-11-22 18:40:51', 'HD3897AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250430-16', 7, 5, NULL, '2025-04-30 17:05:59', '2025-12-04 00:44:37', 'HD9672AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250430-3', 3, 6, NULL, '2025-04-30 13:09:32', '2025-11-22 18:40:51', 'HD1846AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250501-2', 2, 6, NULL, '2025-05-01 16:38:00', '2025-11-22 18:40:51', 'HD5540AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250501-7', 5, 2, NULL, '2025-05-01 14:36:27', '2025-12-04 00:40:22', 'HD3165AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250502-22', 9, 6, NULL, '2025-05-02 17:42:11', '2025-11-22 18:40:51', 'HD8888AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250503-1', 1, 6, NULL, '2025-05-03 19:43:39', '2025-11-22 18:40:51', 'HD2123AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250504-16', 5, 2, NULL, '2025-05-04 18:04:44', '2025-11-22 18:40:51', 'HD9949AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250506-0', 5, 1, NULL, '2025-05-06 17:16:03', '2025-11-22 18:40:51', 'HD7205AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250510-14', 5, 2, NULL, '2025-05-10 13:25:44', '2025-12-04 00:40:22', NULL, 0.00, 5, NULL, NULL, NULL, 6, 1, NULL, 4),
('PED-20250511-24', 4, 7, NULL, '2025-05-11 17:01:40', '2025-11-22 18:40:51', 'HD7531AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250512-3', 10, 6, NULL, '2025-05-12 13:13:43', '2025-12-04 00:44:37', 'HD7550AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250514-4', 2, 2, NULL, '2025-05-14 13:53:09', '2025-11-22 18:40:51', 'HD6041AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250517-15', 9, 6, NULL, '2025-05-17 10:39:34', '2025-11-22 18:40:51', 'HD6613AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250518-5', 1, 6, NULL, '2025-05-18 19:13:07', '2025-12-04 00:44:37', 'HD1354AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250519-13', 5, 2, NULL, '2025-05-19 15:15:26', '2025-12-04 00:44:37', 'HD7987AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250523-10', 5, 1, NULL, '2025-05-23 08:03:08', '2025-12-04 00:44:37', 'HD7880AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250523-6', 8, 2, NULL, '2025-05-23 09:35:30', '2025-11-14 21:19:32', NULL, 0.00, 5, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20250524-8', 6, 1, NULL, '2025-05-24 12:45:34', '2025-11-14 21:19:32', NULL, 0.00, 3, NULL, NULL, NULL, 6, 1, NULL, 1),
('PED-20250525-20', 7, 2, NULL, '2025-05-25 09:17:06', '2025-12-04 00:44:37', 'HD4479AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250526-18', 1, 6, NULL, '2025-05-26 10:29:54', '2025-12-04 00:44:37', 'HD4715AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250527-11', 1, 2, NULL, '2025-05-27 14:18:47', '2025-12-04 00:40:22', 'HD4944AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250527-9', 9, 6, NULL, '2025-05-27 17:14:55', '2025-11-22 18:40:51', 'HD6381AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250529-19', 8, 5, NULL, '2025-05-29 09:03:47', '2025-12-04 00:44:37', 'HD7397AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250529-21', 9, 2, NULL, '2025-05-29 15:13:18', '2025-12-04 00:44:37', 'HD7293AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250530-23', 2, 2, NULL, '2025-05-30 11:43:40', '2025-12-04 00:44:37', 'HD4277AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250531-12', 3, 2, NULL, '2025-05-31 13:22:28', '2025-12-04 00:40:22', 'HD1058AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250531-17', 6, 6, NULL, '2025-05-31 08:23:44', '2025-12-04 00:44:37', 'HD5692AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250601-17', 6, 7, NULL, '2025-06-01 16:24:56', '2025-11-22 18:40:51', 'HD3880AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250604-3', 4, 2, NULL, '2025-06-04 15:54:37', '2025-12-04 00:40:22', 'HD3148AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250604-8', 8, 1, NULL, '2025-06-04 15:50:15', '2025-11-22 18:40:51', 'HD3570AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250605-11', 5, 7, NULL, '2025-06-05 19:12:13', '2025-12-04 00:44:37', 'HD3513AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250613-20', 2, 5, NULL, '2025-06-13 14:25:29', '2025-12-04 00:44:37', 'HD9051AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250614-19', 3, 2, NULL, '2025-06-14 14:19:02', '2025-12-04 00:40:22', 'HD5208AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250615-18', 3, 2, NULL, '2025-06-15 18:43:04', '2025-12-04 00:40:22', 'HD2565AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250615-24', 5, 2, NULL, '2025-06-15 08:46:45', '2025-12-04 00:40:22', 'HD2380AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250616-10', 3, 7, NULL, '2025-06-16 09:56:24', '2025-12-04 00:44:37', 'HD3953AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250616-16', 3, 6, NULL, '2025-06-16 13:34:36', '2025-11-22 18:40:51', 'HD3208AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250617-12', 5, 2, NULL, '2025-06-17 17:16:04', '2025-11-22 18:40:51', 'HD5334AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250617-13', 9, 1, NULL, '2025-06-17 16:49:03', '2025-11-22 18:40:51', 'HD1046AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250618-6', 9, 5, NULL, '2025-06-18 13:22:35', '2025-11-22 18:40:51', 'HD6226AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250620-0', 1, 2, NULL, '2025-06-20 14:46:16', '2025-12-04 00:44:37', 'HD3425AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250620-1', 10, 2, NULL, '2025-06-20 11:28:28', '2025-12-04 00:44:37', 'HD1077AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250621-2', 4, 1, NULL, '2025-06-21 08:58:50', '2025-12-04 00:44:37', 'HD3111AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250621-9', 6, 2, NULL, '2025-06-21 14:27:47', '2025-11-22 18:40:51', 'HD8996AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250622-22', 4, 6, NULL, '2025-06-22 08:02:05', '2025-11-22 18:40:51', 'HD7902AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250622-7', 9, 5, NULL, '2025-06-22 17:48:40', '2025-11-22 18:40:51', 'HD7304AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250623-15', 10, 5, NULL, '2025-06-23 18:56:09', '2025-11-22 18:40:51', 'HD1888AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250624-14', 7, 6, NULL, '2025-06-24 19:12:15', '2025-11-22 18:40:51', 'HD8533AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250625-21', 8, 2, NULL, '2025-06-25 15:38:20', '2025-12-04 00:40:22', 'HD1755AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250628-23', 4, 5, NULL, '2025-06-28 15:23:06', '2025-12-04 00:44:37', 'HD7906AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250629-4', 4, 7, NULL, '2025-06-29 18:21:17', '2025-11-22 18:40:51', 'HD9172AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250629-5', 7, 2, NULL, '2025-06-29 09:35:41', '2025-12-04 00:44:37', 'HD6663AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250702-24', 10, 2, NULL, '2025-07-02 10:04:38', '2025-12-04 00:40:22', 'HD3599AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250703-16', 1, 1, NULL, '2025-07-03 13:17:58', '2025-12-04 00:44:37', 'HD1457AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250706-21', 5, 1, NULL, '2025-07-06 18:46:21', '2025-12-04 00:44:37', 'HD3615AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250706-9', 4, 1, NULL, '2025-07-06 14:15:37', '2025-12-04 00:44:37', 'HD3707AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250708-11', 9, 2, NULL, '2025-07-08 09:54:06', '2025-12-04 00:44:37', 'HD6691AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250708-8', 4, 7, NULL, '2025-07-08 15:17:38', '2025-12-04 00:44:37', 'HD3336AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250709-1', 7, 6, NULL, '2025-07-09 12:13:51', '2025-11-22 18:40:51', 'HD2731AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250713-20', 9, 7, NULL, '2025-07-13 17:54:06', '2025-11-22 18:40:51', 'HD6992AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250714-6', 4, 2, NULL, '2025-07-14 19:29:34', '2025-11-22 18:40:51', 'HD7770AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250715-23', 8, 5, NULL, '2025-07-15 13:43:22', '2025-12-04 00:44:37', 'HD9591AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250716-13', 1, 2, NULL, '2025-07-16 17:30:06', '2025-12-04 00:40:22', 'HD7479AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250718-5', 7, 2, NULL, '2025-07-18 18:49:25', '2025-12-04 00:40:22', 'HD7599AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250719-0', 7, 5, NULL, '2025-07-19 12:09:37', '2025-11-22 18:40:51', 'HD5560AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250719-10', 7, 5, NULL, '2025-07-19 17:15:52', '2025-11-22 18:40:51', 'HD7877AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250720-2', 10, 2, NULL, '2025-07-20 09:43:13', '2025-11-22 18:40:51', 'HD4004AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250726-19', 8, 2, NULL, '2025-07-26 19:25:11', '2025-12-04 00:40:22', 'HD6077AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250726-7', 7, 1, NULL, '2025-07-26 18:56:06', '2025-11-22 18:40:51', 'HD5754AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250727-17', 2, 6, NULL, '2025-07-27 19:15:23', '2025-11-22 18:40:51', 'HD9539AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250727-22', 7, 1, NULL, '2025-07-27 09:10:26', '2025-12-04 00:44:37', 'HD9493AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250727-3', 8, 7, NULL, '2025-07-27 13:36:43', '2025-11-22 18:40:51', 'HD2339AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250727-4', 5, 2, NULL, '2025-07-27 10:31:00', '2025-11-22 18:40:51', 'HD7684AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250729-12', 4, 7, NULL, '2025-07-29 13:24:43', '2025-11-22 18:40:51', 'HD2436AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250729-18', 5, 5, NULL, '2025-07-29 08:24:55', '2025-11-22 18:40:51', 'HD9562AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250730-15', 5, 2, NULL, '2025-07-30 18:28:46', '2025-12-04 00:44:37', 'HD3514AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250731-14', 4, 2, NULL, '2025-07-31 16:42:17', '2025-12-04 00:40:22', 'HD3407AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250801-1', 1, 5, NULL, '2025-08-01 08:13:56', '2025-11-22 18:40:51', 'HD1981AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250801-12', 3, 2, NULL, '2025-08-01 19:48:08', '2025-12-04 00:40:22', 'HD3505AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250801-14', 7, 2, NULL, '2025-08-01 16:31:26', '2025-12-04 00:40:22', 'HD7683AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250802-7', 2, 1, NULL, '2025-08-02 12:39:13', '2025-12-04 00:44:37', 'HD8318AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250803-3', 9, 6, NULL, '2025-08-03 11:05:37', '2025-11-22 18:40:51', 'HD5837AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250803-6', 10, 2, NULL, '2025-08-03 13:52:06', '2025-11-22 18:40:51', 'HD8671AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250805-15', 4, 5, NULL, '2025-08-05 08:34:48', '2025-12-04 00:44:37', 'HD1231AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250806-20', 3, 2, NULL, '2025-08-06 15:33:59', '2025-12-04 00:44:37', 'HD7742AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250806-4', 6, 6, NULL, '2025-08-06 16:06:22', '2025-11-22 18:40:51', 'HD6848AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250806-8', 7, 5, NULL, '2025-08-06 08:26:11', '2025-11-22 18:40:51', 'HD7226AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250807-11', 10, 6, NULL, '2025-08-07 18:31:06', '2025-11-22 18:40:51', 'HD4476AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250807-2', 3, 5, NULL, '2025-08-07 14:16:36', '2025-11-22 18:40:51', 'HD7330AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250809-17', 10, 1, NULL, '2025-08-09 11:35:08', '2025-11-22 18:40:51', 'HD5589AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250809-5', 3, 2, NULL, '2025-08-09 10:21:03', '2025-12-04 00:40:22', 'HD5266AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250814-0', 5, 2, NULL, '2025-08-14 14:29:46', '2025-12-04 00:44:37', 'HD8360AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250816-16', 6, 2, NULL, '2025-08-16 16:09:35', '2025-12-04 00:44:37', 'HD4561AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250820-19', 10, 7, NULL, '2025-08-20 16:45:38', '2025-11-14 21:19:32', NULL, 0.00, 2, NULL, NULL, NULL, 6, 1, NULL, 4),
('PED-20250822-9', 5, 7, NULL, '2025-08-22 15:55:51', '2025-11-22 18:40:51', 'HD4226AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250824-24', 4, 2, NULL, '2025-08-24 11:09:58', '2025-12-04 00:44:37', 'HD6518AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250825-10', 3, 2, NULL, '2025-08-25 08:48:55', '2025-11-22 18:40:51', 'HD8564AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250826-22', 2, 2, NULL, '2025-08-26 18:58:12', '2025-12-04 00:44:37', 'HD9329AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250826-23', 3, 5, NULL, '2025-08-26 12:33:35', '2025-11-22 18:40:51', 'HD7139AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250829-21', 5, 2, NULL, '2025-08-29 17:18:04', '2025-11-22 18:40:51', 'HD8024AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250831-13', 7, 6, NULL, '2025-08-31 09:39:55', '2025-12-04 00:44:37', 'HD3115AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250831-18', 4, 6, NULL, '2025-08-31 17:51:58', '2025-11-22 18:40:51', 'HD4431AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250902-0', 5, 5, NULL, '2025-09-02 19:37:15', '2025-11-22 18:40:51', 'HD6083AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250902-9', 3, 5, NULL, '2025-09-02 16:24:53', '2025-11-22 18:40:51', 'HD7121AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250903-22', 6, 7, NULL, '2025-09-03 10:41:54', '2025-11-22 18:40:51', 'HD4021AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250904-7', 10, 7, NULL, '2025-09-04 11:06:38', '2025-12-04 00:44:37', 'HD7485AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250906-19', 1, 2, NULL, '2025-09-06 19:24:03', '2025-11-22 18:40:51', 'HD7359AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250907-1', 4, 5, NULL, '2025-09-07 13:29:10', '2025-12-04 00:44:37', 'HD4379AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250911-18', 4, 2, NULL, '2025-09-11 13:01:53', '2025-11-22 18:40:51', 'HD5434AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250912-20', 6, 5, NULL, '2025-09-12 12:47:47', '2025-11-22 18:40:51', 'HD4094AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250913-24', 8, 1, NULL, '2025-09-13 14:26:37', '2025-11-22 18:40:51', 'HD6686AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250913-4', 10, 5, NULL, '2025-09-13 14:24:26', '2025-11-22 18:40:51', 'HD3167AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250914-6', 5, 5, NULL, '2025-09-14 16:17:15', '2025-11-22 18:40:51', 'HD2369AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250915-14', 8, 2, NULL, '2025-09-15 17:41:57', '2025-12-04 00:40:22', 'HD8787AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250916-16', 1, 1, NULL, '2025-09-16 09:55:21', '2025-11-22 18:40:51', 'HD8829AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250916-17', 9, 7, NULL, '2025-09-16 10:39:34', '2025-12-04 00:44:37', 'HD8052AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250918-11', 3, 2, NULL, '2025-09-18 14:04:41', '2025-12-04 00:44:37', 'HD8532AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250918-2', 6, 2, NULL, '2025-09-18 18:24:33', '2025-11-22 18:40:51', 'HD2553AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250918-21', 4, 7, NULL, '2025-09-18 08:33:35', '2025-11-22 18:40:51', 'HD2267AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250919-8', 6, 2, NULL, '2025-09-19 14:03:31', '2025-12-04 00:44:37', 'HD8105AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20250920-23', 1, 5, NULL, '2025-09-20 14:56:58', '2025-11-22 18:40:51', 'HD2676AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250920-5', 7, 2, NULL, '2025-09-20 12:46:47', '2025-12-04 00:40:22', 'HD7787AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250921-13', 3, 1, NULL, '2025-09-21 08:01:04', '2025-12-04 00:44:37', 'HD6115AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20250923-3', 10, 5, NULL, '2025-09-23 19:30:41', '2025-11-22 18:40:51', 'HD2448AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250924-10', 7, 6, NULL, '2025-09-24 11:05:35', '2025-11-22 18:40:51', 'HD5877AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20250927-12', 8, 2, NULL, '2025-09-27 18:46:12', '2025-12-04 00:40:22', 'HD3046AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20250930-15', 1, 5, NULL, '2025-09-30 10:02:38', '2025-12-04 00:44:37', 'HD7118AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20251001-8', 5, 1, NULL, '2025-10-01 16:39:05', '2025-11-22 18:40:51', 'HD5597AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20251002-1', 4, 7, NULL, '2025-10-02 17:52:00', '2025-11-22 18:40:51', 'HD5581AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20251002-20', 8, 5, NULL, '2025-10-02 12:50:02', '2025-11-22 18:40:51', 'HD9876AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20251004-0', 1, 5, NULL, '2025-10-04 17:31:20', '2025-11-22 18:40:51', 'HD2269AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 4),
('PED-20251004-13', 4, 2, NULL, '2025-10-04 10:33:12', '2025-11-22 18:40:51', 'HD4640AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20251006-19', 10, 6, NULL, '2025-10-06 09:14:44', '2025-11-22 18:40:51', 'HD1571AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20251007-12', 2, 7, NULL, '2025-10-07 12:12:57', '2025-11-22 18:40:51', 'HD5966AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-20251008-10', 2, 5, NULL, '2025-10-08 14:01:26', '2025-11-22 18:40:51', 'HD3707AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-20251010-4', 3, 2, NULL, '2025-10-10 17:57:25', '2025-12-04 00:40:22', 'HD1934AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20251012-17', 6, 5, NULL, '2025-10-12 15:09:48', '2025-11-22 18:40:51', 'HD8849AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20251013-24', 1, 2, NULL, '2025-10-13 19:40:25', '2025-11-22 18:40:51', 'HD3961AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 3),
('PED-20251015-15', 9, 6, NULL, '2025-10-15 09:06:14', '2025-11-14 20:39:57', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-20251015-21', 7, 2, NULL, '2025-10-15 17:24:46', '2025-12-04 00:40:22', 'HD4001AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20251017-3', 9, 7, NULL, '2025-10-17 18:49:27', '2025-11-22 18:40:51', 'HD7060AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-20251018-22', 8, 2, NULL, '2025-10-18 17:12:41', '2025-12-04 00:40:22', 'HD7123AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20251019-2', 7, 7, NULL, '2025-10-19 09:59:31', '2025-11-22 18:40:51', 'HD8310AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 2),
('PED-20251019-6', 7, 6, NULL, '2025-10-19 18:25:34', '2025-11-22 18:40:51', 'HD6056AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-20251021-16', 10, 2, NULL, '2025-10-21 10:06:51', '2025-11-14 20:39:57', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-20251023-9', 8, 5, NULL, '2025-10-23 10:01:21', '2025-11-22 18:40:51', 'HD4617AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 1),
('PED-20251024-11', 8, 7, NULL, '2025-10-24 09:30:03', '2025-11-22 18:40:51', 'HD9712AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 2),
('PED-20251025-7', 2, 5, NULL, '2025-10-25 09:23:27', '2025-11-22 18:40:51', 'HD6715AR', 0.00, NULL, NULL, NULL, NULL, 5, 1, NULL, 4),
('PED-20251026-5', 4, 5, NULL, '2025-10-26 09:08:20', '2025-11-14 20:39:57', NULL, 0.00, NULL, NULL, NULL, NULL, 3, 1, NULL, 3),
('PED-20251027-23', 4, 6, NULL, '2025-10-27 11:59:04', '2025-11-22 18:40:51', 'HD3078AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1),
('PED-20251028-18', 8, 5, NULL, '2025-10-28 17:08:26', '2025-11-22 21:49:02', 'HD5179AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 3),
('PED-20251029-14', 1, 5, NULL, '2025-10-29 13:35:33', '2025-11-23 20:30:15', 'HD1246AR', 0.00, NULL, NULL, NULL, NULL, 4, 1, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `idPersona` int(11) NOT NULL,
  `dni` int(11) DEFAULT NULL,
  `tipoDocumento` enum('DNI','CUIL','CUIT') DEFAULT 'DNI',
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `idDomicilio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`idPersona`, `dni`, `tipoDocumento`, `nombre`, `apellido`, `direccion`, `idDomicilio`) VALUES
(1, 12345678, 'DNI', 'Juan ', 'Perez', 'Av. Santa Fe 1234', 1),
(2, 87654321, 'DNI', 'María', 'González', 'Calle Falsa 742', 2),
(3, 23456789, 'DNI', 'Carlos', 'Lopez', '9 de Julio 500', 3),
(4, 98765432, 'DNI', 'Laura', 'Fernandez', 'Mitre 1020', 4),
(5, 34567890, 'DNI', 'Ana', 'Martínez', 'San Martín 150', 5),
(6, 45678901, 'DNI', 'Luis', 'Rodríguez', 'Belgrano 2555', 6),
(7, 56789012, 'DNI', 'Sofía', 'Gómez', 'Independencia 360', 7),
(8, 67890123, 'DNI', 'Diego', 'Silva', 'Av. Salta 890', 8),
(9, 78901234, 'DNI', 'Lucía', 'Vargas', 'Colon 123', 9),
(10, 89012345, 'DNI', 'Pedro', 'Molina', 'Alsina 456', 10),
(34, 89100101, 'DNI', 'Martin', 'Gomez', NULL, 35),
(35, 89100102, 'DNI', 'Sofia', 'Rodriguez', NULL, 36),
(36, 89100103, 'DNI', 'Diego', 'Fernandez', NULL, 37),
(37, 89100104, 'DNI', 'Lucia', 'Diaz', NULL, 38),
(38, 89100105, 'DNI', 'Carlos', 'Lopez', NULL, 39),
(39, 89100106, 'DNI', 'Martin', 'Gomez', NULL, 40),
(40, 89100107, 'DNI', 'Sofia', 'Rodriguez', NULL, 41),
(41, 89100108, 'DNI', 'Valeria', 'Paz', NULL, 42),
(42, 89100109, 'DNI', 'Javier', 'Sosa', NULL, 43),
(43, 89100110, 'DNI', 'Carolina', 'Vega', NULL, 44),
(44, 89100111, 'DNI', 'Diego', 'Fernandez', NULL, 45),
(45, 89100112, 'DNI', 'Lucia', 'Diaz', NULL, 46),
(46, 89100113, 'DNI', 'Carlos', 'Lopez', NULL, 47),
(47, 89100114, 'DNI', 'Andrea', 'Moreno', NULL, 48),
(48, 89100115, 'DNI', 'Hernan', 'Alonso', NULL, 49),
(49, 89100116, 'DNI', 'Martin', 'Gomez', NULL, 50),
(50, 89100117, 'DNI', 'Gabriela', 'Torres', NULL, 51),
(51, 89100118, 'DNI', 'Matias', 'Romero', NULL, 52),
(52, 89100119, 'DNI', 'Paula', 'Suarez', NULL, 53),
(53, 89100120, 'DNI', 'Martin', 'Gomez', NULL, 54),
(54, 2147483647, 'CUIL', 'María', 'García', 'Av. Corrientes 800', 55),
(55, 2147483647, 'CUIL', 'Luis', 'Rodríguez', 'Rivadavia 3560', 56),
(56, 2147483647, 'CUIL', 'Sofía', 'Fernández', 'San Martín 50', 57),
(57, 2147483647, 'CUIL', 'Carlos', 'López', 'Chile 100', 58),
(58, 2147483647, 'CUIL', 'Ana', 'Martínez', 'Córdoba 2000', 59),
(59, 2147483647, 'CUIL', 'Pablo', 'Gómez', 'Santa Fe 555', 60),
(60, 2147483647, 'CUIL', 'Laura', 'Díaz', 'Libertador 400', 61),
(61, 2147483647, 'CUIL', 'Martín', 'Acosta', 'Tucumán 999', 62),
(62, 2147483647, 'CUIL', 'Florencia', 'Blanco', 'Paraná 12', 63),
(63, 2147483647, 'CUIT', 'Distribuidora Sol del Sur S.A.', '', 'Lima 500', 64),
(64, 2147483647, 'CUIT', 'Logística Rápida SRL', '', 'Santa Cruz 1200', 65),
(65, 2147483647, 'CUIT', 'Textiles del Litoral', '', 'Constitución 88', 66),
(66, 2147483647, 'CUIT', 'Maderas del Norte SAS', '', 'Alem 300', 67),
(67, 2147483647, 'CUIT', 'Tecno Global SRL', '', 'Defensa 950', 68),
(68, 2147483647, 'CUIT', 'Alimentos Pura Vida', '', 'Juncal 700', 69),
(69, 2147483647, 'CUIT', 'Constructora Cima', '', 'Perú 15', 70),
(70, 2147483647, 'CUIT', 'Editorial Páginas SA', '', 'Independencia 800', 71),
(71, 2147483647, 'CUIT', 'Servicios Web Pro', '', 'Belgrano 1100', 72),
(72, 2147483647, 'CUIT', 'Herramientas Metálicas SRL', '', 'Salta 15', 73);

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
(2, 'STK-NA-1760665520494', '2025-10-20 00:00:24', 1, NULL, '2025-10-20 00:00:24', NULL, '⚠️ SCRAP: 3 unidades desechadas permanentemente. Sin motivo especificado', 99);

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
(5, 'Gerente General', 'Supervisa operaciones'),
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
(17, NULL, 'gerenteg', 'gerente_123');

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
(2, 0),
(2, 2),
(5, 6),
(6, 6),
(7, 7),
(17, 5);

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
  ADD KEY `fk_historial_usuario` (`idUsuarioModifico`),
  ADD KEY `fk_historial_motivo` (`idMotivo`);

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
-- Indices de la tabla `motivo_baja_cliente`
--
ALTER TABLE `motivo_baja_cliente`
  ADD PRIMARY KEY (`idMotivo`);

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
  MODIFY `idAsignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=639;

--
-- AUTO_INCREMENT de la tabla `barrio`
--
ALTER TABLE `barrio`
  MODIFY `idBarrio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `categoriaindumentaria`
--
ALTER TABLE `categoriaindumentaria`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `ciudad`
--
ALTER TABLE `ciudad`
  MODIFY `idCiudad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT de la tabla `cliente_historial_estado`
--
ALTER TABLE `cliente_historial_estado`
  MODIFY `idHistorial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  MODIFY `idDomicilio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

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
-- AUTO_INCREMENT de la tabla `motivo_baja_cliente`
--
ALTER TABLE `motivo_baja_cliente`
  MODIFY `idMotivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `idPersona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

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
  MODIFY `idRegistroFallo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
  ADD CONSTRAINT `fk_historial_motivo` FOREIGN KEY (`idMotivo`) REFERENCES `motivo_baja_cliente` (`idMotivo`),
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
