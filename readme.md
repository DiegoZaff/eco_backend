# Eco World Backend

## Installation
You need to have Docker installed on your machine. See [docker documentation](https://docs.docker.com/get-docker/)  
<br>
Start-up all the necessary containers.
```bash
docker compose up --build
```
To stop the process and remove the containers
```bash
docker compose down
```
## Debugging
Hot-reload for development is currently active thanks to nodemon. When you make a change the containers restart automatically with new changes.  

## Database
There's a dedicated container for a postgressql database. To look inside the database from the command line
```bash
docker exec -it <container-id> psql -U <username> -d <db_name>
```
You can find the username and password inside the `docker-compose-yml` file.  
<br>
To find the container id
```bash
docker ps
```
To exit type
```bash
\q
```

### Info
rest server is available at [http://localhost:8080](http://localhost:8080)
