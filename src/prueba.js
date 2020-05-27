var express = require('express');
var app = express();
const { createWorker } = require('tesseract.js');
var mammoth = require("mammoth");
const worker = createWorker();
const fs = require('fs');
const pdf = require('pdf-parse');

///////PARA LEER PDF (PDF-PARSE)//////////
let dataBuffer = fs.readFileSync('C:/Users/isma/Desktop/test.pdf');
 
pdf(dataBuffer).then(function(data) {

  let documento = data.text.split(' ')
  
  var count = {};
  documento.forEach(function(i) 
  { 
    count[i] = (count[i]||0) + 1;
  });
  console.log(count);
  console.log(documento);   
})
.catch(function(error){
    console.log(error)
})


///////// PARA LEER CONTENIDO DE IMAGENES  (TESSERACT.JS)//////////////
// (async () => {
//   await worker.load();
//   await worker.loadLanguage('eng');
//   await worker.initialize('eng');
//   const { data: { text } } = await worker.recognize('C:/Users/isma/Desktop/dev/img/2.jpg');
//   console.log(text);
//   await worker.terminate();
// })();

///////////////PARA LEER DOCX WORD (MAMMOTH.JS)////////////////

// mammoth.extractRawText({path: "C:/Users/isma/Desktop/prueba1.docx"})
// .then(function(result){
//     var text = result.value; // The raw text
//     var messages = result.messages;
//     console.log(text)
// })
// .done();






// const neo4j = require('neo4j-driver')
// const driver = neo4j.driver('neo4j://localhost', neo4j.auth.basic('neo4j', '123'))
// const session = driver.session()
// const personName = 'Alice'
// app.post('/', function (req, res) {
//   res.send('Hello World!');
//   session
//     .run('CREATE (a:Person {name: $name}) RETURN a',
//         { name: personName })
//     .then((result)=>{
//         console.log(result)
//     })
//     .catch((err)=>{
//         console.log(err)
//     })
// });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
