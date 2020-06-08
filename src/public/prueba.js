const $btnBuscar = document.getElementById('btnBuscar');

async function cargarUltimasNoticias(texto){
    async function getDocumentos(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const $listaNoticias= await getDocumentos(`http://localhost:4000/api/v1/devolver/${texto}`);
    // debugger
    console.log($listaNoticias)
    const $containerNoticias = document.getElementById('container')
    $containerNoticias.innerHTML='';
    function NoticiasItemTemplate(file){
        debugger
        return`
                <div class="card">
                <div class="card-header">${file.document.substr(0,10)}</div>
                <div class="card-body">
                    <h4><small>Materia: </small><i>"${file.materia}"</i></h4>
                    <h5><small>termino por:</small> <i>"${file.resolucion}"</i></h5>
                    <hr/>
                    ${file.text.substr(0,800)}
                </div>
                </div>
            `
    }
    function createTemplate(HTMLString){
        const $html = document.implementation.createHTMLDocument();
        $html.body.innerHTML = HTMLString;
        return $html.body.children[0];
    }

    function renderNoticiaList(listnoticia, $container){
        listnoticia.forEach(noticia => {
            
            const HTMLString = NoticiasItemTemplate(noticia);
          const noticiaElement = createTemplate(HTMLString);
        //   addEventClick(noticiaElement,noticia);
        
          $container.append(noticiaElement);
        });    
    }
    renderNoticiaList($listaNoticias, $containerNoticias)
    
}
$btnBuscar.addEventListener('click',()=>{  
    const $buscador =  document.getElementById('text');
    let prueba = $buscador.value.split(' ').filter(counter => counter.length > 3);;
    
    var diccionario = ['para','donde','como','desde','mismo','puede','cual','partir','debe','dentro','parte','fecha','sido','este','pues','haber','sobre','sería','esta','bien','todo','forma','estas','todos','todas','cuales','fechas','partes','estos','bajo','debió','debería','falta','días','tiene','tienes','misma','dicha']
    
    for (let j = 0; j < diccionario.length; j++) {
        for (let l = 0; l < prueba.length; l++) {
            if(diccionario[j] == prueba[l]){
                prueba.splice(l,1)
            }
        }
    }
    console.log(prueba)
    cargarUltimasNoticias(prueba)

})