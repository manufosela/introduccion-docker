const express = require('express');
const app = express();
const mongodb = require('mongodb');

const config = {
  DB: 'mongodb://mongo:27017'
};

const PORT = 3000;
const client = mongodb.MongoClient;

var dbo;

client.connect(config.DB, function(err, db) {
    if(err) {
        console.log('database is not connected')
    }
    else {
        console.log('connected!!');
        dbo = db.db("midb");
    }
});

app.get('/', function(req, res) {
    res.json({"hello": "express with mongo"});
});

app.get('/misdatos', function(req, res){
    let data = dbo.collection("micoleccion").find({}).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
      });
});

app.listen(PORT, function(){
    console.log('Your node js server is running on PORT:',PORT);
});
