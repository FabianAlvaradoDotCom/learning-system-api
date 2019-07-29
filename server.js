const path = require("path");
const http = require("http"); // This has been added to implement socket.io
const express = require("express");
const socket_io = require("socket.io");
const bodyParser = require("body-parser");
const colors = require("colors");

// Initializing the express function but this this time we are also implementing Socket IO
const app = express();
const server = http.createServer(app);
const io = socket_io(server);

const api_router = require("./routes/auth_router");
const sensor_router = require("./routes/sensors_router");
const no_access_router = require("./routes/no-access_router");
const capturer_router = require("./routes/capturer_router");

// Connecting to the database
require("./database");

// Implementing 'Auth' Middleware. The below works when we want to use the middleware in all requests.
/* --const authMiddleware = require("./middleware/auth");
app.use(authMiddleware); --*/

// Including Body parser
app.use(bodyParser.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property
// We could have used also: app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); //Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option

// Defining routes
app.use("/", api_router);
app.use("/", sensor_router);
app.use("/", capturer_router);
app.use("/", no_access_router);

// Starting the server
const port = process.env.PORT || 5000;

// We replaced this to implement socket.io by the below
/*
const server = app.listen(port, () => {
  if (port === 5000) {
    console.log(`Server running on ${server.address().port}`.green.inverse);
  }
});
//*/

// By this
server.listen(port, () => {
  console.log(`Server running on ${server.address().port}`.green.inverse);
});

// Testing some socket io actions

io.on("connection", socket => {
  //console.log("Connected");
  socket.emit("prueba");
});
