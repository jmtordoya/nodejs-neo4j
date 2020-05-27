const express = require('express');
const morgan = require('morgan');
const path = require('path');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const pdf = require('pdf-parse');

//Conexion to database
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('dan', 'dan123'));
const session = driver.session();

//Initializations
const app = express()

//Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

//Middlewars
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());

//Public
app.use('/public', express.static(path.join(__dirname, 'public')));

//Routes

//METODO DE PRUEBA PARA CONEXION CON NEO4J
app.get('/api', function (req, res) {
    var nombre;
    session
        .run('MATCH(a:student) RETURN a LIMIT 25')
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                nombre = record._fields[0].properties;
            });
            res.send("Nombre: " + nombre['name']);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        });
});

//METODO PARA INSERTAR EN NEO4J
app.post('/api/add', function (req, res) {
    var estudiante = req.body.estudiante;
    session
        .run("create(c:student{name:$nombreParam})", {
            nombreParam: estudiante
        })
        .then(function (result) {
            res.redirect('/api');
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        });
});

//METODO PARA RELACIONAR EN NEO4J
app.post('/api/addRelation', function (req, res) {
    var estudiante = req.body.estudiante;
    var grupo = req.body.grupo;
    session
        .run("MATCH(n:student{name:$nombreParam}),(b:group{name:$grupoParam}) MERGE (n)-[r:belongsTo]->(b) return n, r, b", {
            nombreParam: estudiante,
            grupoParam: grupo
        })
        .then(function (result) {
            res.redirect('/api');
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        });
});

var parametro = [];



function comprobarKeywords(key, count) { //-------aqui recibo una palabra que pasa en el foreach

    const session3 = driver.session();
    var test = ''; //-------POR DEFECTO VACIO PARA VALIDAR LUEGO SI EXISTE LA PALABRA CONSULTADA
    session3
        .run("MATCH (a:keyword) where a.word = $llave return a.word AS key", {
            llave: key
        })
        .subscribe({
            onKeys: keys => {
                // console.log(keys)
            },
            onNext: record =>{
                
                test = record.get('key') //-------GUARDO EL VALOR RETORNADO DE LA CONSULTA EN test QUE EN ESTE CASO ES LA PALABRA CONSULTADA
                
                // console.log(p)
            },
            onCompleted:() =>{
                
                if(test != ''){
                    console.log('si hay la palabra')
                    return true
                }else{
                    const session4 = driver.session();
                    console.log('no hay')
                    session4
                        .run("MATCH (a:document {autoConst:'0266/2019-RCA'}) create(b:keyword{word:$keyParam})-[r:key {peso:$countParam}]->(a) RETURN a.autoConst AS autoConstitucional, r.peso As peso, b.word AS word", {
                            keyParam: key,
                            countParam: count
                        })
                        .subscribe({
                            onKeys: keys => {
                                // console.log(keys)
                            },
                            onNext: record => {
                                // console.log(record.get('autoConstitucional'), record.get('peso'), record.get('word')) //valor
                            },
                            onCompleted: () => {
                                session4.close() // returns a Promise
                            },
                            onError: error => {
                                console.log(error)
                            }
                        })
                        return true
                }
                
                session3.close() 
            },
            onError: error => {
                console.log(error)

            }
        })
        
}


app.get('/api/v1/pdf', (req, res) => {
    var document;
    var keys = [];
    let dataBuffer = fs.readFileSync('src/public/files/puebaJurisprudencia.pdf');
    pdf(dataBuffer).then(function (data) {
            var fullDocument = data.text;
            document = fullDocument;
            var documentLower = fullDocument.toLowerCase();

            //Desde aqui cuenta palabras repetidas y quita puntos comas y saltos de linea
            var diccionario=['para', 'donde']
            var documentSplit = documentLower.split(' ').filter(counter => counter.length > 3);
        
            for (let j = 0; j < diccionario.length; j++) { //donde
                for (let index = 0; index < documentSplit.length; index++) {//s
                            //donde                  //donde
                    if (documentSplit[index] == diccionario[j]) {
                        documentSplit.splice(index, 1);
                    }            
                    
                }
            }

            var count = {};

            
            documentSplit.forEach(function (i) {
                var clave = i.replace('\n', '').replace('.', '').replace(',', '').replace(':', '');
                count[clave] = (count[i] || 0) + 1;
            });
            for (key in count) {
                if (count[key] >= 3) {
                    keys.push({
                        key: key,
                        count: count[key]
                    });
                }
            }

            //Creando nodo de documento

            session
                .run("create(a:document{autoConst:'0266/2019-RCA', text:$documentParam}) RETURN a.autoConst AS autoConstitucional, a.text AS texto", {
                    documentParam: document //-------PARAMETROS PARA LA CONSULTA
                })
                .subscribe({
                    onKeys: keys => {
                        console.log(keys) //-------IMPRIME EL NOMBRE DE LAS 'COLUMNAS' DECLARADAS EN EL RETURN DE LA CONSULTA
                    },
                    onNext: record => {
                        console.log(record.get('autoConstitucional')) //-------IMPRIME EL VALOR INSERTADO O CONSULTADO, ESTO NO SE EJECUTA SI LA CONSULTA NO DEVUELVE O INSERTA ALGO
                    },
                    onCompleted: () =>{ //-------SE EJECUTA AL TERMINAR LA CONSULTA
                        keys.forEach(async function (i) {
                            var key = i.key;
                            var count = i.count;

                            await comprobarKeywords('para', '5')
                            
                           

                        })
                        session.close() // returns a Promise
                        res.json({
                            message: 'Documento Registrado'
                        })

                    },
                    onError: error => {
                        console.log(error)
                        res.json({
                            ErrorMessage: error + ''
                        })
                    }
                })

    
        })
        .catch(function (error) {
            console.log(error)
        })


});

//Starting server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});