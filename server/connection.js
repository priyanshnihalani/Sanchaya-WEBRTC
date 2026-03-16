export function connectionSetUp(io) {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    let currentRoom = null;

    // JOIN ROOM
    socket.on("join", ({ room, userId }) => {
      currentRoom = room;
      socket.userId = userId;

      socket.join(room);

      console.log(`User ${userId} (${socket.id}) joined room ${room}`);

      // notify others
      socket.to(room).emit("peer-joined", {
        userId: userId
      });
    });


    // OFFER
    socket.on("offer", ({ offer, room }) => {
      console.log("Offer from", socket.userId);

      socket.to(room).emit("offer", {
        offer,
        from: socket.userId
      });
    });


    // ANSWER
    socket.on("answer", ({ answer, room }) => {
      console.log("Answer from", socket.userId);

      socket.to(room).emit("answer", {
        answer,
        from: socket.userId
      });
    });


    // ICE CANDIDATE
    socket.on("ice-candidate", ({ candidate, room }) => {
      console.log("ICE candidate from", socket.userId);

      socket.to(room).emit("ice-candidate", {
        candidate,
        from: socket.userId
      });
    });


    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId, socket.id);

      if (currentRoom) {
        socket.to(currentRoom).emit("peer-disconnected", {
          userId: socket.userId
        });
      }
    });

  });
}