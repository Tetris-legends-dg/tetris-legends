function toggleMenu(boton) {
    boton.classList.toggle("active");
    // Es posible desplegar el menú cuando no ha cargado JavaScript,
    // pero si ha cargado, es necesario quitarle el focus al botón para
    // no bloquear la lista.
    boton.blur(); 
}


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
 * conjunto de librerías y herramientas para generar fondos que estoy 
 * creando mientras profundizo en el aprendizaje de JavaScript.
 */
var b = new awbgblocks(60);

var resizeFondo = function () {
    fondo.width = window.innerWidth;
    fondo.height = window.innerHeight;
    
    var ctx = fondo.getContext('2d');
    
    var grises = ['#000', '#050505', '#080808'];
    
    var bSize = b.getBlockSize();
    
    for(var i = 0; i < fondo.height + bSize; i += bSize) {
        for(var j = 0; j < fondo.width + bSize; j += bSize) {;
            ctx.fillStyle = grises[Math.floor(randomBetween(0, grises.length))];
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