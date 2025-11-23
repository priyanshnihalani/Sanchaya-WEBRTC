import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserId } from "../../context/UserIdContext";
import QRCodeGenerator from "../../Components/QRCodeGenerator";
import { NotificationToSender } from "../../Components/Notification";
import { useSocket } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { useFile } from "../../context/FileContext";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import { useWebRTC } from "../../context/WebRTCContext";
import { QrCode, ShieldCheck, Wifi } from "lucide-react";

function SendInfo() {
    const user = useUserId();
    const location = useLocation();
    const { fromSend } = location.state || {};

    const socket = useSocket();
    const [approval, setApproval] = useState(false);
    const [receiver, setReceiver] = useState('');
    const [hide, setHide] = useState(true);
    const { droppedFiles } = useFile();
    const { instance, createConnection } = useWebRTC();

    const navigate = useNavigate();

    if (!fromSend) {
        return <Navigate to={"/send"} replace />;
    }

    useEffect(() => {
        const handleConnectionRequest = ({ receiverId }) => {
            setReceiver(receiverId);
            setHide(false);
        };

        socket.on("receiver-connection-request", handleConnectionRequest);
        return () => socket.off("receiver-connection-request", handleConnectionRequest);
    }, [socket]);

    useEffect(() => {
        function handleAcceptedFile({ receiverId, senderId, fileName }) {
            navigate('/file-transfer', { state: { receiverId, senderId, fileName }, replace: true });
        }

        socket.on('get-accepted-file', handleAcceptedFile);
        return () => socket.off('get-accepted-file', handleAcceptedFile);
    }, [socket, navigate]);

    useEffect(() => {
        if (!instance && socket) createConnection(droppedFiles);
    }, [socket, droppedFiles]);

    function handleAnswer(answer) {
        instance?.handleAnswer(answer);
    }

    useEffect(() => {
        socket.on('webrtc-answer', handleAnswer);
        return () => socket.off('webrtc-answer', handleAnswer);
    }, [socket, instance]);

    useEffect(() => {
        const handleCandidate = ({ candidate }) => {
            instance?.addIceCandidate(candidate);
            const metaData = droppedFiles.map(item => ({ name: item.name, size: item.size }));
            navigate('/file-transfer', { state: { metaData } });
        };

        socket.on('webrtc-candidate', handleCandidate);
        return () => socket.off('webrtc-candidate', handleCandidate);
    }, [socket, instance]);

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f8]">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="rounded-2xl shadow-lg p-6 space-y-8 bg-white">

                        {/* Header Section */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-[#111418]">
                                Waiting for Receiver
                            </h1>
                            <p className="text-sm text-[#8a96a3]">
                                Ask the receiver to scan this QR or enter the code
                            </p>
                        </div>

                        {/* QR Section */}
                        <div className="flex justify-center">
                            <motion.div
                                animate={{ boxShadow: ["0 0 0px #2f80ed", "0 0 20px #2f80ed80", "0 0 0px #2f80ed"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-4 rounded-2xl bg-[#f0f6ff]"
                            >
                                <div className="bg-white p-3 rounded-xl shadow-md">
                                    <QRCodeGenerator value={user.userName} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Code Display */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center space-y-1"
                        >
                            <p className="text-xs text-[#8a96a3]">Your Secure Code</p>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-block px-6 py-3 text-xl font-bold tracking-widest rounded-xl bg-[#f0f2f5] text-[#111418] shadow-sm"
                            >
                                {user.userName}
                            </motion.div>
                        </motion.div>

                        {/* Info Badges */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex flex-col items-center gap-1"
                            >
                                <Wifi className="w-5 h-5 text-[#2f80ed]" />
                                <span className="text-xs text-[#60758a]">Live</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <ShieldCheck className="w-5 h-5 text-[#2f80ed]" />
                                <span className="text-xs text-[#60758a]">Secure</span>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <QrCode className="w-5 h-5 text-[#2f80ed]" />
                                <span className="text-xs text-[#60758a]">Scan</span>
                            </motion.div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-center pt-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => navigate('/send', { replace: true })}
                                className="h-11 px-8 rounded-lg bg-white border border-[#dbe0e6] text-sm font-semibold text-[#111418] hover:bg-[#f0f2f5] transition"
                            >
                                Cancel Transfer
                            </motion.button>
                        </div>

                    </div>
                </motion.div>
            </main>

            {/* Notification */}
            <AnimatePresence>
                {!hide && (
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 80 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <NotificationToSender
                            senderId={user.userName}
                            receiverId={receiver}
                            approved={approval}
                            socket={socket}
                            setHide={setHide}
                            files={droppedFiles}
                            instance={instance}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

export default SendInfo;