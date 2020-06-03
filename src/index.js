const express = require('express');
const morgan = require('morgan');
const os = require('os');
const path = require('path');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const pdf = require('pdf-parse');

//Conexion to database
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('dan', '123'));
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
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.json());

//Public
app.use('/public', express.static(path.join(__dirname, 'public')));

//Routes

//METODO DE PRUEBA PARA CONEXION CON NEO4J


function comprobarKeywords(autoConstitucional, key, count) {
    const session3 = driver.session();
    var test = ''; //-------POR DEFECTO VACIO PARA VALIDAR LUEGO SI EXISTE LA PALABRA CONSULTADA
    session3
        .run("MATCH (a:keyword) where a.word = $keyParam return a.word AS key", {
            keyParam: key
        })
        .subscribe({
            onKeys: keys => {
                // console.log(keys)
            },
            onNext: record => {

                test = record.get('key') //-------GUARDO EL VALOR RETORNADO DE LA CONSULTA EN test QUE EN ESTE CASO ES LA PALABRA CONSULTADA

                // console.log(p)
            },
            onCompleted: () => {

                if (test != '') {
                    console.log("si existe");
                    const session2 = driver.session();
                    session2
                        .run("MATCH (a:document {autoConst:$autoConstParam}),(b:keyword{word:$keyParam}) merge(a)<-[r:key {peso:$countParam}]-(b) RETURN a, r, b", {
                            autoConstParam: autoConstitucional,
                            keyParam: key,
                            countParam: count
                        })
                        .subscribe({
                            onCompleted: () => {
                                session2.close()
                            },
                            onError: error => {
                                console.log(error)
                            }
                        })
                    return true;
                } else {
                    console.log("No existe");
                    const session2 = driver.session();
                    session2
                        .run("MATCH (a:document {autoConst:$autoConstParam}) merge(b:keyword{word:$keyParam})-[r:key {peso:$countParam}]->(a) RETURN a, r, b", {
                            autoConstParam: autoConstitucional,
                            keyParam: key,
                            countParam: count
                        })
                        .subscribe({
                            onCompleted: () => {
                                session2.close()
                            },
                            onError: error => {
                                console.log(error)
                            }
                        })
                    return true;
                }
                session3.close()
            },
            onError: error => {
                console.log(error)

            }
        })

}
app.get('/api/v1/delvolver',(req,res)=>{
    const session2 = driver.session();
    var test=[];
    session2
        .run("MATCH (a:document) RETURN a as documento")
        .subscribe({
            onNext: record => {
                // test = record.get('documento')
                test.push(record.get('documento'))
            },
            onCompleted: () => {
                res.json(test)
                console.log(test)
                session2.close()
            },
            onError: error => {
                console.log(error)
            }
        })
})

app.get('/api/v1/pdf', (req, res) => {
    var rutaCivilAuto1 = 'src/public/files/civil/autoInterlocutorio/jurisprudencia.pdf';
    var rutaCivilAuto2 = 'src/public/files/civil/autoInterlocutorio/jurisprudencia2.pdf';
    var rutaCivilSen1 = 'src/public/files/civil/sentencia/jurisprudencia.pdf';
    var rutaCivilSen2 = 'src/public/files/civil/sentencia/jurisprudencia2.pdf';
    var rutaPenalActa1 = 'src/public/files/penal/actaConciliacion/jurisprudencia.pdf';
    var rutaPenalActa2 = 'src/public/files/penal/actaConciliacion/jurisprudencia2.pdf';
    var rutaPenalDes1 = 'src/public/files/penal/desestimiento/jurisprudencia.pdf';
    var rutaPenalDes2 = 'src/public/files/penal/desestimiento/jurisprudencia2.pdf';
    var document;
    var autoConstitucional;
    var keys = [];
    let dataBuffer = fs.readFileSync(rutaPenalDes2);
    pdf(dataBuffer).then(function (data) {
        var fullDocument = data.text;
        document = fullDocument;
        console.log(document)
        var documentLower = fullDocument.toLowerCase();
        var documentSplit = documentLower.split(' ');
        
        //Desde aqui cuenta palabras repetidas y quita puntos comas y saltos de linea
        
        var diccionario = ['para','donde','como','desde','mismo','puede','cual','partir','debe','dentro','parte','fecha','sido','este','pues','haber','sobre','sería','esta','bien','todo','forma','estas','todos','todas','cuales','fechas','partes','estos','bajo','debió','debería','falta','días','tiene','tienes','misma','dicha']
        var documentSplit2 = documentLower.split(' ').filter(counter => counter.length > 3);
        var texto = documentLower,
            separadores = [' ','\n'],
            documentSplitFINAL = texto.split (new RegExp (separadores.join('|'),'g')).filter(counter => counter.length > 3);

        for (let j = 0; j < diccionario.length; j++) {
            for (let l = 0; l < documentSplitFINAL.length; l++) {
                if(diccionario[j] == documentSplitFINAL[l]){
                    documentSplitFINAL.splice(l,1)
                }
            }
        }
        var count = {};
        documentSplitFINAL.forEach(function (i) {
            var clave = i.replace('.', '').replace(',', '').replace(':', '').replace(';', '').split(' ');
            count[clave] = (count[i] || 0) + 1;
        }); 
        for (key in count) {
            // console.log(count)
            if (count[key] >= 3) {
                keys.push({
                    key: key,
                    count: count[key]
                });
            }
        }
        // console.log(keys)
        autoConstitucional = rutaPenalDes2;
        //Creando nodo de documento 
        session
            .run("Match (b:resolucion{name:'desestimiento'}), (c:materia{name:'penal'}) merge(c)<-[:pertenece]-(a:document{autoConst:$autoConstParam, text:$documentParam})-[:termino]->(b) RETURN a.autoConst AS autoConstitucional, a.text AS texto", {
                documentParam: document,
                autoConstParam: autoConstitucional
            })
            .subscribe({
                onKeys: keys => {
                    console.log(keys) //-------IMPRIME EL NOMBRE DE LAS 'COLUMNAS' DECLARADAS EN EL RETURN DE LA CONSULTA
                },
                onNext: record => {
                    console.log(record.get('autoConstitucional')) //-------IMPRIME EL VALOR INSERTADO O CONSULTADO, ESTO NO SE EJECUTA SI LA CONSULTA NO DEVUELVE O INSERTA ALGO
                },
                onCompleted: () => { //-------SE EJECUTA AL TERMINAR LA CONSULTA
                    keys.forEach(async function (i) {
                        var key = i.key;
                        var count = i.count;
                        await comprobarKeywords(autoConstitucional, key, count);
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