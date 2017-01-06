# BDD-Trabajo
Trabajo final de la materia BDD

## Instrucciones 

```
cd src
npm install 
mkdir logs #crea la Carpeta para los logs IMPORTANTE!
sudo service mongod start
node server.js

```
##Generación de BD
```
//levantar el servicio de mongo
sudo service mongod start
//levantar la API
node server.js
//levantar el cliente (en otra terminal)
cd ../extras/api_consumer/src/
npm install
node client.js //tarda unos minutos

```


##TODO(si se quiere seguir luego de la facu)
- Crear una capa de servicios entre los controladores y los modelos de Mongoose para lograr una mejor separación de las capas de la aplicación.
- Mongoose: Usar promises en vez de callbacks. 
- Utilizar herencia entre los controladores y el controlador genérico.
- Utilizar la sintaxis ES6 para lograr una sintaxis similar a java.
- Agregar más opciones de filtros en los métodos GET de la api, como operaciones del estilo LIKE, GREATER THAN o LESSER THAN
