const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/I3PO9wZvmFivuxZfKv8E'))

const firebase = require('firebase');
firebase.initializeApp({
    apiKey: "AIzaSyCbvVBA5-oWJxrf2jHVrKgvFAHbVkamLcs",
    authDomain: "ethiql-3d8a6.firebaseapp.com",
    databaseURL: "https://ethiql-3d8a6.firebaseio.com",
    projectId: "ethiql-3d8a6",
    storageBucket: "ethiql-3d8a6.appspot.com",
    messagingSenderId: "324567229823"
})

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

const sleep = require('sleep')

function processMessage(txHash) {
    let i = 0
    let done = false
    while (!done) {
        console.log('polling infura')
        let txn = web3.eth.getTransaction(txHash)
        if (txn || i >= 19) {
            postData(txn)
            done = true
            console.log('stop')
        }
        i++
        sleep.sleep(1)
    }
}

function postData(txn) {
    const query = web3.toAscii(txn.input)
    console.log(query)
    PG_CLIENT.query(query)
    .then(function (data) {
        firebase.database().ref('/queryResult').set(data.rows)
    })
    .catch(function (err) {
        console.log(err);
    });
}

const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json')

const app = Consumer.create({
queueUrl: 'https://sqs.us-east-1.amazonaws.com/431180689513/ethiqlqueue',
    handleMessage: (message, done) => {
        console.log('consuming from SQS')
        processMessage(message.Body)
        done();
    },
    sqs: new AWS.SQS()
});

app.on('error', (err) => {
    console.log(err.message);
});

app.start();
