
var ipService = parametros.servidor + parametros.aplicacion;
var tipo="";
var vista="";
var cIdInterno="";

if (parametros.aplica_autenticacion==true){
	ValidaAutenticacion();
	//ValidaRoles();
}

$(document).ready(function() {
	configuracionInicial();
	configuracionEventos();
});


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

	tipo = capturarValorURL("tipo");    
    if (tipo==false){
    	tipo="ORIGINAL";
    }

    vista = capturarValorURL("vista");    
    if (vista==false){
    	vista="";
    }

	var dHoy = new Date();	
	var cHoy = obtener_cadena_fecha_estandar(dHoy);
    $("#fecha-reporte").val(cHoy);
    cargarRDP();
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

	
	


	$("#btn-ver-cuaderno").click(function(e){
		var fecha = $("#fecha-reporte2").val();
		var tipo="";
		
		 //seteamos enlace del cuaderno en el iframe - para el modo interno
    	$("#frame-cuaderno").attr("src", parametros.urlCuadernoOcurrencias + "/?fecha=" + fecha + "&tipo=" + tipo);

		mostrarModal("modal-cuaderno");
	});

	$("#btn-ver-cuaderno2").click(function(e){
		var fecha = $("#fecha-reporte2").val();
		var tipo="";

		//seteamos enlace del cuaderno en el iframe - para el modo interno
    	$("#frame-cuaderno").attr("src", parametros.urlCuadernoOcurrencias + "/?fecha=" + fecha + "&tipo=" + tipo);

		mostrarModal("modal-cuaderno");
	});

	$("#btn-gestor-columnas").on("click", function(){
		mostrarModal("modal-gestor-columnas");
	});

	$('.check-columna').click(function() {

		var id = $(this).attr('id');            
        id = id.replace("chk_","");

        if ($(this).is(':checked')) {        	            
            $('.' + id).show();
            if (id=="IMP_COSTO_UNIT")
            	$('.BTN_COSTOS').show();           	
        }
        else {
        	$('.' + id).hide();
        	if (id=="IMP_COSTO_UNIT")
            	$('.BTN_COSTOS').hide();           	
        }
    });

    $("#btn-aceptar-modal-gestor-columnas").on("click", function(){
    	ocultarModal("modal-gestor-columnas");
    });


    $("#btn-exportar-a-excel").on("click", function(){
    	TablaAExcel("tabla-arbol-rdp2");
    });


    $(".copiar-elemento").on("click", function(){

		var idElemento = $(this).attr("data-elemento");
		console.log(idElemento);
		var urlField = document.querySelector("#"+idElemento);
		console.log(urlField);

		$("#"+idElemento).removeClass("d-none");

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

		$("#"+idElemento).addClass("d-none");

		$(this).parent().find(".mensaje-copia").removeClass("d-none");
		var boton = $(this);
		setTimeout(function(){
			boton.parent().find(".mensaje-copia").addClass("d-none");
		}, 2000);
	});

	$("#fecha-reporte").on("change", function(){
		xhr.abort();
		cargarRDP();
	})

	$("#chk-ver-ceros").change(function() {
		/*
 		$("#chkVerCeros").attr("disabled", true);
 		cargar_reporte();	    
 		$("#chkVerCeros").removeAttr("disabled");
 		*/
 		xhr.abort();
 		cargarRDP();

	});

	$('#btnEnviarMensaje').click(function() {		
		enviarMensaje();
	});

	$("#btn-comentario-fecha").on("click", function(){

		//para comentarios		
		var idAplicacionFinal="";
		
		if (tipo==false){
			idAplicacionFinal=parametros.id_aplicacion;
		}
		else if (tipo=="ORIGINAL") {
			idAplicacionFinal=parametros.id_aplicacion;
		}
		else if (tipo=="CORREGIDO") {
			idAplicacionFinal=parametros.id_aplicacion+"Corregido";
		}
		else if (tipo=="NOTIFICACION") {
			idAplicacionFinal=parametros.id_aplicacion+"Notificacion";
		}	

		var fecha = $("#fecha-reporte").val();		
		var id = idAplicacionFinal + "|index|rdp|" + fecha + "||||";

		mostrarModalComentario(id);
	});

		//manejo de adjuntos
	$("#btnAdjuntar").click(function(e){
		if (parametros.modo_externo){
			$("#oModalMensaje").modal();
			$("#oModalMensaje .modal-body").html("No tiene autorización para subir archivos mientras no este en la red interna.");
		}
		else {
			$('#inpArchivo').trigger( 'click' );							
		}
	});

	$('#inpArchivo').change(function(evt) {
		if($(this).val()!=""){        	
        	$("#oFormAdjuntos").submit();
		}
    });


    $("#oFormAdjuntos").on("submit", function (e) {
     	
	    e.preventDefault();	    
	    var id = $('#hdId').val();	  	    
		var usuario = localStorage["usuario"];
		var mensaje = "[Adjunto]";

		var d = new Date();
		var fecha = obtener_cadena_fecha_y_hora_estandar_con_ms(d);
		var idComentario;

		var primermensaje="false";
		if ($('#hdTieneComentarios').val()=="false"){
			primermensaje="true";
		}

		//insertamos un comentario vacio (sera el padre del adjunto)
		$.ajax({ 
    		url: ipService+"/Notificaciones.svc/Comentar?id="+id+'|'+fecha+"&usuario="+usuario+"&mensaje="+mensaje+"&primermensaje="+primermensaje,
    		dataType: 'json', 
    		data: null, 
    		async: true,
    		beforeSend: function (){
	            $("#btnEnviarMensaje").prop('disabled', true);	            
        	}          		
    	})
    	.done(function(data){

    		if(data.idInterno>0){
		    	idComentario=data.idInterno;	//obtenemos el id del comentario insertado

		    	var inputz = document.getElementById('inpArchivo');

			     

			    var nombreAdjunto="";
			    if ('name' in inputz.files[0]) 
					nombreAdjunto = inputz.files[0].name; 
				else 
					nombreAdjunto = inputz.files[0].fileName;				


				//insertamos el registro del adjunto en SQL
		        $.ajax({ 
		    		url: ipService+"/Notificaciones.svc/InsertarAdjunto?idComentario="+idComentario+"&nombreAdjunto="+nombreAdjunto,
		    		dataType: 'json', 
		    		data: null, 
		    		async: true,
		    		beforeSend: function (){
			            
		        	}          		
		    	})
		    	.done(function(data){    		
					
		    		if (data!=null){

		    			//si todo esta ok guardamos el adjunto en disco
		    			var formData = new FormData();

		    			var anomes = fecha.substring(0,4)+fecha.substring(4,6);		    			
		    			formData.append("carpeta", anomes); //año y mes


				        if ('name' in inputz.files[0]) {
				        	formData.append("userfile", inputz.files[0], data.id + "_" + inputz.files[0].name);
				        }
				        else {
				            formData.append("userfile", inputz.files[0], data.id + "_" + inputz.files[0].fileName);
				        }

		    			$.ajax({
					        url: "upload.aspx",
					        type: "post",
					        dataType: "html",
					        data: formData,
					        cache: false,
					        contentType: false,
					        processData: false,
					    })
					    .done(function (res) {
					        //$("#mensaje").html("Respuesta: " + res);
					      	ListarComentarios();
						})
						.always(function() {    		    		
			    		    		
			  			});

		    		}

					

		    	})
		    	.always(function() {    		    		
		    		    		
		  		});



    		}
			
    	})
    	.always(function() {    		    		
    		//ListarComentarios();
    		$("#btnEnviarMensaje").prop('disabled', false);    		
  		});    		   	  
    });

    InicializarReconocimientoVoz();

   	$("#btnCancelarComentario").on("click", function(){
		ocultarModal("modal-eliminar-comentario");
	});

	$("#btnEliminarComentario").click(function(e){
		eliminarComentario(cIdInterno);
		cIdInterno="";
	});


}

function mostrarModalComentario(id){
	
	$('#hdId').val(id);	
	mostrarModal("modal-comentario");

	var ids = id.split("|");

	//var titulo = "Comentarios para datos del " + ids[3] + " para " + ids[4];

	var titulo = "Comentarios para datos del " + ids[3];

	if (ids[4]!="" && ids[4]!=undefined)
		titulo = titulo + " para " + ids[4]	

	if (ids[5]!="" & ids[5]!=undefined)
		titulo = titulo + " - " + ids[5]

	if (ids[6]!="" & ids[6]!=undefined)
		titulo = titulo + " - " + ids[6]

	if (ids[7]!="" & ids[7]!=undefined)
		titulo = titulo + " - " + ids[7]

	$('#lblTituloComentarios').text(titulo);

	ListarComentarios();
}

function editarComentario(idInterno){

	$("#btnEditarComentario_"+idInterno).addClass("d-none");
	$("#btnEditarComentario_"+idInterno).removeClass("d-inline-block");

	$("#btnEliminarComentario_"+idInterno).addClass("d-none");
	$("#btnEliminarComentario_"+idInterno).removeClass("d-inline-block");

	$("#btnAceptarComentario_"+idInterno).removeClass("d-none");
	$("#btnAceptarComentario_"+idInterno).addClass("d-inline-block");

	$("#btnCancelarComentario_"+idInterno).removeClass("d-none");
	$("#btnCancelarComentario_"+idInterno).addClass("d-inline-block");

	$("#lblComentario_"+idInterno).addClass("d-none");
	$("#lblComentario_"+idInterno).removeClass("d-inline");

	$("#txtComentario_"+idInterno).removeClass("d-none");
	$("#txtComentario_"+idInterno).addClass("");

	//$("#oMensajeEditado_"+idInterno).addClass("d-none");
	$("#oDivMensajeEditado_"+idInterno).addClass("d-none");
	
	
	$("#txtComentario_"+idInterno).val($("#lblComentario_"+idInterno).text());	
}

function cancelarComentario(idInterno){
	$("#btnAceptarComentario_"+idInterno).addClass("d-none");
	$("#btnAceptarComentario_"+idInterno).removeClass("d-inline-block");

	$("#btnCancelarComentario_"+idInterno).addClass("d-none");
	$("#btnCancelarComentario_"+idInterno).removeClass("d-inline-block");

	$("#btnEditarComentario_"+idInterno).removeClass("d-none");
	$("#btnEditarComentario_"+idInterno).addClass("d-inline-block");

	$("#btnEliminarComentario_"+idInterno).removeClass("d-none");
	$("#btnEliminarComentario_"+idInterno).addClass("d-inline-block");

	$("#txtComentario_"+idInterno).addClass("d-none")
	$("#txtComentario_"+idInterno).removeClass("d-block")

	$("#lblComentario_"+idInterno).removeClass("d-none");
	$("#lblComentario_"+idInterno).addClass("d-inline");
	
	//$("#oMensajeEditado_"+idInterno).removeClass("d-none");
	$("#oDivMensajeEditado_"+idInterno).removeClass("d-none");

	$("#txtComentario_"+idInterno).val("");
}

var bEnviandoComentario = false;
function aceptarComentario(idInterno){

	if (bEnviandoComentario)
		return;

	var mensaje = $("#txtComentario_"+idInterno).val();
	var usuario = localStorage["usuario"];

	$.ajax({ 
    		url: ipService+"/Notificaciones.svc/EditarComentario?id="+idInterno+"&mensaje="+mensaje,
    		dataType: 'json', 
    		data: null, 
    		async: true,
    		beforeSend: function (){
    			bEnviandoComentario=true;	            
        	}          		
    	})
    	.done(function(data){

    		if(data.codigo==0){

    			ListarComentarios();

    			$("#lblComentario_"+idInterno).text(mensaje);

    			$("#btnAceptarComentario_"+idInterno).addClass("d-none");
				$("#btnAceptarComentario_"+idInterno).removeClass("d-inline-block");

				$("#btnCancelarComentario_"+idInterno).addClass("d-none");
				$("#btnCancelarComentario_"+idInterno).removeClass("d-inline-block");

				$("#btnEditarComentario_"+idInterno).removeClass("d-none");
				$("#btnEditarComentario_"+idInterno).addClass("d-inline-block");

				$("#btnEliminarComentario_"+idInterno).removeClass("d-none");
				$("#btnEliminarComentario_"+idInterno).addClass("d-inline-block");

				$("#txtComentario_"+idInterno).addClass("d-none")
				$("#txtComentario_"+idInterno).removeClass("d-block")

				$("#lblComentario_"+idInterno).removeClass("d-none");
				$("#lblComentario_"+idInterno).addClass("d-inline");

				//$("#oMensajeEditado_"+idInterno).removeClass("d-none");
				$("#oDivMensajeEditado_"+idInterno).removeClass("d-none");


    			

    			//var titulo=obtenerCadenaElemento($('#hdId').val());
    			//console.log(titulo);
	    	


    		}
			
			
    	})
    	.always(function() {    		    		    		
    		bEnviandoComentario=false;
    		
  		});	
}

function preguntarEliminarComentario(idInterno){
	cIdInterno = idInterno;
	var fecha = $("#oFechaComentario_"+idInterno).text();
	$("#oCuerpoModalPregunta").text("¿Quieres eliminar este comentario del " + fecha + "?")
	$('#oModalPregunta').modal();
	mostrarModal("modal-eliminar-comentario");
}

function eliminarComentario(id){	
	$.ajax({ 
    		url: ipService+"/Notificaciones.svc/EliminarComentario?id="+id,
    		dataType: 'json', 
    		data: null, 
    		async: true,
    		beforeSend: function (){
	            
        	}          		
    	})
    	.done(function(data){    
    		ocultarModal("modal-eliminar-comentario");		
			ListarComentarios();  	
    	})
    	.always(function() {    		    		
    		    		
  		});
}

function ListarComentarios(){

	$(".contenedor-mensajes").empty();
	var div="";

	$('#hdTieneComentarios').val(false);	

	var id = $('#hdId').val();
	var usuario = localStorage["usuario"];
	
	$.ajax({ 
    		url: ipService+"/Notificaciones.svc/ListarComentarios?id="+id, 
    		dataType: 'json', 
    		data: null, 
    		async: true, 
    		success: function(data){        			

    			$.each(data, function (key, val) {

    				if (val.oculto==false){

    					$('#hdTieneComentarios').val(true);	

	    				div = "<div class='row contenedor-mensaje align-items-center'>";
	                    div = div + "<div class='col-12 col-md-4 col-lg-2'>";
	                    div = div + "	<i class='fas fa-user'></i>"
	                    div = div + "	<span class='usuario'> " + val.usuario + "</span> ";
	                    div = div + "</div>";
	                    div = div + "<div class='col-9 col-md-5 col-lg-7'>";
	                    div = div + "	<span id='oFechaComentario_" + val.idInterno + "'> " + val.fecha + "</span>";
	                    div = div + "</div>";
	                    div = div + "<div class='col-3 text-right'>";

	                    if (usuario==val.usuario && val.activo==true){
	                    	if (val.mensaje!="[Adjunto]"){
	   		                 	div = div + '	<i class="fas fa-edit accion" title="Editar" id="btnEditarComentario_' + val.idInterno + '" onclick="editarComentario(\'' + val.idInterno + '\');"></i>';	
	                    	}					
							div = div + '	<i class="fas fa-trash-alt accion" title="Eliminar" id="btnEliminarComentario_' + val.idInterno + '" onclick="preguntarEliminarComentario(\'' + val.idInterno + '\');"></i>';
	                    }
						
	                    div = div + "</div>";
	                    div = div + "<div class='col-12 mensaje'>";

	                    if (val.activo==true){
	                    	div = div +  "<div class='contenedor-comentario'>";

	                    	if (val.modificado){
	                    		div = div + "<div class='div-mensaje-editado' id='oDivMensajeEditado_" + val.idInterno + "'>";
	                    		div = div + "	<span class='contenedor-mensaje-editado' id='oMensajeEditado_" + val.idInterno + "'>";
	                    		div = div + "		<i class='fas fa-pencil-alt'></i>[Editado]";
	                    		div = div + "		<span id='lblComentario_" + val.idInterno + "'>" + val.mensaje + "</span>";
	                    		div = div + "	</span>";
	                    		div = div + "</div>";
	                    	}
	                    	else {
	                    		if (val.mensaje!="[Adjunto]")
	                    			div = div + "	<span id='lblComentario_" + val.idInterno + "'>" + val.mensaje + "</span>";	
	                    	}

	                    	//agregamos los adjuntos                    	
	                    	if (val.adjuntos.length>0){                    		
	                    		div = div + "<div>"
	                    		for (i=0;i<val.adjuntos.length;i++){
	                    			var carpeta = val.id.substring(val.id.lastIndexOf('|')+1,val.id.lastIndexOf('|')+7);
	                    			
	                    			

	                    			if (!parametros.modo_externo){

	                    				if (esImagen(val.adjuntos[i].nombre)) {                    				

		                    				/*
		                    				div = div + "<div class='text-center'>";
		                    				div = div + "	<a href='./uploads/" + carpeta + "/" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "' target='_blank'>";
		                    				div = div + "		<img src='./uploads/" + carpeta + "/m_" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "'></img>";	
		                    				div = div + "	</a>";
		                    				div = div + "</div>";
		                    				*/
		                    				
		                    				div = div + "<div class='text-center'>";
		                    				div = div + "	<a href='" + parametros.url_uploads + "/" + carpeta + "/" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "' target='_blank'>";
		                    				div = div + "		<img src='" + parametros.url_uploads + "/" + carpeta + "/m_" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "'></img>";	
		                    				div = div + "	</a>";
		                    				div = div + "</div>";


		                    			}
		                    			else{
		                    				/*
		                    				div = div + "<div class='text-center'>";
		                    				div = div + "	<a href='./uploads/" + carpeta + "/" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "' target='_blank'>";
		                    				div = div + "		<img src='./img/file.png'></img>";
		                    				div = div + "	</a>";
		                    				div = div + "</div>";
		                    				*/

		                    				div = div + "<div class='text-center'>";
		                    				div = div + "	<a href='" + parametros.url_uploads + "//" + carpeta + "//" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "' target='_blank'>";
		                    				div = div + "		<img src='./img/file.png'></img>";
		                    				div = div + "	</a>";
		                    				div = div + "</div>";

		                    			}
	                    			}
	                    			else {
											div = div + "<div class='text-center'>";
		                    				//div = div + "	<a href='" + urlUploads + "//" + carpeta + "//" + val.adjuntos[i].id + "_" + val.adjuntos[i].nombre + "' target='_blank'>";
		                    				div = div + "		<img src='./img/file-disabled-120.png' title='Visualización bloqueada'></img>";
		                    				//div = div + "	</a>";
		                    				div = div + "</div>";
	                    			}

	                    			
	                    			div = div + "<div class='text-center'>";
	                    			div = div + val.adjuntos[i].nombre;
	                    			div = div + "</div>";

	                    		}
	                    		div = div + "</div>"
	                    	} 
	                    	                 	
	                    	
	                    	div = div +  "</div>"

		                    if (usuario==val.usuario && val.mensaje!="[Adjunto]"){
		                    	div = div + "	<input type='text' class='form-control d-none' id='txtComentario_" + val.idInterno + "' placeholder='Ingrese el texto aquí' value='" + val.mensaje + "'>";
		                    	div = div + '	<i class="fas fa-times accion cancelar-comentario d-none" id="btnCancelarComentario_' + val.idInterno + '" title="Cancelar" onclick="cancelarComentario(\'' + val.idInterno + '\');"></i>';
								div = div + '	<i class="fas fa-paper-plane accion aceptar-comentario d-none" id="btnAceptarComentario_' + val.idInterno + '" title="Aceptar" onclick="aceptarComentario(\'' + val.idInterno + '\');"></i>';
		                    }
	                    }
	                    else {
	                    	div = div + '<div class="alert alert-secondary" role="alert" style="padding: 9px 14px;">';
	                    	div = div + '	<i class="fas fa-ban"></i> Se eliminó este comentario';
	                    	div = div + '</div>';
	                    }

	                                       
	                    div = div + "</div>"

	                    div = div + "</div>"

	                    $(div).appendTo(".contenedor-mensajes");
    				}

    				

    			});

				var objDiv = document.getElementById("oContenedorMensajes");
				objDiv.scrollTop = objDiv.scrollHeight;
			
    		}
    });	
}

function enviarMensaje(){
	
	var id = $('#hdId').val();
	var usuario = localStorage["usuario"];
	var mensaje = $("#txtMensaje").val();

	var d = new Date();
	var fecha = obtener_cadena_fecha_y_hora_estandar_con_ms(d);

	var primermensaje="false";
	if ($('#hdTieneComentarios').val()=="false"){
		primermensaje="true";
	}

	$.ajax({ 
		url: ipService+"/Notificaciones.svc/Comentar?id="+id+'|'+fecha+"&usuario="+usuario+"&mensaje="+mensaje+"&primermensaje="+primermensaje,
		dataType: 'json', 
		data: null, 
		async: true,
		beforeSend: function (){
            $("#btnEnviarMensaje").prop('disabled', true);	            
    	}          		
	})
	.done(function(data){

		if(data.idInterno>0){
			//var titulo=obtenerCadenaElemento(id);	    	
		}

		$("#txtMensaje").val("");  
		noteContent=""; //limpiamos memoria de texto de voz  		
	})
	.always(function() {    		    		
		ListarComentarios();
		$("#btnEnviarMensaje").prop('disabled', false);		
	});

}

function modificarTamanoFuente(valor){

		localStorage.fontSize=valor;

		var valorAnterior=$(".font_size_setting").attr("data-valor-actual");		
		var dif =valor - valorAnterior;
		var temp = "";

		temp=(parseInt($("body").css("font-size"))+dif)+"px";
		$("body").css("font-size", temp)

		temp=(parseInt($(".form-control, .dataTables_wrapper .dataTables_filter").css("font-size"))+dif)+"px";
		$(".form-control, .dataTables_wrapper .dataTables_filter").css("font-size",temp);

		temp=(parseInt($(".btn, .dataTables_wrapper .dataTables_paginate .paginate_button").css("font-size"))+dif)+"px";
		$(".btn, .dataTables_wrapper .dataTables_paginate .paginate_button").css("font-size",temp) ;

		temp=(parseInt($(".chip").css("font-size"))+dif)+"px";
		$(".chip").css("font-size",temp);

		temp=(parseInt($(".nav-link").css("font-size"))+dif)+"px";
		$(".nav-link").css("font-size",temp);

		temp=(parseInt($(".card-title").css("font-size"))+dif)+"px";
		$(".card-title").css("font-size",temp);

		temp=(parseInt($(".footer").css("font-size"))+dif)+"px";
		$(".footer").css("font-size",temp);

		//ojos estas 2 tablas hay que volver a procesar font cada peticion(solo td)
		temp=(parseInt($("#tabla-produccion-productos td, #tabla-produccion-productos th").css("font-size"))+dif)+"px";
		$("#tabla-produccion-productos td, #tabla-produccion-productos th").css("font-size",temp);
		temp=(parseInt($("#tabla-produccion-productos-sumarizado td, #tabla-produccion-productos-sumarizado th").css("font-size"))+dif)+"px";
		$("#tabla-produccion-productos-sumarizado td, #tabla-produccion-productos-sumarizado th").css("font-size",temp);

		//ojos estas 2 tablas hay que volver a procesar font cada peticion(solo td)
		temp=(parseInt($("#tabla-energia-produccion-productos td, #tabla-energia-produccion-productos th").css("font-size"))+dif)+"px";
		$("#tabla-energia-produccion-productos td, #tabla-energia-produccion-productos th").css("font-size",temp);
		temp=(parseInt($("#tabla-energia-produccion-productos-sumarizado td, #tabla-energia-produccion-productos-sumarizado th").css("font-size"))+dif)+"px";
		$("#tabla-energia-produccion-productos-sumarizado td, #tabla-energia-produccion-productos-sumarizado th").css("font-size",temp);

		//ojos esta tabla hay que volver a procesar font cada peticion(solo td)
		temp=(parseInt($(".tabla-calidad td, .tabla-calidad th").css("font-size"))+dif)+"px";
		$(".tabla-calidad td, .tabla-calidad th").css("font-size",temp);
	
		//tmb volver a procesar
		temp=(parseInt($(".calidad-tonelaje").css("font-size"))+dif)+"px";
		$(".calidad-tonelaje").css("font-size",temp);

		temp=(parseInt($("#chk-ocultar-maquinas span:first-child").css("font-size"))+dif)+"px";
		$("#chk-ocultar-maquinas span:first-child").css("font-size",temp); 

		temp=(parseInt($(".h5, h5").css("font-size"))+dif)+"px";
		$(".h5, h5").css("font-size",temp); 

		temp=(parseInt($("#chk-ocultar-maquinas2 span:first-child").css("font-size"))+dif)+"px";
		$("#chk-ocultar-maquinas2 span:first-child").css("font-size",temp);

		//tmb volver a procesar (solo td)
		temp=(parseInt($("#tabla-procesos td, #tabla-procesos th").css("font-size"))+dif)+"px";
		$("#tabla-procesos td, #tabla-procesos th").css("font-size",temp);



		$(".font_size_setting").attr("data-valor-actual",valor);
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

	var fecha = $("#fecha-reporte").val();
	var tipo = capturarValorURL("tipo");
	if (tipo==false){
		tipo="";
	}
	else {
		tipo=" CONCILIADO";
	}
	
	var nombreReporte = "RDP"+tipo+"-"+fecha;

	instance.export2file(exportData.data, exportData.mimeType, nombreReporte, exportData.fileExtension);
}

var xhr;
function cargarRDP(){
	var fecha = $("#fecha-reporte").val();
	var verceros = $('#chk-ver-ceros').prop('checked')?1:0;

	//para comentarios
	var id="";
	var idAplicacionFinal="";
	var titulo="DETALLE DE PRODUCCION Y CONSUMOS";
	
	if (tipo==false){
		idAplicacionFinal=parametros.id_aplicacion;
	}
	else if (tipo.toUpperCase()=="ORIGINAL") {
		idAplicacionFinal=parametros.id_aplicacion;
	}
	else if (tipo.toUpperCase()=="CORREGIDO") {
		idAplicacionFinal=parametros.id_aplicacion+"Corregido";
		titulo = titulo + " CONCILIADO <i class='fas fa-handshake visible'></i> ";
	}
	//else if (tipo=="NOTIFICACION") {
	//	idAplicacionFinal=parametros.id_aplicacion+"Notificacion";
	//}	

	if (vista.toUpperCase()=="NOTIFICACION"){
		titulo = titulo + " PARA NOTIFICACION";		
	}

	$("#titulo-pagina").html(titulo)	
	

	xhr = $.ajax({ 
		url: ipService+"/RDP.svc/ObtenerRDP?fecha="+fecha+"&tipo="+tipo+"&verceros="+verceros+"&vista="+vista, 
		dataType: 'json', 
		data: null, 
		async: 	true, 
		beforeSend: function (){            
			$("#chk-ver-ceros").attr("disabled", true);

        	$("#cuerpo-tabla-arbol-rdp").empty();
        	$("#spin-tabla-arbol-rdp").removeClass("d-none");
        	$("#contenedor-tabla-arbol-rdp").addClass("d-none");

        	$("#cuerpo-tabla-arbol-rdp2").empty();
        }, 
        success: function(data){ 

        	//tabla principal
        	var tr="";
        	$.each(data, function (key, val) {	

        		id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val.COD_GRUPO + "|||";

        		tr = tr + '<tr data-id="' + val.COD_GRUPO + '|" class="arbol-nivel-1">';
        		tr = tr + '		<td class="text-left principal">';
                tr = tr + '		     <span class="simbolo">+</span>&nbsp;';
                tr = tr + 			 val.COD_GRUPO;
                tr = tr + '		</td>';
                tr = tr + '		<td class="text-left"></td>';
                tr = tr + '		<td class="text-left"></td>';
                tr = tr + '		<td class="text-left"></td>';                
                tr = tr + '		<td class="text-right CNT_HORAS">' + val.CNT_HORAS + '</td>';
                tr = tr + '		<td class="text-right CNT_TONELADAS">' + val.CNT_TONELADAS + '</td>';
                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
                tr = tr + '		<td class="text-right TH">' + val.TH + '</td>';
                tr = tr + '		<td class="text-right SEMAFORO_TH"></td>';
                tr = tr + '		<td class="text-right DOSIFICACION"></td>';
                tr = tr + '		<td class="text-right IMP_COSTO_UNIT"></td>';
                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL"></td>';                
				tr = tr + '		<td class="text-center">';
                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
                tr = tr + '		</td>';
                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';
        		tr = tr + '</tr>';

        		$.each(val.MAQUINAS, function (key2, val2) {	

        			id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val2.COD_GRUPO + "|" + val2.COD_MAQUINA + "||";

        			tr = tr + '<tr data-id="' + val2.COD_GRUPO + '|' + val2.COD_MAQUINA + '|" data-padre-id="' + val2.COD_GRUPO + '|" class="arbol-nivel-2 d-none">';
        			tr = tr + '		<td class="text-left"></td>';
        			tr = tr + '		<td class="text-left principal">';
                	tr = tr + '		     <span class="simbolo">+</span>&nbsp;';
                	tr = tr + 			 val2.COD_MAQUINA;
                	tr = tr + '		     &nbsp;&nbsp;<i class="fas fa-angle-double-down expandir-maquina"></i>';                	
                	tr = tr + '		</td>';                
                	tr = tr + '		<td class="text-left"></td>';
                	tr = tr + '		<td class="text-left"></td>';                	
                	tr = tr + '		<td class="text-right CNT_HORAS">' + val2.CNT_HORAS + '</td>';
	                tr = tr + '		<td class="text-right CNT_TONELADAS">' + val2.CNT_TONELADAS + '</td>';
	                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
	                tr = tr + '		<td class="text-right TH">' + val2.TH + '</td>';
	                tr = tr + '		<td class="text-right SEMAFORO_TH">';
	                tr = tr + ' 		<i class="fas fa-circle" style="color:' + val2.DSC_COLOR_TH + ';"></i>';
	                tr = tr + '		</td>';
	                tr = tr + '		<td class="text-right DOSIFICACION"></td>';
	                tr = tr + '		<td class="text-right IMP_COSTO_UNIT"></td>';
	                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL"></td>';	                
					tr = tr + '		<td class="text-center">';
	                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
	                tr = tr + '		</td>';
	                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';
					tr = tr + '</tr>';        			

					$.each(val2.PRODUCTOS, function (key3, val3) {	

						id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val3.COD_GRUPO + "|" + val3.COD_MAQUINA + "|" + val3.COD_PRODUCTO + "|";					

	        			tr = tr + '<tr data-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|' + val3.COD_PRODUCTO + '|" data-padre-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|" class="arbol-nivel-3 d-none">';
	        			tr = tr + '		<td class="text-left"></td>';
	        			tr = tr + '		<td class="text-left"></td>';
	        			tr = tr + '		<td class="text-left principal">';
	                	tr = tr + '		     <span class="simbolo">+</span>&nbsp;';
	                	tr = tr + 			 val3.COD_PRODUCTO;
	                	tr = tr + '		</td>';                
	                	tr = tr + '		<td class="text-left">' + val3.DSC_OP + '</td>';	                	
	                	tr = tr + '		<td class="text-right CNT_HORAS">' + val3.CNT_HORAS + '</td>';
		                tr = tr + '		<td class="text-right CNT_TONELADAS">' + val3.CNT_TONELADAS + '</td>';
		                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
		                tr = tr + '		<td class="text-right TH">' + val3.TH + '</td>';
		                tr = tr + '		<td class="text-right SEMAFORO_TH"></td>';
		                tr = tr + '		<td class="text-right DOSIFICACION"></td>';
		                tr = tr + '		<td class="text-right IMP_COSTO_UNIT">' + val3.IMP_COSTO_UNIT + '</td>';
		                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL">' + val3.IMP_COSTO_TOTAL + '</td>';	                
						tr = tr + '		<td class="text-center">';
		                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
		                tr = tr + '		</td>';
		                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';
						tr = tr + '</tr>';     

						$.each(val3.MATERIALES, function (key4, val4) {	

							id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val4.COD_GRUPO + "|" + val4.COD_MAQUINA + "|" + val4.COD_PRODUCTO + "|" + val4.COD_MATERIAL;					

		        			tr = tr + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|" class="arbol-nivel-4 d-none">';
		        			tr = tr + '		<td class="text-left"></td>';
		        			tr = tr + '		<td class="text-left"></td>';
		        			tr = tr + '		<td class="text-left"></td>';
		        			tr = tr + '		<td class="text-left principal">';	
		        			tr = tr + '		     <span class="simbolo">+</span>&nbsp;';	                	
		                	tr = tr + 			 val4.COD_MATERIAL;
		                	tr = tr + '		</td>';		                	
		                	tr = tr + '		<td class="text-right CNT_HORAS"></td>';
		                	tr = tr + '		<td class="text-right CNT_TONELADAS"></td>';
			                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF" data-produccion="'+val3.CNT_TONELADAS+'">' + val4.CNT_TONELADASNOTIF + '</td>';
			                tr = tr + '		<td class="text-right TH"></td>';
			                tr = tr + '		<td class="text-right SEMAFORO_TH"></td>';
			                tr = tr + '		<td class="text-right DOSIFICACION">' + val4.DOSIFICACION + '</td>';
			                tr = tr + '		<td class="text-right IMP_COSTO_UNIT">' + val4.IMP_COSTO_UNIT + '</td>';
			                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL">' + val4.IMP_COSTO_TOTAL + '</td>';	                
							tr = tr + '		<td class="text-center">';
			                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
			                tr = tr + '		</td>';
			                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';
							tr = tr + '</tr>';

							$.each(val4.MATERIALES, function (key6, val6) {	
								tr = tr + '<tr data-padre-id="' + val6.COD_GRUPO + '|' + val6.COD_MAQUINA + '|' + val6.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" class="arbol-nivel-5 d-none">';
								tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left principal">';	
			        			tr = tr + '		     &nbsp;&nbsp;&nbsp;&nbsp;<span class="simbolo">+</span>&nbsp;';	                	
			                	tr = tr + 			 val6.COD_MATERIAL;
			                	tr = tr + '		</td>';		                	
			                	tr = tr + '		<td class="text-right CNT_HORAS"></td>';
			                	tr = tr + '		<td class="text-right CNT_TONELADAS"></td>';
				                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF" data-produccion="'+val3.CNT_TONELADAS+'">' + val6.CNT_TONELADASNOTIF + '</td>';
				                tr = tr + '		<td class="text-right TH"></td>';
				                tr = tr + '		<td class="text-right SEMAFORO_TH"></td>';
				                tr = tr + '		<td class="text-right DOSIFICACION">' + val6.DOSIFICACION + '</td>';
				                tr = tr + '		<td class="text-right IMP_COSTO_UNIT">' + val6.IMP_COSTO_UNIT + '</td>';
				                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL">' + val6.IMP_COSTO_TOTAL + '</td>';	                
								tr = tr + '		<td class="text-center">';
				                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
				                tr = tr + '		</td>';
				                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';
								tr = tr + '</tr>';
							});

							if (val4.MATERIALES_SAP != null){

								tr = tr + '<tr data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" class="arbol-nivel-5 d-none">';
			        			tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left"></td>';
			        			tr = tr + '		<td class="text-left"></td>';		                	
			                	tr = tr + '		<td class="text-left" colSpan="10">';
			                	tr = tr + "			<table class='tabla-materiales-sap table table-sm table-hover table-vcenter text-nowrap mb-1 mt-1'>";
			                	tr = tr + "				<tr>";
						    	tr = tr + "					<th>Material SAP</td>";
						    	tr = tr + "					<th class='text-right'>Porcentaje</td>";
						    	tr = tr + "					<th class='text-right'>Consumo(T)</td>";						    	
						    	tr = tr + "				</tr>";

								$.each(val4.MATERIALES_SAP, function (key5, val5) {	
									if (!(val5.CNT_PORCENTAJE=="0" || val5.CNT_PORCENTAJE=="")){
										tr = tr + "		<tr>";
							    		tr = tr + "			<td>" + val5.COD_MATERIAL_SAP + " (" + val5.DSC_MATERIAL_SAP + ")</td>";
							    		tr = tr + "			<td class='text-right'>" + val5.CNT_PORCENTAJE + "%</td>";
							    		tr = tr + "			<td class='text-right'>" + val5.CNT_TONELADASNOTIF + "</td>";						    		
							    		tr = tr + "		</tr>";
									}
									
								});	

								tr = tr + "			</table>";
			                	tr = tr + '		</td>';
								tr = tr + '</tr>';	
							}							

		        		});

	        		});

        		});
        	});

        	$("#cuerpo-tabla-arbol-rdp").html(tr);



        	//tabla para exportar y copy/paste
        	var tr2="";
        	$.each(data, function (key, val) {	

        		id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val.COD_GRUPO + "|||";

        		tr2 = tr2 + '<tr data-id="' + val.COD_GRUPO + '" class="arbol-nivel-1">';
        		tr2 = tr2 + '		<td class="text-left">';                
                tr2 = tr2 + 			 val.COD_GRUPO;
                tr2 = tr2 + '		</td>';
                tr2 = tr2 + '		<td class="text-left"></td>';
                tr2 = tr2 + '		<td class="text-left"></td>';
                tr2 = tr2 + '		<td class="text-left"></td>';                
                tr2 = tr2 + '		<td class="text-right CNT_HORAS">' + val.CNT_HORAS.replace(/,/g, "") + '</td>';
                tr2 = tr2 + '		<td class="text-right CNT_TONELADAS">' + val.CNT_TONELADAS.replace(/,/g, "")  + '</td>';
                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
                tr2 = tr2 + '		<td class="text-right TH">' + val.TH.replace(/,/g, "") + '</td>';
                tr2 = tr2 + '		<td class="text-right DOSIFICACION"></td>';
                tr2 = tr2 + '		<td class="text-right IMP_COSTO_UNIT"></td>';
                tr2 = tr2 + '		<td class="text-right IMP_COSTO_TOTAL"></td>';                
				tr2 = tr2 + '		<td class="text-center">';                
                tr2 = tr2 + '		</td>';
                tr2 = tr2 + '		<td class="text-center BTN_COSTOS"></td>';
        		tr2 = tr2 + '</tr>';

        		$.each(val.MAQUINAS, function (key2, val2) {	

        			id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val2.COD_GRUPO + "|" + val2.COD_MAQUINA + "||";

        			tr2 = tr2 + '<tr data-id="' + val2.COD_GRUPO + '|' + val2.COD_MAQUINA + '" data-padre-id="' + val2.COD_GRUPO + '" class="arbol-nivel-2">';
        			tr2 = tr2 + '		<td class="text-left"></td>';
        			tr2 = tr2 + '		<td class="text-left">';                	
                	tr2 = tr2 + 			 val2.COD_MAQUINA;
                	tr2 = tr2 + '		</td>';                
                	tr2 = tr2 + '		<td class="text-left"></td>';
                	tr2 = tr2 + '		<td class="text-left"></td>';                	
                	tr2 = tr2 + '		<td class="text-right CNT_HORAS">' + val2.CNT_HORAS.replace(/,/g, "")  + '</td>';
	                tr2 = tr2 + '		<td class="text-right CNT_TONELADAS">' + val2.CNT_TONELADAS.replace(/,/g, "")  + '</td>';
	                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
	                tr2 = tr2 + '		<td class="text-right TH">' + val2.TH.replace(/,/g, "")  + '</td>';
	                tr2 = tr2 + '		<td class="text-right DOSIFICACION"></td>';
	                tr2 = tr2 + '		<td class="text-right IMP_COSTO_UNIT"></td>';
	                tr2 = tr2 + '		<td class="text-right IMP_COSTO_TOTAL"></td>';	                
					tr2 = tr2 + '		<td class="text-center">';	                
	                tr2 = tr2 + '		</td>';
	                tr2 = tr2 + '		<td class="text-center BTN_COSTOS"></td>';
					tr2 = tr2 + '</tr>';        			

					$.each(val2.PRODUCTOS, function (key3, val3) {	

						id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val3.COD_GRUPO + "|" + val3.COD_MAQUINA + "|" + val3.COD_PRODUCTO + "|";					

	        			tr2 = tr2 + '<tr data-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|' + val3.COD_PRODUCTO + '" data-padre-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '" class="arbol-nivel-3">';
	        			tr2 = tr2 + '		<td class="text-left"></td>';
	        			tr2 = tr2 + '		<td class="text-left"></td>';
	        			tr2 = tr2 + '		<td class="text-left tableexport-string">';	                	
	                	tr2 = tr2 + 			 val3.COD_PRODUCTO;
	                	tr2 = tr2 + '		</td>';                
	                	tr2 = tr2 + '		<td class="text-left"></td>';	                	
	                	tr2 = tr2 + '		<td class="text-right CNT_HORAS">' + val3.CNT_HORAS.replace(/,/g, "")  + '</td>';
		                tr2 = tr2 + '		<td class="text-right CNT_TONELADAS">' + val3.CNT_TONELADAS.replace(/,/g, "")  + '</td>';
		                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
		                tr2 = tr2 + '		<td class="text-right TH">' + val3.TH.replace(/,/g, "")  + '</td>';
		                tr2 = tr2 + '		<td class="text-right DOSIFICACION"></td>';
		                tr2 = tr2 + '		<td class="text-right IMP_COSTO_UNIT">' + val3.IMP_COSTO_UNIT.replace(/,/g, "")  + '</td>';
		                tr2 = tr2 + '		<td class="text-right IMP_COSTO_TOTAL">' + val3.IMP_COSTO_TOTAL.replace(/,/g, "")  + '</td>';	                
						tr2 = tr2 + '		<td class="text-center">';		                
		                tr2 = tr2 + '		</td>';
		                tr2 = tr2 + '		<td class="text-center BTN_COSTOS"></td>';
						tr2 = tr2 + '</tr>';     

						$.each(val3.MATERIALES, function (key4, val4) {	

							id = idAplicacionFinal + "|index|rdp|" + fecha + "|" + val4.COD_GRUPO + "|" + val4.COD_MAQUINA + "|" + val4.COD_PRODUCTO + "|" + val4.COD_MATERIAL;					

		        			tr2 = tr2 + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '" class="arbol-nivel-4">';
		        			tr2 = tr2 + '		<td class="text-left"></td>';
		        			tr2 = tr2 + '		<td class="text-left"></td>';
		        			tr2 = tr2 + '		<td class="text-left"></td>';
		        			tr2 = tr2 + '		<td class="text-left tableexport-string">';		                	
		                	tr2 = tr2 + 			 (val4.COD_MATERIAL=="Sikagrind 285"?"Sikagrind_285":(val4.COD_MATERIAL=="ESE 388"?"ESE_388":val4.COD_MATERIAL));
		                	tr2 = tr2 + '		</td>';		                	
		                	tr2 = tr2 + '		<td class="text-right CNT_HORAS"></td>';
		                	tr2 = tr2 + '		<td class="text-right CNT_TONELADAS"></td>';
			                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF">' + val4.CNT_TONELADASNOTIF.replace(/,/g, "")  + '</td>';
			                tr2 = tr2 + '		<td class="text-right TH"></td>';
			                tr2 = tr2 + '		<td class="text-right DOSIFICACION">' + val4.DOSIFICACION.replace(/,/g, "")  + '</td>';
			                tr2 = tr2 + '		<td class="text-right IMP_COSTO_UNIT">' + val4.IMP_COSTO_UNIT.replace(/,/g, "")  + '</td>';
			                tr2 = tr2 + '		<td class="text-right IMP_COSTO_TOTAL">' + val4.IMP_COSTO_TOTAL.replace(/,/g, "")  + '</td>';	                
							tr2 = tr2 + '		<td class="text-center">';			                
			                tr2 = tr2 + '		</td>';
			                tr2 = tr2 + '		<td class="text-center BTN_COSTOS"></td>';
							tr2 = tr2 + '</tr>';  

							$.each(val4.MATERIALES, function (key6, val6) {	
								tr2 = tr2 + '<tr data-padre-id="' + val6.COD_GRUPO + '|' + val6.COD_MAQUINA + '|' + val6.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" class="arbol-nivel-5">';
								tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left principal">';	
			        			tr2 = tr2 + '		     ...';	                	
			                	tr2 = tr2 + 			 val6.COD_MATERIAL;
			                	tr2 = tr2 + '		</td>';		                	
			                	tr2 = tr2 + '		<td class="text-right CNT_HORAS"></td>';
			                	tr2 = tr2 + '		<td class="text-right CNT_TONELADAS"></td>';
				                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF">' + val6.CNT_TONELADASNOTIF.replace(/,/g, "") + '</td>';
				                tr2 = tr2 + '		<td class="text-right TH"></td>';				                
				                tr2 = tr2 + '		<td class="text-right DOSIFICACION">' + val6.DOSIFICACION.replace(/,/g, "") + '</td>';
				                tr2 = tr2 + '		<td class="text-right IMP_COSTO_UNIT">' + val6.IMP_COSTO_UNIT.replace(/,/g, "") + '</td>';
				                tr2 = tr2 + '		<td class="text-right IMP_COSTO_TOTAL">' + val6.IMP_COSTO_TOTAL.replace(/,/g, "") + '</td>';	                
								tr2 = tr2 + '		<td class="text-center">';				                
				                tr2 = tr2 + '		</td>';
				                tr2 = tr2 + '		<td class="text-center BTN_COSTOS"></td>';
								tr2 = tr2 + '</tr>';
							});

							if (val4.MATERIALES_SAP != null){

								tr2 = tr2 + '<tr data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '" class="arbol-nivel-5">';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';		                	
			                	tr2 = tr2 + '		<td class="text-left" colSpan="3">Material SAP</td>';
			                	tr2 = tr2 + '		<td class="text-right">Porcentaje</td>';
			                	tr2 = tr2 + '		<td class="text-right">Consumo(T)</td>';			                	
			                	tr2 = tr2 + '		<td class="text-left IMP_COSTO_UNIT"></td>';		                	
			                	tr2 = tr2 + '		<td class="text-left IMP_COSTO_TOTAL"></td>';		                	
			                	tr2 = tr2 + '		<td class="text-center"></td>';		                	
			                	tr2 = tr2 + '		<td class="text-left BTN_COSTOS"></td>';		                				                	
			                	tr2 = tr2 + "</tr>";

								$.each(val4.MATERIALES_SAP, function (key5, val5) {	
									if (!(val5.CNT_PORCENTAJE=="0" || val5.CNT_PORCENTAJE=="")){
										tr2 = tr2 + "		<tr class='arbol-nivel-5'>";
										tr2 = tr2 + '			<td class="text-left"></td>';
				        				tr2 = tr2 + '			<td class="text-left"></td>';
				        				tr2 = tr2 + '			<td class="text-left"></td>';
				        				tr2 = tr2 + '			<td class="text-left"></td>';		                				                	
							    		tr2 = tr2 + "			<td colSpan='3' class='tableexport-string'><span>" + val5.COD_MATERIAL_SAP.replace(/-/gi,'–') + " (" + val5.DSC_MATERIAL_SAP + ")</span></td>";
							    		tr2 = tr2 + "			<td class='text-right'>" + val5.CNT_PORCENTAJE + "%</td>";
							    		tr2 = tr2 + "			<td class='text-right'>" + val5.CNT_TONELADASNOTIF.replace(/,/g, "")  + "</td>";						    		
				        				tr2 = tr2 + '			<td class="text-left IMP_COSTO_UNIT"></td>';
				        				tr2 = tr2 + '			<td class="text-left IMP_COSTO_TOTAL"></td>';
				        				tr2 = tr2 + '			<td class="text-center"></td>';		                				                	
				        				tr2 = tr2 + '			<td class="text-left BTN_COSTOS"></td>';			        				
							    		tr2 = tr2 + "		</tr>";
									}									
								});	


/*
								tr2 = tr2 + "			</table>";
			                	tr2 = tr2 + '		</td>';
								tr2 = tr2 + '</tr>';



								tr2 = tr2 + '<tr data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '" class="arbol-nivel-5">';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';
			        			tr2 = tr2 + '		<td class="text-left"></td>';		                	
			                	tr2 = tr2 + '		<td class="text-left" colSpan="10">';
			                	tr2 = tr2 + "			<table class='tabla-materiales-sap table table-sm table-hover table-vcenter text-nowrap mb-1 mt-1'>";
			                	tr2 = tr2 + "				<tr>";
						    	tr2 = tr2 + "					<th>Material SAP</td>";
						    	tr2 = tr2 + "					<th class='text-right'>Porcentaje</td>";
						    	tr2 = tr2 + "					<th class='text-right'>Consumo(T)</td>";						    	
						    	tr2 = tr2 + "				</tr>";

								$.each(val4.MATERIALES_SAP, function (key5, val5) {	
									tr2 = tr2 + "		<tr>";
						    		tr2 = tr2 + "			<td>" + val5.COD_MATERIAL_SAP + " (" + val5.DSC_MATERIAL_SAP + ")</td>";
						    		tr2 = tr2 + "			<td class='text-right'>" + val5.CNT_PORCENTAJE + "%</td>";
						    		tr2 = tr2 + "			<td class='text-right'>" + val5.CNT_TONELADASNOTIF + "</td>";						    		
						    		tr2 = tr2 + "		</tr>";
								});	

								tr2 = tr2 + "			</table>";
			                	tr2 = tr2 + '		</td>';
								tr2 = tr2 + '</tr>';	
								*/
							}	      			
		        		});

	        		});

        		});
        	});

        	$("#cuerpo-tabla-arbol-rdp2").html(tr2);

        },
        complete: function(){
			
			$("#chk-ver-ceros").removeAttr("disabled");

			$("#spin-tabla-arbol-rdp").addClass("d-none");
			$("#contenedor-tabla-arbol-rdp").removeClass("d-none");

			$("#cuerpo-tabla-arbol-rdp .principal").on("click", function(){					
				
		    	var id = $(this).parent().attr("data-id");    	

		    	if ($(this).find("span.simbolo").text()=="-"){
		    		$(this).find("span.simbolo").text("+");
		    		$("#cuerpo-tabla-arbol-rdp tr[data-padre-id^='" + id + "']").addClass("d-none");	
		    		$("#cuerpo-tabla-arbol-rdp tr[data-padre-id^='" + id + "']").find(".principal span.simbolo").text("+");
		    	}
		    	else{
		    		$(this).find("span.simbolo").text("-");
		    		$("#cuerpo-tabla-arbol-rdp tr[data-padre-id='" + id + "']").removeClass("d-none");	
		    	}
			});	

			$(".comentario").on("click", function(){
		    	var id = $(this).attr("data-id");
		    	mostrarModalComentario(id);
		    });

		    $(".expandir-maquina").on("click", function(ev){

		    	var id = $(this).parent().parent().attr("data-id");
		    	
		    	$(this).parent().find("span.simbolo").text("-");
		    	$("#cuerpo-tabla-arbol-rdp tr[data-padre-id^='" + id + "']").removeClass("d-none");
		    	$("#cuerpo-tabla-arbol-rdp tr[data-padre-id^='" + id + "'] span.simbolo").text("-");

		    	ev.stopPropagation();		    
		    });

		    $(".arbol-nivel-4 .CNT_TONELADASNOTIF").mouseenter(function() {		    	
		    	
				var nConsumo = $(this).html().replace(/,/g, '');
				var nProduccion = $(this).attr("data-produccion").replace(/,/g, '');

				var nFactor = nConsumo/nProduccion;				  

		    	$(this).attr("title","Factor Consumo: " + nFactor.toFixed(4));
		    });

		    $( ".arbol-nivel-3 .CNT_TONELADASNOTIF" ).trigger( "mouseenter" );
			$( ".arbol-nivel-3 .CNT_TONELADASNOTIF" ).trigger( "mouseleave" );	

			$(".IMP_COSTO_UNIT").hide();
			$(".IMP_COSTO_TOTAL").hide();
			$(".BTN_COSTOS").hide();

		}
    });
}

function obtenerCadenaElemento(id){
	var arr=id.split('|');
	var cadena = "";

	if (arr[0].indexOf("Corregido")!=-1)
		cadena="RDP Conciliado";
	else
		cadena="RDP";

	cadena = cadena + "->" + arr[3];

	if(arr[4]!="") 
		cadena = cadena + "->" + arr[4];

	if(arr[5]!="") 
		cadena = cadena + "->" + arr[5];

	if(arr[6]!="") 
		cadena = cadena + "->" + arr[6];	

	return cadena;
}






function InicializarReconocimientoVoz(){
    try {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
      recognition = new SpeechRecognition();
      console.log("funcion de voz soportada");

      recognition.continuous = true;

      recognition.onresult = function(event) {

        // event is a SpeechRecognitionEvent object.
        // It holds all the lines we have captured so far. 
        // We only need the current one.
        var current = event.resultIndex;

        // Get a transcript of what was said.
        var transcript = event.results[current][0].transcript;

        // Add the current transcript to the contents of our Note.
        // There is a weird bug on mobile, where everything is repeated twice.
        // There is no official solution so far so we have to handle an edge case.
        var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

        if(!mobileRepeatBug) {
          noteContent += transcript;              
          //$("#txtMensaje").focus();
          //$("#txtMensaje").val('');
          

          $("#txtMensaje").val(noteContent);
          var fldLength= $("#txtMensaje").val().length;              
          $("#txtMensaje").focus();                                          
          $("#txtMensaje").putCursorAtEnd();
          $("#btnVoz").focus();
          $("#txtMensaje").focus();                            
          $("#txtMensaje").putCursorAtEnd();
        }
      };

      recognition.onstart = function() { 
        console.log("Reconocimiento de voz activada");

        $("#btnVoz").addClass("active");
        $("#btnVoz").attr("aria-pressed","true");
      }

      recognition.onspeechend = function() {            
        console.log("Reconocimiento de voz terminada (largo tiempo en silecio)");

        $("#btnVoz").removeClass("active");
        $("#btnVoz").attr("aria-pressed","false");
      }

      recognition.onerror = function(event) {
        if(event.error == 'no-speech') {
          console.log("No se detecto correctamente la voz");
          desactivarVoz();
        };
      }

    }
    catch(e) {
      console.error(e);          
    }

  }

jQuery.fn.putCursorAtEnd = function() {
	return this.each(function() {
	  $(this).focus()
	  // If this function exists...
	  if (this.setSelectionRange) {
	    // ... then use it (Doesn't work in IE)
	    // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
	    var len = $(this).val().length * 2;
	    this.setSelectionRange(len, len);
	  } else {
	    // ... otherwise replace the contents with itself
	    // (Doesn't work in Google Chrome)
	    $(this).val($(this).val());
	  }
	  // Scroll to the bottom, in case we're in a tall textarea
	  // (Necessary for Firefox and Google Chrome)
	  this.scrollTop = 999999;
	});
};


function activarVoz(){
    if (noteContent.length) {
      noteContent += ' ';
    }
    recognition.start();
    console.log("Reconocimiento de voz iniciado");
}

function desactivarVoz(){
    recognition.stop();
    console.log("Reconocimiento de voz desactivado");
    $("#btnVoz").removeClass("active");
    $("#btnVoz").attr("aria-pressed","false");
}