const socket_handlers = io => {
  io.on("connection", socket_connection => {
    console.log("Connected");
    socket_connection.emit("prueba", 50);

    socket_connection.on("back-and-forth", payload => {
      console.log("from client " + payload);

      // This sends to the connected client
      socket_connection.emit("prueba", "mas prueba");

      // This sends to all connected clients
      io.emit("prueba", "all connected!");

      // This sends to everybody but the emitter:
      socket_connection.broadcast.emit("prueba", "mas prueba");

      // This sends the message to everybody when a connection closed (the closed connection will not receive anything as does not exist)
      socket_connection.on("disconnect", () => {
        io.emit("message", "A user has left!");
      });

      // This will receive a message and aknowledge of receiving
      socket_connection.on(
        "message-to-aknowledge",
        (message_received, aknowledgementCallback) => {
          //io.emit(); // This in case we want to share with all connections
          aknowledgementCallback();
        }
      );

      // The below methods send messages to specific 'rooms'
      /*
      io.to('some-room').emit(...)
      socket_connection.broadcast.to('some-room').emit(...)
      */

      //
    });
  });
};

module.exports = socket_handlers;
