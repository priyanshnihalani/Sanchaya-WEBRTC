export function connectionSetUp(io) {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    // receiver requests connection with sender
    socket.on("connect-sender-receiver", ({ senderId, receiverId }) => {

      io.to(senderId).emit("receiver-connection-request", {
        receiverId
      });

    });

    // sender approves receiver
    socket.on("approve-receiver", ({ senderId, receiverId, approved }) => {

      io.to(receiverId).emit(
        approved ? "receiver-approved" : "receiver-rejected",
        { senderId, approved }
      );

    });

    socket.on("offer", ({ offer, room }) => {
      socket.to(room).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, room }) => {
      socket.to(room).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, room }) => {
      socket.to(room).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

}