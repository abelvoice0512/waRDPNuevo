var ipService = parametros.servidor + parametros.aplicacion;

var colorChart = {
	colorHT: "#3CB371",
	colorIM: "#A9A9A9",
	colorIE: "#FFD700",
	colorIO: "#9370DB",
	colorPP: "#4169E1",
	colorPC: "#FF7F50",
	colorNC: "#000000"
};

var oChart;
var oChartFiabilidad;

var modoChartInicial="produccion";
var oFiltrosFechaFiabilidad;
var oDataInfoProductos;

var AltoContenedorChartProduccion=0;
var AltoContenedorChartFiabilidad=0;
var AltoContenedorChart=0;

if (parametros.aplica_autenticacion==true){
	ValidaAutenticacion();
}

$(document).ready(function() {
	cargarMaquinas();
	cargarProcesos();
	configuracionInicial();
	configuracionEventos();

	var cFecha = $("#fecha-reporte2").val();
	var cMaquina = $("#cmb-maquina").val();


	cargarResumen(cFecha, cMaquina);
	cargarServiceChart(cFecha,cMaquina,15);
	cargarServiceRangoFechas(cFecha, cMaquina);	
	cargarTablaRendimiento(cFecha,cMaquina);
	cargarTablaEnergia(cFecha,cMaquina,15);
	cargarChartFiabilidad(cFecha,cMaquina,15);	
	cargarParadasDeMaquina(cFecha, cMaquina);

	

});





function cargarMaquinas(){
	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarMaquinas", 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function (){            
                            
        }, 
		success: function(data){ 
			var a="";
			var option="";
			$.each(data, function (key, val) {
				//a=a+"<a class='dropdown-item'>" + val.Nombre + "</a>";
				option=option + '<option value="' + val.Nombre + '">' + val.Nombre + '</option>';
			});

			$("#cmb-maquina").html(option);
		},
		complete: function(){
			
		} 
	});	
}


function cargarProcesos(){
	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarGruposRDP", 
		dataType: 'json', 
		data: null, 
		async: 	false, 
		beforeSend: function (){            
                            
        }, 
		success: function(data){ 
			var a="";
			var option="";
			$.each(data, function (key, val) {
				//a=a+"<a class='dropdown-item'>" + val.Nombre + "</a>";
				option=option + '<option value="' + val.id + '">' + val.text + '</option>';
			});

			$("#cmb-proceso").html(option);
			$("#cmb-proceso2").html(option);
		},
		complete: function(){
			
		} 
	});	
}

function configuracionInicial() {
	//seteamos la fecha al dia de hoy
	var dHoy = new Date();	
	var cHoy = obtener_cadena_fecha_estandar(dHoy);
	var cHoyEstandar = obtener_cadena_fecha_estandar(dHoy);

	$("#fecha-reporte2").val(cHoy);

	//$("#ifrRDP").attr("src","http://srvpiweb/waRDP?embebido=1&fecha="+cHoy+"&tipo=CORREGIDO");

	var usuario = window.localStorage.usuario; 
	$("#lbl-usuario").text(usuario);

	setInterval(refrescarTamañoHighcharts, 1000);
	setInterval(refrescarSparklines, 1000);

	//colapzamos los bloques laterales por default		
	
	if(window.innerWidth>1200)
		$('body').toggleClass('offcanvas-active');

	/*
	else 
		$('body').removeClass('offcanvas-active');
	*/
	

	
	var cFechaIni = aumentar_n_dias(cHoy,-14);
	$("#fecha-rango-rendimiento-fin").val(cHoy);
	$("#fecha-rango-rendimiento-ini").val(cFechaIni);
	$("#fecha-rango-energia-fin").val(cHoy);
	$("#fecha-rango-energia-ini").val(cFechaIni);

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



	//cargamos ficha procesos2 por default	
	$("#link-procesos2").addClass("active");
	activarPanelProcesos2()
	cargarFichaProcesos2();

	var cFecha = $("#fecha-reporte2").val();
	var cFechaAnterior = aumentar_n_dias(cFecha,-1);
	var grupo = $("#cmb-proceso2").val();

	if (url_pivision_procesos[grupo]!==undefined){
		$("#ifr-pivision2").attr("src", url_pivision_procesos[grupo] + "?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");
		$("#contenedor-pivision2").removeClass("d-none");
	}
	else {
		$("#contenedor-pivision2").addClass("d-none");
	}
	//$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	


	if (localStorage.tabDefault !== undefined){

		$("input[name='tab-default'][value='" + localStorage.tabDefault + "']").prop("checked", true);	

		$("#barra-links .nav-link").removeClass("active");		

		if (localStorage.tabDefault=="dashboard"){			
			$("#link-dashboard").addClass("active");
			activarPanelDashboard();
		}
		else if (localStorage.tabDefault=="rdp"){
			$("#link-rdp").addClass("active");
			activarPanelRDP();
		}
		else if (localStorage.tabDefault=="procesos"){
			$("#link-procesos").addClass("active");
			activarPanelProcesos();

			cargarFichaProcesos();

			var cFecha = $("#fecha-reporte2").val();
			var cFechaAnterior = aumentar_n_dias(cFecha,-1);
			$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
		}
		else if (localStorage.tabDefault=="procesos2"){
/*			
			$("#link-procesos2").addClass("active");
			activarPanelProcesos2();	


			cargarFichaProcesos2();

			var cFecha = $("#fecha-reporte2").val();
			var cFechaAnterior = aumentar_n_dias(cFecha,-1);
			$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
*/	
		}



	}


	
	

	$("#oFrameCuaderno").attr("src", parametros.urlCuadernoOcurrencias + "/?fecha=" + cHoy);

	//oFiltrosFechaFiabilidad =  new FiltroFecha("contenedor-chart-fiabilidad","filtros-chart-fiabilidad",$("#fecha-reporte2").val(),"graficarChartFiabilidad()");	

	//carga de arbol test
	var dataArbol = [
	  {
	    text: "Parent 1",
	    icon: "glyphicon glyphicon-stop",
	    nodes: [
	      {
	        text: "Child 1 <span style='font-size:30px;'>jajaja</span>",
	        codigo: "32435",
	        state: {
	        	checked: true,			    			  
			    expanded: true,			    
			},
			tags: ["available"],
	        nodes: [
	          {
	            text: "Grandchild 1"
	          },
	          {
	            text: "Grandchild 2"
	          }
	        ]
	      },
	      {
	        text: "Child 2"
	      }
	    ]
	  },
	  {
	    text: "Parent 2"
	  },
	  {
	    text: "Parent 3"
	  },
	  {
	    text: "Parent 4"
	  },
	  {
	    text: "Parent 5"
	  }
	];

	$('#tree').treeview({data: dataArbol});

	$('#tree').on('nodeSelected', function(event, data) {
  		console.log(data);
	});

}

function activarTemaDark(){
	$('body').addClass('dark-mode');

	var cFecha = $("#fecha-reporte2").val();	
	var cMaquina = $("#cmb-maquina").val();		
	cargarResumen(cFecha, cMaquina);	
	cargarServiceChart(cFecha,cMaquina,15);	
	cargarServiceRangoFechas(cFecha, cMaquina);	
	cargarTablaRendimiento(cFecha,cMaquina);

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);	

	cargarTablaEnergia(cFecha,cMaquina,15);	

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);

}

function activarTemaLight(){
	$('body').removeClass('dark-mode');

	var cFecha = $("#fecha-reporte2").val();	
	var cMaquina = $("#cmb-maquina").val();	
	cargarResumen(cFecha, cMaquina);		
	cargarServiceChart(cFecha,cMaquina,15);	
	cargarServiceRangoFechas(cFecha, cMaquina);	
	cargarTablaRendimiento(cFecha,cMaquina);

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);	

	cargarTablaEnergia(cFecha,cMaquina,15);	

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);

}

function graficarChartFiabilidad(){
	var cFechaFin = oFiltrosFechaFiabilidad.obtenerFechaFin();  			
  	var nDias = oFiltrosFechaFiabilidad.obtenerDias();
  	var maquina=$("#cmb-maquina").val();  	
  	cargarChartFiabilidad(cFechaFin,maquina,nDias);
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

	//evento de fecha
	$("#fecha-reporte2").change(function(){		  		
		procesarCambioFecha();
	});

	$("#cmb-maquina").on("change",function(){		  		
		procesarCambioMaquina();
	});
	

	$("#link-produccion-dia").on("click", function(){
		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-chart-produccion").removeClass("d-none");		
		$("#card-principal .card-title").text("Producción");
		$("#card-spectrum").removeClass("card-collapsed");

		modoChartInicial="produccion";

		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();
		cargarServiceChart(cFecha,cMaquina,15);	
	});

	$("#link-rendimiento-dia").on("click", function(){
		
		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-tabla-rendimiento").removeClass("d-none");		
		$("#card-principal .card-title").text("Rendimiento");
		$("#card-spectrum").removeClass("card-collapsed");

		modoChartInicial="rendimiento";

		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();
		cargarTablaRendimiento(cFecha,cMaquina);	

		var diaDeFecha = cFecha.substring(8,10);
		cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);
		

	});

	$("#link-consumo-energia-dia").on("click", function(){
		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-tabla-energia").removeClass("d-none");
		$("#card-principal .card-title").text("Energía");	
		$("#card-spectrum").removeClass("card-collapsed");	

		//modoChartInicial="energia";

		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();
		cargarTablaEnergia(cFecha,cMaquina,15);	

		var diaDeFecha = cFecha.substring(8,10);
		cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);
		
	});

	$("#link-fiabilidad-dia").on("click", function(){

		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-chart-fiabilidad").removeClass("d-none");		
		$("#card-principal .card-title").text("Fiabilidad");	
		$("#card-spectrum").removeClass("card-collapsed");	
	
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();
		
		cargarChartFiabilidad(cFecha,cMaquina,15);	
	});

	$("#link-calidad-dia").on("click", function(){
		
		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-tabla-calidad").removeClass("d-none");		
		$("#card-principal .card-title").text("Datos de Calidad");
		$("#card-spectrum").removeClass("card-collapsed");
		
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();

		cargarCalidad(cFecha,cMaquina);

		//cargarTablaRendimiento(cFecha,cMaquina);	
		//cargarTablaRendimientoSumarizado(cFecha,cMaquina,15)		
	});


	$("#link-horas-dia").on("click", function(){
		cargarLinkHorasDia();
	});


	$(".contenedor-tipos-graficos-simple i").on("click", function(){
		$(".chart-rendimiento").removeClass("show");

		var idChart = $(this).attr("data-chart");
		$("#"+idChart).addClass("show");				
	});
	
	$(".contenedor-tipos-graficos-sumarizado i").on("click", function(){
		$(".chart-rendimiento-sumarizado").removeClass("show");

		var idChart = $(this).attr("data-chart");
		$("#"+idChart).addClass("show");				
	});
	
	$(".contenedor-tipos-graficos-energia-simple i").on("click", function(){
		$(".chart-rendimiento-energia").removeClass("show");

		var idChart = $(this).attr("data-chart");
		$("#"+idChart).addClass("show");			
	});

	$(".contenedor-tipos-graficos-energia-sumarizado i").on("click", function(){
		$(".chart-energia-sumarizado").removeClass("show");

		var idChart = $(this).attr("data-chart");
		$("#"+idChart).addClass("show");			
	});

	$("#btn-sumarizado-2s").on("click", function(e){
		e.preventDefault();
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();		
		cargarTablaRendimientoSumarizado(cFecha,cMaquina,15);
	});

	$("#btn-sumarizado-1m").on("click", function(e){
		e.preventDefault();
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();		

		var diaDeFecha = cFecha.substring(8,10);				
		cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);
	});

	$("#btn-sumarizado-r").on("click", function(e){
		e.preventDefault();
		MostrarModalSeleccionarRangoRendimiento();
	});

	$("#btn-energia-sumarizado-2s").on("click", function(e){
		e.preventDefault();
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();		
		cargarTablaEnergiaSumarizado(cFecha,cMaquina,15);
	});

	$("#btn-energia-sumarizado-1m").on("click", function(e){
		e.preventDefault();
		var cFecha = $("#fecha-reporte2").val();
		var cMaquina = $("#cmb-maquina").val();		

		var diaDeFecha = cFecha.substring(8,10);
		cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);
	});

	$("#btn-energia-sumarizado-r").on("click", function(e){
		e.preventDefault();
		MostrarModalSeleccionarRangoEnergia();
	});

	$("#btn-aceptar-rango-rendimiento").on("click", function(){
		var cFechaIni = $("#fecha-rango-rendimiento-ini").val();
		var cFechaFin = $("#fecha-rango-rendimiento-fin").val();
		var dias = restarFechasADias(cFechaIni,cFechaFin);

		var cMaquina = $("#cmb-maquina").val();		
		cargarTablaRendimientoSumarizado(cFechaFin,cMaquina,dias+1);
		ocultarModal("oModalSeleccionarRangoRendimiento");
	});

	$("#btn-aceptar-rango-energia").on("click", function(){
		var cFechaIni = $("#fecha-rango-energia-ini").val();
		var cFechaFin = $("#fecha-rango-energia-fin").val();
		var dias = restarFechasADias(cFechaIni,cFechaFin);

		var cMaquina = $("#cmb-maquina").val();		
		cargarTablaEnergiaSumarizado(cFechaFin,cMaquina,dias+1);
		ocultarModal("oModalSeleccionarRangoEnergia");
	});

	$(".setting_switch .btn-darkmode").on('change',function() {
		/*
		if(this.checked) {
			$('body').addClass('dark-mode');

		}else{
			
		}
		*/

		if(this.checked) {
			localStorage.tema="dark-mode";

			$(".img-boton-d").attr("src","./assets/img/cal-d-dark-30.png");
			$(".img-boton-m").attr("src","./assets/img/cal-m-dark-30.png");
			$(".img-boton-2s").attr("src","./assets/img/cal-2s-dark-30.png");
			$(".img-boton-r").attr("src","./assets/img/cal-r-dark-30.png");
		}
		else {
			localStorage.tema="light-mode";	

			$(".img-boton-d").attr("src","./assets/img/cal-d-light-30.png");
			$(".img-boton-m").attr("src","./assets/img/cal-m-light-30.png");
			$(".img-boton-2s").attr("src","./assets/img/cal-2s-light-30.png");
			$(".img-boton-r").attr("src","./assets/img/cal-r-light-30.png");
		}

		var cFecha = $("#fecha-reporte2").val();	
		var cMaquina = $("#cmb-maquina").val();	
		cargarResumen(cFecha, cMaquina);		
		cargarServiceChart(cFecha,cMaquina,15);	
		cargarServiceRangoFechas(cFecha, cMaquina);	
		cargarTablaRendimiento(cFecha,cMaquina);

		var diaDeFecha = cFecha.substring(8,10);
		cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);	

		cargarTablaEnergia(cFecha,cMaquina,15);	

		var diaDeFecha = cFecha.substring(8,10);
		cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);

		cargarFichaProcesos2();
		cargarParadasDeMaquina(cFecha,cMaquina);

    });


	$('input[type=radio][name=font-size]').change(function() {
		modificarTamanoFuente(this.value);
	});

	$('input[type=radio][name=tab-default]').change(function() {
		localStorage.tabDefault = this.value;
	});


    $(".contenedor-botones-productividad .ver-separado").on("click", function(){
		$("#chart_produccion").addClass("d-none");
		$("#chart_produccion1").removeClass("d-none");
		$("#chart_produccion2").removeClass("d-none");
	});

	$(".contenedor-botones-productividad .ver-junto").on("click", function(){
		$("#chart_produccion").removeClass("d-none");
		$("#chart_produccion1").addClass("d-none");
		$("#chart_produccion2").addClass("d-none");
	});

	$("#btn-ver-cuaderno").on("click", function(){
		mostrarModal("oModalCuaderno");	
	});


	$("#link-dashboard").on("click", function(){
		activarPanelDashboard()				
	});

	$("#link-rdp").on("click", function(){
		activarPanelRDP();		
	});

	$("#link-procesos").on("click", function(){
		activarPanelProcesos();		
	});

	$("#link-procesos2").on("click", function(){
		activarPanelProcesos2();
		
	});

	$("#left-sidebar .nav-tabs .nav-link").on("click", function(){
		var tabname = $(this).attr("href");

		$("#left-sidebar .tab-pane").removeClass("active");
		$("#left-sidebar .tab-pane").removeClass("show");

		$(tabname).addClass("active, show");
		//$(tabname).addClass("show");
	});


	$("#card-principal .fe-maximize").on("click", function(){		

		if ($("#card-principal").hasClass("card-fullscreen")) {
			//se esta minimizando			
			$($(".contenedor-chart").not(".d-none")[0]).height(AltoContenedorChart);

			//$("#contenedor-chart-produccion").height(AltoContenedorChartProduccion);
			//$("#contenedor-chart-fiabilidad").height(AltoContenedorChartFiabilidad);
		}
		else {
			//se esta maximizando
			AltoContenedorChart = $($(".contenedor-chart").not(".d-none")[0]).height();

			//AltoContenedorChartProduccion = $("#contenedor-chart-produccion").height();		
			//AltoContenedorChartFiabilidad = $("#contenedor-chart-fiabilidad").height();			
		}
	});

	$(".paradas-flecha-izq").on("click", function(){
		var fecha = $("#fecha-reporte2").val();
		var fechaAnterior = aumentar_n_dias(fecha,-1);

		$("#fecha-reporte2").val(fechaAnterior);
		procesarCambioFecha();
	});

	$(".paradas-flecha-der").on("click", function(){
		var fecha = $("#fecha-reporte2").val();
		var fechaPosterior = aumentar_n_dias(fecha,1);

		$("#fecha-reporte2").val(fechaPosterior);
		procesarCambioFecha();
	});
    	
    $("#btn-salir").on("click", function(e){
    	e.preventDefault();
    	window.location.href="http://srvgoatc01/go/";
    });

    $("#cmb-proceso").on("change",function(){
    	cargarFichaProcesos();
    });

    $("#chk-ocultar-maquinas input").on("change", function(){
		cargarFichaProcesos();
    });

    $("#cmb-proceso2").on("change",function(){
    	cargarFichaProcesos2();
    });

    $("#chk-ocultar-maquinas2 input").on("change", function(){
		cargarFichaProcesos2();
    });
    
    
    $("#btn-arbol-paradas-d").on("click", function(){
    	var fecha = $("#fecha-reporte2").val();
    	var maquina = $("#cmb-maquina").val();
    	cargarArbolParadasDeMaquina(fecha, fecha, maquina);    	
    });

    $("#btn-arbol-paradas-m").on("click", function(){
    	var fechaFin = $("#fecha-reporte2").val();
    	//var fechaIni = aumentar_n_dias(fechaFin,-29);
    	var fechaUnoMes = fechaFin.substring(0,7)+"-01";
    	var maquina = $("#cmb-maquina").val();
    	cargarArbolParadasDeMaquina(fechaUnoMes, fechaFin, maquina);    	
    });

    $("#btn-arbol-paradas-2s").on("click", function(){
    	var fechaFin = $("#fecha-reporte2").val();
    	var fechaIni = aumentar_n_dias(fechaFin,-13);
    	var maquina = $("#cmb-maquina").val();
    	cargarArbolParadasDeMaquina(fechaIni, fechaFin, maquina);    	    
    });

    $("#btn-arbol-paradas-r").on("click", function(e){
		e.preventDefault();
		var fecha = $("#fecha-reporte2").val();
		$("#fecha-rango-arbol-paradas-ini").val(fecha);
		$("#fecha-rango-arbol-paradas-fin").val(fecha);
		MostrarModalSeleccionarRangoArbolParadas();
	});

	$("#btn-aceptar-rango-arbol-paradas").on("click", function(){
    	var fechaFin = $("#fecha-rango-arbol-paradas-fin").val();
    	var fechaIni = $("#fecha-rango-arbol-paradas-ini").val();
    	var maquina = $("#cmb-maquina").val();
    	ocultarModal("oModalSeleccionarRangoArbolParadas");
    	cargarArbolParadasDeMaquina(fechaIni, fechaFin, maquina);    	    
    });


    $("#link-paradas-pareto-cantidad").on("click", function(){
		$(".bloque-paradas").addClass("d-none");
		$("#bloque-paradas-pareto-cantidad").removeClass("d-none");
	});

	$("#link-paradas-pareto-duracion").on("click", function(){
		$(".bloque-paradas").addClass("d-none");
		$("#bloque-paradas-pareto-duracion").removeClass("d-none");
	});

	$("#link-paradas-datos").on("click", function(){
		$(".bloque-paradas").addClass("d-none");
		$("#bloque-paradas-datos").removeClass("d-none");
	});

	$(".filtros-tipo-parada-cantidad input[type='checkbox']").on("change", function(){		
		actualizarChartsPareto();
	});

	$("#btnCerrarModalProduccionProductoPorMaquinaDetalle").on("click", function(){
		ocultarModal("oModalProduccionProductoPorMaquinaDetalle");
	});


	$("#btnCerrarModalEnergiaProduccionProductoPorMaquinaDetalle").on("click", function(){
		ocultarModal("oModalEnergiaProduccionProductoPorMaquinaDetalle");
	});
	

	$(".copiar-elemento").on("click", function(){

		var idElemento = $(this).attr("data-elemento");
		console.log(idElemento);
		var urlField = document.querySelector("#"+idElemento);
		console.log(urlField);

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

}


function cargarLinkHorasDia(){
	$(".contenedor-chart").addClass("d-none");
	$("#contenedor-tabla-horas").removeClass("d-none");		
	$("#card-principal .card-title").text("Resumen de Paradas");
	$("#card-detalle-paradas .card-title").text("Detalle de Paradas");
	$("#card-spectrum").addClass("card-collapsed");

	var cFecha = $("#fecha-reporte2").val();
	var cMaquina = $("#cmb-maquina").val();
			
	cargarParadasDeMaquina(cFecha, cMaquina);
}

function MostrarModalSeleccionarRangoArbolParadas(){
	mostrarModal("oModalSeleccionarRangoArbolParadas");
	$("#lblTituloModalSeleccionarRangoArbolParadas").text("Seleccionar Rango de Fechas");
}


function activarPanelDashboard(){
	$(".panel-principal").addClass("d-none");		
	$("#panel-dashboard").removeClass("d-none");
	$("#panel-procesos").addClass("d-none");
	$("#panel-procesos2").addClass("d-none");
	$("#cmb-maquina").removeClass("d-none");
	$("#cmb-proceso").addClass("d-none");
	$("#chk-ocultar-maquinas").addClass("d-none");
	$("#cmb-proceso2").addClass("d-none");
	$("#chk-ocultar-maquinas2").addClass("d-none");
}

function activarPanelRDP(){
	$(".panel-principal").addClass("d-none");			
		$("#panel-rdp").removeClass("d-none");
		$("#panel-procesos").addClass("d-none");
		$("#panel-procesos2").addClass("d-none");
		$("#cmb-maquina").addClass("d-none");
		$("#cmb-proceso").addClass("d-none");
		$("#chk-ocultar-maquinas").addClass("d-none");
		$("#cmb-proceso2").addClass("d-none");
		$("#chk-ocultar-maquinas2").addClass("d-none");

		var cFecha = $("#fecha-reporte2").val();			
		$("#ifrRDP").attr("src","http://srvpiweb/waRDP?embebido=1&fecha="+cFecha);		
}

function activarPanelProcesos(){
	$(".panel-principal").addClass("d-none");		
		$("#panel-rdp").addClass("d-none");
		$("#panel-procesos").removeClass("d-none");
		$("#panel-procesos2").addClass("d-none");
		$("#cmb-maquina").addClass("d-none");
		$("#cmb-proceso").removeClass("d-none");
		$("#chk-ocultar-maquinas").removeClass("d-none");
		$("#cmb-proceso2").addClass("d-none");
		$("#chk-ocultar-maquinas2").addClass("d-none");

		cargarFichaProcesos();		
}

function activarPanelProcesos2(){
	$(".panel-principal").addClass("d-none");		
		$("#panel-rdp").addClass("d-none");
		$("#panel-procesos").addClass("d-none");
		$("#panel-procesos2").removeClass("d-none");
		$("#cmb-maquina").addClass("d-none");
		$("#cmb-proceso").addClass("d-none");
		$("#cmb-proceso2").removeClass("d-none");
		$("#chk-ocultar-maquinas").addClass("d-none");
		$("#chk-ocultar-maquinas2").removeClass("d-none");

		cargarFichaProcesos2();		
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

function cargarFichaProcesos(){

	var fecha = $("#fecha-reporte2").val();
	var grupo=$("#cmb-proceso").val();

	

	$.ajax({ 
		//url: ipService+"/Operaciones.svc/ListarMaquinasDeGrupo?grupo="+grupo, 
		url: ipService+"/Operaciones.svc/ListarIndicadoresDeMaquinasPorGrupo?fecha="+fecha+"&grupo="+grupo+"&origen=P", 
		dataType: 'json', 
		data: null, 
		async: 	true, 
		beforeSend: function (){            
        	$("#contenedor-procesos-maquinas").empty();
        }, 
		success: function(data){ 
			
			var div="";
			$.each(data, function (key, val) {	

				if (
					  ($("#chk-ocultar-maquinas input").prop("checked")==true && formatearNumero(val.SumProduccion,0)!=0)
					  ||
					  ($("#chk-ocultar-maquinas input").prop("checked")==false)
				    ) {


					div = div + '<div class="col-xl-3 col-lg-4 col-md-6">';
					div = div + '	<div class="card">';
					div = div + '		<div class="card-body text-center">';				
					div = div + '			<h5 class="mb-0">' + val.NombreMaquina.trim() + '</h5>';
					div = div + '			<i class="fas fa-link ver-dashboard" data-maquina="' + val.NombreMaquina.trim() + '"></i>';
					div = div + '			<p class="mb-4 mt-3 text-left">';
					div = div + '				<table class="tabla-maquina-indicadores">';
					div = div + '					<tr><td class="text-left">Producción Total:</td><td>' + formatearNumero(val.SumProduccion,0) + ' t</td><td></td></tr>';
					div = div + '					<tr><td class="text-left">Horas Trabajadas:</td><td>' + val.SumHTrabajo + ' h</td><td></td></tr>';
					div = div + '					<tr><td class="text-left">Rendimiento:</td><td>' + formatearNumero(val.TH,0) + ' t/h</td><td><i class="fas fa-circle" style="color:' + val.ColorTH + ';"></i></td></tr>';
					div = div + '					<tr><td class="text-left">Energía:</td><td>' + formatearNumero(val.KWHT,2) + ' kWh/t</td><td><i class="fas fa-circle" style="color:' + val.ColorKWHT + ';"></i></td></tr>';
					div = div + '					<tr><td class="text-left">Fiabilidad:</td><td>' + (val.PorcFiab*100).toFixed(0) + ' %</td><td><i class="fas fa-circle" style="color:' + val.ColorFIAB + ';"></i></td></tr>';
					div = div + '					<tr><td class="text-left">Calidad:</td><td></td><td><i class="fas fa-circle" style="color:' + val.ColorCAL + ';"></i></td></tr>';					
					div = div + '				</table>';
					//div = div + '				<button class="btn btn-primary btn-sm gestionar">Ver Detalle</button>';
					div = div + '			</p>';
					div = div + '		</div>';
					div = div + '	</div>';
					div = div + '</div>';

				}


				
			});

			$("#contenedor-procesos-maquinas").html(div);
		},
		complete: function(){
			
			var cFecha = $("#fecha-reporte2").val();
			var cFechaAnterior = aumentar_n_dias(cFecha,-1);

			if (url_pivision_procesos[grupo]!==undefined){
				$("#ifr-pivision").attr("src", url_pivision_procesos[grupo] + "?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");
				$("#contenedor-pivision").removeClass("d-none");
			}
			else {
				$("#contenedor-pivision").addClass("d-none");
			}

/*
			if (grupo=="Pre-Homogeneización"){				
				$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/2017/Apilado---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");					
			}
			else if (grupo=="Molienda de Crudo") {
				$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else if (grupo=="Molienda de Cemento") {
				$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1251/Silo-de-Cemento---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else if (grupo=="Molienda de Carbon") {
				$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1172/Silo-de-Carbon---Stock?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else {
				$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/?mode=kiosk&hidetoolbar");		
			}
*/			

			$(".ver-dashboard").on("click", function(){

				$("#barra-links a").removeClass("active");
				$("#link-dashboard").addClass("active");

		    	$(".panel-principal").addClass("d-none");		
				$("#panel-dashboard").removeClass("d-none");
				$("#panel-procesos").addClass("d-none");
				$("#cmb-maquina").removeClass("d-none");
				$("#cmb-proceso").addClass("d-none");
				$("#cmb-proceso2").addClass("d-none");
				$("#chk-ocultar-maquinas").addClass("d-none");
				$("#chk-ocultar-maquinas2").addClass("d-none");

				var maquina = $(this).attr("data-maquina");
				$("#cmb-maquina").val(maquina);

				procesarCambioMaquina();
				
		    });

		} 
	});	
}


function cargarFichaProcesos2(){

	var fecha = $("#fecha-reporte2").val();
	var grupo=$("#cmb-proceso2").val();
	
	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarIndicadoresDeMaquinasPorGrupo?fecha="+fecha+"&grupo="+grupo+"&origen=P", 
		dataType: 'json', 
		data: null, 
		async: 	true, 
		beforeSend: function (){            
        	$("#cuerpo-tabla-procesos").empty();
        	$("#spin-tabla-procesos").removeClass("d-none");
        	$("#contenedor-tabla-procesos").addClass("d-none");
        	$("#contenedor-principal-tabla-procesos").css("align-self","center");
        }, 
		success: function(data){ 
			
			var tr="";
			var oMaquinas = [];
			var oDatosProduccion = [];
			var oDatosHT = [];
			var oDatosRendimiento = [];
			var oDatosFiabilidad = [];
			var oDatosEnergia = [];

			$.each(data, function (key, val) {	

				if (
					  ($("#chk-ocultar-maquinas2 input").prop("checked")==true && formatearNumero(val.SumProduccion,0)!=0)
					  ||
					  ($("#chk-ocultar-maquinas2 input").prop("checked")==false)
				    ) {

					tr = tr + '<tr>';
					tr = tr + '		<td class="text-center td-ver-dashboard">' + val.NombreMaquina.trim() +  '</td>'
					tr = tr + '		<td class="text-center">' + formatearNumero(val.SumProduccion,0) + ' t</td>'
					tr = tr + '		<td class="text-center">' + val.SumHTrabajo + ' h </td>'
					tr = tr + '		<td class="text-center">';
					tr = tr +       	formatearNumero(val.TH,0) + ' t/h';
					tr = tr + '         <i class="fas fa-circle ver-dashboard-indicador" data-maquina="' + val.NombreMaquina.trim() + '" data-indicador="rendimiento" style="color:' + val.ColorTH + ';"></i>';
					tr = tr + '     </td>';
					tr = tr + '		<td class="text-center">' + formatearNumero(val.KWHT,2) + ' kWh/t<i class="fas fa-circle ver-dashboard-indicador" data-maquina="' + val.NombreMaquina.trim() + '" data-indicador="energia" style="color:' + val.ColorKWHT + ';"></i></td>'					
					tr = tr + '		<td class="text-center">' + (val.PorcFiab*100).toFixed(0) + ' %<i class="fas fa-circle ver-dashboard-indicador" data-maquina="' + val.NombreMaquina.trim() + '" data-indicador="fiabilidad" style="color:' + val.ColorFIAB + ';"></i></td>'
					tr = tr + '		<td class="text-center">&nbsp;<i class="fas fa-circle ver-dashboard-indicador" data-maquina="' + val.NombreMaquina.trim() + '" data-indicador="calidad" style="color:' + val.ColorCAL + ';"></i></td>'
					
					tr = tr + '</tr>';

					oMaquinas.push(val.NombreMaquina.trim());
					oDatosProduccion.push(formatearNumero(val.SumProduccion,0).replace(/,/gi,"")*1);					
					oDatosHT.push(val.SumHTrabajo);
					oDatosRendimiento.push(formatearNumero(val.TH,0).replace(/,/gi,"")*1);
					oDatosFiabilidad.push((val.PorcFiab*100).toFixed(0)*1);
					oDatosEnergia.push(formatearNumero(val.KWHT,2)*1);
				}				
			});

			//agregamos footer con sparklines
			tr = tr + '<tr>';
			tr = tr + '		<td class="text-center">Tendencia</td>'
			tr = tr + '		<td class="text-center">'
			tr = tr + "			<span class='spark' id='spark-produccion' data-indicador='produccion'>Cargando..</span>";
			tr = tr + '		</td>'
			tr = tr + '		<td class="text-center">'
			tr = tr + "			<span class='spark' id='spark-ht' data-indicador='ht'>Cargando..</span>";
			tr = tr + '		</td>'
			tr = tr + '		<td class="text-center">'
			tr = tr + "			<span class='spark' id='spark-rendimiento' data-indicador='rendimiento'>Cargando..</span>";
			tr = tr + '		</td>'
			tr = tr + '		<td class="text-center">'
			tr = tr + "			<span class='spark' id='spark-energia' data-indicador='energia'>Cargando..</span>";
			tr = tr + '		</td>'
			tr = tr + '		<td class="text-center">'
			tr = tr + "			<span class='spark' id='spark-fiabilidad' data-indicador='fiabilidad'>Cargando..</span>";
			tr = tr + '		</td>'
			tr = tr + '		<td class="text-center">'			
			tr = tr + '		</td>'			
			tr = tr + '</tr>';
			
			$("#cuerpo-tabla-procesos").html(tr);

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+13)+"px";
			$("#tabla-procesos td").css("font-size",prefTamanofuente);


			cargarGraficoProcesoIndicadores("produccion", oMaquinas, oDatosProduccion, "#7cb5ec");

			//cargamos sparklines
			var spark = $("#spark-produccion");
			spark.sparkline(oDatosProduccion, {type: 'bar', barColor: "#7cb5ec", disableTooltips: true} );

			var spark = $("#spark-ht");
			spark.sparkline(oDatosHT, {type: 'bar', barColor: "#909090", disableTooltips: true} );

			var spark = $("#spark-rendimiento");
			spark.sparkline(oDatosRendimiento, {type: 'bar', barColor: "#2185d0", disableTooltips: true} );

			var spark = $("#spark-fiabilidad");
			spark.sparkline(oDatosFiabilidad, {type: 'bar', barColor: "#b238aa", disableTooltips: true} );

			var spark = $("#spark-energia");
			spark.sparkline(oDatosEnergia, {type: 'bar', barColor: "#ffd700", disableTooltips: true} );


			$("#tabla-procesos th.maquina-indicador").on("click", function(){
    			var indicador=$(this).attr("data-indicador");
    			if (indicador=="produccion"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosProduccion, "#7cb5ec");
    			}
    			else if (indicador=="ht"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosHT, "#909090");
    			}
    			else if (indicador=="rendimiento"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosRendimiento, "#2185d0");
    			}
    			else if (indicador=="fiabilidad"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosFiabilidad, "#b238aa");
    			}
    			else if (indicador=="energia"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosEnergia, "#ffd700");
    			}
    		});


    		$(".td-ver-dashboard").on("click", function(){

				$("#barra-links a").removeClass("active");
				$("#link-dashboard").addClass("active");

		    	$(".panel-principal").addClass("d-none");		
				$("#panel-dashboard").removeClass("d-none");

				$("#cmb-maquina").removeClass("d-none");

				$("#panel-procesos").addClass("d-none");				
				$("#cmb-proceso").addClass("d-none");
				$("#chk-ocultar-maquinas").addClass("d-none");

				$("#panel-procesos2").addClass("d-none");
				$("#cmb-proceso2").addClass("d-none");				
				$("#chk-ocultar-maquinas2").addClass("d-none");

				var maquina = $(this).text();
				$("#cmb-maquina").val(maquina);

				procesarCambioMaquina();				
		    });


		    $("#cuerpo-tabla-procesos .spark").on("click", function(){
		    	var indicador=$(this).attr("data-indicador");

		    	if (indicador=="produccion"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosProduccion, "#7cb5ec");
    			}
    			else if (indicador=="ht"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosHT, "#909090");
    			}
    			else if (indicador=="rendimiento"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosRendimiento, "#2185d0");
    			}
    			else if (indicador=="fiabilidad"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosFiabilidad, "#b238aa");
    			}
    			else if (indicador=="energia"){
    				cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatosEnergia, "#ffd700");
    			}
		    });

		    $(".ver-dashboard-indicador").on("click", function(){
		    	
		    	var maquina=$(this).attr("data-maquina");
		    	var indicador=$(this).attr("data-indicador");	

		    	$("#barra-links a").removeClass("active");
				$("#link-dashboard").addClass("active");

		    	$(".panel-principal").addClass("d-none");		
				$("#panel-dashboard").removeClass("d-none");

				$("#cmb-maquina").removeClass("d-none");

				$("#panel-procesos").addClass("d-none");				
				$("#cmb-proceso").addClass("d-none");
				$("#chk-ocultar-maquinas").addClass("d-none");

				$("#panel-procesos2").addClass("d-none");
				$("#cmb-proceso2").addClass("d-none");				
				$("#chk-ocultar-maquinas2").addClass("d-none");
				
				//procesamos seleccion de maquina
				$("#cmb-maquina").val(maquina);
				procesarCambioMaquina();	    	

				//procesamos seleccion de indicador
		    	if (indicador=="rendimiento"){
		    		$("#link-rendimiento-dia").click();
		    	}
		    	else if (indicador=="fiabilidad"){
		    		$("#link-fiabilidad-dia").click();
		    	}
		    	else if (indicador=="calidad"){
		    		$("#link-calidad-dia").click();
		    	}
		    	else if (indicador=="energia"){
		    		$("#link-consumo-energia-dia").click();
		    	}
		    });


		},
		complete: function(){
			
			$("#spin-tabla-procesos").addClass("d-none");
			$("#contenedor-tabla-procesos").removeClass("d-none");
			$("#contenedor-principal-tabla-procesos").css("align-self","initial");

			var cFecha = $("#fecha-reporte2").val();
			var cFechaAnterior = aumentar_n_dias(cFecha,-1);

			if (url_pivision_procesos[grupo]!==undefined){
				$("#ifr-pivision2").attr("src", url_pivision_procesos[grupo] + "?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");
				$("#contenedor-pivision2").removeClass("d-none");
			}
			else {
				$("#contenedor-pivision2").addClass("d-none");
			}


			/*
			if (grupo=="Pre-Homogeneización"){				
				$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/2017/Apilado---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");					
			}
			else if (grupo=="Molienda de Crudo") {
				$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else if (grupo=="Molienda de Cemento") {
				$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1251/Silo-de-Cemento---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else if (grupo=="Molienda de Carbon") {
				$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1172/Silo-de-Carbon---Stock?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
			}
			else {
				$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/?mode=kiosk&hidetoolbar");		
			}
			*/
		

			/*
			$(".ver-dashboard").on("click", function(){

				$("#barra-links a").removeClass("active");
				$("#link-dashboard").addClass("active");

		    	$(".panel-principal").addClass("d-none");		
				$("#panel-dashboard").removeClass("d-none");
				$("#panel-procesos").addClass("d-none");
				$("#cmb-maquina").removeClass("d-none");
				$("#cmb-proceso").addClass("d-none");
				$("#chk-ocultar-maquinas").addClass("d-none");

				var maquina = $(this).attr("data-maquina");
				$("#cmb-maquina").val(maquina);

				procesarCambioMaquina();
				
		    });
		    */

		} 
		
	});	
}

function cargarGraficoProcesoIndicadores(indicador, oMaquinas, oDatos, color){

	var titulo="";
	var tituloy="";
	if(indicador=="produccion"){
		titulo = "Producción";
		tituloy = "Producción (t)";
	}
	else if (indicador=="ht"){
		titulo = "HT";
		tituloy = "HT (h)";
	}
	else if (indicador=="rendimiento"){
		titulo = "Rendimiento";
		tituloy = "Rendimiento (t/h)";
	}
	else if (indicador=="fiabilidad"){
		titulo = "Fiabilidad";
		tituloy = "Fiabilidad (%)";
	}
	else if (indicador=="energia"){
		titulo = "Energía";
		tituloy = "Energía (kWh/t)";	
	}

	oChartProcesoIndicadores = Highcharts.chart("chart-proceso-indicadores", Highcharts.merge(
				{				
					chart: {			
						height: 270,
					},
					title: {
						text: titulo
					},
					credits: {
						enabled: false
					},
					subtitle: {
						//text: "Fiabilidad del ("+fechDesde+") al ("+fechAl+")"
					},
					xAxis: [{
						categories: oMaquinas,
				        crosshair: true
					}],
					yAxis: [{
						title: {
							text: tituloy,				
							style:{
								//color: '#7CB5EC'
							}
						},
						//labels: false,
						//min: minPorcFiab,
					}],
					plotOptions: {
						column: {
				            pointPadding: 0.2,
				            borderWidth: 0
				        }
					},
					tooltip: {
						shared: true
					},
					legend: {
						layout: 'vertical',
						align: 'left',
						x: -20,
						verticalAlign: 'top',
						y: -15,
						floating: true,
						backgroundColor:'rgba(255,255,255,0.5)'
					},
					series: [{			
						name: tituloy,
						type: 'column',
						yAxis: 0,
						color: color,
						/*
						color: {
							linearGradient : {x1:0, y1:0, x2:0, y2:1 },
							stops: [
								[0, '#7cb5ec'],
								[1, '#f4f4f4']
							]
						},
						*/
						data: oDatos,
						tooltip: {
							//valueSuffix: ' t'
						},
						dataLabels:{enabled:true}
					}]
				},				
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)
				);
}

function procesarCambioMaquina(){
	$("#chart_produccion").removeClass("d-none");
	$("#chart_produccion1").addClass("d-none");
	$("#chart_produccion2").addClass("d-none");

	
	var cFecha = $("#fecha-reporte2").val();
	var cMaquina = $("#cmb-maquina").val();
	cargarResumen(cFecha, cMaquina);
	cargarServiceChart(cFecha,cMaquina,15);		
	cargarServiceRangoFechas(cFecha, cMaquina);				
	cargarChartFiabilidad(cFecha,cMaquina,15);	
	cargarTablaRendimiento(cFecha,cMaquina);

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);

	cargarTablaEnergia(cFecha,cMaquina,15);	

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);
	
	cargarParadasDeMaquina(cFecha, cMaquina);

	cargarCalidad(cFecha,cMaquina);
}

function procesarCambioFecha(){
	var cFecha = $("#fecha-reporte2").val();
	var cMaquina = $("#cmb-maquina").val();

	if ($("#link-procesos").hasClass("active")){
		cargarFichaProcesos();

		var cFechaAnterior = aumentar_n_dias(cFecha,-1);
		$("#ifr-pivision").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
	}

	if ($("#link-procesos2").hasClass("active")){
		cargarFichaProcesos2();

		var cFechaAnterior = aumentar_n_dias(cFecha,-1);
		$("#ifr-pivision2").attr("src","https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2?mode=kiosk&starttime=" + cFechaAnterior+ "&endtime=" + cFecha + "&hidetoolbar");	
	}
	

	//$("#oFrameCuaderno").attr("src", urlCuadernoOcurrencias + "/?fecha=" + fecha + "&tipo=" + tipo);

	cargarResumen(cFecha, cMaquina);
	cargarServiceChart(cFecha,cMaquina,15);		
	cargarServiceRangoFechas(cFecha, cMaquina);			
	cargarChartFiabilidad(cFecha,cMaquina,15);	
	cargarTablaRendimiento(cFecha,cMaquina);

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaRendimientoSumarizado(cFecha,cMaquina,diaDeFecha);

	cargarTablaEnergia(cFecha,cMaquina,15);	

	var diaDeFecha = cFecha.substring(8,10);
	cargarTablaEnergiaSumarizado(cFecha,cMaquina,diaDeFecha);

	cargarParadasDeMaquina(cFecha, cMaquina);

	cargarCalidad(cFecha,cMaquina);


	$("#oFrameCuaderno").attr("src", parametros.urlCuadernoOcurrencias + "/?fecha=" + cFecha);		

	if ($("#link-rdp").hasClass("active")){
		$("#ifrRDP").attr("src","http://srvpiweb/waRDP?embebido=1&fecha="+cFecha+"&tipo=CORREGIDO");		
	}

	
	
}

function MostrarModalSeleccionarRangoRendimiento(){
	mostrarModal("oModalSeleccionarRangoRendimiento");
	$("#lblTituloModalSeleccionarRangoRendimiento").text("Seleccionar Rango de Fechas");
}

function MostrarModalSeleccionarRangoEnergia(){
	mostrarModal("oModalSeleccionarRangoEnergia");
	$("#lblTituloModalSeleccionarRangoEnergia").text("Seleccionar Rango de Fechas");
}

function refrescarTamañoHighcharts(){

	if (oChart !== undefined){
		var widthChartProduccion = $("#contenedor-chart-produccion").width();
		var heigthChartProduccion = $("#contenedor-chart-produccion").height();
		oChart.setSize(widthChartProduccion,heigthChartProduccion);	
	}
	
	if (oChartFiabilidad !== undefined){
		var widthChartFiabilidad = $("#contenedor-chart-fiabilidad").width();
		var heigthChartFiabilidad = $("#contenedor-chart-fiabilidad").height();
		oChartFiabilidad.setSize(widthChartFiabilidad,heigthChartFiabilidad);	
	}	
}


function refrescarSparklines(){	
	$.sparkline_display_visible();
	//console.log("refrescando sparkline");

	//tamaño de fuente de la leyenda
	$("g[aria-describedby='id-146-description']").css({'font-size': '14px' });
}

function cargarParadasDeMaquina(fechaService, maquina){

	var fechaFrom = fechaService;
	
	var fechaTo = new Date( fechaFrom.replace(/-/gi,"/") ).getTime() + (1 * 24 * 3600 * 1000);
	fechaTo = new Date(fechaTo);	
	fechaTo = fechaTo.getFullYear()+"-"+( agregar_cero(fechaTo.getMonth()+1) )+"-"+agregar_cero(fechaTo.getDate());	

	fechaHoy = new Date();
	fechaHoy = fechaHoy.getFullYear()+"-"+( agregar_cero(fechaHoy.getMonth()+1) )+"-"+agregar_cero(fechaHoy.getDate());	
	
	var dFechaFrom =new Date( fechaFrom.replace(/-/gi,"/") ).getTime();
	dFechaFrom = new Date(dFechaFrom);	
	var fechaToClasico = obtener_cadena_fecha_clasico(dFechaFrom);

	$("#contenedor-tabla-paradas .titulo-contenedor").text("Máquina: " + maquina);
    $("#contenedor-tabla-paradas .subtitulo-contenedor").text("Información de paradas del " + fechaToClasico + "");

	var urlServicio = "";
	if (fechaFrom==fechaHoy)
		urlServicio = "Start:>="+fechaFrom;
	else
		urlServicio = "Start:>="+fechaFrom+"%20End:<="+fechaTo;

	var tr1="";	

	//cargamos tabla de paradas
	$.ajax({ 
    		url: ipService+"/Operaciones.svc/ListarEventosYAtributosPorMaquina?database=Atocongo&query="+urlServicio+"%20Template:%20Downtime&maquina=" + maquina, 
    		dataType: 'json', 
    		data: null, 
    		async: true, 
    		beforeSend: function(){
    			$("#cuerpo-tabla-paradas").empty(); 
    			$(".paradas-flecha-izq").addClass("d-none");
    			$(".paradas-flecha-der").addClass("d-none");    			
    			tr1="";    		

    			$("#link-horas-dia").off("click");
    			$("#link-horas-dia").on("click", function(){
					 e.preventDefault();
				});
   			},
    		success: function(data){

    			var sumaDuracionMinutos=0;
    			var sumaDuracionHoras=0;
    			var transPendientesSAP=0;
    			var horasTrabajo=0;
    			var horasTrascurridas=0;
    			var horasPP=0;
    			var horasPC=0;

    			$.each(data, function (key, val) {

    				var ubTec="";
    				var codPar="";
    				var coment="";
    				var descodPar="";
    				var tipoParada="";
    				var color="";

    				for (i = 0; i < val.oAtributos.length; i++) {
						if( val.oAtributos[i].cNombre == 'Ubicacion Tecnica' ) {
							ubTec = val.oAtributos[i].cValor;
						}else if( val.oAtributos[i].cNombre == 'Codigo Parada' ) {
							codPar = val.oAtributos[i].cValor;
						}else if( val.oAtributos[i].cNombre == 'Comentario' ) {
							coment = val.oAtributos[i].cValor;
						}else if( val.oAtributos[i].cNombre == 'Descripcion Codigo Parada' ) {
							descodPar = val.oAtributos[i].cValor;
						}					    	    
					}

					if (codPar.trim() == ""){
                        tipoParada = "NC";
                        color = colorChart.colorNC;
					}
                    else {
                        switch (codPar.trim().substring(0, 1)) {
                            case "M": //M - Incidencia Mecánica - IM
                                tipoParada = "IM";
                                color = colorChart.colorIM;
                                break;
                            case "E": //E - Incidencia Eléctrica - IE
                                tipoParada = "IE";
                                color = colorChart.colorIE;
                                break;
                            case "P": //P -Incidencia Operativa - IO
                                tipoParada = "IO";
                                color = colorChart.colorIO;
                                break;
                            case "R": //R -Parada Programada - PP
                                tipoParada = "PP";
                                color = colorChart.colorPP;
                                break;
                            case "N": //N -Parada Circunstancial - PC
                                tipoParada = "PC";
                                color = colorChart.colorPC;
                                break;
                            default: // NC
                                tipoParada = "NC";
                                color = colorChart.colorNC;
                                break;
                        }
                    }


					tr1 = tr1 + "<tr class='fila'>";
					tr1 = tr1 + "	<td class='text-center'>" + ubTec + "</td>";
					tr1 = tr1 + "	<td class='text-center'>" + obtenerAliasDeUbicacionTecnica(ubTec) + "</td>";
					tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:" + color + "'" + "</td>";
					tr1 = tr1 + "	<td class='text-center'>" + codPar + "</td>";
					tr1 = tr1 + "	<td class='text-center desde'>" + val.cInicio.substring(11,19) + "</td>";
					tr1 = tr1 + "	<td class='text-center hasta'>" + val.cFin.substring(11,19) + "</td>";
					//tr1 = tr1 + "	<td class='text-center'>" + parseFloat(val.nDuracion).toFixed(2) + "</td>";
					//tr1 = tr1 + "	<td class='text-center'>" + parseFloat(val.nDuracion/60).toFixed(2) + "</td>";
					tr1 = tr1 + "	<td class='text-center'>" + Math.round10(parseFloat(val.nDuracion/60),-2) + "</td>";
					
					tr1 = tr1 + "	<td class='text-center'>" + coment+"</br>"+descodPar + "</td>";
					tr1 = tr1 + "</tr>";	

					sumaDuracionMinutos = sumaDuracionMinutos + parseFloat(val.nDuracion).toFixed(2)*1;
					sumaDuracionHoras = sumaDuracionHoras + Math.round10(parseFloat(val.nDuracion/60),-2);
					//sumaDuracionHoras = sumaDuracionHoras + parseFloat(val.nDuracion/60).toFixed(2)*1;

					if (val.cNumeroAviso=="0")
						transPendientesSAP = transPendientesSAP + 1;


					var hoy = new Date();
					if (fechaService.substring(0,4)==hoy.getFullYear() && 
						parseInt(fechaService.substring(5,7))==hoy.getMonth()+1 && 
						parseInt(fechaService.substring(8,10))==hoy.getDate()){

						horasTrascurridas = hoy.getHours()+(hoy.getMinutes()/60)+(hoy.getSeconds()/3600);
						horasTrascurridas = horasTrascurridas.toFixed(2);
						horasTrabajo = (horasTrascurridas-sumaDuracionHoras).toFixed(2);			
					}
					else {
						horasTrascurridas=24;
						horasTrascurridas = horasTrascurridas.toFixed(2);
						horasTrabajo = (horasTrascurridas-sumaDuracionHoras).toFixed(2);	
					}

					if (codPar.substring(0,1)=="R")
						horasPP = horasPP + parseFloat(val.nDuracion/60).toFixed(2)*1;

					if (codPar.substring(0,1)=="N")
						horasPC = horasPC + parseFloat(val.nDuracion/60).toFixed(2)*1; 

				});	


				//ajuste de horas
				if (maquina!="Rotativa 1" && maquina!="Rotativa 2" && maquina!="Rotativa 3" && maquina!="Rotativa 4" &&
					maquina!="Rotativa 5" && maquina!="Rotativa 6" && maquina!="Rotativa 7" &&
					maquina!="Granel Multisilo 1" && maquina!="Granel Multisilo 2" && maquina!="Granel Multisilo 3" &&
					maquina!="Granel Multisilo 4" &&
					maquina!="Granel Manga 6" && maquina!="Granel Manga 7" ){

					horasTrabajo = parseFloat($("#horas-trabajo-dia").text()).toFixed(2);
					var horasParada=0;
					if(data.length==0){
						var hoy = new Date();
						if (fechaService.substring(0,4)==hoy.getFullYear() && 
							parseInt(fechaService.substring(5,7))==hoy.getMonth()+1 && 
							parseInt(fechaService.substring(8,10))==hoy.getDate()){

							horasTrascurridas = horasTrabajo;						
						}
						else {
							horasTrascurridas=24;
							horasTrascurridas = horasTrascurridas.toFixed(2);						
						}
						
						horasParada = 0;
					}
					else {					
						horasParada = (horasTrascurridas - horasTrabajo).toFixed(2);	
					}

				}
				else {
					horasParada = (horasTrascurridas - horasTrabajo).toFixed(2);	
				}
				

				






    			//totales    			
				


    			var horasDisponibles = (horasTrascurridas - horasPP).toFixed(2);
    			var horasFiabilidad = (horasTrascurridas - horasPP - horasPC).toFixed(2);

    			var fiabilidad;
    			if (horasFiabilidad==0)
					fiabilidad = "0.00";
				else
					fiabilidad = (horasTrabajo*100/horasFiabilidad).toFixed(2);

				var disponibilidad;
				if (horasDisponibles==0)
					disponibilidad = "0.00";		
				else
					disponibilidad = (horasTrabajo*100/horasDisponibles).toFixed(2);

    			tr1 = tr1 + "<tr>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				//tr1 = tr1 + "	<td class='text-center'><b>TOTAL:</b></td>";
				//tr1 = tr1 + "	<td class='text-center'>" + addCommas(sumaDuracionMinutos.toFixed(2)) + "</td>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				tr1 = tr1 + "	<td class='text-center'></td>";
				tr1 = tr1 + "	<td class='text-center' colspan='2'>";				
				tr1 = tr1 + "		<table>";				
				tr1 = tr1 + "			<tr>";				
				tr1 = tr1 + "				<td>Horas Parada:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(horasParada) + "</td>";				
				tr1 = tr1 + "				<td style='color:#e88585'>Transferencias pendientes PI-SAP:</td>";				
				tr1 = tr1 + "				<td style='color:#e88585'>" + transPendientesSAP + "</td>";								
				tr1 = tr1 + "			</tr>";				
				tr1 = tr1 + "			<tr>";				
				tr1 = tr1 + "				<td>Horas Trabajo:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(horasTrabajo) + "</td>";								
				tr1 = tr1 + "				<td>Fiabilidad:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(fiabilidad) + "</td>";								
				tr1 = tr1 + "			</tr>";				
				tr1 = tr1 + "			<tr>";				
				tr1 = tr1 + "				<td>Total Horas:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(horasTrascurridas) + "</td>";								
				tr1 = tr1 + "				<td>Disponibilidad:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(disponibilidad) + "</td>";								
				tr1 = tr1 + "			</tr>";				
				tr1 = tr1 + "			<tr>";				
				tr1 = tr1 + "				<td>Total Disponibles:</td>";				
				tr1 = tr1 + "				<td>" + addCommas(horasDisponibles) + "</td>";								
				tr1 = tr1 + "				<td></td>";				
				tr1 = tr1 + "				<td></td>";								
				tr1 = tr1 + "			</tr>";				
				tr1 = tr1 + "		</table>";				
				tr1 = tr1 + "	</td>";				
				tr1 = tr1 + "</tr>"; 

				$("#cuerpo-tabla-paradas").html(tr1);										
    		},

    		complete: function(){
				
    			//validamos si hay paradas que vienen del dia anterior, y paradas que van al dia siguiente    							
				var desde = $("#cuerpo-tabla-paradas .fila").first().find(".desde").text();
				var hasta = $("#cuerpo-tabla-paradas .fila").last().find(".hasta").text();

				//agregamos flecha a la izquierda
				if (desde=="00:00:00") {
					$(".paradas-flecha-izq").removeClass("d-none");
				}

				//agregamos flecha a la derecha
				if (hasta=="00:00:00")				{
					$(".paradas-flecha-der").removeClass("d-none");
				}


				var fechaUnoMes = fechaFrom.substring(0,7)+"-01";
				cargarArbolParadasDeMaquina(fechaUnoMes, fechaFrom, maquina);

    		}
    });
	
		
}

var oDataParadas;

var tituloParetoCantidad="";
var subtituloParetoCantidad="";
var arrCantidades = [];

var tituloParetoDuracion="";
var subtituloParetoDuracion="";
var arrDuraciones = [];


function cargarArbolParadasDeMaquina(fechaFrom, fechaTo, maquina){
	
	var dFechaFrom =new Date( fechaFrom.replace(/-/gi,"/") ).getTime();
	dFechaFrom = new Date(dFechaFrom);	
	var fechaFromClasico = obtener_cadena_fecha_clasico(dFechaFrom);

	var dFechaTo =new Date( fechaTo.replace(/-/gi,"/") ).getTime();
	dFechaTo = new Date(dFechaTo);	
	var fechaToClasico = obtener_cadena_fecha_clasico(dFechaTo);

	if (fechaFrom==fechaTo){
		$("#contenedor-tabla-horas .subtitulo-arbol-paradas").text("Información del " + fechaFromClasico + "");	
	}
	else {
		$("#contenedor-tabla-horas .subtitulo-arbol-paradas").text("Información del " + fechaFromClasico + " al " + fechaToClasico + "");
	}    
	
	//activamos ficha de pareto x cantidad
	$("#barra-links-paradas .nav-link").removeClass("active");
	$("#link-paradas-pareto-cantidad").addClass("active");
	$(".bloque-paradas").addClass("d-none");
	$("#bloque-paradas-pareto-cantidad").removeClass("d-none");

	fechaHoy = new Date();
	fechaHoy = fechaHoy.getFullYear()+"-"+( agregar_cero(fechaHoy.getMonth()+1) )+"-"+agregar_cero(fechaHoy.getDate());	
	
	var fechaTo = new Date( fechaTo.replace(/-/gi,"/") ).getTime() + (1 * 24 * 3600 * 1000);
	fechaTo = new Date(fechaTo);	
	fechaTo = fechaTo.getFullYear()+"-"+( agregar_cero(fechaTo.getMonth()+1) )+"-"+agregar_cero(fechaTo.getDate());	

	
	var urlServicio = "";	
	//urlServicio = "Start:>="+fechaFrom+"%20End:<="+fechaTo;
	urlServicio = "Start:>="+fechaFrom+"%20Start:<"+fechaTo;

	tituloParetoCantidad="";
	subtituloParetoCantidad="";
	arrCantidades = [];
	var arrCategorias = [];
	var arrPareto = [];	

	tituloParetoDuracion="";
	subtituloParetoDuracion=""
	arrDuraciones = [];	
	var arrCategoriasDur = [];		
	var arrParetoDur = [];

	var nSumaCantidades=0;	
	var nSumaDuraciones=0;
	var nSumaCantidadesParcial=0;
	var nSumaDuracionesParcial=0;

	var nSumaDuracionesParadaHoras=0;
	var nSumaDuracionesParadaMinutos=0;


	var html="";	
	var html2="";	

	//cargamos arbol de paradas
	$.ajax({ 
    		url: ipService+"/Operaciones.svc/ListarArbolEventosPorMaquina?database=Atocongo&query="+urlServicio+"%20Template:%20Downtime&maquina=" + maquina, 
    		dataType: 'json', 
    		data: null, 
    		async: true, 
    		beforeSend: function(){
    			$("#cuerpo-tabla-arbol-paradas").empty(); 
    			$("#cuerpo-tabla-arbol-paradas2").empty(); 
    			$("#cuerpo-tabla-arbol-paradas2-detalle").empty(); 

    			$("#spin-arbol-paradas").removeClass("d-none");
    			$("#contenedor-arbol-paradas").addClass("d-none");

    			$("#contenedor-tabla-arbol-paradas2-detalle").addClass("d-none");
			    $("#lbl-mensaje-tabla-arbol-paradas2-detalle").removeClass("d-none");
			    
			    $('.filtros-tipo-parada-cantidad input').prop('checked','checked'); 

			    tituloParetoCantidad="";
				subtituloParetoCantidad="";
				arrCantidades = [];
				arrCategorias = [];
				arrPareto = [];	

				tituloParetoDuracion="";
				subtituloParetoDuracion=""
				arrDuraciones = [];	
				arrCategoriasDur = [];		
				arrParetoDur = [];    

				nSumaCantidades=0;	
				nSumaDuraciones=0;
				nSumaCantidadesParcial=0;
				nSumaDuracionesParcial=0; 	

				nSumaDuracionesParadaHoras=0;
				nSumaDuracionesParadaMinutos=0;

    			html="";    		
    			html2="";    			
   			},
    		success: function(data){

    			oDataParadas = data;

    			$.each(data, function (key, val) {
    				if (val.Nivel==1){
    					html = html + "<tr data-id='" + val.TipoParada + "' class='arbol-nivel-1'>";
    					html = html + "		<td class='text-center principal'>";
    					html = html + "			<span>+</span>" + "<i class='fas fa-square' style='color:" + colorChart["color"+val.TipoParada] + "'></i>" +val.TipoParada;
    					html = html + "		</td>";
    					html = html + "		<td class='text-center'></td>";
    					html = html + "		<td class='text-center'></td>";
    					html = html + "		<td class='text-center'>" + val.Cantidad + "</td>";
    					html = html + "		<td class='text-center'>" + val.DuracionMinutos.toFixed(2) + "</td>";
    					html = html + "		<td class='text-center'>" + val.DuracionHoras.toFixed(2) + "</td>";
    					html = html + "		<td class='text-center'></td>";
    					html = html + "		<td class='text-center'></td>";    					
    					html = html + "</tr>"

    					html2 = html2 + "<tr data-id='" + val.TipoParada + "' class='arbol-nivel-1' title='" + ObtenerDescripcionDeTipoParada(val.TipoParada) + "'>";
    					html2 = html2 + "		<td class='text-left principal'>";
    					html2 = html2 + "			<span>+</span>" + "<i class='fas fa-square' style='color:" + colorChart["color"+val.TipoParada] + "'></i>" + val.TipoParada;
    					html2 = html2 + "		</td>";
    					html2 = html2 + "		<td class='text-center'></td>";    					
    					html2 = html2 + "		<td class='text-center'>" + val.Cantidad + "</td>";
    					html2 = html2 + "		<td class='text-center'>" + val.DuracionMinutos.toFixed(2) + "</td>";
    					html2 = html2 + "		<td class='text-center'>" + val.DuracionHoras.toFixed(2) + "</td>";    					
    					html2 = html2 + "		<td class='text-center'></td>";
    					html2 = html2 + "</tr>"
    				}

					nSumaDuracionesParadaMinutos = nSumaDuracionesParadaMinutos + val.DuracionMinutos.toFixed(2)*1;
    				nSumaDuracionesParadaHoras = nSumaDuracionesParadaHoras + val.DuracionHoras.toFixed(2)*1;


    				//obtenemos sus hijos de nivel 2
    				$.each(val.Eventos, function (key2, val2) {

    					if (val2.Nivel==2){
	    					html = html + "<tr data-id='" + val2.TipoParada + "|" + val2.CodigoParada + "' data-padre-id='" + val2.TipoParada + "' class='d-none arbol-nivel-2'>";
	    					html = html + "		<td class='text-center'></td>";
	    					html = html + "		<td class='text-center principal'>";
	    					html = html + "			<span>+</span>" + val2.CodigoParada;
	    					html = html + "		</td>";    					
	    					html = html + "		<td class='text-center'></td>";
	    					html = html + "		<td class='text-center'>" + val2.Cantidad + "</td>";
	    					html = html + "		<td class='text-center'>" + val2.DuracionMinutos.toFixed(2) + "</td>";
	    					html = html + "		<td class='text-center'>" + val2.DuracionHoras.toFixed(2) + "</td>";
	    					html = html + "		<td class='text-center'></td>";
    						html = html + "		<td class='text-center'></td>";    						
	    					html = html + "</tr>"	

	    					html2 = html2 + "<tr data-id='" + val2.TipoParada + "|" + val2.CodigoParada + "' data-padre-id='" + val2.TipoParada + "' class='d-none arbol-nivel-2'>";
	    					html2 = html2 + "		<td class='text-center'></td>";
	    					html2 = html2 + "		<td class='text-center codigo-parada-arbol' title='" + val2.DescripcionParada + "'>";
	    					html2 = html2 + "           <i class='far fa-folder'></i>";
	    					html2 = html2 + 			val2.CodigoParada;
	    					html2 = html2 + "		</td>";    						    					
	    					html2 = html2 + "		<td class='text-center'>" + val2.Cantidad + "</td>";
	    					html2 = html2 + "		<td class='text-center'>" + val2.DuracionMinutos.toFixed(2) + "</td>";
	    					html2 = html2 + "		<td class='text-center'>" + val2.DuracionHoras.toFixed(2) + "</td>";	    					
	    					html2 = html2 + "		<td class='text-center'><i class='fas fa-caret-left d-none'></i></td>";
	    					html2 = html2 + "</tr>"	

	    					//datos para el pareto x cantidad	    					
	    					arrCantidades.push(
							{						
								y: val2.Cantidad,
								color: colorChart["color"+val2.TipoParada],
								descripcion: val2.DescripcionParada,
								codigo: val2.CodigoParada,
								tipo: val2.TipoParada,
								descripcionTipo: ObtenerDescripcionDeTipoParada(val2.TipoParada)								
							});	

	    					//datos para el pareto x duracion
							arrDuraciones.push(
							{						
								y: val2.DuracionMinutos,
								color: colorChart["color"+val2.TipoParada],								
								descripcion: val2.DescripcionParada,
								codigo: val2.CodigoParada,
								tipo: val2.TipoParada,					
								descripcionTipo: ObtenerDescripcionDeTipoParada(val2.TipoParada)
							});		


	    					/*
	    					html2 = html2 + "<tr data-id='" + val2.TipoParada + "|" + val2.CodigoParada + "' data-padre-id='" + val2.TipoParada + "' class='d-none arbol-nivel-2'>";
	    					html2 = html2 + "		<td class='text-center'></td>";
	    					html2 = html2 + "		<td class='text-center principal'>";
	    					html2 = html2 + "			<span>+</span>" + val2.CodigoParada;
	    					html2 = html2 + "		</td>";    					
	    					html2 = html2 + "		<td class='text-center'></td>";
	    					html2 = html2 + "		<td class='text-center'>" + val2.Cantidad + "</td>";
	    					html2 = html2 + "		<td class='text-center'>" + val2.DuracionMinutos.toFixed(2) + "</td>";
	    					html2 = html2 + "		<td class='text-center'>" + val2.DuracionHoras.toFixed(2) + "</td>";	    					
	    					html2 = html2 + "</tr>"	
	    					*/
	    				}

	    				//obtenemos sus hijos de nivel 3
	    				$.each(val2.Eventos, function (key3, val3) {

	    					if (val3.Nivel==3){
		    					html = html + "<tr data-id='" + val3.TipoParada + "|" + val3.CodigoParada + "|" + val3.Fecha + "' data-padre-id='" + val3.TipoParada + "|" + val3.CodigoParada + "' class='d-none arbol-nivel-3'>";
		    					html = html + "		<td class='text-center'></td>";
		    					html = html + "		<td class='text-center'></td>";
		    					html = html + "		<td class='text-center principal'>";
		    					html = html + "			<span>+</span>" + val3.Fecha;
		    					html = html + "		</td>";    							    					
		    					html = html + "		<td class='text-center'>" + val3.Cantidad + "</td>";
		    					html = html + "		<td class='text-center'>" + val3.DuracionMinutos.toFixed(2) + "</td>";
		    					html = html + "		<td class='text-center'>" + val3.DuracionHoras.toFixed(2) + "</td>";
		    					html = html + "		<td class='text-center'></td>";
    							html = html + "		<td class='text-center'></td>";    							
		    					html = html + "</tr>"	

		    					/*
		    					html2 = html2 + "<tr data-id='" + val3.TipoParada + "|" + val3.CodigoParada + "|" + val3.Fecha + "' data-padre-id='" + val3.TipoParada + "|" + val3.CodigoParada + "' class='d-none arbol-nivel-3'>";
		    					html2 = html2 + "		<td class='text-center'></td>";
		    					html2 = html2 + "		<td class='text-center'></td>";
		    					html2 = html2 + "		<td class='text-center fecha-arbol'>";
		    					html2 = html2 +         	val3.Fecha;
		    					html2 = html2 + "		</td>";    							    					
		    					html2 = html2 + "		<td class='text-center'>" + val3.Cantidad + "</td>";
		    					html2 = html2 + "		<td class='text-center'>" + val3.DuracionMinutos.toFixed(2) + "</td>";
		    					html2 = html2 + "		<td class='text-center'>" + val3.DuracionHoras.toFixed(2) + "</td>";		    					
		    					html2 = html2 + "</tr>"	
		    					*/
		    				}

		    				//obtenemos sus hijos de nivel 4
		    				$.each(val3.Eventos, function (key4, val4) {

		    					if (val4.Nivel==4){
			    					html = html + "<tr data-padre-id='" + val4.TipoParada + "|" + val4.CodigoParada + "|" + val4.Fecha + "' class='d-none arbol-nivel-4'>";
			    					html = html + "		<td class='text-center'></td>";
			    					html = html + "		<td class='text-center'></td>";
			    					html = html + "		<td class='text-center'></td>";
			    					html = html + "		<td class='text-center'>" + val4.Cantidad + "</td>";
			    					html = html + "		<td class='text-center'>" + val4.DuracionMinutos.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val4.DuracionHoras.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val4.UbicacionTecnica + "</td>";
			    					
			    					if (val4.Comentario.trim()=="")
			    						html = html + "		<td class='text-center'>" + val4.DescripcionParada + "</td>";			    						
			    					else
			    						html = html + "		<td class='text-center'>" + val4.Comentario + "</br>" + val4.DescripcionParada + "</td>";

			    					html = html + "</tr>"	
									
			    				}

		    				});


	    				});
    				});  									
    			});
				

				//agregamos pie del arbol				
				var diasDiff = restarFechasADias(fechaFrom,fechaTo);
				console.log("from: "+ fechaFrom)
				console.log("To: "+ fechaTo)	

				var nSumaHorasTrabajadasMinutos = 0;
				var nSumaHorasTrabajadasHoras = 0;

				if (fechaHoy>=fechaFrom && fechaHoy<fechaTo){
					//en el rango esta incluida la fecha actual
					var d=new Date();
					var nHorasTranscurridas = d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;

					nSumaHorasTrabajadasMinutos = (  (diasDiff-1)*24*60 + nHorasTranscurridas*60 - nSumaDuracionesParadaMinutos   ).toFixed(2);
				 	nSumaHorasTrabajadasHoras = (   (diasDiff-1)*24 + nHorasTranscurridas - nSumaDuracionesParadaHoras   ).toFixed(2);
				}
				else {
					nSumaHorasTrabajadasMinutos = (diasDiff*24*60 - nSumaDuracionesParadaMinutos).toFixed(2);
				 	nSumaHorasTrabajadasHoras = (diasDiff*24 - nSumaDuracionesParadaHoras).toFixed(2);
				}

				



				html2 = html2 + "/tr>";				
				html2 = html2 + "		<td colspan='3' class='text-right'>Total Paradas:</td>";
				html2 = html2 + "		<td class='text-center'>" + nSumaDuracionesParadaMinutos.toFixed(2) + "</td>";
				html2 = html2 + "		<td class='text-center'>" + nSumaDuracionesParadaHoras.toFixed(2) + "</td>";
				html2 = html2 + "</tr>"
				html2 = html2 + "/tr>";				
				html2 = html2 + "		<td colspan='3' class='text-right'>Horas Trabajadas:</td>";
				html2 = html2 + "		<td class='text-center'>" + nSumaHorasTrabajadasMinutos + "</td>";
				html2 = html2 + "		<td class='text-center'>" + nSumaHorasTrabajadasHoras + "</td>";
				html2 = html2 + "</tr>"


				//obtenemos datos para el pareto x cantidad
				arrCantidades = arrCantidades.sort(function (a, b) {
				  if (a.y > b.y) {
				    return -1;
				  }
				  if (a.y < b.y) {
				    return 1;
				  }
				  // a must be equal to b
				  return 0;
				});			

				$.each(arrCantidades, function (key, val) {
					arrCategorias.push(val.codigo);
					nSumaCantidades = nSumaCantidades + val.y; 									
				});	

				$.each(arrCantidades, function (key, val) {
					nSumaCantidadesParcial = nSumaCantidadesParcial + val.y;

					var nPorc = 0;
					if (nSumaCantidades!=0) {
						nPorc=((nSumaCantidadesParcial/nSumaCantidades)*100).toFixed(2)*1;
					}
					else{
						nPorc=0;
					}							
					
					arrPareto.push(
					{						
						y: nPorc,
						descripcion: val.descripcion,
						codigo: val.codigo,
						tipo: val.tipo,
						descripcionTipo: val.descripcionTipo
					});	
				});


				//obtenemos datos para el pareto x duracion
				arrDuraciones = arrDuraciones.sort(function (a, b) {
				  if (a.y > b.y) {
				    return -1;
				  }
				  if (a.y < b.y) {
				    return 1;
				  }
				  // a must be equal to b
				  return 0;
				});				

				$.each(arrDuraciones, function (key, val) {
					arrCategoriasDur.push(val.codigo);
					nSumaDuraciones = nSumaDuraciones + val.y; 									
				});
			
				$.each(arrDuraciones, function (key, val) {
					nSumaDuracionesParcial = nSumaDuracionesParcial + val.y;

					var nPorc = 0;
					if (nSumaDuraciones!=0) {
						nPorc=((nSumaDuracionesParcial/nSumaDuraciones)*100).toFixed(2)*1;
					}
					else{
						nPorc=0;
					}							
					
					arrParetoDur.push(
					{						
						y: nPorc,
						descripcion: val.descripcion,
						codigo: val.codigo,
						tipo: val.tipo,
						descripcionTipo: val.descripcionTipo,
						/*
						marker: {
							symbol: 'url(./assets/img/star.png)'
						}*/
					});	
				});
						


    			$("#cuerpo-tabla-arbol-paradas").html(html);
    			$("#cuerpo-tabla-arbol-paradas2").html(html2);

    			var subtitulo="";
    			var subtituloDur="";
    			if (fechaFrom==fechaTo){
					subtitulo = "Cantidad de eventos del (" + fechaFromClasico + ")";	
					subtituloDur = "Duración de eventos del (" + fechaFromClasico + ")";	
				}
				else {
					subtitulo = "Cantidad de eventos del (" + fechaFromClasico + ") al (" + fechaToClasico + ")";
					subtituloDur = "Duración de eventos del (" + fechaFromClasico + ") al (" + fechaToClasico + ")";
				}    

				tituloParetoCantidad = "Máquina: "+maquina;
				subtituloParetoCantidad = subtitulo;

				tituloParetoDuracion = "Máquina: "+maquina;
				subtituloParetoDuracion = subtituloDur;

    			graficarChartParetoCantidad(tituloParetoCantidad, subtituloParetoCantidad, arrCategorias, arrCantidades, arrPareto);

    			graficarChartParetoDuracion(tituloParetoDuracion, subtituloParetoDuracion, arrCategoriasDur, arrDuraciones, arrParetoDur);

    		},
			complete: function(){

				$("#spin-arbol-paradas").addClass("d-none");
    			$("#contenedor-arbol-paradas").removeClass("d-none");    			

				$("#cuerpo-tabla-arbol-paradas .principal").on("click", function(){					
			    	var id = $(this).parent().attr("data-id");    	

			    	if ($(this).find("span").text()=="-"){
			    		$(this).find("span").text("+");
			    		$("#cuerpo-tabla-arbol-paradas tr[data-padre-id^='" + id + "']").addClass("d-none");	
			    		$("#cuerpo-tabla-arbol-paradas tr[data-padre-id^='" + id + "']").find(".principal span").text("+");
			    	}
			    	else{
			    		$(this).find("span").text("-");
			    		$("#cuerpo-tabla-arbol-paradas tr[data-padre-id='" + id + "']").removeClass("d-none");	
			    	}
			    });

			    $("#cuerpo-tabla-arbol-paradas2 .principal").on("click", function(){					
			    	var id = $(this).parent().attr("data-id");    	

			    	if ($(this).find("span").text()=="-"){
			    		$(this).find("span").text("+");
			    		$("#cuerpo-tabla-arbol-paradas2 tr[data-padre-id^='" + id + "']").addClass("d-none");	
			    		$("#cuerpo-tabla-arbol-paradas2 tr[data-padre-id^='" + id + "']").find(".principal span").text("+");
			    	}
			    	else{
			    		$(this).find("span").text("-");
			    		$("#cuerpo-tabla-arbol-paradas2 tr[data-padre-id='" + id + "']").removeClass("d-none");	
			    	}
			    });

			    $("#cuerpo-tabla-arbol-paradas2 .fecha-arbol").on("click", function(){

			    	$("#cuerpo-tabla-arbol-paradas2-detalle").empty();

			    	var id = $(this).parent().attr("data-id"); 
			    	var aId = id.split('|');

			    	var dataN1 = oDataParadas.filter( element => element.TipoParada==aId[0]);
			    	console.log(dataN1);
			    	if (dataN1.length>0){
			    		var dataN2 = dataN1[0].Eventos.filter( element => (element.TipoParada==aId[0] && element.CodigoParada==aId[1]));
			    		console.log(dataN2);

			    		if (dataN2.length>0){
							var dataN3 = dataN2[0].Eventos.filter( element => (element.TipoParada==aId[0] && element.CodigoParada==aId[1] && element.Fecha==aId[2]));
			    			console.log(dataN3);

			    			if (dataN3.length>0){
								var dataN4 = dataN3[0].Eventos.filter( element => (element.TipoParada==aId[0] && element.CodigoParada==aId[1] && element.Fecha==aId[2]));
			    				console.log(dataN4);

			    				var html="";			    				
			    				$.each(dataN4, function (key, val){
			    					html = html + "<tr class='arbol-nivel-4'>";					    					
			    					html = html + "		<td class='text-center'>" + val.Inicio.substring(11,19) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.Fin.substring(11,19) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.DuracionMinutos.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.DuracionHoras.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.UbicacionTecnica + "</td>";

			    					if (val.Comentario.trim()=="")
			    						html = html + "		<td class='text-center'>" + val.DescripcionParada + "</td>";
			    					else
			    						html = html + "		<td class='text-center'>" + val.Comentario + "</br>" + val.DescripcionParada + "</td>";

			    					html = html + "</tr>"	
			    				});

			    				$("#cuerpo-tabla-arbol-paradas2-detalle").html(html);
			    			}

			    		}
			    	}
			    });

			    $("#cuerpo-tabla-arbol-paradas2 .codigo-parada-arbol").on("click", function(){

			    	$("#cuerpo-tabla-arbol-paradas2-detalle").empty();

			    	$("#contenedor-tabla-arbol-paradas2-detalle").removeClass("d-none");
			    	$("#lbl-mensaje-tabla-arbol-paradas2-detalle").addClass("d-none");

			    	//activamos la ficha datos
			    	$("#barra-links-paradas .nav-link").removeClass("active");
			    	$("#link-paradas-datos").addClass("active");
			    	$(".bloque-paradas").addClass("d-none");
					$("#bloque-paradas-datos").removeClass("d-none");
			    	

			    	//mostramos selector			    	
			    	$("#cuerpo-tabla-arbol-paradas2 .fa-caret-left").addClass("d-none");
			    	$(this).parent().find(".fa-caret-left").removeClass("d-none");

			    	//mostramos carpeta abierta
			    	$("#cuerpo-tabla-arbol-paradas2 .codigo-parada-arbol i").removeClass("fa-folder-open");
			    	$("#cuerpo-tabla-arbol-paradas2 .codigo-parada-arbol i").addClass("fa-folder");
					$(this).parent().find(".fa-folder").addClass("fa-folder-open");
					$(this).parent().find(".fa-folder").removeClass("fa-folder");

			    	var id = $(this).parent().attr("data-id"); 
			    	var aId = id.split('|');

			    	var dataN1 = oDataParadas.filter( element => element.TipoParada==aId[0]);
			    	
			    	if (dataN1.length>0){
			    		var dataN2 = dataN1[0].Eventos.filter( element => (element.TipoParada==aId[0] && element.CodigoParada==aId[1]));
			    		
			    		if (dataN2.length>0){
							var dataN3 = dataN2[0].Eventos.filter( element => (element.TipoParada==aId[0] && element.CodigoParada==aId[1]));
			    						    			
			    			var html="";
			    			var oDatosChart=[];

			    			for (i=0;i<dataN3.length;i++){
			    				var dataN4 = dataN3[i].Eventos;			    				

			    				$.each(dataN4, function (key, val){
			    					html = html + "<tr class='arbol-nivel-3'>";					    					
			    					html = html + "		<td class='text-center'>" + val.Fecha + "</td>";
			    					html = html + "		<td class='text-center'>" + val.Inicio.substring(11,19) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.Fin.substring(11,19) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.DuracionMinutos.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.DuracionHoras.toFixed(2) + "</td>";
			    					html = html + "		<td class='text-center'>" + val.UbicacionTecnica + "</td>";

			    					if (val.Comentario.trim()=="")
			    						html = html + "		<td class='text-center' style='white-space: pre-wrap;'>" + val.DescripcionParada + "</td>";
			    					else
			    						html = html + "		<td class='text-center' style='white-space: pre-wrap;'>" + val.Comentario + "</br>" + val.DescripcionParada + "</td>";

			    					html = html + "</tr>";

			    					oDatosChart.push(val.DuracionMinutos);
			    				});			    				
			    			}

			    			//agregamos fila de totales
			    			html = html + "<tr style='font-weight:bold;'>";
			    			html = html + "		<td></td>";
			    			html = html + "		<td></td>";
			    			html = html + "		<td class='text-center'>TOTAL:</td>";
			    			html = html + "		<td class='text-center'>" + dataN2[0].DuracionMinutos.toFixed(2) + "</td>";
			    			html = html + "		<td class='text-center'>" + dataN2[0].DuracionHoras.toFixed(2) + "</td>";
			    			html = html + "		<td></td>";
			    			html = html + "		<td></td>";
			    			html = html + "</tr>";

			    			$("#cuerpo-tabla-arbol-paradas2-detalle").html(html);

			    			//cargamos graficos de histograma y bell
			    			cargarChartBellCurveEventos(oDatosChart);
			    			cargarChartHistogramEventos(oDatosChart);
			    			
			    		}
			    	}
			    });

			    $("#link-horas-dia").off("click");
    			$("#link-horas-dia").on("click", function(){
					cargarLinkHorasDia();
				});
			}
	});
}

function actualizarChartsPareto(){
	
	//pareto x cantidad
	var arrCantidadesFiltrada = [];
	$.each(arrCantidades, function (key, val){
		if($('.filtros-tipo-parada-cantidad #'+val.tipo).prop('checked')){
			arrCantidadesFiltrada.push(
			{						
				y: val.y,
				color: val.color,
				descripcion: val.descripcion,
				codigo: val.codigo,
				tipo: val.tipo,
				descripcionTipo: val.descripcionTipo
			});	
		}
	});

	var arrCategorias = [];
	var nSumaCantidades=0;
	$.each(arrCantidadesFiltrada, function (key, val) {
		arrCategorias.push(val.codigo);
		nSumaCantidades = nSumaCantidades + val.y; 									
	});	

	var arrPareto=[];
	var nSumaCantidadesParcial=0;
	$.each(arrCantidadesFiltrada, function (key, val) {
		nSumaCantidadesParcial = nSumaCantidadesParcial + val.y;

		var nPorc = 0;
		if (nSumaCantidades!=0) {
			nPorc=((nSumaCantidadesParcial/nSumaCantidades)*100).toFixed(2)*1;
		}
		else{
			nPorc=0;
		}							
		
		arrPareto.push(
		{						
			y: nPorc,
			descripcion: val.descripcion,
			codigo: val.codigo,
			tipo: val.tipo,
			descripcionTipo: val.descripcionTipo
		});	
	});

	graficarChartParetoCantidad(tituloParetoCantidad, subtituloParetoCantidad, arrCategorias, arrCantidadesFiltrada, arrPareto);	


	//pareto x duracion
	var arrDuracionesFiltrada = [];
	$.each(arrDuraciones, function (key, val){
		if($('.filtros-tipo-parada-cantidad #'+val.tipo).prop('checked')){
			arrDuracionesFiltrada.push(
			{						
				y: val.y,
				color: val.color,
				descripcion: val.descripcion,
				codigo: val.codigo,
				tipo: val.tipo,
				descripcionTipo: val.descripcionTipo
			});	
		}
	});

	var arrCategoriasDur = [];
	var nSumaDuraciones=0;
	$.each(arrDuracionesFiltrada, function (key, val) {
		arrCategoriasDur.push(val.codigo);
		nSumaDuraciones = nSumaDuraciones + val.y; 									
	});	

	var arrParetoDur=[];
	var nSumaDuracionesParcial=0;
	$.each(arrDuracionesFiltrada, function (key, val) {
		nSumaDuracionesParcial = nSumaDuracionesParcial + val.y;

		var nPorc = 0;
		if (nSumaDuraciones!=0) {
			nPorc=((nSumaDuracionesParcial/nSumaDuraciones)*100).toFixed(2)*1;
		}
		else{
			nPorc=0;
		}							
		
		arrParetoDur.push(
		{						
			y: nPorc,
			descripcion: val.descripcion,
			codigo: val.codigo,
			tipo: val.tipo,
			descripcionTipo: val.descripcionTipo
		});	
	});

	graficarChartParetoDuracion(tituloParetoDuracion, subtituloParetoDuracion, arrCategoriasDur, arrDuracionesFiltrada, arrParetoDur);
}

function graficarChartParetoCantidad(titulo, subtitulo, arrCategorias, arrCantidades, arrPareto){
	
	//obtenemos el punto menor mas cercano a 80%
	var nIndiceLinea=-1;
	for (i=0; i<arrPareto.length; i++){
		if (arrPareto[i].y<80){
			nIndiceLinea = i	
		}	
	}
	if (nIndiceLinea==-1){
		if (arrPareto.length>0){
			nIndiceLinea=0;
		}
	}
	if (nIndiceLinea!=-1){
		arrPareto[nIndiceLinea].marker = {};
		arrPareto[nIndiceLinea].marker.symbol = 'url(./assets/img/80-20-v2.png)';
	}
	
	Highcharts.chart('chart_paradascantidad', Highcharts.merge(
	{
	    chart: {
	        renderTo: 'container',
	        type: 'column'
	    },
	    title: {
	        text: titulo,
	    },
	    subtitle: {
			text: subtitulo,
		},
		legend:{ 
			enabled:false 
		},
	    tooltip: {
	        headerFormat: null,			
			pointFormat: '<span style="color:{point.color}">\u25CF</span> Código: <b>{point.codigo} - {point.descripcion}</b><br/>'+									 
						 '<span style="color:{point.color}">\u25CF</span> Tipo: <b>{point.tipo}{point.descripcionTipo}</b><br/>'+
						 '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
	    },

		plotOptions: {
			series: {						
				point: {
                	events: {
                  	click: function(e){
                  		//cCodigoParada = e.point.category;
                  		//MostrarModalDetalleEventos(fechaService, maquina, cCodigoParada, dias, "cantidad");			                  		                 	                    
                      
                    }
                  }
                }
					
			}
		},

	    xAxis: {
	        categories: arrCategorias,
	        crosshair: true,

	        plotLines: [{
	            color: '#FF0000',
	            width: 2,
	            value: nIndiceLinea,
	            zIndex: 10	            
        	}]
	    },
	    yAxis: [{
	        title: {
	            text: ''
	        }
	    }, {
	        title: {
	            text: ''
	        },
	        minPadding: 0,
	        maxPadding: 0,
	        max: 100,
	        min: 0,
	        opposite: true,
	        labels: {
	            format: "{value}%"
	        }
	    }],
	    series: [{
	        type: 'pareto',
	        name: 'Pareto',
	        yAxis: 1,
	        zIndex: 10,
	        //baseSeries: 1
	        data: arrPareto
	    }, {
	        name: 'Eventos',
	        type: 'column',
	        zIndex: 2,
	        data: arrCantidades,
	        color: {
				linearGradient : {x1:0, y1:0, x2:0, y2:1 },
				stops: [
					[0, '#6f2da8'],
					[1, '#f7f7f7']
				]
			},
	    }],

	    credits: {
		        enabled: false
		}
	},
		( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
}

function graficarChartParetoDuracion(titulo, subtitulo, arrCategorias, arrDuraciones, arrPareto){
	
	//obtenemos el punto menor mas cercano a 80%
	var nIndiceLinea=-1;
	for (i=0; i<arrPareto.length; i++){
		if (arrPareto[i].y<80){
			nIndiceLinea = i			
		}	
	}
	if (nIndiceLinea==-1){
		if (arrPareto.length>0){
			nIndiceLinea=0;			
		}
	}
	if (nIndiceLinea!=-1){
		arrPareto[nIndiceLinea].marker = {};
		arrPareto[nIndiceLinea].marker.symbol = 'url(./assets/img/80-20-v2.png)';
	}
	

	Highcharts.chart('chart_paradasduracion', Highcharts.merge(
	{
	    chart: {
	        renderTo: 'container',
	        type: 'column'
	    },
	    title: {
	        text: titulo,
	    },
	    subtitle: {
			text: subtitulo,
		},
		legend:{ 
			enabled:false 
		},
      	tooltip:{			
			    	headerFormat: null,			
					pointFormat: '<span style="color:{point.color}">\u25CF</span> Código: <b>{point.codigo} - {point.descripcion}</b><br/>'+									 
								 '<span style="color:{point.color}">\u25CF</span> Tipo: <b>{point.tipo}	{point.descripcionTipo}</b><br/>'+
								 '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
					             
				},

		plotOptions: {
			series: {						
				point: {
                	events: {
                  	click: function(e){
                  		//cCodigoParada = e.point.category;
                  		//MostrarModalDetalleEventos(fechaService, maquina, cCodigoParada, dias, "cantidad");			                  		                 	                    
                      
                    }
                  }
                }
					
			}
		},

	    xAxis: {
	        categories: arrCategorias,
	        crosshair: true,

	         plotLines: [{
	            color: '#FF0000',
	            width: 2,
	            value: nIndiceLinea,
	            zIndex: 10	            
        	}]
	    },
	    yAxis: [{
	        title: {
	            text: ''
	        }
	    }, {
	        title: {
	            text: ''
	        },
	        minPadding: 0,
	        maxPadding: 0,
	        max: 100,
	        min: 0,
	        opposite: true,
	        labels: {
	            format: "{value}%"
	        }
	    }],
	    series: [{
	        type: 'pareto',
	        name: 'Pareto',
	        yAxis: 1,
	        zIndex: 10,
	        //baseSeries: 1
	        data: arrPareto
	    }, {
	        name: 'Duración (min)',
	        type: 'column',
	        zIndex: 2,
	        data: arrDuraciones,
	        color: {
				linearGradient : {x1:0, y1:0, x2:0, y2:1 },
				stops: [
					[0, '#888888'],
					[1, '#f7f7f7']
				]
			},
	    }],

	    credits: {
		        enabled: false
		}
	},
		( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
}

function cargarChartHistogramEventos(oDatos){

	Highcharts.chart('chart-histogram-eventos',  Highcharts.merge(
	{
	    title: {
	        text: ''
	    },
	    xAxis: [{
	        title: { text: 'Duración evento' },
	        alignTicks: false
	    }, {
	        title: { text: 'Histograma' },
	        alignTicks: false,
	        opposite: true
	    }],

	    yAxis: [{
	        title: { text: 'Duración evento' }
	    }, {
	        title: { text: 'Histograma' },
	        opposite: true
	    }],

	    series: [{
	        name: 'Histograma',
	        type: 'histogram',
	        xAxis: 1,
	        yAxis: 1,
	        baseSeries: 's1',
	        zIndex: -1,
	         color: {
							linearGradient : {x1:0, y1:0, x2:0, y2:1 },
							stops: [
								[0, '#597c9e'],
								[1, '#f7f7f7']
							]
						},
	    }, {
	        name: 'Duración evento',
	        type: 'scatter',
	        data: oDatos,
	        id: 's1',
	        marker: {
	            radius: 1.5
	        },
	        color: "#000000"
	    }],

	    credits: {
		        enabled: false
		}
	},
		( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
}

function cargarChartBellCurveEventos(oDatos){
			
	
	Highcharts.chart('chart-bell-curve-eventos', Highcharts.merge(
	{

	    title: {
	        //text: 'Bell curve'
	        text: ''
	    },

	    xAxis: [{
	        title: {
	            text: 'Duración evento'
	        },
	        alignTicks: false
	    }, {
	        title: {
	            text: 'Distribución'
	        },
	        alignTicks: false,
	        opposite: true
	    }],

	    yAxis: [{
	        title: { text: 'Duración evento' }
	    }, {
	        title: { text: 'Distribución' },
	        opposite: true
	    }],

	    series: [{
	        name: 'Distribución',
	        type: 'bellcurve',
	        xAxis: 1,
	        yAxis: 1,
	        baseSeries: 1,
	        zIndex: -1,
	        color: {
							linearGradient : {x1:0, y1:0, x2:0, y2:1 },
							stops: [
								[0, '#81c5c5'],
								[1, '#f7f7f7']
							]
						},
	    }, {
	        name: 'Duración evento',
	        type: 'scatter',
	        data: oDatos,
	        marker: {
	            radius: 1.5
	        },
	        color: 	"#000000"
	        
	    }],

	    credits: {
		        enabled: false
		}
	},
		( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
}


function ObtenerDescripcionDeTipoParada(tipoParada){

	if (tipoParada=="IM") {
		return " - Incidencia Mecánica"
	}
	else if (tipoParada=="IE"){
		return " - Incidencia Eléctrica"
	}
	else if (tipoParada=="IO"){
		return " - Incidencia Operativa"
	}
	else if (tipoParada=="PP"){
		return " - Parada Programada"
	}
	else if (tipoParada=="PC"){
		return " - Parada Circunstancial"
	}
	else if (tipoParada=="NC"){
		return ""
	}	
}

function obtenerAliasDeUbicacionTecnica(UbicacionTecnica){
	var temp = UbicacionTecnica.substring(1,UbicacionTecnica.length);
	var alias="";

	for (i=0;i<temp.length;i=i+2){
		var porcion = temp.substring(i,i+2);

		if (porcion.substring(0,1)=="0"){
			porcion=porcion.substring(1,2);
		}
		alias=alias+porcion;
	}

	return alias;
}

function cargarResumen(fecha_dash,maquina){	

	var arrHoras = [];

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ObtenerResumenHorasTrabajadasYParadasPorPeriodos?fecha="+fecha_dash+"&maquina="+maquina+"&origen=P",
		dataType: 'json', 
		data: null, 
		async: true,
		beforeSend: function (){            

        }, 
		success: function(data){			
					
			$.each(data, function (key, val) {
				if(val.Periodo == "d"){					
						
					arrHoras.push(val.SumHTrabajo);
					arrHoras.push(val.SumIM);
					arrHoras.push(val.SumIE);
					arrHoras.push(val.SumIO);
					arrHoras.push(val.SumPP);
					arrHoras.push(val.SumPC);
					arrHoras.push(val.SumNC);

					$("#produccion-dia").text(formatearNumero(val.SumProduccion,0) + " t");
					//$("#rendimiento-dia").text(formatearNumero(val.TH,0) + " t/h");
					$("#consumo-energia-dia").text(formatearNumero(val.KWHT,2) + " kWh/t");

					$("#fiabilidad-dia").text((val.PorcFiab*100).toFixed(0) + " %");	
					$("#fiabilidad-dia-progress").css("width",(val.PorcFiab*100).toFixed(0) + "%")

					$("#card-fiabilidad-dia .ribbon-box").css("background-color",val.ColorFIAB);
					$("#estilos_fiabilidad").empty();
					$("#estilos_fiabilidad").html("#card-fiabilidad-dia .ribbon .ribbon-box:before { border-color: " + val.ColorFIAB + " !important; border-right-color: transparent !important;}");


					//$("#horas-trabajo-dia").text(formatearNumero(val.SumHTrabajo,2) + " h");	
					$("#horas-trabajo-dia").text(val.SumHTrabajo + " h");	
					$("#im-dia").text("IM: " + formatearNumero(val.SumIM,2) + " h");	
					$("#pp-dia").text("PP: " + formatearNumero(val.SumPP,2) + " h");	
					$("#ie-dia").text("IE: " + formatearNumero(val.SumIE,2) + " h");	
					$("#pc-dia").text("PC: " + formatearNumero(val.SumPC,2) + " h");	
					$("#io-dia").text("IO: " + formatearNumero(val.SumIO,2) + " h");	
					$("#nc-dia").text("NC: " + formatearNumero(val.SumNC,2) + " h");	
										

					//graficamos chart horas
					Highcharts.chart('chart-horas', Highcharts.merge( 
					{
					    chart: {
					        plotBackgroundColor: null,
					        plotBorderWidth: null,
					        plotShadow: false,
					        type: 'pie',
					        height: 65,
					        width: 105,
					        margin: [-5, -10, -5, -14],					       
					    },
					    title: {
					        text: null
					    },
					     tooltip: {
					        enabled: false
					    },
					    accessibility: {
					        point: {
					            valueSuffix: '%'
					        }
					    },
					    plotOptions: {
					        pie: {
					            allowPointSelect: false,
					            cursor: 'pointer',
					            dataLabels: {
					                enabled: false
					            },
					            showInLegend: false
					        }
					    },
					    series: [{
					        name: 'Brands',
					        colorByPoint: true,
					        data: [{
					            name: 'HT',
					            y: val.SumHTrabajo,
					            color: colorChart.colorHT					            
					        }, {
					            name: 'IM',
					            y: val.SumIM,
					            color: colorChart.colorIM					            
					        }, {
					            name: 'IE',
					            y: val.SumIE,
					            color: colorChart.colorIE					            
					        }, {
					            name: 'IO',
					            y: val.SumIO,
					            color: colorChart.colorIO
					        }, {
					            name: 'PP',
					            y: val.SumPP,
					            color: colorChart.colorPP
					        }, {
					            name: 'PC',
					            y: val.SumPC,
					            color: colorChart.colorPC
					        }, {
					            name: 'NC',
					            y: val.SumNC,
					            color: colorChart.colorNC
					        }]
					    }],
					    navigation: {
							buttonOptions: {
  								enabled: false
  							}
 						},
 						credits: {
						    enabled: false
						 },
					},
						( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
					)
					);

				}



/*
				var idComentario = "'" + conexion_operaciones.aplicacion_rdp + "|index|rdp|" + fecha_dash + "|" + maquina + "|" + "" + "|" + "" + "'";

				fila_dash = fila_dash + "<tr>"
				+"<td>"
					+"<a pop='popup-"+cont+"' class='u-alineado-vertical u-margen-derecha-5 u-oculto u-mostrar-700 u-abrir-popup "+margen_m5px+"' href='javascript:void(0);'><img width='22' src='./img/icon-popup-grisx44.png' /></a>"
					+"<span class='u-alineado-vertical'>"+celda+"</span>"
				+"</td>"
				+"<td>"+formatearNumero(val.SumHTrabajo,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumIM,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumIE,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumIO,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumPP,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumPC,2)+"</td>"
				+"<td class='u-ocultar-700'>"+formatearNumero(val.SumNC,2)+"</td>";
				
				if (maquina=="ChPrimaria" && val.Periodo=="d" && val.TieneAlertaProduccion=="S"){
					fila_dash = fila_dash + '<td>' + 
				    formatearNumero(val.SumProduccion,0) + 
				    '<i class="fas fa-exclamation-triangle" onclick="MostrarModalChat(' + idComentario + ');"></i></td>';
				}
				else
					fila_dash = fila_dash + "<td>" + formatearNumero(val.SumProduccion,0) + "</td>";

				fila_dash = fila_dash +"<td>"+formatearNumero(val.TH,0)+"</td>"
				+"<td>"+formatearNumero(val.KWHT,2)+"</td>"
				+"<td>"+(val.PorcFiab*100).toFixed(0)*1.00+"</td>"
				+"</tr>";
*/				
						
				
			});
			
			
		},
		complete: function(data){


			//cargarChartTorta(arrHoras, fecha_dash, maquina);
			//console.log("Servicio resumen:::::"+ipService+"/Operaciones.svc/ObtenerResumenHorasTrabajadasYParadasPorPeriodos?fecha="+fecha_dash+"&maquina="+maquina+"&origen=P");	
			//console.log("Servicio Torta:::::"+ipService+"/Operaciones.svc/ObtenerResumenHorasTrabajadasYParadasPorPeriodos?fecha="+fecha_dash+"&maquina="+maquina+"&origen=P");				

			
		}
	});
	
}




function graficarChartResumen(){
	var cFechaFin = oFiltrosFechaResumen.obtenerFechaFin();  			
  	var nDias = oFiltrosFechaResumen.obtenerDias();
  	var maquina=extraerMaquina(document.getElementById("u-titulo-maquina").innerHTML);  	
  	cargarServiceChart(cFechaFin,maquina,nDias);
}

function cargarServiceChart(fechaService, maquina, dias){
	
	var arrProd = [];
	var arrTh = [];
	var arrKWH = [];
	var arrKWHT = [];
	var asd;
	var arrProd2 = [];
	var arrTh2 = [];
	var arrKWH2 = [];
	var arrKWHT2 = [];
	var liTh1 = 0;
	var lsTh1 = 0;
	var liTh2 = 0;
	var lsTh2 = 0;
	
	//oFiltrosFechaResumen.mostrarSpinner();
	$(".contenedor-botones-productividad").addClass("d-none");

	$(function () {
		$.getJSON(ipService+"/Operaciones.svc/ListarResumenHorasTrabajadasYParadasPorDias?fecha="+fechaService+"&maquina="+maquina+"&origen=P&dias="+dias,
			
			function (data) {
				
				$.each(data, function (key, val) {

				
				    //los demas son arreglos simples
				    arrTh.push(val.TH.toFixed(0)*1.00);
					arrProd.push(val.SumProduccion.toFixed(0)*1.00);
					arrKWH.push(val.KWH);
					arrKWHT.push(val.KWHT.toFixed(2)*1.00);
					
					//Redondear
					//console.log(Math.round(val.SumProduccion));
					
					//Redondear a dos decimales
					//console.log(parseFloat(val.SumProduccion).toFixed(2));
				});


				//traemos datos  de produccion (soporta grupos)
				$.ajax({ 
			    	url: ipService+"/Operaciones.svc/ListarProduccionGrupoPorMaquinaDiario?fecha="+fechaService+"&maquina="+maquina+"&dias="+dias,
			    	dataType: 'json', 
			    	data: null, 
			    	async: false,     		
			    })
			    .done(function(data){

			    	var oGrupos = data.distinct('COD_GRUPO');			    	

			    	if (oGrupos.length>1){

			    		$(".contenedor-botones-productividad").removeClass("d-none");

			    		arrProd=[];
			    		arrProd2=[];
			    		arrTh=[];
			    		arrTh2=[];

			    		var data1 = data.filter( element => element.COD_GRUPO==oGrupos[0]);
			    		var data2 = data.filter( element => element.COD_GRUPO==oGrupos[1]);

			    		$.each(data1, function (key, val) {
			    			arrProd.push(val.CNT_TONELADAS.toFixed(0)*1.00);
			    			arrTh.push(val.CNT_TH.toFixed(0)*1.00);
			    			liTh1=val.CNT_TH_LI.toFixed(0)*1.00;
			    			lsTh1=val.CNT_TH_LS.toFixed(0)*1.00;
			    		});

			    		$.each(data2, function (key, val) {
			    			arrProd2.push(val.CNT_TONELADAS.toFixed(0)*1.00);
			    			arrTh2.push(val.CNT_TH.toFixed(0)*1.00);
			    			liTh2=val.CNT_TH_LI.toFixed(0)*1.00;
			    			lsTh2=val.CNT_TH_LS.toFixed(0)*1.00;
			    		});
			    		

			    		//traemos datos de energia (soporta grupos)
			    		$.ajax({ 
					    	url: ipService+"/Operaciones.svc/ListarEnergiaProduccionGrupoPorMaquinaDiario?fecha="+fechaService+"&maquina="+maquina+"&dias="+dias,
					    	dataType: 'json', 
					    	data: null, 
					    	async: false,     		
					    })
					    .done(function(dataE){
					    	var oGruposE = dataE.distinct('COD_GRUPO');

					    	if (oGrupos.length>1){
					    		arrKWH=[];
					    		arrKWH2=[];
					    		arrKWHT=[];
					    		arrKWHT2=[];

					    		var dataE1 = dataE.filter( element => element.COD_GRUPO==oGruposE[0]);
			    				var dataE2 = dataE.filter( element => element.COD_GRUPO==oGruposE[1]);

			    				$.each(dataE1, function (key, val) {
					    			arrKWH.push(val.CNT_KWH.toFixed(0)*1.00);
					    			arrKWHT.push(val.CNT_KWHT.toFixed(2)*1.00);
					    		});

					    		$.each(dataE2, function (key, val) {
					    			arrKWH2.push(val.CNT_KWH.toFixed(0)*1.00);
					    			arrKWHT2.push(val.CNT_KWHT.toFixed(2)*1.00);
					    		});

					    	}
					    					    

					    });			    		

					    cargarChartDividido(arrProd, arrTh, arrKWH, arrKWHT, fechaService, maquina, dias, arrProd2, arrTh2, arrKWH2, arrKWHT2, liTh1, lsTh1, liTh2, lsTh2);	
			    	}			    				    				    	
			    	
			    	cargarChart(arrProd, arrTh, arrKWH, arrKWHT, fechaService, maquina, dias, arrProd2, arrTh2, arrKWH2, arrKWHT2, liTh1, lsTh1, liTh2, lsTh2);	
			    	

			    })
			    .always(function() {    				    	
			    	//oFiltrosFechaResumen.ocultarSpinner();
			  	});
					
				
				//cargarChart(arrProd, arrTh, arrKWH, arrKWHT, fechaService, maquina, dias);

				//oFiltrosFechaResumen.ocultarSpinner();
		});
	});
	 
	console.log("Servicio chart:::::"+ipService+"/Operaciones.svc/ListarResumenHorasTrabajadasYParadasPorDias?fecha="+fechaService+"&maquina="+maquina+"&origen=P&dias="+dias);	
}

function cargarChart(arrayProd, arrayTh, arrayKWH, arrayKWHT, fechaService, maquina, dias, arrayProd2, arrayTh2, arrayKWH2, arrayKWHT2, liTh1, lsTh1, liTh2, lsTh2){

	//obtenemos los limites de t/h para la maquina
	var li=undefined;
	var ls=undefined;
	var li2=undefined;
	var ls2=undefined;

	$.ajax({ 
    	url: ipService+"/Operaciones.svc/ListarKPIPorMaquina?maquina="+maquina+"&kpi=t/h",
    	dataType: 'json', 
    	data: null, 
    	async: false,     		
    })
    .done(function(data){
    	if (data!=null){
    		li=data.LI;
			ls=data.LS;    		
    	}
		
    })
    .always(function() {    	
    	//alert( "complete" );
  	});

	
	if (arrayProd2.length==0){
    	arrayTh = arrayTh.reverse();
		arrayTh2 = arrayTh2.reverse();
    }
    else {
    	li=liTh1;
		ls=lsTh1;
		li2=liTh2;
		ls2=lsTh2;
    }

	//formamos el json para th
	var oDatalabelRojo = new Object();
	oDatalabelRojo.className='label-rojo';				    
				
	var jsonTH = [];
    for (i=0;i<arrayTh.length;i++){
	    var oTh = new Object();
	    oTh.y=arrayTh[i];
	    if (li != undefined){
		    if (oTh.y<li){
				oTh.dataLabels = oDatalabelRojo;
		    }
	    }	    	   
	    jsonTH.push(oTh);										
    }

    var jsonTH2 = [];
    for (i=0;i<arrayTh2.length;i++){
	    var oTh = new Object();
	    oTh.y=arrayTh2[i];
	    if (li2 != undefined){
		    if (oTh.y<li2){
				oTh.dataLabels = oDatalabelRojo;
		    }
	    }	    	   
	    jsonTH2.push(oTh);										
    }

    

	Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function(proceed) {
	    var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
	    if (path) {
	        path.flat = false;
	    }
	    return path;
	});

	
	var fechaBase = restar_n_dias(fechaService, dias).split("-");
	var fechaBaseString = fechaBase[0]
	+"/"+agregar_cero((parseInt(fechaBase[1])+1))
	+"/"+fechaBase[2];
	var fechAl = formatearFecha_DD_MM_YYYY(fechaService, "-").replace(/-/gi,"/");
	var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(fechaService,dias), "-").replace(/-/gi,"/");
	/*---------Invertir arreglos---------*/
	arrayProd = arrayProd.reverse();
	//arrayTh = arrayTh.reverse();
	arrayKWH = arrayKWH.reverse();
	arrayKWHT = arrayKWHT.reverse();
	maquina = maquina.replace(/%20/gi, " ");

	arrayProd = arrayProd.reverse();
	arrayProd2 = arrayProd2.reverse();

	arrayKWH2 = arrayKWH2.reverse();
	arrayKWHT2 = arrayKWHT2.reverse();



	var oSeries = [];
		
	if (arrayProd2.length>0){

		arrayProd = arrayProd.reverse();
		arrayProd2 = arrayProd2.reverse();

		arrayKWH = arrayKWH.reverse();
		arrayKWH2 = arrayKWH2.reverse();

		arrayKWHT = arrayKWHT.reverse();
		arrayKWHT2 = arrayKWHT2.reverse();

		oSeries.push({
			name: 't/h Cemento',			
			type: 'spline',			
			yAxis: 0, //yAxis: 2,
			zIndex: 2,
			color: '#176339',			
			data : jsonTH,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});

		oSeries.push({
			name: 't/h Crudo',			
			type: 'spline',			
			yAxis: 1, //yAxis: 5,
			zIndex: 2,
			color: '#434348',			
			data : jsonTH2,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});


		oSeries.push({
			name: 'Prod. Cemento (t)',			
			type: 'column',
			yAxis: 2, //yAxis: 3,
			color: '#7CB5EC',
			data: arrayProd,
			tooltip: {				
			}
		});

		oSeries.push({
			name: 'Prod. Crudo (t)',			
			type: 'column',
			yAxis: 3, //yAxis: 4,
			color: '#4169E1',
			data: arrayProd2,
			tooltip: {				
			}
		});


		oSeries.push({
			name: 'kWh/t Cemento',
			visible : false,
			type: 'column',			
			yAxis: 4, //yAxis: 0,
			color: '#FF7F50',
			data: arrayKWHT,
			tooltip: {				
			}			
		});


		oSeries.push({
			name: 'kWh/t Crudo',
			visible : false,
			type: 'column',			
			yAxis: 5, //yAxis: 7,
			color: '#51AD4B',
			data: arrayKWHT2,
			tooltip: {				
			}			
		});


		oSeries.push({
			name: 'kWh Cemento',
			zIndex: 1,			
			type: 'spline',
			yAxis: 6, //yAxis: 1
			color: '#d4c311',			
			data: arrayKWH,
			visible: false,
			tooltip: {				
			}		
		});

		oSeries.push({
			name: 'kWh Crudo',
			zIndex: 1,			
			type: 'spline',
			yAxis: 7, //yAxis: 6
			color: '#434348',			
			data: arrayKWH2,
			visible: false,
			tooltip: {				
			}		
		});



		
	}
	else {

		oSeries.push({
			name: 'kWh/t',
			visible : true,
			type: 'column',			
			yAxis: 0,
			color: '#51AD4B',
			data: arrayKWHT,
			tooltip: {				
			},
			dataLabels:{enabled:true}			
		});

		oSeries.push({
			name: 'kWh',
			zIndex: 1,			
			type: 'spline',
			yAxis: 1,
			color: '#d4c311',			
			data: arrayKWH,
			visible: false,
			tooltip: {				
			}		
		});


		oSeries.push({
			name: 't/h',			
			type: 'spline',			
			yAxis: 2,
			zIndex: 2,
			color: '#434348',			
			data : jsonTH,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});

		oSeries.push({
			name: 'Producción (t)',			
			type: 'column',
			yAxis: 3,
			color: '#7CB5EC',
			data: arrayProd,
			tooltip: {				
			}
		});

		
	}



	var oyAxis = [];

	

	

	if (arrayProd2.length>0){


		oyAxis.push({
			title: {
				text: 't/h Cemento',
				style:{
					color: '#176339'
				}
			},
			labels: {	            
	            style: {
	                color: '#176339'
	            }
	    	},	
			
			plotLines: [{
	            color: '#F7A35C',
	            width: 2,
	            value: li,				
	           	label: {
	                text:  li,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#F7A35C',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:2
	    	},
	    	{
	            color: '#8F85E8',
	            width: 2,
	            value: ls,
	            label: {
	                text:  ls,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#8F85E8',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:2
	    	}]	

		});


		oyAxis.push({
			title: {
				text: 't/h Crudo',
				style:{
					color: '#7cb5ec'
				}
			},
			labels: {	            
	            style: {
	                color: '#7cb5ec'
	            }
	    	},	
			//labels: true,
			plotLines: [{
	            color: '#F7A35C',
	            width: 2,
	            value: li2,				
	           	label: {
	                text:  li2,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#F7A35C',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	           	zIndex:5
	    	},
	    	{
	            color: '#8F85E8',
	            width: 2,
	            value: ls2,
	            label: {
	                text:  ls2,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#8F85E8',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:5
	    	}]	
		});


		oyAxis.push({
			title: {
				text: 'Prod. Cemento (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});

		oyAxis.push({
			title: {
				text: 'Prod. Crudo (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});
		
		oyAxis.push({
			title: {
				text: 'kWh/t Cemento',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});

		oyAxis.push({
			title: {
				text: 'kWh/t Crudo',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});


		oyAxis.push({
			title: {
				text: 'kWh Cemento',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});


		oyAxis.push({
			title: {
				text: 'kWh Crudo',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});
			



		
	}
	else {

		oyAxis.push({
			title: {
				text: 'kWh/t',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});

		oyAxis.push({
			title: {
				text: 'kWh',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});


		oyAxis.push({
		title: {
			text: 't/h',
			style:{
				color: '#7cb5ec'
			}
		},
		labels: {	            
            style: {
                color: '#7cb5ec'
            }
    	},	
		//labels: true,
		plotLines: [{
            color: '#F7A35C',
            width: 2,
            value: li,				
           	label: {
                text:  li,
                verticalAlign: 'bottom',
                textAlign: 'right',
                style: {
                    color: '#F7A35C',
                    fontWeight: 'bold',
                    fontSize: '11px',
            	}
            },
            zIndex:2
    	},
    	{
            color: '#8F85E8',
            width: 2,
            value: ls,
            label: {
                text:  ls,
                verticalAlign: 'bottom',
                textAlign: 'right',
                style: {
                    color: '#8F85E8',
                    fontWeight: 'bold',
                    fontSize: '11px',
            	}
            },
            zIndex:2
    	}]	
	});

		oyAxis.push({
			title: {
				text: 'Producción (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});	

	}




	oChart = Highcharts.chart("chart_produccion", Highcharts.merge(
	{
		chart: {
			//renderTo: 'container',			
			height: 380,

			events: {
		        load: function() {
		          	var chart = this,
		            yAxis = chart.yAxis[3],
		            yExtremes = yAxis.getExtremes(),
		            newMin = yExtremes.dataMin,
		            newMax = yExtremes.dataMax;

		            if (newMin<0)
		            	newMin=0;
		            
		          	yAxis.setExtremes(newMin, newMax, true, false);

		          	 if(chart.yAxis.length>4){
		            	yAxis2 = chart.yAxis[2];
			            yExtremes2 = yAxis2.getExtremes();
			            newMin2 = yExtremes2.dataMin;
			            newMax2 = yExtremes2.dataMax;

			            if (newMin2<0)
			            	newMin2=0;

			            yAxis2.setExtremes(newMin2, newMax2, true, false);
		            }
	        	}
      		}			
		},
		title: {
			text: 'Máquina: '+maquina
		},
		credits: {
			enabled: false
		},
		subtitle: {
			text: "Producción del ("+fechDesde+") al ("+fechAl+")"
		},
		xAxis: [{
			type: 'datetime'
		}],
		yAxis: oyAxis,
		plotOptions: {
			series: {
				pointInterval: 86400000, // 1d
				pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,

				point: {
                	events: {
                  	click: function(e){
                  		                  		
                    	var seriesName = e.point.series.name;
                    	if(seriesName == "t/h") {
                    		var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                      	//MostrarModalProductos(dFechaLocal, maquina);
	                    }	  
	                    else if (seriesName == "kWh") {
	                    	var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                    	//MostrarModalEnergiaProductos(dFechaLocal, maquina);

	                    	
	                    }
                      
                    }
                  }
                }
					
			}
		},
		tooltip: {
			shared: true
		},
		legend: {
			layout: 'vertical',
			align: 'left',
			x: -20,
			verticalAlign: 'top',
			y: -15,
			floating: true,
			backgroundColor:'rgba(255,255,255,0.5)'
		},
		series: oSeries
	}
	,
	( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
	
	Highcharts.setOptions({
	    lang: {
	        months: [
	            'Enero', 'Febrero', 'Marzo', 'Abril',
	            'Mayo', 'Junio', 'Julio', 'Agosto',
	            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	        ],
	        weekdays: [
	            'Domingo', 'Lunes', 'Martes', 'Miercoles',
	            'Jueves', 'Viernes', 'Sábado'
	        ]
	    }
	});
}


function cargarChartDividido(arrayProd, arrayTh, arrayKWH, arrayKWHT, fechaService, maquina, dias, arrayProd2, arrayTh2, arrayKWH2, arrayKWHT2, liTh1, lsTh1, liTh2, lsTh2){

	//obtenemos los limites de t/h para la maquina
	var li=undefined;
	var ls=undefined;
	var li2=undefined;
	var ls2=undefined;
	
	$.ajax({ 
    	url: ipService+"/Operaciones.svc/ListarKPIPorMaquina?maquina="+maquina+"&kpi=t/h",
    	dataType: 'json', 
    	data: null, 
    	async: false,     		
    })
    .done(function(data){
    	if (data!=null){
    		li=data.LI;
			ls=data.LS;    		
    	}
		
    })
    .always(function() {    	
    	//alert( "complete" );
  	});

    if (arrayProd2.length==0){
    	arrayTh = arrayTh.reverse();
		arrayTh2 = arrayTh2.reverse();		
    }
    else {
    	li=liTh1;
		ls=lsTh1;
		li2=liTh2;
		ls2=lsTh2;		
    }
    


	//formamos el json para th
	var oDatalabelRojo = new Object();
	oDatalabelRojo.className='label-rojo';

	var jsonTH = [];
    for (i=0;i<arrayTh.length;i++){
	    var oTh = new Object();
	    oTh.y=arrayTh[i];
	    if (li != undefined){
		    if (oTh.y<li){
				oTh.dataLabels = oDatalabelRojo;
		    }
	    }	    	   
	    jsonTH.push(oTh);										
    }

    var jsonTH2 = [];
    for (i=0;i<arrayTh2.length;i++){
	    var oTh = new Object();
	    oTh.y=arrayTh2[i];
	    if (li2 != undefined){
		    if (oTh.y<li2){
				oTh.dataLabels = oDatalabelRojo;
		    }
	    }	    	   
	    jsonTH2.push(oTh);										
    }

    Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function(proceed) {
	    var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
	    if (path) {
	        path.flat = false;
	    }
	    return path;
	});

	
	var fechaBase = restar_n_dias(fechaService, dias).split("-");
	var fechaBaseString = fechaBase[0]
	+"/"+agregar_cero((parseInt(fechaBase[1])+1))
	+"/"+fechaBase[2];
	var fechAl = formatearFecha_DD_MM_YYYY(fechaService, "-").replace(/-/gi,"/");
	var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(fechaService,dias), "-").replace(/-/gi,"/");
	/*---------Invertir arreglos---------*/	
	//arrayTh = arrayTh.reverse();
	arrayKWH = arrayKWH.reverse();
	arrayKWHT = arrayKWHT.reverse();
	maquina = maquina.replace(/%20/gi, " ");

	arrayProd = arrayProd.reverse();
	arrayProd2 = arrayProd2.reverse();

	arrayKWH2 = arrayKWH2.reverse();
	arrayKWHT2 = arrayKWHT2.reverse();


	var oSeries1 = [];
	var oSeries2 = [];
		
	if (arrayProd2.length>0){

		arrayProd = arrayProd.reverse();
		arrayProd2 = arrayProd2.reverse();

		arrayKWH = arrayKWH.reverse();
		arrayKWH2 = arrayKWH2.reverse();

		arrayKWHT = arrayKWHT.reverse();
		arrayKWHT2 = arrayKWHT2.reverse();

		oSeries1.push({
			name: 'kWh/t Cemento',
			visible : false,
			type: 'column',			
			yAxis: 0,
			color: '#FF7F50',
			data: arrayKWHT,
			tooltip: {				
			}			
		});

		oSeries2.push({
			name: 'kWh/t Crudo',
			visible : false,
			type: 'column',			
			yAxis: 0,
			color: '#51AD4B',
			data: arrayKWHT2,
			tooltip: {				
			}			
		});

		oSeries1.push({
			name: 'kWh Cemento',
			zIndex: 1,			
			type: 'spline',
			yAxis: 1,
			color: '#d4c311',			
			data: arrayKWH,
			visible: false,
			tooltip: {				
			}		
		});

		oSeries2.push({
			name: 'kWh Crudo',
			zIndex: 1,			
			type: 'spline',
			yAxis: 1,
			color: '#434348',			
			data: arrayKWH2,
			visible: false,
			tooltip: {				
			}		
		});


		oSeries1.push({
			name: 't/h Cemento',			
			type: 'spline',			
			yAxis: 2,
			zIndex: 2,
			color: '#176339',			
			data : jsonTH,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});

		oSeries2.push({
			name: 't/h Crudo',			
			type: 'spline',			
			yAxis: 2,
			zIndex: 2,
			color: '#434348',			
			data : jsonTH2,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});

		oSeries1.push({
			name: 'Prod. Cemento (t)',			
			type: 'column',
			yAxis: 3,
			color: '#7CB5EC',
			data: arrayProd,
			tooltip: {				
			}
		});

		oSeries2.push({
			name: 'Prod. Crudo (t)',			
			type: 'column',
			yAxis: 3,
			color: '#4169E1',
			data: arrayProd2,
			tooltip: {				
			}
		});

		
	}
	else {

		oSeries1.push({
			name: 'kWh/t',
			visible : false,
			type: 'column',			
			yAxis: 0,
			color: '#51AD4B',
			data: arrayKWHT,
			tooltip: {				
			}			
		});

		oSeries1.push({
			name: 'kWh',
			zIndex: 1,			
			type: 'spline',
			yAxis: 1,
			color: '#d4c311',			
			data: arrayKWH,
			visible: false,
			tooltip: {				
			}		
		});


		oSeries1.push({
			name: 't/h',			
			type: 'spline',			
			yAxis: 2,
			zIndex: 2,
			color: '#434348',			
			data : jsonTH,
			tooltip: {				
			},
			dataLabels:{enabled:true}
		});

		oSeries1.push({
			name: 'Producción (t)',			
			type: 'column',
			yAxis: 3,
			color: '#7CB5EC',
			data: arrayProd,
			tooltip: {				
			}
		});

		
	}



	var oyAxis1 = [];
	var oyAxis2 = [];

	

	

	if (arrayProd2.length>0){


		oyAxis1.push({
			title: {
				text: 'kWh/t Cemento',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});

		oyAxis2.push({
			title: {
				text: 'kWh/t Crudo',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});

		oyAxis1.push({
			title: {
				text: 'kWh Cemento',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});


		oyAxis2.push({
			title: {
				text: 'kWh Crudo',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});
			

		oyAxis1.push({
			title: {
				text: 't/h Cemento',
				style:{
					color: '#176339'
				}
			},
			labels: {	            
	            style: {
	                color: '#176339'
	            }
	    	},	

			//labels: true,
			plotLines: [{
	            color: '#F7A35C',
	            width: 2,
	            value: li,				
	           	label: {
	                text:  li,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#F7A35C',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:2
	    	},
	    	{
	            color: '#8F85E8',
	            width: 2,
	            value: ls,
	            label: {
	                text:  ls,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#8F85E8',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:2
	    	}]	

		});


		oyAxis2.push({
			title: {
				text: 't/h Crudo',
				style:{
					color: '#7cb5ec'
				}
			},
			labels: {	            
	            style: {
	                color: '#7cb5ec'
	            }
	    	},	
			//labels: true,
			plotLines: [{
	            color: '#F7A35C',
	            width: 2,
	            value: li2,				
	           	label: {
	                text:  li2,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#F7A35C',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	           	zIndex:5
	    	},
	    	{
	            color: '#8F85E8',
	            width: 2,
	            value: ls2,
	            label: {
	                text:  ls2,
	                verticalAlign: 'bottom',
	                textAlign: 'right',
	                style: {
	                    color: '#8F85E8',
	                    fontWeight: 'bold',
	                    fontSize: '11px',
	            	}
	            },
	            zIndex:5
	    	}]	
		});


		oyAxis1.push({
			title: {
				text: 'Prod. Cemento (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});

		oyAxis2.push({
			title: {
				text: 'Prod. Crudo (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});
		
	}
	else {

		oyAxis1.push({
			title: {
				text: 'kWh/t',
				style:{
					color: '#51AD4B'
				}
			},
			labels: {	            
	            style: {
	                color: '#51AD4B'
	            }
	    	},			
			opposite: true,
		});

		oyAxis1.push({
			title: {
				text: 'kWh',
				style:{
					color: '#d4c311'
				}
			},
			labels: {	            
	            style: {
	                color: '#d4c311'
	            }
	    	},	
		});


		oyAxis1.push({
		title: {
			text: 't/h',
			style:{
				color: '#7cb5ec'
			}
		},
		labels: {	            
            style: {
                color: '#7cb5ec'
            }
    	},	
		//labels: true,
		plotLines: [{
            color: '#F7A35C',
            width: 2,
            value: li,				
           	label: {
                text:  li,
                verticalAlign: 'bottom',
                textAlign: 'right',
                style: {
                    color: '#F7A35C',
                    fontWeight: 'bold',
                    fontSize: '11px',
            	}
            },
            zIndex:2
    	},
    	{
            color: '#8F85E8',
            width: 2,
            value: ls,
            label: {
                text:  ls,
                verticalAlign: 'bottom',
                textAlign: 'right',
                style: {
                    color: '#8F85E8',
                    fontWeight: 'bold',
                    fontSize: '11px',
            	}
            },
            zIndex:2
    	}]	
	});

		oyAxis1.push({
			title: {
				text: 'Producción (t)',				
				style:{
					color: '#000'
				},
				labels: {	            
		            style: {
		                color: '#000'
		            }
	        	},	
			},
		});
		



	}


	oChart1 = Highcharts.chart("chart_produccion1", Highcharts.merge(
	{	
		chart: {
			//renderTo: 'container',			
			height: 380,

			events: {
		        load: function() {
		          	var chart = this,
		            yAxis = chart.yAxis[3],
		            yExtremes = yAxis.getExtremes(),
		            newMin = yExtremes.dataMin,
		            newMax = yExtremes.dataMax;

		            if (newMin<0)
		            	newMin=0;
		            
		          	yAxis.setExtremes(newMin, newMax, true, false);
	        	}
      		}			
		},
		title: {
			text: 'Máquina: '+maquina
		},
		credits: {
			enabled: false
		},
		subtitle: {
			text: "Producción del ("+fechDesde+") al ("+fechAl+")"
		},
		xAxis: [{
			type: 'datetime'
		}],
		yAxis: oyAxis1,
		plotOptions: {
			series: {
				pointInterval: 86400000, // 1d
				pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,

				point: {
                	events: {
                  	click: function(e){
                  		                  		
                    	var seriesName = e.point.series.name;
                    	if(seriesName == "t/h" || seriesName == 't/h Cemento' || seriesName == 't/h Crudo') {
                    		var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                      	//MostrarModalProductos(dFechaLocal, maquina);
	                    }	  
	                    else if (seriesName == "kWh" || seriesName == "kWh Cemento" || seriesName == "kWh Crudo") {
	                    	var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                    	//MostrarModalEnergiaProductos(dFechaLocal, maquina);	                    	
	                    }
                      
                    }
                  }
                }
					
			}
		},
		tooltip: {
			shared: true
		},
		legend: {
			layout: 'vertical',
			align: 'left',
			x: -20,
			verticalAlign: 'top',
			y: -15,
			floating: true,
			backgroundColor:'rgba(255,255,255,0.5)'
		},
		series: oSeries1,

	},
	  ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);
	


	oChart2 = Highcharts.chart("chart_produccion2", Highcharts.merge(
	{		
		chart: {
			//renderTo: 'container',			
			height: 380,

			events: {
		        load: function() {
		          	var chart = this,
		            yAxis = chart.yAxis[3],
		            yExtremes = yAxis.getExtremes(),
		            newMin = yExtremes.dataMin,
		            newMax = yExtremes.dataMax;

		            if (newMin<0)
		            	newMin=0;
		            
		          	yAxis.setExtremes(newMin, newMax, true, false);
	        	}
      		}			
		},
		title: {
			text: 'Máquina: '+maquina
		},
		credits: {
			enabled: false
		},
		subtitle: {
			text: "Producción del ("+fechDesde+") al ("+fechAl+")"
		},
		xAxis: [{
			type: 'datetime'
		}],
		yAxis: oyAxis2,
		plotOptions: {
			series: {
				pointInterval: 86400000, // 1d
				pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,

				point: {
                	events: {
                  	click: function(e){
                  		                  		
                    	var seriesName = e.point.series.name;
                    	if(seriesName == "t/h" || seriesName == 't/h Cemento' || seriesName == 't/h Crudo') {
                    		var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                      	//MostrarModalProductos(dFechaLocal, maquina);
	                    }	  
	                    else if (seriesName == "kWh" || seriesName == "kWh Cemento" || seriesName == "kWh Crudo") {
	                    	var nFecha = e.point.category;
                  			var dFecha = new Date(nFecha);                  		                  		
                  			var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());                  		
                  		
	                    	//MostrarModalEnergiaProductos(dFechaLocal, maquina);
	                    	
	                    }
                      
                    }
                  }
                }
					
			}
		},
		tooltip: {
			shared: true
		},
		legend: {
			layout: 'vertical',
			align: 'left',
			x: -20,
			verticalAlign: 'top',
			y: -15,
			floating: true,
			backgroundColor:'rgba(255,255,255,0.5)'
		},
		series: oSeries2,

	},
	  ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
	)
	);


	Highcharts.setOptions({
	    lang: {
	        months: [
	            'Enero', 'Febrero', 'Marzo', 'Abril',
	            'Mayo', 'Junio', 'Julio', 'Agosto',
	            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	        ],
	        weekdays: [
	            'Domingo', 'Lunes', 'Martes', 'Miercoles',
	            'Jueves', 'Viernes', 'Sábado'
	        ]
	    }
	});
}

function cargarServiceRangoFechas(fechaService, maquina){
	
	var arrGral = [];
	var arrSpectrum = [];
	var horaFinAnterior="00:00:00";

	var horaFinDia="23:59:59"	

	var hoy = new Date();
	if (fechaService.substring(0,4)==hoy.getFullYear() && 
		parseInt(fechaService.substring(5,7))==hoy.getMonth()+1 && 
		parseInt(fechaService.substring(8,10))==hoy.getDate()){
		
		horaFinDia=hoy.getHours()+":"+hoy.getMinutes()+":"+hoy.getSeconds();
	}	
	
	$(function () {
		$.getJSON(ipService+"/Operaciones.svc/ListarEventosParadasPorDia?fecha="+fechaService+"&maquina="+maquina+"&origen=P",
			
		function (data) {
		
			$.each(data, function (key, val) {
				
				var fe = val.Fecha.split("/");
				var hi = val.HoraInicio.split(":");
				var hf = val.HoraFin.split(":");
				var tp;
				var colorRango;
				
					 if( val.TipoParada == "IM" ) { tp = 0; colorRango = colorChart.colorIM; }
				else if( val.TipoParada == "IE" ) { tp = 1; colorRango = colorChart.colorIE; }
				else if( val.TipoParada == "IO" ) { tp = 2; colorRango = colorChart.colorIO; }
				else if( val.TipoParada == "PP" ) { tp = 3; colorRango = colorChart.colorPP; }
				else if( val.TipoParada == "PC" ) { tp = 4; colorRango = colorChart.colorPC; }
				else if( val.TipoParada == "NC" ) { tp = 5; colorRango = colorChart.colorNC; }
				
					 if( val.CodigoParada == "" ) { val.CodigoParada = "No calificado"; }
					 
					 if( val.DescripcionParada == "" ) { val.DescripcionParada = "No calificado"; }
				
				arrGral.push(
					{
						x: Date.UTC( parseInt(fe[2]), parseInt(fe[1]-1), parseInt(fe[0]), parseInt(hi[0]), parseInt(hi[1]), parseInt(hi[2]) ),
						x2: Date.UTC( parseInt(fe[2]), parseInt(fe[1]-1), parseInt(fe[0]), parseInt(hf[0]), parseInt(hf[1]), parseInt(hf[2]) ),
						y: tp,
						color: colorRango,
						feStr: val.Fecha,
						hrIstr: val.HoraInicio,
						hrFstr: val.HoraFin,
						tipoParada: val.TipoParada,
						codParada: val.CodigoParada,
						descParada: val.DescripcionParada,
						comentario: val.Comentario
					}
				);


				if (horaFinAnterior!=val.HoraInicio){
					//rango de tiempo de maquina trabajando
					aHoraFinAnterior=horaFinAnterior.split(":");

					arrSpectrum.push({
						"category": "",
		  				"from": new Date(parseInt(fe[2]), parseInt(fe[1]-1),parseInt(fe[0]),aHoraFinAnterior[0], aHoraFinAnterior[1], aHoraFinAnterior[2]),
		  				"to": new Date(parseInt(fe[2]), parseInt(fe[1]-1),parseInt(fe[0]), parseInt(hi[0]), parseInt(hi[1]), parseInt(hi[2])),
		  				"color": am4core.color(colorChart["colorHT"])
					});
				}

				arrSpectrum.push({
					"category": "",
	  				"from": new Date(parseInt(fe[2]), parseInt(fe[1]-1),parseInt(fe[0]), parseInt(hi[0]), parseInt(hi[1]), parseInt(hi[2])),
	  				"to": new Date(parseInt(fe[2]), parseInt(fe[1]-1),parseInt(fe[0]), parseInt(hf[0]), parseInt(hf[1]), parseInt(hf[2])),
	  				"color": am4core.color(colorChart["color"+val.TipoParada])
				});

				horaFinAnterior=val.HoraFin;
					
			});


			if(horaFinAnterior!=horaFinDia){
				//rango de tiempo de maquina trabajando
				aHoraFinAnterior=horaFinAnterior.split(":");
				var aFecha =fechaService.split("-");

				aHoraFinDia=horaFinDia.split(":");

				arrSpectrum.push({
					"category": "",
	  				"from": new Date(parseInt(aFecha[0]), parseInt(aFecha[1]-1),parseInt(aFecha[2]),aHoraFinAnterior[0], aHoraFinAnterior[1], aHoraFinAnterior[2]),
	  				"to": new Date(parseInt(aFecha[0]), parseInt(aFecha[1]-1),parseInt(aFecha[2]), aHoraFinDia[0], aHoraFinDia[1], aHoraFinDia[2]),
	  				"color": am4core.color(colorChart["colorHT"])
				});
			}
					

			//cargarChartGants(fechaService, maquina, arrGral);
			cargarSpectrum(fechaService, maquina, arrSpectrum);
			console.log("Servicio Rango:::::"+ipService+"/Operaciones.svc/ListarEventosParadasPorDia?fecha="+fechaService+"&maquina="+maquina+"&origen=P");
			
			$("#u-load").addClass("ocultar");
		});
	});	
}

var chart;

function cargarSpectrum(feCha, maquina, arrSpectrum){

	am4core.ready(function() {

	// Themes begin
	

	am4core.useTheme(am4themes_dark);
	am4core.useTheme(am4themes_animated);


	// Themes end


	// Create chart instance
	chart = am4core.create("chart_spectrum", am4charts.XYChart);	

	
	

	// Add data
	chart.data = arrSpectrum;

	// Create axes
	var yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
	yAxis.dataFields.category = "category";
	yAxis.renderer.grid.template.disabled = true;
	yAxis.renderer.labels.template.disabled = true;

	var xAxis = chart.xAxes.push(new am4charts.DateAxis());
	xAxis.renderer.grid.template.disabled = true;
	xAxis.renderer.grid.template.disabled = true;
	xAxis.renderer.labels.template.disabled = true;
	xAxis.baseInterval = {
	  "timeUnit": "second",
	  "count": 1
	};

	
	//Configure axis tooltip 
	var axisTooltip = xAxis.tooltip;
	axisTooltip.background.fill = am4core.color("#07BEB8");
	axisTooltip.background.strokeWidth = 0;
	axisTooltip.background.cornerRadius = 3;
	axisTooltip.background.pointerLength = 0;
	axisTooltip.dy = 5;

	var dropShadow = new am4core.DropShadowFilter();
	dropShadow.dy = 1;
	dropShadow.dx = 1;
	dropShadow.opacity = 0.5;
	axisTooltip.filters.push(dropShadow);

	//Decorate axis tooltip content
	xAxis.adapter.add("getTooltipText", function(text, target) {
		console.log(target);
	  return ">>> [bold]" + text + "[/] <<<";
	});









	// Create series
	var series = chart.series.push(new am4charts.ColumnSeries());
	series.dataFields.dateX = "to";
	series.dataFields.openDateX = "from";
	series.dataFields.categoryY = "category";
	series.columns.template.propertyFields.fill = "color";
	series.columns.template.strokeOpacity = 0;
	series.columns.template.height = am4core.percent(100);

	series.columns.template.events.on("hit", function(ev) {
 		//console.log("clicked on ", ev.target); 		
 		var cMaquina = $("#cmb-maquina").val();
 		var cFecha = $("#fecha-reporte2").val();

		$(".contenedor-chart").addClass("d-none");
		$("#contenedor-tabla-paradas").removeClass("d-none");		
		$("#card-principal .card-title").text("Paradas");

 		cargarParadasDeMaquina(cFecha, cMaquina);
	}, this);

	/*
		series.tooltipText = `[bold]YEAR {categoryX}[/]
	----
	to: {to}
	from: {from}`;
	*/

	//series.tooltip.pointerOrientation = "vertical";





	// Ranges/labels
	chart.events.on("beforedatavalidated", function(ev) {
	  var data = chart.data;
	  for(var i = 0; i < data.length; i++) {
	    var range = xAxis.axisRanges.create();
	    range.date = data[i].from;
	    range.endDate = data[i].to;
	    //range.label.text = chart.dateFormatter.format(data[i].from, "HH:mm:ss");
	    range.label.text = chart.dateFormatter.format(data[i].from, "HH:mm");
	    range.label.horizontalCenter = "left";
	    range.label.paddingLeft = 0;

	    range.label.paddingTop = 5;

	    /*
	    if (i%2==0){
	    	range.label.paddingTop = 5;
	    }
	    else{
			range.label.paddingTop = 22;
	    }
	    */
	    

	    range.label.fontSize = 10;
	    range.grid.strokeOpacity = 0.2;
	    range.tick.length = 18;
	    range.tick.strokeOpacity = 0.2;

	    if ($("body").hasClass("dark-mode")){
	    	
	    }
	    else {
	    	range.label.fill = am4core.color("#434A54");	
	    }
	    
	  }
	});

	// Legend
	var legend = new am4charts.Legend();
	legend.parent = chart.chartContainer;
	legend.itemContainers.template.clickable = false;
	legend.itemContainers.template.focusable = false;
	legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
	legend.align = "right";

	var markerTemplate = legend.markers.template;
	markerTemplate.width = 12;
	markerTemplate.height = 12;

	legend.data = [{
	  "name": "Hor. trabajo",	  
	  "fill": am4core.color(colorChart["colorHT"]),	  
	}, {
	  "name": "Inc. mecánic." + (parseFloat($("#im-dia").text().substring(4))>0 ? " (" + parseFloat($("#im-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorIM"])
	}, {
	  "name": "Inc. eléct." + (parseFloat($("#ie-dia").text().substring(4))>0 ? " (" + parseFloat($("#ie-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorIE"])
	}, {
	  "name": "Inc. operat." + (parseFloat($("#io-dia").text().substring(4))>0 ? " (" + parseFloat($("#io-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorIO"])
	}, {
	  "name": "Par. program." + (parseFloat($("#pp-dia").text().substring(4))>0 ? " (" + parseFloat($("#pp-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorPP"])
	}, {
	  "name": "Par. circuns." + (parseFloat($("#pc-dia").text().substring(4))>0 ? " (" + parseFloat($("#pc-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorPC"])
	}, {
	  "name": "No calific." + (parseFloat($("#nc-dia").text().substring(4))>0 ? " (" + parseFloat($("#nc-dia").text().substring(4)) + " h)" : "" ),
	  "fill": am4core.color(colorChart["colorNC"])
	}];

	chart.cursor = new am4charts.XYCursor();


	if ($("body").hasClass("dark-mode")){
		chart.background.fill = '#2b3035';
		legend.valueLabels.template.fill = am4core.color("#444556"); 
		
	}
	else {
		
		chart.background.fill = '#fff';
		legend.labels.template.fill = am4core.color("#434A54");
		legend.valueLabels.template.fill = am4core.color("#434A54"); 
	}


	}); // end am4core.ready()

	//eliminamos marca	
	//$("g[aria-labelledby='id-651-title']").addClass("d-none");
	$("g[aria-labelledby^='id'][aria-labelledby$='title']").hide();
}


function cargarChartFiabilidad(fechaService, maquina, dias){
	
	var arrPorcFiab = [];		

	//oFiltrosFechaFiabilidad.mostrarSpinner();
	
	$(function () {
		$.getJSON(ipService+"/Operaciones.svc/ListarResumenHorasTrabajadasYParadasPorDias?fecha="+fechaService+"&maquina="+maquina+"&origen=P&dias=" + dias,
			
			function (data) {
				var minPorcFiab=0;
				var i=0;

				$.each(data, function (key, val) {
					var nPorcFiab = (val.PorcFiab*100).toFixed(2)*1; 

					if (i==0){
						minPorcFiab=nPorcFiab;
					}
					else {
						if (nPorcFiab<minPorcFiab)
							minPorcFiab=nPorcFiab;
					}

					arrPorcFiab.push(nPorcFiab);
					i++;
				});
								

				var fechaBase = restar_n_dias(fechaService, dias).split("-");
				var fechaBaseString = fechaBase[0]
				+"/"+agregar_cero((parseInt(fechaBase[1])+1))
				+"/"+fechaBase[2];
				var fechAl = formatearFecha_DD_MM_YYYY(fechaService, "-").replace(/-/gi,"/");
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(fechaService,dias), "-").replace(/-/gi,"/");
				

				/*---------Invertir arreglos---------*/
				arrPorcFiab = arrPorcFiab.reverse();				
				maquina = maquina.replace(/%20/gi, " ");
											
				
				oChartFiabilidad = Highcharts.chart("chart_fiabilidad", Highcharts.merge(
				{				
					chart: {			
						height: 380,
					},
					title: {
						text: 'Máquina: '+maquina
					},
					credits: {
						enabled: false
					},
					subtitle: {
						text: "Fiabilidad del ("+fechDesde+") al ("+fechAl+")"
					},
					xAxis: [{
						type: 'datetime'
					}],
					yAxis: [{
						title: {
							text: 'Fiabilidad (%)',				
							style:{
								color: '#7CB5EC'
							}
						},
						//labels: false,
						min: minPorcFiab,
					}],
					plotOptions: {
						series: {
							pointInterval: 86400000, // 1d
							pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,
								
						}
					},
					tooltip: {
						shared: true
					},
					legend: {
						layout: 'vertical',
						align: 'left',
						x: -20,
						verticalAlign: 'top',
						y: -15,
						floating: true,
						backgroundColor:'rgba(255,255,255,0.5)'
					},
					series: [{			
						name: 'Fiabilidad (%)',
						type: 'area',
						yAxis: 0,
						/*color: '#7cb5ec',*/
						color: {
							linearGradient : {x1:0, y1:0, x2:0, y2:1 },
							stops: [
								[0, '#7cb5ec'],
								[1, '#f4f4f4']
							]
						},
						data: arrPorcFiab,
						tooltip: {
							//valueSuffix: ' t'
						},
						dataLabels:{enabled:true}
					}]
				},				
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)
				);
				
				Highcharts.setOptions({
				    lang: {
				        months: [
				            'Enero', 'Febrero', 'Marzo', 'Abril',
				            'Mayo', 'Junio', 'Julio', 'Agosto',
				            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
				        ],
				        weekdays: [
				            'Domingo', 'Lunes', 'Martes', 'Miercoles',
				            'Jueves', 'Viernes', 'Sábado'
				        ]
				    }
				});

				//oFiltrosFechaFiabilidad.ocultarSpinner();






			});
	});
	
	console.log("Servicio chart fiabilidad:::::"+ipService+"/Operaciones.svc/ListarResumenHorasTrabajadasYParadasPorDias?fecha="+fechaService+"&maquina="+maquina+"&origen=P&dias="+dias);	

}


function cargarTablaEnergia (fecha, maquina){

	var dFechaMil = Date.parse(fecha);
	var dFecha = new Date(dFechaMil);
	var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());  

	var cFechaClasico = obtener_cadena_fecha_clasico(dFechaLocal);
	var cFechaEstandar = fecha;

 	//RESUMEN
    var titulo = "Detalle por producto";        
          
    $("#contenedor-tabla-energia .titulo-contenedor").text("Máquina: " + maquina);
    $("#contenedor-tabla-energia .subtitulo-contenedor").text("Energía del " + cFechaClasico + "");

	var tr1 = "";

    $.ajax({ 
		url: ipService+"/Operaciones.svc/ListarEnergiaProduccionProductoPorMaquina?fecha="+cFechaEstandar+"&maquina="+maquina, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-energia-produccion-productos").empty();			
			tr1="";
			i=0;

			//seteamos bandera en gris por default
			$("#card-energia-dia .ribbon-box").css("background-color","#909090");
			$("#mis-estilos3").empty();
			$("#mis-estilos3").html("#card-energia-dia .ribbon .ribbon-box:before { border-color: " + "#909090" + " !important; border-right-color: transparent !important;}");
   		},
		success: function(data){

			$.each(data, function (key, val) {

				if (!(val.CNT_KWH==0 && val.CNT_TONELADAS==0 && val.CNT_KWHT==0)){
					
					tr1 = tr1 + "<tr>";
					tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
					tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_KWH) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_KWHT.toFixed(2) + "</td>";

					var ClaseSemaforoTotal="";
					if (val.COD_GRUPO=="TOTAL"){
						ClaseSemaforoTotal="semaforo-total";
					}

					if (val.CNT_KWHT_LI==0 && val.CNT_KWHT_LS==0){
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
					}
					else if (val.CNT_KWHT<val.CNT_KWHT_LI)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle " + ClaseSemaforoTotal + "' style='color:red;'></i>" + "</td>";
					else if (val.CNT_KWHT>val.CNT_KWHT_LS)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle " + ClaseSemaforoTotal + "' style='color:green;'></i>" + "</td>";
					else
						tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle " + ClaseSemaforoTotal + "' style='color:#909090;'></i>" + "</td>";

					tr1 = tr1 + "	<td class='text-center'>";
					tr1 = tr1 + "		<span class='spark spark-energia' id='spark-energia-" + val.COD_GRUPO_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") + "'>Cargando..</span>";					
					tr1 = tr1 + "   </td>"

					
					tr1 = tr1 + "</tr>";				

					i++;	
				}
				
			});	


		},
		complete: function(){
			//cargamos tabla produccion por productos			
			$("#cuerpo-tabla-energia-produccion-productos").html(tr1);

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$("#tabla-energia-produccion-productos td").css("font-size",prefTamanofuente);

			//seteamos color de bandera superior de energia
			var color = $("#cuerpo-tabla-energia-produccion-productos .semaforo-total").css("color");
			$("#card-energia-dia .ribbon-box").css("background-color",color);
			$("#mis-estilos3").empty();
			$("#mis-estilos3").html("#card-energia-dia .ribbon .ribbon-box:before { border-color: " + color + " !important; border-right-color: transparent !important;}");


			//evento click para los sparklines de energia
			$(".spark-energia").off("click");
			$(".spark-energia").on("click", function(){				
				
				mostrarModal("oModalRendimientoEnergia")
				$("#lblTituloModalRendimientoEnergia").text("Consumo Específico");

				var li=0;
				var ls=0;
				var numItem=0;
				var minKWHT=0;
				var maxKWHT=0;

				var dataEnergiaProducto = oDataInfoEnergiaProductos.filter( element => element.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") ==this.id.replace(/spark-energia-/gi, ""));
				var dataEnergiaProductoChart = [];				

				var oSeries = [];
				var oSerie = new Object();
				oSerie.name="";				

				if(dataEnergiaProducto!=null){
					if (dataEnergiaProducto.length>0){
						oSerie.name=dataEnergiaProducto[0].COD_PRODUCTO;
						//oSerie.color=colores[dataEnergiaProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];

						if($("body").hasClass("dark-mode")) {							
							oSerie.color=colores_dark[dataEnergiaProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}
						else {							
							oSerie.color=colores[dataEnergiaProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}

						li = dataEnergiaProducto[0].CNT_KWHT_LI;
						ls = dataEnergiaProducto[0].CNT_KWHT_LS;

						$("#lblTituloModalRendimientoEnergia").text("Consumo Específico " + dataEnergiaProducto[0].COD_MAQUINA + " - " + dataEnergiaProducto[0].COD_PRODUCTO);
					}
				}
							

				oSerie.data =[];	    		
	    		
				for (j=0;j<dataEnergiaProducto.length;j++){

					valorKWHT = dataEnergiaProducto[j].CNT_KWHT.toFixed(2)*1;					
					oSerie.data.push(valorKWHT);					

					if (numItem==1){
						minKWHT=valorKWHT;
						maxKWHT=valorKWHT;
					}
					else {

						if (minKWHT==0 && valorKWHT!=0)
							minKWHT=valorKWHT;

						if (maxKWHT==0 && valorKWHT!=0)
							maxKWHT=valorKWHT;

						if(valorKWHT<minKWHT && valorKWHT!=0)
							minKWHT=valorKWHT;	

						if(valorKWHT>maxKWHT && valorKWHT!=0)
							maxKWHT=valorKWHT;	
					}	

					li=dataEnergiaProducto[j].CNT_KWHT_LI;
					ls=dataEnergiaProducto[j].CNT_KWHT_LS;				
				}

				oSeries.push(oSerie);

				if (li<minKWHT)
					minKWHT=li;

				if(ls>maxKWHT)
					maxKWHT=ls;
			
				var dif = (maxKWHT-minKWHT)/6;
				minKWHT = minKWHT - dif;
				if (minKWHT<0)
					minKWHT=0;
				maxKWHT = maxKWHT + dif;


				var fechaBase = restar_n_dias(cFechaEstandar, 15).split("-");				
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,15), "-").replace(/-/gi,"/");


				//grafico de lineas
				var oChartRendEnergiaDet = Highcharts.chart('chart-rendimiento-energia', Highcharts.merge(

				{
			    title: {
			        text: 'Consumo Específico (Kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'Kwh/t'
			        },
			        min: minKWHT,
        			max: maxKWHT,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			        
			    },
			    xAxis: [{
						type: 'datetime',
						labels: {
				            style: {
				                color: '#dcdcdf'
				            }
				        }
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)
				);	



				//grafico de columnas
				var oChartRendEnergiaDetCol = Highcharts.chart('chart-rendimiento-energia-col', Highcharts.merge(

				{
				chart: {
					type: "column"
				},
			    title: {
			        text: 'Consumo Específico (Kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'Kwh/t'
			        },
			        min: minKWHT,
        			max: maxKWHT,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			        
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)
				);	




				//grafico de area
				var oChartRendEnergiaDetArea = Highcharts.chart('chart-rendimiento-energia-area', Highcharts.merge(
				{
				chart: {
					type: "area"
				},
			    title: {
			        text: 'Consumo Específico (Kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'Kwh/t'
			        },
			        min: minKWHT,
        			max: maxKWHT,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			        
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)
				);	
			});

			
			//generamos datos para los sparklines de energia
			$.ajax({ 
				url: ipService+"/Operaciones.svc/ListarEnergiaProduccionProductoPorMaquinaDiario?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias=15", 
				dataType: 'json', 
				data: null, 
				async: false, 
				beforeSend: function(){	     						
					
		   		},
				success: function(data){
					
					//guardamos la data en una variable global para usarla en generacion de sparkline					
					oDataInfoEnergiaProductos=data;

					//obtenemos un distinc de los productos que existen en el rango de dias
					var oProductos = data.distinct('COD_PRODUCTO');

					for (i=0;i<oProductos.length;i++){
													
						var dataProducto = data.filter( element => element.COD_PRODUCTO ==oProductos[i]);
						var valoresSpark = [];						
			    		
						for (j=0;j<dataProducto.length;j++){														
							valoresSpark.push(dataProducto[j].CNT_KWHT.toFixed(2)*1);
						}
						
						//aprovechamos para generar los sparklines				
						var spark = $("#spark-energia-"+oProductos[i].replace(/ /gi, "").replace(/\./gi, ""));
						spark.sparkline(valoresSpark, {type: 'bar', barColor: colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")], disableTooltips: true} );
						
					}																			
				},
				complete: function(){
					
				}
			});


		}
	});


}


function cargarTablaRendimiento (fecha, maquina){	

	var dFechaMil = Date.parse(fecha);
	var dFecha = new Date(dFechaMil);
	var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());  

	var cFechaClasico = obtener_cadena_fecha_clasico(dFechaLocal);
	var cFechaEstandar = fecha;

 	//RESUMEN
    var titulo = "Detalle por producto";        
          
    $("#contenedor-tabla-rendimiento .titulo-contenedor").text("Máquina: " + maquina);
    $("#contenedor-tabla-rendimiento .subtitulo-contenedor").text("Producción del " + cFechaClasico + "");

    var oData = [];		
	var cCadena = '[';	
	var i=0;

	var oData1 = [];
	var cCadena1 = '[';	

	var oData2 = [];
	var cCadena2 = '[';	

	var oData3 = [];
	var cCadena3 = '[';	

	var tr1 = "";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquina?fecha="+cFechaEstandar+"&maquina="+maquina, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-produccion-productos").empty();
			$("#rendimiento-dia").text("0 t/h");
			oData=[];
			oData1=[];
			oData2=[];
			oData3=[];

			cCadena = '[';
			cCadena1 = '[';
			cCadena2 = '[';
			cCadena3 = '[';

			tr1="";
			i=0;
   		},
		success: function(data){

			$.each(data, function (key, val) {

				if (!(val.CNT_TH==0 && val.CNT_TONELADAS==0 && val.CNT_HORAS==0)){
					if(i==0)
						cCadena = cCadena + '{';
					else
						cCadena = cCadena + ',{';

					cCadena = cCadena + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena = cCadena + '"data":['+val.CNT_TH+','+val.CNT_TONELADAS+','+val.CNT_HORAS+']';
					cCadena = cCadena + '}';


					if(i==0)
						cCadena1 = cCadena1 + '{';
					else
						cCadena1 = cCadena1 + ',{';

					cCadena1 = cCadena1 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena1 = cCadena1 + '"data":['+val.CNT_TH+']';
					cCadena1 = cCadena1 + '}';				


					if(i==0)
						cCadena2 = cCadena2 + '{';
					else
						cCadena2 = cCadena2 + ',{';

					cCadena2 = cCadena2 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena2 = cCadena2 + '"data":['+val.CNT_TONELADAS+']';
					cCadena2 = cCadena2 + '}';				


					if(i==0)
						cCadena3 = cCadena3 + '{';
					else
						cCadena3 = cCadena3 + ',{';

					cCadena3 = cCadena3 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena3 = cCadena3 + '"data":['+val.CNT_HORAS+']';
					cCadena3 = cCadena3 + '}';	


					tr1 = tr1 + "<tr>";
					tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
					tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_HORAS + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_TH.toFixed(0) + "</td>";

/*
					if (val.CNT_TH<val.CNT_TH_LI)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:red;'></i>" + "</td>";
					else if (val.CNT_TH>val.CNT_TH_LS)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:green;'></i>" + "</td>";
					else
						tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle' style='color:#909090;'></i>" + "</td>";
*/

					tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle' style='color:" + val.DSC_COLOR_TH +  ";'></i>" + "</td>";

					tr1 = tr1 + "	<td class='text-center'>";
					tr1 = tr1 + "		<span class='spark spark-produccion' id='spark-" + val.COD_GRUPO_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") + "'>Cargando..</span>";					
					tr1 = tr1 + "   </td>"

					tr1 = tr1 + "</tr>";	

					//seteamos color del card del indicador superior de rendimiento
					if(val.COD_GRUPO=="TOTAL"){	
						$("#card-rendimiento-dia .ribbon-box").css("background-color",val.DSC_COLOR_TH);

						$("#mis-estilos").empty();
						$("#mis-estilos").html("#card-rendimiento-dia .ribbon .ribbon-box:before { border-color: " + val.DSC_COLOR_TH + " !important; border-right-color: transparent !important;}");
						
						$("#rendimiento-dia").text(formatearNumero(val.CNT_TH,0) + " t/h");
/*
						$("#card-rendimiento-dia .ribbon-box").removeClass("obj-gris");
						$("#card-rendimiento-dia .ribbon-box").removeClass("obj-rojo");
						$("#card-rendimiento-dia .ribbon-box").removeClass("obj-verde");

						if (val.CNT_TH<val.CNT_TH_LI) {
							$("#card-rendimiento-dia .ribbon-box").addClass("obj-rojo");
						}
						else if (val.CNT_TH>val.CNT_TH_LS) {
							$("#card-rendimiento-dia .ribbon-box").addClass("obj-verde");
						}
						else {
							$("#card-rendimiento-dia .ribbon-box").addClass("obj-gris");	
						}
						*/
					}

					i++;	
				}
				
			});	


		},
		complete: function(){
			cCadena = cCadena + "]"		
			oData=JSON.parse(cCadena);	

			cCadena1 = cCadena1 + "]"		
			oData1=JSON.parse(cCadena1);	

			cCadena2 = cCadena2 + "]"		
			oData2=JSON.parse(cCadena2);	

			cCadena3 = cCadena3 + "]"		
			oData3=JSON.parse(cCadena3);	
			
			//cargamos tabla produccion por productos
			$(tr1).appendTo("#cuerpo-tabla-produccion-productos");

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$("#tabla-produccion-productos td, #tabla-produccion-productos th").css("font-size",prefTamanofuente);
		
			//agregamos evento para ver seccion detalle del producto
			$(".ver-detalle-producto").off("click");
			$(".ver-detalle-producto").on("click", function(){
				//alert($(this).attr("data-producto"));

				var CodProductoSel = $(this).attr("data-producto");

				if($(".contenedor-detalle-produccion").hasClass("show")){
					$(".contenedor-detalle-produccion").removeClass("show");
				}
				else {
					$(".contenedor-detalle-produccion").addClass("show");	

					$("#tabs-productos .nav-link.active").removeClass("active");
					$("#tabs-productos-cuerpo .tab-pane.active").removeClass("active");

					$("#tabs-productos #tab-"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("show");
				}
				
				

			});

			//agregamos evento click al sparkline para ver modal detalle
			$(".spark-produccion").off("click");
			$(".spark-produccion").on("click", function(){				
				//$("#oModalRendimiento").modal();
				mostrarModal("oModalRendimiento")
				$("#lblTituloModalRendimiento").text("Rendimiento")

				var dataProducto = oDataInfoProductos.filter( element => element.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")==this.id.replace(/spark-/gi, ""));
				var dataProductoChart = [];				

				var oSeries = [];
				var oSerie = new Object();
				oSerie.name="";				

				if(dataProducto!=null){
					if (dataProducto.length>0){
						oSerie.name=dataProducto[0].COD_PRODUCTO;						

						if($("body").hasClass("dark-mode")) {							
							oSerie.color=colores_dark[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}
						else {							
							oSerie.color=colores[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}


						$("#lblTituloModalRendimiento").text("Rendimiento " + dataProducto[0].COD_MAQUINA + " - " + dataProducto[0].COD_PRODUCTO);
					}
				}
				
				var li=0;
				var ls=0;
				var minTH=0;
				var maxTH=0;
				var numItem=0;
				var valorTH=0;

	    		oSerie.data =[];	    		
	    		
				for (j=0;j<dataProducto.length;j++){
					numItem=numItem+1;

					valorTH = dataProducto[j].CNT_TH.toFixed(0)*1;
					oSerie.data.push(valorTH);
					
					if (numItem==1){
						minTH=valorTH;
						maxTH=valorTH;
					}
					else {

						if (minTH==0 && valorTH!=0)
							minTH=valorTH;

						if (maxTH==0 && valorTH!=0)
							maxTH=valorTH;

						if(valorTH<minTH && valorTH!=0)
							minTH=valorTH;	

						if(valorTH>maxTH && valorTH!=0)
							maxTH=valorTH;	
					}

					li=dataProducto[j].CNT_TH_LI;
					ls=dataProducto[j].CNT_TH_LS;
				}

				oSeries.push(oSerie);

				if (li<minTH)
					minTH=li;

				if(ls>maxTH)
					maxTH=ls;
			
				var dif = (maxTH-minTH)/6;
				minTH = minTH - dif;
				if (minTH<0)
					minTH=0;
				maxTH = maxTH + dif;






				var fechaBase = restar_n_dias(cFechaEstandar, 15).split("-");				
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,15), "-").replace(/-/gi,"/");

				//grafico de lineas
				var oChartRendDet = Highcharts.chart('chart-rendimiento', Highcharts.merge(

				{
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime',
						labels: {
				            style: {
				                color: '#dcdcdf'
				            }
				        }
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,				
				( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	



				//grafico de columnas
				var oChartRendDetCol = Highcharts.chart('chart-rendimiento-col', Highcharts.merge(

				{
				chart: {
					type: "column"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	




				//grafico de area
				var oChartRendDetArea = Highcharts.chart('chart-rendimiento-area', Highcharts.merge(

				{
				chart: {
					type: "area"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	







			})

		}
	});
	

	//DETALLE
	var tab = "";
	var tabCuerpo="";
	var oSeries=[];

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquinaDiario?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias=15", 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			tab = "";
			tabCuerpo=""	
     		$("#tabs-productos").empty();
			$("#tabs-productos-cuerpo").empty();
			oSeries=[];
   		},
		success: function(data){

			oDataInfoProductos=data;

			//generamos tabs

			//obtenemos un distinc de los productos que existen en el rango de dias
			var oProductos = data.distinct('COD_PRODUCTO');

			for (i=0;i<oProductos.length;i++){

				var activo="";
				if (i==0)
					activo="active";

				tab = tab + '<li class="nav-item" role="presentation">';
				tab = tab + '   <a class="nav-link ' + activo + '" id="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" data-toggle="tab" href="#' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tab" aria-controls="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" aria-selected="true" style="background-color:' + colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")] + '69">' + oProductos[i] + '</a>';
				tab = tab + '</li>'

				tabCuerpo = tabCuerpo + '<div class="tab-pane fade show ' + activo + '" id="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tabpanel" aria-labelledby="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '">';
				tabCuerpo = tabCuerpo + '   <table class="table table-striped table-hover table-sm table-dark">';
				tabCuerpo = tabCuerpo + '      <thead class="thead-dark">';
				tabCuerpo = tabCuerpo + '         <tr>';
				tabCuerpo = tabCuerpo + '	         <th scope="col">Fecha</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">Horas</th>';
				tabCuerpo = tabCuerpo + '		     <th scope="col"  class="text-right">Producción(t)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col"  class="text-right">Rendimiento(t/h)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LI</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LS</th>';				
				tabCuerpo = tabCuerpo + '  	      </tr>';
				tabCuerpo = tabCuerpo + '  	   </thead>';
				tabCuerpo = tabCuerpo + '  	   <tbody>';
			
				var dataProducto = data.filter( element => element.COD_PRODUCTO ==oProductos[i]);
				var valoresSpark = [];

				var oSerie = new Object();
	    		oSerie.name=oProductos[i];
	    		oSerie.color=colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
	    		//oSerie.data =[1,2,3,5,2,5,2,5,3,4,3,5,4,4,5];	    
	    		oSerie.data =[];
	    		
				for (j=0;j<dataProducto.length;j++){
					tabCuerpo = tabCuerpo + '<tr>';
					tabCuerpo = tabCuerpo + '   <td>'+dataProducto[j].FCH_PRODUCCION+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_HORAS+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+addCommas(dataProducto[j].CNT_TONELADAS)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LI.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LS.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '</tr>';

					valoresSpark.push(dataProducto[j].CNT_TH.toFixed(0)*1);
					oSerie.data.push(dataProducto[j].CNT_TH.toFixed(0)*1);
				}

				oSeries.push(oSerie);

				tabCuerpo = tabCuerpo + '  	   </tbody>';
				tabCuerpo = tabCuerpo + '  	</table>';					
				tabCuerpo = tabCuerpo + '</div>';


				//aprovechamos para generar los sparklines				
				var spark = $("#spark-"+oProductos[i].replace(/ /gi, "").replace(/\./gi, ""));

				var color = "";
				if($("body").hasClass("dark-mode")) {
					color = colores_dark[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}
				else {
					color = colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}

				spark.sparkline(valoresSpark, {type: 'bar', barColor: color, disableTooltips: true} );
				
			}
			
			
			
			
		},
		complete: function(){
			$(tab).appendTo("#tabs-productos");
			$(tabCuerpo).appendTo("#tabs-productos-cuerpo");
		}
	});
}


function cargarTablaRendimientoSumarizado (fecha, maquina, dias){	

	var dFechaMil = Date.parse(fecha);
	var dFecha = new Date(dFechaMil);
	var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());  

	var cFechaClasico = obtener_cadena_fecha_clasico(dFechaLocal);
	var cFechaEstandar = fecha;

	var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,dias), "-").replace(/-/gi,"/");

 	//RESUMEN
    var titulo = "Detalle por producto";        
    var subtitulo = "Producción del " + fechDesde + " al " + cFechaClasico;
          
    $("#contenedor-tabla-rendimiento .titulo-contenedor").text("Máquina: " + maquina);
    $("#contenedor-tabla-rendimiento .subtitulo-contenedor-rango").text(subtitulo);

    var oData = [];		
	var cCadena = '[';	
	var i=0;

	var oData1 = [];
	var cCadena1 = '[';	

	var oData2 = [];
	var cCadena2 = '[';	

	var oData3 = [];
	var cCadena3 = '[';	

	var tr1 = "";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquinaSumarizado?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias="+dias, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-produccion-productos-sumarizado").empty();
			oData=[];
			oData1=[];
			oData2=[];
			oData3=[];

			cCadena = '[';
			cCadena1 = '[';
			cCadena2 = '[';
			cCadena3 = '[';

			tr1="";
			i=0;
   		},
		success: function(data){

			$.each(data, function (key, val) {

				if (!(val.CNT_TH==0 && val.CNT_TONELADAS==0 && val.CNT_HORAS==0)){
					if(i==0)
						cCadena = cCadena + '{';
					else
						cCadena = cCadena + ',{';

					cCadena = cCadena + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena = cCadena + '"data":['+val.CNT_TH+','+val.CNT_TONELADAS+','+val.CNT_HORAS+']';
					cCadena = cCadena + '}';


					if(i==0)
						cCadena1 = cCadena1 + '{';
					else
						cCadena1 = cCadena1 + ',{';

					cCadena1 = cCadena1 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena1 = cCadena1 + '"data":['+val.CNT_TH+']';
					cCadena1 = cCadena1 + '}';				


					if(i==0)
						cCadena2 = cCadena2 + '{';
					else
						cCadena2 = cCadena2 + ',{';

					cCadena2 = cCadena2 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena2 = cCadena2 + '"data":['+val.CNT_TONELADAS+']';
					cCadena2 = cCadena2 + '}';				


					if(i==0)
						cCadena3 = cCadena3 + '{';
					else
						cCadena3 = cCadena3 + ',{';

					cCadena3 = cCadena3 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena3 = cCadena3 + '"data":['+val.CNT_HORAS+']';
					cCadena3 = cCadena3 + '}';	


					tr1 = tr1 + "<tr>";
					tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
					tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_HORAS + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_TH.toFixed(0) + "</td>";

					if (val.CNT_TH_LI==0 && val.CNT_TH_LS==0){
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
					}
					else if (val.CNT_TH<val.CNT_TH_LI)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:red;'></i>" + "</td>";
					else if (val.CNT_TH>val.CNT_TH_LS)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:green;'></i>" + "</td>";
					else
						tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle' style='color:#909090;'></i>" + "</td>";

					tr1 = tr1 + "	<td class='text-center'>";
					tr1 = tr1 + "		<span class='spark spark-produccion-sumarizado' id='spark-sumarizado-" + val.COD_GRUPO_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") + "'>Cargando..</span>";					
					tr1 = tr1 + "   </td>"

					if (val.COD_GRUPO=="TOTAL"){
						tr1 = tr1 + "   <td><i class='fas fa-table ver-produccion-productos-detalle' data-grupo='TOTAL' data-producto='TOTAL'></i></td>"	
					}
					else {
						tr1 = tr1 + "   <td><i class='fas fa-table ver-produccion-productos-detalle' data-grupo='" + val.COD_GRUPO + "' data-producto='" + val.COD_PRODUCTO + "'></i></td>"	
					}					

					tr1 = tr1 + "</tr>";				

					i++;	
				}
				
			});	


		},
		complete: function(){
			cCadena = cCadena + "]"		
			oData=JSON.parse(cCadena);	

			cCadena1 = cCadena1 + "]"		
			oData1=JSON.parse(cCadena1);	

			cCadena2 = cCadena2 + "]"		
			oData2=JSON.parse(cCadena2);	

			cCadena3 = cCadena3 + "]"		
			oData3=JSON.parse(cCadena3);	
			
			//cargamos tabla produccion por productos
			$(tr1).appendTo("#cuerpo-tabla-produccion-productos-sumarizado");

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$("#tabla-produccion-productos-sumarizado td").css("font-size",prefTamanofuente);


			//agregamos evento para ver seccion detalle del producto
			$(".ver-detalle-producto").off("click");
			$(".ver-detalle-producto").on("click", function(){				

				var CodProductoSel = $(this).attr("data-producto");

				if($(".contenedor-detalle-produccion").hasClass("show")){
					$(".contenedor-detalle-produccion").removeClass("show");
				}
				else {
					$(".contenedor-detalle-produccion").addClass("show");	

					$("#tabs-productos .nav-link.active").removeClass("active");
					$("#tabs-productos-cuerpo .tab-pane.active").removeClass("active");

					$("#tabs-productos #tab-"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("show");
				}
			});

			//agregamos evento click al sparkline para ver modal detalle
			$(".spark-produccion-sumarizado").off("click");
			$(".spark-produccion-sumarizado").on("click", function(){				
				
				mostrarModal("oModalRendimientoSumarizado")
				$("#lblTituloModalRendimientoSumarizado").text("Rendimiento")

				console.log(oDataInfoProductosSumarizado);
				var dataProducto = oDataInfoProductosSumarizado.filter( element => element.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")==this.id.replace(/spark-sumarizado-/gi, ""));
				var dataProductoChart = [];				

				var oSeries = [];
				var oSerie = new Object();
				oSerie.name="";				

				if(dataProducto!=null){
					if (dataProducto.length>0){
						oSerie.name=dataProducto[0].COD_PRODUCTO;

						if($("body").hasClass("dark-mode")) {							
							oSerie.color=colores_dark[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}
						else {							
							oSerie.color=colores[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}

						

						$("#lblTituloModalRendimientoSumarizado").text("Rendimiento " + dataProducto[0].COD_MAQUINA + " - " + dataProducto[0].COD_PRODUCTO);
					}
				}
				
				var li=0;
				var ls=0;
				var minTH=0;
				var maxTH=0;
				var numItem=0;
				var valorTH=0;

	    		oSerie.data =[];	    		
	    		
				for (j=0;j<dataProducto.length;j++){
					numItem=numItem+1;

					valorTH = dataProducto[j].CNT_TH.toFixed(0)*1;
					oSerie.data.push(valorTH);
					
					if (numItem==1){
						minTH=valorTH;
						maxTH=valorTH;
					}
					else {

						if (minTH==0 && valorTH!=0)
							minTH=valorTH;

						if (maxTH==0 && valorTH!=0)
							maxTH=valorTH;

						if(valorTH<minTH && valorTH!=0)
							minTH=valorTH;	

						if(valorTH>maxTH && valorTH!=0)
							maxTH=valorTH;	
					}

					li=dataProducto[j].CNT_TH_LI;
					ls=dataProducto[j].CNT_TH_LS;
				}

				oSeries.push(oSerie);

				if (li<minTH)
					minTH=li;

				if(ls>maxTH)
					maxTH=ls;
			
				var dif = (maxTH-minTH)/6;
				minTH = minTH - dif;
				if (minTH<0)
					minTH=0;
				maxTH = maxTH + dif;






				var fechaBase = restar_n_dias(cFechaEstandar, dias).split("-");				
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,dias), "-").replace(/-/gi,"/");

				//grafico de lineas
				var oChartRendDet = Highcharts.chart('chart-rendimiento-sumarizado', Highcharts.merge(

				{
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime',
						labels: {
				            style: {
				                color: '#dcdcdf'
				            }
				        }
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	



				//grafico de columnas
				var oChartRendDetCol = Highcharts.chart('chart-rendimiento-sumarizado-col', Highcharts.merge(

				{
				chart: {
					type: "column"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	




				//grafico de area
				var oChartRendDetArea = Highcharts.chart('chart-rendimiento-sumarizado-area', Highcharts.merge(

				{
				chart: {
					type: "area"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	
			});

			//ver modal con tabla detalle
			$("#cuerpo-tabla-produccion-productos-sumarizado .ver-produccion-productos-detalle").off("click");
			$("#cuerpo-tabla-produccion-productos-sumarizado .ver-produccion-productos-detalle").on("click", function(){				
				$("#lblTituloModalProduccionProductoPorMaquinaDetalle").text(subtitulo);
				mostrarModal("oModalProduccionProductoPorMaquinaDetalle");

				var grupo = $(this).attr("data-grupo");
				var producto = $(this).attr("data-producto");
				cargarProduccionProductosDetalle(fecha, maquina, dias, grupo, producto);				
			});

		}
	});
	

	//DETALLE
	var tab = "";
	var tabCuerpo="";
	var oSeries=[];

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquinaDiario?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias="+dias, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			tab = "";
			tabCuerpo=""	
     		$("#tabs-productos").empty();
			$("#tabs-productos-cuerpo").empty();
			oSeries=[];
   		},
		success: function(data){

			oDataInfoProductosSumarizado=data;

			//generamos tabs

			//obtenemos un distinc de los productos que existen en el rango de dias
			var oProductos = data.distinct('COD_PRODUCTO');

			for (i=0;i<oProductos.length;i++){

				var activo="";
				if (i==0)
					activo="active";

				tab = tab + '<li class="nav-item" role="presentation">';
				tab = tab + '   <a class="nav-link ' + activo + '" id="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" data-toggle="tab" href="#' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tab" aria-controls="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" aria-selected="true" style="background-color:' + colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")] + '69">' + oProductos[i] + '</a>';
				tab = tab + '</li>'

				tabCuerpo = tabCuerpo + '<div class="tab-pane fade show ' + activo + '" id="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tabpanel" aria-labelledby="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '">';
				tabCuerpo = tabCuerpo + '   <table class="table table-striped table-hover table-sm table-dark">';
				tabCuerpo = tabCuerpo + '      <thead class="thead-dark">';
				tabCuerpo = tabCuerpo + '         <tr>';
				tabCuerpo = tabCuerpo + '	         <th scope="col">Fecha</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">Horas</th>';
				tabCuerpo = tabCuerpo + '		     <th scope="col"  class="text-right">Producción(t)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col"  class="text-right">Rendimiento(t/h)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LI</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LS</th>';				
				tabCuerpo = tabCuerpo + '  	      </tr>';
				tabCuerpo = tabCuerpo + '  	   </thead>';
				tabCuerpo = tabCuerpo + '  	   <tbody>';
			
				var dataProducto = data.filter( element => element.COD_PRODUCTO ==oProductos[i]);
				var valoresSpark = [];

				var oSerie = new Object();
	    		oSerie.name=oProductos[i];
	    		oSerie.color=colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
	    		//oSerie.data =[1,2,3,5,2,5,2,5,3,4,3,5,4,4,5];	    
	    		oSerie.data =[];
	    		
				for (j=0;j<dataProducto.length;j++){
					tabCuerpo = tabCuerpo + '<tr>';
					tabCuerpo = tabCuerpo + '   <td>'+dataProducto[j].FCH_PRODUCCION+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_HORAS+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+addCommas(dataProducto[j].CNT_TONELADAS)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LI.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LS.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '</tr>';

					valoresSpark.push(dataProducto[j].CNT_TH.toFixed(0)*1);
					oSerie.data.push(dataProducto[j].CNT_TH.toFixed(0)*1);
				}

				oSeries.push(oSerie);

				tabCuerpo = tabCuerpo + '  	   </tbody>';
				tabCuerpo = tabCuerpo + '  	</table>';					
				tabCuerpo = tabCuerpo + '</div>';


				//aprovechamos para generar los sparklines				
				var spark = $("#spark-sumarizado-"+oProductos[i].replace(/ /gi, "").replace(/\./gi, ""));
				var color = "";
				if($("body").hasClass("dark-mode")) {
					color = colores_dark[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}
				else {
					color = colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}

				spark.sparkline(valoresSpark, {type: 'bar', barColor: color, disableTooltips: true} );
				
			}
			
			
			
			
		},
		complete: function(){
			$(tab).appendTo("#tabs-productos");
			$(tabCuerpo).appendTo("#tabs-productos-cuerpo");
		}
	});
	
}


function cargarProduccionProductosDetalle(fecha, maquina, dias, grupo, producto){
	
	var tr1="";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquinaDetalle?fecha="+fecha+"&maquina="+maquina+"&dias="+dias+"&grupo="+grupo+"&producto="+producto, 
		dataType: 'json', 
		data: null, 
		async: true, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-produccion-productos-detalle").empty();
			tr1="";
   		},
		success: function(data){

			$.each(data, function (key, val) {

				tr1 = tr1 + "<tr>";
				tr1 = tr1 + "	<td>" + val.FCH_PRODUCCION + "</td>";
				tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
				tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + val.CNT_HORAS + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + val.CNT_TH.toFixed(0) + "</td>";				

				if (val.CNT_TH_LI==0 && val.CNT_TH_LS==0){
					tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
				}
				else {
					tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:" + val.DSC_COLOR_TH + ";'></i>" + "</td>";
				}

				tr1 = tr1 + "</tr>";
			});

			$("#cuerpo-tabla-produccion-productos-detalle").html(tr1);
		}
	});
}


function cargarTablaEnergiaSumarizado (fecha, maquina, dias){	

	var dFechaMil = Date.parse(fecha);
	var dFecha = new Date(dFechaMil);
	var dFechaLocal = new Date(dFecha.getUTCFullYear(), dFecha.getUTCMonth(), dFecha.getUTCDate());  

	var cFechaClasico = obtener_cadena_fecha_clasico(dFechaLocal);
	var cFechaEstandar = fecha;

	var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,dias), "-").replace(/-/gi,"/");

 	//RESUMEN
    var titulo = "Detalle por producto";        
    var subtitulo = "Energía del " + fechDesde + " al " + cFechaClasico;
          
    $("#contenedor-tabla-energia .titulo-contenedor").text("Máquina: " + maquina);
    $("#contenedor-tabla-energia .subtitulo-contenedor-rango").text(subtitulo);

    var oData = [];		
	var cCadena = '[';	
	var i=0;

	var oData1 = [];
	var cCadena1 = '[';	

	var oData2 = [];
	var cCadena2 = '[';	

	var oData3 = [];
	var cCadena3 = '[';	

	var tr1 = "";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarEnergiaProduccionProductoPorMaquinaSumarizado?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias="+dias, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-energia-produccion-productos-sumarizado").empty();
			oData=[];
			oData1=[];
			oData2=[];
			oData3=[];

			cCadena = '[';
			cCadena1 = '[';
			cCadena2 = '[';
			cCadena3 = '[';

			tr1="";
			i=0;
   		},
		success: function(data){

			$.each(data, function (key, val) {

				if (!(val.CNT_KWHT==0 && val.CNT_TONELADAS==0 && val.CNT_KWH==0)){
					if(i==0)
						cCadena = cCadena + '{';
					else
						cCadena = cCadena + ',{';

					cCadena = cCadena + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena = cCadena + '"data":['+val.CNT_KWHT+','+val.CNT_TONELADAS+','+val.CNT_KWH+']';
					cCadena = cCadena + '}';


					if(i==0)
						cCadena1 = cCadena1 + '{';
					else
						cCadena1 = cCadena1 + ',{';

					cCadena1 = cCadena1 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena1 = cCadena1 + '"data":['+val.CNT_KWHT+']';
					cCadena1 = cCadena1 + '}';				


					if(i==0)
						cCadena2 = cCadena2 + '{';
					else
						cCadena2 = cCadena2 + ',{';

					cCadena2 = cCadena2 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena2 = cCadena2 + '"data":['+val.CNT_TONELADAS+']';
					cCadena2 = cCadena2 + '}';				


					if(i==0)
						cCadena3 = cCadena3 + '{';
					else
						cCadena3 = cCadena3 + ',{';

					cCadena3 = cCadena3 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena3 = cCadena3 + '"data":['+val.CNT_KWH+']';
					cCadena3 = cCadena3 + '}';	


					tr1 = tr1 + "<tr>";
					tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
					tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_KWH + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_KWHT.toFixed(2) + "</td>";				

					if (val.CNT_KWHT_LI==0 && val.CNT_KWHT_LS==0){
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
					}
					else if (val.CNT_KWHT<val.CNT_KWHT_LI)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:red;'></i>" + "</td>";
					else if (val.CNT_KWHT>val.CNT_KWHT_LS)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:green;'></i>" + "</td>";
					else
						tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle' style='color:#909090;'></i>" + "</td>";

					tr1 = tr1 + "	<td class='text-center'>";
					tr1 = tr1 + "		<span class='spark spark-energia-sumarizado' id='spark-energia-sumarizado-" + val.COD_GRUPO_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") + "'>Cargando..</span>";					
					tr1 = tr1 + "   </td>"

					if (val.COD_GRUPO=="TOTAL"){
						tr1 = tr1 + "   <td><i class='fas fa-table ver-energia-produccion-productos-detalle' data-grupo='TOTAL' data-producto='TOTAL'></i></td>"	
					}
					else {
						tr1 = tr1 + "   <td><i class='fas fa-table ver-energia-produccion-productos-detalle' data-grupo='" + val.COD_GRUPO + "' data-producto='" + val.COD_PRODUCTO + "'></i></td>"	
					}

					tr1 = tr1 + "</tr>";				

					i++;	
				}
				
			});	


		},
		complete: function(){
			cCadena = cCadena + "]"		
			oData=JSON.parse(cCadena);	

			cCadena1 = cCadena1 + "]"		
			oData1=JSON.parse(cCadena1);	

			cCadena2 = cCadena2 + "]"		
			oData2=JSON.parse(cCadena2);	

			cCadena3 = cCadena3 + "]"		
			oData3=JSON.parse(cCadena3);	
			
			//cargamos tabla produccion por productos
			$(tr1).appendTo("#cuerpo-tabla-energia-produccion-productos-sumarizado");

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$("#tabla-energia-produccion-productos-sumarizado td").css("font-size",prefTamanofuente);


			//agregamos evento click al sparkline para ver modal detalle
			$(".spark-energia-sumarizado").off("click");
			$(".spark-energia-sumarizado").on("click", function(){				
				
				mostrarModal("oModalEnergiaSumarizado")
				$("#lblTituloModalEnergiaSumarizado").text("Energía")

				var dataProducto = oDataInfoEnergiaProductosSumarizado.filter( element => element.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")==this.id.replace(/spark-energia-sumarizado-/gi, ""));
				var dataProductoChart = [];				

				var oSeries = [];
				var oSerie = new Object();
				oSerie.name="";				

				if(dataProducto!=null){
					if (dataProducto.length>0){
						oSerie.name=dataProducto[0].COD_PRODUCTO;

						if($("body").hasClass("dark-mode")) {							
							oSerie.color=colores_dark[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}
						else {							
							oSerie.color=colores[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];
						}

						

						$("#lblTituloModalEnergiaSumarizado").text("Energía " + dataProducto[0].COD_MAQUINA + " - " + dataProducto[0].COD_PRODUCTO);
					}
				}
				
				var li=0;
				var ls=0;
				var minTH=0;
				var maxTH=0;
				var numItem=0;
				var valorTH=0;

	    		oSerie.data =[];	    		
	    		
				for (j=0;j<dataProducto.length;j++){
					numItem=numItem+1;

					valorTH = dataProducto[j].CNT_KWHT.toFixed(0)*1;
					oSerie.data.push(valorTH);
					
					if (numItem==1){
						minTH=valorTH;
						maxTH=valorTH;
					}
					else {

						if (minTH==0 && valorTH!=0)
							minTH=valorTH;

						if (maxTH==0 && valorTH!=0)
							maxTH=valorTH;

						if(valorTH<minTH && valorTH!=0)
							minTH=valorTH;	

						if(valorTH>maxTH && valorTH!=0)
							maxTH=valorTH;	
					}

					li=dataProducto[j].CNT_KWHT_LI;
					ls=dataProducto[j].CNT_KWHT_LS;
				}

				oSeries.push(oSerie);

				if (li<minTH)
					minTH=li;

				if(ls>maxTH)
					maxTH=ls;
			
				var dif = (maxTH-minTH)/6;
				minTH = minTH - dif;
				if (minTH<0)
					minTH=0;
				maxTH = maxTH + dif;






				var fechaBase = restar_n_dias(cFechaEstandar, dias).split("-");				
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,dias), "-").replace(/-/gi,"/");

				//grafico de lineas
				var oChartRendDet = Highcharts.chart('chart-energia-sumarizado', Highcharts.merge(

				{
			    title: {
			        text: 'Consumo Específico(kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'kwh/t'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime',
						labels: {
				            style: {
				                color: '#dcdcdf'
				            }
				        }
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	



				//grafico de columnas
				var oChartRendDetCol = Highcharts.chart('chart-energia-sumarizado-col', Highcharts.merge(

				{
				chart: {
					type: "column"
				},
			    title: {
			         text: 'Consumo Específico(kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'kwh/t'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	




				//grafico de area
				var oChartRendDetArea = Highcharts.chart('chart-energia-sumarizado-area', Highcharts.merge(

				{
				chart: {
					type: "area"
				},
			    title: {
			        text: 'Consumo Específico(kwh/t)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 'kwh/t'
			        },
			        min: minTH,
        			max: maxTH,

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
				)

				);	
			});


			////ver modal con tabla detalle
			$("#cuerpo-tabla-energia-produccion-productos-sumarizado .ver-energia-produccion-productos-detalle").off("click");
			$("#cuerpo-tabla-energia-produccion-productos-sumarizado .ver-energia-produccion-productos-detalle").on("click", function(){				
				$("#lblTituloModalEnergiaProduccionProductoPorMaquinaDetalle").text(subtitulo);
				mostrarModal("oModalEnergiaProduccionProductoPorMaquinaDetalle");

				var grupo = $(this).attr("data-grupo");
				var producto = $(this).attr("data-producto");
				cargarEnergiaProduccionProductosDetalle(fecha, maquina, dias, grupo, producto);				
			});

		}
	});
	

	//DETALLE
	

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarEnergiaProduccionProductoPorMaquinaDiario?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias="+dias, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			
			
   		},
		success: function(data){

			oDataInfoEnergiaProductosSumarizado=data;

			//obtenemos un distinc de los productos que existen en el rango de dias
			var oProductos = data.distinct('COD_PRODUCTO');

			for (i=0;i<oProductos.length;i++){
			
				var dataProducto = data.filter( element => element.COD_PRODUCTO ==oProductos[i]);
				var valoresSpark = [];
	    		
				for (j=0;j<dataProducto.length;j++){
					
					valoresSpark.push(dataProducto[j].CNT_KWHT.toFixed(2)*1);
					
				}

				//aprovechamos para generar los sparklines				
				var spark = $("#spark-energia-sumarizado-"+oProductos[i].replace(/ /gi, "").replace(/\./gi, ""));

				var color = "";
				if($("body").hasClass("dark-mode")) {
					color = colores_dark[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}
				else {
					color = colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
				}

				spark.sparkline(valoresSpark, {type: 'bar', barColor: color, disableTooltips: true} );
				
			}

		
		},
		complete: function(){
			
		}
	});
}

function cargarEnergiaProduccionProductosDetalle(fecha, maquina, dias, grupo, producto){
	
	var tr1="";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarEnergiaProduccionProductoPorMaquinaDetalle?fecha="+fecha+"&maquina="+maquina+"&dias="+dias+"&grupo="+grupo+"&producto="+producto, 
		dataType: 'json', 
		data: null, 
		async: true, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-energia-produccion-productos-detalle").empty();
			tr1="";
   		},
		success: function(data){

			$.each(data, function (key, val) {

				tr1 = tr1 + "<tr>";
				tr1 = tr1 + "	<td>" + val.FCH_PRODUCCION + "</td>";
				tr1 = tr1 + "	<td>" + val.COD_GRUPO + "</td>";
				tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_KWH) + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
				tr1 = tr1 + "	<td class='text-right'>" + val.CNT_KWHT.toFixed(2) + "</td>";				

				if (val.CNT_KWHT_LI==0 && val.CNT_KWHT_LS==0){
					tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
				}
				else {
					tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:" + val.DSC_COLOR_KWHT + ";'></i>" + "</td>";
				}

				tr1 = tr1 + "</tr>";
			});

			$("#cuerpo-tabla-energia-produccion-productos-detalle").html(tr1);
		}
	});
}

function MostrarModalProductos (fecha, maquina){	

    //$('#oModalProductos').modal();
    mostrarModal("oModalProductos");

    var cFechaClasico = obtener_cadena_fecha_clasico(fecha);
    var cFechaEstandar = obtener_cadena_fecha_estandar(fecha);


    //RESUMEN
    var titulo = "Detalle por producto";        
    $('#lblTituloModalProductos').text(titulo);        
    $(".resumen-produccion .modal-title").text("Máquina: " + maquina);
    $(".resumen-produccion .modal-subtitulo").text("Producción del " + cFechaClasico + "");
     

    var oData = [];		
	var cCadena = '[';	
	var i=0;

	var oData1 = [];
	var cCadena1 = '[';	

	var oData2 = [];
	var cCadena2 = '[';	

	var oData3 = [];
	var cCadena3 = '[';	

	var tr1 = "";

    $.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquina?fecha="+cFechaEstandar+"&maquina="+maquina, 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			$("#cuerpo-tabla-produccion-productos").empty();
			oData=[];
			oData1=[];
			oData2=[];
			oData3=[];

			cCadena = '[';
			cCadena1 = '[';
			cCadena2 = '[';
			cCadena3 = '[';

			tr1="";
			i=0;
   		},
		success: function(data){

			$.each(data, function (key, val) {

				if (!(val.CNT_TH==0 && val.CNT_TONELADAS==0 && val.CNT_HORAS==0)){
					if(i==0)
						cCadena = cCadena + '{';
					else
						cCadena = cCadena + ',{';

					cCadena = cCadena + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena = cCadena + '"data":['+val.CNT_TH+','+val.CNT_TONELADAS+','+val.CNT_HORAS+']';
					cCadena = cCadena + '}';


					if(i==0)
						cCadena1 = cCadena1 + '{';
					else
						cCadena1 = cCadena1 + ',{';

					cCadena1 = cCadena1 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena1 = cCadena1 + '"data":['+val.CNT_TH+']';
					cCadena1 = cCadena1 + '}';				


					if(i==0)
						cCadena2 = cCadena2 + '{';
					else
						cCadena2 = cCadena2 + ',{';

					cCadena2 = cCadena2 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena2 = cCadena2 + '"data":['+val.CNT_TONELADAS+']';
					cCadena2 = cCadena2 + '}';				


					if(i==0)
						cCadena3 = cCadena3 + '{';
					else
						cCadena3 = cCadena3 + ',{';

					cCadena3 = cCadena3 + '"name":"' + val.COD_PRODUCTO + '",';
					cCadena3 = cCadena3 + '"data":['+val.CNT_HORAS+']';
					cCadena3 = cCadena3 + '}';	


					tr1 = tr1 + "<tr>";
					tr1 = tr1 + "	<td>" + val.COD_PRODUCTO + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_HORAS + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + addCommas(val.CNT_TONELADAS) + "</td>";
					tr1 = tr1 + "	<td class='text-right'>" + val.CNT_TH.toFixed(0) + "</td>";

					if (val.CNT_TH_LI==0 && val.CNT_TH_LS==0){
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-exclamation-triangle' style='color:red;'></i>" + "</td>";
					}
					else if (val.CNT_TH<val.CNT_TH_LI)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:red;'></i>" + "</td>";
					else if (val.CNT_TH>val.CNT_TH_LS)
						tr1 = tr1 + "	<td class='text-center'>" + "<i class='fas fa-circle' style='color:green;'></i>" + "</td>";
					else
						tr1 = tr1 + "	<td class='text-center'>" +  "<i class='fas fa-circle' style='color:#909090;'></i>" + "</td>";

					tr1 = tr1 + "	<td class='text-center'>";
					tr1 = tr1 + "		<span class='spark spark-produccion' id='spark-" + val.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "") + "'>Cargando..</span>";					
					tr1 = tr1 + "   </td>"

					tr1 = tr1 + "</tr>";				

					i++;	
				}
				
			});	


		},
		complete: function(){
			cCadena = cCadena + "]"		
			oData=JSON.parse(cCadena);	

			cCadena1 = cCadena1 + "]"		
			oData1=JSON.parse(cCadena1);	

			cCadena2 = cCadena2 + "]"		
			oData2=JSON.parse(cCadena2);	

			cCadena3 = cCadena3 + "]"		
			oData3=JSON.parse(cCadena3);	
			
			//cargamos tabla produccion por productos
			$(tr1).appendTo("#cuerpo-tabla-produccion-productos");

			//agregamos evento para ver seccion detalle del producto
			$(".ver-detalle-producto").off("click");
			$(".ver-detalle-producto").on("click", function(){
				//alert($(this).attr("data-producto"));

				var CodProductoSel = $(this).attr("data-producto");

				if($(".contenedor-detalle-produccion").hasClass("show")){
					$(".contenedor-detalle-produccion").removeClass("show");
				}
				else {
					$(".contenedor-detalle-produccion").addClass("show");	

					$("#tabs-productos .nav-link.active").removeClass("active");
					$("#tabs-productos-cuerpo .tab-pane.active").removeClass("active");

					$("#tabs-productos #tab-"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("active");
					$("#tabs-productos-cuerpo #"+CodProductoSel).addClass("show");
				}
				
				

			});

			//agregamos evento click al sparkline para ver modal detalle
			$(".spark-produccion").off("click");
			$(".spark-produccion").on("click", function(){				
				$("#oModalRendimiento").modal();
				$("#lblTituloModalRendimiento").text("Rendimiento")

				var dataProducto = oDataInfoProductos.filter( element => element.COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")==this.id.replace(/spark-/gi, ""));
				var dataProductoChart = [];				

				var oSeries = [];
				var oSerie = new Object();
				oSerie.name="";				

				if(dataProducto!=null){
					if (dataProducto.length>0){
						oSerie.name=dataProducto[0].COD_PRODUCTO;
						oSerie.color=colores[dataProducto[0].COD_PRODUCTO.replace(/ /gi, "").replace(/\./gi, "")];

						$("#lblTituloModalRendimiento").text("Rendimiento " + dataProducto[0].COD_MAQUINA + " - " + dataProducto[0].COD_PRODUCTO);
					}
				}
				
				var li=0;
				var ls=0;

	    		oSerie.data =[];	    		
	    		
				for (j=0;j<dataProducto.length;j++){
					oSerie.data.push(dataProducto[j].CNT_TH.toFixed(0)*1);

					//li=dataProducto[j].CNT_TH_LI;
					//ls=dataProducto[j].CNT_TH_LS;
				}

				oSeries.push(oSerie);



				//obtenemos los limites de t/h para la maquina
				$.ajax({ 
			    	url: ipService+"/Operaciones.svc/ListarKPIPorMaquina?maquina="+maquina+"&kpi=t/h",
			    	dataType: 'json', 
			    	data: null, 
			    	async: false,     		
			    })
			    .done(function(data){
			    	if (data!=null){
			    		li=data.LI;
						ls=data.LS;    		
			    	}					
			    })
			    .always(function() {
			  	});





				var fechaBase = restar_n_dias(cFechaEstandar, 15).split("-");				
				var fechDesde = formatearFecha_DD_MM_YYYY(restar_n_dias(cFechaEstandar,15), "-").replace(/-/gi,"/");

				//grafico de lineas
				var oChartRendDet = Highcharts.chart('chart-rendimiento', Highcharts.merge(

				{
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime',
						labels: {
				            style: {
				                color: '#dcdcdf'
				            }
				        }
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				getTemaDarkHighCharts()
				)

				);	



				//grafico de columnas
				var oChartRendDetCol = Highcharts.chart('chart-rendimiento-col', Highcharts.merge(

				{
				chart: {
					type: "column"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				getTemaDarkHighCharts()
				)

				);	




				//grafico de area
				var oChartRendDetArea = Highcharts.chart('chart-rendimiento-area', Highcharts.merge(

				{
				chart: {
					type: "area"
				},
			    title: {
			        text: 'Rendimiento(t/h)'
			    },
			    subtitle: {
			        text: 'Periodo del ' + fechDesde + " al " + cFechaClasico + ""
			    },
			    credits: {
					enabled: false
				},
			    yAxis: {
			        title: {
			            text: 't/h'
			        },

			        plotLines: [{
			            color: '#FF0000',
			            width: 2,
			            value: li,
			            label: {
		                    text:  li,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#FF0000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                },
			        },
			        {
			            color: '#008000',
			            width: 2,
			            value: ls,
			            label: {
		                    text:  ls,
		                    verticalAlign: 'bottom',
		                    textAlign: 'right',
		                    style: {
			                    color: '#008000',
			                    fontWeight: 'bold',
			                    fontSize: '11px',
		                	}
		                }
			        }]
			    },
			    xAxis: [{
						type: 'datetime'
					}],   
			    legend: {
			        layout: 'vertical',
			        align: 'right',
			        verticalAlign: 'middle'
			    },

			    plotOptions: {
			        series: {            

			            pointInterval: 86400000, // 1d
						pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
			        }
			    },

			    series: oSeries,
			  
			    responsive: {
			        rules: [{
			            condition: {
			                maxWidth: 500
			            },
			            chartOptions: {
			                legend: {
			                    layout: 'horizontal',
			                    align: 'center',
			                    verticalAlign: 'bottom'
			                }
			            }
			        }]
			    }

				}
				,
				getTemaDarkHighCharts()
				)

				);	







			})

		}
	});

/*
           
	//DETALLE
	var tab = "";
	var tabCuerpo="";
	var oSeries=[];
	

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProduccionProductoPorMaquinaDiario?fecha="+cFechaEstandar+"&maquina="+maquina+"&dias=15", 
		dataType: 'json', 
		data: null, 
		async: false, 
		beforeSend: function(){	     	
			tab = "";
			tabCuerpo=""	
     		$("#tabs-productos").empty();
			$("#tabs-productos-cuerpo").empty();
			oSeries=[];
   		},
		success: function(data){

			oDataInfoProductos=data;

			//generamos tabs

			//obtenemos un distinc de los productos que existen en el rango de dias
			var oProductos = data.distinct('COD_PRODUCTO');

			for (i=0;i<oProductos.length;i++){

				var activo="";
				if (i==0)
					activo="active";

				tab = tab + '<li class="nav-item" role="presentation">';
				tab = tab + '   <a class="nav-link ' + activo + '" id="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" data-toggle="tab" href="#' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tab" aria-controls="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" aria-selected="true" style="background-color:' + colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")] + '69">' + oProductos[i] + '</a>';
				tab = tab + '</li>'

				tabCuerpo = tabCuerpo + '<div class="tab-pane fade show ' + activo + '" id="' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '" role="tabpanel" aria-labelledby="tab-' + oProductos[i].replace(/ /gi, "").replace(/\./gi, "") + '">';
				tabCuerpo = tabCuerpo + '   <table class="table table-striped table-hover table-sm table-dark">';
				tabCuerpo = tabCuerpo + '      <thead class="thead-dark">';
				tabCuerpo = tabCuerpo + '         <tr>';
				tabCuerpo = tabCuerpo + '	         <th scope="col">Fecha</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">Horas</th>';
				tabCuerpo = tabCuerpo + '		     <th scope="col"  class="text-right">Producción(t)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col"  class="text-right">Rendimiento(t/h)</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LI</th>';
				tabCuerpo = tabCuerpo + '	         <th scope="col" class="text-right">LS</th>';				
				tabCuerpo = tabCuerpo + '  	      </tr>';
				tabCuerpo = tabCuerpo + '  	   </thead>';
				tabCuerpo = tabCuerpo + '  	   <tbody>';
			
				var dataProducto = data.filter( element => element.COD_PRODUCTO ==oProductos[i]);
				var valoresSpark = [];

				var oSerie = new Object();
	    		oSerie.name=oProductos[i];
	    		oSerie.color=colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")];
	    		//oSerie.data =[1,2,3,5,2,5,2,5,3,4,3,5,4,4,5];	    
	    		oSerie.data =[];
	    		
				for (j=0;j<dataProducto.length;j++){
					tabCuerpo = tabCuerpo + '<tr>';
					tabCuerpo = tabCuerpo + '   <td>'+dataProducto[j].FCH_PRODUCCION+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_HORAS+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+addCommas(dataProducto[j].CNT_TONELADAS)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LI.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '   <td class="text-right">'+dataProducto[j].CNT_TH_LS.toFixed(0)+'</td>';
					tabCuerpo = tabCuerpo + '</tr>';

					valoresSpark.push(dataProducto[j].CNT_TH.toFixed(0)*1);
					oSerie.data.push(dataProducto[j].CNT_TH.toFixed(0)*1);
				}

				oSeries.push(oSerie);

				tabCuerpo = tabCuerpo + '  	   </tbody>';
				tabCuerpo = tabCuerpo + '  	</table>';					
				tabCuerpo = tabCuerpo + '</div>';


				//aprovechamos para generar los sparklines				
				var spark = $("#spark-"+oProductos[i].replace(/ /gi, "").replace(/\./gi, ""));
				spark.sparkline(valoresSpark, {type: 'bar', barColor: colores[oProductos[i].replace(/ /gi, "").replace(/\./gi, "")], disableTooltips: true} );
				
			}
			
			
			
			
		},
		complete: function(){
			$(tab).appendTo("#tabs-productos");
			$(tabCuerpo).appendTo("#tabs-productos-cuerpo");
		}
	});

		

	//generamos chart de rendimientos de productos - columnas
	var fechaBase = restar_n_dias(cFechaEstandar, 15).split("-");

	var oChartRend = Highcharts.chart('chart-productos-rendimiento', Highcharts.merge(
	{
	chart: {
        type: 'column',
         height: 433,
    },    	
    title: {
        text: 'Rendimiento por producto'
    },
    subtitle: {
        //text: 'Source: thesolarfoundation.com'
    },
    credits: {
		enabled: false
	},
    yAxis: {
        title: {
            text: 'Rendimiento(t/h)',
            //style:{
			//		color: '#ff0000'
			//}
        },       
    },
    xAxis: [{
			type: 'datetime'
		}],   
    legend: {
    	
    },

    plotOptions: {
        series: {            

            pointInterval: 86400000, // 1d
			pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
        }
    },

    series: oSeries,
  
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

	}

	,
	getTemaDarkHighCharts()
	)




	);	


	//generamos chart de rendimientos de productos - lineas
	var oChartRendLine = Highcharts.chart('chart-productos-rendimiento-line', Highcharts.merge(

	{
	chart: {
        type: 'line'
    },    	
    title: {
        text: 'Rendimiento por producto'
    },
    subtitle: {
        //text: 'Source: thesolarfoundation.com'
    },
    credits: {
		enabled: false
	},
    yAxis: {
        title: {
            text: 'Rendimiento(t/h)'
        }
    },
    xAxis: [{
			type: 'datetime'
		}],   
    legend: {    	
    },

    plotOptions: {
        series: {            

            pointInterval: 86400000, // 1d
			pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
        }
    },

    series: oSeries,
  
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

	}
	,
		getTemaDarkHighCharts()
	)
	);	



	//generamos chart de rendimientos de productos - areas
	var oChartRendArea = Highcharts.chart('chart-productos-rendimiento-area', Highcharts.merge(

	{
	chart: {
        type: 'area'
    },    	
    title: {
        text: 'Rendimiento por producto'
    },
    subtitle: {
        //text: 'Source: thesolarfoundation.com'
    },
    credits: {
		enabled: false
	},
    yAxis: {
        title: {
            text: 'Rendimiento(t/h)',            
        },       
    },
    xAxis: [{
			type: 'datetime'
		}],   
    legend: {    	
    },

    plotOptions: {
        series: {            

            pointInterval: 86400000, // 1d
			pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
        }
    },

    series: oSeries,
  
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

	}
	,
	getTemaDarkHighCharts()
	)

	);	

	*/

}



function cargarCalidad(fechaService, maquina) {
	var NombreSeleccionado="";
	var tab = "";
	var panel = "";

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarProductosDeCalidad?fecha="+fechaService+"&maquina="+maquina, 
		dataType: 'json', 
		data: null, 
		async: false,
		beforeSend: function (){ 
			NombreSeleccionado="";
			tab = "";
			panel = "";
			$("#tabs-calidad").empty();
			$("#panels-calidad").empty();	

			$("#card-calidad-dia .ribbon-box").css("background-color","#909090");
			$("#mis-estilos2").empty();
			$("#mis-estilos2").html("#card-calidad-dia .ribbon .ribbon-box:before { border-color: " + "#909090" + " !important; border-right-color: transparent !important;}");		

			$("#mensaje-calidad").removeClass("d-none");
        }, 
        fail: function(){

        },
		success: function(data){ 



			if (data.length>0){
				$("#mensaje-calidad").addClass("d-none");
			}

			$.each(data, function (key, val) {

				if (val.Seleccionado=="S"){
					NombreSeleccionado=val.Nombre;
				}

				var claseConTonelaje="con-tonelaje";
				if (val.Tonelaje==0){
					claseConTonelaje="";
				}

				if (tab=="") {
					tab = tab + '<a class="nav-link active ' + claseConTonelaje + '" id="tab-calidad-' + val.Nombre.replace(/ /gi, "") + '"  href="#panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" role="tab" aria-controls="panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" aria-selected="true"> ';
					tab = tab + '	<span>' + val.Nombre + '</span>'; 
					tab = tab + '	<span><i class="fas fa-caret-right selector-tab"></i></span>'; 
					tab = tab + '</a>';
				}
				else {
					tab = tab + '<a class="nav-link ' + claseConTonelaje + '" id="tab-calidad-' + val.Nombre.replace(/ /gi, "") + '"  href="#panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" role="tab" aria-controls="panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" aria-selected="true"> ';
					tab = tab + '	<span>' + val.Nombre + '</span>'; 
					tab = tab + '	<span><i class="fas fa-caret-right selector-tab"></i></span>'; 
					tab = tab + '</a>';
					//tab = tab + '<a class="nav-link" id="tab-calidad-' + val.Nombre.replace(/ /gi, "") + '" data-toggle="pill" href="#panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" role="tab" aria-controls="panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" aria-selected="true">' + val.Nombre + '</a>';
				}

				var showactive="";
				if (panel=="") {
					showactive="show active";
				}
				else {
					showactive="";
				}

				panel = panel + '<div class="table-responsive card tab-pane fade ' + showactive + ' ' + claseConTonelaje + '" id="panel-calidad-' + val.Nombre.replace(/ /gi, "") + '" role="tabpanel" aria-labelledby="tab-calidad-' + val.Nombre.replace(/ /gi, "") + '">';
				panel = panel + '	<table class="table table-hover table-striped table-vcenter text-nowrap mb-0 tabla-calidad" id="tabla-' + val.Nombre.replace(/ /gi, "") + '" data-producto="' + val.Nombre + '">';
				panel = panel + '		<thead>';
				panel = panel + '			<tr>';
				panel = panel + '				<th scope="col">Item</th>';
				panel = panel + '				<th scope="col" class="text-right">% Promedio</th>';
				panel = panel + '       	    <th scope="col" class="text-right">Desv. Est.</th>';
				panel = panel + ' 		        <th scope="col" class="text-right">Promedio  Control</th>';
				panel = panel + '		        <th scope="col" class="text-right">Desv.Est. Control</th>';
				panel = panel + '		        <th scope="col" class="text-right"><i class="fas fa-arrow-right manejo-columnas" data-producto=' + val.Nombre + '></i></th>';
				panel = panel + '		        <th scope="col" class="text-right calidad-th-configuracion d-none">Sigma</th>';
				panel = panel + '		        <th scope="col" class="text-right calidad-th-configuracion d-none">Límite Inferior</th>';
				panel = panel + '		        <th scope="col" class="text-right calidad-th-configuracion d-none">Límite Superior</th>';
				panel = panel + '		        <th scope="col" class="text-center">Logro</th>';				
				//panel = panel + '		        <th scope="col" class="text-center">Logro</th>';
				panel = panel + '		        <th scope="col">Tendencia</th>';
				panel = panel + '		    </tr>';
				panel = panel + '  	   </thead>';
				panel = panel +	'	   <tbody id="cuerpo-tabla-' + val.Nombre.replace(/ /gi, "") + '">';
				panel = panel +	'  	   </tbody>';
				panel = panel + '	</table>';
				panel = panel + '	<span class="calidad-tonelaje">Tonelaje: ' + addCommas(val.Tonelaje) + '</span>';
				panel = panel + '</div>';

			});

			

		},
		complete: function(data){
			
			$("#tabs-calidad").empty();
			$("#panels-calidad").empty();

			//$(tab).appendTo("#tabs-calidad");
			//$(panel).appendTo("#panels-calidad");

			$("#tabs-calidad").html(tab);
			$("#panels-calidad").html(panel);

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$(".tabla-calidad th").css("font-size",prefTamanofuente);

			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+13)+"px";
			$(".calidad-tonelaje").css("font-size",prefTamanofuente);

			//verificamos si ocultamos los productos sin tonelaje
			if( $('#chk-ver-productos-con-tonelaje').prop('checked') ) {

				$("#tabs-calidad .nav-link").addClass("d-none");
				$("#panels-calidad .tab-pane").addClass("d-none");

 				$("#tabs-calidad .nav-link.con-tonelaje").removeClass("d-none");
 				$("#panels-calidad .tab-pane.con-tonelaje").removeClass("d-none");
			}
			else {
				$("#tabs-calidad .nav-link").removeClass("d-none");
				$("#panels-calidad .tab-pane").removeClass("d-none");
			}

			$("#chk-ver-productos-con-tonelaje").off("change");
			$("#chk-ver-productos-con-tonelaje").on("change", function(){

				if( $('#chk-ver-productos-con-tonelaje').prop('checked') ) {
					$("#tabs-calidad .nav-link").addClass("d-none");
					$("#panels-calidad .tab-pane").addClass("d-none");

	 				$("#tabs-calidad .nav-link.con-tonelaje").removeClass("d-none");
	 				$("#panels-calidad .tab-pane.con-tonelaje").removeClass("d-none");
				}
				else {
					$("#tabs-calidad .nav-link").removeClass("d-none");
					$("#panels-calidad .tab-pane").removeClass("d-none");
				}

			});
			
			


			if(NombreSeleccionado!=""){
				$("#tabs-calidad .nav-link").removeClass("active");
				$("#panels-calidad .tab-pane").removeClass("show");
				$("#panels-calidad .tab-pane").removeClass("active");

				$("#tab-calidad-" + NombreSeleccionado.replace(/ /gi, "")).addClass("active");
				$("#panel-calidad-" + NombreSeleccionado.replace(/ /gi, "")).addClass("show");
				$("#panel-calidad-" + NombreSeleccionado.replace(/ /gi, "")).addClass("active");

			}

			for(i=0;i<$(".tabla-calidad").length;i++){
				var producto = $($(".tabla-calidad")[i]).attr("data-producto");
				cargarProductoCalidad(fechaService,maquina,producto)
			}

			$("#tabs-calidad .nav-link").off("click");
			$("#tabs-calidad .nav-link").on("click", function(ev){

				ev.preventDefault();

				var idTab = $(this).attr("href");  //.replace(/#/gi,"");				

				$("#panels-calidad .tab-pane").removeClass("active");
				$("#panels-calidad .tab-pane").removeClass("show");

				$(idTab).addClass("active");
				$(idTab).addClass("show");

				$("#tabs-calidad .nav-link").removeClass("active");
				$(this).addClass("active");
			});


			$(".manejo-columnas").off("click");
			$(".manejo-columnas").on("click", function(){
				//alert($(this).attr("data-producto"));

				if ($($(".calidad-td-configuracion")[0]).hasClass("d-none")) {
					$(".calidad-td-configuracion").removeClass("d-none");
					$(".calidad-th-configuracion").removeClass("d-none");
					$(".manejo-columnas").removeClass("fa-arrow-right");
					$(".manejo-columnas").addClass("fa-arrow-left");
				}
				else {
					$(".calidad-td-configuracion").addClass("d-none");	
					$(".calidad-th-configuracion").addClass("d-none");
					$(".manejo-columnas").addClass("fa-arrow-right");
					$(".manejo-columnas").removeClass("fa-arrow-left");
				}
			});

		}
	});

}


function cargarProductoCalidad(fechaService, maquina, producto){
	
	

	$.ajax({ 
		url: ipService+"/Operaciones.svc/ListarDatosDeCalidad?fecha="+fechaService+"&maquina="+maquina+"&producto="+producto, 
		dataType: 'json', 
		data: null, 
		async: true,
		beforeSend: function (){                     
			$("#cuerpo-tabla-"+producto.replace(/ /gi, "")).empty();

	
        }, 
		success: function(data){ 
			var tr="";

			$.each(data, function (key, val) {
				tr = tr + "<tr>";
				tr = tr + "	<td>"+val.Nombre+"</td>";

				if (val.Promedio=="")
					tr = tr + "	<td class='text-right'></td>";
				else
					tr = tr + "	<td class='text-right'>"+(val.Promedio*1).toFixed(2)+"</td>";

				tr = tr + "	<td class='text-right'>"+(val.Desviacion*1).toFixed(2)+"</td>";
				tr = tr + "	<td class='text-right'>"+(val.PromedioObjetivo*1).toFixed(2)+"</td>";
				tr = tr + "	<td class='text-right'>"+(val.DesviacionObjetivo*1).toFixed(2)+"</td>";
				tr = tr + "	<td class='text-right'></td>";
				tr = tr + "	<td class='text-right calidad-td-configuracion d-none'>"+(val.Factor*1).toFixed(2)+"</td>";
				tr = tr + "	<td class='text-right calidad-td-configuracion d-none'>"+(val.LI_Operativo*1).toFixed(2)+"</td>";
				tr = tr + "	<td class='text-right calidad-td-configuracion d-none'>"+(val.LS_Operativo*1).toFixed(2)+"</td>";

				if ((val.Promedio*1)<(val.LI_Operativo*1)){
					tr = tr + "	<td class='text-center semaforo'>"+"<i class='fas fa-circle' data-promedio='" + (val.Promedio*1).toFixed(2) + "' data-zona='zona-baja' data-color-zona='" + val.ColorZonaBaja + "' style='color:" + val.ColorZonaBaja + "'></i>"+"</td>";
				}
				else if ((val.Promedio*1)>=(val.LI_Operativo*1) && (val.Promedio*1)<(val.LS_Operativo*1)){ 
					tr = tr + "	<td class='text-center semaforo'>"+"<i class='fas fa-circle' data-promedio='" + (val.Promedio*1).toFixed(2) + "' data-zona='zona-media' data-color-zona='" + val.ColorZonaMedia + "' style='color:" + val.ColorZonaMedia + "'></i>"+"</td>";
				}
				else {
					tr = tr + "	<td class='text-center semaforo'>"+"<i class='fas fa-circle' data-promedio='" + (val.Promedio*1).toFixed(2) + "' data-zona='zona-alta' data-color-zona='" + val.ColorZonaAlta + "' style='color:" + val.ColorZonaAlta + "'></i>"+"</td>";	
				}
								
				/*
				if ((val.Desviacion*1).toFixed(2)>(val.DesviacionObjetivo*1).toFixed(2)){					
					tr = tr + "	<td class='text-center'>"+"<i class='fas fa-circle sin-logro'></i>"+"</td>";	
				}
				else {
					tr = tr + "	<td class='text-center'>"+"<i class='fas fa-circle con-logro'></i>"+"</td>";
				}
				*/
				
				tr = tr + "	<td>";
				tr = tr + "		<span class='spark-calidad' id='spark-" + producto.replace(/ /gi, "") + "-" + val.Nombre.replace(/ /gi, "") + "' data-obj-promedio='" + (val.PromedioObjetivo*1).toFixed(2) + "' data-obj-desviacion='" + (val.DesviacionObjetivo*1).toFixed(2) + "' data-li-promedio='" + (val.LI_Operativo*1).toFixed(2) + "' data-ls-promedio='" + (val.LS_Operativo*1).toFixed(2) + "' data-color-baja='" + val.ColorZonaBaja + "' data-color-alta='" + val.ColorZonaAlta + "' >Cargando..</span>";					
				tr = tr + " </td>";

				tr = tr + "</tr>";
			});

			//$(tr).appendTo("#cuerpo-tabla-"+producto.replace(/ /gi, ""));
			$("#cuerpo-tabla-"+producto.replace(/ /gi, "")).html(tr);

			//actualimos el tamaño del font segun preferencias
			var prefTamanofuente=(parseInt($('input[name=font-size]:checked').val())+11)+"px";
			$(".tabla-calidad td").css("font-size",prefTamanofuente);

			//obtenemos el color de la bandera principal de Datos de calidad			
			var zona = "";
			var colorZona = "";
			for(i=0; i<$(".tabla-calidad .fa-circle").length; i++ ){

				var prom = $($(".tabla-calidad .fa-circle")[i]).attr("data-promedio")*1;
				//console.log(prom);

				if (prom>0){
					if (zona==""){
						zona = $($(".tabla-calidad .fa-circle")[i]).attr("data-zona");
						colorZona = $($(".tabla-calidad .fa-circle")[i]).attr("data-color-zona");
					}
					else {
						var zonaActual = $($(".tabla-calidad .fa-circle")[i]).attr("data-zona");
						var colorActual = $($(".tabla-calidad .fa-circle")[i]).attr("data-color-zona");

						if (zonaActual=="zona-baja"){
							zona = zonaActual;
							colorZona = colorActual;
						}
						else if (zona=="zona-alta" && zonaActual=="zona-baja"){
							zona = zonaActual;
							colorZona = colorActual;
						}
						else if (zona=="zona-media" && zonaActual!="zona-media"){
							zona = zonaActual;
							colorZona = colorActual;
						}
					}
				}

				
			}

			$("#card-calidad-dia .ribbon-box").css("background-color",colorZona);
			$("#mis-estilos2").empty();
			$("#mis-estilos2").html("#card-calidad-dia .ribbon .ribbon-box:before { border-color: " + colorZona + " !important; border-right-color: transparent !important;}");
						
			
			//validamos cual tab seleccionar
			var productoASeleccionar="";
			var toneladasDelSeleccionado=-1;
			var productoASeleccionarTieneRojo=false;

			for (i=0;i<$("#tabs-calidad .nav-link").length;i++){
				var idProducto = $("#tabs-calidad .nav-link")[i].id.replace("tab-calidad-","");

				if (i==0){
					productoASeleccionar=idProducto;
					toneladasDelSeleccionado = $("#panel-calidad-"+idProducto+" .calidad-tonelaje").text().replace("Tonelaje: ","");
					toneladasDelSeleccionado = toneladasDelSeleccionado.replace(/,/gi,"")*1.00;
				}
				else {

					toneladas = $("#panel-calidad-"+idProducto+" .calidad-tonelaje").text().replace("Tonelaje: ","");
					toneladas = toneladas.replace(/,/gi,"")*1.00;

					if (
							(toneladas>0) 
							&&
							(
							$("#cuerpo-tabla-"+idProducto+" .semaforo i[data-zona='zona-alta']").length>0
							||
							$("#cuerpo-tabla-"+idProducto+" .semaforo i[data-zona='zona-baja']").length>0
							)
						) {						


						if (productoASeleccionarTieneRojo==false || toneladas>toneladasDelSeleccionado){
							productoASeleccionar=idProducto;
							toneladasDelSeleccionado=toneladas;
							productoASeleccionarTieneRojo=true;	
						}						

					}
					else if (productoASeleccionarTieneRojo==false){

						if (toneladas>toneladasDelSeleccionado){
							productoASeleccionar=idProducto;
							toneladasDelSeleccionado=toneladas;	
						}	
					}
				}
			}

			

			if (productoASeleccionar!=""){
				$("#tabs-calidad .nav-link").removeClass("active");
				$("#panels-calidad .tab-pane").removeClass("show");
				$("#panels-calidad .tab-pane").removeClass("active");

				$("#tab-calidad-" + productoASeleccionar.replace(/ /gi, "")).addClass("active");
				$("#panel-calidad-" + productoASeleccionar.replace(/ /gi, "")).addClass("show");
				$("#panel-calidad-" + productoASeleccionar.replace(/ /gi, "")).addClass("active");
			}



		},
		complete: function(){

			var fechaServiceIni = aumentar_n_dias(fechaService,-14);

			$.ajax({ 
				url: ipService+"/Operaciones.svc/ListarDatosDeCalidadDirectos?fechaini="+fechaServiceIni+"&fechafin=" +fechaService + "&maquina="+maquina+ "&producto="+producto, 
				dataType: 'json', 
				data: null, 
				async: true,
				beforeSend: function (){                  
					
		        }, 
				success: function(data){ 					
					for (i=0;i<$("#tabla-" + producto.replace(/ /gi, "") + " .spark-calidad").length;i++){

						var valores = [];

						$.each(data, function (key, val) {
							var nombreElemento = $("#tabla-" + producto.replace(/ /gi, "") + " .spark-calidad")[i].id.split('-')[2];
														
							if (nombreElemento==val.Elemento.replace(/ /gi, "") && val.Nombre=="Promedio"){
								valores.push(val.Valor);
							}
						});

						var spark = $($("#tabla-" + producto.replace(/ /gi, "") + " .spark-calidad")[i]);
						spark.sparkline(valores, {type: 'bar', barColor: "#36a532", disableTooltips: true} );						
					}

					//agregamos evento click al sparkline para ver modal detalle
					$("#tabla-" + producto.replace(/ /gi, "") + " .spark-calidad").off("click");
					$("#tabla-" + producto.replace(/ /gi, "") + " .spark-calidad").on("click", function(){	
						
						var nombreElemento = this.id.split('-')[2];

						var objPromedio = $(this).attr("data-obj-promedio")*1;
						var objDesviacion = $(this).attr("data-obj-desviacion")*1;
						var liPromedio = $(this).attr("data-li-promedio")*1;
						var lsPromedio = $(this).attr("data-ls-promedio")*1;
						var colorZonaBaja = $(this).attr("data-color-baja");
						var colorZonaAlta = $(this).attr("data-color-alta");

						mostrarModal("oModalDatosCalidad");
						$("#lblTituloDatosCalidad").html(maquina.replace(/%20/gi, " ") + " - " + producto + " - " + nombreElemento);
						
						var numItemPromedio=0;
						var numItemDesviacion=0;

						var oSeriesPromedio = [];
						var oSeriePromedio = new Object();
						oSeriePromedio.name=nombreElemento;	
						oSeriePromedio.data =[];						
						var minPromedio=0;
						var maxPromedio=0;						

						var oSeriesDesviacion = [];
						var oSerieDesviacion = new Object();
						oSerieDesviacion.name=nombreElemento;	
						oSerieDesviacion.data =[];
						oSerieDesviacion.color="#8ca7a6";
						var minPromedioDesviacion=0;
						var maxPromedioDesviacion=0;
												
						$.each(data, function (key, val) {							
							
							//obtenemos datos de promedio														
							if (nombreElemento==val.Elemento.replace(/ /gi, "") && val.Nombre=="Promedio"){

								numItemPromedio=numItemPromedio+1;

								oSeriePromedio.data.push(val.Valor);

								//calculamos minimo y maximo
								if (numItemPromedio==1){
									minPromedio=val.Valor;
									maxPromedio=val.Valor;
								}
								else {

									if (minPromedio==0 && val.Valor!=0)
										minPromedio=val.Valor;

									if (maxPromedio==0 && val.Valor1!=0)
										maxPromedio=val.Valor;

									if(val.Valor<minPromedio && val.Valor!=0)
										minPromedio=val.Valor;	

									if(val.Valor>maxPromedio && val.Valor!=0)
										maxPromedio=val.Valor;	
								}
								
							}

							//obtenemos datos de desviacion
							if (nombreElemento==val.Elemento.replace(/ /gi, "") && val.Nombre=="Desviacion"){

								numItemDesviacion=numItemDesviacion+1;

								oSerieDesviacion.data.push(val.Valor);

								//calculamos minimo y maximo
								if (numItemDesviacion==1){
									minPromedioDesviacion=val.Valor;
									maxPromedioDesviacion=val.Valor;
								}
								else {

									if (minPromedioDesviacion==0 && val.Valor!=0)
										minPromedioDesviacion=val.Valor;

									if (maxPromedioDesviacion==0 && val.Valor1!=0)
										maxPromedioDesviacion=val.Valor;

									if(val.Valor<minPromedioDesviacion && val.Valor!=0)
										minPromedioDesviacion=val.Valor;	

									if(val.Valor>maxPromedioDesviacion && val.Valor!=0)
										maxPromedioDesviacion=val.Valor;	
								}
							}

						});

						//ajustamos max y min de promedio
						/*
						if (objPromedio>maxPromedio)
							maxPromedio=objPromedio;

						if (objPromedio<minPromedio)
							minPromedio=objPromedio;
						*/

						if (lsPromedio>maxPromedio)
							maxPromedio=lsPromedio;

						if (liPromedio<minPromedio)
							minPromedio=liPromedio;

						var dif = (maxPromedio-minPromedio)/6;
						minPromedio = minPromedio - dif;
						if (minPromedio<0)
							minPromedio=0;
						maxPromedio = maxPromedio + dif;
							 						

						//ajustamos max y min de desviacion
						if (objDesviacion>maxPromedioDesviacion)
							maxPromedioDesviacion=objDesviacion;

						if (objDesviacion<minPromedioDesviacion)
							minPromedioDesviacion=objPromedio;

						var dif = (maxPromedioDesviacion-minPromedioDesviacion)/6;
						minPromedioDesviacion = minPromedioDesviacion - dif;
						if (minPromedioDesviacion<0)
							minPromedioDesviacion=0;
						maxPromedioDesviacion = maxPromedioDesviacion + dif;
							 						



						oSeriesPromedio.push(oSeriePromedio);
						oSeriesDesviacion.push(oSerieDesviacion);
						//console.log(oSeriesDesviacion);

						
						var fechaBase = fechaServiceIni.split("-");				
						var fechDesde = formatearFecha_DD_MM_YYYY(fechaServiceIni, "-").replace(/-/gi,"/");
						var fechHasta = formatearFecha_DD_MM_YYYY(fechaService, "-").replace(/-/gi,"/");

						//cargamos el chart promedio		
						var oChartCalidadPromedio = Highcharts.chart('chart-calidad-promedio', Highcharts.merge(

						{
						chart: {
							type: "column"
						},
					    title: {
					        text: 'Promedio'
					    },
					    subtitle: {
					        text: 'Periodo del ' + fechDesde + " al " + fechHasta + ""
					    },
					    credits: {
							enabled: false
						},
					    yAxis: {
					        title: {
					            text: 'Promedio'
					        },

					        min: minPromedio,
        					max: maxPromedio,

					        plotLines: [{
					            color: colorZonaBaja,
					            width: 2,
					            value: liPromedio,
					            label: {
				                    text:  liPromedio,
				                    verticalAlign: 'bottom',
				                    textAlign: 'right',
				                    style: {
					                    color: colorZonaBaja,
					                    fontWeight: 'bold',
					                    fontSize: '11px',
				                	}
				                },
					        },
					        {
					            color: colorZonaAlta,
					            width: 2,
					            value: lsPromedio,
					            label: {
				                    text:  lsPromedio,
				                    verticalAlign: 'bottom',
				                    textAlign: 'right',
				                    style: {
					                    color: colorZonaAlta,
					                    fontWeight: 'bold',
					                    fontSize: '11px',
				                	}
				                }
					        }]
					        
					    },
					    xAxis: [{
								type: 'datetime'
							}],   
					    legend: {
					        layout: 'vertical',
					        align: 'right',
					        verticalAlign: 'middle'
					    },

					    plotOptions: {
					        series: {            

					            pointInterval: 86400000, // 1d
								pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
					        }
					    },

					    series: oSeriesPromedio,
					  
					    responsive: {
					        rules: [{
					            condition: {
					                maxWidth: 500
					            },
					            chartOptions: {
					                legend: {
					                    layout: 'horizontal',
					                    align: 'center',
					                    verticalAlign: 'bottom'
					                }
					            }
					        }]
					    }

						}
						,
						   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
						)

						);	




						//cargamos el chart desviacion		
						var oChartCalidadDesviacion = Highcharts.chart('chart-calidad-desviacion', Highcharts.merge(

						{
						chart: {
							type: "column"
						},
					    title: {
					        text: 'Desviación'
					    },
					    subtitle: {
					        text: 'Periodo del ' + fechDesde + " al " + fechHasta + ""
					    },
					    credits: {
							enabled: false
						},
					    yAxis: {
					        title: {
					            text: 'Desviación'
					        },

					        min: minPromedioDesviacion,
        					max: maxPromedioDesviacion,

					        plotLines: [{
					            color: '#FF0000',
					            width: 2,
					            value: objDesviacion,
					            label: {
				                    text:  objDesviacion,
				                    verticalAlign: 'bottom',
				                    textAlign: 'right',
				                    style: {
					                    color: '#FF0000',
					                    fontWeight: 'bold',
					                    fontSize: '11px',
				                	}
				                },
					        },/*
					        {
					            color: '#008000',
					            width: 2,
					            value: ls,
					            label: {
				                    text:  ls,
				                    verticalAlign: 'bottom',
				                    textAlign: 'right',
				                    style: {
					                    color: '#008000',
					                    fontWeight: 'bold',
					                    fontSize: '11px',
				                	}
				                }
					        }*/]
					        
					    },
					    xAxis: [{
								type: 'datetime'
							}],   
					    legend: {
					        layout: 'vertical',
					        align: 'right',
					        verticalAlign: 'middle'
					    },

					    plotOptions: {
					        series: {            

					            pointInterval: 86400000, // 1d
								pointStart: Date.UTC(fechaBase[0], fechaBase[1]-1, fechaBase[2], 0, 0, 0)	,	
					        }
					    },

					    series: oSeriesDesviacion,
					  
					    responsive: {
					        rules: [{
					            condition: {
					                maxWidth: 500
					            },
					            chartOptions: {
					                legend: {
					                    layout: 'horizontal',
					                    align: 'center',
					                    verticalAlign: 'bottom'
					                }
					            }
					        }]
					    }

						}
						,
						   ( $("body").hasClass("dark-mode") ? getTemaDarkHighCharts() : null )
						)

						);


						
					});
				},
				complete: function(){
					


				}
			});

			
				
		}

	});
}

