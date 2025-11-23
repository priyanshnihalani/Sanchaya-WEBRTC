import WebRTCConnection from "../utility/webrtcConnection";
import { useState, createContext, useContext, useRef } from "react";
import { useSocket } from "./SocketContext";

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
  const socket = useSocket();

  const [instance, setInstance] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");

  const [percentMap, setPercentMap] = useState({});
  const [chunkData, setChunkData] = useState(null);
  const [estimatedTimes, setEstimatedTimes] = useState({});
  const [hasError, setHasError] = useState({});

  const writableRef = useRef(null);
  const currentFileRef = useRef(null);

  const updatePercent = (fileName, value) => {
    setPercentMap(prev => ({ ...prev, [fileName]: value }));
  };

  function createConnection(files) {

    if (instance) {
      try {
        instance.closeConnection();
      } catch {}
    }

    setConnectionStatus("connecting");

    const connection = new WebRTCConnection(
      socket,
      files,
      setCompleted,
      setChunkData,
      writableRef,
      updatePercent,
      setEstimatedTimes,
      setHasError
    );

    setInstance(connection);
    return connection;
  }

  function destroyConnection() {
    if (instance) {
      try {
        instance.closeConnection();
      } catch {}
      setInstance(null);
    }

    setConnectionStatus("idle");
  }

  function resetTransferState() {
    setPercentMap({});
    setChunkData(null);
    setEstimatedTimes({});
    setHasError({});
    setCompleted(false);
  }

  return (
    <WebRTCContext.Provider
      value={{
        instance,
        createConnection,
        destroyConnection,
        resetTransferState,
        completed,
        connectionStatus,
        writableRef,
        percentMap,
        chunkData,
        currentFileRef,
        estimatedTimes,
        hasError
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  return useContext(WebRTCContext);
}
