The REST API for the expert collaboration app

To deploy in local mode:

sudo docker run -d -p 27017:27017 mongo
sudo npm start

To use first request a user & sign in:

curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:3000/register
curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:3000/sign_in

Add the token to the authorization header and then you can use the api:

GET /exception
POST /exception
PUT /exception/:exceptionId
GET  /exception/:exceptionId/comment
POST /exception/:exceptionId/comment
PUT /exception/:exceptionId/comment


