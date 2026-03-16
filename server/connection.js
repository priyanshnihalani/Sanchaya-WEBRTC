export function connectionSetUp(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
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
