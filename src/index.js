const express = require('express');
const morgan = require('morgan');
const os = require('os');
const path = require('path');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const pdf = require('pdf-parse');

//Conexion to database
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('jmtordoya', 'jmtordoya'));
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
app.get('/api/v1/resolucion/:resolucion',(req,res)=>{
    const $palabraClave = req.params.resolucion   

    var test=[];

    var indice = 0;
    const session2 = driver.session();
        
    session2
            // .run(`MATCH (d:materia)<-[e:pertenece]-(a:document)<-[b:key]-(c:keyword) where c.word='${$palabraClave}' return a.autoConst as documento, d.name as materia`)
            .run(`match (a:document)-[:pertenece]->(b:materia)
            match (a:document)-[:termino]->(c:resolucion)
            where c.name = '${$palabraClave}'
            return a as documento,b as materia,c as resolucion`)
            // 
            .subscribe({
                onNext: record => {                    
                        test.push({document:record.get('documento').properties.autoConst,text:record.get('documento').properties.text,materia:record.get('materia').properties.name, resolucion:record.get('resolucion').properties.name})                       
                },
                //[1,2,3,4,2,3] b array aux
                onCompleted: () => {
                    console.log(test)
                    res.json(test)
                    session2.close()
                },
                onError: error => {
                    console.log(error)
                }
            })
        
})
app.get('/api/v1/materia/:materia',(req,res)=>{
    const $palabraClave = req.params.materia   

    var test=[];

    var indice = 0;
    const session2 = driver.session();
        
    session2
            // .run(`MATCH (d:materia)<-[e:pertenece]-(a:document)<-[b:key]-(c:keyword) where c.word='${$palabraClave}' return a.autoConst as documento, d.name as materia`)
            .run(`match (a:document)-[:pertenece]->(b:materia)
            match (a:document)-[:termino]->(c:resolucion)
            where b.name = '${$palabraClave}'
            return a as documento,b as materia,c as resolucion`)
            // 
            .subscribe({
                onNext: record => {                    
                        test.push({document:record.get('documento').properties.autoConst,text:record.get('documento').properties.text,materia:record.get('materia').properties.name, resolucion:record.get('resolucion').properties.name})                       
                },
                //[1,2,3,4,2,3] b array aux
                onCompleted: () => {
                    console.log(test)
                    res.json(test)
                    session2.close()
                },
                onError: error => {
                    console.log(error)
                }
            })
        
})
app.get('/api/v1/devolver/:palabraClave',(req,res)=>{
    const $palabraClave = req.params.palabraClave   
    let palabras = $palabraClave.split(',')
    console.log(palabras)
    var test=[];
    // var test={};
    var tess2=[];
    var count = {};
    // var prueba1=['pablo','pedro','pablo','franco','juan','joaquin','daniel','franco','pedro','ismael','daniel','franco','pedro','pedro','joaquin','pablo','pablo','pablo','pablo']
    var prueba1=[1,2,3,4,2,3]
    var prueba2=['juan','joaquin','daniel','pedro','ismael','daniel','pedro','joaquin']
    
    var enviarDatos=[];
    for (let i = 0; i < palabras.length; i++) {
        var indice = 0;
        const session2 = driver.session();
        
        session2
            // .run(`MATCH (d:materia)<-[e:pertenece]-(a:document)<-[b:key]-(c:keyword) where c.word='${$palabraClave}' return a.autoConst as documento, d.name as materia`)
            .run(`match (a:document)-[:pertenece]->(b:materia)
            match (a:document)-[:termino]->(c:resolucion)
            match (a:document)<-[e:key]-(d:keyword)
            where d.word = '${palabras[i]}'
            return d as key, a as documento,b as materia,c as resolucion,id(a) as id order by e.peso desc`)
            // 
            .subscribe({
                onNext: record => {                    
                        test.push({id:record.get('id').low,document:record.get('documento').properties.autoConst,text:record.get('documento').properties.text,materia:record.get('materia').properties.name, resolucion:record.get('resolucion').properties.name,
                        palabras:record.get('key').properties.word
                        })    
                        tess2.push(record.get('id').low)                          
                },
                //[1,2,3,4,2,3] b array aux
                onCompleted: () => {
                    if(i == palabras.length-1){
                        var numero = test.length   
                        console.log(test)               
                            6
                        //[1,2,3,4,3] p array test numero=5
                            
                        for (let l = 0; l < numero; l++) {
                            let contador = 0;
                            // console.log(test[l].id)
                            for (let j = 0; j < numero; j++) {
                                     //2           //2
                                if(test[l].id == test[j].id){
                                    contador++;//2

                                    if(contador > 1){
                                        test.splice(j,1)
                                        // console.log(test)
                                        numero=test.length;
                                        j=0;
                                        l=0;
                                    }
                                }else{
                                   
                                };
                            }; 
                            // if(var==numero) 
                        };
                        console.log(test)
                        res.json(test)
                    }
                    session2.close()
                },
                onError: error => {
                    console.log(error)
                }
            })
        }
})

app.get('/api/v1/pdf', (req, res) => {
    //CIVIL
    var rutaCivil1 = 'src/public/files/civil/actaConciliacion/1.pdf';
    var rutaCivil2 = 'src/public/files/civil/actaConciliacion/2.pdf';
    var rutaCivil3 = 'src/public/files/civil/autoInterlocutorio/3.pdf';
    var rutaCivil4 = 'src/public/files/civil/autoInterlocutorio/4.pdf';
    var rutaCivil5 = 'src/public/files/civil/autosupremos/5.pdf';
    var rutaCivil6 = 'src/public/files/civil/autosupremos/6.pdf';
    var rutaCivil7 = 'src/public/files/civil/desestimiento/7.pdf';
    var rutaCivil8 = 'src/public/files/civil/desestimiento/8.pdf';
    var rutaCivil9 = 'src/public/files/civil/resolucionRechazo/9.pdf';
    var rutaCivil10 = 'src/public/files/civil/resolucionRechazo/10.pdf';
    var rutaCivil11= 'src/public/files/civil/sentencia/11.pdf';
    //COMERCIAL
    var rutaComercial1 = 'src/public/files/comercial/actaConciliacion/1.pdf';
    var rutaComercial2 = 'src/public/files/comercial/actaConciliacion/2.pdf';
    var rutaComercial3 = 'src/public/files/comercial/autoInterlocutorio/3.pdf';
    var rutaComercial4 = 'src/public/files/comercial/autoInterlocutorio/4.pdf';
    var rutaComercial5 = 'src/public/files/comercial/autosupremos/5.pdf';
    var rutaComercial6 = 'src/public/files/comercial/autosupremos/6.pdf';
    var rutaComercial7 = 'src/public/files/comercial/desestimiento/7.pdf';
    var rutaComercial8 = 'src/public/files/comercial/desestimiento/8.pdf';
    var rutaComercial9 = 'src/public/files/comercial/resolucionRechazo/9.pdf';
    var rutaComercial10 = 'src/public/files/comercial/sentencia/10.pdf';

    var document;
    var autoConstitucional;
    var keys = [];
    let dataBuffer = fs.readFileSync(rutaComercial10
        );
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
        autoConstitucional = rutaComercial10;
        //Creando nodo de documento 
        session
            .run("Match (b:resolucion{name:'sentencia'}), (c:materia{name:'comercial'}) merge(c)<-[:pertenece]-(a:document{autoConst:$autoConstParam, text:$documentParam})-[:termino]->(b) RETURN a.autoConst AS autoConstitucional, a.text AS texto", {
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