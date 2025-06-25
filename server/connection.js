export function connectionSetUp(io, userSocketMap, connection) {

  const activeFileTransfers = new Set(); // format: `${senderId}|${receiverId}|${fileName}`

  io.on("connection", (socket) => {
    const id = socket.id;
    console.log("User Connected:", id);

    // Map user ID to socket ID
    socket.on("register", ({ userId }) => {
      userSocketMap[userId] = id;
      console.log(`User ${userId} registered with socket ${id}`);
    });

    // Receiver connects to sender
    socket.on("connect-sender-receiver", ({ receiverId, senderId }) => {
      console.log(userSocketMap)
      const senderSocketId = userSocketMap[senderId];
      const receiverSocketId = userSocketMap[receiverId];

      console.log("receiver id:" + senderSocketId)

      if (senderSocketId) {

        io.to(senderSocketId).emit("receiver-connection-request", {
          receiverId
        });

        console.log(`Receiver ${receiverId} requested to connect to sender ${senderId}`);

      }

      else {
        socket.emit("sender-not-available", { senderId });
      }


      console.log(`User ${receiverId} connected to sender ${senderId}`);
    });

    socket.on('approve-receiver', ({ senderId, receiverId, approved, fileNames }) => {
      const receiverSocketId = userSocketMap[receiverId]

      if (approved) {
        if (!connection[senderId]) {
          connection[senderId] = []
        }

        if (!connection[senderId].includes(receiverId)) {
          connection[senderId].push(receiverId);
        }

        // Notify receiver of approval
        console.log("socket Id: " + receiverSocketId)
        io.to(receiverSocketId).emit("receiver-approved", { senderId, approved, fileNames });

        console.log(`Receiver ${receiverId} approved by sender ${senderId}`);
      }
      else {
        // Notify receiver of rejection
        io.to(receiverSocketId).emit("receiver-rejected", { senderId, approved });
        console.log(`Receiver ${receiverId} rejected by sender ${senderId}`);
      }
    })

    socket.on("accepted-file", ({ receiverId, senderId, fileName }) => {
      const senderSocketId = userSocketMap[senderId]
      if (senderSocketId) {
        io.to(senderSocketId).emit('get-accepted-file', { receiverId, senderId, fileName })
      } else {
        console.warn("Sender socket not found for:", senderId);
      }
    })

    socket.on('receiver-ready', ({ receiverId, senderId, fileName }) => {
      const senderSocketId = userSocketMap[senderId];

      if (senderSocketId) {
        setTimeout(() => {
          io.to(senderSocketId).emit('start-file-transfer', {
            receiverId,
            senderId,
            fileName
          });
        }, 300);

        console.log(`Receiver ${receiverId} is ready for ${fileName}, notifying sender ${senderId}`);
      } else {
        console.warn(` Sender ${senderId} not found when receiver was ready`);
      }
    });


    socket.on('file-start', ({ fileName, size, type, senderId, receiverId }, ack) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (!receiverSocketId) {
        return ack({ status: 'error', reason: 'Receiver not found' });
      }

      io.to(receiverSocketId).timeout(30000).emit(
        'file-start',
        { fileName, size, type, senderId },
        (err, response) => {
          const res = Array.isArray(response) ? response[0] : response;

          console.log("📥 Received ack from receiver:", res);

          if (err || res?.status !== 'ok') {
            return ack({ status: 'error', reason: 'Receiver error' });
          }

          return ack({ status: 'ok' });
        }
      );
    });



    socket.on('file-chunk', ({ chunk, receiverId }, ack) => {
      const receiverSocketId = userSocketMap[receiverId];

      if (!receiverSocketId) {
        return ack({ status: 'error', reason: 'Receiver not found' }); // ⛔ was 'ackCallback' earlier — make sure it's 'ack'
      }

      io.to(receiverSocketId).timeout(30000).emit('file-chunk', { chunk }, (err, response) => {
        console.log("Forwarding chunk to receiver:", receiverId, "Size:", chunk?.byteLength);

        const res = Array.isArray(response) ? response[0] : response;

        if (err || res?.status !== 'ok') {
          return ack({ status: 'error', reason: 'Receiver error' });
        }

        ack({ status: 'ok' }); // ✅ must call ack once only
      });
    });


    socket.on('file-end', ({ receiverId, fileName }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        console.log(`📦 Sending 'file-end' to receiver: ${receiverId} for file: ${fileName}`);

        io.to(receiverSocketId).emit('file-end', { fileName }); // ✅ Include fileName here

        for (const key of activeFileTransfers) {
          if (key.includes(`|${receiverId}|`)) {
            activeFileTransfers.delete(key);
          }
        }
      } else {
        console.warn("❌ Receiver socket not found for file-end.");
      }
    });



    // Handle disconnection
    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      // Clean from userSocketMap
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          disconnectedUserId = userId;
          delete userSocketMap[userId];
          console.log(`User ${userId} disconnected and removed.`);
          break;
        }
      }

      // Clean from sender groups
      if (disconnectedUserId) {
        for (const senderId in connection) {
          // If sender itself disconnected
          if (senderId === disconnectedUserId) {
            delete connection[senderId];
            console.log(`Sender ${senderId} disconnected and group removed.`);
          } else {
            // Remove from receiver list
            connection[senderId] = connection[senderId].filter(
              (receiverId) => receiverId !== disconnectedUserId
            );

            if (connection[senderId].length === 0) {
              delete connection[senderId];
              console.log(`Sender ${senderId} group removed (empty).`);
            }
          }
        }
      }

      console.log("User disconnected:", socket.id);
    });
  });
}