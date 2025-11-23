import WebRTCConnection from "../utility/webrtcConnection";
import { useState, createContext, useContext, useRef } from "react";
import { useSocket } from "./SocketContext";

const WebRTCContext = createContext(null)

export function WebRTCProvider({ children }) {
    const [instance, setInstance] = useState(null)
    const [completed, setCompleted] = useState(false)
    const socket = useSocket()
    const [percentMap, setPercentMap] = useState({})
    const [chunkData, setChunkData] = useState(null)
    const writableRef = useRef(null)
    const currentFileRef = useRef(null)
    const [estimatedTimes, setEstimatedTimes] = useState({});
    const [hasError, setHasError] = useState({})

    const updatePercent = (fileName, value) => {
        setPercentMap(prev => ({ ...prev, [fileName]: value }));
    };

    function createConnection(files) {
        const connection = new WebRTCConnection(socket, files, setCompleted, setChunkData, writableRef, updatePercent, setEstimatedTimes, setHasError);
        setInstance(connection)
        return connection
    }

    return (
        <WebRTCContext.Provider value={{ instance, createConnection, completed, writableRef, percentMap, updatePercent, chunkData, currentFileRef, estimatedTimes, hasError}}>
            {children}
        </WebRTCContext.Provider>
    )
}

export function useWebRTC() {
    return useContext(WebRTCContext);
}