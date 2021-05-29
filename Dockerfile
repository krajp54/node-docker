# Primero especificamos la imagen base que sera usada para construir nuestro contenedor
FROM node:15

# El comando "WORKDIR" es opcional, pero se sugiere agregar para especificar el directorio
# en el cual vamos a trabajar dentro del contenedor. En el caso de la imagen "Node" es el
# directorio "/app"
WORKDIR /app

# Vamos a copiar el archivo "package.json" para indicarle al contenedor cual sera la lista
# de dependencias sobre la cual va a trabajar
COPY package.json .

# Instalaremos la lista de dependencias que previamente especificamos al contenedor a traves
# del comando "npm install"

# ! Extraemos la variable "NODE_ENV" para verificar si la imagen esta siendo construida
# ! como parte del entorno de desarrollo o de produccion.

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

# A continuacion, copiaremos todos los archivos fuente de nuestra aplicacion dentro del
# contenedor

# ! Se separa el copiar el archivo de dependencias e instalarlo, del resto de archivos fuentes
# ! por motivos de eficiencia, dado que, cada capa del contenedor es almacenado en cache.
# ! Debido a ello, cuando volvamos a constuir la imagen usara el contenido en cache de la instalacion
# ! en vez de construir todo desde cero.
COPY . .

# Creacion de variables de entorno
ENV PORT 3000

# Indicamos el puerto que sera visible del contenedor para ser utilizado por Docker como
# puente con el sistema operativo host
EXPOSE $PORT

# Finalmente, indicamos el comando de ejecucion que sera utilizado cuando se inicie el
# contenedor.
CMD ["node", "index.js"]
