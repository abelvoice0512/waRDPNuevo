class FiltroFecha {

  constructor(idPadre, id, fechaFin, miFuncion ) {
    this.idPadre = idPadre;
    this.id = id;
    this.fechaFin = fechaFin; 
    this.miFuncion = miFuncion;

    //$("#"+id).remove();
	
	var oDiv = "";
    oDiv = oDiv + '<div class="contenedor-filtros-grafico row" id="'+ id +'">';

    oDiv = oDiv + '   <div class="col-12 col-sm-3 col-md-3 col-lg-3 col-xl-3">';
    oDiv = oDiv + '      <div class="form-group row">';
	oDiv = oDiv + ' 	    <div class="col-3 col-md-4 align-items-center">';
	oDiv = oDiv	+ '				<label class="col-form-label">Fecha Inicio:</label>';
	oDiv = oDiv + '			</div>';
	oDiv = oDiv	+ '			<div class="col-9 col-md-8 align-items-center" style="padding-right:5px;">';
	oDiv = oDiv	+ "             <input class='form-control filtros-fecha filtros-fecha-ini' type='text' onchange='actualizarDias(\""+ this.id +"\");'  onkeyup='actualizarDias(\""+ this.id +"\");'>";
	oDiv = oDiv	+ '			</div>';
	oDiv = oDiv	+ '		</div>';
	oDiv = oDiv + '   </div>';

	oDiv = oDiv + '   <div class="col-12 col-sm-3 col-md-3 col-lg-3 col-xl-3">';
    oDiv = oDiv + '      <div class="form-group row">';
	oDiv = oDiv + ' 	    <div class="col-3 align-items-center">'	;
	oDiv = oDiv	+ '				<label class="col-form-label">Dias:</label>';
	oDiv = oDiv + '			</div>';
	oDiv = oDiv	+ '			<div class="col-9 align-items-center" style="display: inherit;">';	
	oDiv = oDiv	+ "             <i class='fas fa-caret-left' onclick='disminuirDias(\"" + this.id + "\");'></i>";
	oDiv = oDiv	+ "             <input class='form-control filtros-dias' type='text' onchange='actualizarFechaIni(\""+ this.id +"\");'  onkeyup='actualizarFechaIni(\""+ this.id +"\");'>";
	oDiv = oDiv	+ "             <i class='fas fa-caret-right' onclick='aumentarDias(\"" + this.id + "\");'></i>";
	oDiv = oDiv	+ '			</div>';
	oDiv = oDiv	+ '		</div>';
	oDiv = oDiv + '   </div>';

    oDiv = oDiv + '	 <div class="col-12 col-sm-3 col-md-3 col-lg-3 col-xl-3">';
	oDiv = oDiv +		'<div class="form-group row">';		
	oDiv = oDiv +			'<div class="col-3 col-md-4 align-items-center">';									
	oDiv = oDiv +				'<label class="col-form-label">Fecha Fin:</label>';
	oDiv = oDiv +			'</div>';
	oDiv = oDiv +			'<div class="col-9 col-md-8 align-items-center" style="padding-right:5px;">';	
	oDiv = oDiv +				"<input class='form-control filtros-fecha filtros-fecha-fin' type='text' onchange='actualizarFechaIni(\""+ this.id +"\");'  onkeyup='actualizarFechaIni(\""+ this.id +"\");'>";
	oDiv = oDiv +			'</div>';
	oDiv = oDiv +		'</div>';
	oDiv = oDiv + '	 </div>';

	oDiv = oDiv + '  <div class="col-12 col-sm-3 col-md-2 col-lg-3 col-xl-3">';
	oDiv = oDiv +	 	'<div class="form-group row">';
	oDiv = oDiv +			'<div class="col-12 align-items-center text-sm-center text-right">';
	oDiv = oDiv +				"<button type='button' class='btn btn-primary filtros-graficar' onclick='graficar(\"" + this.id + "\",\"" + this.miFuncion + "\");' >";
	oDiv = oDiv +                  '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    oDiv = oDiv +                  'Graficar';
	oDiv = oDiv +               '</button>';
	oDiv = oDiv +			'</div>';
	oDiv = oDiv +	 	'</div>';
	oDiv = oDiv + '	</div>';
	
	oDiv = oDiv + '</div>';


	$(oDiv).appendTo("#"+this.idPadre);

	jQuery('.filtros-fecha').datetimepicker({
         timepicker:false,
         format:'Y-m-d'
      });
    $.datetimepicker.setLocale('es');

    $("#" + id + " .filtros-fecha-fin").val(this.fechaFin);
	$("#" + id + " .filtros-dias").val(15);

	$("#" + id + " .spinner-border").hide();

	actualizarFechaIni(id);

}

  

  hello() {
    return $("#"+this.idPadre);
  }

  obtenerDias(){
  	var nDias = parseInt($("#" + this.id + " .filtros-dias").val()); 
  	return nDias;
  }

  obtenerFechaIni(){
  	var cFechaIni = $("#" + this.id + " .filtros-fecha-ini").val(); 
  	return cFechaIni; 
  }

  obtenerFechaFin(){
  	var cFechaFin = $("#" + this.id + " .filtros-fecha-fin").val();  
  	return cFechaFin;
  }

  recalcular(cFechaFin, nDias){
  	$("#" + this.id + " .filtros-fecha-fin").val(cFechaFin);  
  	$("#" + this.id + " .filtros-dias").val(nDias)
  	actualizarFechaIni(this.id);
  	eval(this.miFuncion);  	
  }

  mostrarSpinner(){
  	 $("#" + this.id + " .spinner-border").show();
  }

  ocultarSpinner(){
  	 $("#" + this.id + " .spinner-border").hide();
  }

}


function graficar(id, miFuncion){		
	eval(miFuncion);	
}


function disminuirDias(id){
	
  	var nDias = parseInt($("#" + id + " .filtros-dias").val());  	
	
	if (isNaN(nDias)) {  			
  		return;
  	}

  	if(nDias<=1) 
  		return;

  	$("#" + id + " .filtros-dias").val(nDias-1);
  	actualizarFechaIni(id);	
  	
}


function aumentarDias(id){
	

	var nDias = parseInt($("#" + id  + " .filtros-dias").val());

	if (isNaN(nDias)) {  			
  		return;
  	}  		

  	$("#" + id + " .filtros-dias").val(nDias+1);
  	actualizarFechaIni(id);

}


function actualizarFechaIni(id){
	try{
  		var cFechaFin = $("#" + id + " .filtros-fecha-fin").val();  			
  		var nDias = parseInt($("#" + id + " .filtros-dias").val());

  		if (isNaN(nDias)) {
  			$("#" + id + " .filtros-fecha-ini").val("");	
  			return;
  		}

  		var dFechaFin = obtenerFechaDeCadena(cFechaFin);			
  		var dFechaIni = dFechaFin;
			
		dFechaIni.setDate(dFechaIni.getDate()-nDias+1);
  			
  		$("#" + id + " .filtros-fecha-ini").val(obtener_cadena_fecha_estandar(dFechaIni));
  	}
  	catch (ex) {
  		console.log(ex);
  	}
}


function actualizarDias(id){
	try{

  		var cFechaIni = $("#" + id + " .filtros-fecha-ini").val();
  		var cFechaFin = $("#" + id + " .filtros-fecha-fin").val();  			

  		var dFechaIni = obtenerFechaDeCadena(cFechaIni);
  		var dFechaFin = obtenerFechaDeCadena(cFechaFin);

  		var nDias = dFechaFin - dFechaIni;
        nDias = Math.floor(nDias / (1000 * 60 * 60 * 24)) + 1;
					  			
  		$("#" + id +" .filtros-dias").val(nDias);
  	}
  	catch (ex) {
  		console.log(ex);
  	}
}



function obtenerFechaDeCadena(cFecha){

	var aFecha = cFecha.split('-');
	var dFecha = new Date(aFecha[0], aFecha[1]-1, aFecha[2], 0, 0, 0, 0);

	return dFecha;
}

function obtener_cadena_fecha_estandar(fecha){

	var rpta="";
	var dd = fecha.getDate();
	var mm = fecha.getMonth()+1; //January is 0!
	var yyyy = fecha.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	rpta = yyyy + '-' + mm + '-' + dd;
	return rpta;
}