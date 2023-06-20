 function googleTranslateElementInit() {
        new google.translate.TranslateElement(
            {pageLanguage: 'es'},
            'google_translate_element'
        );
}

function mostrarModal(idModal) {
	//$("#"+idModal).modal();
	$("#"+idModal).css('display','block');
	$("#"+idModal).css('opacity','1');
    $("#"+idModal).css('background-color','#0000007a');
        

	$(".modal-backdrop").css("display","block");
	$(".modal-backdrop").addClass("show");

	$("#"+idModal+ " .close").off("click");
	$("#"+idModal+ " .close").on("click", function(){
		ocultarModal(idModal);
	});

	$("#"+idModal+ " .ocultar-modal").off("click");
	$("#"+idModal+ " .ocultar-modal").on("click", function(){
		ocultarModal(idModal);
	});
	
}


function ocultarModal(idModal) {
	//$("#"+idModal).modal('hide');
	$("#"+idModal).css('display','none');
	$("#"+idModal).css('opacity','0');
    $("#"+idModal).css('background-color','initial');

	$(".modal-backdrop").css("display","none");
	$(".modal-backdrop").removeClass("show");
}

Array.prototype.distinct = function(item){
  var results = [];
    for (var i = 0, l = this.length; i < l; i++)
        if (!item){
            if (results.indexOf(this[i]) === -1)
                results.push(this[i]);
            } else {
            if (results.indexOf(this[i][item]) === -1)
                results.push(this[i][item]);
        }
    return results;
};


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

function obtener_cadena_fecha_clasico(fecha){

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

    rpta = dd + '/' + mm + '/' + yyyy;
    return rpta;
}


function ValidaAutenticacion(){

	//validamos si el usuario esta en el querystring
	if( capturarValorURL("usuario") == false ) {

		//validamos si el usuario esta definido en el localStorage
		var usuario = window.localStorage.usuario; 		

		if( usuario == false || usuario == "" || usuario == undefined ) {
	    	window.location.href = parametros.url_autenticacion;
	    }
	    else{
	        return;
	    }
	}
	else{
		window.localStorage.usuario = capturarValorURL("usuario").replace(/%20/gi," "); 
		window.location.href = window.location.href.split("?")[0];
	}		
	    
}

function capturarValorURL(tag_url) {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0; i < vars.length; i++) {
	   var pair = vars[i].split("=");
	   if(pair[0] == tag_url) {
		   return pair[1];
	   }
   }
   return false;
}

function aumentar_n_meses(fecha, meses){
	//fecha en formato: yyy-MM-dd
	var aFecha = fecha.split("-");
	var dFecha = new Date(aFecha[0],aFecha[1]-1,aFecha[2]);
	dFecha.setMonth(dFecha.getMonth() + meses);

	var dd = dFecha.getDate();
	var mm = dFecha.getMonth()+1;
	var yy = dFecha.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	return yy + '-' + mm + '-' + dd;		
}


function aumentar_n_dias(fecha, dias){
	//fecha en formato: yyy-MM-dd
	var aFecha = fecha.split("-");
	var dFecha = new Date(aFecha[0],aFecha[1]-1,aFecha[2]);
	dFecha.setDate(dFecha.getDate() + dias);

	var dd = dFecha.getDate();
	var mm = dFecha.getMonth()+1;
	var yy = dFecha.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	return yy + '-' + mm + '-' + dd;		
}


function restarFechasADias(fechaini,fechafin){
    var dFechaIni = new Date(fechaini);
    var dFechaFin = new Date(fechafin);
    var resta = dFechaFin.getTime() - dFechaIni.getTime()
    var dias = Math.round(resta/ (1000*60*60*24));
    return dias;        
}

function addCommas(nStr)
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}



function getTemaDarkHighCharts(){
	 return {
    colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
        '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
    chart: {
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2b3035'],
                [1, '#2b3035']
            ]
        },
        style: {
            fontFamily: '\'Unica One\', sans-serif'
        },
        plotBorderColor: '#606063'
    },
    title: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase',
            fontSize: '20px'
        }
    },
    subtitle: {
        style: {
            color: '#E0E0E3',
            textTransform: 'uppercase'
        }
    },
    xAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
            style: {
                color: '#A0A0A3'

            }
        }
    },
    yAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
            style: {
                color: '#A0A0A3'
            }
        }
    },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#F0F0F3',
                style: {
                    fontSize: '13px'
                }
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: '#505053'
        },
        candlestick: {
            lineColor: 'white'
        },
        errorbar: {
            color: 'white'
        }
    },
    legend: {
        //backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: '#2b3035',
        
        itemStyle: {
            color: '#E0E0E3'
        },
        itemHoverStyle: {
            color: '#FFF'
        },
        itemHiddenStyle: {
            color: '#606063'
        },
        title: {
            style: {
                color: '#C0C0C0'
            }
        }
    },
    credits: {
        style: {
            color: '#666'
        }
    },
    labels: {
        style: {
            color: '#707073'
        }
    },

    drilldown: {
        activeAxisLabelStyle: {
            color: '#F0F0F3'
        },
        activeDataLabelStyle: {
            color: '#F0F0F3'
        }
    },

    navigation: {
        buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: '#505053'
            }
        }
    },

    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                }
            }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },

    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
        },
        xAxis: {
            gridLineColor: '#505053'
        }
    },

    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
    }
};

}









/* inicio - heradadas del anterior dashboard */

function restar_n_dias(fecha, dias){
	//fecha en formato: yyy-MM-dd
	var aFecha = fecha.split("-");
	var dFecha = new Date(aFecha[0],aFecha[1]-1,aFecha[2]);
	dFecha.setDate(dFecha.getDate() - dias + 1);

	var dd = dFecha.getDate();
	var mm = dFecha.getMonth()+1;
	var yy = dFecha.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	return yy + '-' + mm + '-' + dd;		
}

function agregar_cero(parametro) {
	var valor;	
	if( parametro < 10 ){
		valor = "0"+(parametro);
	}else{
		valor = parametro;
	}	
	return valor;
}


function formatearFecha_DD_MM_YYYY(fecha, simbolo) {
	var stringFech;
	fecha = fecha.split(simbolo);
	//concatenado con el simbolo enviado
	stringFech = fecha[2]+simbolo+fecha[1]+simbolo+fecha[0];
	
	return stringFech;
}

function formatearNumero(numero,decimales){
	return numero.toLocaleString('es-PE', { style: 'decimal', maximumFractionDigits: decimales });
}

/* fin - heradadas del anterior dashboard */


function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//FUNCIONES DE REDONDEO
(function() {
  /**
   * Ajuste decimal de un número.
   *
   * @param {String}  tipo  El tipo de ajuste.
   * @param {Number}  valor El numero.
   * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
   * @returns {Number} El valor ajustado.
   */
  function decimalAdjust(type, value, exp) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();


function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}


function obtener_cadena_fecha_y_hora_estandar_con_ms(fecha){

    var rpta="";
    var dd = fecha.getDate();
    var mm = fecha.getMonth()+1; //January is 0!
    var yyyy = fecha.getFullYear();

    var hh = fecha.getHours();
    var mi = fecha.getMinutes();
    var ss = fecha.getSeconds();
    var ms = fecha.getMilliseconds();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    if(hh<10) {
        hh = '0'+hh
    } 

    if(mi<10) {
        mi = '0'+mi
    } 

    if(ss<10) {
        ss = '0'+ss
    } 

    if(ms<10) {
        ms = '00'+ms
    } 
    else if(ms<100) {
        ms = '0'+ms
    } 

    rpta = "" + yyyy + mm + dd + hh + mi + ss + ms;
    return rpta;
}


function esImagen(archivo){
    var extension = archivo.substring(archivo.lastIndexOf('.')+1,archivo.length);
    if (extension.toUpperCase()=="BMP" || extension.toUpperCase()=="GIF" || extension.toUpperCase()=="EXIF" ||
        extension.toUpperCase()=="JPG" || extension.toUpperCase()=="JPEG" || extension.toUpperCase()=="PNG" ||
        extension.toUpperCase()=="TIFF"){

        return true
    }
    else
        return false;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function filtrarUnicos (arreglo){
    return unique = arreglo.filter(onlyUnique);
}


function usuarioPerteneceAlGrupo(usuario, grupo){
    var rpta=false;
    var ipService = parametros.servidor + parametros.aplicacion;

    $.ajax({ 
        url: ipService+"/Seguridad.svc/UsuarioPerteneceAlGrupo?usuario="+usuario+"&grupo="+grupo, 
        dataType: 'json', 
        data: null, 
        async:  false, 
        beforeSend: function (){
        }, 
        success: function(data){ 
            rpta=data;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);            
            rpta=false;
        },
        complete: function(){
        }

    });

    return rpta;
}


function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function deleteCookie(name) {
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}