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


##Creando las replicas


###Descargar el contenedor oficial de mongo
```
sudo service dockerd start
sudo docker pull mongo
```

###crear la red de las replicas
```
sudo docker network create mongo-replicas-network
```

###creando las replicas
**Cada replica en una terminal distinta**

**Si los contenedores estan creados se deben ejecutar de la siguiente manera**

`sudo docker start -i #nombrecontainer`

**Si no estan creados**
```
sudo docker run \
-p 30001:27017 \
--name mongo1 \
--net mongo-replicas-network \
mongo mongod --replSet mongo-replicas-network

sudo docker run \
-p 30002:27017 \
--name mongo2 \
--net mongo-replicas-network \
mongo mongod --replSet mongo-replicas-network

sudo docker run \
-p 30003:27017 \
--name mongo3 \
--net mongo-replicas-network \
mongo mongod --replSet mongo-replicas-network

sudo docker run \
-p 30004:27017 \
--name arbiter \
--net mongo-replicas-network \
mongo mongod --replSet mongo-replicas-network
```

###Configuramos las replicas
```
docker exec -it mongo1 mongo
#ejecutamos en mongo
config = {
  	"_id" : "mongo-replicas-network",
  	"members" : [
  		{
  			"_id" : 0,
  			"host" : "mongo1:27017"
  		},
  		{
  			"_id" : 1,
  			"host" : "mongo2:27017"
  		},
  		{
  			"_id" : 2,
  			"host" : "mongo3:27017"
  		},
  		{
  			"_id" : 3,
  			"host" : "arbiter:27017",
  			"arbiterOnly" : true
  		}
  	]
  }
  rs.initiate(config)

```


##Generación de BD
```
//levantar las replicas de mongo
`sudo docker start -i mongo1`
`sudo docker start -i mongo2`
`sudo docker start -i mongo3`
`sudo docker start -i arbiter`
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
