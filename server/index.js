import express from "express";
import cors from 'cors'
import env from 'dotenv'
import { Server } from "socket.io";
import http from "http";
import { connectionSetUp } from "./connection.js";

env.config()

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

const userSocketMap = {}
const connection = {}

connectionSetUp(io, userSocketMap, connection)

server.listen(process.env.PORT, () => {
    console.log(`Server is started at ${process.env.PORT}`)
})