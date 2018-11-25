# Curso de introducción a Docker
Este curso pretende ser un primer acercamiento a la tecnología de Docker, así como a la filosofía DevOps, que es de gran ayuda a la realización de software de manera colectiva y colaborativa.
El software incluido en este curso está compuesto por un front-end en node (con el framework *express*), un back-end in python, y una base de datos en mysql para asegurar la persistencia de los datos.

## DevOps: la filosofía colaborativa

**DevOps** es un paradigma de colaboración que trata de apoderar los creadores de software, para que sean capaces de poder controlar todo el ciclo de vida de un producto, desde su nacimiento hasta los entornos productivos, sin que haya factores externos que puedan condicionar su correcto funcionamiento.
Las interacciones entre equipos de desarrollo y de operaciones han de ser lo más fluidas posible, y no debe haber diferencias entre entornos, para garantizar la máxima calidad de entrega.

## ¿Qué es docker?

Docker es un proyecto **open source** de virtualización que automatiza la ejecución de procesos dentro de **contenedores**, proporcionando una capa adicional de aislamiento, abstracción y automatización de aplicaciones en múltiples entornos.
En wikipedia podéis encontrar más detalles acerca de su infraestructura.
[Fuente Wikipedia](https://es.wikipedia.org/wiki/Docker_(software))

Docker ejecuta procesos de forma controlada y aislada en un sistema operativo huésped, usando sus recursos hardware y software sin necesidad de tenerlos reservados.
Se diferencia de las clásicas arquitecturas de máquinas virtuales (*Virtualbox* / *VMWare*) por no necesitar un *hypervisor* con un sistema operativo dedicado para la ejecución de las aplicaciones virtualizadas.
![virtualización vs contenedores](https://i.ytimg.com/vi/TvnZTi_gaNc/maxresdefault.jpg)

En particular Docker usa los *cgroups* y *namespaces* del kernel para ofrecer un espacio de direccionamiento de la memoria, la ejecución de procesos en el scheduler del host, y se apoyan en *iptables* para garantizar un aislamiento de red. Además, usa un *layered file-system* para proporcionar espacio disco.

Una aplicación, para poder ser ejecutada en docker, necesita de los siguientes componentes:
- Una **imagen** es la foto del entorno, como ejecutables, librerías y dependencias necesarias para que el proceso contenido pueda correr encima del sistema operativo en el cual se ejecuta. Es independiente y reproducible. Además tiene un mecanismo de herencia, para que podamos aprovechar de imágenes ya preparadas y especializarlas.
- Un **contenedor** es la instanciación de una imagen, compuesta por un **entrypoint** que es el proceso principal que queremos ejecutar.

Para hacer una analogía, podemos recordar los conceptos de *clase* y *objecto* en un lenguaje de programación OOP.

![layered-file-system](https://cdn-images-1.medium.com/max/1600/1*3EFMj1lWp2pSmXlo48NJVQ.png)

# Instalación de Docker en ubuntu
Aquí tenemos una [guía de instalación](https://docs.docker.com/install/linux/docker-ce/ubuntu/) detallada.

# Registry públicos populares
Esta es una lista *incompleta* de los **registry** públicos más populares. Es decir, el repositorio de las imágenes publicadas por proveedores, donde podemos encontrar una amplia librería de imágenes de las aplicaciones más populares.

- En [Docker Hub](https://hub.docker.com/), el más popular
- El [Google Container Registry](https://cloud.google.com/container-registry/)
- [Quay](https://quay.io/)
- [Amazon Container Registry](https://aws.amazon.com/it/ecr/)

> Es posible construir repositorios de imágenes privados.

# Comandos Docker
## Básicos
Listado de imágenes de docker instaladas:
```shell
  docker images
```

Para lanzar un nuevo contenedor:
```shell
  docker run <IMAGEN>
```

Para parar/relanzar un contenedor:
```shell
  docker stop <ID|NOMBRE>
  docker start <ID|NOMBRE>
```

Listado de contenedores que están corriendo:
```shell
  docker container ls
```
o su alias
```shell
  docker ps
```

Para bajar una de imagen de docker del [docker hub](https://hub.docker.com/):
```shell
  docker pull <IMAGEN>
```

## Dockerfile
```dockerfile
# imagen de origen (docker hub)
FROM ubuntu

# instalación paquetes (-y quita la interactividad)
RUN apt-get update && apt-get install -y nginx

# declaración de puerto TCP
EXPOSE 80

# lanza el entrypoint en foreground
CMD ["nginx", "-g", "daemon off;"]
```

## Más comandos
```shell
  docker build DIRECTORIO # va a buscar un fichero de especificación Dockerfile y construye un contenedor
  docker inspect CONTENEDOR # inspecciona detalles sobre el contenedor
  docker logs CONTENEDOR # para ver las trazas escritas por el proceso contenido
  docker exec -it CONTENEDOR /bin/bash # ejecuta el comando /bin/bash dentro del contenedor (útil para debug)
  docker rm CONTENEDOR # borra un contenedor
  docker image rm IMAGEN # borra una imagen
```

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
  docker pull nginx:1.15.6
  docker images
  docker ps
  docker run -d --name "web" -p 80:80 nginx:1.15.6
  docker ps
  docker logs web
  docker inspect web
```
Si no tenemos ningún otro proceso corriendo en el puerto 80 podremos entrar en http://localhost y ver la página por defecto de nginx.

## Montando una carpeta compartida entre un directorio local y un directorio dentro del contenedor Docker
```shell
  echo "<h1>MI CONTENEDOR NGINX CON DOCKER</h1>" > index.html
  docker ps
  docker run -d --name "web" -p 80:80 -v $(pwd)/index.html:/usr/share/nginx/html/index.html nginx
  docker ps
  docker ps -a
  docker stop web
  docker rm web
  docker ps -a
```

Analicemos el comando de ejecución del contenedor con sus parámetros:
```shell
  docker run -d --name "web" -p 80:80 -v $(pwd)/index.html:/usr/share/nginx/html/index.html nginx
```
COMANDO: **run** Sirve para lanzar un contenedor de la imagen nginx, llamado "web"

PARÁMETROS:
* **-d** o --detach, ejecuta el contenedor en segundo plano (background).
* **--name** para darle un nombre a nuestro contenedor y que sea mas sencillo referenciarlo e identificarlo.
* **-v** le indicamos que monte un [volumen](http://www.alegsa.com.ar/Dic/volumen.php) que enlaza desde el fichero local `$(pwd)/index.html`  a la ruta dentro del contenedor `/usr/share/nginx/html/index.html` que es la que utiliza este programa para servir
* **-p** conectamos el puerto 80 de nuestra máquina con el puerto 80 del contenedor, que tiene el servidor nginx exponiendo dicho puerto, y el demonio docker se encargará de redirigir el tráfico externo al correspondiente puerto del contenedor.

Podemos comprobarlo:
* Comprobamos http://localhost en un navegador
* Modificamos index.html
* Comprobamos http://localhost en un navegador

# Build y publicación de una imágen
Ahora crearemos una imagen *custom* y la publicaremos para que otros se la puedan descargar.
```shell
docker build -t danielesiddi/miservidor:1.0 .  # construye la imagen especificada con el tag danielesiddi/miservidor:1.0
docker login  # credenciales del usuario de docker hub
docker push danielesiddi/miservidor:1.0  # subimos la imágen
```

# Ejercicios
1. Clonar un componente y hacer que se muestre la demo en un contenedor de nginx
2. Arrancar tres contenedores de nginx en los puertos 80, 8080 y 8081
3. Crear una cuenta en hub.docker.com
4. Publicar varias versiones del software en vuestra cuenta personal

# Aplicaciones multi-contenedor y orquestación de contenedores

## Características
Docker nos proporciona todo lo necesario para separar varios contenedores y permitir su comunicación de forma controlada.
Pasemos a examinar el caso de una simple aplicación compuesta por tres contenedores:
- un front-end en **node**
- un back-end en **python**
- una base de datos **MariaDB**
- un administrador de bases de datos llamado **adminer**

La aplicación tiene las siguientes características:
- el front-end hace solo lecturas al back-end, y no tiene visibilidad de red hacia la base de datos
- el back-end puede ser invocado por el front-end, y tiene posibilidad de leer y escribir en la base de datos

## Front-end
Es un simple fichero [app.js](front/app.js) que usa el framework `express.js` y que renderiza un HTML con la lista de usuarios presentes

### Dockerfile
[Dockerfile](front/Dockerfile)

## Construyendo y corriendo el contenedor node

Construimos la imagen según el Dockerfile y la lanzamos:
```shell
  docker build -t frontend front/
  docker images
  docker run --name front-container -p 3000:3000 -d frontend
  docker ps
```

## Database

No es necesaria ninguna construcción, sólo tenemos que correr un contenedor con la imagen oficial de `MariaDB`
```shell
docker run --name database -p 3306:3306 -d -e 'MYSQL_ROOT_PASSWORD=K4ir0s' -v mysql_data:/var/lib/mysql mariadb:10.4

cat db/database.sql | mysql -h 127.0.0.1 -u root -pK4ir0s # para inicializar la tabla
```

PARÁMETROS:
* **--name** proporciona un nombre que identifica el contenedor. Es único.
* **-p** el puerto para hacer binding entre la máquina y el contenedor
* **-d** detach, no interactivo
* **-e** pasa una variable de entorno para la inicialización del database
* **-v** monta un *named volume* en la carpeta, para asegurar la persistencia de los datos
* **mariadb:10.4** el tag de la imagen a lanzar (local o remota)

## Back-end
Es una aplicación en `python` que usa el micro-framework `Flask` y expone un `API Rest / JSON` con tres métodos:

Método | Endpoint | Payload | Descripción
-------|----------|---------|------------
**GET**|/users||Lista de usuarios
**POST**|/user|{"name":"kairos"}|Crea un nuevo usuario
**PUT**|/user/*id*|{"name":"kairos"}|Actualiza el usuario *id*

### Dockerfile
[Dockerfile](back/Dockerfile)

### Construyendo y corriendo el contenedor python

Construimos la imagen según el Dockerfile y la lanzamos:
```shell
  docker build -t backend back/
  docker images
  docker run -e MYSQL_DATABASE_HOST=127.0.0.1 -e MYSQL_DATABASE_USER=root -e MYSQL_DATABASE_PASSWORD=K4ir0s --name back-container -p 6000:6000 -d backend
  docker ps
```

# Docker Compose

![Docker y Docker-compose](https://i2.wp.com/foxutech.com/wp-content/uploads/2017/06/Docker-compose-File.png?fit=1000%2C390&ssl=1)


**Docker-compose** nos facilita la orquestación de contenedores para que se relacionen e interactuen entre ellos.
Se configura mediante un archivo llamado **docker-compose.yml**
En dicho fichero se indica qué contenedores se enlazan con quien, de manera
que de una sola llamada podemos arrancar, parar y gestionar una aplicación multi-contenedor.

## Creamos el fichero docker-compose.yml
[docker-compose.yml](docker-compose.yml)

## Probando docker-compose

Ejecutamos:
```shell
  docker-compose build
  docker-compose up # arranca la aplicación en modo interactivo (-d para el detach)
  docker-compose ps
  docker ps
```
Podemos comprobar que tenemos servidor de node, de python y de mongo corriendo, más un cuarto llamado adminer, entrando en [http:localhost:3000] nos esperamos de ver la respuesta en nuestro navegador.

Podemos parar y borrar todos los contenedores de una vez.

```shell
  docker-compose down
```

## Algún comando más de Compose

Ejecutamos:
```shell
docker-compose logs
docker-compose start
docker-compose stop 
docker-compose top  # mapping de procesos internos/externos al contenedor
```

# Resumiendo

Con **docker** podemos crear entornos de ejecución aislados y configurarlos a nuestro antojo sin romper nada y asegurando compatibilidad

Con **docker-compose** podemos orquestar todos los contenedores creados, comunicarlos e iniciarlo y pararlos fácilmente.
