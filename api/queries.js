const promise = require('bluebird');
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

let PG_CLIENT
pool.connect().then(c => {
    PG_CLIENT = c
})

const AWS = require('aws-sdk')
AWS.config.credentials = new AWS.Credentials('AKIAI5DEYPV66CMM7OOA', '3cN6hgOEeEBeuQsKUoteKHpkQuUbo+Hw4ahxeKnD')
AWS.config.region = 'us-east-1'
const sqs = new AWS.SQS({apiVersion: '2012-11-05'})

/////////////////////
// Query Functions
/////////////////////

function explain(req, res, next) {
    const query = 'EXPLAIN ' + req.query.q;

    PG_CLIENT.query(query)
    .then(function (data) {
        const dbres = data.rows[0]['QUERY PLAN']
        const cost = Math.ceil(parseFloat(dbres.match(/.*cost=.*\.\.([0-9]+\.[0-9]+) rows=.*/)[1]))
        res.status(200)
            .json({
                cost: cost,
            });
    })
    .catch(function (err) {
        res.status(400)
            .json({
                message: 'Bad query'
            });
    });
}

function tx(req, res, next) {
    const txHash = req.body.tx
    const params = {
        MessageBody: txHash,
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/431180689513/ethiqlqueue"
    };

    sqs.sendMessage(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success sent:", data.MessageId, ",", txHash);
        }
    })

    res.status(200)
        .json({
            message: 'Success'
        })
}

/////////////
// Exports
/////////////

module.exports = {
    explain: explain,
    tx: tx
};
