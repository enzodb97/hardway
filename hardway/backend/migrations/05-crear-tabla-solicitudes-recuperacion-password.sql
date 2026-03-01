-- ============================================
-- Migración: Sistema de Recuperación de Contraseña
-- Fecha: 2026-02-28
-- Descripción: Tabla para solicitudes de restablecimiento con código de 4 dígitos
-- Compatible con: XAMPP/phpMyAdmin/MariaDB
-- ============================================

-- Crear la tabla base
CREATE TABLE IF NOT EXISTS `solicitudes_recuperacion_password` (
  `idSolicitud` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `codigo` varchar(4) NOT NULL DEFAULT '0000',
  `estado` enum('PENDIENTE','APROBADA','USADA','RECHAZADA','EXPIRADA') DEFAULT 'PENDIENTE',
  `fechaSolicitud` datetime NOT NULL DEFAULT current_timestamp(),
  `fechaExpiracion` datetime NOT NULL,
  `fechaAprobacion` datetime DEFAULT NULL,
  `fechaUso` datetime DEFAULT NULL,
  `idAdminAprobador` int(11) DEFAULT NULL,
  `motivoRechazo` text DEFAULT NULL,
  `ipOrigen` varchar(45) DEFAULT NULL,
  `intentosErroneos` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Indices de la tabla `solicitudes_recuperacion_password`
--
ALTER TABLE `solicitudes_recuperacion_password`
  ADD PRIMARY KEY (`idSolicitud`),
  ADD KEY `idx_usuario` (`idUsuario`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_expiracion` (`fechaExpiracion`),
  ADD KEY `idx_usuario_estado` (`idUsuario`,`estado`),
  ADD KEY `idx_codigo_estado` (`codigo`,`estado`),
  ADD KEY `fk_solicitud_admin` (`idAdminAprobador`);

--
-- AUTO_INCREMENT de la tabla `solicitudes_recuperacion_password`
--
ALTER TABLE `solicitudes_recuperacion_password`
  MODIFY `idSolicitud` int(11) NOT NULL AUTO_INCREMENT;

--
-- Filtros para la tabla `solicitudes_recuperacion_password`
--
ALTER TABLE `solicitudes_recuperacion_password`
  ADD CONSTRAINT `fk_solicitud_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicitud_admin` FOREIGN KEY (`idAdminAprobador`) REFERENCES `usuario` (`idUsuario`) ON DELETE SET NULL;
