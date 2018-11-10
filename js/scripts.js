function toggleMenu(boton) {
    boton.classList.toggle("active");
    // Es posible desplegar el menú cuando no ha cargado JavaScript,
    // pero si ha cargado, es necesario quitarle el focus al botón para
    // no bloquear la lista.
    boton.blur(); 
}


function controlSesionHardcoded () {
    var usuario = localStorage.getItem("usuario");
    if (usuario !== null) {
        var userpanel = document.getElementById("user-panel");
        if (userpanel !== null) {
            userpanel.classList.toggle("usuario-logueado");
            document.getElementById("user-panel").innerHTML = '<div id="user-info"><a href="#" id="username">' + usuario +'</a><a href="#" id="logout" onclick="logoutHardcoded()">Cerrar sesión</a></div><a href="#" id="user-avatar"><img src="img/nouser.gif" alt="Imagen del usuario"></a>';
        }
    }
}

function logoutHardcoded() {
    localStorage.removeItem("usuario");
    location.reload();
}

controlSesionHardcoded();

/** Noticias */
var paginas = [];
var paginaActual = 1;


function pedirNoticias(pagina) {
    
    $("#noticias article").remove();
    $(".cargando").show();
    window.scrollTo(0,0);
    
    // El timeout es para simular tiempo de carga.
    // se quitará cuando se implemente con servidor real.
    setTimeout( function() {
    $.ajax({
        url: "./api/noticias.json",
        type: "GET",
        dataType: "json",
        data: { page: pagina, pagelimit: 4 },
        success: function(data) {
            cargarPagina(data);
            actualizarPaginacion(pagina, data.total);
            $(".cargando").hide();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("ERROR AL CARGAR NOTICIAS (TO DO: mostrar el error en página, no con este alert)")   
            alert(jqXHR);
            alert(textStatus);
            alert(errorThrown);
        }
    });
    }, 1000);
}

function cargarPagina(datos) {
    var cont = $("#noticias");
    datos.noticias.reverse();
    datos.noticias.forEach(function(noticia) {
        
        var thumbnail = '<a class="thumbnail" href="' + noticia.permalink +
                        '"><img src="./img/' + noticia.thumbnail + '"></a>'
        var title = '<h1><a href="' + noticia.permalink + '">' + noticia.title + "</a></h1>"
        var content = "<p>" + noticia.content + "</p>"
        
        var article = '<article>' + thumbnail + 
                        '<div class="contenido">' + title + content + '</div>' +
                        '<a href="' + noticia.permalink + '" class="boton leer-mas">LEER MÁS</a>'
        '</article>'
        
        cont.prepend(article);
    });
    
    cont.find("article").hide().fadeIn(500);
}

function actualizarPaginacion(pagina, total) {
    var paginador = $("#paginacion");
    paginador.html("");
    pagina = parseInt(pagina); // previene posibles tratamientos de cadenas.
    if (pagina != 1) { // Botón "anterior" o "<"
        paginador.append('<div id="previous">&lt;</div>');
    }
    
    if (pagina > 2) { // Botón "..." izquierdo.
        paginador.append('<div>1</div>'); 
    }
    if ( pagina >= 4 ) { paginador.append('<div id="moreLeft">...</div>'); }
    if ( pagina != 1) { 
        paginador.append('<div>' + (pagina - 1) + '</div>');
    }
    paginador.append('<div class="actual">' + pagina + '</div>');
    if ( pagina != total) { paginador.append('<div>' + (pagina + 1) + '</div>'); }
    if ( pagina < total - 2 ) { 
        paginador.append('<div id="moreRight">...</div>');
    }
    if ( pagina < total - 1) {
        paginador.append('<div>' + total + '</div>');
    }
    if ( pagina != total ) { paginador.append('<div id="next">&gt;</div>'); }
    
    paginador.find("div").each(function() {
        var b = this.innerHTML;
        switch (b) {
            case '&lt;' :
                $(this).click(function() {
                   pedirNoticias(pagina-1);
                });
                break;
            case '&gt;' :
                $(this).click(function() {
                   pedirNoticias(pagina+1);
                });
                break;
            case '...' :
                $(this).click(function() {
                    pedirNoticias (
                        this.id === 'moreLeft' ? (pagina-3) : (pagina+3), 
                    );
                });
                break;
            default :
                $(this).click(function() {
                   pedirNoticias(b); 
                });
        }
    })
}
pedirNoticias(1);



/**********************************************************************
*       DE AQUÍ PABAJO TODO LO RELATIVO A LA GESTIÓN DEL FONDO        *
***********************************************************************/
/**                    Información sobre rendimento
 * Cada vez que se reescala la pantalla se readaptan los tamaños de bloque
 * y se redibuja el fondo. El fondo está en un canvas aparte y se mantiene
 * estático una vez dibujado.
 *
 * El canvas de los tetrominós se redibuja cada medio segundo para mostrar
 * un avance, pero no se desplaza todo, sólo se dibuja cada forma. El
 * coste computacional es mínimo. Probado con dos dispositivos móviles,
 * con firefox, chrome y safari el consumo de batería con el navegador 
 * activo se incrementó en menos de un 2%, excepto en Firefox, donde fue
 * incluso mejor, no apreciándose diferencias.
 *
 * Probado con un portátil con un i3 de hace 7 años no se notó ninguna 
 * diferencia con y sin el script activo.
 *
 * Se ha utilizado el módulo blocks de Awesome Backgrounds, un futuro 
 * conjunto de librerías y herramientas para generar gadgets visuales 
 * que estoy creando mientras profundizo en el aprendizaje de JavaScript.
 */
var b = new awbgblocks(60);

var resizeFondo = function () {
    fondo.width = window.innerWidth;
    fondo.height = window.innerHeight;
    
    var ctx = fondo.getContext('2d');
    var bSize = b.getBlockSize();
    
    for(var i = 0; i < fondo.height + bSize; i += bSize) {
        for(var j = 0; j < fondo.width + bSize; j += bSize) {
            var gris = randomBetween(0, 9);
            ctx.fillStyle = "rgb(" + gris + ', ' + gris + ', ' + gris + ")";
            ctx.fillRect(j+2,i+2, bSize-4, bSize-4);
        }
    }
    
}

var fondo = document.getElementById("fondo-cuadricula");


var sm = new b.ShapesManager();
var step = 0;
window.addEventListener('resize', resizeFondo, false);
resizeFondo();

b.addShapeType("arrow", [[1, 0], [0, 1], [1, 1], [2, 1]]);
b.addShapeType("arrow90", [[1, 0], [0, 1], [1, 1], [1, 2]]);
b.addShapeType("arrow270", [[0, 0], [0, 1], [1, 1], [0, 2]]);
b.addShapeType("arrow180", [[0, 0], [1, 0], [2, 0], [1, 1]]);
b.addShapeType( "line", [[0, 0], [0, 1], [0, 2], [0, 3]]);
b.addShapeType( "line90", [[0, 0], [1, 0], [2, 0], [3, 0]]);
b.addShapeType("leftZigzag", [[0, 0], [1, 0], [1, 1], [2, 1]]);
b.addShapeType("leftZigzag90", [[1, 0], [1, 1], [0, 1], [0, 2]]);
b.addShapeType("rightZigzag", [[0, 1], [1, 1], [1, 0], [2, 0]]);
b.addShapeType("square", [[0, 0], [1, 0], [0, 1], [1, 1]]);
b.addShapeType("leftHook", [[0, 0], [1, 0], [0, 1], [0, 2]]);
b.addShapeType("leftHook90", [[0, 0], [0, 1], [1, 1], [2, 1]]);
b.addShapeType("rightHook", [[0, 0], [0, 1], [0, 2], [1, 2]]);
b.addShapeType("rightHook90", [[0, 1], [1, 1], [2, 1], [2, 0]]);


var types = ['arrow', 'line', 'leftZigzag', 'leftZigzag90', 'rightZigzag',
             'square','leftHook', 'rightHook', 'leftHook90', 'line90',
             'rightHook90', 'arrow90', 'arrow180', 'arrow270'];
update();

function update() {
    b.clear();
    sm.moveAllShapes(0,1);
    sm.removePassed(b.canvas.height, b.Direction.SOUTH);
    sm.draw();

    // New block every 4 movements (1 second)
    if (step == 0) {
        newRandomShape();
    }
    
    step = (step + 1) % 4;
    setTimeout(function () {
        update();
    }, 500);
}


function randomColor() {
    return 'rgb(' + 
        Math.floor(Math.random() * 200) + ', ' +
        Math.floor(Math.random() * 200) + ', ' +
        Math.floor(Math.random() * 200) + ')'
}

function randomPosition(xMin, xMax, yMin, yMax) {
    return {
        'x' : Math.floor(randomBetween(xMin, xMax)),
        'y' : Math.floor(randomBetween(yMin, yMax))
    }
};

function newRandomShape() {
    var shapeType = types[Math.floor(randomBetween(0, types.length))];
    sm.newShape(shapeType, randomPosition(0,58,-4,-4), randomColor());
}

function randomBetween(min, max) {
    return Math.random()*(max-min) + min;
}