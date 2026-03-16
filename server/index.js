import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
    })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log("➡️ Incoming:", req.method, req.path);
    next();
});

/*
====================================================
USER STORAGE
====================================================
*/

const userSocketMap = new Map(); // userId -> socketId
const codeMap = new Map(); // userName(code) -> userId
const connection = new Map(); // senderId -> [receiverIds]

/*
====================================================
SOCKET CONNECTION
====================================================
*/

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /*
    ============================================
    REGISTER USER
    ============================================
    */

    socket.on("register", ({ userId, userName }) => {
        userSocketMap.set(userId, socket.id);
        codeMap.set(userName, userId);

        console.log(
            `User registered: ${userName} (${userId}) -> socket ${socket.id}`
        );
    });

    /*
    ============================================
    RECEIVER REQUESTS CONNECTION
    ============================================
    */

    socket.on("connect-sender-receiver", ({ receiverId, senderCode }) => {
        console.log("CONNECT REQUEST:", receiverId, senderCode);

        const senderUserId = codeMap.get(senderCode);

        if (!senderUserId) {
            console.log("Sender code not found:", senderCode);
            socket.emit("sender-not-available", { senderCode });
            return;
        }

        const senderSocketId = userSocketMap.get(senderUserId);

        if (!senderSocketId) {
            console.log("Sender socket not found:", senderUserId);
            socket.emit("sender-not-available", { senderCode });
            return;
        }

        io.to(senderSocketId).emit("receiver-connection-request", {
            receiverId,
        });

        console.log(
            `Receiver ${receiverId} requested connection with sender ${senderCode}`
        );
    });

    /*
    ============================================
    SENDER APPROVES OR REJECTS RECEIVER
    ============================================
    */

    socket.on("approve-receiver", ({ senderId, receiverId, approved }) => {
        console.log("Approval request:", { senderId, receiverId, approved });

        const receiverSocketId = userSocketMap.get(receiverId);

        if (!receiverSocketId) {
            console.error("Receiver socket not found:", receiverId);
            console.log("Current userSocketMap:", userSocketMap);
            return;
        }

        console.log("Receiver socket found:", receiverSocketId);

        if (approved) {
            if (!connection.has(senderId)) {
                connection.set(senderId, []);
            }

            const receivers = connection.get(senderId);

            if (!receivers.includes(receiverId)) {
                receivers.push(receiverId);
            }

            io.to(receiverSocketId).emit("receiver-approved", {
                senderId,
                approved: true
            });

            console.log(`Receiver ${receiverId} approved by sender ${senderId}`);
        } else {
            io.to(receiverSocketId).emit("receiver-rejected", {
                senderId,
                approved: false
            });
            console.log(`Receiver ${receiverId} rejected by sender ${senderId}`);
        }
    });

    /*
    ============================================
    WEBRTC SIGNALING
    ============================================
    */

    socket.on("webrtc-offer", ({ offer, from, to }) => {
        console.log(`Offer from ${from} -> ${to}`);

        const receiverSocketId = userSocketMap.get(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("webrtc-offer", { offer, from });
        }
    });

    socket.on("webrtc-answer", ({ answer, to }) => {
        console.log(`Answer -> ${to}`);

        const senderSocketId = userSocketMap.get(to);

        if (!senderSocketId) {
            console.error("Sender socket not found for answer:", to);
            return;
        }

        io.to(senderSocketId).emit("webrtc-answer", { answer });
    });

    socket.on("webrtc-candidate", ({ candidate, to }) => {
        console.log(`ICE candidate -> ${to}`);
        const targetSocket = userSocketMap.get(to);
        if (!targetSocket) {
            console.error("Target socket not found for candidate:", to);
            return;
        }
        io.to(targetSocket).emit("webrtc-candidate", { candidate });
    });

    /*
    ============================================
    DISCONNECT
    ============================================
    */

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);

                for (const [code, id] of codeMap.entries()) {
                    if (id === userId) {
                        codeMap.delete(code);
                        break;
                    }
                }

                console.log("User removed:", userId);
                break;
            }
        }
    });
});

/*
====================================================
EMAIL API
====================================================
*/

app.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: "Contact",
            text: `
Name: ${name}
Email: ${email}
Message: ${message}
`,
        });

        console.log("Mail sent successfully");

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Mailer error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

/*
====================================================
SERVER START
====================================================
*/

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
});