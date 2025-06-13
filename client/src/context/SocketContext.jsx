import { useContext, useMemo, createContext } from "react";
import { io } from 'socket.io-client'
const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const socket = useMemo(() => io(backendUrl, {
        transports: ["websocket"],
        withCredentials: true,
    }), [backendUrl]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
export const useSocket = () => useContext(SocketContext);
