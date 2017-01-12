#Requisitos
- Docker

#Creando las replicas


##Descargar el contenedor oficial de mongo
```
sudo service dockerd start
sudo docker pull mongo
```

##crear la red de las replicas
```
sudo docker network create mongo-replicas-network
```

##creando las replicas
**Cada replica en una terminal distinta**
**Si los contenedores estan creadas se deben ejecutar de la siguiente manera **
`docker start -i #nombrecontainer`

**Si no estan creadas**
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

##Configuramos las replicas
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
