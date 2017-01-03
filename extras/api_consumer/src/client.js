var request = require('request');

//cantidad de entidades generadas
var maxEmployeesGenerated = 100000,
	maxProjectsGenerated = 10000

//crea los empleados
console.log("Creando empleados...");


request('http://localhost:8000/api/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage. 
  }
})