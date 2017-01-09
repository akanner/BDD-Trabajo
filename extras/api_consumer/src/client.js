var request = require('request');
var rp = require('request-promise');
var randomstring = require("randomstring");
//cantidad de entidades generadas
var config = require("./config.json");
//sequence
var Sequence = exports.Sequence || require('sequence').Sequence
, sequence = Sequence.create()
, err
;
var forAllAsync = exports.forAllAsync || require('forallasync').forAllAsync
, maxCallsAtOnce = 4 // default
, arr
;
//ARRAYS QUE GUARDAN LOS IDS INSERTADOS PARA CONSTRUIR RELACIONES
var paymentsIds = [];
var employeesIds = [];
var projectsIds = [];
/**
 * FUNCIONES UTILITARIAS
 * SE PUEDEN SEPARAR EN OTRO ARCHIVO
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElementInArray(array){
    var min = 0;
    var max = array.length - 1;
    var arrayIndex = getRandomInt(min,max);

    return array[arrayIndex];
}
//FIN FUNCIONES UTILITARIAS





//#############################################################################################
//FUNCIONES QUE CREAN LOS REQUERIMIENTOS PARA LA API
//TODO: pasar las urls al archivo de config
function createPaymentHttpRequest(){
	var randomSalary = getRandomInt(10000,100000);
 	var randomTitle  = randomstring.generate(8);

 	var httpRequest = {uri: 'http://localhost:8000/api/payment',method: "POST", body: {title: randomTitle,salary: randomSalary},json:true};

 	return httpRequest;
 }

 function createEmployeeHttpRequest(){
    var paymentId  = getRandomElementInArray(paymentsIds);
    var randomName = randomstring.generate(40);

    var httpRequest = {uri: 'http://localhost:8000/api/employee',method: "POST", body: {title: paymentId,ename: randomName},json:true};

 	return httpRequest;
 }

  function createProjectHttpRequest(){
    var randomName = randomstring.generate(40);
    var randomBudget = getRandomInt(10000,1000000);
    var httpRequest = {uri: 'http://localhost:8000/api/project',method: "POST", body: {pname: randomName,budget: randomBudget},json:true};

 	return httpRequest;
 }

 function createAssignationHttpRequest(){
 	var randomResponsibility = randomstring.generate(10);
 	var randomDuration = getRandomInt(40,160);
 	var empId = getRandomElementInArray(employeesIds);
 	var projId = getRandomElementInArray(projectsIds);

 	var httpRequest = {
 		uri: 'http://localhost:8000/api/assignment/',
 		method: 'POST',
 		body: {
 			employee: empId,
 			project: projId,
 			responsibilities: randomResponsibility,
 			duration: randomDuration,
 		},
 		json: true
 	}

 	return httpRequest;
 }
 //FIN FUNCIONES DE CREACION DE REQUERIMIENTOS
 //##############################################################################################

 //##############################################################################################
 //FUNCIONES QUE CREAN ARRAYS CON REQUERIMIENTOS PARA LA API

 function createEmployeesHttpRequests(){
 	 var employeesHttpRequests = []
	 for (i = 0; i < config.generatedEmployees; i++) { 
	    employeesHttpRequests.push(createEmployeeHttpRequest());
	}

	return employeesHttpRequests;
 }

function createPaymentsHttpRequests(){
 	var paymentsHttpRequests = []
 	for (i = 0; i < config.generatedPayments; i++) { 
	    paymentsHttpRequests.push(createPaymentHttpRequest());
	}

	return paymentsHttpRequests;
}

  function createProjectsHttpRequests(){
 	 var projectsHttpRequests = []
	 for (i = 0; i < config.generatedProjects; i++) { 
	    projectsHttpRequests.push(createProjectHttpRequest());
	}

	return projectsHttpRequests;
 }

function createAssignmentsHttpRequests(){
 	 var paymentsHttpRequests = []
	 for (i = 0; i < config.generatedAssignations; i++) { 
	    paymentsHttpRequests.push(createAssignationHttpRequest());
	}

	return paymentsHttpRequests;
 }
 //FIN FUNCIONES DE CREACION DE ARRAY DE REQUERIMIENTOS
 //###############################################################################################



function makePaymentRequest(complete, item, i){
 	rp(item)
 		.then(function(httpstring){
 			paymentsIds.push(httpstring.message._id);
 			complete();
 		})
 }

function makeEmployeeRequest(complete,item,i){
 	rp(item)
 		.then(function(httpstring){
 			employeesIds.push(httpstring.message._id);
 			complete();
 		})
 }

function makeProjectRequest(complete,item,i){
 	rp(item)
 		.then(function(httpstring){
 			projectsIds.push(httpstring.message._id);
 			complete();
 		})
 }

 function makeAssignmentRequest(complete,item,i){
 	rp(item)
 		.then(function(httpstring){
 			complete();
 		})
 }


//PRINCIPAL


 //crea los requerimientos para los payments
 var paymentsHttpRequests = createPaymentsHttpRequests();
//espera a que todos los requerimientos finalicen, luego resuelve la promesa
console.log("creando payments...");
forAllAsync(paymentsHttpRequests, makePaymentRequest, 100)
	.then(function(){
		console.log("creando employees...");
		var employeesHttpRequests = createEmployeesHttpRequests();
		//envia los requerimientos para crear los empleados (100 a la vez)
		forAllAsync(employeesHttpRequests,makeEmployeeRequest,100)
			.then(function(){
				console.log("creando projects...");
				var projectsHttpRequests = createProjectsHttpRequests();
				//envia los requerimientos para crear los proyectos (100 a la vez)
				forAllAsync(projectsHttpRequests,makeProjectRequest,100)
					.then(function(){
						console.log("creando assignments...");
						var asgHttpRequests = createAssignmentsHttpRequests();
						//envia los requerimientos para crear las asignaciones (100 a la vez)
						forAllAsync(asgHttpRequests,makeAssignmentRequest,100)
							.then(function(){
								console.log("listo!");
							})
					})
			})
	
	})
