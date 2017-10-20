let Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/I3PO9wZvmFivuxZfKv8E'))
let AsyncPolling = require('async-polling')

let firebase = require('firebase');
firebase.initializeApp({
    apiKey: "AIzaSyCbvVBA5-oWJxrf2jHVrKgvFAHbVkamLcs",
    authDomain: "ethiql-3d8a6.firebaseapp.com",
    databaseURL: "https://ethiql-3d8a6.firebaseio.com",
    projectId: "ethiql-3d8a6",
    storageBucket: "ethiql-3d8a6.appspot.com",
    messagingSenderId: "324567229823"
})

var i = 0
let polling = AsyncPolling(function (end) {
    console.log('poll')
    let txn = web3.eth.getTransaction(process.argv[2])
    if (txn || i >= 9) {
        this.stop()
        console.log('stop')
    }
    i++
    end(null, txn);
}, 1000)

polling.on('result', function (txn) {
    let query = web3.toAscii(txn.input)
    let value = txn.value
    let cost = web3.toBigNumber(10) // TODO: get real cost
    if (value.greaterThan(cost)) {
        firebase.database().ref('/queryResult').set(txn).then(f => {
            console.log(query)
            process.exit()
        })
    }
})

polling.run()
