-- ==========================================
-- Tablas auxiliares de indumentaria
-- ==========================================
CREATE TABLE
    PrecioIndumentaria (
        idPrecio INT PRIMARY KEY AUTO_INCREMENT,
        precio DOUBLE
    );

CREATE TABLE
    NombreIndumentaria (
        idNombre INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100)
    );

CREATE TABLE
    CategoriaIndumentaria (
        idCategoria INT PRIMARY KEY AUTO_INCREMENT,
        categoria VARCHAR(100)
    );

CREATE TABLE
    Color (
        idColor INT PRIMARY KEY AUTO_INCREMENT,
        color VARCHAR(50)
    );

CREATE TABLE
    Talle (
        idTalle INT PRIMARY KEY AUTO_INCREMENT,
        nroTalle INT
    );

CREATE TABLE
    EstadoIndumentaria (
        idEstado INT PRIMARY KEY AUTO_INCREMENT,
        estadoIndumentaria VARCHAR(50)
    );

CREATE TABLE
    Tela (
        idTela INT PRIMARY KEY AUTO_INCREMENT,
        tipoTela VARCHAR(100)
    );

-- ==========================================
-- Detalle e Indumentaria
-- ==========================================
CREATE TABLE
    DetalleIndumentaria (
        idDetalle INT PRIMARY KEY AUTO_INCREMENT,
        idPrecio INT,
        idCategoria INT,
        idColor INT,
        idTalle INT,
        idEstado INT,
        idTela INT,
        FOREIGN KEY (idPrecio) REFERENCES PrecioIndumentaria (idPrecio),
        FOREIGN KEY (idCategoria) REFERENCES CategoriaIndumentaria (idCategoria),
        FOREIGN KEY (idColor) REFERENCES Color (idColor),
        FOREIGN KEY (idTalle) REFERENCES Talle (idTalle),
        FOREIGN KEY (idEstado) REFERENCES EstadoIndumentaria (idEstado),
        FOREIGN KEY (idTela) REFERENCES Tela (idTela)
    );

CREATE TABLE
    Indumentaria (
        codigoIndumentaria VARCHAR(50) PRIMARY KEY,
        idDetalle INT,
        FOREIGN KEY (idDetalle) REFERENCES DetalleIndumentaria (idDetalle)
    );

-- ==========================================
-- Geografía
-- ==========================================
CREATE TABLE
    Ciudad (
        idCiudad INT PRIMARY KEY AUTO_INCREMENT,
        nombreCiudad VARCHAR(100),
        codigoPostal VARCHAR(20)
    );

CREATE TABLE
    Barrio (
        idBarrio INT PRIMARY KEY AUTO_INCREMENT,
        nombreBarrio VARCHAR(100),
        idCiudad INT,
        FOREIGN KEY (idCiudad) REFERENCES Ciudad (idCiudad)
    );

CREATE TABLE
    Domicilio (
        idDomicilio INT PRIMARY KEY AUTO_INCREMENT,
        calle VARCHAR(100),
        altura VARCHAR(10),
        piso VARCHAR(10),
        departamento VARCHAR(10),
        observaciones VARCHAR(255),
        idBarrio INT,
        idCiudad INT,
        FOREIGN KEY (idBarrio) REFERENCES Barrio (idBarrio),
        FOREIGN KEY (idCiudad) REFERENCES Ciudad (idCiudad)
    );

-- ==========================================
-- Personas y roles
-- ==========================================
CREATE TABLE
    Persona (
        idPersona INT PRIMARY KEY AUTO_INCREMENT,
        dni INT,
        nombre VARCHAR(100),
        apellido VARCHAR(100),
        direccion VARCHAR(200),
        idDomicilio INT,
        FOREIGN KEY (idDomicilio) REFERENCES Domicilio (idDomicilio)
    );

CREATE TABLE
    GerenteGeneral (
        idGerente INT PRIMARY KEY,
        legajo INT,
        idPersona INT,
        FOREIGN KEY (idPersona) REFERENCES Persona (idPersona)
    );

CREATE TABLE
    AdminSistemas (
        idAdminSis INT PRIMARY KEY,
        legajo INT,
        idPersona INT,
        FOREIGN KEY (idPersona) REFERENCES Persona (idPersona)
    );

CREATE TABLE
    Vendedor (
        idVendedor INT PRIMARY KEY,
        legajo INT,
        idPersona INT,
        FOREIGN KEY (idPersona) REFERENCES Persona (idPersona)
    );

CREATE TABLE
    TipoRol (
        idTipoRol INT PRIMARY KEY,
        tipoRol VARCHAR(50),
        descripcionRol VARCHAR(255)
    );

CREATE TABLE
    Rol (
        idRol INT PRIMARY KEY,
        idTipoRol INT,
        FOREIGN KEY (idTipoRol) REFERENCES TipoRol (idTipoRol)
    );

CREATE TABLE
    Usuario (
        idUsuario INT PRIMARY KEY AUTO_INCREMENT,
        nombreUsuario VARCHAR(100),
        contrasena VARCHAR(100),
        idRol INT,
        FOREIGN KEY (idRol) REFERENCES Rol (idRol)
    );

CREATE TABLE
    Cliente (
        idCliente INT PRIMARY KEY,
        email VARCHAR(100),
        telefono VARCHAR(20),
        idPersona INT,
        FOREIGN KEY (idPersona) REFERENCES Persona (idPersona)
    );

-- ==========================================
-- Stock y operaciones
-- ==========================================
CREATE TABLE
    EncargadoPicker (
        legajo VARCHAR(20) PRIMARY KEY,
        idPersona INT,
        FOREIGN KEY (idPersona) REFERENCES Persona (idPersona)
    );

CREATE TABLE
    Stock (
        idStock VARCHAR(50) PRIMARY KEY,
        codigoIndumentaria VARCHAR(50),
        FOREIGN KEY (codigoIndumentaria) REFERENCES Indumentaria (codigoIndumentaria)
    );

CREATE TABLE
    EncargadoPicker_Stock (
        id INT PRIMARY KEY AUTO_INCREMENT,
        legajo VARCHAR(20),
        idStock VARCHAR(50),
        FOREIGN KEY (legajo) REFERENCES EncargadoPicker (legajo),
        FOREIGN KEY (idStock) REFERENCES Stock (idStock)
    );

CREATE TABLE
    MovimientoStock (
        idMovimientoStock VARCHAR(50) PRIMARY KEY,
        idStock VARCHAR(50),
        fechaMovimiento DATE,
        cantidad INT,
        observaciones VARCHAR(255),
        FOREIGN KEY (idStock) REFERENCES Stock (idStock)
    );

CREATE TABLE
    EncargadoIndumentaria (
        legajo VARCHAR(20) PRIMARY KEY,
        codigoIndumentaria VARCHAR(50),
        FOREIGN KEY (codigoIndumentaria) REFERENCES Indumentaria (codigoIndumentaria)
    );

-- ==========================================
-- Pedidos
-- ==========================================
CREATE TABLE
    EstadoPedido (idEstado INT PRIMARY KEY, tipoEstado VARCHAR(100));

CREATE TABLE
    Pedido (
        numeroPedido VARCHAR(50) PRIMARY KEY,
        idEstado INT,
        FOREIGN KEY (idEstado) REFERENCES EstadoPedido (idEstado)
    );

CREATE TABLE
    DetallePedido (
        idDetallePedido VARCHAR(50) PRIMARY KEY,
        numeroPedido VARCHAR(50),
        codigoIndumentaria VARCHAR(50),
        cantidad INT,
        FOREIGN KEY (numeroPedido) REFERENCES Pedido (numeroPedido),
        FOREIGN KEY (codigoIndumentaria) REFERENCES Indumentaria (codigoIndumentaria)
    );

CREATE TABLE
    encargadoPedidos (
        legajo VARCHAR(50) PRIMARY KEY,
        numeroPedido VARCHAR(50),
        FOREIGN KEY (numeroPedido) REFERENCES Pedido (numeroPedido)
    );

USE hardway1;

-- PrecioIndumentaria (10 registros)
INSERT INTO
    PrecioIndumentaria (precio)
VALUES
    (1999.99),
    (2499.50),
    (1799.00),
    (1599.99),
    (2999.95),
    (1099.00),
    (1899.25),
    (2150.75),
    (1750.00),
    (2200.50);

-- NombreIndumentaria (10 registros)
INSERT INTO
    NombreIndumentaria (nombre)
VALUES
    ('Camisa'),
    ('Pantalón'),
    ('Chaqueta'),
    ('Polera'),
    ('Zapatos'),
    ('Bufanda'),
    ('Sombrero'),
    ('Guantes'),
    ('Cinturón'),
    ('Calcetines');

-- CategoriaIndumentaria (10 registros)
INSERT INTO
    CategoriaIndumentaria (categoria)
VALUES
    ('Formal'),
    ('Casual'),
    ('Deportivo'),
    ('Trabajo'),
    ('Fiesta'),
    ('Verano'),
    ('Invierno'),
    ('Ropa Interior'),
    ('Uniforme'),
    ('Exteriores');

-- Color (10 registros)
INSERT INTO
    Color (color)
VALUES
    ('Rojo'),
    ('Azul'),
    ('Negro'),
    ('Blanco'),
    ('Verde'),
    ('Amarillo'),
    ('Gris'),
    ('Marrón'),
    ('Naranja'),
    ('Violeta');

-- Talle (10 registros)
INSERT INTO
    Talle (nroTalle)
VALUES
    (36),
    (38),
    (40),
    (42),
    (44),
    (46),
    (48),
    (50),
    (52),
    (54);

-- EstadoIndumentaria (10 registros)
INSERT INTO
    EstadoIndumentaria (estadoIndumentaria)
VALUES
    ('Nuevo'),
    ('Usado'),
    ('Reacondicionado'),
    ('Exhibición'),
    ('Defectuoso'),
    ('En reparación'),
    ('Prueba'),
    ('Liquidación'),
    ('Demostración'),
    ('Reservado');

-- Tela (10 registros)
INSERT INTO
    Tela (tipoTela)
VALUES
    ('Algodón'),
    ('Poliéster'),
    ('Lana'),
    ('Seda'),
    ('Cuero'),
    ('Denim'),
    ('Lino'),
    ('Nylon'),
    ('Cachemira'),
    ('Franela');

-- DetalleIndumentaria (10 registros)
INSERT INTO
    DetalleIndumentaria (
        idPrecio,
        idCategoria,
        idColor,
        idTalle,
        idEstado,
        idTela
    )
VALUES
    (1, 1, 1, 1, 1, 1),
    (2, 2, 2, 2, 2, 2),
    (3, 3, 3, 3, 3, 3),
    (4, 4, 4, 4, 4, 4),
    (5, 5, 5, 5, 5, 5),
    (6, 6, 6, 6, 6, 6),
    (7, 7, 7, 7, 7, 7),
    (8, 8, 8, 8, 8, 8),
    (9, 9, 9, 9, 9, 9),
    (10, 10, 10, 10, 10, 10);

-- Indumentaria (10 registros)
INSERT INTO
    Indumentaria (codigoIndumentaria, idDetalle)
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

-- Ciudad (10 registros)
INSERT INTO
    Ciudad (nombreCiudad, codigoPostal)
VALUES
    ('Buenos Aires', 'C1000'),
    ('Córdoba', 'X5000'),
    ('Rosario', 'S2000'),
    ('Mendoza', 'M5500'),
    ('La Plata', 'B1900'),
    ('Mar del Plata', 'B7600'),
    ('San Miguel de Tucumán', 'T4000'),
    ('Salta', 'A4400'),
    ('Santa Fe', 'S3000'),
    ('Bahía Blanca', 'B8000');

-- Barrio (10 registros)
INSERT INTO
    Barrio (nombreBarrio, idCiudad)
VALUES
    ('Palermo', 1),
    ('Recoleta', 1),
    ('Nueva Córdoba', 2),
    ('Centro', 3),
    ('Godoy Cruz', 4),
    ('La Perla', 6),
    ('Yerba Buena', 7),
    ('Cerrillos', 8),
    ('Barrio Roma', 9),
    ('Villa Mitre', 10);

-- Domicilio (10 registros)
INSERT INTO
    Domicilio (
        calle,
        altura,
        piso,
        departamento,
        observaciones,
        idBarrio,
        idCiudad
    )
VALUES
    (
        'Av. Santa Fe',
        '1234',
        '5',
        'A',
        'Frente al parque',
        1,
        1
    ),
    (
        'Calle Falsa',
        '742',
        NULL,
        NULL,
        'Cerca de la plaza',
        3,
        2
    ),
    ('9 de Julio', '500', '2', 'B', '', 2, 1),
    ('Mitre', '1020', '1', 'C', 'Edificio viejo', 4, 3),
    (
        'San Martín',
        '150',
        NULL,
        NULL,
        'Zona comercial',
        5,
        4
    ),
    (
        'Belgrano',
        '2555',
        '10',
        'D',
        'Vista al mar',
        6,
        6
    ),
    ('Independencia', '360', NULL, NULL, '', 7, 7),
    ('Av. Salta', '890', '3', 'E', '', 8, 8),
    ('Colon', '123', NULL, NULL, 'Residencial', 9, 9),
    ('Alsina', '456', '4', 'F', '', 10, 10);

-- Persona (10 registros)
INSERT INTO
    Persona (dni, nombre, apellido, direccion, idDomicilio)
VALUES
    (12345678, 'Juan', 'Pérez', 'Av. Santa Fe 1234', 1),
    (
        87654321,
        'María',
        'González',
        'Calle Falsa 742',
        2
    ),
    (23456789, 'Carlos', 'Lopez', '9 de Julio 500', 3),
    (98765432, 'Laura', 'Fernandez', 'Mitre 1020', 4),
    (34567890, 'Ana', 'Martínez', 'San Martín 150', 5),
    (45678901, 'Luis', 'Rodríguez', 'Belgrano 2555', 6),
    (
        56789012,
        'Sofía',
        'Gómez',
        'Independencia 360',
        7
    ),
    (67890123, 'Diego', 'Silva', 'Av. Salta 890', 8),
    (78901234, 'Lucía', 'Vargas', 'Colon 123', 9),
    (89012345, 'Pedro', 'Molina', 'Alsina 456', 10);

-- GerenteGeneral (10 registros)
INSERT INTO
    GerenteGeneral (idGerente, legajo, idPersona)
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

-- AdminSistemas (10 registros)
INSERT INTO
    AdminSistemas (idAdminSis, legajo, idPersona)
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

-- Vendedor (10 registros)
INSERT INTO
    Vendedor (idVendedor, legajo, idPersona)
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

-- TipoRol (10 registros)
INSERT INTO
    TipoRol (idTipoRol, tipoRol, descripcionRol)
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

-- Rol (10 registros)
INSERT INTO
    Rol (idRol, idTipoRol)
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

-- Usuario (10 registros)
INSERT INTO
    Usuario (nombreUsuario, contrasena, idRol)
VALUES
    ('juanp', 'password123', 2),
    ('mariag', 'pass456', 1),
    ('carlosl', 'abc123', 3),
    ('lauraf', '123456', 4),
    ('anamtz', 'qwerty', 5),
    ('luisrd', 'asdfgh', 6),
    ('sofiag', 'zxcvbn', 7),
    ('diegos', 'password', 8),
    ('luciav', 'letmein', 9),
    ('pedrom', 'admin', 10);

-- Cliente (10 registros)
INSERT INTO
    Cliente (idCliente, email, telefono, idPersona)
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

-- EncargadoPicker (10 registros)
INSERT INTO
    EncargadoPicker (legajo, idPersona)
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

-- Stock (10 registros)
INSERT INTO
    Stock (idStock, codigoIndumentaria)
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

-- EncargadoPicker_Stock (10 registros)
INSERT INTO
    EncargadoPicker_Stock (legajo, idStock)
VALUES
    ('LP001', 'STK001'),
    ('LP002', 'STK002');