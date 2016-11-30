var mysqlConfig = require('./mysql');

var knex = require('knex')({
  client: 'mysql',
  connection: mysqlConfig
});

var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
