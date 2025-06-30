# Introduccion a Docker (UPDATED 30JUN2025)
Tutorial de introducción a docker y docker-compose creando una aplicación fullstack, con un contenedor node-express para el api, otro con mongodb y otro con nginx para servir los ficheros estáticos.

[NOTAS] 
* Para este ejemplo se ha utilizado un sistema operativo Ubuntu, por lo que todos los ejemplos de instalación de programas se harán para este entorno. Puedes cambiarlo por los de tu sistema operativo.
* El sistema operativo tiene instalado node 8 y npm
* Cuidado con el copy-paste desde el README que puede hacer que no funcione, es preferible bajar el fichero del repo.

## ¿Qué es docker?

Docker es un proyecto de código abierto que automatiza el despliegue
de aplicaciones dentro de contenedores de software, proporcionando
una capa adicional de abstracción y automatización de virtualización de
aplicaciones en múltiples sistemas operativos [Fuente Wikipedia](https://es.wikipedia.org/wiki/Docker_(software))

Docker es un "emulador" de entornos aislado para poder ejecutar programas sin que afecte a mi sistema operativo (SO) y pudiendose llevar y replicar en otros SS.OO. o entornos.
Parecido a VirtualBox o VMWare, pero mucho más ligero y a nivel de sistema operativo. Básicamente no vas a tener más de un sistema operativo completo corriendo en tu máquina. ![virtualización vs contenedores](https://i.ytimg.com/vi/TvnZTi_gaNc/maxresdefault.jpg)
Docker consta de imágenes y contenedores:
1. Una **imagen** es la especificación inerte, inmmutable, una foto del estado y de unas piezas de software que incluyen desde la aplicación que queremos ejecutar hasta las librerias y todo lo necesario para que corra encima del sistema operativo en el cual se ejecuta.
2. Un **contenedor** es un entorno aislado con la instanciación de una imagen, el cual
se puede configurar.

Una analogía sería que la imagen es la clase y el contenedor el objeto de la clase.

# Instalación de Docker en ubuntu
1. Instalamos docker y docker-compose:
```shell
sudo apt install docker docker-compose
```
2. Añadimos al usuario de ubuntu al grupo docker
```shell
sudo usermod -aG docker $USER
sudo systemctl restart docker
```
3. En https://hub.docker.com/ podemos buscar imagenes de docker ya preparadas
4. Podemos comprobar qué imágenes tenemos con:
```shell
  docker images
```
Si te diera el error: **"Got permission denied while trying to connect to the Docker daemon socket..."** será necesario reiniciar el sistema operativo.

Si te diera el error: **"cannot connect to the docker daemon"** es porque hay que arrancar el servicio.
Sigue los siguientes pasos para solucionarlo: 
```shell
systemctl is-active docker
systemctl start docker
systemctl enable docker
```
Si necesitas mas información sobre cuestiones de docker en https://www.configserverfirewall.com/docker/ puedes encontrarla.
Si no en la página oficial de docker https://www.docker.com/

# Comandos Docker
## Básicos
Listado de imágenes de docker instaladas:
```shell
  docker images
```
Listado de contenedores de docker creados:
```shell
  docker container ls
```
o su alias
```shell
  docker ps
```

Para bajar una de imágen de docker del [docker hub](https://hub.docker.com/):
```shell
  docker pull IMAGEN
```

## Registros de imágenes públicos populares
A parte del repositorio oficial de docker tenemos más repositorios de imágenes publicadas por proveedores, donde podemos encontrar una amplia librería de imágenes de las aplicaciones más populares.

- El [Google Container Registry](https://cloud.google.com/container-registry/)
- [Quay](https://quay.io/)
- [Amazon Container Registry](https://aws.amazon.com/it/ecr/)


## Más comandos
```shell
  docker build -t NOMBRE_IMAGEN .
  docker run NOMBRE_IMAGEN
  docker inspect CONTENEDOR-ID
  docker logs CONTENEDOR-ID
  docker exec -it CONTENEDOR /bin/bash
  docker start / stop / restart CONTENEDOR-ID
  docker stop CONTENEDOR-ID
  docker rm CONTENEDOR-ID
  docker rmi IMAGEN
```

* **build** se utiliza para generar/contruir una imagen a partir del Dockerfile
* **run** se utiliza para lanzar el contenedor a partir de una imagen
* **inspect** se utiliza para obtener información a bajo nivel del contenedor
* **logs** se utiliza para ver la salida generada por consola al ejecutar el contenedor
* **exec** se utiliza para ejecutar comandos en un contenedor que está ejecutandose
* **stop** se utiliza para parar la ejecución de un contenedor que está ejecutandose
* **rm** se utiliza para borrar un contenedor
* **rmi** para borrar una imagen creada

# Pasos para crear y lanzar un contenedor Docker
1. Crear el directorio de trabajo
2. Entrar en el directorio de trabajo
3. Crear el fichero Dockerfile
4. Crear el contenedor: `docker build`
5. Lanzar el contenedor creado: `docker run`
6. Comprobar que está lanzado: `docker ps`
7. Comprobar logs del contenedor: `docker logs`

# Ejemplo: Creando un contenedor nginx

## Levantando el contenedor nginx básico:
```shell
  mkdir docker_example
  cd docker_example
  docker pull nginx
  docker images
  docker ps
  docker run -d --name "web" -p 80:80 nginx;
  docker ps
  docker logs [CONTENEDOR-ID]
  docker inspect [CONTENEDOR-ID]
```
Si no tenemos ningún otro proceso corriendo en el puerto 80 podremos entrar en http://localhost y ver la página por defecto de nginx.

## Montando una carpeta compartida entre un directorio local y un directorio dentro del contenedor Docker
```shell
  mkdir www
  cd www
  echo “<h1>MI CONTENEDOR NGINX CON DOCKER</h1>” > index.html
  cd ..
  docker stop web
  docker ps
  docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx;
  docker ps
```
Para comprobar mas contenedores que se hayan podido quedar "zombies" podemos usar la opción -a (--all)
```shell
  docker ps -a
```
Para eliminar un contenedor "zombie" podemos usar el comando rm
```shell
  docker rm [CONTENEDOR-ID]
  docker ps -a
```

Analicemos el comando de ejecución del contenedor con sus parámetros:
```shell
  docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx
```
COMANDO: **run** Sirve para lanzar un contenedor de la imagen nginx, llamado "web"
PARAMETROS:
* **-d** o --detach, ejecuta el contenedor en segundo plano (background).
* **--name** para darle un nombre a nuestro contenedor y sea mas sencillo referenciarlo e identificarlo.
* **-v** le indicamos que monte un [volumen](http://www.alegsa.com.ar/Dic/volumen.php) que enlaza desde la ruta local *$(pwd)/www*  a la ruta dentro del contenedor */usr/share/nginx/html* nginx que es la que utiliza este programa para servir
* **-p** conectamos el puerto 80 de nuestra máquina con el puerto 80 del contenedor, que como tiene el servidor nginx corriendo en dicho puerto, estaremos dando acceso al puerto del contenedor desde nuestro puerto, siempre y cuando este esté libre, si no deberemos ponerlo en un puerto libre de nuestro equipo.

Podemos comprobarlo:
* Comprobamos http://localhost en un navegador
* Modificamos index.html
* Comprobamos http://localhost en un navegador

# Ejercicios
1. Clonar un componente Polymer y hacer que se muestre la demo en un contenedor de nginx
2. Arrancar tres contenedores de nginx en los puertos 80, 8080 y 8081

# Haciendo más cosas con Docker

## ¿Y si necesito crear un servidor express en node para exponer un api que se alimente de mongodb?
Pues lo ideal es separar el servidor node-express del servidor de mongodb.
De esta manera si necesito escalar o cambiar uno de los dos, el otro no tiene por qué verse afectado. Seguiremos los siguientes pasos:

1. Vamos a crear un contenedor con node-express
2. Vamos a crear un contenedor con un servidor de mongodb
3. Vamos a conectar los dos contenedores: node-express y mongodb

Previamente creamos la carpeta de la aplicación, iniciamos el proyecto node e instalando mongodb:
```shell
  mkdir api (dentro de docker_example)
  cd api
  npm init
  npm install --save express mongodb
```

## 1. Servidor con express

Vamos a crear un fichero index.js con un servidor express mínimo:
```javascript
  const express = require('express');
  const app = express();
  const PORT = 3000;
  app.get('/', function(req, res) {
  	res.json({"hello": "express with mongo"});
  });
  app.listen(PORT, function(){
    console.log('Your node js server is running on PORT:',PORT);
  });
```

Ejecutamos:
```shell
  node index.js
```
Probamos http://localhost:3000 y comprobamos que muestra el json: {"hello": "express with mongo"}

Lo siguiente será dockerizarlo.

## Comandos de Dockerfile
* *FROM* nos permite especificar desde qué imagen base de Docker Hub
(https://hub.docker.com/) queremos construir.
* *RUN* nos permite ejecutar un comando.
* *WORKDIR* establece un directorio como el directorio de trabajo para las
instrucciones COPY, RUN y CMD.
* *COPY* y *ADD* permite copiar archivos o un directorio completo desde una fuente fuera
del contenedor a un destino dentro del contenedor.
* *EXPOSE* expone el puerto en el que el contenedor escuchará.
* *CMD* establece el comando predeterminado para ejecutar nuestro contenedor.Nuestro Dockerfile para el api node-express

## Creamos el fichero Dockerfile con la configuración de nuestra imagen:

Dentro de la carpeta docker_example creamos con un editor un fichero llamado **Dockerfile** y en el añadimos el siguiente contenido:

```shell
  FROM node:8
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD [ "node", "index.js" ]
```

Todos estas órdenes se ejecutan en nuestro contenedor cuando usemos el comando "build" de Docker.

Analicemos el contenido del fichero Dockerfile:
* **FROM node:8** le indica que se baje la imagen node, versión 8, de docker hub.
* **WORKDIR /usr/src/app** le indica que haga un "cd" para trabajar en esa ruta, dentro del contenedor. Si no existiese antes del "cd" haría un "mkdir". Piensa que el contenedor tiene una estructura de un sistema operativo linux.
* **COPY pagacke*.json ./** copia desde nuestro directorio donde se encuentre el Dockerfile los ficheros que cumplan la expresión al directorio que se encuentre el contenedor, que definimos con WORKDIR
* **RUN npm install** ejecuta la instalación del package.json y package-lock.json que hemos copiado en /usr/src/app
* **COPY . .** copia todos los archivos desde nuestro directorio donde se encuentra el Dockerfile, excepto los indicados en el fichero .dockerignore y los copia en el directorio actual de trabajo indicado por WORKDIR
* **EXPOSE 3000** abre el puerto 3000 del contenedor
* **CMD ["node", "index.js"]* es el comando que se queda lanzado en el contenedor.

## Fichero .dockerignore

Creamos el fichero '.dockerignore' para evitar copiar a la imagen los ficheros que no queramos copiar en ella.
```shell
  node_modules
  *.log
  docker-compose.yml
  Dockerfile
  data
```

## Construyendo y corriendo el contenedor node

Construimos la imagen según le indica Dockerfile:
```shell
  docker build -t manufosela:api .
  docker images
```
Lanzamos el contenedor:
```shell
  docker run -p 3000:3000 -d manufosela:api
  docker ps
```

### Pregunta
#### ¿Si cambio algo en el index.js se refleja en http://localhost:3000?
#### ¿Por qué?
No se refleja puesto que en el Dockerfile hemos indicado con *COPY . .* que copiemos toda la carpeta, a excepción de lo indicado en el fichero .dockerignore, en la carpeta de trabajo de la imagen. Una vez copiado ya no es posible alterar su contenido.
Esto es lo que querremos hacer cuando subamos a producción nuestra aplicación, pero no cuando estamos desarrollando.

#### ¿Cómo podemos hacer para que cualquier cambio en mi local se refleje en el servidor node-express?
Como hemos visto antes con el parámetro -v podemos referenciar volumenes de tu equipo dentro del contenedor.

```shell
  docker run -p 3000:3000 -d -v $(pwd)/index.js:/usr/src/app/index.js manufosela:api
```

Modificamos index.js
Tendremos que borrar el contenedor y volver a construirlo y volver a ejecutar el contenedor para que el servidor node-express lea los cambios.

```shell
	docker stop [CONTENEDOR_ID]
	docker rm [CONTENEDOR_ID]
	docker build -t manufosela:api .
	docker run -p 3000:3000 -d manufosela:api
```

Ahora sí se ven reflejados los cambios en http://localhost:3000

Podemos utilizar paquetes de npm, como forever, que detectan cambios en el index.js relanzando el servidor node-express.
Sería necesario por un lado instalar el paquete forever y por otro cambiar el comando CMD para que ejecute forever.
Lo dejo como ejercicio :)

## 2. Docker de mongodb
Vamos a utilizar la imagen ya hecha de mongodb de docker hub:
```shell
  docker pull mongo
  docker images
  docker run -it -d mongo
  docker ps
```
Con esto tenemos corriendo un servidor mongodb que expone el puerto 27017, que es el puerto por defecto de mongo, de manera que tenemos una base de datos mongo corriendo en nuestro equipo, pero sin haber tenido que instalar ni configurar nada y sin que haya "ensuciado" nuestro sistema operativo instalando dependencias o librerias.

### Interactuamos para probar mongodb
Para poder probarlo, primero debemos averiguar la IP del servidor mongodb, para ello ejecutamos:

```shell
  docker ps
```
Nos fijamos, al final, en el nombre aleatorio que le ha dado al contenedor de mongo que serán dos nombres separados por un guion bajo. Usamos dicho nombre para ejecutar lo siguiente:

```shell
  docker run -it --link=[NOMBRE_CONT]:mongo mongo /bin/bash
```
Con esto creamos un contenedor temporal que enlaza con la consola del contenedor que está corriendo el servidor de mongo y entramos en su consola. Lo veremos porque cambia el prompt.

Ahora ejecutamos:

```shell
  env
```
Que nos muestra todas las variables de entorno.
Nos fijamos en la línea que nos muestra **MONGO_PORT_27017_TCP_ADDR** para obtener la ip del contenedor:

```shell
[...]
HOME=/root
SHLVL=1
MONGO_PORT_27017_TCP_ADDR=172.17.0.3
MONGO_ENV_JSYAML_VERSION=3.10.0
MONGO_MAJOR=4.0
[...]
```

Cerramos la consola con `exit`

El comando para ejecutar el cliente de mongodb es `mongo` para lo que deberemos tener instalado el cliente de mongodb en nuestro equipo llamado `mongodb-clients`

Para saber si lo tenemos instalado podemos ejecutar:
```shell
sudo dpkg --get-selections | grep mongo
```
Si no lo está lo podemos instalar con:
```shell
sudo apt install mongodb-clients
```

Si lo ejecutamos simplemente `mongo` y no tenemos un servidor mongodb local corriendo, obtendremos este error: `couldn't connect to server 127.0.0.1:27017, connection attempt failed: SocketException: Error connecting to 127.0.0.1:27017 :: caused by :: Connection refused`

Para poder conectar con el servidor mongodb de nuestro contenedor deberemos indicar la ip y el puerto al que conectarnos:

```shell
mongo 172.17.0.3:27017
```

Esto nos conectará con la línea de comandos de mongo que se caracteriza por tener el prompt **>**
Para interactuar con la base de datos podemos ejecutar algunos comandos de mongo:

```shell
 > show dbs
 > use local
 > show collections
 > db.startup_log.find({})
 > db.startup_log.find({}).pretty()
 > use midb
 > db.micoleccion.insert({elemento:"uno"})
 > show collections
 > db.micoleccion.find()
```

Usamos CTRL+C para salir de la consola de mongo.

## Entendiendo como se crea una imagen de docker

![layered-file-system](https://raw.githubusercontent.com/manufosela/introduccion-docker/master/images/docker_images_example.png)

Tanto en la **Image 1** como en la **Image 2** podemos ver que tienen en común en su Dockerfile la base de node:8, la copia de los ficheros package.json y package-lock.json y la instalación del package.json con **npm install**

A la derecha de cada orden, vemos un "hash", que es el identificador de las imagenes temporales que va creando, conforme va ejecutando cada orden.

Cuando ejecutamos **docker images -a** podemos ver todas las imagenes intermedias que se han creado.

Cuando borramos la imagen "padre", todas las que dependen de esta se borraran tambien.

## 3. Conectar docker node-express con docker mongodb

Para facilitar y conectar el contenedor de node-express con el contenedor de mongodb vamos a valernos de *docker-compose*

![Docker y Docker-compose](http://i66.tinypic.com/2ura0pi.png)


**Docker-compose** nos facilita la orquestación de contenedores para que se relacionen e interactuen entre ellos.
Se configura mediante un archivo *.yml* llamado *docker-compose.yml*
En dicho fichero se indica qué contenedores se enlazan con quien, de manera
que de una sola llamada podemos arrancar, parar y relacionar varios contenedores.

### Creamos el fichero docker-compose.yml
```yml
version: "2"
services:
  app:
    container_name: app
    restart: always
    build: .
    ports:
    - "3000:3000"
    links:
      - mongo
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
```

# Docker-compose

## Paramos los contenedores de node-express y mongodb
Antes de continuar y para poder utilizar docker-compose debemos parar los contenedores que hemos lanzado manualmente.
Para ello ejecutamos:
```shell
docker ps
```
Y anotamos los CONTAINER_ID del contenedor de mongo y node-express, el de nginx podemos dejarlo corriendo.
Una vez tengamos los dos ids ejecutamos:
```shell
docker stop [CONTAINER_ID_NODE] [CONTAINER_ID_MONGO]
```

Con esto los paramos, pero los contenedores siguen lanzados, por lo que ahora deberemos borrarlos:
```shell
docker rm [CONTAINER_ID_NODE] [CONTAINER_ID_MONGO]
```

## Probando docker-compose

Ejecutamos:
```shell
  docker-compose build
  docker-compose up -d
  docker-compose ps
```
Podemos probar que tenemos servidor de node y de mongo corriendo, entrando en [http:localhost:3000] y ejecutando el comando `mongo`, esta vez sin IP ni puerto, ya que docker-compose conecta automaticamente localhost con la IP del contenedor mongo.

Podemos parar y borrar todos los contenedores de una vez.

```shell
  docker-compose down
```
Lo podemos comprobar con:
```shell
  docker-compose ps
  docker ps
```

## Usando mongo en nuestro api

Modificamos el fichero index.js que quedara como sigue:
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

const mongodb = require('mongodb');
const DB = {
	config: 'mongodb://mongo:27017'
};
let dbo;

app.get('/', function (req, res) {
	res.json({ "hello": "express with mongo" });
});

const client = mongodb.MongoClient;
client.connect(DB.config, function (err, db) {
	if (err) {
		console.log('database is not connected')
	}
	else {
		console.log('connected!!');
		dbo = db.db("midb");
	}
});
app.get('/misdatos', function (req, res) {
	let data = dbo.collection("micoleccion").find({}).toArray((err, result) => {
		if (err) throw err;
		res.json(result);
	});
});
app.listen(PORT, function () {
	console.log('Your node js server is running on PORT:', PORT);
});
```

Ahora para que los cambios tengan efecto debemos parar todo, volver a construir los contenedores y volver a lanzarlos:
```shell
  docker-compose down
  docker-compose build
  docker-compose up -d
  docker-compose ps
```

Para poder probar el api debemos cargar con datos la base de datos llamada mibd y la colección de esa base de datos micoleccion

## Probamos los entry-point
Mediante la consola de mongo podemos crear alguna entrada en la base de datos:
```shell
  mongo
  > use midb
  > db.micoleccion.insert({“titulo”: “primero de prueba”})
  > exit
```
o bien importar un fichero con los datos

```shell
mongoimport --db midb --collection micoleccion --file datos.json
```
El fichero datos.json contendrá información de esta manera:

{ "_id" : 1, "titulo": "primero de prueba"}
{ "_id" : 2, "titulo": "segundo de prueba"}

Probamos en [http://localhost:3000/misdatos] y veremos como nos muestra el json de la información que se recupera.

# Usar Nginx para servir los estaticos y el API

Ya que tenemos la imagen de nginx instalada y el contenedor corriendo, en vez de tener que usar el puerto 3000 para llamar a nuestro API, podemos facilitarlo con nginx que haga de proxy y redirija una url del puerto 80 al puerto 3000.

## Creando la configuración de nginx

Seguimos dentro de nuestro directorio `docker_example/api` y creamos el directorio config y entramos en él:
```shell
mkdir config
cd config
```
Creamos un archivo llamado **api.conf** con el siguiente contenido:
```shell
    server {
        listen          80;
        server_name     localhost;

        location / {
                root /usr/share/nginx/html;
                index index.html index.htm;
        }

        location /api/ {
            resolver app;
            proxy_pass http://app:3000/;
            proxy_set_header  X-Real-IP  $remote_addr;
            proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header  Host $http_host;
            proxy_redirect    off;
        }
    }
```

Este fichero de configuración reemplazará al que trae por defecto nginx.
Lo único que hemos hecho ha sido añadir el apartado "location /api/" para indicar que cuando se llame a http://localhost/api queremos que haga un "proxy_pass" a "localhost:3000", enmascarando las llamadas a nuestro API.

```html
<ACLARACION>: Fijate que **app** en la configuración del proxy_pass de nginx 
en las dos primeras lineas hace referencia al nombre del servicio "app"
que corre nuestro api rest por el puerto 3000. Docker hace de DNS 
resolviendo la IP del contenedor, evitando un error 502. 
Si cambias el nombre del servicio, debes cambiarlo en la configuración
de nginx.
```

## Añadiendo nginx a la configuracion de docker-compose
Ahora hay que modificar el fichero docker-compose para que tambien lance el contenedor de nginx:

```yml
version: "2"
services:
  app:
    container_name: app
    restart: always
    build: .
    ports:
      - "3000:3000"
    links:
      - mongo
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
  web:
    container_name: web
    image: nginx
    volumes:
      - ./config/api.conf:/etc/nginx/conf.d/default.conf
      - ../www:/usr/share/nginx/html
    ports:
      - "80:80"
    links:
      - app

```

Como podemos apreciar por la sintaxis del bloque "web", usamos la imagen de nginx, montamos el volumen api.conf dentro de la configuración por defecto de nginx y exponemos el puerto 80 con el del contenedor.
Ahora vamos a probar.

## Probamos la nueva configuración: contenedor node-express, contenedor mongodb, contenedor nginx

```shell
docker-compose build
docker-compose up -d
docker-compose ps
```

Podemos entrar en http://localhost y ver como sirve la pagina index.html que creamos en la carpeta /www

Podemos entrar en http://localhost/api y ver como sirve el mensaje que devuelve el servidor node-express cuando accedemos a http://localhost:3000

Podemos entrar en http://localhost/api/misdatos y ver como sirve el json de la base de datos que sirve tambien cuando accedemos a http://localhost:3000/misdatos


# Resumiendo

Con **docker** podemos crear entornos de ejecución aislados y configurarlos a nuestro antojo sin romper nada y asegurando compatiblidad

Con **docker-compose** podemos orquestar todos los contenedores creados, comunicarlos e iniciarlo y pararlos fácilmente.

# Bonus Tricks

Para ver los volumenes, contenedores e imagenes
```shell
docker system info
```
Para obtener el listado de volumenes
```shell
"docker volume ls
```
Para obtener la lista de contenedores arrancados y parados
```shell
docker container ls -a
```
Para borrar contenedores parados
```shell
docker container prune
```
