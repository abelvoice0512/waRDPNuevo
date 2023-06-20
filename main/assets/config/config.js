
/* local */
/*
var parametros = {
	servidor: "http://localhost:6613",
	aplicacion: "/",
	aplica_autenticacion: false,
	url_autenticacion: "autenticar.aspx",	
	url_error: "error.html",
	urlCuadernoOcurrencias: "http://srvpiweb/waReportes",
	id_aplicacion: "waRDPNuevo",
	modo_externo: false,
	url_uploads: "http://srvpiweb/dirFiles",
	ws_sap: "http://localhost:11472",
	system_id_sap: "QA1",
	client_sap:"400",
	nro_reintentos_notificacion:3
};
*/


/* desarrollo */

var parametros = {
	servidor: "http://srvpiweb",
	aplicacion: "/svcOperacionesPIDev2",
	aplica_autenticacion: false,
	url_autenticacion: "autenticar.aspx",	
	url_error: "error.html",
	urlCuadernoOcurrencias: "http://srvpiweb/waReportes",
	id_aplicacion: "waRDPNuevo",
	modo_externo: false,
	url_uploads: "http://srvpiweb/dirFiles",
	ws_sap: "http://srvpiweb/wsUNACEMSAPPIDev",
	system_id_sap: "QA2",
	client_sap:"400",
	nro_reintentos_notificacion:3
};


/* produccion */
/*
var parametros = {
	servidor: "http://srvpiweb",
	aplicacion: "/svcOperacionesPI",
	aplica_autenticacion: false,
	url_autenticacion: "autenticar.aspx",	
	url_error: "error.html",
	urlCuadernoOcurrencias: "http://srvpiweb/waReportes",
	id_aplicacion: "waRDPNuevoPrd",
	modo_externo: false,
	url_uploads: "http://srvpiweb/dirFiles",
	ws_sap: "http://srvpiweb/wsUNACEMSAPPIDev",
	system_id_sap: "QA1",
	client_sap:"400",
	nro_reintentos_notificacion:3
};
*/



var usuarios_rol = [
	{
		opcion: "mantcalidad",
		usuario: "DesarrolloGM",
		roles: [
			{
				rol:"Edicion"
			}
		]
	},
	{
		opcion: "mantcalidad",
		usuario: "AljovinJ",
		roles: [
			{
				rol:"Edicion"
			}
		]
	},
];

var colores_dark = {
	TipoI: "#36a532",
	TipoGU: "#FFFF66",
	TipoHS: "#ACACA8",
	TipoICon: "#B26BFF",
	TipoV: "#3E98D3",
	TipoICo: "#E08A00",
	TipoIP: "#F65737",	
	TOTAL: "#ffffff",
	HTipoHS: "#3366cc",

	"Cemento-TipoI": "#36a532",	
	"Cemento-TipoGU": "#FFFF66",
	"Cemento-TipoHS": "#ACACA8",
	"Cemento-TipoICon": "#B26BFF",
	"Cemento-TipoV": "#3E98D3",
	"Cemento-TipoICo": "#E08A00",
	"Cemento-TipoIP": "#F65737",		
	"Cemento-HTipoHS": "#3366cc",

	"Crudo-TipoI": "#827d72",	
	"Crudo-TipoGU": "#FFFF66",
	"Crudo-TipoHS": "#ACACA8",
	"Crudo-TipoICon": "#B26BFF",
	"Crudo-TipoV": "#3E98D3",
	"Crudo-TipoICo": "#E08A00",
	"Crudo-TipoIP": "#F65737",		
	"Crudo-HTipoHS": "#3366cc"

}


var colores = {
	TipoI: "#36a532",
	TipoGU: "#FFFF66",
	TipoHS: "#ACACA8",
	TipoICon: "#B26BFF",
	TipoV: "#3E98D3",
	TipoICo: "#E08A00",
	TipoIP: "#F65737",	
	TOTAL: "#434A54",
	HTipoHS: "#3366cc",

	"Cemento-TipoI": "#36a532",	
	"Cemento-TipoGU": "#FFFF66",
	"Cemento-TipoHS": "#ACACA8",
	"Cemento-TipoICon": "#B26BFF",
	"Cemento-TipoV": "#3E98D3",
	"Cemento-TipoICo": "#E08A00",
	"Cemento-TipoIP": "#F65737",		
	"Cemento-HTipoHS": "#3366cc",

	"Crudo-TipoI": "#827d72",	
	"Crudo-TipoGU": "#FFFF66",
	"Crudo-TipoHS": "#ACACA8",
	"Crudo-TipoICon": "#B26BFF",
	"Crudo-TipoV": "#3E98D3",
	"Crudo-TipoICo": "#E08A00",
	"Crudo-TipoIP": "#F65737",		
	"Crudo-HTipoHS": "#3366cc"

}


var url_pivision_procesos = {
	"Pre-Homogeneización":"https://piatc.unacem.com.pe/PIVision/#/Displays/2017/Apilado---Stock-v2",
	"Molienda de Crudo":"https://piatc.unacem.com.pe/PIVision/#/Displays/1252/Silos-de-Crudo---Stock-v2",
	"Molienda de Cemento":"https://piatc.unacem.com.pe/PIVision/#/Displays/1251/Silo-de-Cemento---Stock-v2",
	"Molienda de Carbon":"https://piatc.unacem.com.pe/PIVision/#/Displays/1172/Silo-de-Carbon---Stock"
}


var colores_maquina = [
	{
		"maquina":"ChPrimaria",
		"color":"#464236",
		"color2":"#343129"
	},
	{
		"maquina":"Ch.Hischmann",
		"color":"#384636",
		"color2":"#30382f"
	},
	{
		"maquina":"Ch.Pensylvania",
		"color":"#3b3f52",
		"color2":"#303342"
	},
	{
		"maquina":"Apilado",
		"color":"#383646",
		"color2":"#2f2c44"
	},
	{
		"maquina":"PCR1",
		"color":"#1d374a",
		"color2":"#182c3a"
	},
	{
		"maquina":"PCR2",
		"color":"#304a1d",
		"color2":"#263a17"
	},
	{
		"maquina":"PCR3",
		"color":"#1d4a46",
		"color2":"#1a3835"
	},
	{
		"maquina":"PCR4",
		"color":"#1d254a",
		"color2":"#202334"
	},
	{
		"maquina":"Arrastre",
		"color":"#47354e",
		"color2":"#392d3e"
	},
	{
		"maquina":"Horno I",
		"color":"#183d48",
		"color2":"#18323a"
	},
	{
		"maquina":"Horno II",
		"color":"#18482d",
		"color2":"#183c28"
	},
	{
		"maquina":"MC",
		"color":"#46342d",
		"color2":"#3a2b25"
	},
	{
		"maquina":"MS",
		"color":"#2d3146",
		"color2":"#272a3a"
	},
	{
		"maquina":"MCRUDO",
		"color":"#422244",
		"color2":"#361f38"
	},
	{
		"maquina":"PK1",
		"color":"#262030",
		"color2":"#1c1824"
	},
	{
		"maquina":"PK2",
		"color":"#202930",
		"color2":"#1a1f24"
	},
	{
		"maquina":"PK3",
		"color":"#203026",
		"color2":"#1b261f"
	},
	{
		"maquina":"PK4",
		"color":"#302f20",
		"color2":"#242319"
	},
	{
		"maquina":"Planta 1 Carbon",
		"color":"#4c3737",
		"color2":"#342828"
		
	},
	{
		"maquina":"Planta 2 Carbon",
		"color":"#37394c",
		"color2":"#292a38"
	},
	

	

]








//Edicion

/* interno dev*/
/*
var parametros = {
	servidor: "http://srvpiweb",
	aplicacion: "/svcOperacionesPIDev",
	aplica_autenticacion: true,
	url_autenticacion: "autenticar.aspx",		
};
*/
