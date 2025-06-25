import { useEffect, useState } from "react";
import { useFile } from "../context/FileContext";
import { useSocket } from "../context/SocketContext";
import { useLocation } from "react-router-dom";

function FileTransfer() {
    const { droppedFiles } = useFile();
    const socket = useSocket();
    const { state } = useLocation();

    const [fileProgress, setFilesProgress] = useState([]);
    const [receiverId, setReceiverId] = useState('');
    const [senderId, setSenderId] = useState('');
    const [currentFile, setCurrentFile] = useState('');


    useEffect(() => {
        setCurrentFile(state?.fileName);
        setSenderId(state?.senderId);
        setReceiverId(state?.receiverId);
    }, [state]);



    useEffect(() => {
        function handleNewAcceptedFile({ receiverId, senderId, fileName }) {
            console.log("📥 New file accepted by receiver:", fileName);

            const file = droppedFiles.find(f => f.name === fileName);
            if (!file) {
                console.error("File not found in droppedFiles:", fileName);
                return;
            }

            // Send file metadata
            const fileMetadata = {
                fileName: file.name,
                size: file.file.size,
                type: file.file.type,
                senderId,
                receiverId
            };

            socket.timeout(30000).emit('file-start', fileMetadata, (err, response) => {
                if (err || response?.status !== 'ok') {
                    console.error("Receiver didn't acknowledge file-start:", response);
                    return;
                }

                handleSend(file, fileName, receiverId); // Start transfer
            });
        }

        function handleStartFileTransfer({ receiverId, senderId, fileName }) {
            console.log("Receiver ready. Starting transfer for:", fileName);
            console.log("Receiver ID:", receiverId, "Sender ID:", senderId);


            console.log("Available files:", droppedFiles.map(f => f.name));

            const file = droppedFiles.find(item => item.name === fileName);
            if (!file) {
                console.error("File not found:", fileName);
                console.error("Available files:", droppedFiles);
                return;
            }

            // Ensure we're using the correct receiverId from the event
            const fileMetadata = {
                fileName: file.name,
                size: file.file.size,
                type: file.file.type,
                senderId,
                receiverId // Use the receiverId from the event parameter
            };

            console.log("Sending file metadata:", fileMetadata);

            // Emit file-start, wait for receiver to ack before sending chunks
            socket.timeout(30000).emit('file-start', fileMetadata, (err, response) => {
                // Enhanced error logging
                if (err) {
                    console.error("Socket timeout or error:", err);
                    return;
                }

                console.log("Server response:", response);

                if (response?.status !== 'ok') {
                    console.error("Receiver didn't acknowledge file-start. Response:", response);
                    console.error("Response status:", response?.status);
                    console.error("Response reason:", response?.reason);
                    return;
                }

                console.log("Receiver acked file-start, now sending file...");
                handleSend(file, fileName, receiverId); // Use receiverId from event
            });
        }

        socket.on('start-file-transfer', handleStartFileTransfer);
        if(currentFile && senderId && receiverId) socket.on('get-accepted-file', handleNewAcceptedFile);

        return () => {
            socket.off('start-file-transfer', handleStartFileTransfer);
            socket.off('get-accepted-file', handleNewAcceptedFile);
        };
    }, [socket, droppedFiles]);

    //  Send chunks of the file
    async function handleSend(file, currentFile, receiverId) {
        let byteSent = 0;
        const chunkSize = 256 * 1024;
        let offset = 0;

        setFilesProgress([
            {
                fileName: file.name,
                percent: 0,
                status: "in-progress"
            }
        ]);

        try {
            while (offset < file.file.size) {
                const chunkBlob = file.file.slice(offset, offset + chunkSize);
                const chunkBuffer = await chunkBlob.arrayBuffer();

                await new Promise((resolve, reject) => {
                    socket.timeout(30000).emit('file-chunk', {
                        chunk: chunkBuffer,
                        receiverId
                    }, (err, response) => {
                        if (err) {
                            console.error("Chunk send timeout/error:", err);
                            return reject(err);
                        }
                        if (response?.status !== 'ok') {
                            console.error("Chunk send failed:", response);
                            return reject(new Error(`Chunk error: ${response?.reason || 'Unknown'}`));
                        }
                        resolve();
                    });
                });

                offset += chunkBuffer.byteLength;
                byteSent += chunkBuffer.byteLength;

                const percent = Math.round((byteSent / file.file.size) * 100);
                setFilesProgress((prev) =>
                    prev.map((f) =>
                        f.fileName === currentFile ? { ...f, percent } : f
                    )
                );
            }

            // Send file-end with proper receiverId
            await new Promise((resolve) => {
                socket.timeout(10000).emit('file-end', { receiverId, fileName: currentFile }, () => {
                    console.log("✅ File-end acknowledged by receiver");
                    resolve();
                });
            });

            setFilesProgress((prev) => {
                const exists = prev.find(f => f.fileName === file.name);
                if (exists) return prev;
                return [...prev, {
                    fileName: file.name,
                    percent: 0,
                    status: "in-progress"
                }];
            });
        } catch (err) {
            console.error("Error during file send:", err);
            setFilesProgress((prev) =>
                prev.map((f) =>
                    f.fileName === currentFile
                        ? { ...f, status: "error" }
                        : f
                )
            );
        }
    }

    return (
        <>
            {fileProgress.map(({ fileName, percent, status }) => (
                <div key={fileName} className="mb-4">
                    <p>{fileName}</p>
                    <div className="flex space-x-3">
                        <div className="w-full bg-gray-300 h-2 rounded">
                            <div
                                className={`h-full transition-all rounded ${status === "done" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-blue-500"}`}
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                        <p className="text-xs mt-1">{`${percent}%`}</p>
                    </div>
                    {status === "error" && (
                        <p className="text-red-500 text-xs mt-1">Transfer failed</p>
                    )}
                </div>
            ))}
        </>
    );
}

export default FileTransfer;