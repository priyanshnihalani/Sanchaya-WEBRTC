import express from "express";
import cors from 'cors';
import env from 'dotenv';
import { Server } from "socket.io";
import http from "http";
import nodemailer from "nodemailer";


env.config()

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]

}))

app.use(express.json())

app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.path);
  next();
});

const userSocketMap = new Map();
const connection = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When client sends offer

    socket.on("register", (userId) => {
        console.log(userId)
        userSocketMap.set(userId.userId, socket.id);
        console.log(`User registered: ${userId.userId} -> ${socket.id}`);
    });

    socket.on("connect-sender-receiver", ({ receiverId, senderId }) => {
        console.log(userSocketMap)
        console.log(receiverId)
        console.log(senderId)
        const senderSocketId = userSocketMap.get(senderId);
        // const receiverSocketId = userSocketMap[receiverId];
        console.log(senderSocketId)


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


    socket.on('approve-receiver', ({ senderId, receiverId, approved }) => {
        const receiverSocketId = userSocketMap.get(receiverId)

        if (approved) {
            if (!connection.has(senderId)) {
                connection.set(senderId, [])
            }

            const receivers = connection.get(senderId);

            if (!receivers.includes(receiverId)) {
                receivers.push(receiverId);
            }

            // Notify receiver of approval
            console.log("socket Id: " + receiverSocketId)
            io.to(receiverSocketId).emit("receiver-approved", { senderId, approved });

            console.log(`Receiver ${receiverId} approved by sender ${senderId}`);
        }
        else {
            // Notify receiver of rejection
            io.to(receiverSocketId).emit("receiver-rejected", { senderId, approved });
            console.log(`Receiver ${receiverId} rejected by sender ${senderId}`);
        }
    })

    socket.on("webrtc-offer", ({ offer, from, to }) => {
        console.log(`Offer from ${socket.id} to ${to}`);
        console.log(from)
        const receiverId = userSocketMap.get(to)

        io.to(receiverId).emit("webrtc-offer", { offer, from });
    });

    // When client sends answer
    socket.on("webrtc-answer", ({ answer, to }) => {
        console.log(`Answer from ${socket.id} to ${to}`);
        console.log("To: " + to)
        const senderId = userSocketMap.get(to)
        io.to(senderId).emit("webrtc-answer", answer);
    });

    // When client sends ICE candidate
    socket.on("webrtc-candidate", ({ candidate, to }) => {
        console.log(`Candidate from ${socket.id} to ${to}`);
        const fromto = userSocketMap.get(to)
        io.to(fromto).emit("webrtc-candidate", { candidate });
    });

    // Handle room joining if needed (optional)
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.post("/send-email", async (req, res) => {
  const {name, email, message} = req.body
  console.log("✅ API HIT");

  try {
    console.log("✅ Creating transporter");

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.MAILER_USER,
              pass: process.env.MAILER_PASSWORD
          }
      });

    console.log("✅ Transporter created");

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "Contact",
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `
    });

    console.log("✅ Mail sent");

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});


const PORT = process.env.PORT
server.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server is started at ${PORT}`)
})