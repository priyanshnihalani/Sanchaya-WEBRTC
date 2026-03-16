const users = new Map();
export function connectionSetUp(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Register user
    socket.on("register", (userId) => {
      users.set(userId, socket.id);
      console.log("User registered:", userId, socket.id);
    });
    // WebRTC OFFER
    socket.on("webrtc-offer", ({ offer, from, to }) => {
      const targetSocket = users.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc-offer", {
          offer,
          from
        });
      } else {
        console.log("Target user not found:", to);
      }
    });
    // WebRTC ANSWER
    socket.on("webrtc-answer", ({ answer, to }) => {
      const targetSocket = users.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc-answer", {
          answer
        });
      }
    });
    // ICE CANDIDATE
    socket.on("webrtc-candidate", ({ candidate, to }) => {
      const targetSocket = users.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("webrtc-candidate", {
          candidate
        });
      }
    });
    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
    });
  });
}