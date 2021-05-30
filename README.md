# Project for the Docker with NodeJS Course

Docker is a way of compacting the development and deployment of applications within a box, called container, which give us the possibility to replicate and move our application without mayor complications.

## Steps for Docker

### Build an image

For this example, we will make use of an Express application in conjunction with NodeJS.

In this case, the first thing to be done for the creation of a container, is the creation of an image that will be the base of the container. To do this, we will create the [Dockerfile](Dockerfile) file that will contain the specifications required for the correct operation of the container.

Each of the steps within the file are known as layers, where each layer is executed independently of the other and is cached by Docker to be reused each time the application image is rebuilt.

The command to build our Express app is:

```bash
docker build -t node-app-image .
```

### Run a container (Development)

The next step is to run the container based on the previously created image. To do this, we will use the command:

```bash
docker run -v $(pwd):/app:ro -v /app/node_modules --env-file ./.env -p 3000:3000 -d --name node-app node-app-image
```

The command has several flags that we will specify below.

- **-v (working directory):(container directory):ro(Read Only Flag)**

  - In this case, we're binding the current working directory to a directory inside the container through the volumes option provided by Docker.

- **-v (node_modules)**

  - We tell Docker that the node_modules folder must remain intact even if we have binded our development folder inside the container folder.

- **--env-file (path to env file)**

  - We tell Docker to set the enviroment variables listed in the file, inside the container.

- **-p (host port):(container port)**

  - Using this flag we're taking an exposed port inside the container and binding to an open port of the host machine.

- **-d**

  - Especification for daemonized the container.

- **--name (name for the container)**

  - Giving a name to the container for giving more accessibility while we're working.

### Dependencies for development

- **Nodemon**

  - In this case, Nodemon is responsible for listening the changes within the application source code and restarting the NodeJS process to reflect those changes.

## Docker compose

To automate the process of building the image and running the container, we can make use of a [docker-compose](docker-compose.backup.yml) file.

We need to make use of new commands to perform the execution of our docker-compose file.

```bash
docker-compose -f docker-compose.yml -f docker.compose.prod.yml up -d --build
    or
docker-compose -f docker-compose.yml -f docker.compose.dev.yml up -d --build
```

To execute the container with all the configurations specified on the compose file. The flags for this command are:

- **-f (docker-compose file)**

  - To specified an specific file/s that are going to executed as part of the process for build and execute the image

- **-d**

  - For specified to run as a daemonized container.

- **--build**

  - To rebuild the image along with the execution of the container.

```bash
docker-compose down -v
```

To stop the execution of the image. The flags that we're using are:

- **-v**

  - To delete the volumes (named and anonymous) used for the application containers

### Observation for the MongoDB container

In case that we want persistent data from our database container, we shouldn't use the "-v" flag, instead we have to use the following command, after run the containers, to delete anonymous volumes that are no longer used:

```bash
docker volume prune
```

### Observation for a production enviroment

Because within a production environment, the only constant change you are going to have is the "Node/Express" container. We must make sure that this container is the only one affected when rebuilding and re-raising the containers.

To do this we'll modify the docker-compose command as follows:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --no-deps node-app
  or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate --no-deps node-app
```

**It should be noted that it isn't considered a good practice to build the docker image within the production environment.**

## Better workflow with Docker Hub

As part of a better workflow when taking our Docker application to production, it's recommended to make use of an image repository as in this case Docker Hub.

To do so, we can follow the steps below (If you already have a Docker Hub account):

1. Create a repository inside Docker Hub.
2. In our development enviroment login to Docker Hub through the following command:

```bash
docker login
```

3. Next, we need to rename our app image to match the name of the repository in Docker Hub:

```bash
docker image tag node-docker_node-app <username>/<repo-name>
```

- Replace the "node-docker_node-app" for the name of your image

4. After that, we build the image that we'll use in the production enviroment.

```bash
# For all the services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# For the main app service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build node-app
```

5. Upload (Push) the recently builded image to Docker Hub.

```bash
# For all the services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml push

# For the main app service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml push node-app
```

6. Inside the production enviroment we download (pull) the recent changes in the Docker Hub repo.

```bash
# For all the services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

# For the main app service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull node-app
```

7. In the production enviroment, we run our app again with the changes made.

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps node-app
```

### Automation with Watchtower

Within our production environment we can automate the process of downloading and executing the changes made within the Docker Hub repository image.

To do this, we will make use of a special container called "Watchtower" that will be responsible for listening for changes in the Docker Hub repository and automatically download the changes to raise again the image of our application.

```bash
docker run -d --name watchtower -e WATCHTOWER_TRACE=true -e WATCHTOWER_DEBUG=true -e WATCHTOWER_POLL_INTERVAL=<miliseconds> -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower <services to watch>
```

## Orchestrator with Docker Swarm

Due to, during the process of updating the containers of our app we lose availability of the service we'll make use of a Docker's own orchestrator known as Swarm.

This service only need to be active on the production enviroment, to initialize we're going to use the following command:

```bash
docker swarm init --advertise-addr <ip addr to listen>
```

Once the service has been initilized, and the corresponding changes have been made in the docker-compose files, we'll use the following command to raise the services through the orchestrator.

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml docker-node-app
```

To verify that all the services have been initialized:

```bash
docker stack ps docker-node-app
```
