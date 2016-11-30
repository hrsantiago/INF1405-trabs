DROP TABLE IF EXISTS cable;
DROP TABLE IF EXISTS cable_type;
DROP TABLE IF EXISTS audible_noise;
DROP TABLE IF EXISTS electric_field;
DROP TABLE IF EXISTS magnetic_field;
DROP TABLE IF EXISTS radio_interference;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS document_template;
DROP TABLE IF EXISTS document;
DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS cabling;
DROP TABLE IF EXISTS phase;
DROP TABLE IF EXISTS shield_wire_type;
DROP TABLE IF EXISTS circuit_type;
DROP TABLE IF EXISTS bundle;
DROP TABLE IF EXISTS structure;
DROP TABLE IF EXISTS transmission_line;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS company;

CREATE TABLE company (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER,
  email VARCHAR(80) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY(company_id) REFERENCES company(id)
);

CREATE TABLE project (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  client_id INTEGER,
  designer_id INTEGER,
  description TEXT NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES user(id),
  FOREIGN KEY(client_id) REFERENCES company(id),
  FOREIGN KEY(designer_id) REFERENCES company(id)
);

CREATE TABLE transmission_line (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  frequency REAL NOT NULL DEFAULT 60,
  average_rainfall REAL NOT NULL DEFAULT 10,
  relative_air_density_50 REAL NOT NULL DEFAULT 1,
  relative_air_density_90 REAL NOT NULL DEFAULT 1,
  max_circuits INTEGER NOT NULL DEFAULT 1,
  max_shield_wires INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE
);

CREATE TABLE structure (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  transmission_line_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  utm_x REAL NOT NULL DEFAULT 0,
  utm_y REAL NOT NULL DEFAULT 0,
  utm_zone TEXT NOT NULL DEFAULT "",
  soil_resistivity REAL NOT NULL DEFAULT 1000,
  elevation REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id) ON DELETE CASCADE
);

CREATE TABLE bundle (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0
);

CREATE TABLE circuit_type (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  transmission_line_id INTEGER NOT NULL,
  nominal_voltage REAL NOT NULL DEFAULT 500,
  maximum_voltage REAL NOT NULL DEFAULT 550,
  short_term_current_capacity REAL NOT NULL DEFAULT 3895,
  conductor_surface_factor REAL NOT NULL DEFAULT 0.85,
  conductor_sag REAL NOT NULL DEFAULT 20,
  conductor_short_term_sag REAL NOT NULL DEFAULT 22,
  conductor_long_term_sag REAL NOT NULL DEFAULT 21,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id) ON DELETE CASCADE
);

CREATE TABLE shield_wire_type (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  transmission_line_id INTEGER NOT NULL,
  bundle_id INTEGER,
  sag REAL NOT NULL,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id) ON DELETE CASCADE,
  FOREIGN KEY(bundle_id) REFERENCES bundle(id)
);

CREATE TABLE phase (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  circuit_type_id INTEGER NOT NULL,
  bundle_id INTEGER,
  type INTEGER NOT NULL,
  FOREIGN KEY(circuit_type_id) REFERENCES circuit_type(id) ON DELETE CASCADE,
  FOREIGN KEY(bundle_id) REFERENCES bundle(id)
);

CREATE TABLE cabling (
  first_struture_id INTEGER NOT NULL,
  last_struture_id INTEGER NOT NULL,
  circuit_id INTEGER,
  shield_wire_id INTEGER,
  transmission_line_id INTEGER NOT NULL,
  PRIMARY KEY(first_struture_id, last_struture_id, circuit_id, shield_wire_id),
  FOREIGN KEY(first_struture_id) REFERENCES structure(id),
  FOREIGN KEY(last_struture_id) REFERENCES structure(id),
  FOREIGN KEY(circuit_id) REFERENCES circuit_type(id),
  FOREIGN KEY(shield_wire_id) REFERENCES shield_wire_type(id),
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id)
);

CREATE TABLE cable_type (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  owner_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  stranding TEXT NOT NULL,
  diameter REAL NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE cable (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  bundle_id INTEGER NOT NULL,
  cable_type_id INTEGER NOT NULL,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(bundle_id) REFERENCES bundle(id) ON DELETE CASCADE,
  FOREIGN KEY(cable_type_id) REFERENCES cable_type(id)
);

CREATE TABLE profile (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  initial_x REAL NOT NULL,
  final_x REAL NOT NULL,
  increment_x REAL NOT NULL,
  height REAL NOT NULL
);

CREATE TABLE audible_noise (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE electric_field (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE magnetic_field (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE radio_interference (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE file (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name TEXT NOT NULL,
  data BLOB NOT NULL
);

CREATE TABLE document (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  project_id INTEGER NOT NULL,
  file_id INTEGER,
  designer_number TEXT NOT NULL,
  client_number TEXT NOT NULL,
  designer TEXT NOT NULL,
  developer TEXT NOT NULL,
  checker TEXT NOT NULL,
  approver TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id),
  FOREIGN KEY(file_id) REFERENCES file(id)
);

CREATE TABLE document_template (
  document_id INTEGER NOT NULL,
  file_id INTEGER NOT NULL,
  PRIMARY KEY(document_id, file_id),
  FOREIGN KEY(document_id) REFERENCES document(id),
  FOREIGN KEY(file_id) REFERENCES file(id)
);

-- Triggers

delimiter |
CREATE TRIGGER circuit_type_phases AFTER INSERT ON circuit_type
  FOR EACH ROW
  BEGIN
    INSERT INTO phase (circuit_type_id, type) VALUES (NEW.id, 1);
    INSERT INTO phase (circuit_type_id, type) VALUES (NEW.id, 2);
    INSERT INTO phase (circuit_type_id, type) VALUES (NEW.id, 3);
  END;
|

delimiter |
CREATE TRIGGER phases_bundle BEFORE INSERT ON phase
  FOR EACH ROW
  BEGIN
    INSERT INTO bundle (x, y) VALUES (0, 0);
    SET @lastBundleId = LAST_INSERT_ID();
    SET NEW.bundle_id = @lastBundleId;
  END;
|

delimiter |
CREATE TRIGGER shield_wire_type_bundle BEFORE INSERT ON shield_wire_type
  FOR EACH ROW
  BEGIN
    INSERT INTO bundle (x, y) VALUES (0, 0);
    SET @lastBundleId = LAST_INSERT_ID();
    SET NEW.bundle_id = @lastBundleId;
  END;
|

delimiter |
CREATE TRIGGER bundle_cable AFTER INSERT ON bundle
  FOR EACH ROW
  BEGIN
    INSERT INTO cable (bundle_id, cable_type_id, x, y) VALUES (NEW.id, 1, 0, 0);
  END;
|

-- Default values
INSERT INTO company (name) VALUES ('Fluxo Engenharia');
INSERT INTO company (name) VALUES ('Cymi');

INSERT INTO user (email, password, name) VALUES ('henrique_santiago93@hotmail.com', '123456', 'Henrique Santiago');

INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'CAL 1120 - 993 kCM', 'CAL 1120', '993 kCM', '61', 29.25);
INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'AÇO 1/2"', 'Galvanized steel HS', '1/2"', '7', 12.7);
INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'AÇO 3/8"', 'Galvanized steel EHS', '3/8"', '7', 9.14);
INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'DOTTEREL', 'ACSR', '176.9 kCM', '12/7', 15.42);
INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'OPGW 12,4', 'OPGW', '85 mm²', '9/1', 12.4);
INSERT INTO cable_type (owner_id, code, type, size, stranding, diameter) VALUES (1, 'OPGW 15,6', 'OPGW', '145 mm²', '10', 15.6);

INSERT INTO project (owner_id, name, client_id, designer_id) VALUES (1, 'Projeto Básico Esperanza', 2, 1);
INSERT INTO transmission_line (project_id, name, frequency, average_rainfall, relative_air_density_50, relative_air_density_90, max_circuits, max_shield_wires) 
  VALUES (1, 'LT 500 kV Açu III - João Câmara III', 60, 10, 0.9, 0.9, 1, 2);

INSERT INTO circuit_type (transmission_line_id, nominal_voltage, maximum_voltage, short_term_current_capacity, conductor_surface_factor, conductor_sag, conductor_short_term_sag, conductor_long_term_sag)
  VALUES(1, 500, 550, 3895, 0.85, 20.24, 21.20, 20.83);

UPDATE bundle SET x = -7, y = 32.43 WHERE id = 1;
UPDATE bundle SET x = 0, y = 31.13 WHERE id = 2;
UPDATE bundle SET x = 7, y = 32.43 WHERE id = 3;

INSERT INTO shield_wire_type (transmission_line_id, sag) VALUES(1, 16.19);
UPDATE bundle SET x = -14.9, y = 40.40 WHERE id = 4;
INSERT INTO shield_wire_type (transmission_line_id, sag) VALUES(1, 16.19);
UPDATE bundle SET x = 14.9, y = 40.40 WHERE id = 5;

INSERT INTO structure (transmission_line_id, name, utm_x, utm_y) VALUES (1, 'PORT_AÇU', 0, 0);
INSERT INTO structure (transmission_line_id, name, utm_x, utm_y) VALUES (1, 'PORT_JCA', 1000, 0);

INSERT INTO project (owner_id, name, client_id, designer_id) VALUES (1, 'Projeto Básico Teste (hrs)', 2, 1);
INSERT INTO transmission_line (project_id, name, frequency, average_rainfall, relative_air_density_50, relative_air_density_90, max_circuits, max_shield_wires) 
  VALUES (2, 'LT 500 kV SE I - SE II', 60, 10, 0.9, 0.9, 1, 2);

INSERT INTO user (email, password, name) VALUES ('teste@hotmail.com', '123456', 'Teste');

INSERT INTO project (owner_id, name, client_id, designer_id) VALUES (2, 'Projeto Básico Teste', 2, 1);
INSERT INTO transmission_line (project_id, name, frequency, average_rainfall, relative_air_density_50, relative_air_density_90, max_circuits, max_shield_wires) 
  VALUES (3, 'LT 500 kV SE I - SE II', 60, 10, 0.9, 0.9, 1, 2);
