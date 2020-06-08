const $btnBuscar = document.getElementById('btnBuscar');
const $radioText = document.getElementById('radioText');
const $radioMateria = document.getElementById('radioMateria');
const $radioResolucion = document.getElementById('radioResolucion');
const $text = document.getElementById('text');
debugger
const $materia = document.getElementById('materia');
const $resolucion = document.getElementById('resolucion');

async function cargarUltimasNoticias(texto, url){
    async function getDocumentos(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const $listaNoticias= await getDocumentos(`${url}/${texto}`);
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
$radioText.addEventListener('change',()=>{
    $text.disabled=false;
    $materia.disabled=true;
    $resolucion.disabled=true;
})
$radioMateria.addEventListener('change',()=>{
    $text.disabled=true;
    $materia.disabled=false;
    $resolucion.disabled=true;

})
$radioResolucion.addEventListener('change',()=>{
    $text.disabled=true;
    $materia.disabled=true;
    $resolucion.disabled=false;

})
$btnBuscar.addEventListener('click',()=>{  
    if($radioText.checked){
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
        // console.log(prueba)
        cargarUltimasNoticias(prueba, 'http://localhost:4000/api/v1/devolver')
    }else if($radioMateria.checked){
        cargarUltimasNoticias($materia.value, 'http://localhost:4000/api/v1/materia')
    }else if($radioResolucion.checked){
        
        cargarUltimasNoticias($resolucion.value, 'http://localhost:4000/api/v1/resolucion')

    }

})