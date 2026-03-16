import { useEffect } from "react";
import { useSocket } from "./context/SocketContext";
import { useUserId } from "./context/UserIdContext";

function SocketRegistrar() {

    const { userId, userName } = useUserId();
    const socket = useSocket();

    useEffect(() => {

        if (!socket || !userId) return;

        socket.emit("register", userId);

        console.log("Registered socket with userId:", userId);
        console.log("Username:", userName);

    }, [socket, userId]);

    return null;
}

export default SocketRegistrar;