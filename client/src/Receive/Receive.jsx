import { useState, useRef, useEffect, useCallback } from "react";

// Mock Header and Footer components for demo
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import QrScanner from "qr-scanner";
import { useSocket } from "../context/SocketContext";
import { useUserId } from "../context/UserIdContext";
import { ConnectionNotificationToSender, ErrorNotificationToReceiver, NotificationToReceiver } from "../Components/Notification";
import { motion, AnimatePresence } from "framer-motion";
import CryptoJS from "crypto-js";
import { useWebRTC } from "../context/WebRTCContext";
import { useNavigate } from "react-router-dom";
import { KeyRound, QrCode, Camera, Link2 } from "lucide-react";


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
    const { instance, createConnection, completed } = useWebRTC();
    const [metaData, setMetaData] = useState(null)
    const navigate = useNavigate()
    const [errorNotify, setErrorNotify] = useState(false)
    const [connectNotify, setConnectNotify] = useState(false)

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
        console.log("Socket inside useEffect:", socket);

        function handleConnectionResponse({ senderId, approved }) {
            console.log("Received in client:", { senderId, approved }); // check if triggered

            if (approved) {
                console.log("Approved!");
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
        if (metaData) {
            navigate('/file-receiver', { state: { metaData } })
        }
    }, [socket, metaData])


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


    useEffect(() => {

        if (!instance) {
            createConnection(); // without files
        }

    }, [socket, createConnection])


    const handleOffer = useCallback(async ({ offer, from }) => {
        try {
            console.log(from)
            setSenderId(from)
            const metaData = await instance?.handleOffer(offer, from)
            setMetaData(metaData)
            console.log(metaData)

        } catch (err) {
            console.error('Error handling offer:', err);
        }
    }, [socket, instance]);

    useEffect(() => {
        socket.on('webrtc-offer', handleOffer);
        return () => {
            socket.off('webrtc-offer', handleOffer);
        };
    }, [socket, instance, handleOffer]);

    useEffect(() => {
        const handleCandidate = ({ candidate }) => {
            instance?.addIceCandidate(candidate);
        }

        socket.on('webrtc-candidate', handleCandidate);

        return () => {
            socket.off('webrtc-candidate', handleCandidate);
        }
    }, [socket, instance]);


    const handleConnect = () => {
        if (code.length > 0) {
            socket.emit("connect-sender-receiver", { receiverId: userId.userName, senderId: code });
            setConnectNotify(true)
            setTimeout(() => {
                setConnectNotify(false)
            }, 5000)
        } else {
            setErrorNotify(true)
            setTimeout(() => {
                setErrorNotify(false)
            }, 5000)
        }
    }

    return (
        <div
            className="min-h-screen bg-[#f5f6f8] flex flex-col space-y-4"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <Header />

            <div className="flex justify-center items-center flex-1 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md rounded-2xl shadow p-6 space-y-6 bg-white"
                >

                    {/* Image Section */}
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="bg-[#e9edf2] rounded-xl flex justify-center p-6"
                    >
                        <div
                            className="w-64 h-64 bg-center bg-no-repeat bg-contain"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwvdfrVNmNF5nvaRC6WROdNExyRtX_Tk6P0jnxjQ1CExHgpvhzoTS-G25l9RpRG2JwMtZ1nsnJDRwnb3loV3AdEFW2r2_qa5MtHrhlBJ8GlAJIZr-8zLUWaxV-tgj8PxHhStMIltqcUpGhJ2W0VoXMknKRJyUDJYBmQBNHdEa3CaHWySGckaQ_sPLQB9imoTLDHgHLtc-29s-fjJTaxV7-6SRFDbf_orRCTWJ9m2xDqJenUy8IkVLO7M-G0lJS46sOBQduxoQPXFA1')",
                            }}
                        />
                    </motion.div>

                    {/* Title Section */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-[#111418] flex items-center justify-center gap-2">
                            <Link2 className="w-6 h-6 text-black" />
                            Enter Code or Scan QR
                        </h2>
                        <p className="text-sm text-[#8a96a3]">
                            Connect securely with sender
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#e2e6ea] relative">
                        {["code", "qr"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2 relative ${activeTab === tab ? "text-black" : "text-gray-400"
                                    }`}
                            >
                                {tab === "code" ? <KeyRound className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                                {tab === "code" ? "Sender Code" : "QR Scanner"}

                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="tabIndicator"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-black"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">

                        {activeTab === "code" && (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter Sender Code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#dbe0e6] focus:outline-none focus:ring-2 focus:ring-[#2f80ed]"
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleConnect}
                                    className="w-full h-12 bg-white border border-[#dbe0e6] text-black rounded-lg font-semibold hover:border-[#2f80ed] transition flex items-center justify-center gap-2"
                                >
                                    <Link2 className="w-4 h-4" />
                                    Connect
                                </motion.button>
                            </motion.div>
                        )}

                        {activeTab === "qr" && (
                            <motion.div
                                key="qr"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center py-4 space-y-2"
                            >
                                <motion.div
                                    animate={{ boxShadow: ["0 0 0px #2f80ed", "0 0 15px #2f80ed80", "0 0 0px #2f80ed"] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="relative w-full rounded-lg"
                                >
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-56 rounded-lg border object-cover"
                                    />

                                    {!isScanning && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                                            <Camera className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                </motion.div>

                                <p className="text-sm text-gray-500">
                                    {isScanning ? "Scanning QR..." : "Camera inactive"}
                                </p>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </div>

            <Footer />
        </div>
    );

};

export default Receive;