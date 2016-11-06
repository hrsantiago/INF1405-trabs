DROP TABLE IF EXISTS bundle;
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
DROP TABLE IF EXISTS structure;
DROP TABLE IF EXISTS transmission_line;
DROP TABLE IF EXISTS project_revision;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS company;

CREATE TABLE company (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL,
  email VARCHAR(80) NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY(company_id) REFERENCES company(id)
);

CREATE TABLE project (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES user(id)
);

CREATE TABLE project_revision (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  designer_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES project(id),
  FOREIGN KEY(client_id) REFERENCES company(id),
  FOREIGN KEY(designer_id) REFERENCES company(id)
);

CREATE TABLE transmission_line (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  frequency REAL NOT NULL,
  average_rainfall REAL NOT NULL,
  relative_air_density_50 REAL NOT NULL,
  relative_air_density_90 REAL NOT NULL,
  max_circuits INTEGER NOT NULL,
  max_shield_wires INTEGER NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id)
);

CREATE TABLE structure (
  id INTEGER PRIMARY KEY,
  transmission_line_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  utm_x REAL NOT NULL,
  utm_y REAL NOT NULL,
  utm_zone TEXT NOT NULL,
  soil_resistivity REAL NOT NULL,
  elevation REAL NOT NULL,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id)
);

CREATE TABLE circuit_type (
  id INTEGER PRIMARY KEY,
  transmission_line_id INTEGER NOT NULL,
  nominal_voltage REAL NOT NULL,
  maximum_voltage REAL NOT NULL,
  short_term_current_capacity REAL NOT NULL,
  conductor_surface_factor REAL NOT NULL,
  conductor_sag REAL NOT NULL,
  conductor_short_term_sag REAL NOT NULL,
  conductor_long_term_sag REAL NOT NULL,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id)
);

CREATE TABLE shield_wire_type (
  id INTEGER PRIMARY KEY,
  transmission_line_id INTEGER NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  sag REAL NOT NULL,
  FOREIGN KEY(transmission_line_id) REFERENCES transmission_line(id)
);

CREATE TABLE phase (
  id INTEGER PRIMARY KEY,
  circuit_id INTEGER NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  sag REAL NOT NULL,
  FOREIGN KEY(circuit_id) REFERENCES circuit_type(id)
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
  id INTEGER PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  size TEXT NOT NULL,
  stranding TEXT NOT NULL,
  diameter REAL NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES user(id)
);

CREATE TABLE cable (
  id INTEGER PRIMARY KEY,
  type_id INTEGER NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  FOREIGN KEY(type_id) REFERENCES cable_type(id)
);

CREATE TABLE bundle (
  cable_id INTEGER NOT NULL,
  phase_id INTEGER ,
  shield_wire_id INTEGER,
  PRIMARY KEY(cable_id, phase_id, shield_wire_id),
  FOREIGN KEY(cable_id) REFERENCES cable(id),
  FOREIGN KEY(phase_id) REFERENCES phase(id),
  FOREIGN KEY(shield_wire_id) REFERENCES shield_wire_type(id)
);

CREATE TABLE profile (
  id INTEGER PRIMARY KEY,
  initial_x REAL NOT NULL,
  final_x REAL NOT NULL,
  increment_x REAL NOT NULL,
  height REAL NOT NULL
);

CREATE TABLE audible_noise (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id),
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE electric_field (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id),
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE magnetic_field (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id),
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE radio_interference (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  profile_id INTEGER NOT NULL,
  maximum_level_at_border REAL NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id),
  FOREIGN KEY(profile_id) REFERENCES profile(id)
);

CREATE TABLE file (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  data BLOB NOT NULL
);

CREATE TABLE document (
  id INTEGER PRIMARY KEY,
  project_revision_id INTEGER NOT NULL,
  file_id INTEGER,
  designer_number TEXT NOT NULL,
  client_number TEXT NOT NULL,
  designer TEXT NOT NULL,
  developer TEXT NOT NULL,
  checker TEXT NOT NULL,
  approver TEXT NOT NULL,
  FOREIGN KEY(project_revision_id) REFERENCES project_revision(id),
  FOREIGN KEY(file_id) REFERENCES file(id)
);

CREATE TABLE document_template (
  document_id INTEGER NOT NULL,
  file_id INTEGER NOT NULL,
  PRIMARY KEY(document_id, file_id),
  FOREIGN KEY(document_id) REFERENCES document(id),
  FOREIGN KEY(file_id) REFERENCES file(id)
);