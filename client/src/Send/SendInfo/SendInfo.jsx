import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import Header from "../../Header/Header";
import { useEffect, useState } from "react";
import { useUserId } from "../../context/UserIdContext";
import QRCodeGenerator from "../../Components/QRCodeGenerator";
import { NotificationToSender } from "../../Components/Notification";
import { useSocket } from "../../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion"; // Add this
import { useFile } from "../../context/FileContext";

function SendInfo() {
    const user = useUserId();
    const location = useLocation();
    const { fromSend } = location.state || {};

    const socket = useSocket()

    const [activeTab, setActiveTab] = useState("userId");
    const [approval, setApproval] = useState(false);
    const [receiver, setReceiver] = useState('')
    const [hide, setHide] = useState(true)
    const { droppedFiles, setDroppedFiles } = useFile();
    
    const navigate = useNavigate()

    if (!fromSend) {
        return <Navigate to={"/send"} />;
    }

    useEffect(() => {
        console.log(socket)

        const handleConnectionRequest = ({ receiverId }) => {
            console.log(receiverId);
            setReceiver(receiverId);
            setHide(false)
        };

        socket.on("receiver-connection-request", handleConnectionRequest);

        return () => {
            socket.off("receiver-connection-request", handleConnectionRequest);
        };
    }, [socket]);

    useEffect(() => {
        function handleAcceptedFile({ receiverId, senderId, fileName }) {
            console.log("📦 Received file");
            navigate('/file-transfer', {
                state: { receiverId, senderId, fileName },
                replace: true
            });
        }

        socket.on('get-accepted-file', handleAcceptedFile);

        return () => {
            socket.off('get-accepted-file', handleAcceptedFile);
        };
    }, [socket, navigate]);

    console.log(hide)
    console.log(receiver)

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="relative flex-1 flex justify-center items-center px-4 py-12 bg-white">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border">
                    {/* Tabs */}
                    <div className="flex justify-center mb-6">
                        <button
                            className={`px-4 py-2 mx-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "userId"
                                ? "border-black text-black"
                                : "border-transparent text-gray-500 hover:text-black"
                                }`}
                            onClick={() => setActiveTab("userId")}
                        >
                            User ID
                        </button>
                        <button
                            className={`px-4 py-2 mx-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "qr"
                                ? "border-black text-black"
                                : "border-transparent text-gray-500 hover:text-black"
                                }`}
                            onClick={() => setActiveTab("qr")}
                        >
                            QR Code
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === "userId" && (
                        <div className="text-center">
                            <p className="text-lg font-semibold mb-3">User ID</p>
                            <div className="border-2 border-black p-4 text-md font-mono bg-gray-50 rounded break-all">
                                {user.userName}
                            </div>
                        </div>
                    )}

                    {activeTab === "qr" && (
                        <div className="flex flex-col items-center">
                            <p className="text-lg font-semibold mb-4">Scan QR Code</p>
                            <QRCodeGenerator value={user.userName} />
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {!hide && (
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.5, type: "tween" }}
                            className="w-full px-2 fixed bottom-1/4 left-1/2 transform -translate-x-1/2 z-50"
                        >
                            <NotificationToSender
                                senderId={user.userName}
                                receiverId={receiver}
                                approved={approval}
                                socket={socket}
                                setHide={setHide}
                                files={droppedFiles}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>


            </main>

            <Footer />
        </div>
    );
}

export default SendInfo;    