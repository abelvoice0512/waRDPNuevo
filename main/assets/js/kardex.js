
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
    $("#dtp-fecha-ini").val(cHoy);
    $("#dtp-fecha-fin").val(cHoy);
    //cargarRDP();
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
            cargarKardex();
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
        TablaAExcel("tabla-kardex2");
    });

}


function esValidaConsultaKardex(){
    esValido=true;

    if ($("#cmb-tipo-kardex").val().trim()==""){
        esValido = false;
        $("#modal-mensaje .modal-body").html("Seleccione el tipo de Kardex");
        mostrarModal("modal-mensaje");
    }


    if ($("#txt-material").val().trim()==""){
        esValido = false;
        $("#modal-mensaje .modal-body").html("Ingrese el código de material SAP");
        mostrarModal("modal-mensaje");
    }

    
    return esValido;
}

function cargarKardex(){

    var original = $("#cmb-tipo-kardex").val();
    var fechaini = $("#dtp-fecha-ini").val();
    var fechafin = $("#dtp-fecha-fin").val();
    var material = $("#txt-material").val();

    var xhr = $.ajax({ 
        url: ipService+"/RDP.svc/ListarMovimientosKardex?original="+original+"&fechaini="+fechaini+"&fechafin="+fechafin+"&material="+material, 
        dataType: 'json', 
        data: null, 
        async:  true, 
        beforeSend: function (){                       
            $("#cuerpo-tabla-kardex").empty();
            $("#spin-tabla-kardex").removeClass("d-none");
            $("#contenedor-tabla-kardex").addClass("d-none");            
        }, 
        success: function(data){
            var tr="";
            var tr2="";
            $.each(data, function (key, val) {  
                tr = tr + "<tr>";
                tr = tr + '    <td class="text-left">'+val.Fecha+'</td>';
                tr = tr + '    <td class="text-left">'+val.TipoMovimiento+'</td>';
                tr = tr + '    <td class="text-left">'+val.Grupo+'</td>';
                tr = tr + '    <td class="text-left">'+val.Maquina+'</td>';
                tr = tr + '    <td class="text-left">'+val.Producto+'</td>';
                tr = tr + '    <td class="text-left">'+val.MaterialSAP+'</td>';
                tr = tr + '    <td class="text-right ingreso">'+val.Ingreso+'</td>';
                tr = tr + '    <td class="text-right salida">'+val.Salida+'</td>';
                tr = tr + '    <td class="text-right saldo"></td>';
                tr = tr + "</tr>";

                tr2 = tr2 + "<tr>";
                tr2 = tr2 + '    <td class="text-left">'+val.Fecha+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.TipoMovimiento+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.Grupo+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.Maquina+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.Producto+'</td>';
                tr2 = tr2 + '    <td class="text-left tableexport-string">'+val.MaterialSAP+'</td>';
                tr2 = tr2 + '    <td class="text-right ingreso">'+val.Ingreso.replace(/,/g, "") +'</td>';
                tr2 = tr2 + '    <td class="text-right salida">'+val.Salida.replace(/,/g, "") +'</td>';
                tr2 = tr2 + '    <td class="text-right saldo"></td>';
                tr2 = tr2 + "</tr>";
            });

            $("#cuerpo-tabla-kardex").html(tr);
            $("#cuerpo-tabla-kardex2").html(tr2);
        },
        error: function (xhr, ajaxOptions, thrownError) { 

        },
        complete: function(){ 
            $("#spin-tabla-kardex").addClass("d-none");
            $("#contenedor-tabla-kardex").removeClass("d-none");
            actualizarSaldos();
        }
    });
}

function actualizarSaldos() {

    var saldoInicial = 0;
    if (!(isNaN(parseFloat($("#txt-saldo-inicial").val())))){
        saldoInicial = parseFloat($("#txt-saldo-inicial").val());
    }

    var saldoAnterior = saldoInicial;
    for (i=0; i<$("#cuerpo-tabla-kardex tr").length; i++) {
        
        var ingreso = parseFloat($($("#cuerpo-tabla-kardex tr")[i]).find(".ingreso").text().replace(/,/g,""));
        var salida = parseFloat($($("#cuerpo-tabla-kardex tr")[i]).find(".salida").text().replace(/,/g,""));
        var saldo = saldoAnterior + ingreso - salida;
        $($("#cuerpo-tabla-kardex tr")[i]).find(".saldo").text(addCommas(saldo));
        $($("#cuerpo-tabla-kardex2 tr")[i]).find(".saldo").text(saldo);
        saldoAnterior = saldo
    }
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

    var fechaini = $("#dtp-fecha-ini").val();
    var fechafin = $("#dtp-fecha-fin").val();
    var material = $("#txt-material").val();
    var tipo = $("#cmb-tipo-kardex").val()
    
    
    //var nombreReporte = "KARDEX DEL MATERIAL "+material + " " + tipo + " DEL "+fechaini+" AL "+fechafin;
    var nombreReporte = "KARDEX";

    instance.export2file(exportData.data, exportData.mimeType, nombreReporte, exportData.fileExtension);
}
