const $btnBuscar = document.getElementById('btnBuscar');

async function cargarUltimasNoticias(texto){
    async function getDocumentos(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const $listaNoticias= await getDocumentos(`http://localhost:4000/api/v1/devolver/${texto}`);
    debugger
    console.log($listaNoticias)
    
    function NoticiasItemTemplate(noticia){
        debugger
        return `<div class="documento">
        <h2>${noticia.document.properties.autoConst.substr(0,10)}</h2>  
        <h3>${noticia.materia.properties.name}</h3>          
        <div>${noticia.document.properties.text.substr(0,1000)}</div>
        </div>`;
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
    const $containerNoticias = document.getElementById('container')
    renderNoticiaList($listaNoticias, $containerNoticias)
    
}
$btnBuscar.addEventListener('click',()=>{
    const $containerNoticias = document.getElementById('container')
    $containerNoticias.innerHTML='';
    cargarUltimasNoticias(document.getElementById('text').value)
})