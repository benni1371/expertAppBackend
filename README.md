The REST API for the expert collaboration app

To deploy in local mode:

sudo docker run -d -p 27017:27017 mongo
sudo npm start

To use first request a user & sign in:

curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:3000/signin

Add the token to the authorization header and then you can use the /api routes:

GET /api/exception
POST /api/exception
PUT /api/exception/:exceptionId
GET  /api/exception/:exceptionId/comment
POST /api/exception/:exceptionId/comment
PUT /api/exception/:exceptionId/comment
GET /user/:userName/picture
GET /api/picture/:pictureId
POST /api/signup
POST /signin

To upload picture use: testFileUpload.html
To test socket.io use: testSocketio.html

