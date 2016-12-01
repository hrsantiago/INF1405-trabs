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
  audibleNoise: function() {
    return this.hasOne(AudibleNoise);
  },
  magneticField: function() {
    return this.hasOne(MagneticField);
  }
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
  },
  bundle: function() {
    return this.belongsTo(Bundle);
  },
});

var ShieldWire = bookshelf.Model.extend({
  tableName: 'shield_wire_type',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  },
  bundle: function() {
    return this.belongsTo(Bundle);
  },
});

var Bundle = bookshelf.Model.extend({
  tableName: 'bundle',
  cables: function() {
    return this.hasMany(Cable);
  },
});

var Structure = bookshelf.Model.extend({
  tableName: 'structure',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  }
});

var Cable = bookshelf.Model.extend({
  tableName: 'cable',
  bundle: function() {
    return this.belongsTo(Bundle);
  },
  cableType: function() {
    return this.hasOne(CableType);
  }
});

var CableType = bookshelf.Model.extend({
  tableName: 'cable_type',
  owner: function() {
    return this.belongsTo(User);
  }
});

var AudibleNoise = bookshelf.Model.extend({
  tableName: 'audible_noise',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  },
  profile: function() {
    return this.belongsTo(Profile);
  }
});

var MagneticField = bookshelf.Model.extend({
  tableName: 'magnetic_field',
  transmissionLine: function() {
    return this.belongsTo(TransmissionLine);
  },
  profile: function() {
    return this.belongsTo(Profile);
  }
});

var Profile = bookshelf.Model.extend({
  tableName: 'profile',
});

module.exports = {
  User: User,
  Project: Project,
  TransmissionLine: TransmissionLine,
  Circuit: Circuit,
  Phase: Phase,
  ShieldWire: ShieldWire,
  Bundle: Bundle,
  Structure: Structure,
  Cable: Cable,
  CableType: CableType,
  AudibleNoise: AudibleNoise,
  MagneticField: MagneticField,
  Profile: Profile,
};
