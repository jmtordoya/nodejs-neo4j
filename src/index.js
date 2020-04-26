const express = require('express');
const morgan = require('morgan');
const path = require('path');
const neo4j = require('neo4j-driver');

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '1234'));
const session = driver.session();

//Initializations
const app = express();

//Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

//Middlewars
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Public
app.use('/public',express.static(path.join(__dirname, 'public')));

//Routes
app.get('/', function(req, res){
    session
            .run('MATCH(a:student) RETURN a LIMIT 25')
            .then(function(result){
                result.records.forEach(function(record){
                    console.log(record._fields[0].properties);
                    var nombre = record._fields[0].properties;
                    res.send("Nombre: " + nombre['name']);
                });
            })
            .catch(function(err){
                console.log(err);
                res.send(err);
            });
});

//Starting server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});