The REST API for the expert collaboration app

To deploy in local mode:

sudo docker run -d -p 27017:27017 mongo
sudo npm start

To use first request a user & sign in:

curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:3000/signup
curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}' http://localhost:3000/signin

Add the token to the authorization header and then you can use the api:

GET /exception
POST /exception
PUT /exception/:exceptionId
GET  /exception/:exceptionId/comment
POST /exception/:exceptionId/comment
PUT /exception/:exceptionId/comment

To upload picture
curl --form "recfile=expert.jpg" --header "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbnJpayIsIl9pZCI6IjU5ZTU2NGVhN2I0Y2ViMDAxZjM1MDE1MCIsImlhdCI6MTUwODIwNTgxOH0.RuBLrrXjfCXM5JDgTGIUEH953V0F7HHJ2TzDuX02zGE" -X POST http://localhost:3000/exception/59e58d4042b4cf57a5336609/picture

