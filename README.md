# The Rest API for the expert collaboration app

## Deploy in local mode

```
sudo docker run -d -p 27017:27017 mongo
sudo redis-server
sudo npm start
```

Add to the database an admin user or any other user
```
{
    "hash_password": "$2a$10$sg/DPvInU6EZEdQdHheKWePhDYbiyoOQV6TxrdOecriCUybkhsBa6",
    "username": "admin",
    "role": "admin"
}
```
Sign in with POST /signin with body 
```
{
	"username":"admin",
	"password":"testPassword"
}
```
Add the token as authorization header to every /api request

## Available routes

### Exceptions
- GET /api/exception
- POST /api/exception
- GET /api/exception/:exceptionId
- PUT /api/exception/:exceptionId
- DELETE /api/exception/:exceptionId

### Comments
- POST /api/exception/:exceptionId/comment
- PUT /api/exception/:exceptionId/comment/:commentId
- DELETE /api/exception/:exceptionId/comment/:commentId

### Authentication and user management
- POST /api/user
- PUT /api/user/:userId/password
- PUT /api/user/:userId/role
- DELETE /api/user/:userId
- POST /signin

### File routes
- POST /api/exception/:exceptionId/picture
- POST /api/user/:userName/picture
- GET /api/picture/:pictureId
- GET /api/user/:userName/picture

### Help files for testing
- To upload picture use: testFileUpload.html
- To test socket.io use: testSocketio.html

## Future plans: 
Build with docker compose, io socket redis, nginx etc.