


$(document).ready( function() {
    
    var loginForm = $("#caja-login");
    $("#caja-login a").click(function () {
        loginForm.toggleClass("registro");
        
        if (loginForm.hasClass("registro")) {
            $(".registro").css("display", "block").attr("required", "true").hide();
            $("#aceptar-tos, #aceptar-tos+label").css({"display":"inline", "width":"auto"}).hide();
            $(".registro").fadeIn(500);
            $("#pregunta").html("¿Ya registrado?");
            $("#pregunta+a").html("Inicia sesión").attr("href","#?signup");;
            $("button[type=submit]").html("Registrarme");
            $('input[name="password"]').attr("pattern", ".{8,15}");
            $('input[name="password"]').prev("label").html("Contraseña <small>(entre 8 y 15 caracteres)</small>");
            $("#password+p.error").hide();
        } else {
            $('input[name="password"]').removeAttr("pattern");
            $("#pregunta").html("¿Aún no registrado?");
            $("#pregunta+a").html("¡Hazlo aquí!").attr("href","#?login");
            $("input.registro").val("");
            $(".registro").removeAttr("required").fadeOut(500);
            $("#aceptar-tos").fadeOut(500);
            $("button[type=submit]").html("Iniciar sesión");
        }
    });
    
    
    if (window.location.href.indexOf("register") != -1 ) {
        $("#caja-login a").click();
    }
    
    users = localStorage.getItem("users");
    if (users === null) {
        users = JSON.parse(_SERVIDOR_loadUsers());
        localStorage.setItem("users", JSON.stringify(users));
    }
    
});



var errores = {};
var users;
function comprobarNombreUsado () {
    if ( !$("#caja-login").hasClass("registro") ) { return; }
    
    var nombre = $("#nombre").val();
    
    //TO DO: sustituir por una llamada AJAX al servidor cuando lo tengamos
    // disponible.
    var respuesta = _SERVIDOR_nombreUsado(nombre);
    
    if (respuesta == true) {
        $("#nombre+p.error").show();
        errores.nombre = true;
    } else {
        $("#nombre+p.error").hide();
        delete errores['nombre'];
    }
}

function comprobarPasswords () {
    if ( !$("#caja-login").hasClass("registro") ) { return; }
    
    var pass1 = $("#password").val();
    var pass2 = $("#confirmar-pass").val();
    if (pass1 !== pass2) {
        $("#confirmar-pass+p.error").show();
        errores.password = true;
    } else {
        $("#confirmar-pass+p.error").hide();
        delete errores['password'];
    }
}


function controlFormulario() {
    
    if ($("#caja-login").hasClass("registro") && 
        Object.keys(errores).length == 0 ) {
        mostrarCargando();
        
        setTimeout( function() {
            _SERVIDOR_registro(
                $("#nombre").val(),
                $("#email").val(),
                $("#password").val()
            );
            ocultarCargando();
            $("#caja-login a").click();
        }, 2200);
    } else {
        _SERVIDOR_login($("#nombre").val(), $("#password").val());
    }
    
    return false;
}
function mostrarCargando() {
    $(".cargando").show();
    $("#caja-login").hide();
}
function ocultarCargando() {
    $(".cargando").hide();
    $("#caja-login").show();
}


/*******************************************************************/
/***    FUNCIONES DEL SERVIDOR HARDCODED A BORRAR EN UN FUTURO   ***/
/*******************************************************************/
function _SERVIDOR_nombreUsado(nombre) {
    users = JSON.parse(users);
    
    for (var key in users) {
        if (users.hasOwnProperty(key)) {
            if(nombre.toLowerCase().trim() === key.toLowerCase()) {
                return true;
            }
        }
    }
    return false;
}
function _SERVIDOR_registro(nombre, email, password) {
    var users = JSON.parse(localStorage.getItem("users"));
    users[nombre] = {"score" : 0, "passwd" : password, "email" : email};
    localStorage.setItem("users", JSON.stringify(users));
    return true;
}
function _SERVIDOR_login(nombre, password) {
    var users = JSON.parse(localStorage.getItem("users"));
    mostrarCargando();
    setTimeout(function () {
        if (users[nombre] === undefined || users[nombre].passwd != password) {
            $("#password+p.error").show();
        } else {
            localStorage.setItem("usuario", nombre);
            window.location = "./index.html"
        }
        ocultarCargando();
    }, 2000);
    
}
/** HARDCODED */
function _SERVIDOR_loadUsers() {
    return '{"zixiong":{"score":839412,"passwd":1234,"email":"zixion@asd.com"},"javier":{"score":839412,"passwd":5678,"email":"javi@asd.com"},"alex":{"score":839412,"passwd":9012,"email":"alex@asd.com"}}';
}


