
var ipService = parametros.servidor + parametros.aplicacion;


if (parametros.aplica_autenticacion==true){
	//ValidaAutenticacion();
	//ValidaRoles();
}

$(document).ready(function() {	
	configuracionInicial();
	configuracionEventos();
});

function ValidaRoles(){

	var ipService = parametros.servidor + parametros.aplicacion;
	var usuario = localStorage.usuario;
	var grupo="UNACEM Usuarios de notificacion RDP";

	$.ajax({ 
        url: ipService+"/Seguridad.svc/UsuarioPerteneceAlGrupo?usuario="+usuario+"&grupo="+grupo, 
        dataType: 'json', 
        data: null, 
        async:  true, 
        beforeSend: function (){
        	$("#btn-transferir").addClass("d-none");
        }, 
        success: function(data){ 
            rpta=data;

            if (rpta==false){
            	$("#btn-transferir").remove();
            }
            else {
            	$("#btn-transferir").removeClass("d-none");
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
        	
        },
        complete: function(){
        }

    });
}

function configuracionInicial() {
    
    var usuario = window.localStorage.usuario; 
    $("#lbl-usuario").text(usuario);
    
    //colapzamos los bloques laterales por default          
    if(window.innerWidth>1200)
        $('body').toggleClass('offcanvas-active');
    /*
    else 
        $('body').removeClass('offcanvas-active');
    */
    

    if (localStorage.tema=="light-mode") {
        $("body").removeClass('dark-mode');     
        $( ".btn-darkmode" ).prop( "checked", false );

        $(".img-boton-d").attr("src","./assets/img/cal-d-light-30.png");
        $(".img-boton-m").attr("src","./assets/img/cal-m-light-30.png");
        $(".img-boton-2s").attr("src","./assets/img/cal-2s-light-30.png");
        $(".img-boton-r").attr("src","./assets/img/cal-r-light-30.png");
    }
    else {      
        $("body").addClass('dark-mode');
        $( ".btn-darkmode" ).prop( "checked", true );

        $(".img-boton-d").attr("src","./assets/img/cal-d-dark-30.png");
        $(".img-boton-m").attr("src","./assets/img/cal-m-dark-30.png");
        $(".img-boton-2s").attr("src","./assets/img/cal-2s-dark-30.png");
        $(".img-boton-r").attr("src","./assets/img/cal-r-dark-30.png");
    }


    
    if (localStorage.fontSize !== undefined){
        $("input[name='font-size'][value='" + localStorage.fontSize + "']").prop("checked", true);  
        modificarTamanoFuente(localStorage.fontSize);
    }   

   
    var dHoy = new Date();  
    var cHoy = obtener_cadena_fecha_estandar(dHoy);
    var cMes = aumentar_n_meses(cHoy.substring(0,7)+"-26", -1).substring(0,7);
    $("#dtp-mes").val(cMes);

    var fechaini = $("#dtp-mes").val().substring(0,7)+"-26";
    var fechafin = aumentar_n_meses(fechaini, 1);
    $("#lbl-titulo").text("CONSUMOS DEL "+fechaini+ " AL " + fechafin);
    
    cargarTabla();
}

function configuracionEventos(){

    $(window).resize(function(){
        //$('body').toggleClass('offcanvas-active');
        //console.log('on resize windows');
        //$('body').removeClass('offcanvas-active');

        if(window.innerWidth>1200){
            if (!($("body").hasClass("offcanvas-active")))
                $(".menu_toggle").trigger("click")
        }
        else {
            if ($("body").hasClass("offcanvas-active"))
                $(".menu_toggle").trigger("click")  
        }
    });


    $(".setting_switch .btn-darkmode").on('change',function() {     

        if(this.checked) {
            localStorage.tema="dark-mode";      
        }
        else {
            localStorage.tema="light-mode";             
        }
    });

    $('input[type=radio][name=font-size]').change(function() {
        modificarTamanoFuente(this.value);
    });

    
    $("#btn-buscar").on("click", function(){
        if (esValidaConsultaKardex()){
            cargarTabla();
        }
    });

    $("#btn-aceptar-modal-mensaje").on("click", function(){
        ocultarModal("modal-mensaje");
    });

    $("#txt-saldo-inicial").on("input", function(){
        actualizarSaldos();
    });


     $(".copiar-elemento").on("click", function(){

        var idElemento = $(this).attr("data-elemento");
       
        var urlField = document.querySelector("#"+idElemento);
   

        // create a Range object
        var range = document.createRange();  
        // set the Node to select the "range"
        range.selectNode(urlField);
        // add the Range to the set of window selections
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
           
        // execute 'copy', can't 'cut' in this case
        document.execCommand('copy');
        window.getSelection().removeAllRanges();


        $(this).parent().find(".mensaje-copia").removeClass("d-none");
        var boton = $(this);
        setTimeout(function(){
            boton.parent().find(".mensaje-copia").addClass("d-none");
        }, 2000);
    });

    $("#btn-exportar-a-excel").on("click", function(){
        TablaAExcel("tabla2");
    });

    $("#dtp-mes").on("change", function(){
        $("#cuerpo-tabla").empty();
        $("#cuerpo-tabla2").empty();

        var fechaini = $("#dtp-mes").val().substring(0,7)+"-26";
        var fechafin = aumentar_n_meses(fechaini, 1);
        $("#lbl-titulo").text("CONSUMOS DEL "+fechaini+ " AL " + fechafin);
    });

}


function esValidaConsultaKardex(){
    esValido=true;

    if ($("#dtp-mes").val().trim()==""){
        esValido = false;
        $("#modal-mensaje .modal-body").html("Seleccione un mes válido");
        mostrarModal("modal-mensaje");
    }
    
    return esValido;
}

function cargarTabla(){

    var fechaini = $("#dtp-mes").val().substring(0,7)+"-26";
    var fechafin = aumentar_n_meses(fechaini, 1);
    var material = $("#txt-material").val();

    var xhr = $.ajax({ 
        url: ipService+"/RDP.svc/ListarConsumosPorGrupoProductoYMaterial?fechaini="+fechaini+"&fechafin="+fechafin+"&material="+material, 
        dataType: 'json', 
        data: null, 
        async:  true, 
        beforeSend: function (){                       
            $("#cuerpo-tabla").empty();
            $("#spin-tabla").removeClass("d-none");
            $("#contenedor-tabla").addClass("d-none");            
        }, 
        success: function(data){
            var tr="";
            var tr2="";
            $.each(data, function (key, val) {  
                tr = tr + "<tr>";
                tr = tr + '    <td class="text-left">'+val.COD_GRUPO+'</td>';
                tr = tr + '    <td class="text-left">'+val.COD_PRODUCTO+'</td>';
                tr = tr + '    <td class="text-left">'+val.COD_MATERIAL+'</td>';
                tr = tr + '    <td class="text-right">'+val.CNT_TONELADASNOTIF+'</td>';             
                tr = tr + "</tr>";

                tr2 = tr2 + "<tr>";
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.COD_GRUPO+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.COD_PRODUCTO+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.COD_MATERIAL+'</td>';
                tr2 = tr2 + '    <td class="text-right">'+val.CNT_TONELADASNOTIF.replace(/,/g, "")+'</td>';     
                tr2 = tr2 + "</tr>";
            });

            $("#cuerpo-tabla").html(tr);
            $("#cuerpo-tabla2").html(tr2);
        },
        error: function (xhr, ajaxOptions, thrownError) { 

        },
        complete: function(){ 
            $("#spin-tabla").addClass("d-none");
            $("#contenedor-tabla").removeClass("d-none");
            
        }
    });
}

function TablaAExcel(idTabla){
    
    var ExportButtons = document.getElementById(idTabla);

    var instance = new TableExport(ExportButtons, {
        formats: ['xlsx'],
        exportButtons: false
    });

    //                                        // "id" of selector    // format
    var exportData = instance.getExportData()[idTabla]['xlsx'];

    //var XLSbutton = document.getElementById('customXLSButton');

    
    
    //var nombreReporte = "KARDEX DEL MATERIAL "+material + " " + tipo + " DEL "+fechaini+" AL "+fechafin;
    var nombreReporte = "CONSUMOS";

    instance.export2file(exportData.data, exportData.mimeType, nombreReporte, exportData.fileExtension);
}
