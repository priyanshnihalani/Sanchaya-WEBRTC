import { useEffect, useState, useRef } from "react";
import { useFile } from "../context/FileContext";
import { useSocket } from "../context/SocketContext";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";

function FileTransfer() {
    const secretCryptoKey = import.meta.env.VITE_CRYPTO_API_KEY;

    const { droppedFiles } = useFile();
    const socket = useSocket();
    const { state } = useLocation();

    const [fileProgress, setFilesProgress] = useState([]);
    const [receiverId, setReceiverId] = useState('');
    const [senderId, setSenderId] = useState('');
    const [currentFile, setCurrentFile] = useState('');
    const resumeTimeoutRef = useRef(null);       // Tracks the timeout
    const pausedFileRef = useRef(null);          // Tracks paused fileName
    const pausedFileDataRef = useRef(null);

    useEffect(() => {
        setCurrentFile(state?.fileName);
        setSenderId(state?.senderId);
        setReceiverId(state?.receiverId);
    }, [state]);

    useEffect(() => {
        const initialProgress = droppedFiles.map(file => ({
            fileName: file.name,
            percent: 0,
            status: 'waiting'
        }));
        setFilesProgress(initialProgress);
    }, [droppedFiles]);


    useEffect(() => {
        function handleNewAcceptedFile({ receiverId, senderId, fileName }) {
            console.log("New file accepted by receiver:", fileName);

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
                    setFilesProgress(prev =>
                        prev.map(f =>
                            f.fileName === file.name
                                ? { ...f, status: "error", percent: 0 }
                                : f
                        )
                    );
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
        if (currentFile && senderId && receiverId) socket.on('get-accepted-file', handleNewAcceptedFile);

        return () => {
            socket.off('start-file-transfer', handleStartFileTransfer);
            socket.off('get-accepted-file', handleNewAcceptedFile);
        };
    }, [socket, droppedFiles]);

    function arrayBufferToWordArray(ab) {
        const u8 = new Uint8Array(ab);
        return CryptoJS.lib.WordArray.create(u8);
    }

    async function handleSend(file, currentFile, receiverId) {
        let byteSent = 0;
        const chunkSize = 256 * 1024;
        let offset = 0;

        setFilesProgress(prev =>
            prev.map(f =>
                f.fileName === file.name
                    ? { ...f, status: "in-progress", percent: 0 }
                    : f
            )
        );

        try {
            while (offset < file.file.size) {
                const chunkBlob = file.file.slice(offset, offset + chunkSize);
                const chunkBuffer = await chunkBlob.arrayBuffer();
                const wordArray = arrayBufferToWordArray(chunkBuffer);
                const encrypted = CryptoJS.AES.encrypt(wordArray, secretCryptoKey).toString();

                await new Promise((resolve, reject) => {
                    socket.timeout(30000).emit('file-chunk', {
                        chunk: encrypted,
                        receiverId
                    }, (err, response) => {
                        if (err || response?.status !== 'ok') {
                            // Receiver may be offline
                            console.warn("Receiver lost. Waiting 30s for rejoin...");

                            pausedFileRef.current = currentFile;
                            pausedFileDataRef.current = { file, offset, receiverId };

                            // Start 30s timer
                            resumeTimeoutRef.current = setTimeout(() => {
                                console.warn("Receiver didn't rejoin in time. Aborting.");

                                setFilesProgress(prev =>
                                    prev.map(f =>
                                        f.fileName === currentFile ? { ...f, status: "error" } : f
                                    )
                                );

                                pausedFileRef.current = null;
                                pausedFileDataRef.current = null;
                                resumeTimeoutRef.current = null;
                            }, 30000);

                            return; // Exit the chunk loop
                        }

                        resolve();
                    });
                });


                offset += chunkBuffer.byteLength;
                byteSent += chunkBuffer.byteLength;

                const percent = Math.round((byteSent / file.file.size) * 100);
                setFilesProgress(prev =>
                    prev.map(f =>
                        f.fileName === currentFile ? { ...f, percent } : f
                    )
                );
            }


            socket.timeout(10000).emit('file-end', { receiverId, fileName: currentFile })

            setFilesProgress(prev =>
                prev.map(f =>
                    f.fileName === file.name
                        ? { ...f, status: 'done', percent: 100 }
                        : f
                )
            );

        } catch (err) {
            console.error("Error during file send:", err);
            setFilesProgress(prev =>
                prev.map(f =>
                    f.fileName === currentFile
                        ? { ...f, status: "error" }
                        : f
                )
            );
        }
    }

    async function resumeFromOffset(file, fileName, receiverId, startOffset) {
        let byteSent = startOffset;
        const chunkSize = 256 * 1024;
        let offset = startOffset;


        setFilesProgress(prev =>
            prev.map(f =>
                f.fileName === fileName
                    ? { ...f, status: "in-progress" }
                    : f
            )
        );

        try {
            while (offset < file.file.size) {
                const chunkBlob = file.file.slice(offset, offset + chunkSize);
                const chunkBuffer = await chunkBlob.arrayBuffer();

                await new Promise((resolve, reject) => {
                    socket.timeout(30000).emit('file-chunk', {
                        chunk: chunkBuffer,
                        receiverId
                    }, (err, response) => {
                        if (err || response?.status !== 'ok') return reject(err || new Error("Chunk error"));
                        resolve();
                    });
                });

                offset += chunkBuffer.byteLength;
                byteSent += chunkBuffer.byteLength;

                const percent = Math.round((byteSent / file.file.size) * 100);
                setFilesProgress(prev =>
                    prev.map(f =>
                        f.fileName === fileName ? { ...f, percent } : f
                    )
                );
            }

            socket.emit("file-end", { receiverId, fileName });

            setFilesProgress(prev =>
                prev.map(f =>
                    f.fileName === fileName ? { ...f, status: "done", percent: 100 } : f
                )
            );
        } catch (err) {
            console.error("Resume failed:", err);
            setFilesProgress(prev =>
                prev.map(f =>
                    f.fileName === fileName ? { ...f, status: "error" } : f
                )
            );
        }
    }



    useEffect(() => {
        function handleReceiverRejoined({ receiverId }) {
            if (
                pausedFileRef.current &&
                pausedFileDataRef.current?.receiverId === receiverId &&
                resumeTimeoutRef.current
            ) {
                clearTimeout(resumeTimeoutRef.current);
                resumeTimeoutRef.current = null;

                const { file, offset, receiverId } = pausedFileDataRef.current;
                const fileName = pausedFileRef.current;

                console.log("✅ Receiver rejoined within 30s. Resuming:", fileName);

                // Clear paused state
                pausedFileRef.current = null;
                pausedFileDataRef.current = null;

                resumeFromOffset(file, fileName, receiverId, offset);
            }
        }


        socket.on('receiver-rejoined', handleReceiverRejoined);

        return () => {
            socket.off('receiver-rejoined', handleReceiverRejoined);
        };
    }, [socket, currentFile, senderId]);


    return (
        <>
            {fileProgress.length > 0 ? (
                <div className="px-4 md:px-8 lg:px-16 py-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-white mb-6 border-b pb-2">
                        📂 File Transfer Progress
                    </h2>

                    {fileProgress.map(({ fileName, percent, status }) => (
                        <div
                            key={fileName}
                            className="my-6 mx-2 p-4 border border-gray-200 shadow-md rounded-xl bg-white dark:bg-gray-900 transition-all duration-300"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    {fileName}
                                    <span className="text-xs ml-2 text-gray-500">({status})</span>
                                </p>
                                <span className={`text-sm font-medium ${status === "done"
                                    ? "text-green-600"
                                    : status === "error"
                                        ? "text-red-500"
                                        : status === "in-progress"
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                    }`}>
                                    {status === "done" ? "✔ Done" : status === "error" ? "✖ Error" : "⏳ In Progress"}
                                </span>
                            </div>

                            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out rounded-full
                                ${status === "done" ? "bg-gradient-to-r from-green-400 to-green-600"
                                            : status === "error" ? "bg-gradient-to-r from-red-400 to-red-600"
                                                : status === "in-progress" ? "bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"
                                                    : "bg-gray-400"}`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>

                            <div className="text-right mt-1 text-sm text-gray-600 dark:text-gray-300">
                                {percent}%
                            </div>

                            {status === "error" && (
                                <p className="text-red-500 text-xs mt-2">⚠ File transfer failed. Please retry.</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center w-full min-h-screen text-center p-6">
                    <p className="text-4xl md:text-5xl lg:text-6xl text-gray-300 dark:text-gray-600 font-bold italic">
                        No Files Found
                    </p>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
                        Drop a file or wait for one to arrive to see transfer progress here.
                    </p>
                </div>
            )}
        </>
    );

}

export default FileTransfer;