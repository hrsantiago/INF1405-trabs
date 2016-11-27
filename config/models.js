var bookshelf = require('./bookshelf');

var User = bookshelf.Model.extend({
  tableName: 'user',
  projects: function() {
    return this.hasMany(Project);
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
  }
});


module.exports = {
  User: User,
  Project: Project,
  TransmissionLine: TransmissionLine
};
