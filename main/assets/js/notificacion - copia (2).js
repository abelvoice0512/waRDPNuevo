
var ipService = parametros.servidor + parametros.aplicacion;
var tipo="";
var vista="";
var cIdInterno="";

if (parametros.aplica_autenticacion==true){
	ValidaAutenticacion();
	ValidaRoles();
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

	$("#lbl-entorno-sap").text(parametros.system_id_sap + " - " + parametros.client_sap);

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
		//console.log(idElemento);
		var urlField = document.querySelector("#"+idElemento);
		//console.log(urlField);

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
		var id = idAplicacionFinal + "|notificacion|rdp|" + fecha + "||||";

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


	$("#cmb-proceso").on("change", function(){
		var proceso = $("#cmb-proceso").val();
		var maquina = $("#cmb-maquina").val();
		var producto = $("#cmb-producto").val();
		$("#cuerpo-tabla-arbol-rdp tr").addClass("d-none");
		$("#cuerpo-tabla-arbol-rdp tr[data-id*='" + proceso + "|'][data-id*='" + maquina + "|'][data-id*='" + producto + "|']").removeClass("d-none");
	});

	$("#cmb-maquina").on("change", function(){
		var proceso = $("#cmb-proceso").val();
		var maquina = $("#cmb-maquina").val();
		var producto = $("#cmb-producto").val();
		$("#cuerpo-tabla-arbol-rdp tr").addClass("d-none");
		$("#cuerpo-tabla-arbol-rdp tr[data-id*='" + proceso + "|'][data-id*='" + maquina + "|'][data-id*='" + producto + "|']").removeClass("d-none");
	});

	$("#cmb-producto").on("change", function(){
		var proceso = $("#cmb-proceso").val();
		var maquina = $("#cmb-maquina").val();
		var producto = $("#cmb-producto").val();
		$("#cuerpo-tabla-arbol-rdp tr").addClass("d-none");
		$("#cuerpo-tabla-arbol-rdp tr[data-id*='" + proceso + "|'][data-id*='" + maquina + "|'][data-id*='" + producto + "|']").removeClass("d-none");
	});
	
	$("#btn-aceptar-modal-resultado").on("click", function(){
		ocultarModal("modal-resultado");
	});

	$("#btn-transferir").on("click", function(){
		
		//validamos si existe cookie de token
		if (getCookie("token")!=""){
			//transferimos
			transferir(getCookie("token"));	
		}
		else {
			$("#mensaje-notificacion").addClass("d-none");
			mostrarModal("modal-transferir");
		}
		
		
	});

	$("#btn-aceptar-modal-transferir").on("click", function(){
		esValidoTransferir();		
	});	

	$("#btn-cancelar-modal-transferir").on("click", function(){
		ocultarModal("modal-transferir");
	});




	$("#btn-aceptar-modal-transferir2").on("click", function(){
		esValidoTransferir2()
	});	

	$("#btn-cancelar-modal-transferir2").on("click", function(){
		ocultarModal("modal-transferir2");
	});

	$("#btn-aceptar-modal-mensaje").on("click", function(){
		ocultarModal("modal-mensaje");
	});
}


function esValidoTransferir(){
	var usuario=$("#txt-usuario").val();
	var password=$("#txt-password").val();

	var auth = parametros.system_id_sap + ":" + parametros.client_sap + ":" + usuario + ":" + password;
	var auth64 = "Basic " + btoa(auth);

	$.ajax({ 
			url: parametros.ws_sap+"/Main.svc/Login", 
			type: "POST",
			dataType: 'json', 
			headers: {
			    "Authorization": auth64
			},
			async: true, 
			beforeSend: function (){
				$("#mensaje-notificacion").addClass("d-none");
	            $("#btn-aceptar-modal-transferir").find(".spinner-border").removeClass("d-none");
	            $("#btn-aceptar-modal-transferir").attr("disabled","disabled");
	            $("#btn-cancelar-modal-transferir").attr("disabled","disabled");
	        }, 
			success: function(data){		

				console.log(data.token);

				//guardamos el token en una cookie
				setCookie("token",data.token,10000);

				//ocultamos modal
				ocultarModal("modal-transferir");

				//transferimos
				transferir(data.token);	
				
			},
			error: function (xhr, ajaxOptions, thrownError) {        	        
				console.log(xhr);     
				console.log(ajaxOptions);      
				console.log(thrownError);

				$("#mensaje-notificacion").removeClass("d-none");
				if(xhr.status==403){
					$("#mensaje-notificacion").text("No tiene autorización para ejecutar el proceso");
				}
				else {
					$("#mensaje-notificacion").text("Usuario o Password inválido");
				}
	            
				
	        },
	        complete: function(){
	            $("#btn-aceptar-modal-transferir").find(".spinner-border").addClass("d-none");
	            $("#btn-aceptar-modal-transferir").removeAttr("disabled");
	            $("#btn-cancelar-modal-transferir").removeAttr("disabled");
	        }
		});
}


function esValidoTransferir2(){
	var ipService = parametros.servidor + parametros.aplicacion;
	var usuario = localStorage.usuario;
	var grupo="UNACEM Usuarios de notificacion RDP";

    $.ajax({ 
        url: ipService+"/Seguridad.svc/UsuarioPerteneceAlGrupo?usuario="+usuario+"&grupo="+grupo, 
        dataType: 'json', 
        data: null, 
        async:  true, 
        beforeSend: function (){
        	$("#mensaje-notificacion2").addClass("d-none");
            $("#btn-aceptar-modal-transferir2").find(".spinner-border").removeClass("d-none");
            $("#btn-aceptar-modal-transferir2").attr("disabled","disabled")
            $("#btn-cancelar-modal-transferir2").attr("disabled","disabled")
        }, 
        success: function(data){ 
            rpta=data;

            if (rpta==true){
            	//ocultamos modal
				ocultarModal("modal-transferir2");

				//mostramos el spinner en las filas de productos
				$("tr.transferir.ok td.estado i").addClass("d-none");
				$("tr.transferir.ok td.estado .transf-en-progreso").removeClass("d-none");

				transferir();
            }
            else {
				$("#mensaje-notificacion2").removeClass("d-none");
				$("#mensaje-notificacion2").text("No tiene permiso para la Notificación del RDP");
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);            
            rpta=false;
            $("#mensaje-notificacion2").removeClass("d-none");
			$("#mensaje-notificacion2").text("No tiene permiso para la Notificación del RDP");
        },
        complete: function(){
            $("#btn-aceptar-modal-transferir2").find(".spinner-border").addClass("d-none");
            $("#btn-aceptar-modal-transferir2").removeAttr("disabled");
            $("#btn-cancelar-modal-transferir2").removeAttr("disabled");
        }

    });
}




var filas=null;
var nFilas=0;
var nFila=0;

function transferir(token){
	//filas = $("tr.transferir");
	//nFilas = $("tr.transferir").length;
	//nFila=0;

	localStorage["nFilas"] = $("tr.transferir.ok").length;
	localStorage["nFila"] = 0;

	if ($("tr.transferir.ok").length>0){	

		//verificamos si es valido el token
		$.ajax({ 
			url: parametros.ws_sap+"/RDP.svc/ValidarToken?token="+token, 
			dataType: 'json', 
			data: null, 
			async: 	true, 
			beforeSend: function (){            

	        }, 
	        success: function(data){
	        	if (data.codigo==0){
					//mostramos mensaje de completado en cero
					$("#lbl-mensaje-completado").text("0% Completado");
					$("#lbl-mensaje-completado").removeClass("d-none");	

					//bloqueamos boton transferir y mostramos su spinner
					$("#btn-transferir").attr("disabled","disabled")
					$("#btn-transferir .spinner-border").removeClass("d-none");

					//mostramos el spinner en las filas de productos
					$("tr.transferir.ok td.estado i").addClass("d-none");
					$("tr.transferir.ok td.estado .transf-en-progreso").removeClass("d-none");

					transferirFila($("tr.transferir.ok")[0], token);	
				}
				else {
					//token no es valido: mostramos modal para login
					deleteCookie("token");
					$("#mensaje-notificacion").addClass("d-none");
					mostrarModal("modal-transferir");
				}

	        },
	        error: function (xhr, ajaxOptions, thrownError) {        	        
				//error: mostramos modal para login      	
	      	},
			complete: function(){

			}
	    });


		

	}	
}

function transferirFila(tr, token){
	var NumOP = $(tr).attr("data-numero-op");
	var MaterialOP = $(tr).attr("data-material-op");
	var PuestoTrabajo = $(tr).attr("data-puesto-trabajo");

	var aId = $(tr).attr("data-id").split("|");

/*
	if 	(
			(aId[0]=="Molienda de Crudo" && aId[1]=="PCR3" && aId[2]=="HCR")
			||
			(aId[0]=="Molienda de Crudo" && aId[1]=="PCR3" && aId[2]=="Tipo I")
		)
	{
*/

		//validamos datos		
		if (NumOP===undefined || NumOP.trim()=="" || NumOP.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","OP No Configurada");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			//console.log(tr);
			insertarNotificacionSQL(tr);

			//actualizamos % de avance
			var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
			$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

			//transferimos siguiente fila
			localStorage["nFila"] = parseInt(localStorage["nFila"])+1;
			if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
				//se termina el proceso
				//activamos boton transferir y ocultamos su spinner
				$("#btn-transferir").removeAttr("disabled");
				$("#btn-transferir .spinner-border").addClass("d-none");

				//removemos class ok a bloques que pasaron con exito
				$("tr.transferir.ok[data-estado='T']").removeClass("ok");
			}
			else {
				transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
			}
			
		}
		else if (MaterialOP.trim()=="" || MaterialOP.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","Material SAP no definido para el producto");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			insertarNotificacionSQL(tr);
			
			//actualizamos % de avance
			var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
			$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

			//transferimos siguiente fila
			localStorage["nFila"]= parseInt(localStorage["nFila"])+1;
			if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
				//se termina el proceso
				//activamos boton transferir y ocultamos su spinner
				$("#btn-transferir").removeAttr("disabled");
				$("#btn-transferir .spinner-border").addClass("d-none");

				//removemos class ok a bloques que pasaron con exito
				$("tr.transferir.ok[data-estado='T']").removeClass("ok");
			}
			else {
				transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
			}

		}	
		else if (PuestoTrabajo.trim()=="" || PuestoTrabajo.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","Puesto de trabajo no definido para la máquina");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			insertarNotificacionSQL(tr);

			//actualizamos % de avance
			var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
			$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

			//transferimos siguiente fila
			localStorage["nFila"]= parseInt(localStorage["nFila"])+1;
			if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
				//se termina el proceso
				//activamos boton transferir y ocultamos su spinner
				$("#btn-transferir").removeAttr("disabled");
				$("#btn-transferir .spinner-border").addClass("d-none");

				//removemos class ok a bloques que pasaron con exito
				$("tr.transferir.ok[data-estado='T']").removeClass("ok");
			}
			else {
				transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
			}

		}
		else {

			//todo ok - transferimos a sap
			NotificarEnSAP(tr, token);
		}


/*		
	}
	else {
		//transferimos siguiente fila
		localStorage["nFila"] = parseInt(localStorage["nFila"])+1;
		if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
			//se termina el proceso
			//activamos boton transferir y ocultamos su spinner
			$("#btn-transferir").removeAttr("disabled");
			$("#btn-transferir .spinner-border").addClass("d-none");
		}
		else {
			transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
		}
	}
*/
	

}

function ObtenerJSONTotal(){
	var jsonTotal = [];

	for (i=0; i<$("tr.transferir.ok").length; i++){
		var tr = $("tr.transferir.ok")[i];

		var NumOP = $(tr).attr("data-numero-op");
		var MaterialOP = $(tr).attr("data-material-op");
		var PuestoTrabajo = $(tr).attr("data-puesto-trabajo");
		var NumNotificacion = $(tr).attr("data-numero-notificacion");
		var NumContador = $(tr).attr("data-numero-contador");
		var Estado = $(tr).attr("data-estado");
		var CodRespuesta = $(tr).attr("data-cod-respuesta");
		var DscRespuesta = $(tr).attr("data-dsc-respuesta");
		var CntGas = $(tr).attr("data-cnt-gas");	
		var DscUnidadGas = $(tr).attr("data-unidad-gas");

		var Actividad4=0;
		var UnidadActividad4="";
		if (CntGas.trim()!=""){
			Actividad4=parseFloat(CntGas.replace(/,/g,""));
			UnidadActividad4=DscUnidadGas;
		}	

		var Fecha = $("#fecha-reporte").val();
		var Id = $(tr).attr("data-id");
		var aId = Id.split("|");
		var Usuario = localStorage["usuario"];

		var Cantidad = $(tr).find("td.SUMA_TRANSFERENCIA").text().replace(/,/g,"");
		Cantidad = parseFloat(Cantidad);

		var Unidad = "T";
		if (Cantidad==0){
			Unidad="";
		}

		var Horas = $(tr).find("td.CNT_HORAS").text().replace(/,/g,"");
		Horas = parseFloat(Horas);
		
		var UnidadHoras = "HRA";
		if (Horas==0){
			UnidadHoras="";
		}

		var CodAlmacen = $(tr).attr("data-almacen");

		//INSERTAMOS NOTIFICACION EN SAP
		var Movimientos = [];

		if (Cantidad!=0) {
			Movimientos.push({
				"CodMaterialSAP":MaterialOP,
				"Cantidad":Cantidad,
				"Unidad":"T",
				"TipoMovimiento":"101",
				"Almacen":CodAlmacen
			});
		}
		
		var filas = $("#cuerpo-tabla-arbol-rdp tr.fila-material-sap[data-padre-id^='" + Id + "']");
		for (j=0;j<filas.length;j++){
			var filaTemp = filas[j];

			var CodMaterialSAP = $(filaTemp).find("td.COD_MATERIAL_SAP").text();
			var CantidadDetalle = $(filaTemp).find("td.transferencia span").text().replace(/,/g,"");
			CantidadDetalle = parseFloat(CantidadDetalle);
			var Unidad = $(filaTemp).attr("data-unidad");
			var TipoMovimiento="261";
			var CodAlmacenDetalle = $(filaTemp).attr("data-almacen");

			if (CantidadDetalle != 0){
				Movimientos.push({
					"CodMaterialSAP":CodMaterialSAP,
					"Cantidad":CantidadDetalle,
					"Unidad":Unidad,
					"TipoMovimiento":TipoMovimiento,
					"Almacen":CodAlmacenDetalle
				});
			}
			
		}

		var datos = {
			"OrdenProceso": NumOP,
			"PuestoTrabajo": PuestoTrabajo,
			"Fecha": Fecha,
			"Cantidad": Cantidad,
			"UnidadCantidad": "T",
			"Actividad1": Horas,
			"UnidadActividad1": UnidadHoras,
			"Actividad2": 0,
			"UnidadActividad2": "",
			"Actividad3": 0,
			"UnidadActividad3": "",
			"Actividad4": 0,
			"UnidadActividad4": "",
			"Actividad5": 0,
			"UnidadActividad5": "",
			"Actividad6": 0,
			"UnidadActividad6": "",
			"Movimientos": Movimientos
		};

		jsonTotal.push(datos);
	}

	console.log(JSON.stringify(jsonTotal));
}

function NotificarEnSAP(tr, token){

	var NumOP = $(tr).attr("data-numero-op");
	var MaterialOP = $(tr).attr("data-material-op");
	var PuestoTrabajo = $(tr).attr("data-puesto-trabajo");
	var NumNotificacion = $(tr).attr("data-numero-notificacion");
	var NumContador = $(tr).attr("data-numero-contador");
	var Estado = $(tr).attr("data-estado");
	var CodRespuesta = $(tr).attr("data-cod-respuesta");
	var DscRespuesta = $(tr).attr("data-dsc-respuesta");
	var CntGas = $(tr).attr("data-cnt-gas");	
	var DscUnidadGas = $(tr).attr("data-unidad-gas");	

	var Actividad4=0;
	var UnidadActividad4="";
	if (CntGas.trim()!=""){
		Actividad4=parseFloat(CntGas.replace(/,/g,""));
		UnidadActividad4=DscUnidadGas;
	}	

	var Fecha = $("#fecha-reporte").val();

	var Id = $(tr).attr("data-id");
	var aId = Id.split("|");
	var CodGrupo = aId[0];

	var Usuario = localStorage["usuario"];

	var Cantidad = $(tr).find("td.SUMA_TRANSFERENCIA").text().replace(/,/g,"");
	Cantidad = parseFloat(Cantidad);

	var Unidad = "T";
	if (Cantidad==0){
		Unidad="";
	}

	var Horas = $(tr).find("td.CNT_HORAS").text().replace(/,/g,"");
	Horas = parseFloat(Horas);
	
	var UnidadHoras = "HRA";
	if (Horas==0){
		UnidadHoras="";
	}

	var CodAlmacen = $(tr).attr("data-almacen");

	if (NumNotificacion.trim()!="" && NumContador.trim()!=""){

		//ACTUALIZAMOS NOTIFICACION EN SAP (INTERNAMENTE ELIMINA E INSERTA DE NUEVO)
		var Movimientos = [];

		if (Cantidad!=0) {
			Movimientos.push({
				"CodMaterialSAP":MaterialOP,
				"Cantidad":Cantidad,
				"Unidad":Unidad,
				"TipoMovimiento":"101",
				"Almacen":CodAlmacen
			});
		}
		

		var filas = $("#cuerpo-tabla-arbol-rdp tr.fila-material-sap[data-padre-id^='" + Id + "']");
		for (j=0;j<filas.length;j++){
			var filaTemp = filas[j];

			if (UnidadActividad4!=""){
				//es producto con gas
			}
			else {
				//no es producto con gas
				var CodMaterialSAP = $(filaTemp).find("td.COD_MATERIAL_SAP").text();
				var CantidadDetalle = $(filaTemp).find("td.transferencia span").text().replace(/,/g,"");
				CantidadDetalle = parseFloat(CantidadDetalle);
				var Unidad = $(filaTemp).attr("data-unidad");
				var TipoMovimiento="261";
				var CodAlmacenDetalle = $(filaTemp).attr("data-almacen");

				if (CodMaterialSAP!="" && CantidadDetalle!=0){
					Movimientos.push({
						"CodMaterialSAP":CodMaterialSAP,
						"Cantidad":CantidadDetalle,
						"Unidad":Unidad,
						"TipoMovimiento":TipoMovimiento,
						"Almacen":CodAlmacenDetalle
					});
				}
				
			}

			
		}

		var datos = {
			"OrdenProceso": NumOP,
			"NumeroNotificacion": NumNotificacion,
			"Contador":NumContador,

			"Fecha": Fecha,
			"PuestoTrabajo": PuestoTrabajo,
			"Cantidad": Cantidad,
			"UnidadCantidad": "T",
			"Actividad1": Horas,
			"UnidadActividad1": UnidadHoras,
			"Actividad2": 0,
			"UnidadActividad2": "",
			"Actividad3": 0,
			"UnidadActividad3": "",
			"Actividad4": Actividad4,
			"UnidadActividad4": UnidadActividad4,
			"Actividad5": 0,
			"UnidadActividad5": "",
			"Actividad6": 0,
			"UnidadActividad6": "",
			"Movimientos": Movimientos
		};

		var CodigoRespuesta="";

		$.ajax({ 
			url: parametros.ws_sap+"/RDP.svc/ActualizarNotificacion", 
			type: "POST",
			dataType: 'json', 
			headers: {
			    "Content-Type": "application/json",
			    "Token": token
			},
			data: JSON.stringify(datos), 
			async: true, 
			beforeSend: function (){
				console.log("ACTUALIZACION EN SAP:");					
				console.log(JSON.stringify(datos));
	        }, 
			success: function(data){	
				CodigoRespuesta = data.CodigoRespuesta;

				if(data.CodigoRespuesta.trim()=="0"){
					
					//mostramos icono de exito
					$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
					$(tr).find("td.estado .transf-transferido").removeClass("d-none");
					$(tr).find("td.estado .transf-transferido").removeClass("modificado");
					$(tr).find("td.estado .transf-transferido").removeClass("modificado_por_usuario");

					//seteamos los resultados en los atributos de la fila producto
					$(tr).attr("data-cod-respuesta",data.CodigoRespuesta.trim());
					$(tr).attr("data-dsc-respuesta","Operación Exitosa");
					$(tr).attr("data-estado","T");
					$(tr).attr("data-numero-notificacion",data.NumeroNotificacion)
					$(tr).attr("data-numero-contador",data.Contador);
					$(tr).attr("data-dsc-respuesta-detalle","");
					

					//removemos la class "ok" para que ya no se pueda procesar nuevamente
					//$(tr).removeClass("ok");

					//grabar notificacion en sql
					insertarNotificacionSQL(tr);
				}
				else {

					//mostramos icono de error
					$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
					$(tr).find("td.estado .transf-error").removeClass("d-none");

					//seteamos los resultados en los atributos de la fila producto
					$(tr).attr("data-cod-respuesta",data.CodigoRespuesta.trim());
					$(tr).attr("data-dsc-respuesta",data.Mensaje.trim());
					$(tr).attr("data-estado","E");
					$(tr).attr("data-numero-notificacion",data.NumeroNotificacion)
					$(tr).attr("data-numero-contador",data.Contador);
					$(tr).attr("data-dsc-respuesta-detalle",data.MensajeDetalle.trim());

					//grabar notificacion en sql
					insertarNotificacionSQL(tr);
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {        	        
				      	
	      	},
			complete: function(){

				if (CodigoRespuesta==300){		//token caduco o no es valido
					
					//actualizamos % de avance
					var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
					$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

					//ya no transferimos nada, detenemos todo
					//activamos boton transferir y ocultamos su spinner
					$("#btn-transferir").removeAttr("disabled");
					$("#btn-transferir .spinner-border").addClass("d-none");


					//mostramos icono original de estado en todos los estados
					for (i=0; i<$("tr.transferir.ok").length; i++){
						var estado = $($("tr.transferir.ok")[i]).attr("data-estado");

						$($("tr.transferir.ok")[i]).find("td.estado i").addClass("d-none");
						$($("tr.transferir.ok")[i]).find("td.estado .transf-en-progreso").addClass("d-none");
						
						if (estado=="T"){
							$($("tr.transferir.ok")[i]).find("td.estado .transf-transferido").removeClass("d-none");
						}
						else if (estado=="E"){
							$($("tr.transferir.ok")[i]).find("td.estado .transf-error").removeClass("d-none");
						}
						else {
							$($("tr.transferir.ok")[i]).find("td.estado .transf-pendiente").removeClass("d-none");
						}
					}

					//mostramos modal de que el token caduco
					mostrarModal("modal-mensaje");

				}
				else {

					if (CodGrupo=="Molienda de Cemento" || CodGrupo=="Molienda de Crudo" || CodGrupo=="Chancado Secundario"){
						if (CodigoRespuesta.trim()!="0"){
							//anulamos productos similares del mismo grupo
						}
						else {
							//actualizamos % de avance
							var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
							$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

							//transferimos siguiente fila
							localStorage["nFila"]= parseInt(localStorage["nFila"])+1;
							if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
								//se termina el proceso
								//activamos boton transferir y ocultamos su spinner
								$("#btn-transferir").removeAttr("disabled");
								$("#btn-transferir .spinner-border").addClass("d-none");

								//removemos class ok a bloques que pasaron con exito
								$("tr.transferir.ok[data-estado='T']").removeClass("ok");
							}
							else {
								transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
							}
						}
					}
					else {
						//actualizamos % de avance
						var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
						$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

						//transferimos siguiente fila
						localStorage["nFila"]= parseInt(localStorage["nFila"])+1;
						if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
							//se termina el proceso
							//activamos boton transferir y ocultamos su spinner
							$("#btn-transferir").removeAttr("disabled");
							$("#btn-transferir .spinner-border").addClass("d-none");

							//removemos class ok a bloques que pasaron con exito
							$("tr.transferir.ok[data-estado='T']").removeClass("ok");
						}
						else {
							transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
						}
					}


					


				}

				

			}
		});


	}
	else {

		//INSERTAMOS NOTIFICACION EN SAP
		var Movimientos = [];

		if (Cantidad!=0) {
			Movimientos.push({
				"CodMaterialSAP":MaterialOP,
				"Cantidad":Cantidad,
				"Unidad":"T",
				"TipoMovimiento":"101",
				"Almacen":CodAlmacen
			});
		}
		
		var filas = $("#cuerpo-tabla-arbol-rdp tr.fila-material-sap[data-padre-id^='" + Id + "']");
		for (j=0;j<filas.length;j++){
			var filaTemp = filas[j];

			if (UnidadActividad4!=""){
				//es producto con gas
			}
			else {
				//no es producto con gas
				var CodMaterialSAP = $(filaTemp).find("td.COD_MATERIAL_SAP").text();
				var CantidadDetalle = $(filaTemp).find("td.transferencia span").text().replace(/,/g,"");
				CantidadDetalle = parseFloat(CantidadDetalle);
				var Unidad = $(filaTemp).attr("data-unidad");
				var TipoMovimiento="261";
				var CodAlmacenDetalle = $(filaTemp).attr("data-almacen");

				if (CodMaterialSAP!="" && CantidadDetalle!=0){
					Movimientos.push({
						"CodMaterialSAP":CodMaterialSAP,
						"Cantidad":CantidadDetalle,
						"Unidad":Unidad,
						"TipoMovimiento":TipoMovimiento,
						"Almacen":CodAlmacenDetalle
					});
				}
				
			}
		}

		var datos = {
			"OrdenProceso": NumOP,
			"PuestoTrabajo": PuestoTrabajo,
			"Fecha": Fecha,
			"Cantidad": Cantidad,
			"UnidadCantidad": "T",
			"Actividad1": Horas,
			"UnidadActividad1": UnidadHoras,
			"Actividad2": 0,
			"UnidadActividad2": "",
			"Actividad3": 0,
			"UnidadActividad3": "",
			"Actividad4": Actividad4,
			"UnidadActividad4": UnidadActividad4,
			"Actividad5": 0,
			"UnidadActividad5": "",
			"Actividad6": 0,
			"UnidadActividad6": "",
			"Movimientos": Movimientos
		};

		var CodigoRespuesta="";

		$.ajax({ 
			url: parametros.ws_sap+"/RDP.svc/InsertarNotificacion", 
			type: "POST",
			dataType: 'json', 
			headers: {
			    "Content-Type": "application/json",
			    "Token": token
			},
			data: JSON.stringify(datos), 
			async: true, 
			beforeSend: function (){					
				console.log(JSON.stringify(datos));
	        }, 
			success: function(data){		

				CodigoRespuesta=data.CodigoRespuesta;

				if(data.CodigoRespuesta.trim()=="0"){
					
					//mostramos icono de exito
					$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
					$(tr).find("td.estado .transf-transferido").removeClass("d-none");	

					//seteamos los resultados en los atributos de la fila producto
					$(tr).attr("data-cod-respuesta",data.CodigoRespuesta.trim());
					$(tr).attr("data-dsc-respuesta","Operación Exitosa");
					$(tr).attr("data-estado","T");
					$(tr).attr("data-numero-notificacion",data.NumeroNotificacion)
					$(tr).attr("data-numero-contador",data.Contador);
					$(tr).attr("data-dsc-respuesta-detalle","");

					//removemos la class "ok" para que ya no se pueda procesar nuevamente
					//$(tr).removeClass("ok");

					//grabar notificacion en sql
					insertarNotificacionSQL(tr);
				}
				else {

					//mostramos icono de error
					$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
					$(tr).find("td.estado .transf-error").removeClass("d-none");

					//seteamos los resultados en los atributos de la fila producto
					$(tr).attr("data-cod-respuesta",data.CodigoRespuesta.trim());
					$(tr).attr("data-dsc-respuesta",data.Mensaje.trim());
					$(tr).attr("data-estado","E");
					$(tr).attr("data-numero-notificacion","")
					$(tr).attr("data-numero-contador","");
					$(tr).attr("data-dsc-respuesta-detalle",data.MensajeDetalle.trim());

					//grabar notificacion en sql
					insertarNotificacionSQL(tr);
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {        	        
				      	
	      	},
			complete: function(){

				if (CodigoRespuesta==300){		//token caduco o no es valido
					
					//actualizamos % de avance
					var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
					$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

					//ya no transferimos nada, detenemos todo
					//activamos boton transferir y ocultamos su spinner
					$("#btn-transferir").removeAttr("disabled");
					$("#btn-transferir .spinner-border").addClass("d-none");


					//mostramos icono original de estado en todos los estados
					for (i=0; i<$("tr.transferir.ok").length; i++){
						var estado = $($("tr.transferir.ok")[i]).attr("data-estado");

						$($("tr.transferir.ok")[i]).find("td.estado i").addClass("d-none");
						$($("tr.transferir.ok")[i]).find("td.estado .transf-en-progreso").addClass("d-none");
						
						if (estado=="T"){
							$($("tr.transferir.ok")[i]).find("td.estado .transf-transferido").removeClass("d-none");
						}
						else if (estado=="E"){
							$($("tr.transferir.ok")[i]).find("td.estado .transf-error").removeClass("d-none");
						}
						else {
							$($("tr.transferir.ok")[i]).find("td.estado .transf-pendiente").removeClass("d-none");
						}
					}

					//mostramos modal de que el token caduco
					mostrarModal("modal-mensaje");

				}
				else {

					//actualizamos % de avance
					var porc = (parseFloat(localStorage["nFila"])+1)/parseFloat(localStorage["nFilas"])*100.00;
					$("#lbl-mensaje-completado").text(porc.toFixed(0) + "% Completado");

					//transferimos siguiente fila
					localStorage["nFila"]= parseInt(localStorage["nFila"])+1;
					if(parseInt(localStorage["nFilas"])<parseInt(localStorage["nFila"])+1){
						//se termina el proceso
						//activamos boton transferir y ocultamos su spinner
						$("#btn-transferir").removeAttr("disabled");
						$("#btn-transferir .spinner-border").addClass("d-none");

						//removemos class ok a bloques que pasaron con exito
						$("tr.transferir.ok[data-estado='T']").removeClass("ok");
					}
					else {
						transferirFila($("tr.transferir.ok")[parseInt(localStorage["nFila"])], token);
					}
				}
				

			}
		});

	}
}

function insertarNotificacionSQL(tr){
	var NumOP = $(tr).attr("data-numero-op");
	var MaterialOP = $(tr).attr("data-material-op");
	var PuestoTrabajo = $(tr).attr("data-puesto-trabajo");
	var NumNotificacion = $(tr).attr("data-numero-notificacion");
	var NumContador = $(tr).attr("data-numero-contador");
	var Estado = $(tr).attr("data-estado");
	var CodRespuesta = $(tr).attr("data-cod-respuesta");
	var DscRespuesta = $(tr).attr("data-dsc-respuesta");
	var DscRespuestaDetalle = $(tr).attr("data-dsc-respuesta-detalle");
	var DscUnidadGas = $(tr).attr("data-unidad-gas");	

	var FlgGas="N";
	if (DscUnidadGas!=""){
		FlgGas="S";
	}		

	if (PuestoTrabajo=="251FT1"){
		console.log($(tr).attr("data-id"));
	}

	var Fecha = $("#fecha-reporte").val();
	var Id = $(tr).attr("data-id");
	var aId = Id.split("|");
	var usuario = localStorage["usuario"];

	var CntToneladas = $(tr).find("td.SUMA_TRANSFERENCIA").text().replace(/,/g,"");
	CntToneladas=parseFloat(CntToneladas);

	var CntToneladasOriginal = $(tr).find("td.CNT_TONELADAS").text().replace(/,/g,"");
	CntToneladasOriginal=parseFloat(CntToneladasOriginal);

	//materiales sap
	var Detalles = [];
	filas = $("#cuerpo-tabla-arbol-rdp tr.fila-material-sap[data-padre-id^='" + Id + "']")

	for (j=0;j<filas.length;j++){
		var filaTemp = filas[j];

		var CodMaterialSAP = $(filaTemp).find("td.COD_MATERIAL_SAP").text();
		if (CodMaterialSAP.trim()==""){
			//aplica para los sub materiales que no tienen codigo sap
			CodMaterialSAP=$(filaTemp).find("td.DSC_MATERIAL_SAP").text();
		}

		var CantidadDetalle = $(filaTemp).find("td.transferencia span").text().replace(/,/g,"");
		CantidadDetalle = parseFloat(CantidadDetalle);

		var CantidadOriginalDetalle = $(filaTemp).find("td.CNT_TONELADASNOTIF").text().replace(/,/g,"");
		CantidadOriginalDetalle = parseFloat(CantidadOriginalDetalle);

		var IdDetalle = $(filaTemp).attr("data-id");
		aIdDetalle=IdDetalle.split("|");
		var CodMaterial =aIdDetalle[3];

		if (CantidadDetalle!=0) {
			Detalles.push({
				"COD_MATERIAL":CodMaterial,
				"COD_MATERIAL_SAP":CodMaterialSAP,
				"CNT_TONELADAS":CantidadDetalle,
				"CNT_TONELADAS_ORIGINAL":CantidadOriginalDetalle		
			});
		}
		
	}




	var datos = {
		"FCH_PRODUCCION": Fecha,
		"COD_GRUPO": aId[0],
		"COD_MAQUINA": aId[1],
		"COD_PRODUCTO": aId[2],
		"NUM_OP": NumOP,
		"NUM_NOTIFICACION": NumNotificacion,
		"NUM_CONTADOR": NumContador,
		"COD_MATERIAL_OP": MaterialOP,
		"COD_ESTADO": Estado,
		"DSC_RESPUESTA": DscRespuesta,
		"COD_RESPUESTA": CodRespuesta,
		"USR_NOTIFICACION": usuario,
		"CNT_TONELADAS":CntToneladas,
		"CNT_TONELADAS_ORIGINAL":CntToneladasOriginal,
		"FLG_GAS":FlgGas,
		"DSC_RESPUESTA_DETALLE": DscRespuestaDetalle,
		"DETALLES":Detalles
	};

	$.ajax({ 
		url: ipService+"/RDP.svc/InsertarNotificacion", 
		type: "POST",
		dataType: 'json', 
		headers: {
		    "Content-Type": "application/json"
		},
		data: JSON.stringify(datos), 
		async: true, 
		beforeSend: function (){			
        }, 
		success: function(data){			
			if(data.codigo==0){
				
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {        	        
			      	
      	},
		complete: function(){
					
		}
	});
}




function transferir_old2(){

	for (i=0;i<$("tr.transferir").length;i++){
		var tr = $("tr.transferir")[i];

		var NumOP = $(tr).attr("data-numero-op");
		var MaterialOP = $(tr).attr("data-material-op");
		var PuestoTrabajo = $(tr).attr("data-puesto-trabajo");


		//validamos datos
		
		if (NumOP.trim()=="" || NumOP.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","OP No Configurada");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			insertarNotificacionSQL(tr);

			continue;
		}


		if (MaterialOP.trim()=="" || MaterialOP.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","Material SAP no definido para el producto");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			insertarNotificacionSQL(tr);

			continue;
		}
		

		if (PuestoTrabajo.trim()=="" || PuestoTrabajo.trim()=="null"){

			//mostramos icono de error
			$(tr).find("td.estado .transf-en-progreso").addClass("d-none");
			$(tr).find("td.estado .transf-error").removeClass("d-none");

			//seteamos los resultados en los atributos de la fila producto
			$(tr).attr("data-cod-respuesta","-1");
			$(tr).attr("data-dsc-respuesta","Puesto de trabajo no definido para la máquina");
			$(tr).attr("data-estado","E");

			//grabar notificacion en sql
			insertarNotificacionSQL(tr);

			continue;
		}


		//enviamos datos a SAP		
		NotificarEnSAP(tr);
		
	}
}

function transferir_old(){
	var usuario=$("#txt-usuario").val();
	var password=$("#txt-password").val();

	$.ajax({ 
		url: ipService+"/RDP.svc/ValidarAcceso?usuario="+usuario+"&password="+password, 
		dataType: 'json', 
		data: null, 
		async: 	true, 
		beforeSend: function (){        
			$("#btn-aceptar-modal-transferir").attr("disabled","disabled")
			$("#btn-aceptar-modal-transferir .spinner-border").removeClass("d-none");
        	//$("#spin-proceso").removeClass("d-none");
        	$("#mensaje-notificacion").removeClass("d-none");
        	$("#mensaje-notificacion").text("Espere por favor... El proceso puede tomar algunos segundos.");
        	
        }, 
        success: function(data){ 
        	console.log(data);
        	if (data!=null){
        		$.each(data, function (key, val) {
        			$("#mensaje-notificacion").text(val.MESSAGE);
        				
        		});        		
        	}
        	else{
        		$("#mensaje-notificacion").text("No se pudo realizar el proceso.")	
        	}
        	
        },
        error: function (xhr, ajaxOptions, thrownError) {
        	//console.log(xhr);
        	//alert(xhr.status);
        	//alert(thrownError);
        	//$("#txt-resultados").text("No se pudo realizar el proceso.");
        	$("#mensaje-notificacion").text("No se pudo realizar el proceso.")	
      	},
        complete: function(){
        	$("#btn-aceptar-modal-transferir").removeAttr("disabled");
        	$("#btn-aceptar-modal-transferir .spinner-border").addClass("d-none");
        	//$("#spin-proceso").addClass("d-none");         	
        }

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
	                    			var carpeta = val.id.substring(val.id.lastnotificacionOf('|')+1,val.id.lastnotificacionOf('|')+7);
	                    			
	                    			

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

	//para combos
	var opcionProceso = "";
	var aMaquinas = [];
	var aProductos = [];

	//para comentarios
	var id="";
	var idAplicacionFinal=parametros.id_aplicacion;;
	var titulo="DETALLE DE PRODUCCION Y CONSUMOS PARA NOTIFICACION";
		
	$("#titulo-pagina").html(titulo)	
	var primero=true;

	xhr = $.ajax({ 
		url: ipService+"/RDP.svc/ObtenerRDP?fecha="+fecha+"&tipo=CORREGIDO&verceros="+verceros+"&vista=NOTIFICACION", 
		dataType: 'json', 
		data: null, 
		async: 	true, 
		beforeSend: function (){            
			$("#chk-ver-ceros").attr("disabled", true);

        	$("#cuerpo-tabla-arbol-rdp").empty();
        	$("#spin-tabla-arbol-rdp").removeClass("d-none");
        	$("#contenedor-tabla-arbol-rdp").addClass("d-none");        	
        }, 
        success: function(data){ 

        	//tabla principal
        	var tr="";
        	var tr2="";

        	var COD_GRUPO_ANT = "";
			var COD_MAQUINA_ANT = "";
			var COD_PRODUCTO_ANT = "";  	

        	$.each(data, function (key, val) {	

        		opcionProceso = opcionProceso + '<option value="' + val.COD_GRUPO + '">' + val.COD_GRUPO + '</option>';

        		$.each(val.MAQUINAS, function (key2, val2) {	

        			aMaquinas.push(val2.COD_MAQUINA);

					$.each(val2.PRODUCTOS, function (key3, val3) {	

						aProductos.push(val3.COD_PRODUCTO);

						id = idAplicacionFinal + "|notificacion|rdp|" + fecha + "|" + val3.COD_GRUPO + "|" + val3.COD_MAQUINA + "|" + val3.COD_PRODUCTO + "|";					

						var color="";						
						var color2="";
						var colores = colores_maquina.filter( x => x.maquina==val3.COD_MAQUINA);
						if (colores.length>0){
							color=colores[0].color;
							color2=colores[0].color2;
						}

						var transferir="";
						if (val3.COD_GRUPO!="Chancado Primario" && 
							val3.COD_GRUPO!="Molienda de Carbon" &&
							val3.COD_GRUPO!="Recuperación"){

							transferir="transferir";
						}

						if (val3.COD_GRUPO=="Calcinación" && val3.COD_MAQUINA=="Horno I" && val3.COD_PRODUCTO=="HCR"){
							transferir="";
						}	

						if (val3.COD_GRUPO=="Calcinación" && val3.COD_MAQUINA=="Horno II" && val3.COD_PRODUCTO=="HCR"){
							transferir="";
						}

						if (parseFloat(val3.CNT_HORAS)==0 && parseFloat(val3.CNT_TONELADAS)==0 && val3.DSC_UNIDAD_GAS==""){
							transferir="";
						}

						if (parseFloat(val3.CNT_GAS)==0 && val3.DSC_UNIDAD_GAS!=""){
							transferir="";
						}

						if (val3.COD_ESTADO=='T'){
							val3.DSC_RESPUESTA="Operación Exitosa";
						}

						var ok="";
						if(transferir!=""){
							if(val3.COD_ESTADO=="" || val3.COD_ESTADO=="E"){
								ok="ok";
							}
							if(val3.COD_ESTADO=="T"){
								if(val3.CNT_TONELADAS!=val3.CNT_TONELADAS_ORIGINAL){
				                	ok="ok";
				                }
							}
						}

						var claseIndicadorTH = "";
						if (parseFloat(val3.CNT_HORAS)==0 && parseFloat(val3.CNT_TONELADAS)==0){
							claseIndicadorTH="d-none";
						}

						/*
						var COD_GRUPO = val3.COD_GRUPO.trim()
						var COD_MAQUINA = val3.COD_MAQUINA.trim();
						var COD_PRODUCTO = val3.COD_PRODUCTO.trim();

						if (COD_GRUPO==COD_GRUPO_ANT && COD_MAQUINA==COD_MAQUINA_ANT && COD_PRODUCTO==COD_PRODUCTO_ANT){
							COD_GRUPO="";
							COD_MAQUINA=""
							COD_PRODUCTO="";
						}

		               	COD_GRUPO_ANT=val3.COD_GRUPO.trim();
		               	COD_MAQUINA_ANT=val3.COD_MAQUINA.trim();
		               	COD_PRODUCTO_ANT=val3.COD_PRODUCTO.trim();
		               	*/

	        			tr = tr + '<tr data-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|' + val3.COD_PRODUCTO + '|" data-padre-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|" class="'+transferir+' '+ok+'" data-numero-op="'+val3.NUM_OP+'" data-almacen="'+val3.COD_ALMACEN+'" data-material-op="'+val3.COD_MATERIAL_OP+'" data-puesto-trabajo="'+val2.COD_PUESTO_TRABAJO+'" data-cod-respuesta="'+val3.COD_RESPUESTA+'" data-dsc-respuesta="'+val3.DSC_RESPUESTA+'" data-estado="'+val3.COD_ESTADO+'" data-numero-notificacion="'+val3.NUM_NOTIFICACION+'" data-numero-contador="'+val3.NUM_CONTADOR+'" data-cnt-gas="'+val3.CNT_GAS+'" data-unidad-gas="'+val3.DSC_UNIDAD_GAS+'" data-dsc-respuesta-detalle="'+val3.DSC_RESPUESTA_DETALLE+'" style="background-color:'+color+';">';
	        			tr = tr + '		<td class="text-left">'+val3.COD_GRUPO +'</td>';
	        			tr = tr + '		<td class="text-left">'+val3.COD_MAQUINA+'</td>';
	        			tr = tr + '		<td class="text-left">'+val3.COD_PRODUCTO+'</td>';                
	                	tr = tr + '		<td class="text-left" style="background-color:'+color2+';">' + val3.DSC_OP + '</td>';	                	
	                	tr = tr + '		<td class="text-left"></td>';
	                	tr = tr + '		<td class="text-left"></td>';
	                	tr = tr + '		<td class="text-right CNT_HORAS" style="background-color:'+color2+';">' + val3.CNT_HORAS + '</td>';
		                tr = tr + '		<td class="text-right CNT_TONELADAS">' + val3.CNT_TONELADAS + '</td>';
		                tr = tr + '		<td class="text-center" title="TH: '+val3.TH+'"><i class="fas fa-circle '+claseIndicadorTH+'" style="color:'+val3.DSC_COLOR_TH+';"></i></td>';
		                tr = tr + '		<td class="text-right"></td>';
		                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
		                tr = tr + '		<td class="text-center SUMA_TRANSFERENCIA">' + val3.CNT_TONELADAS_SAP + '</td>';
		                tr = tr + '		<td class="text-right"></td>';

		                if(transferir==""){
		                	tr = tr + '		<td class="text-right"></td>';         	
		                }
		                else {
		                	var modificado="";
		                	if(val3.CNT_TONELADAS!=val3.CNT_TONELADAS_ORIGINAL && val3.COD_ESTADO=="T"){
		                		modificado="modificado";
		                	}
		                	tr = tr + '		<td class="text-right estado"><i class="far fa-clock transf-pendiente ' + (val3.COD_ESTADO==""?'':'d-none') +'"></i><i class="fas fa-check-double transf-transferido ' + modificado + ' ' + (val3.COD_ESTADO=="T"?'':'d-none') +'"></i><i class="fas fa-exclamation-triangle transf-error ' + (val3.COD_ESTADO=="E"?'':'d-none') +'"></i><div class="spinner-border transf-en-progreso d-none" role="status"></div></td>';
		                }

		                tr = tr + '		<td class="text-right TH d-none">' + val3.TH + '</td>';
		                tr = tr + '		<td class="text-right SEMAFORO_TH d-none"></td>';
		                tr = tr + '		<td class="text-right DOSIFICACION d-none"></td>';
		                tr = tr + '		<td class="text-right IMP_COSTO_UNIT">' + val3.IMP_COSTO_UNIT + '</td>';
		                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL">' + val3.IMP_COSTO_TOTAL + '</td>';	                
						tr = tr + '		<td class="text-center d-none">';
		                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
		                tr = tr + '		</td>';
		                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';		                
						tr = tr + '</tr>';     


						tr2 = tr2 + '<tr data-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|' + val3.COD_PRODUCTO + '|" data-padre-id="' + val3.COD_GRUPO + '|' + val3.COD_MAQUINA + '|" class="" style="background-color:'+color+';">';
	        			tr2 = tr2 + '		<td class="text-left">'+val3.COD_GRUPO.trim() +'</td>';
	        			tr2 = tr2 + '		<td class="text-left">'+val3.COD_MAQUINA.trim()+'</td>';
	        			tr2 = tr2 + '		<td class="text-left">'+val3.COD_PRODUCTO.trim()+'</td>';                
	                	tr2 = tr2 + '		<td class="text-left" style="background-color:'+color2+';">' + val3.DSC_OP + '</td>';	                	
	                	tr2 = tr2 + '		<td class="text-left"></td>';
	                	tr2 = tr2 + '		<td class="text-left"></td>';
	                	tr2 = tr2 + '		<td class="text-right CNT_HORAS" style="background-color:'+color2+';">' + val3.CNT_HORAS.replace(/,/g, "") + '</td>';
		                tr2 = tr2 + '		<td class="text-right CNT_TONELADAS">' + val3.CNT_TONELADAS.replace(/,/g, "") + '</td>';
		                tr2 = tr2 + '		<td class="text-right"></td>';
		                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF"></td>';
		                tr2 = tr2 + '		<td class="text-center"></td>';
		                tr2 = tr2 + '		<td class="text-right"></td>';
		                tr2 = tr2 + '		<td class="text-right"></td>';
						tr2 = tr2 + '</tr>';  


						$.each(val3.MATERIALES, function (key4, val4) {	

							id = idAplicacionFinal + "|notificacion|rdp|" + fecha + "|" + val4.COD_GRUPO + "|" + val4.COD_MAQUINA + "|" + val4.COD_PRODUCTO + "|" + val4.COD_MATERIAL;					
							var CNT_PORCENTAJE="";
							if (val4.CNT_PORCENTAJE!=""){
								CNT_PORCENTAJE=val4.CNT_PORCENTAJE+"%";
							}

		        			tr = tr + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|" class="fila-material" style="background-color:'+color+';" data-consumo="'+val4.CNT_TONELADASNOTIF+'" data-factor="'+ val4.CNT_FACTOR + '">';
		        			tr = tr + '		<td class="text-left">'+'' +'</td>'; //val4.COD_GRUPO.trim()
		        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_MAQUINA.trim()
		        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_PRODUCTO.trim()
		        			tr = tr + '		<td class="text-left">'+val4.COD_MATERIAL.trim()+'</td>';		                	
		                	tr = tr + '		<td class="text-left"></td>';
		                	tr = tr + '		<td class="text-left"></td>';
		                	tr = tr + '		<td class="text-right CNT_HORAS"></td>';
		                	tr = tr + '		<td class="text-right CNT_TONELADAS"></td>';
		                	tr = tr + '		<td class="text-center"></td>';
		                	tr = tr + '		<td class="text-right"></td>';
			                tr = tr + '		<td class="text-right CNT_TONELADASNOTIF" data-produccion="'+val3.CNT_TONELADAS+'">' + val4.CNT_TONELADASNOTIF + '</td>';
			                tr = tr + '		<td class="text-center CNT_TONELADAS_SAP">'+val4.CNT_TONELADAS_SAP+'</td>';
			                tr = tr + '		<td class="text-right">'+CNT_PORCENTAJE+'</td>';
			                tr = tr + '		<td class="text-right"></td>';

			                tr = tr + '		<td class="text-right TH d-none"></td>';
			                tr = tr + '		<td class="text-right SEMAFORO_TH d-none"></td>';
			                tr = tr + '		<td class="text-right DOSIFICACION d-none">' + val4.DOSIFICACION + '</td>';
			                tr = tr + '		<td class="text-right IMP_COSTO_UNIT">' + val4.IMP_COSTO_UNIT + '</td>';
			                tr = tr + '		<td class="text-right IMP_COSTO_TOTAL">' + val4.IMP_COSTO_TOTAL + '</td>';	                
							tr = tr + '		<td class="text-center d-none">';
			                tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
			                tr = tr + '		</td>';
			                tr = tr + '		<td class="text-center BTN_COSTOS"></td>';			                
							tr = tr + '</tr>';


							tr2 = tr2 + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|" class="" style="background-color:'+color+';">';
		        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_GRUPO.trim() +'</td>';
		        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_MAQUINA.trim()+'</td>';
		        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_PRODUCTO.trim()+'</td>';
		        			tr2 = tr2 + '		<td class="text-left tableexport-string">'+(val4.COD_MATERIAL.trim()=="Sikagrind 285"?"Sikagrind_285":(val4.COD_MATERIAL.trim()=="ESE 388"?"ESE_388":val4.COD_MATERIAL.trim()))+'</td>';			        			
		                	tr2 = tr2 + '		<td class="text-left"></td>';
		                	tr2 = tr2 + '		<td class="text-left"></td>';
		                	tr2 = tr2 + '		<td class="text-right CNT_HORAS"></td>';
		                	tr2 = tr2 + '		<td class="text-right CNT_TONELADAS"></td>';
		                	tr2 = tr2 + '		<td class="text-right"></td>';
			                tr2 = tr2 + '		<td class="text-right CNT_TONELADASNOTIF">' + val4.CNT_TONELADASNOTIF.replace(/,/g, "") + '</td>';
			                tr2 = tr2 + '		<td class="text-center CNT_TONELADAS_SAP">'+val4.CNT_TONELADAS_SAP+'</td>';
			                tr2 = tr2 + '		<td class="text-right">'+CNT_PORCENTAJE+'</td>';
			                tr2 = tr2 + '		<td class="text-right"></td>';
							tr2 = tr2 + '</tr>';
							

							//sub-materiales
							$.each(val4.MATERIALES, function (key51, val51) {

								id = idAplicacionFinal + "|notificacion|rdp|" + fecha + "|" + val4.COD_GRUPO + "|" + val4.COD_MAQUINA + "|" + val4.COD_PRODUCTO + "|" + val4.COD_MATERIAL + "|" + val51.COD_MATERIAL;					

								tr = tr + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-unidad="" class="fila-material-sap" style="background-color:'+color+';">';
				        		tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_GRUPO.trim()
				        		tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_MAQUINA.trim()
			        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_PRODUCTO.trim()
			        			tr = tr + '		<td class="text-left">'+val4.COD_MATERIAL.trim()+'</td>';
			        			tr = tr + "		<td class='COD_MATERIAL_SAP' style='background-color:"+color2+";'></td>";
			        			tr = tr + "		<td class='DSC_MATERIAL_SAP' style='background-color:"+color2+";'>" + val51.COD_MATERIAL.trim() + "</td>";
			        			tr = tr + '		<td class="text-right CNT_HORAS"></td>';
		                		tr = tr + '		<td class="text-right CNT_TONELADAS"></td>';
		                		tr = tr + '		<td class="text-center"></td>';
			                	tr = tr + "		<td class='text-right'></td>";
					    		tr = tr + "		<td class='text-right CNT_TONELADASNOTIF' style='background-color:"+color2+";'>" + val51.CNT_TONELADASNOTIF + "</td>";

					    		if (transferir==""){
									tr = tr + "		<td class='text-right' style='position:relative;max-width:80px;'>";
									tr = tr + "			<span>"+val51.CNT_TONELADAS_SAP+"</span>";
									tr = tr + '		</td>';
								}
								else{
									tr = tr + "		<td class='text-right transferencia sub-material' style='position:relative;max-width:80px;'>";
						    		tr = tr + "			<span>"+val51.CNT_TONELADAS_SAP+"</span>";
						    		tr = tr + "			<i class='fas fa-pencil-alt editar'></i>";
						    		tr = tr + "			<input type='number' class='form-control input-height d-none' style='font-size: 12px;background-color:white; padding-right: 25px;' value='"+ val51.CNT_TONELADAS_SAP.replace(/,/gi,'') +"'/>";
						    		//tr = tr + "			<i class='fas fa-check d-none aceptar' style='position: absolute;right: 27px;top: 50%;transform: translateY(-50%);'></i>";
						    		tr = tr + "			<i class='fas fa-times d-none cancelar' style='position: absolute;right: 13px;top: 50%;transform: translateY(-50%);'></i>";
						    		tr = tr + '		</td>';
								}

								tr = tr + '		<td class="text-right"></td>';
								tr = tr + '		<td class="text-center estado">';
					    		tr = tr + '		</td>';
					    		tr = tr + '		<td class="text-right TH d-none"></td>';
					    		tr = tr + '		<td class="text-right SEMAFORO_TH d-none"></td>';
		                		tr = tr + '		<td class="text-right DOSIFICACION d-none"></td>';
		                		tr = tr + '		<td class="text-right IMP_COSTO_UNIT"></td>';
		                		tr = tr + '		<td class="text-right IMP_COSTO_TOTAL"></td>';	                
								tr = tr + '		<td class="text-center d-none">';
		                		tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
		                		tr = tr + '		</td>';
		                		tr = tr + '		<td class="text-center BTN_COSTOS"></td>';

							});


							//materiales sap
							$.each(val4.MATERIALES_SAP, function (key5, val5) {	

								id = idAplicacionFinal + "|notificacion|rdp|" + fecha + "|" + val4.COD_GRUPO + "|" + val4.COD_MAQUINA + "|" + val4.COD_PRODUCTO + "|" + val4.COD_MATERIAL + "|" + val5.COD_MATERIAL_SAP;					

								if (!(val5.CNT_PORCENTAJE=="0" || val5.CNT_PORCENTAJE=="")){
									tr = tr + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-unidad="'+val5.COD_UNIDAD+'" data-almacen="'+val5.COD_ALMACEN+'" class="fila-material-sap" style="background-color:'+color+';">';
				        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_GRUPO.trim()
				        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_MAQUINA.trim()
				        			tr = tr + '		<td class="text-left">'+''+'</td>'; //val4.COD_PRODUCTO.trim()
				        			tr = tr + '		<td class="text-left">'+val4.COD_MATERIAL.trim()+'</td>';
				        			tr = tr + "		<td class='COD_MATERIAL_SAP' style='background-color:"+color2+";'>" + val5.COD_MATERIAL_SAP.trim() + "</td>";
				        			tr = tr + "		<td class='DSC_MATERIAL_SAP' style='background-color:"+color2+";'>" + val5.DSC_MATERIAL_SAP.trim() + "</td>";
				        			tr = tr + '		<td class="text-right CNT_HORAS"></td>';
			                		tr = tr + '		<td class="text-right CNT_TONELADAS"></td>';
			                		tr = tr + '		<td class="text-center"></td>';
				                	tr = tr + "		<td class='text-right'>" + val5.CNT_PORCENTAJE + "%</td>";
						    		tr = tr + "		<td class='text-right CNT_TONELADASNOTIF' style='background-color:"+color2+";'>" + val5.CNT_TONELADASNOTIF + "</td>";

									if (transferir==""){
										tr = tr + "		<td class='text-right' style='position:relative;max-width:80px;'>";
										tr = tr + "			<span>"+val5.CNT_TONELADAS_SAP+"</span>";
										tr = tr + '		</td>';
									}
									else{
										tr = tr + "		<td class='text-right transferencia' style='position:relative;max-width:80px;'>";
							    		tr = tr + "			<span>"+val5.CNT_TONELADAS_SAP+"</span>";
							    		tr = tr + "			<i class='fas fa-pencil-alt editar'></i>";
							    		tr = tr + "			<input type='number' class='form-control input-height d-none' style='font-size: 12px;background-color:white; padding-right: 25px;' value='"+ val5.CNT_TONELADAS_SAP.replace(/,/gi,'') +"'/>";
							    		//tr = tr + "			<i class='fas fa-check d-none aceptar' style='position: absolute;right: 27px;top: 50%;transform: translateY(-50%);'></i>";
							    		tr = tr + "			<i class='fas fa-times d-none cancelar' style='position: absolute;right: 13px;top: 50%;transform: translateY(-50%);'></i>";
							    		tr = tr + '		</td>';
									}

									tr = tr + '		<td class="text-right"></td>';
						    		tr = tr + '		<td class="text-center estado">';
						    		tr = tr + '		</td>';
						    		tr = tr + '		<td class="text-right TH d-none"></td>';
						    		tr = tr + '		<td class="text-right SEMAFORO_TH d-none"></td>';
			                		tr = tr + '		<td class="text-right DOSIFICACION d-none"></td>';
			                		tr = tr + '		<td class="text-right IMP_COSTO_UNIT"></td>';
			                		tr = tr + '		<td class="text-right IMP_COSTO_TOTAL"></td>';	                
									tr = tr + '		<td class="text-center d-none">';
			                		tr = tr + '		     <a href="#" class="comentario" data-id="' + id + '"><i class="fas fa-comment"></i></a>';
			                		tr = tr + '		</td>';
			                		tr = tr + '		<td class="text-center BTN_COSTOS"></td>';


						    		tr2 = tr2 + '<tr data-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" data-padre-id="' + val4.COD_GRUPO + '|' + val4.COD_MAQUINA + '|' + val4.COD_PRODUCTO + '|' + val4.COD_MATERIAL + '|" class="" style="background-color:'+color+';">';
				        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_GRUPO.trim() +'</td>';
				        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_MAQUINA.trim()+'</td>';
				        			tr2 = tr2 + '		<td class="text-left">'+val4.COD_PRODUCTO.trim()+'</td>';				        			
				        			tr2 = tr2 + '		<td class="text-left tableexport-string">'+(val4.COD_MATERIAL.trim()=="Sikagrind 285"?"Sikagrind_285":(val4.COD_MATERIAL.trim()=="ESE 388"?"ESE_388":val4.COD_MATERIAL.trim()))+'</td>';			        			
				        			tr2 = tr2 + "		<td class='COD_MATERIAL_SAP tableexport-string' style='background-color:"+color2+";'>" + val5.COD_MATERIAL_SAP.trim() + "</td>";
				        			tr2 = tr2 + "		<td class='DSC_MATERIAL_SAP tableexport-string' style='background-color:"+color2+";'>" + (val5.DSC_MATERIAL_SAP.trim()=="Sikagrind 285"?"Sikagrind_285":(val5.DSC_MATERIAL_SAP.trim()=="ESE 388"?"ESE_388":val5.DSC_MATERIAL_SAP.trim())) + "</td>";
				        			tr2 = tr2 + '		<td class="text-right CNT_HORAS"></td>';
			                		tr2 = tr2 + '		<td class="text-right CNT_TONELADAS"></td>';
				                	tr2 = tr2 + "		<td class='text-right'>" + val5.CNT_PORCENTAJE + "%</td>";
						    		tr2 = tr2 + "		<td class='text-right CNT_TONELADASNOTIF' style='background-color:"+color2+";'>" + val5.CNT_TONELADASNOTIF.replace(/,/g, "") + "</td>";
						    		
						    		if (transferir==""){
										tr2 = tr2 + "		<td class='text-right' style='position:relative;max-width:80px;'>";
							    		tr2 = tr2 + "			<span>"+val5.CNT_TONELADAS_SAP.replace(/,/g, "")+"</span>";
							    		tr2 = tr2 + '		</td>';
						    		}
						    		else {
						    			tr2 = tr2 + "		<td class='text-right transferencia' style='position:relative;max-width:80px;'>";
							    		tr2 = tr2 + "			<span>"+val5.CNT_TONELADAS_SAP.replace(/,/g, "")+"</span>";
							    		tr2 = tr2 + "			<i class='fas fa-pencil-alt editar'></i>";
							    		tr2 = tr2 + "			<input type='number' class='form-control input-height d-none' style='font-size: 12px;background-color:white; padding-right: 25px;' value='"+ val5.CNT_TONELADAS_SAP.replace(/,/gi,'') +"'/>";
							    		//tr2 = tr2 + "			<i class='fas fa-check d-none aceptar' style='position: absolute;right: 27px;top: 50%;transform: translateY(-50%);'></i>";
							    		tr2 = tr2 + "			<i class='fas fa-times d-none cancelar' style='position: absolute;right: 13px;top: 50%;transform: translateY(-50%);'></i>";
							    		tr2 = tr2 + '		</td>';
						    		}
						    		
						    		tr2 = tr2 + '		<td class="text-right"></td>';
						    		tr2 = tr2 + '		<td class="text-center estado">';
						    		tr2 = tr2 + '		</td>';

						    	


			                		
						    					                		
			                	}								
								
							});							

		        		});

	        		});

        		});
        	});

        	$("#cuerpo-tabla-arbol-rdp").html(tr);
        	$("#cuerpo-tabla-arbol-rdp2").html(tr2);


        },
        complete: function(){

        	$(".estado i").on("click", function(){
        		var cod = $(this).parent().parent().attr("data-cod-respuesta");
        		var msj = $(this).parent().parent().attr("data-dsc-respuesta");
        		var msjDetalle = $(this).parent().parent().attr("data-dsc-respuesta-detalle");
        		//var cod = $($(this).find("i")[0]).attr("data-cod");
        		//var msj = $($(this).find("i")[0]).attr("data-msj");

        		$("#msj-notas").addClass("d-none");
        		if ($(this).hasClass("modificado")){
        			$("#msj-notas").removeClass("d-none");
        			$("#msj-notas").text("El valor de producción ha variado con respecto al que existía cuando se realizó la notificación");
        		}
        		if ($(this).hasClass("modificado_por_usuario")){
        			$("#msj-notas").removeClass("d-none");
        			$("#msj-notas").text("Existen cambios en los valores realizados por el usuario");
        		}

        		$("#cod-resultado").text(cod);
        		$("#msj-resultado").text(msj);

        		//mostramos el detalle
        		$("#cuerpo-tabla-resultado-detalle").empty();
        		var aMsjDetalle = msjDetalle.split('|');

        		var tr="";
        		for (i=0; i<aMsjDetalle.length; i++){
        			tr = tr + '<tr>';
        			tr = tr + '		<td class="text-left">';
        			tr = tr + 			aMsjDetalle[i].trim();
        			tr = tr + 		'</td>';
        			tr = tr + '</tr>';
        		}
        		$("#cuerpo-tabla-resultado-detalle").html(tr);

				mostrarModal("modal-resultado");
			});
			
        	$(".editar").on("click", function(){
        		$(this).parent().find("input").removeClass("d-none");
        		//$(this).parent().find(".aceptar").removeClass("d-none");
        		$(this).parent().find(".cancelar").removeClass("d-none");
        		$(this).parent().find("span").addClass("d-none");
        		$(this).parent().find(".editar").addClass("d-none");
        		$(this).parent().find("input").focus();

        		activarEdicionCelda($(this).parent().find("input"));
        	});

        	$(".cancelar").on("click", function(){
        		$(this).parent().find("input").addClass("d-none");
        		//$(this).parent().find(".aceptar").addClass("d-none");
        		$(this).parent().find(".cancelar").addClass("d-none");
        		$(this).parent().find("span").removeClass("d-none");
        		$(this).parent().find(".editar").removeClass("d-none");        		
        	});

			//combo procesos				
			opcionProceso = '<option value="" selected>Todas los grupos</option>' + opcionProceso;
			$("#cmb-proceso").html(opcionProceso);

			//combo maquinas
			var aMaquinasUnicos = filtrarUnicos(aMaquinas);
			var opcionMaquina = "";
			$.each(aMaquinasUnicos, function (key, val) {	
				opcionMaquina=opcionMaquina+'<option value="' + val + '">' + val + '</option>';
			});
			opcionMaquina = '<option value="" selected>Todas las máquinas</option>' + opcionMaquina;
			$("#cmb-maquina").html(opcionMaquina);

			//combo productos
			var aProductosUnicos = filtrarUnicos(aProductos);
			var opcionProducto = "";
			$.each(aProductosUnicos, function (key, val) {	
				opcionProducto=opcionProducto+'<option value="' + val + '">' + val + '</option>';
			});
			opcionProducto = '<option value="" selected>Todos los productos</option>' + opcionProducto;
			$("#cmb-producto").html(opcionProducto);



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


		     $(".fila-material .CNT_TONELADASNOTIF").mouseenter(function() {		    	
		    	
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


function activarEdicionCelda(objCelda){

	console.log("activo edicion celda");
	
    //agregamos evento por si hay un mouseup posterior
   	$(document).off("mouseup");
	$(document).on("mouseup", function(e){

          var container = $(objCelda);
          //console.log(container);
          //console.log(e.target);
          //console.log(container.is(e.target));

          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0) 
          {
            //alert('salio del input de la celda');  
            console.log("salio del input de la celda");

            $(objCelda).parent().find("input").addClass("d-none");        	
			$(objCelda).parent().find(".cancelar").addClass("d-none");
			$(objCelda).parent().find("span").removeClass("d-none");
    		$(objCelda).parent().find(".editar").removeClass("d-none");                                

    		var valorOriginal = $(objCelda).parent().find("span").text();
    		var valor = $(objCelda).parent().find("input").val();
    		$(objCelda).parent().find("span").text(addCommas(valor));



    		//actualizamos suma del material padre
    		var totalConsumoMaterial=0;
    		var IdMaterial = $(objCelda).parent().parent().attr("data-id");
    		var aMaterialesSap = $("#cuerpo-tabla-arbol-rdp tr[data-padre-id^='" + IdMaterial + "']");

			for (i=0;i<aMaterialesSap.length;i++){
				var consumo = $(aMaterialesSap[i]).find("td.transferencia span").text();
				consumo = parseInt(consumo.replace(/,/gi,""));
				if (!isNaN(consumo)){
					totalConsumoMaterial=totalConsumoMaterial+consumo;
				}				
			}
			$("#cuerpo-tabla-arbol-rdp tr[data-id='" + IdMaterial + "']").attr("data-consumo",totalConsumoMaterial);
			$("#cuerpo-tabla-arbol-rdp tr[data-id='" + IdMaterial + "'] td.CNT_TONELADAS_SAP").text(addCommas(totalConsumoMaterial));

			//validamos si es submaterial
    		if ($(objCelda).parent().hasClass("sub-material")) {
    			var IdProducto = $("#cuerpo-tabla-arbol-rdp tr.fila-material[data-id='" + IdMaterial + "']").attr("data-padre-id");
    			$("#cuerpo-tabla-arbol-rdp tr[data-id='" + IdProducto + "']").attr("data-cnt-gas",addCommas(totalConsumoMaterial));
    		}


    		//actualizamos suma del producto
			var aIdMaterial = $(objCelda).parent().parent().attr("data-padre-id").split("|");	
			var idProducto = aIdMaterial[0]+"|"+aIdMaterial[1]+"|"+aIdMaterial[2]+"|";

			if (aIdMaterial[3]!="Gas"){

				var aMateriales = $("#cuerpo-tabla-arbol-rdp tr.fila-material[data-padre-id^='" + idProducto + "']");
				var totalProduccion=0;

				for (i=0;i<aMateriales.length;i++){				
					var consumo = $(aMateriales[i]).attr("data-consumo")						
					consumo = parseInt(consumo.replace(/,/gi,""));

					var factor = $(aMateriales[i]).attr("data-factor")						
					factor = parseFloat(factor.replace(/,/gi,""));

					console.log(consumo)
					console.log(factor)

					if (!isNaN(consumo) && !isNaN(factor)){
						var produccion=Math.round10(consumo*factor);
						totalProduccion=totalProduccion+produccion;
					}				
				}			
				$("#cuerpo-tabla-arbol-rdp tr[data-id='" + idProducto + "'] td.SUMA_TRANSFERENCIA").text(addCommas(totalProduccion));
				
			}

			//verificamos si el usuario cambio un valor
			if (valorOriginal!=addCommas(valor)){
    			//agregamos la class "ok" para que el bloque pueda ser reprocesado
    			$("#cuerpo-tabla-arbol-rdp tr[data-id='" + idProducto + "']").addClass("ok");

    			if ($("#cuerpo-tabla-arbol-rdp tr[data-id='" + idProducto + "']").attr("data-estado")=="T"){
    				//si el bloque ya fue transferido con exito antes, marcamos icono de amarillo
    				$("#cuerpo-tabla-arbol-rdp tr[data-id='" + idProducto + "'] td.estado i.transf-transferido").addClass("modificado_por_usuario");
    			} 		
    		}

			


    		$(document).off("mouseup");
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
        var current = event.resultnotificacion;

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