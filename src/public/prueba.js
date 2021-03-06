const $btnBuscar = document.getElementById('btnBuscar');
const $radioText = document.getElementById('radioText');
const $radioMateria = document.getElementById('radioMateria');
const $radioResolucion = document.getElementById('radioResolucion');
const $text = document.getElementById('text');
const $materia = document.getElementById('materia');
const $resolucion = document.getElementById('resolucion');

document.getElementById('overlay').addEventListener('click',()=>{
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('modaltext').style.animation="animationOut .8s forwards";
});

async function cargarUltimasNoticias(texto, url) {
    async function getDocumentos(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    const $listaNoticias = await getDocumentos(`${url}/${texto}`);
    // debugger
    console.log($listaNoticias)
    const $containerNoticias = document.getElementById('container')
    $containerNoticias.innerHTML = '';
    function NoticiasItemTemplate(file) {
        var palabras = [];
        var texto = file.text;
        const textoSplit = texto.split(' ');
        let prueba = $text.value.split(' ').filter(counter => counter.length > 3);
        for (let j = 0; j < textoSplit.length; j++) {
            for (let l = 0; l < prueba.length; l++) {
                if (textoSplit[j] == prueba[l]) {
                    palabras.push(textoSplit[j]);
                }
            }
        }
        if (palabras.length == 0) {
            palabras.push(file.palabras);
        }
        var count = {};
        palabras.forEach(function (i) {
            count[i] = (count[i] || 0) + 1;
        });
        return `
                <div class="card">
                    <div class="card-header">${file.document.substr(0, 10)}</div>
                    <div class="card-body">
                        <h4><small>Materia: </small><i>"${file.materia}"</i></h4>
                        <h5><small>termino por:</small> <i>"${file.resolucion}"</i></h5>
                        <hr/>
                        ${file.text.substr(0, 800)}
                    </div>
                    <h4><small>Palabras: </small><i>"${Object.keys(count)}"</i></h4>
                </div>
            
            `
    }

    function createTemplate(HTMLString) {
        const $html = document.implementation.createHTMLDocument();
        $html.body.innerHTML = HTMLString;
        return $html.body.children[0];
    }

    function addEventClick($element,$noticia) {
        $element.addEventListener('click', () => {
          // alert('click')
          showModal($noticia)
        })
    }

    function showModal($noticia){
        
        document.getElementById('overlay').classList.add('active');
        document.getElementById('modaltext').style.animation="animationIn .8s forwards";
        document.getElementById('parrafo').textContent= $noticia.text;
        console.log($noticia.text);
    }

    function renderNoticiaList(listnoticia, $container) {
        listnoticia.forEach(noticia => {
            
            const HTMLString = NoticiasItemTemplate(noticia);
            const noticiaElement = createTemplate(HTMLString);
            //debugger
            addEventClick(noticiaElement.children[0],noticia);

            $container.append(noticiaElement);
        });
    }
    renderNoticiaList($listaNoticias, $containerNoticias)

}
$radioText.addEventListener('change', () => {
    $text.disabled = false;
    $materia.disabled = true;
    $resolucion.disabled = true;
})
$radioMateria.addEventListener('change', () => {
    $text.disabled = true;
    $materia.disabled = false;
    $resolucion.disabled = true;

})
$radioResolucion.addEventListener('change', () => {
    $text.disabled = true;
    $materia.disabled = true;
    $resolucion.disabled = false;

})
$btnBuscar.addEventListener('click', () => {
    if ($radioText.checked) {
        const $buscador = document.getElementById('text');
        let prueba = $buscador.value.split(' ').filter(counter => counter.length > 3);

        var diccionario = ['para', 'donde', 'como', 'desde', 'mismo', 'puede', 'cual', 'partir', 'debe', 'dentro', 'parte', 'fecha', 'sido', 'este', 'pues', 'haber', 'sobre', 'sería', 'esta', 'bien', 'todo', 'forma', 'estas', 'todos', 'todas', 'cuales', 'fechas', 'partes', 'estos', 'bajo', 'debió', 'debería', 'falta', 'días', 'tiene', 'tienes', 'misma', 'dicha']

        for (let j = 0; j < diccionario.length; j++) {
            for (let l = 0; l < prueba.length; l++) {
                if (diccionario[j] == prueba[l]) {
                    prueba.splice(l, 1)
                }
            }
        }
        // console.log(prueba)
        cargarUltimasNoticias(prueba, 'http://localhost:4000/api/v1/devolver')
    } else if ($radioMateria.checked) {
        cargarUltimasNoticias($materia.value, 'http://localhost:4000/api/v1/materia')
    } else if ($radioResolucion.checked) {

        cargarUltimasNoticias($resolucion.value, 'http://localhost:4000/api/v1/resolucion')

    }

})