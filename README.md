# Tutorial de introducción a Docker y Docker Compose

Tutorial de introducción a docker y docker-compose creando una aplicación fullstack, con un contenedor node-express para el api, otro con mongodb y otro con nginx para servir los ficheros estáticos.

## Tabla de contenidos

- [Notas](#notas)
- [¿Qué es Docker?](#qué-es-docker)
- [Instalación](#instalación)
- [Conceptos básicos](#conceptos-básicos)
- [Comandos esenciales](#comandos-esenciales)
- [Primeros pasos con nginx](#primeros-pasos-con-nginx)
- [Ejercicios básicos](#ejercicios-básicos)
- [Creando una API con Node.js](#creando-una-api-con-nodejs)
- [Dockerizando la aplicación Node.js](#dockerizando-la-aplicación-nodejs)
- [Añadiendo MongoDB](#añadiendo-mongodb)
- [Conectando Node.js con MongoDB](#conectando-nodejs-con-mongodb)
- [Docker Compose](#docker-compose)
- [Añadiendo Nginx como proxy](#añadiendo-nginx-como-proxy)
- [Manejo seguro de credenciales](#manejo-seguro-de-credenciales)
- [Mejores prácticas y optimización](#mejores-prácticas-y-optimización)
- [Multi-stage builds](#multi-stage-builds)
- [Herramientas de desarrollo](#herramientas-de-desarrollo)
- [Monitoreo y logging](#monitoreo-y-logging)
- [Troubleshooting](#troubleshooting)
- [Comandos útiles](#comandos-útiles)

## Notas

- Para este ejemplo se ha utilizado un sistema operativo Ubuntu, por lo que todos los ejemplos de instalación de programas se harán para este entorno. Puedes cambiarlo por los de tu sistema operativo.
- El sistema operativo tiene instalado node 18+ y npm
- Cuidado con el copy-paste desde el README que puede hacer que no funcione, es preferible bajar el fichero del repo.

## ¿Qué es Docker?

Docker es un proyecto de código abierto que automatiza el despliegue
de aplicaciones dentro de contenedores de software, proporcionando
una capa adicional de abstracción y automatización de virtualización de
aplicaciones en múltiples sistemas operativos [Fuente Wikipedia](https://es.wikipedia.org/wiki/Docker_(software))

Docker es un "emulador" de entornos aislado para poder ejecutar programas sin que afecte a mi sistema operativo (SO) y pudiendose llevar y replicar en otros SS.OO. o entornos.

Parecido a VirtualBox o VMWare, pero mucho más ligero y a nivel de sistema operativo. Básicamente no vas a tener más de un sistema operativo completo corriendo en tu máquina.

Docker consta de imágenes y contenedores:
- Una imagen es la especificación inerte, inmmutable, una foto del estado y de unas piezas de software que incluyen desde la aplicación que queremos ejecutar hasta las librerias y todo lo necesario para que corra encima del sistema operativo en el cual se ejecuta.
- Un contenedor es un entorno aislado con la instanciación de una imagen, el cual se puede configurar.

Una analogía sería que la imagen es la clase y el contenedor el objeto de la clase.

## Instalación

Instalamos docker y docker-compose:

```bash
# Actualizar paquetes
sudo apt update

# Instalar Docker y Docker Compose (nueva versión)
sudo apt install docker.io docker-compose-v2

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar servicios
sudo systemctl restart docker
sudo systemctl enable docker
```

**Nota**: Docker Compose v2 es ahora la versión recomendada. El comando cambió de `docker-compose` a `docker compose` (sin guión).

En [https://hub.docker.com/](https://hub.docker.com/) podemos buscar imagenes de docker ya preparadas.

Podemos comprobar qué imágenes tenemos con:
```bash
docker images
```

Si te diera el error: "Got permission denied while trying to connect to the Docker daemon socket..." será necesario reiniciar el sistema operativo.

Si te diera el error: "cannot connect to the docker daemon" es porque hay que arrancar el servicio. Sigue los siguientes pasos para solucionarlo:

```bash
systemctl is-active docker
systemctl start docker
systemctl enable docker
```

Si necesitas mas información sobre cuestiones de docker en [https://www.configserverfirewall.com/docker/](https://www.configserverfirewall.com/docker/) puedes encontrarla.
Si no en la página oficial de docker [https://www.docker.com/](https://www.docker.com/)

## Conceptos básicos

**Docker Hub**: Registro público de imágenes Docker donde podemos encontrar imágenes oficiales.

**Dockerfile**: Archivo de texto que contiene las instrucciones para construir una imagen.

**Docker Compose**: Herramienta para definir y ejecutar aplicaciones Docker multi-contenedor.

## Comandos esenciales

Listado de imágenes de docker instaladas:
```bash
docker images
```

Listado de contenedores de docker creados:
```bash
docker container ls
```
o su alias
```bash
docker ps
```

Para bajar una imagen de docker del [docker hub](https://hub.docker.com/):
```bash
docker pull IMAGEN
```

A parte del repositorio oficial de docker tenemos más repositorios de imágenes publicadas por proveedores, donde podemos encontrar una amplia librería de imágenes de las aplicaciones más populares.

```bash
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

- **build** se utiliza para generar/contruir una imagen a partir del Dockerfile
- **run** se utiliza para lanzar el contenedor a partir de una imagen
- **inspect** se utiliza para obtener información a bajo nivel del contenedor
- **logs** se utiliza para ver la salida generada por consola al ejecutar el contenedor
- **exec** se utiliza para ejecutar comandos en un contenedor que está ejecutandose
- **stop** se utiliza para parar la ejecución de un contenedor que está ejecutandose
- **rm** se utiliza para borrar un contenedor
- **rmi** para borrar una imagen creada

## Primeros pasos con nginx

Crear el directorio de trabajo
Entrar en el directorio de trabajo
Crear el fichero Dockerfile
Crear el contenedor: `docker build`
Lanzar el contenedor creado: `docker run`
Comprobar que está lanzado: `docker ps`
Comprobar logs del contenedor: `docker logs`

```bash
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

Si no tenemos ningún otro proceso corriendo en el puerto 80 podremos entrar en [http://localhost](http://localhost) y ver la página por defecto de nginx.

### Montando una carpeta compartida entre un directorio local y un directorio dentro del contenedor Docker

```bash
mkdir www
cd www
echo "<h1>MI CONTENEDOR NGINX CON DOCKER</h1>" > index.html
cd ..
docker stop web
docker ps
docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx;
docker ps
```

Para comprobar mas contenedores que se hayan podido quedar "zombies" podemos usar la opción -a (--all)
```bash
docker ps -a
```

Para eliminar un contenedor "zombie" podemos usar el comando rm
```bash
docker rm [CONTENEDOR-ID]
docker ps -a
```

### Analicemos el comando de ejecución del contenedor con sus parámetros:

```bash
docker run -d --name "web" -p 80:80 -v $(pwd)/www:/usr/share/nginx/html nginx
```

**COMANDO**: `run` Sirve para lanzar un contenedor de la imagen nginx, llamado "web"

**PARAMETROS**:
- `-d` o `--detach`, ejecuta el contenedor en segundo plano (background).
- `--name` para darle un nombre a nuestro contenedor y sea mas sencillo referenciarlo e identificarlo.
- `-v` le indicamos que monte un [volumen](http://www.alegsa.com.ar/Dic/volumen.php) que enlaza desde la ruta local $(pwd)/www a la ruta dentro del contenedor /usr/share/nginx/html nginx que es la que utiliza este programa para servir
- `-p` conectamos el puerto 80 de nuestra máquina con el puerto 80 del contenedor, que como tiene el servidor nginx corriendo en dicho puerto, estaremos dando acceso al puerto del contenedor desde nuestro puerto, siempre y cuando este esté libre, si no deberemos ponerlo en un puerto libre de nuestro equipo.

Podemos comprobarlo:
- Comprobamos [http://localhost](http://localhost) en un navegador
- Modificamos index.html
- Comprobamos [http://localhost](http://localhost) en un navegador

## Ejercicios básicos

- Clonar un componente Polymer y hacer que se muestre la demo en un contenedor de nginx
- Arrancar tres contenedores de nginx en los puertos 80, 8080 y 8081

## Creando una API con Node.js

Pues lo ideal es separar el servidor node-express del servidor de mongodb. De esta manera si necesito escalar o cambiar uno de los dos, el otro no tiene por qué verse afectado. Seguiremos los siguientes pasos:

- Vamos a crear un contenedor con node-express
- Vamos a crear un contenedor con un servidor de mongodb
- Vamos a conectar los dos contenedores: node-express y mongodb

Previamente creamos la carpeta de la aplicación, iniciamos el proyecto node e instalando mongodb:

```bash
mkdir api # (dentro de docker_example)
cd api
npm init
npm install --save express mongodb
```

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
```bash
node index.js
```

Probamos [http://localhost:3000](http://localhost:3000) y comprobamos que muestra el json: {"hello": "express with mongo"}

Lo siguiente será dockerizarlo.

## Dockerizando la aplicación Node.js

### Dockerfile explicado

- **FROM** nos permite especificar desde qué imagen base de Docker Hub ([https://hub.docker.com/](https://hub.docker.com/)) queremos construir.
- **RUN** nos permite ejecutar un comando.
- **WORKDIR** establece un directorio como el directorio de trabajo para las instrucciones COPY, RUN y CMD.
- **COPY** y **ADD** permite copiar archivos o un directorio completo desde una fuente fuera del contenedor a un destino dentro del contenedor.
- **EXPOSE** expone el puerto en el que el contenedor escuchará.
- **CMD** establece el comando predeterminado para ejecutar nuestro contenedor.

### Nuestro Dockerfile para el api node-express

Dentro de la carpeta api creamos con un editor un fichero llamado Dockerfile y en el añadimos el siguiente contenido:

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "index.js" ]
```

**Actualización**: Se cambió de `node:8` a `node:18-alpine` que es la versión LTS actual y usa Alpine Linux para un contenedor más ligero.

Todos estas órdenes se ejecutan en nuestro contenedor cuando usemos el comando "build" de Docker.

### Analicemos el contenido del fichero Dockerfile:

- **FROM node:18-alpine** le indica que se baje la imagen node, versión 18 con Alpine Linux, de docker hub.
- **WORKDIR /usr/src/app** le indica que haga un "cd" para trabajar en esa ruta, dentro del contenedor. Si no existiese antes del "cd" haría un "mkdir". Piensa que el contenedor tiene una estructura de un sistema operativo linux.
- **COPY package*.json ./** copia desde nuestro directorio donde se encuentre el Dockerfile los ficheros que cumplan la expresión al directorio que se encuentre el contenedor, que definimos con WORKDIR
- **RUN npm install** ejecuta la instalación del package.json y package-lock.json que hemos copiado en /usr/src/app
- **COPY . .** copia todos los archivos desde nuestro directorio donde se encuentra el Dockerfile, excepto los indicados en el fichero .dockerignore y los copia en el directorio actual de trabajo indicado por WORKDIR
- **EXPOSE 3000** abre el puerto 3000 del contenedor
- **CMD ["node", "index.js"]** es el comando que se queda lanzado en el contenedor.

Creamos el fichero '.dockerignore' para evitar copiar a la imagen los ficheros que no queramos copiar en ella.

```
node_modules
*.log
docker-compose.yml
Dockerfile
data
.git
.env
```

Construimos la imagen según le indica Dockerfile:
```bash
docker build -t manufosela:api .
docker images
```

Lanzamos el contenedor:
```bash
docker run -p 3000:3000 -d manufosela:api
docker ps
```

### ¿Si cambio algo en el index.js se refleja en [http://localhost:3000](http://localhost:3000)?

No se refleja puesto que en el Dockerfile hemos indicado con COPY . . que copiemos toda la carpeta, a excepción de lo indicado en el fichero .dockerignore, en la carpeta de trabajo de la imagen. Una vez copiado ya no es posible alterar su contenido. Esto es lo que querremos hacer cuando subamos a producción nuestra aplicación, pero no cuando estamos desarrollando.

Como hemos visto antes con el parámetro -v podemos referenciar volumenes de tu equipo dentro del contenedor.

```bash
docker run -p 3000:3000 -d -v $(pwd)/index.js:/usr/src/app/index.js manufosela:api
```

Modificamos index.js. Tendremos que borrar el contenedor y volver a construirlo y volver a ejecutar el contenedor para que el servidor node-express lea los cambios.

```bash
docker stop [CONTENEDOR_ID]
docker rm [CONTENEDOR_ID]
docker build -t manufosela:api .
docker run -p 3000:3000 -d manufosela:api
```

Ahora sí se ven reflejados los cambios en [http://localhost:3000](http://localhost:3000)

Podemos utilizar paquetes de npm, como nodemon, que detectan cambios en el index.js relanzando el servidor node-express. Sería necesario por un lado instalar el paquete nodemon y por otro cambiar el comando CMD para que ejecute nodemon. Lo dejo como ejercicio :)

## Añadiendo MongoDB

Vamos a utilizar la imagen ya hecha de mongodb de docker hub:

```bash
docker pull mongo:7.0
docker images
docker run -it -d mongo:7.0
docker ps
```

**Actualización**: Se especifica la versión `mongo:7.0` que es más reciente y estable.

Con esto tenemos corriendo un servidor mongodb que expone el puerto 27017, que es el puerto por defecto de mongo, de manera que tenemos una base de datos mongo corriendo en nuestro equipo, pero sin haber tenido que instalar ni configurar nada y sin que haya "ensuciado" nuestro sistema operativo instalando dependencias o librerias.

Para poder probarlo, primero debemos averiguar la IP del servidor mongodb, para ello ejecutamos:
```bash
docker ps
```

Nos fijamos, al final, en el nombre aleatorio que le ha dado al contenedor de mongo que serán dos nombres separados por un guion bajo. Usamos dicho nombre para ejecutar lo siguiente:

```bash
docker run -it --link=[NOMBRE_CONT]:mongo mongo:7.0 /bin/bash
```

Con esto creamos un contenedor temporal que enlaza con la consola del contenedor que está corriendo el servidor de mongo y entramos en su consola. Lo veremos porque cambia el prompt.

Ahora ejecutamos:
```bash
env
```

Que nos muestra todas las variables de entorno. Nos fijamos en la línea que nos muestra MONGO_PORT_27017_TCP_ADDR para obtener la ip del contenedor:

```
[...]
HOME=/root
SHLVL=1
MONGO_PORT_27017_TCP_ADDR=172.17.0.3
MONGO_ENV_JSYAML_VERSION=3.10.0
MONGO_MAJOR=7.0
[...]
```

Cerramos la consola con exit

El comando para ejecutar el cliente de mongodb es `mongosh` (anteriormente era `mongo`)
para lo que deberemos tener instalado el cliente de mongodb en nuestro equipo llamado mongodb-mongosh

Para saber si lo tenemos instalado podemos ejecutar:
```bash
sudo dpkg --get-selections | grep mongo
```

Si no lo está lo podemos instalar con:
```bash
sudo apt install mongodb-mongosh
```

Si lo ejecutamos simplemente `mongosh`
y no tenemos un servidor mongodb local corriendo, obtendremos este error: couldn't connect to server 127.0.0.1:27017, connection attempt failed: SocketException: Error connecting to 127.0.0.1:27017 :: caused by :: Connection refused

Para poder conectar con el servidor mongodb de nuestro contenedor deberemos indicar la ip y el puerto al que conectarnos:

```bash
mongosh 172.17.0.3:27017
```

Esto nos conectará con la línea de comandos de mongo que se caracteriza por tener el prompt >

Para interactuar con la base de datos podemos ejecutar algunos comandos de mongo:

```javascript
> show dbs
> use local
> show collections
> db.startup_log.find({})
> db.startup_log.find({}).pretty()
> use midb
> db.micoleccion.insertOne({elemento:"uno"})
> show collections
> db.micoleccion.find()
```

**Actualización**: El método `insert()` ha sido deprecado, ahora se usa `insertOne()` o `insertMany()`.

Usamos CTRL+C para salir de la consola de mongo.

### Capas de Docker

![Image 1](https://github.com/manufosela/introduccion-docker/raw/master/images/image1.png)

![Image 2](https://github.com/manufosela/introduccion-docker/raw/master/images/image2.png)

Tanto en la Image 1 como en la Image 2 podemos ver que tienen en común en su Dockerfile la base de node:18-alpine, la copia de los ficheros package.json y package-lock.json y la instalación del package.json con npm install

A la derecha de cada orden, vemos un "hash", que es el identificador de las imagenes temporales que va creando, conforme va ejecutando cada orden.

Cuando ejecutamos `docker images -a` podemos ver todas las imagenes intermedias que se han creado.

Cuando borramos la imagen "padre", todas las que dependen de esta se borraran tambien.

## Conectando Node.js con MongoDB

Modificamos el fichero index.js que quedara como sigue:

```javascript
const express = require('express');
const app = express();
const PORT = 3000;
const { MongoClient } = require('mongodb');

const DB = {
    config: 'mongodb://mongo:27017'
};

let dbo;

app.get('/', function (req, res) {
    res.json({ "hello": "express with mongo" });
});

const client = new MongoClient(DB.config);

async function connectDB() {
    try {
        await client.connect();
        console.log('connected!!');
        dbo = client.db("midb");
    } catch (err) {
        console.log('database is not connected');
    }
}

app.get('/misdatos', async function (req, res) {
    try {
        const result = await dbo.collection("micoleccion").find({}).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

connectDB().then(() => {
    app.listen(PORT, function () {
        console.log('Your node js server is running on PORT:', PORT);
    });
});
```

**Actualización**: Se modernizó el código para usar async/await y la nueva API de MongoDB driver.

## Docker Compose

Para facilitar y conectar el contenedor de node-express con el contenedor de mongodb vamos a valernos de docker-compose

Docker-compose nos facilita la orquestación de contenedores para que se relacionen e interactuen entre ellos. Se configura mediante un archivo .yml llamado docker-compose.yml En dicho fichero se indica qué contenedores se enlazan con quien, de manera que de una sola llamada podemos arrancar, parar y relacionar varios contenedores.

```yaml
version: "3.8"
services:
  app:
    container_name: app
    restart: always
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongo
    environment:
      - NODE_ENV=production
  
  mongo:
    container_name: mongo
    image: mongo:7.0
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
```

**Actualización**: Se cambió de version "2" a "3.8" y se añadió `depends_on` en lugar de `links` que está deprecado.

Antes de continuar y para poder utilizar docker compose debemos parar los contenedores que hemos lanzado manualmente. Para ello ejecutamos:

```bash
docker ps
```

Y anotamos los CONTAINER_ID del contenedor de mongo y node-express, el de nginx podemos dejarlo corriendo. Una vez tengamos los dos ids ejecutamos:

```bash
docker stop [CONTAINER_ID_NODE] [CONTAINER_ID_MONGO]
```

Con esto los paramos, pero los contenedores siguen lanzados, por lo que ahora deberemos borrarlos:

```bash
docker rm [CONTAINER_ID_NODE] [CONTAINER_ID_MONGO]
```

Ejecutamos:

```bash
docker compose build
docker compose up -d
docker compose ps
```

**Actualización**: El comando cambió de `docker-compose` a `docker compose` (sin guión).

Podemos probar que tenemos servidor de node y de mongo corriendo, entrando en [http:localhost:3000] y ejecutando el comando `mongosh`, esta vez sin IP ni puerto, ya que docker compose conecta automaticamente localhost con la IP del contenedor mongo.

Podemos parar y borrar todos los contenedores de una vez.

```bash
docker compose down
```

Lo podemos comprobar con:

```bash
docker compose ps
docker ps
```

Ahora para que los cambios tengan efecto debemos parar todo, volver a construir los contenedores y volver a lanzarlos:

```bash
docker compose down
docker compose build
docker compose up -d
docker compose ps
```

Para poder probar el api debemos cargar con datos la base de datos llamada mibd y la colección de esa base de datos micoleccion

Mediante la consola de mongo podemos crear alguna entrada en la base de datos:

```bash
mongosh
> use midb
> db.micoleccion.insertOne({"titulo": "primero de prueba"})
> exit
```

o bien importar un fichero con los datos

```bash
mongoimport --db midb --collection micoleccion --file datos.json
```

El fichero datos.json contendrá información de esta manera:

```json
{ "_id" : 1, "titulo": "primero de prueba"}
{ "_id" : 2, "titulo": "segundo de prueba"}
```

Probamos en [http://localhost:3000/misdatos] y veremos como nos muestra el json de la información que se recupera.

## Añadiendo Nginx como proxy

Ya que tenemos la imagen de nginx instalada y el contenedor corriendo, en vez de tener que usar el puerto 3000 para llamar a nuestro API, podemos facilitarlo con nginx que haga de proxy y redirija una url del puerto 80 al puerto 3000.

Seguimos dentro de nuestro directorio docker_example/api
y creamos el directorio config y entramos en él:

```bash
mkdir config
cd config
```

Creamos un archivo llamado api.conf con el siguiente contenido:

```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
    }
    
    location /api/ {
        proxy_pass http://app:3000/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }
}
```

Este fichero de configuración reemplazará al que trae por defecto nginx.

Lo único que hemos hecho ha sido añadir el apartado "location /api/" para indicar que cuando se llame a [http://localhost/api](http://localhost/api) queremos que haga un "proxy_pass" a "localhost:3000", enmascarando las llamadas a nuestro API.

**ACLARACION**: Fijate que **app** en la configuración del proxy_pass de nginx
en las dos primeras lineas hace referencia al nombre del servicio "app"
que corre nuestro api rest por el puerto 3000. Docker hace de DNS
resolviendo la IP del contenedor, evitando un error 502.
Si cambias el nombre del servicio, debes cambiarlo en la configuración
de nginx.

Ahora hay que modificar el fichero docker-compose para que tambien lance el contenedor de nginx:

```yaml
version: "3.8"
services:
  app:
    container_name: app
    restart: always
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongo
    environment:
      - NODE_ENV=production
  
  mongo:
    container_name: mongo
    image: mongo:7.0
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
  
  web:
    container_name: web
    image: nginx:1.25-alpine
    volumes:
      - ./config/api.conf:/etc/nginx/conf.d/default.conf
      - ../www:/usr/share/nginx/html
    ports:
      - "80:80"
    depends_on:
      - app
```

**Actualización**: Se cambió `links` por `depends_on` y se actualizó la imagen de nginx a `nginx:1.25-alpine`.

Como podemos apreciar por la sintaxis del bloque "web", usamos la imagen de nginx, montamos el volumen api.conf dentro de la configuración por defecto de nginx y exponemos el puerto 80 con el del contenedor. Ahora vamos a probar.

```bash
docker compose build
docker compose up -d
docker compose ps
```

Podemos entrar en [http://localhost](http://localhost) y ver como sirve la pagina index.html que creamos en la carpeta /www

Podemos entrar en [http://localhost/api](http://localhost/api) y ver como sirve el mensaje que devuelve el servidor node-express cuando accedemos a [http://localhost:3000](http://localhost:3000)

Podemos entrar en [http://localhost/api/misdatos](http://localhost/api/misdatos) y ver como sirve el json de la base de datos que sirve tambien cuando accedemos a [http://localhost:3000/misdatos](http://localhost:3000/misdatos)

## Manejo seguro de credenciales

Una de las problemáticas más comunes al trabajar con Docker es el manejo seguro de credenciales. Nunca debemos incluir passwords, API keys o tokens directamente en nuestro código o en las imágenes Docker.

### Problemática común

Imagínate que tienes un fichero de configuración como `firestore.json` para Google Cloud con credenciales sensibles:

```json
{
  "type": "service_account",
  "project_id": "mi-proyecto",
  "private_key_id": "abc123",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMI...\n-----END PRIVATE KEY-----\n",
  "client_email": "service@mi-proyecto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

Este fichero no puede subirse al repositorio por motivos de seguridad, pero lo necesitamos en el contenedor.

### Solución 1: Variables de entorno

La forma más sencilla es usar variables de entorno:

**docker-compose.yml**
```yaml
version: "3.8"
services:
  app:
    build: .
    environment:
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - API_KEY=${API_KEY}
    env_file:
      - .env
```

**.env** (añadir a .gitignore)
```env
DATABASE_PASSWORD=mi_password_seguro
API_KEY=mi_api_key_secreta
```

### Solución 2: Credenciales con Base64

Basándome en el artículo de [LeanMind sobre trabajar con ficheros de credenciales en Docker](https://leanmind.es/es/blog/trabajar-con-ficheros-de-credenciales-en-docker/), podemos codificar el fichero completo:

**1. Codificar el fichero de credenciales**
```bash
cat firestore.json | base64 | tr -d '\n' > firestore.b64
```

**2. Modificar el Dockerfile**
```dockerfile
FROM node:18-alpine

# Variable de entorno para credenciales
ENV CREDENTIALS_JSON=""

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

# Decodificar credenciales en el entrypoint y ejecutar aplicación
ENTRYPOINT ["/bin/sh", "-c", "echo $CREDENTIALS_JSON | base64 -d > firestore.json && node index.js"]
```

**3. Uso en docker-compose.yml**
```yaml
version: "3.8"
services:
  app:
    build: .
    environment:
      - CREDENTIALS_JSON=${CREDENTIALS_JSON}
```

**4. En el archivo .env**
```env
CREDENTIALS_JSON=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6Im1pLXByb3llY3RvIiwicHJpdmF0ZV9rZXlfaWQiOiJhYmMxMjMiLCJwcml2YXRlX2tleSI6Ii0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUkuLi5cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsImNsaWVudF9lbWFpbCI6InNlcnZpY2VAbWktcHJveWVjdG8uaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJjbGllbnRfaWQiOiIxMjM0NTY3ODkiLCJhdXRoX3VyaSI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwidG9rZW5fdXJpIjoiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4ifQ==
```

### Solución 3: Docker Secrets (para Docker Swarm)

```yaml
version: "3.8"
services:
  app:
    build: .
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

**Nota**: Los Docker Secrets solo funcionan en modo Swarm, no en docker compose normal.

## Mejores prácticas y optimización

### Usuarios no root

Por seguridad, evita ejecutar contenedores como root:

```dockerfile
FROM node:18-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Cambiar propietario de archivos
COPY --chown=nextjs:nodejs . .

# Cambiar a usuario no-root
USER nextjs

EXPOSE 3000
CMD ["node", "index.js"]
```

### Optimización de capas

```dockerfile
# Malo - cada RUN crea una capa
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget

# Bueno - una sola capa
RUN apt-get update && \
    apt-get install -y curl wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### .dockerignore optimizado

```
# Dependencias
node_modules
npm-debug.log*

# Archivos de desarrollo
.git
.gitignore
README.md
.env*
.nyc_output
coverage
.eslintrc*

# Archivos de Docker
Dockerfile*
docker-compose*
.dockerignore

# Archivos temporales
*.tmp
*.log
```

### Health checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Multi-stage builds

Para optimizar el tamaño de las imágenes:

```dockerfile
# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa de producción
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app

# Copiar solo node_modules de la etapa anterior
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000
CMD ["node", "index.js"]
```

## Herramientas de desarrollo

### Hot reload para desarrollo

**docker-compose.dev.yml**
```yaml
version: "3.8"
services:
  app:
    build: .
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

Uso:
```bash
# Desarrollo
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Producción
docker compose up
```

### Debugging

Para debugging con herramientas como VS Code:

```yaml
version: "3.8"
services:
  app:
    build: .
    command: node --inspect=0.0.0.0:9229 index.js
    ports:
      - "3000:3000"
      - "9229:9229"
```

### Testing

**docker-compose.test.yml**
```yaml
version: "3.8"
services:
  test:
    build: .
    command: npm test
    environment:
      - NODE_ENV=test
    depends_on:
      - mongo-test
      
  mongo-test:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=test
      - MONGO_INITDB_ROOT_PASSWORD=test
```

## Monitoreo y logging

### Configuración de logs

```yaml
version: "3.8"
services:
  app:
    build: .
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Health checks avanzados

```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  process.exit(1);
});

req.end();
```

### Monitoreo con Prometheus (opcional)

```yaml
version: "3.8"
services:
  app:
    build: .
    
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Troubleshooting

### Problemas comunes

**Error de permisos**
```bash
# Solución
sudo usermod -aG docker $USER
newgrp docker
```

**Puerto ocupado**
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

**Problemas de conexión entre contenedores**
```bash
# Verificar red
docker network ls
docker network inspect bridge

# Usar nombres de servicio en lugar de IPs
# En lugar de: mongodb://172.17.0.3:27017
# Usar: mongodb://mongo:27017
```

**Contenedores que no arrancan**
```bash
# Ver logs detallados
docker compose logs app

# Ver estado de todos los servicios
docker compose ps

# Entrar en contenedor para debug
docker exec -it app /bin/sh
```

### Limpieza del sistema

```bash
# Limpiar todo lo no utilizado
docker system prune -a

# Limpiar solo contenedores parados
docker container prune

# Limpiar imágenes sin usar
docker image prune

# Ver uso de espacio
docker system df
```

## Comandos útiles

Para ver los volumenes, contenedores e imagenes:
```bash
docker system info
```

Para obtener el listado de volumenes:
```bash
docker volume ls
```

Para obtener la lista de contenedores arrancados y parados:
```bash
docker container ls -a
```

Para borrar contenedores parados:
```bash
docker container prune
```

Para ver logs en tiempo real:
```bash
docker compose logs -f
docker compose logs -f app
```

Para escalar servicios:
```bash
docker compose up -d --scale app=3
```

Para forzar recrear contenedores:
```bash
docker compose up -d --force-recreate
```

Para ver estadísticas de recursos:
```bash
docker stats
```

Para inspeccionar configuración de un servicio:
```bash
docker compose config
```

## Conclusiones

Con docker podemos crear entornos de ejecución aislados y configurarlos a nuestro antojo sin romper nada y asegurando compatiblidad

Con docker-compose podemos orquestar todos los contenedores creados, comunicarlos e iniciarlo y pararlos fácilmente.

Las nuevas funcionalidades como el manejo seguro de credenciales, multi-stage builds y health checks nos permiten crear aplicaciones más robustas y seguras.

El ecosistema Docker ha evolucionado mucho desde las primeras versiones, con mejores prácticas de seguridad, optimización y herramientas de desarrollo que facilitan tanto el desarrollo como el despliegue en producción.
