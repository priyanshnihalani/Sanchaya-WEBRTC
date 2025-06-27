import { useState, useRef, useEffect } from "react";

// Mock Header and Footer components for demo
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import QrScanner from "qr-scanner";
import { useSocket } from "../context/SocketContext";
import { useUserId } from "../context/UserIdContext";
import { NotificationToReceiver } from "../Components/Notification";
import { motion, AnimatePresence } from "framer-motion";
import CryptoJS from "crypto-js";

const Receive = () => {

    const secretCryptoKey = import.meta.env.VITE_CRYPTO_API_KEY;
    const userId = useUserId();
    const socket = useSocket()
    const [activeTab, setActiveTab] = useState("code");
    const [code, setCode] = useState("");
    const [qrError, setQrError] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const qrScannerRef = useRef(null)
    const [senderId, setSenderId] = useState(null)
    const [approval, setApproval] = useState(false)
    const [showNotification, setShowNotification] = useState(false);
    const [fileNames, setFileNames] = useState([])
    const [recvProgressList, setRecvProgressList] = useState([]);
    const writableRef = useRef(null);
    const currentFileRef = useRef(null);
    const recvSizeRef = useRef(0);
    const recvTotalRef = useRef(0);
    const [receiverReadyMap, setReceiverReadyMap] = useState({});
    const [recvStatus, setRecvStatus] = useState("");
    const [transferError, setTransferError] = useState(false);




    useEffect(() => {
        console.log(socket)
    }, [])
    // Start camera for QR scanning
    const startCamera = async () => {
        try {
            setQrError("");
            setIsScanning(true);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                scanQRCode();
            }
        } catch (error) {
            console.error('Camera access error:', error);
            setQrError('Camera access denied or not available');
            setIsScanning(false);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    // Simple QR code detection (basic implementation)
    const scanQRCode = () => {
        if (videoRef.current) {
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                    setCode(result.data);
                    console.log('Scanned QR code:', result.data);
                    socket.emit("connect-sender-receiver", { receiverId: userId.userName, senderId: result.data });
                    qrScannerRef.current.stop();
                },
                {
                    highlightScanRegion: true,
                    returnDetailedScanResult: true,
                }
            );

            qrScannerRef.current.start();
        }

        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.destroy();
            }
        };
    };

    // Handle tab switching
    useEffect(() => {
        if (activeTab === "qr") {
            startCamera();
        } else {
            stopCamera();
        }

        // Cleanup when component unmounts
        return () => {
            stopCamera();
        };
    }, [activeTab]);


    useEffect(() => {
        console.log("Socket inside useEffect:", socket);  // should print a valid socket

        function handleConnectionResponse({ senderId, approved, fileNames }) {
            console.log("Received in client:", { senderId, approved }); // check if triggered

            if (approved) {
                console.log("Approved!");
                setFileNames(fileNames)
            }
            setSenderId(senderId);
            setApproval(approved);

        }

        if (socket) {
            socket.on("receiver-approved", handleConnectionResponse);
            socket.on("receiver-rejected", handleConnectionResponse);
        }

        return () => {
            if (socket) {
                socket.off("receiver-approved", handleConnectionResponse);
                socket.off("receiver-rejected", handleConnectionResponse);
            }
        };
    }, [socket]);



    useEffect(() => {
        if (senderId) {
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
                setSenderId(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [senderId]);

    function decryptToArrayBuffer(encryptedBase64, secretKey) {
        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, secretKey);
        const u8 = wordArrayToUint8Array(decrypted);
        return u8.buffer;
    }

    function wordArrayToUint8Array(wordArray) {
        const len = wordArray.sigBytes;
        const words = wordArray.words;
        const u8_array = new Uint8Array(len);
        let offset = 0;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            u8_array[offset++] = (word >> 24) & 0xFF;
            if (offset >= len) break;
            u8_array[offset++] = (word >> 16) & 0xFF;
            if (offset >= len) break;
            u8_array[offset++] = (word >> 8) & 0xFF;
            if (offset >= len) break;
            u8_array[offset++] = word & 0xFF;
            if (offset >= len) break;
        }
        return u8_array;
    }


    useEffect(() => {
        const handleFileStart = async ({ fileName, size }, ack) => {
            console.log("Received file-start:", fileName);

            const normalize = (str) => str?.trim().toLowerCase();
            const expected = normalize(fileName);

            const waitUntilReady = async () => {
                for (let i = 0; i < 50; i++) {
                    const current = normalize(currentFileRef.current);
                    console.log("🔍 Check", i, { current, expected });

                    if (writableRef.current && current === expected) return true;
                    await new Promise(r => setTimeout(r, 100));
                }
                return false;
            };

            const isReady = await waitUntilReady();

            if (!isReady) {
                console.warn("Receiver not ready for file-start:", fileName);
                return ack({ status: 'error', reason: 'Receiver not ready' });
            }

            recvSizeRef.current = 0;
            recvTotalRef.current = size;

            setRecvProgressList(prev => [
                ...prev,
                {
                    fileName,
                    percent: 0,
                    status: "in-progress"
                }
            ]);

            console.log("Receiver ACK file-start");
            return ack({ status: 'ok' });
        };

        const handleFileChunk = async ({ chunk }, ack) => {
            console.log("Receiving chunk of size:", chunk?.byteLength || chunk?.length);

            if (!writableRef.current || currentFileRef.current == null) {
                console.warn("Writable not ready or stream closed.");
                return ack({ status: 'error', reason: 'Writable not ready' });
            }


            try {

                const decryptedBuffer = decryptToArrayBuffer(chunk, secretCryptoKey);
                const binaryChunk = new Uint8Array(decryptedBuffer);
                
                await writableRef.current.write(binaryChunk);
                recvSizeRef.current += binaryChunk.length;

                const percent = Math.round((recvSizeRef.current / recvTotalRef.current) * 100);
                setRecvProgressList(prev =>
                    prev.map(f =>
                        f.fileName === currentFileRef.current
                            ? { ...f, percent }
                            : f
                    )
                );

                return ack({ status: 'ok' });
            } catch (error) {
                console.error('Write failed:', error);
                return ack({ status: 'error', reason: 'Write failed' });
            }
        };

        const handleFileEnd = async ({ fileName }) => {
            try {
                if (writableRef.current) {
                    console.log("Attempting to close writable stream...");
                    try {
                        await writableRef.current.close();
                        await new Promise(r => setTimeout(r, 100));
                        console.log(" Writable stream closed.");
                    } catch (closeErr) {
                        if (
                            closeErr instanceof TypeError &&
                            closeErr.message.includes("closed or closing")
                        ) {
                            console.warn(" Stream already closed.");
                        } else {
                            throw closeErr;
                        }
                    }
                } else {
                    console.warn("Writable stream was already null.");
                }

                writableRef.current = null;
                currentFileRef.current = null;

                setRecvProgressList(prev =>
                    prev.map(f =>
                        f.fileName === fileName
                            ? { ...f, percent: 100, status: "done" }
                            : f
                    )
                );
            } catch (err) {
                console.error(" Error during file-end:", err);
            }
        };

        socket.on('file-start', handleFileStart);
        socket.on('file-chunk', handleFileChunk);
        socket.on('file-end', handleFileEnd);

        return () => {
            socket.off('file-start', handleFileStart);
            socket.off('file-chunk', handleFileChunk);
            socket.off('file-end', handleFileEnd);
        };
    }, [socket]);

    useEffect(() => {
        const handleDisconnect = () => {
            console.warn("Receiver disconnected from server");

            setTransferError(true);
            setRecvStatus("disconnected");


            setRecvProgressList(prev =>
                prev.map(f =>
                    f.fileName === currentFileRef.current && f.status === "in-progress"
                        ? { ...f, status: "error" }
                        : f
                )
            );

        };

        const handleReconnect = () => {
            console.log("Receiver reconnected to server");

            setRecvStatus("reconnected");
            setTransferError(false);

            const saved = localStorage.getItem("recv-progress");
            if (saved) {
                try {
                    setRecvProgressList(JSON.parse(saved));
                } catch (err) {
                    console.error("Failed to load saved progress:", err);
                }
            }

            socket.emit("receiver-reconnected", {
                receiverId: userId.userName,
                senderId: code,
            });
        };

        socket.on("disconnect", handleDisconnect);
        socket.on("connect", handleReconnect);

        return () => {
            socket.off("disconnect", handleDisconnect);
            socket.off("connect", handleReconnect);
        };
    }, [socket, code, userId.userName, recvProgressList]);




    const handleConnect = () => {
        if (code.length > 0) {
            alert(`Connecting with code name: ${code}`);

            socket.emit("connect-sender-receiver", { receiverId: userId.userName, senderId: code });

        } else {
            alert('Please enter a valid User code');
        }
    };


    async function handleAccept(fileName) {
        try {

            if (writableRef.current) {
                try {
                    await writableRef.current.close();
                    await new Promise(r => setTimeout(r, 100));
                    console.log("✅ Previous stream closed.");
                } catch (err) {
                    console.warn("Writable already closed:", err.message);
                }
            }
            writableRef.current = null;
            currentFileRef.current = null;

            const dirHandle = await window.showDirectoryPicker();
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();

            writableRef.current = writable;
            currentFileRef.current = fileName;

            // Step 1: Notify sender
            socket.emit('accepted-file', {
                receiverId: userId.userName,
                senderId: code,
                fileName
            });

            // Step 2: Give memory time to set
            await new Promise(resolve => setTimeout(resolve, 300));

            // Step 3: Tell sender to begin
            socket.emit('receiver-ready', {
                receiverId: userId.userName,
                senderId: code,
                fileName
            });


            setRecvProgressList(prev => {
                if (prev.some(f => f.fileName === fileName)) return prev;
                return [
                    ...prev,
                    {
                        fileName,
                        percent: 0,
                        status: "in-progress"
                    }
                ];
            });

            console.log("writableRef set for:", fileName);
        } catch (err) {
            console.error("Failed to prepare for receive:", err);
        }
    }


    function handleReject(name) {
        const removedRejectedFiles = fileNames.filter(item => item !== name);

        setFileNames(removedRejectedFiles)
    }



    return (
        <div
            className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <Header />

            <div className="flex justify-center px-4 md:px-40 py-5 flex-1">
                <div className="w-full max-w-[512px] py-5 flex flex-col space-y-10">
                    <div className="flex justify-between gap-3 p-4">
                        <p className="text-[#111418] text-[32px] font-bold">
                            Connect with others
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="pb-3 border-b border-[#dbe0e6] px-4 gap-8 flex">
                        <button
                            onClick={() => setActiveTab("code")}
                            className={`flex flex-col items-center justify-center pb-[13px] pt-4 cursor-pointer border-b-[3px] ${activeTab === "code"
                                ? "border-[#111418] text-[#111418]"
                                : "border-transparent text-[#60758a]"
                                }`}
                        >
                            <p className="text-sm font-bold tracking-wide">User code</p>
                        </button>
                        <button
                            onClick={() => setActiveTab("qr")}
                            className={`flex flex-col items-center justify-center pb-[13px] pt-4 cursor-pointer border-b-[3px] ${activeTab === "qr"
                                ? "border-[#111418] text-[#111418]"
                                : "border-transparent text-[#60758a]"
                                }`}
                        >
                            <p className="text-sm font-bold tracking-wide">QR code</p>
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "code" && (
                        <>
                            <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                                <label className="flex flex-col min-w-40 flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter User-code"
                                        className="form-input w-full rounded-lg border border-[#dbe0e6] bg-white p-[15px] text-base placeholder:text-[#60758a] h-14 focus:outline-none focus:border-[#111418]"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={30}
                                    />
                                </label>
                            </div>

                            <div className="flex px-4 py-3 justify-end">
                                <button
                                    onClick={handleConnect}
                                    className="h-10 px-4 rounded-lg bg-[#111418] hover:bg-[#2a2f36] text-white text-sm font-bold cursor-pointer transition-colors"
                                >
                                    Connect
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === "qr" && (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-80 h-60 border-2 border-gray-300 rounded-lg object-cover"
                                />
                                {!isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                        <p className="text-gray-600">Camera not active</p>
                                    </div>
                                )}
                            </div>

                            {qrError && (
                                <p className="text-red-500 text-sm text-center">{qrError}</p>
                            )}

                            <p className="text-gray-600 text-sm text-center">
                                {isScanning ? "Scanning for QR code..." : "Camera access needed"}
                            </p>

                        </div>
                    )}
                    <div className="p-4 w-full max-w-3xl mx-auto">
                        <h1 className="text-xl font-semibold border-b pb-2">Files & Folders</h1>

                        <div className="space-y-6 mt-6">
                            {fileNames.length > 0 ? (
                                fileNames.map((name, index) => {
                                    const fileProgress = recvProgressList.find((f) => f.fileName === name);
                                    const percent = fileProgress?.percent || 0;

                                    return (
                                        <div
                                            key={index}
                                            className="relative overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition"
                                        >
                                            {/* ✅ Background fill */}
                                            <div
                                                className={`absolute top-0 left-0 h-full transition-all duration-500 ${fileProgress?.status === "error"
                                                    ? "bg-red-200"
                                                    : "bg-green-100"
                                                    }`}
                                                style={{ width: `${percent}%` }}
                                            ></div>

                                            {/* ✅ Foreground content */}
                                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-4 space-y-2 sm:space-y-0">
                                                <p className="text-gray-800 font-medium break-all">./{name}</p>

                                                <div className="flex space-x-4">
                                                    <button
                                                        className="border-2 hover:bg-green-100 px-4 py-1 rounded-full text-sm font-medium"
                                                        onClick={() => handleAccept(name)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(name)}
                                                        className="border-2 hover:bg-red-100 px-4 py-1 rounded-full text-sm font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic">No files to show</p>
                            )}
                        </div>
                    </div>

                </div>

                <AnimatePresence>
                    {showNotification && senderId && (
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.5, type: "tween" }}
                            className="w-full px-2 fixed bottom-1/4 left-1/2 transform -translate-x-1/2 z-50"
                        >
                            <NotificationToReceiver senderId={senderId} approval={approval} />
                        </motion.div>
                    )}
                </AnimatePresence>


            </div>

            <Footer />
        </div>
    );
};

export default Receive;