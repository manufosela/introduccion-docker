# Introduccion a Docker
tutorial introducción a docker y docker-compose creando un api con un contenedor node-express y otro con mongodb.

## ¿Qué es docker?

Docker es un proyecto de código abierto que automatiza el despliegue
de aplicaciones dentro de contenedores de software, proporcionando
una capa adicional de abstracción y automatización de virtualización de
aplicaciones en múltiples sistemas operativos [Fuente Wikipedia](https://es.wikipedia.org/wiki/Docker_(software))

Docker es un “emulador” de entornos aislado para poder ejecutar programas sin que afecte a mi sistema operativo (SO) y pudiendose llevar y replicar en otros SS.OO. o entornos.
Parecido a VirtualBox o VMWare, pero mucho más ligero y a nivel de sistema operativo. Básicamente no vas a tener más de un sistema operativo completo corriendo en tu máquina. ![virtualización vs contenedores](https://i.ytimg.com/vi/TvnZTi_gaNc/maxresdefault.jpg)
Docker consta de imágenes y contenedores:
1. Una **imagen** es la especificación inerte, inmmutable, una foto del estado y de unas piezas de software que incluyen desde la aplicación que queremos ejecutar hasta las librerias y todo lo necesario para que corra encima del sistema operativo en el cual se ejecuta.
2. Un **contenedor** es un entorno aislado con la instanciación de una imagen, el cual
se puede configurar.

# Instalación de Docker en ubuntu
1. Instalamos docker y docker-compose:
```shell
sudo snap install docker docker-compose
```
2. Añadimos al usuario de ubuntu al grupo docker
```shell
sudo usermod -aG docker $USER
```
3. En https://hub.docker.com/ podemos buscar imagenes de docker ya preparadas
4. Podemos comprobar qué imágenes tenemos con:
```shell
  docker images
```
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

## Más comandos
```shell
  docker build -t NOMBRE_CONTENEDOR .
  docker run IMAGEN
  docker inspect CONTENEDOR
  docker logs CONTENEDOR
  docker exec -it CONTENEDOR /bin/bash
  docker start / stop / restart CONTENEDOR
  docker rm CONTENEDOR
  docker rmi IMAGEN
```

# Cómo crear y lanzar un contenedor Docker
1. Crear el directorio de trabajo
2. Entrar en el directorio de trabajo
3. Crear el fichero Dockerfile
4. Crear el contenedor: `docker build`
5. Lanzar el contenedor creado: `docker run`
6. Comprobar que está lanzado: `docker ps`
7. Comprobar logs del contenedor: `docker logs`

# Levantando un contenedor nginx:
```shell
  mkdir docker_example
  cd docker_example
  docker pull nginx
  docker images
  docker ps
  docker run -d --name "web" -p 80:80 nginx;
  docker ps
  docker logs [CONTENEDOR]
  docker inspect [CONTENEDOR]
```
# Montando una carpeta compartida entre un directorio local y un directorio dentro del contenedor Docker
## Ejemplo:
```shell
  mkdir www
  cd www
  echo “<h1>MI CONTENEDOR NGINX CON DOCKER</h1>” > index.html
  cd ..
  docker stop web
  docker ps
  docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx;
  docker ps
  docker ps -a
  docker rm [CONTENEDOR]
  docker ps -a
```
En el comando de ejecución del contenedor tenemos un parámetro
```shell
  docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx
```
Esto crea un nuevo contenedor de la imagen nginx, llamado web, al que se le monta un volumen que enlaza desde la ruta local *$(pwd)/www* y a la ruta dentro del contenedor */usr/share/nginx/html* nginx que es la que utiliza este programa para servir, y además conectamos el puerto 80 de nuestra máquina con el puerto 80 del contenedor.

Podemos comprobarlo:
* Comprobamos http://localhost en un navegador
* Modificamos index.html
* Comprobamos http://localhost en un navegador

# Ejercicios
1. Clonar un componente y hacer que se muestre la demo en un contenedor de nginx
2. Arrancar tres contenedores de nginx en los puertos 80, 8080 y 8081

# Haciendo más cosas con Docker

## ¿Y si necesito crear un servidor express en node para exponer un api?
Pues lo ideal es separar el servidor node-express del servidor de mongodb.
De esta manera si necesito escalar o cambiar uno de los dos, el otro no tiene porqué verse afectado. Seguiremos los siguientes pasos:

1. Vamos a crear un contenedor con node-express
2. Vamos a crear un contenedor con un servidor de mongodb
3. Vamos a conectar los dos contenedores: node-express y mongodb

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
Probamos http://localhost:3000, vamos a dockerizarlo:

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
```shell
  FROM node:8
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 8080
  CMD [ "node", "index.js" ]
```

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
  docker build -t manufosela/api .
  docker images
```
Lanzamos el contenedor:
```shell
  docker run -p 3000:3000 -d manufosela/api
  docker ps
```

### Pregunta
#### ¿Si cambio algo en el index.js se refleja en http://localhost:3000?
#### ¿Por qué?

### Solución
#### ¿Cómo podemos hacer para que cualquier cambio en mi local se refleje en el servidor node-express?

```shell
  docker run -p 3000:3000 -d -v $(pwd)/index.js:/usr/src/app/index.js manufosela/api
```

Modificamos index.js
Aún no se ven los cambios reflejados http://localhost:3000

```shell
  docker restart [CONTENEDOR_ID]
```

Ahora sí se ven reflejados los cambios en http://localhost:3000

## 2. Docker de mongodb
Vamos a utilizar una imagen ya hecha de mongodb:
```shell
  docker pull mongo
  docker images
  docker run -it -d mongo
  docker ps
  docker run -it --link=[NOMBRE_CONT]:mongo mongo /bin/bash
  env
```
Nos fijamos en la ip y puerto

### Interactuamos para probar mongodb
El comando para ejecutar mongo es `mongo`, podemos obtener este error: `couldn't connect to server 127.0.0.1:27017, connection attempt failed: SocketException: Error connecting to 127.0.0.1:27017 :: caused by :: Connection refused` Esto puede ocurrir por muchas razones, entre ellas que el demonio de mongo no esté ejecutándose, para ello lo lanzamos y lo dejamos en segundo plano
```shell
mongod &
```
pulsamos enter para volver a tener el control y ya ejecutar `mongo`, tras esto tenemos la consola de la base de datos donde podemos ejecutar:
```shell
  show dbs
  use local
  show collections
  db.startup_log.find({})
  db.startup_log.find({}).pretty()
  use midb
  db.micoleccion.insert({elemento:"uno"})
  show collections
  db.micoleccion.find()
```

## 3. Conectar docker node-express con docker mongodb

Para conectar el contenedor de node-express con el contenedor de mongodb vamos a valernos de *docker-compose*
**Docker-compose** es un orquestador de contenedores para que se relacionen entre ellos.
Se configura mediante un archivo *.yml* llamado *docker-compose.yml*
En dicho fichero se indica qué contenedores se enlazan con quien, de manera
que de una sola llamada podemos arrancar y relacionar varios contenedores.

### Creamos el fichero docker-compose.yml
```shell
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

# Probando docker-compose
Paramos todos los contenedores anteriores de mongo y api
Ejecutamos:
```shell
  docker build
  docker-compose up -d
  docker-compose ps
  docker ps
```
Podemos probar que tenemos servidor de node y de mongo.
Podemos parar todos los contenedores de una vez.

```shell
  docker-compose down
  docker-compose ps
  docker ps
```

### Usando mongo en nuestro api

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

## Usando mongo en nuestro API
Ahora para que los cambios tengan efecto debemos parar todo, volver a construir los contenedores y volver a lanzarlos:
```shell
  docker-compose down
  docker-compose build
  docker-compose up -d
  docker-compose ps
```

Para poder probar el api debemos cargar con datos la base de datos llamada mibd y la colección de esa base de datos micoleccion

## Probamos los entry-point
Mediante la consola de mongo creamos la base de datos:
```shell
  mongo
  > use midb
  > db.micoleccion.insert({“titulo”: “primero de prueba”})
  > exit
```
Probamos en http://localhost:3000/misdatos
