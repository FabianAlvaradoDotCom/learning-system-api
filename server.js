/*
In this implementation we are already using sockets for realtime data visualization
Instead of creating the logic for the sockets in this, the server file, we are passing the server (io)
as an argument to the router which endpoints are emitting events.
*/

const path = require("path");
const http = require("http"); // This has been added to implement socket.io
const express = require("express");
//const socket_io = require("socket.io"); // This has been added to implement socket.io
const bodyParser = require("body-parser");
const colors = require("colors");

// Initializing the express function but this this time we are also implementing Socket IO
const app = express();
const server = http.createServer(app); // This has been added to implement socket.io
//const io = socket_io(server); // This has been added to implement socket.io

const api_router = require("./routes/auth_router");
//const sensor_router = require("./routes/sensors_router")(io); // This has been added to implement socket.io
const sensor_router = require("./routes/sensors_router");
const no_access_router = require("./routes/no-access_router");
const capturer_router = require("./routes/capturer_router");
const report_router = require('./routes/reports_router');
const alerts_router = require('./routes/alerts_router');

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
app.use("/", report_router);
app.use("/", alerts_router);
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