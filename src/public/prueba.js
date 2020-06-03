(async function cargarUltimasNoticias(){
    async function getDocumentos(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const $listaNoticias= await getDocumentos(`http://localhost:4000/api/v1/delvolver`);
    debugger
    console.log($listaNoticias)

    function NoticiasItemTemplate(noticia){
        return `<div class="documento">
                    <h2>${noticia.properties.autoConst}</h2>            
                    <div>${noticia.properties.text}</div>
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

})();