SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS Fixture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Fixture;

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Fases (
    id_fase INT AUTO_INCREMENT PRIMARY KEY,
    nombre_fase VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Grupos (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_grupo CHAR(1) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_equipo VARCHAR(50) NOT NULL UNIQUE,
    bandera_url VARCHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Equipos_Grupos (
    id_equipo INT NOT NULL,
    id_grupo INT NOT NULL,
    PRIMARY KEY (id_equipo, id_grupo),
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo) ON DELETE CASCADE,
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo) ON DELETE CASCADE
);

CREATE TABLE Estadios (
    id_estadio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estadio VARCHAR(100) NOT NULL UNIQUE,
    ciudad VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partidos: ahora dueño del resultado REAL (único por partido, no por usuario)
CREATE TABLE Partidos (
    id_partido INT AUTO_INCREMENT PRIMARY KEY,
    numero_partido INT NOT NULL UNIQUE,
    id_fase INT NOT NULL,
    id_grupo INT NULL,
    fecha_hora DATETIME NULL,
    id_estadio INT NULL,

    id_equipo_1_fijo INT NULL,
    id_equipo_2_fijo INT NULL,

    goles_real_1 INT NULL,
    goles_real_2 INT NULL,
    id_ganador_penales_real INT NULL,
    estado_api VARCHAR(20) NULL, -- SCHEDULED, FINISHED, etc (de la API)

    pasa_al_partido_ganador INT NULL,
    posicion_en_siguiente_ganador INT NULL,

    pasa_al_partido_perdedor INT NULL,
    posicion_en_siguiente_perdedor INT NULL,
    api_fixture_id INT NULL UNIQUE,

    FOREIGN KEY (id_fase) REFERENCES Fases(id_fase),
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo),
    FOREIGN KEY (id_estadio) REFERENCES Estadios(id_estadio),
    FOREIGN KEY (id_equipo_1_fijo) REFERENCES Equipos(id_equipo),
    FOREIGN KEY (id_equipo_2_fijo) REFERENCES Equipos(id_equipo),
    FOREIGN KEY (id_ganador_penales_real) REFERENCES Equipos(id_equipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partidos_Usuarios: ahora SOLO pronóstico + puntos. Sin id_equipo_real propio.
CREATE TABLE Partidos_Usuarios (
    id_partido_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_partido INT NOT NULL,

    goles_equipo_1 INT NULL DEFAULT NULL,
    goles_equipo_2 INT NULL DEFAULT NULL,
    id_ganador_penales INT NULL, -- pronóstico de penales del usuario
    puntos TINYINT NOT NULL DEFAULT 0,

    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_partido) REFERENCES Partidos(id_partido),
    FOREIGN KEY (id_ganador_penales) REFERENCES Equipos(id_equipo),
    UNIQUE KEY usuario_partido_unico (id_usuario, id_partido)
);

-- Tabla de posiciones REAL por grupo (una sola, no por usuario)
CREATE TABLE Posiciones_Grupo_Real (
    id_posicion INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    id_equipo INT NOT NULL,
    puntos INT NOT NULL DEFAULT 0,
    goles_favor INT NOT NULL DEFAULT 0,
    goles_contra INT NOT NULL DEFAULT 0,
    diferencia_goles INT NOT NULL DEFAULT 0,

    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo),
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo),
    UNIQUE KEY grupo_equipo_unico (id_grupo, id_equipo)
);

-- Tabla de posiciones de PRONÓSTICO por usuario (para mostrarle su propia tabla si predijo todo el grupo)
CREATE TABLE Posiciones_Grupo_Usuario (
    id_posicion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_grupo INT NOT NULL,
    id_equipo INT NOT NULL,
    puntos INT NOT NULL DEFAULT 0,
    goles_favor INT NOT NULL DEFAULT 0,
    goles_contra INT NOT NULL DEFAULT 0,
    diferencia_goles INT NOT NULL DEFAULT 0,

    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo),
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo),
    UNIQUE KEY usuario_grupo_equipo_unico (id_usuario, id_grupo, id_equipo)
);

CREATE TABLE Push_Tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Fixture_Resultados_Cache (
    id_cache INT AUTO_INCREMENT PRIMARY KEY,
    datos_json LONGTEXT NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_partidos_usuarios_busqueda ON Partidos_Usuarios(id_usuario, id_partido);
CREATE INDEX idx_posiciones_usuario_grupo_new ON Posiciones_Grupo_Usuario(id_usuario, id_grupo);
CREATE INDEX idx_posiciones_real_grupo ON Posiciones_Grupo_Real(id_grupo);
CREATE INDEX idx_partidos_mapa_destino ON Partidos(pasa_al_partido_ganador);
CREATE INDEX idx_equipos_grupos_grupo ON Equipos_Grupos(id_grupo);

-- ============================================================================
-- Datos estáticos (fases, grupos, equipos, estadios, partidos, api_fixture_id)
-- ============================================================================

INSERT INTO Fases (nombre_fase) VALUES
('Fase de Grupos'),('Dieciseisavos de Final'),('Octavos de Final'),
('Cuartos de Final'),('Semifinales'),('Tercer Puesto'),('Final');

INSERT INTO Grupos (nombre_grupo) VALUES
('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L');

INSERT INTO Equipos (nombre_equipo, bandera_url) VALUES
('México','MX'),('Sudáfrica','ZA'),('Corea del Sur','KR'),('Chequia','CZ'),
('Canadá','CA'),('Bosnia y Herzegovina','BA'),('Qatar','QA'),('Suiza','CH'),
('Brasil','BR'),('Marruecos','MA'),('Haití','HT'),('Escocia','GB-SCT'),
('Estados Unidos','US'),('Paraguay','PY'),('Australia','AU'),('Turquía','TR'),
('Alemania','DE'),('Curazao','CW'),('Costa de Marfil','CI'),('Ecuador','EC'),
('Países Bajos','NL'),('Japón','JP'),('Suecia','SE'),('Túnez','TN'),
('Bélgica','BE'),('Egipto','EG'),('Irán','IR'),('Nueva Zelanda','NZ'),
('España','ES'),('Cabo Verde','CV'),('Arabia Saudita','SA'),('Uruguay','UY'),
('Francia','FR'),('Senegal','SN'),('Irak','IQ'),('Noruega','NO'),
('Argentina','AR'),('Argelia','DZ'),('Austria','AT'),('Jordania','JO'),
('Portugal','PT'),('República Democrática del Congo','CD'),('Uzbekistán','UZ'),('Colombia','CO'),
('Inglaterra','GB-ENG'),('Croacia','HR'),('Ghana','GH'),('Panamá','PA');

INSERT INTO Equipos_Grupos (id_equipo, id_grupo) VALUES
(1,1),(2,1),(3,1),(4,1),(5,2),(6,2),(7,2),(8,2),(9,3),(10,3),(11,3),(12,3),
(13,4),(14,4),(15,4),(16,4),(17,5),(18,5),(19,5),(20,5),(21,6),(22,6),(23,6),(24,6),
(25,7),(26,7),(27,7),(28,7),(29,8),(30,8),(31,8),(32,8),(33,9),(34,9),(35,9),(36,9),
(37,10),(38,10),(39,10),(40,10),(41,11),(42,11),(43,11),(44,11),(45,12),(46,12),(47,12),(48,12);

INSERT INTO Estadios (nombre_estadio, ciudad) VALUES
('Estadio Ciudad de México','Ciudad de México'),('Estadio Guadalajara','Guadalajara'),
('Estadio Toronto','Toronto'),('Estadio Los Ángeles','Los Ángeles'),
('Estadio Bahía de San Francisco','San Francisco'),('Estadio Nueva York Nueva Jersey','Nueva York'),
('Estadio Boston','Boston'),('Estadio BC Place Vancouver','Vancouver'),
('Estadio Houston','Houston'),('Estadio Dallas','Dallas'),('Estadio Filadelfia','Filadelfia'),
('Estadio Monterrey','Monterrey'),('Estadio Atlanta','Atlanta'),('Estadio Seattle','Seattle'),
('Estadio Miami','Miami'),('Estadio Kansas City','Kansas City');

INSERT INTO Partidos (numero_partido, id_fase, id_grupo, fecha_hora, id_estadio, id_equipo_1_fijo, id_equipo_2_fijo) VALUES
(1,1,1,'2026-06-11 16:00:00',1,1,2),(2,1,1,'2026-06-11 23:00:00',2,3,4),
(3,1,2,'2026-06-12 16:00:00',3,5,6),(4,1,4,'2026-06-12 22:00:00',4,13,14),
(5,1,2,'2026-06-13 16:00:00',5,7,8),(6,1,3,'2026-06-13 19:00:00',6,9,10),
(7,1,3,'2026-06-13 22:00:00',7,11,12),(8,1,4,'2026-06-14 01:00:00',8,15,16),
(9,1,5,'2026-06-14 14:00:00',9,17,18),(10,1,6,'2026-06-14 17:00:00',10,21,22),
(11,1,5,'2026-06-14 20:00:00',11,19,20),(12,1,6,'2026-06-14 23:00:00',12,23,24),
(13,1,8,'2026-06-15 13:00:00',13,29,30),(14,1,7,'2026-06-15 16:00:00',14,25,26),
(15,1,8,'2026-06-15 19:00:00',15,31,32),(16,1,7,'2026-06-15 22:00:00',4,27,28),
(17,1,9,'2026-06-16 16:00:00',6,33,34),(18,1,9,'2026-06-16 19:00:00',7,35,36),
(19,1,10,'2026-06-16 22:00:00',16,37,38),(20,1,10,'2026-06-17 01:00:00',5,39,40),
(21,1,11,'2026-06-17 14:00:00',9,41,42),(22,1,12,'2026-06-17 17:00:00',10,45,46),
(23,1,12,'2026-06-17 20:00:00',3,47,48),(24,1,11,'2026-06-17 23:00:00',1,43,44),
(25,1,1,'2026-06-18 13:00:00',13,4,2),(26,1,2,'2026-06-18 16:00:00',4,8,6),
(27,1,2,'2026-06-18 19:00:00',8,5,7),(28,1,1,'2026-06-18 22:00:00',2,1,3),
(29,1,4,'2026-06-19 16:00:00',14,13,15),(30,1,3,'2026-06-19 19:00:00',7,12,10),
(31,1,3,'2026-06-19 22:00:00',11,9,11),(32,1,4,'2026-06-20 01:00:00',5,16,14),
(33,1,6,'2026-06-20 13:00:00',9,21,23),(34,1,5,'2026-06-20 17:00:00',3,17,19),
(35,1,5,'2026-06-20 23:00:00',16,20,18),(36,1,6,'2026-06-21 01:00:00',12,24,22),
(37,1,8,'2026-06-21 13:00:00',13,29,31),(38,1,7,'2026-06-21 16:00:00',4,25,27),
(39,1,8,'2026-06-21 19:00:00',15,32,30),(40,1,7,'2026-06-21 22:00:00',8,28,26),
(41,1,10,'2026-06-22 14:00:00',10,37,39),(42,1,9,'2026-06-22 18:00:00',11,33,35),
(43,1,9,'2026-06-22 21:00:00',6,36,34),(44,1,10,'2026-06-23 00:00:00',5,40,38),
(45,1,11,'2026-06-23 14:00:00',9,41,43),(46,1,12,'2026-06-23 17:00:00',7,45,47),
(47,1,12,'2026-06-23 20:00:00',3,48,46),(48,1,11,'2026-06-23 23:00:00',2,44,42),
(49,1,2,'2026-06-24 16:00:00',8,8,5),(50,1,2,'2026-06-24 16:00:00',14,6,7),
(51,1,3,'2026-06-24 17:00:00',15,12,9),(52,1,3,'2026-06-24 17:00:00',13,10,11),
(53,1,1,'2026-06-24 22:00:00',1,4,1),(54,1,1,'2026-06-24 22:00:00',12,2,3),
(55,1,5,'2026-06-25 17:00:00',11,18,19),(56,1,5,'2026-06-25 17:00:00',6,20,17),
(57,1,6,'2026-06-25 20:00:00',10,22,23),(58,1,6,'2026-06-25 20:00:00',16,24,21),
(59,1,4,'2026-06-25 23:00:00',4,16,13),(60,1,4,'2026-06-25 23:00:00',5,14,15),
(61,1,9,'2026-06-26 16:00:00',7,36,33),(62,1,9,'2026-06-26 16:00:00',3,34,35),
(63,1,8,'2026-06-26 21:00:00',9,30,31),(64,1,8,'2026-06-26 21:00:00',2,32,29),
(65,1,7,'2026-06-27 00:00:00',14,26,27),(66,1,7,'2026-06-27 00:00:00',8,28,25),
(67,1,12,'2026-06-27 18:00:00',6,48,45),(68,1,12,'2026-06-27 18:00:00',11,46,47),
(69,1,11,'2026-06-27 20:30:00',15,44,41),(70,1,11,'2026-06-27 20:30:00',13,42,43),
(71,1,10,'2026-06-27 23:00:00',16,38,39),(72,1,10,'2026-06-27 23:00:00',10,40,37);

-- DIECISEISAVOS (sin id_equipo_fijo: se completan solos con el nuevo job)
INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio, pasa_al_partido_ganador, posicion_en_siguiente_ganador) VALUES
(73,2,'2026-06-28 16:00:00',4,90,1),(74,2,'2026-06-29 17:30:00',7,89,1),
(75,2,'2026-06-29 22:00:00',12,90,2),(76,2,'2026-06-29 14:00:00',9,91,1),
(77,2,'2026-06-30 18:00:00',6,89,2),(78,2,'2026-06-30 14:00:00',10,91,2),
(79,2,'2026-06-30 22:00:00',1,92,1),(80,2,'2026-07-01 13:00:00',13,92,2),
(81,2,'2026-07-01 21:00:00',5,94,1),(82,2,'2026-07-01 17:00:00',14,94,2),
(83,2,'2026-07-02 20:00:00',3,93,1),(84,2,'2026-07-02 16:00:00',4,93,2),
(85,2,'2026-07-02 22:30:00',8,96,1),(86,2,'2026-07-03 19:00:00',15,95,1),
(87,2,'2026-07-03 22:30:00',16,96,2),(88,2,'2026-07-03 15:00:00',10,95,2);

INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio, pasa_al_partido_ganador, posicion_en_siguiente_ganador) VALUES
(89,3,'2026-07-04 18:00:00',11,97,1),(90,3,'2026-07-04 14:00:00',9,97,2),
(91,3,'2026-07-05 17:00:00',6,99,1),(92,3,'2026-07-05 21:00:00',1,99,2),
(93,3,'2026-07-06 16:00:00',10,98,1),(94,3,'2026-07-06 21:00:00',14,98,2),
(95,3,'2026-07-07 13:00:00',13,100,1),(96,3,'2026-07-07 17:00:00',8,100,2);

INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio, pasa_al_partido_ganador, posicion_en_siguiente_ganador) VALUES
(97,4,'2026-07-09 17:00:00',7,101,1),(98,4,'2026-07-10 16:00:00',4,101,2),
(99,4,'2026-07-11 18:00:00',15,102,1),(100,4,'2026-07-11 22:00:00',16,102,2);

INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio, pasa_al_partido_ganador, posicion_en_siguiente_ganador, pasa_al_partido_perdedor, posicion_en_siguiente_perdedor) VALUES
(101,5,'2026-07-14 16:00:00',10,104,1,103,1),
(102,5,'2026-07-15 16:00:00',13,104,2,103,2);

INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio) VALUES
(103,6,'2026-07-18 18:00:00',15);
INSERT INTO Partidos (numero_partido, id_fase, fecha_hora, id_estadio) VALUES
(104,7,'2026-07-19 16:00:00',6);

-- api_fixture_id (versión final ya corregida)
UPDATE Partidos SET api_fixture_id = 537327 WHERE numero_partido = 1;
UPDATE Partidos SET api_fixture_id = 537328 WHERE numero_partido = 2;
UPDATE Partidos SET api_fixture_id = 537333 WHERE numero_partido = 3;
UPDATE Partidos SET api_fixture_id = 537345 WHERE numero_partido = 4;
UPDATE Partidos SET api_fixture_id = 537334 WHERE numero_partido = 5;
UPDATE Partidos SET api_fixture_id = 537339 WHERE numero_partido = 6;
UPDATE Partidos SET api_fixture_id = 537340 WHERE numero_partido = 7;
UPDATE Partidos SET api_fixture_id = 537346 WHERE numero_partido = 8;
UPDATE Partidos SET api_fixture_id = 537351 WHERE numero_partido = 9;
UPDATE Partidos SET api_fixture_id = 537357 WHERE numero_partido = 10;
UPDATE Partidos SET api_fixture_id = 537352 WHERE numero_partido = 11;
UPDATE Partidos SET api_fixture_id = 537358 WHERE numero_partido = 12;
UPDATE Partidos SET api_fixture_id = 537369 WHERE numero_partido = 13;
UPDATE Partidos SET api_fixture_id = 537363 WHERE numero_partido = 14;
UPDATE Partidos SET api_fixture_id = 537370 WHERE numero_partido = 15;
UPDATE Partidos SET api_fixture_id = 537364 WHERE numero_partido = 16;
UPDATE Partidos SET api_fixture_id = 537391 WHERE numero_partido = 17;
UPDATE Partidos SET api_fixture_id = 537392 WHERE numero_partido = 18;
UPDATE Partidos SET api_fixture_id = 537397 WHERE numero_partido = 19;
UPDATE Partidos SET api_fixture_id = 537398 WHERE numero_partido = 20;
UPDATE Partidos SET api_fixture_id = 537403 WHERE numero_partido = 21;
UPDATE Partidos SET api_fixture_id = 537409 WHERE numero_partido = 22;
UPDATE Partidos SET api_fixture_id = 537410 WHERE numero_partido = 23;
UPDATE Partidos SET api_fixture_id = 537404 WHERE numero_partido = 24;
UPDATE Partidos SET api_fixture_id = 537329 WHERE numero_partido = 25;
UPDATE Partidos SET api_fixture_id = 537335 WHERE numero_partido = 26;
UPDATE Partidos SET api_fixture_id = 537336 WHERE numero_partido = 27;
UPDATE Partidos SET api_fixture_id = 537330 WHERE numero_partido = 28;
UPDATE Partidos SET api_fixture_id = 537348 WHERE numero_partido = 29;
UPDATE Partidos SET api_fixture_id = 537342 WHERE numero_partido = 30;
UPDATE Partidos SET api_fixture_id = 537341 WHERE numero_partido = 31;
UPDATE Partidos SET api_fixture_id = 537347 WHERE numero_partido = 32;
UPDATE Partidos SET api_fixture_id = 537359 WHERE numero_partido = 33;
UPDATE Partidos SET api_fixture_id = 537353 WHERE numero_partido = 34;
UPDATE Partidos SET api_fixture_id = 537354 WHERE numero_partido = 35;
UPDATE Partidos SET api_fixture_id = 537360 WHERE numero_partido = 36;
UPDATE Partidos SET api_fixture_id = 537371 WHERE numero_partido = 37;
UPDATE Partidos SET api_fixture_id = 537365 WHERE numero_partido = 38;
UPDATE Partidos SET api_fixture_id = 537372 WHERE numero_partido = 39;
UPDATE Partidos SET api_fixture_id = 537366 WHERE numero_partido = 40;
UPDATE Partidos SET api_fixture_id = 537399 WHERE numero_partido = 41;
UPDATE Partidos SET api_fixture_id = 537393 WHERE numero_partido = 42;
UPDATE Partidos SET api_fixture_id = 537394 WHERE numero_partido = 43;
UPDATE Partidos SET api_fixture_id = 537400 WHERE numero_partido = 44;
UPDATE Partidos SET api_fixture_id = 537405 WHERE numero_partido = 45;
UPDATE Partidos SET api_fixture_id = 537411 WHERE numero_partido = 46;
UPDATE Partidos SET api_fixture_id = 537412 WHERE numero_partido = 47;
UPDATE Partidos SET api_fixture_id = 537406 WHERE numero_partido = 48;
UPDATE Partidos SET api_fixture_id = 537338 WHERE numero_partido = 49;
UPDATE Partidos SET api_fixture_id = 537337 WHERE numero_partido = 50;
UPDATE Partidos SET api_fixture_id = 537344 WHERE numero_partido = 51;
UPDATE Partidos SET api_fixture_id = 537343 WHERE numero_partido = 52;
UPDATE Partidos SET api_fixture_id = 537332 WHERE numero_partido = 53;
UPDATE Partidos SET api_fixture_id = 537331 WHERE numero_partido = 54;
UPDATE Partidos SET api_fixture_id = 537356 WHERE numero_partido = 55;
UPDATE Partidos SET api_fixture_id = 537355 WHERE numero_partido = 56;
UPDATE Partidos SET api_fixture_id = 537362 WHERE numero_partido = 57;
UPDATE Partidos SET api_fixture_id = 537361 WHERE numero_partido = 58;
UPDATE Partidos SET api_fixture_id = 537350 WHERE numero_partido = 59;
UPDATE Partidos SET api_fixture_id = 537349 WHERE numero_partido = 60;
UPDATE Partidos SET api_fixture_id = 537396 WHERE numero_partido = 61;
UPDATE Partidos SET api_fixture_id = 537395 WHERE numero_partido = 62;
UPDATE Partidos SET api_fixture_id = 537374 WHERE numero_partido = 63;
UPDATE Partidos SET api_fixture_id = 537373 WHERE numero_partido = 64;
UPDATE Partidos SET api_fixture_id = 537368 WHERE numero_partido = 65;
UPDATE Partidos SET api_fixture_id = 537367 WHERE numero_partido = 66;
UPDATE Partidos SET api_fixture_id = 537414 WHERE numero_partido = 67;
UPDATE Partidos SET api_fixture_id = 537413 WHERE numero_partido = 68;
UPDATE Partidos SET api_fixture_id = 537408 WHERE numero_partido = 69;
UPDATE Partidos SET api_fixture_id = 537407 WHERE numero_partido = 70;
UPDATE Partidos SET api_fixture_id = 537402 WHERE numero_partido = 71;
UPDATE Partidos SET api_fixture_id = 537401 WHERE numero_partido = 72;
UPDATE Partidos SET api_fixture_id = 537417 WHERE numero_partido = 73;
UPDATE Partidos SET api_fixture_id = 537415 WHERE numero_partido = 74;
UPDATE Partidos SET api_fixture_id = 537418 WHERE numero_partido = 75;
UPDATE Partidos SET api_fixture_id = 537423 WHERE numero_partido = 76;
UPDATE Partidos SET api_fixture_id = 537416 WHERE numero_partido = 77;
UPDATE Partidos SET api_fixture_id = 537424 WHERE numero_partido = 78;
UPDATE Partidos SET api_fixture_id = 537425 WHERE numero_partido = 79;
UPDATE Partidos SET api_fixture_id = 537426 WHERE numero_partido = 80;
UPDATE Partidos SET api_fixture_id = 537421 WHERE numero_partido = 81;
UPDATE Partidos SET api_fixture_id = 537422 WHERE numero_partido = 82;
UPDATE Partidos SET api_fixture_id = 537419 WHERE numero_partido = 83;
UPDATE Partidos SET api_fixture_id = 537420 WHERE numero_partido = 84;
UPDATE Partidos SET api_fixture_id = 537429 WHERE numero_partido = 85;
UPDATE Partidos SET api_fixture_id = 537427 WHERE numero_partido = 86;
UPDATE Partidos SET api_fixture_id = 537430 WHERE numero_partido = 87;
UPDATE Partidos SET api_fixture_id = 537428 WHERE numero_partido = 88;
UPDATE Partidos SET api_fixture_id = 537375 WHERE numero_partido = 89;
UPDATE Partidos SET api_fixture_id = 537376 WHERE numero_partido = 90;
UPDATE Partidos SET api_fixture_id = 537377 WHERE numero_partido = 91;
UPDATE Partidos SET api_fixture_id = 537378 WHERE numero_partido = 92;
UPDATE Partidos SET api_fixture_id = 537379 WHERE numero_partido = 93;
UPDATE Partidos SET api_fixture_id = 537380 WHERE numero_partido = 94;
UPDATE Partidos SET api_fixture_id = 537381 WHERE numero_partido = 95;
UPDATE Partidos SET api_fixture_id = 537382 WHERE numero_partido = 96;
UPDATE Partidos SET api_fixture_id = 537383 WHERE numero_partido = 97;
UPDATE Partidos SET api_fixture_id = 537384 WHERE numero_partido = 98;
UPDATE Partidos SET api_fixture_id = 537385 WHERE numero_partido = 99;
UPDATE Partidos SET api_fixture_id = 537386 WHERE numero_partido = 100;
UPDATE Partidos SET api_fixture_id = 537387 WHERE numero_partido = 101;
UPDATE Partidos SET api_fixture_id = 537388 WHERE numero_partido = 102;
UPDATE Partidos SET api_fixture_id = 537389 WHERE numero_partido = 103;
UPDATE Partidos SET api_fixture_id = 537390 WHERE numero_partido = 104;

-- ============================================================================
-- Stored Procedures
-- ============================================================================

DELIMITER //
CREATE PROCEDURE ObtenerPartidosPorGrupo(IN p_id_usuario INT, IN p_letra_grupo CHAR(1))
BEGIN
    SELECT
        p.id_partido, p.numero_partido, f.nombre_fase, g.nombre_grupo, p.fecha_hora,
        est.nombre_estadio, est.ciudad,
        e1.id_equipo AS id_equipo_1, e1.nombre_equipo AS equipo_1, e1.bandera_url AS bandera_1,
        pu.goles_equipo_1 AS goles_predichos_1,
        e2.id_equipo AS id_equipo_2, e2.nombre_equipo AS equipo_2, e2.bandera_url AS bandera_2,
        pu.goles_equipo_2 AS goles_predichos_2,
        p.goles_real_1, p.goles_real_2
    FROM Partidos p
    INNER JOIN Fases f ON p.id_fase = f.id_fase
    INNER JOIN Grupos g ON p.id_grupo = g.id_grupo
    LEFT JOIN Estadios est ON p.id_estadio = est.id_estadio
    LEFT JOIN Equipos e1 ON p.id_equipo_1_fijo = e1.id_equipo
    LEFT JOIN Equipos e2 ON p.id_equipo_2_fijo = e2.id_equipo
    LEFT JOIN Partidos_Usuarios pu ON pu.id_partido = p.id_partido AND pu.id_usuario = p_id_usuario
    WHERE g.nombre_grupo = p_letra_grupo COLLATE utf8mb4_unicode_ci
    ORDER BY p.numero_partido ASC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerPartidosPlayoffs(IN p_id_usuario INT)
BEGIN
    SELECT
        p.id_partido, p.numero_partido, f.nombre_fase, p.fecha_hora,
        est.nombre_estadio, est.ciudad,
        e1.id_equipo AS id_equipo_1, e1.nombre_equipo AS equipo_1, e1.bandera_url AS bandera_1,
        pu.goles_equipo_1 AS goles_predichos_1,
        e2.id_equipo AS id_equipo_2, e2.nombre_equipo AS equipo_2, e2.bandera_url AS bandera_2,
        pu.goles_equipo_2 AS goles_predichos_2,
        p.goles_real_1, p.goles_real_2, p.id_ganador_penales_real
    FROM Partidos p
    INNER JOIN Fases f ON p.id_fase = f.id_fase
    LEFT JOIN Estadios est ON p.id_estadio = est.id_estadio
    LEFT JOIN Equipos e1 ON p.id_equipo_1_fijo = e1.id_equipo
    LEFT JOIN Equipos e2 ON p.id_equipo_2_fijo = e2.id_equipo
    LEFT JOIN Partidos_Usuarios pu ON pu.id_partido = p.id_partido AND pu.id_usuario = p_id_usuario
    WHERE p.id_grupo IS NULL
    ORDER BY p.numero_partido ASC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerDetallePartido(IN p_id_usuario INT, IN p_id_partido INT)
BEGIN
    SELECT
        p.id_partido, p.numero_partido, f.nombre_fase, p.fecha_hora,
        est.nombre_estadio, est.ciudad,
        e1.id_equipo AS id_equipo_1, e1.nombre_equipo AS equipo_1, e1.bandera_url AS bandera_1,
        pu.goles_equipo_1, pu.goles_equipo_2, pu.id_ganador_penales,
        e2.id_equipo AS id_equipo_2, e2.nombre_equipo AS equipo_2, e2.bandera_url AS bandera_2,
        p.goles_real_1, p.goles_real_2, p.id_ganador_penales_real
    FROM Partidos p
    INNER JOIN Fases f ON p.id_fase = f.id_fase
    LEFT JOIN Estadios est ON p.id_estadio = est.id_estadio
    LEFT JOIN Equipos e1 ON p.id_equipo_1_fijo = e1.id_equipo
    LEFT JOIN Equipos e2 ON p.id_equipo_2_fijo = e2.id_equipo
    LEFT JOIN Partidos_Usuarios pu ON pu.id_partido = p.id_partido AND pu.id_usuario = p_id_usuario
    WHERE p.id_partido = p_id_partido;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerTablaPosiciones(IN p_letra_grupo CHAR(1))
BEGIN
    SELECT e.id_equipo, e.nombre_equipo AS equipo, e.bandera_url AS bandera,
           pg.puntos, pg.goles_favor, pg.goles_contra, pg.diferencia_goles
    FROM Posiciones_Grupo_Real pg
    INNER JOIN Grupos g ON pg.id_grupo = g.id_grupo
    INNER JOIN Equipos e ON pg.id_equipo = e.id_equipo
    WHERE g.nombre_grupo = p_letra_grupo COLLATE utf8mb4_unicode_ci
    ORDER BY pg.puntos DESC, pg.diferencia_goles DESC, pg.goles_favor DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerTablaPosicionesUsuario(IN p_id_usuario INT, IN p_letra_grupo CHAR(1))
BEGIN
    SELECT e.id_equipo, e.nombre_equipo AS equipo, e.bandera_url AS bandera,
           pgu.puntos, pgu.goles_favor, pgu.goles_contra, pgu.diferencia_goles
    FROM Posiciones_Grupo_Usuario pgu
    INNER JOIN Grupos g ON pgu.id_grupo = g.id_grupo
    INNER JOIN Equipos e ON pgu.id_equipo = e.id_equipo
    WHERE pgu.id_usuario = p_id_usuario AND g.nombre_grupo = p_letra_grupo COLLATE utf8mb4_unicode_ci
    ORDER BY pgu.puntos DESC, pgu.diferencia_goles DESC, pgu.goles_favor DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE RegistrarNuevoUsuario(IN p_email VARCHAR(150), IN p_password_hash VARCHAR(255))
BEGIN
    DECLARE v_id_usuario INT;
    INSERT INTO Usuarios (email, password_hash) VALUES (p_email, p_password_hash);
    SET v_id_usuario = LAST_INSERT_ID();

    INSERT INTO Posiciones_Grupo_Usuario (id_usuario, id_grupo, id_equipo, puntos, goles_favor, goles_contra, diferencia_goles)
    SELECT v_id_usuario, id_grupo, id_equipo, 0, 0, 0, 0 FROM Equipos_Grupos;

    INSERT INTO Partidos_Usuarios (id_usuario, id_partido)
    SELECT v_id_usuario, id_partido FROM Partidos;

    SELECT v_id_usuario AS id_usuario_creado;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE IniciarSesionUsuario(IN p_email VARCHAR(150))
BEGIN
    SELECT id_usuario, email, password_hash FROM Usuarios WHERE email = BINARY p_email;
END //
DELIMITER ;

-- Guarda SOLO el pronóstico del usuario y sus puntos de tabla propia en fase de grupos
DELIMITER //
CREATE PROCEDURE GuardarPronostico(
    IN p_id_usuario INT, IN p_id_partido INT,
    IN p_goles_1 INT, IN p_goles_2 INT, IN p_id_ganador_penales INT
)
BEGIN
    DECLARE v_id_grupo INT;
    DECLARE v_id_eq1 INT;
    DECLARE v_id_eq2 INT;

    UPDATE Partidos_Usuarios
    SET goles_equipo_1 = p_goles_1, goles_equipo_2 = p_goles_2, id_ganador_penales = p_id_ganador_penales
    WHERE id_usuario = p_id_usuario AND id_partido = p_id_partido;

    SELECT p.id_grupo, p.id_equipo_1_fijo, p.id_equipo_2_fijo
    INTO v_id_grupo, v_id_eq1, v_id_eq2
    FROM Partidos p WHERE p.id_partido = p_id_partido;

    IF v_id_grupo IS NOT NULL THEN
        CALL ActualizarFilaTablaPosicionesUsuario(p_id_usuario, v_id_grupo, v_id_eq1);
        CALL ActualizarFilaTablaPosicionesUsuario(p_id_usuario, v_id_grupo, v_id_eq2);
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ActualizarFilaTablaPosicionesUsuario(IN p_id_usuario INT, IN p_id_grupo INT, IN p_id_equipo INT)
BEGIN
    DECLARE v_pts INT DEFAULT 0;
    DECLARE v_gf INT DEFAULT 0;
    DECLARE v_gc INT DEFAULT 0;

    SELECT IFNULL(SUM(CASE WHEN pu.goles_equipo_1 > pu.goles_equipo_2 THEN 3 WHEN pu.goles_equipo_1 = pu.goles_equipo_2 THEN 1 ELSE 0 END),0),
           IFNULL(SUM(pu.goles_equipo_1),0), IFNULL(SUM(pu.goles_equipo_2),0)
    INTO v_pts, v_gf, v_gc
    FROM Partidos_Usuarios pu INNER JOIN Partidos p ON pu.id_partido = p.id_partido
    WHERE pu.id_usuario = p_id_usuario AND p.id_equipo_1_fijo = p_id_equipo AND pu.goles_equipo_1 IS NOT NULL;

    SELECT v_pts + IFNULL(SUM(CASE WHEN pu.goles_equipo_2 > pu.goles_equipo_1 THEN 3 WHEN pu.goles_equipo_2 = pu.goles_equipo_1 THEN 1 ELSE 0 END),0),
           v_gf + IFNULL(SUM(pu.goles_equipo_2),0), v_gc + IFNULL(SUM(pu.goles_equipo_1),0)
    INTO v_pts, v_gf, v_gc
    FROM Partidos_Usuarios pu INNER JOIN Partidos p ON pu.id_partido = p.id_partido
    WHERE pu.id_usuario = p_id_usuario AND p.id_equipo_2_fijo = p_id_equipo AND pu.goles_equipo_2 IS NOT NULL;

    UPDATE Posiciones_Grupo_Usuario
    SET puntos = v_pts, goles_favor = v_gf, goles_contra = v_gc, diferencia_goles = (v_gf - v_gc)
    WHERE id_usuario = p_id_usuario AND id_grupo = p_id_grupo AND id_equipo = p_id_equipo;
END //
DELIMITER ;

-- Actualiza tabla REAL de un grupo (llamado por el job)
DELIMITER //
CREATE PROCEDURE ActualizarFilaTablaPosicionesReal(IN p_id_grupo INT, IN p_id_equipo INT)
BEGIN
    DECLARE v_pts INT DEFAULT 0;
    DECLARE v_gf INT DEFAULT 0;
    DECLARE v_gc INT DEFAULT 0;

    SELECT IFNULL(SUM(CASE WHEN goles_real_1 > goles_real_2 THEN 3 WHEN goles_real_1 = goles_real_2 THEN 1 ELSE 0 END),0),
           IFNULL(SUM(goles_real_1),0), IFNULL(SUM(goles_real_2),0)
    INTO v_pts, v_gf, v_gc
    FROM Partidos WHERE id_equipo_1_fijo = p_id_equipo AND goles_real_1 IS NOT NULL AND id_grupo = p_id_grupo;

    SELECT v_pts + IFNULL(SUM(CASE WHEN goles_real_2 > goles_real_1 THEN 3 WHEN goles_real_2 = goles_real_1 THEN 1 ELSE 0 END),0),
           v_gf + IFNULL(SUM(goles_real_2),0), v_gc + IFNULL(SUM(goles_real_1),0)
    INTO v_pts, v_gf, v_gc
    FROM Partidos WHERE id_equipo_2_fijo = p_id_equipo AND goles_real_2 IS NOT NULL AND id_grupo = p_id_grupo;

    INSERT INTO Posiciones_Grupo_Real (id_grupo, id_equipo, puntos, goles_favor, goles_contra, diferencia_goles)
    VALUES (p_id_grupo, p_id_equipo, v_pts, v_gf, v_gc, v_gf - v_gc)
    ON DUPLICATE KEY UPDATE puntos = v_pts, goles_favor = v_gf, goles_contra = v_gc, diferencia_goles = (v_gf - v_gc);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS CalcularPuntosPartido;

DELIMITER //
CREATE PROCEDURE CalcularPuntosPartido(
    IN p_numero_partido INT,
    IN p_goles_reales_1 INT,
    IN p_goles_reales_2 INT,
    IN p_ganador_real CHAR(1),
    IN p_id_ganador_penales_real INT
)
BEGIN
    DECLARE v_id_partido INT;

    SELECT id_partido INTO v_id_partido FROM Partidos WHERE numero_partido = p_numero_partido;

    UPDATE Partidos_Usuarios
    SET puntos = CASE
        WHEN goles_equipo_1 = p_goles_reales_1
             AND goles_equipo_2 = p_goles_reales_2
             AND (
                p_id_ganador_penales_real IS NULL
                OR id_ganador_penales = p_id_ganador_penales_real
             )
        THEN 3

        WHEN (
            (p_ganador_real = 'L' AND goles_equipo_1 > goles_equipo_2) OR
            (p_ganador_real = 'V' AND goles_equipo_2 > goles_equipo_1) OR
            (p_ganador_real = 'E' AND goles_equipo_1 = goles_equipo_2)
        )
        THEN 2

        ELSE 0
    END
    WHERE id_partido = v_id_partido AND goles_equipo_1 IS NOT NULL AND goles_equipo_2 IS NOT NULL;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerPartidosDelDia(IN p_id_usuario INT)
BEGIN
    SELECT
        p.id_partido, p.numero_partido, p.fecha_hora, p.id_grupo,
        g.nombre_grupo AS grupo, f.nombre_fase AS fase,
        es.nombre_estadio AS estadio, es.ciudad,
        e1.id_equipo AS id_equipo_1, e1.nombre_equipo AS equipo_1, e1.bandera_url AS bandera_1,
        e2.id_equipo AS id_equipo_2, e2.nombre_equipo AS equipo_2, e2.bandera_url AS bandera_2
    FROM Partidos p
    LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
    LEFT JOIN Fases f ON p.id_fase = f.id_fase
    LEFT JOIN Estadios es ON p.id_estadio = es.id_estadio
    LEFT JOIN Equipos e1 ON p.id_equipo_1_fijo = e1.id_equipo
    LEFT JOIN Equipos e2 ON p.id_equipo_2_fijo = e2.id_equipo
    WHERE DATE(p.fecha_hora) = CURDATE()
    ORDER BY p.fecha_hora ASC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerFixtureCache()
BEGIN
    SELECT datos_json FROM Fixture_Resultados_Cache ORDER BY id_cache DESC LIMIT 1;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerRankingUsuarios()
BEGIN
    SELECT u.email, COALESCE(SUM(pu.puntos),0) AS total_puntos,
           COUNT(CASE WHEN pu.puntos = 3 THEN 1 END) AS exactos,
           COUNT(CASE WHEN pu.puntos = 2 THEN 1 END) AS ganadores
    FROM Usuarios u LEFT JOIN Partidos_Usuarios pu ON u.id_usuario = pu.id_usuario
    GROUP BY u.id_usuario, u.email
    ORDER BY total_puntos DESC, exactos DESC LIMIT 5;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ObtenerPuntosUsuario(IN p_id_usuario INT)
BEGIN
    SELECT COALESCE(SUM(pu.puntos),0) AS total_puntos,
           COUNT(CASE WHEN pu.puntos = 3 THEN 1 END) AS exactos,
           COUNT(CASE WHEN pu.puntos = 2 THEN 1 END) AS ganadores,
           COUNT(CASE WHEN pu.puntos > 0 THEN 1 END) AS acertados
    FROM Partidos_Usuarios pu WHERE pu.id_usuario = p_id_usuario AND pu.puntos > 0;
END //
DELIMITER ;

-- Mejores terceros REALES: devuelve id_equipo + posición global (1-8) para que el job los mapee
DELIMITER //
CREATE PROCEDURE CalcularMejoresTercerosReal()
BEGIN
    WITH TercerosPorGrupo AS (
        SELECT id_equipo, id_grupo,
            ROW_NUMBER() OVER (PARTITION BY id_grupo ORDER BY puntos DESC, diferencia_goles DESC, goles_favor DESC, id_equipo ASC) AS pos_grupo
        FROM Posiciones_Grupo_Real
    ),
    RankingTerceros AS (
        SELECT tg.id_equipo,
            ROW_NUMBER() OVER (ORDER BY pg.puntos DESC, pg.diferencia_goles DESC, pg.goles_favor DESC, tg.id_equipo ASC) AS pos_global
        FROM TercerosPorGrupo tg
        INNER JOIN Posiciones_Grupo_Real pg ON tg.id_equipo = pg.id_equipo
        WHERE tg.pos_grupo = 3
    )
    SELECT id_equipo, pos_global FROM RankingTerceros WHERE pos_global <= 8;
END //
DELIMITER ;