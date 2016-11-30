var bookshelf = require('./bookshelf');

var User = bookshelf.Model.extend({
  tableName: 'user',
  projects: function() {
    return this.hasMany(Project, 'owner_id');
  },
  cableTypes: function() {
    return this.hasMany(CableType, 'owner_id');
  }
});

var Project = bookshelf.Model.extend({
  tableName: 'project',
  owner: function() {
    return this.belongsTo(User);
  },
  transmissionLines: function() {
    return this.hasMany(TransmissionLine);
  }
});

var TransmissionLine = bookshelf.Model.extend({
  tableName: 'transmission_line',
  owner: function() {
    return this.belongsTo(User, 'owner_id').through(Project);
  },
  project: function() {
    return this.belongsTo(Project);
  },
  circuits: function() {
    return this.hasMany(Circuit);
  },
  shieldWires: function() {
    return this.hasMany(ShieldWire);
  },
  structures: function() {
    return this.hasMany(Structure);
  },
});

var Circuit = bookshelf.Model.extend({
  tableName: 'circuit_type',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  },
  phases: function() {
    return this.hasMany(Phase);
  },
});

var Phase = bookshelf.Model.extend({
  tableName: 'phase',
  circuit: function() {
    return this.belongsTo(Circuit);
  }
});

var ShieldWire = bookshelf.Model.extend({
  tableName: 'shield_wire_type',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  }
});

var Structure = bookshelf.Model.extend({
  tableName: 'structure',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  }
});

var CableType = bookshelf.Model.extend({
  tableName: 'cable_type',
  owner: function() {
    return this.belongsTo(User);
  }
});

module.exports = {
  User: User,
  Project: Project,
  TransmissionLine: TransmissionLine,
  Circuit: Circuit,
  Phase: Phase,
  ShieldWire: ShieldWire,
  Structure: Structure,
  CableType: CableType,
};
