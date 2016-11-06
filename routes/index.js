var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });

  req.getConnection(function(err,connection) {
    connection.query('SELECT * FROM company',[],function(err,result){
      if(err)
        return res.status(400).json(err);
      return res.status(200).json(result);
    });
  });

});

module.exports = router;
