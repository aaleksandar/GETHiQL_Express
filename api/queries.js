let promise = require('bluebird');

let options = {
    // Initialization Options
    promiseLib: promise
};

let pgp = require('pg-promise')(options);
let connectionString = 'postgres://gethiql_user:foobar123@localhost:5432/gethiql_db';
let db = pgp(connectionString);
let firebase = require('firebase');
firebase.initializeApp({
    apiKey: "AIzaSyCbvVBA5-oWJxrf2jHVrKgvFAHbVkamLcs",
    authDomain: "ethiql-3d8a6.firebaseapp.com",
    databaseURL: "https://ethiql-3d8a6.firebaseio.com",
    projectId: "ethiql-3d8a6",
    storageBucket: "ethiql-3d8a6.appspot.com",
    messagingSenderId: "324567229823"
})


/////////////////////
// Query Functions
/////////////////////

function sql(req, res, next) {
    let query = req.query.q;

    db.any(query)
    .then(function (data) {
        firebase.database().ref('/queryResult').set(JSON.stringify(data));
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
    let query = 'EXPLAIN ' + req.query.q;

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
