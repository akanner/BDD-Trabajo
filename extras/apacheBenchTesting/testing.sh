#testea una serie de URLs que se encunetran en un archivo de texto enviado por parametro

#setea a ; como separador del archivo
OIFS=$IFS
IFS=";"

#checkea que el archivo pasado por parametro exista
if [ ! -f "$1" ]
  then
    echo "the file $1 does not exists."
    exit 404
fi
filename="$1"
#lee todos los renglones del archivo
while read -r url method extraParams
do
    printf "<h2>TESTING $method - $url</h2>"
    parameters="-n 100 -c 10"
    if [[ !  -z  $extraParams ]]
    	then
    		parameters="$parameters $extraParams"
		fi
		echo $parameters
	IFS=$OIFS 
	#algo raro pasa cuando el IFS es ;, el comando no se ejecuta con todos los parametros
	#debe tener algo que ver con que $parameters es un string con espacios con todos los parametros
	#-n 100 -c 10 -w -T application/json -p ./dataPost/post_title.json
	#al no separar en espacios lo debe tomar como un solo parametro o lo debe eliminar del comando
	
    ab $parameters "${url}" | sed 1,7d #elimina las primeras 7 lineas de header del reporte de apache bench
    IFS=";"
done < "$filename"

