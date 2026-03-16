import { useEffect } from "react";
import { useSocket } from "./context/SocketContext";
import { useUserId } from "./context/UserIdContext";

function SocketRegistrar() {
    const { userId } = useUserId();
    const socket = useSocket();

    useEffect(() => {
        if (userId && socket) {
            socket.emit("register", { userId });
            console.log("Registered with socket:", userId);
        }
    }, [socket, userId]);

    return null;
}

export default SocketRegistrar;
