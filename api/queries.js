var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://gethiql_user:foobar123@localhost:5432/gethiql_db';
var db = pgp(connectionString);


/////////////////////
// Query Functions
/////////////////////

function sql(req, res, next) {
  var query = req.query.q;

  db.any(query)
  .then(function (data) {
    res.status(200)
      .json({
        data: data,
      });
  })
  .catch(function (err) {
    console.log(err);
    res.status(400)
      .json({
        message: 'Bad query'
      });
  });
}

function explain(req, res, next) {
  var query = 'EXPLAIN ' + req.query.q;

  db.any(query)
  .then(function (data) {
    let dbres = data[0]['QUERY PLAN']
    let cost = Math.ceil(parseFloat(dbres.match(/.*cost=.*\.\.([0-9]+\.[0-9]+) rows=.*/)[1]))
    res.status(200)
      .json({
        cost: cost,
      });
  })
  .catch(function (err) {
    console.log(err);
    res.status(400)
      .json({
        message: 'Bad query'
      });
  });
}

/////////////
// Exports
/////////////

module.exports = {
    sql: sql,
    explain: explain,
};
