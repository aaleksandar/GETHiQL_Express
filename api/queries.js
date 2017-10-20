let promise = require('bluebird');
const Pool = require('pg-pool')
const pool = new Pool({
    host: 'ethiqldatabase.cle9ykpn9ppr.us-east-1.rds.amazonaws.com',
    database: 'ethiqldatabase',
    user: 'ethiqlusername',
    password: 'SnakeyMalakey123',
    port: 5432,
    max: 1,
    min: 0,
    idleTimeoutMillis: 3000000,
    connectionTimeoutMillis: 10000
});

let Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/I3PO9wZvmFivuxZfKv8E'))
let toAddress = '0x7E753B04BD390D37d26F4B062ddE211785d4DDF1'
let AsyncPolling = require('async-polling')
let child_process = require('child_process')

let PG_CLIENT
pool.connect().then(c => {
  PG_CLIENT = c
})

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

    PG_CLIENT.query(query)
    .then(function (data) {
        firebase.database().ref('/queryResult').set(data.rows);
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

    PG_CLIENT.any(query)
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

function tx(req, res, next) {
    let f = child_process.fork('poll.js', [req.query.tx])
    res.send('foo')
}

/////////////
// Exports
/////////////

module.exports = {
    sql: sql,
    explain: explain,
    tx: tx
};
