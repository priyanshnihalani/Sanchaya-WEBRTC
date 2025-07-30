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
        return <Navigate to={"/send"} />;
    }

    useEffect(() => {
        const handleConnectionRequest = ({ receiverId }) => {
            setReceiver(receiverId);
            setHide(false);
        };

        socket.on("receiver-connection-request", handleConnectionRequest);

        return () => {
            socket.off("receiver-connection-request", handleConnectionRequest);
        };
    }, [socket]);

    useEffect(() => {
        function handleAcceptedFile({ receiverId, senderId, fileName }) {
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

    useEffect(() => {
        if (!instance && socket) {
            createConnection(droppedFiles);
        }
    }, [socket, droppedFiles])

    function handleAnswer(answer) {
        instance?.handleAnswer(answer)
    }

    useEffect(() => {

        socket.on('webrtc-answer', handleAnswer)

        return () => {
            socket.off('webrtc-answer', handleAnswer);
        }
    }, [socket, instance])


    useEffect(() => {
        const handleCandidate = ({ candidate }) => {
            instance?.addIceCandidate(candidate);

            const metaData = droppedFiles.map((item) => {
                return { name: item.name, size: item.size }
            })
            navigate('/file-transfer', { state: { metaData } })

        }

        socket.on('webrtc-candidate', handleCandidate);

        return () => {
            socket.off('webrtc-candidate', handleCandidate);
        }
    }, [socket, instance]);



    return (
        <div className="relative flex min-h-screen flex-col     " style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif" }}>
            <Header />

            <main className="px-40 flex flex-1 justify-center py-5 bg-gradient-to-b from-white via-[#f9f9f9] to-white">
                <div className="flex flex-col max-w-[960px] flex-1">
                    <h2 className="text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Waiting for files</h2>
                    <p className="text-base font-normal pb-3 pt-1 px-4 text-center">Share this code or QR with the sender</p>

                    <div className="relative rounded-xl my-8 bg-gradient-to-r from-[#f59d78] to-[#f7b58f] px-12 lg:w-1/2 mx-auto py-10 overflow-hidden shadow-xl">

                        {/* Decorative SVGs */}
                        <svg
                            className="absolute top-0 left-0 w-32 h-32 text-white opacity-20"
                            fill="currentColor"
                            viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M39.6,-68.2C50.7,-59.6,58.6,-49.3,66.6,-37.6C74.6,-25.8,82.8,-12.9,80.7,-1.3C78.5,10.3,66,20.7,57.4,32.4C48.8,44.1,43.9,57.1,34.2,63.7C24.4,70.3,9.8,70.5,-2.9,72.2C-15.7,73.9,-31.3,77.1,-43.4,71.3C-55.6,65.4,-64.4,50.6,-69.6,35.7C-74.8,20.9,-76.3,5.9,-74.5,-9C-72.6,-23.9,-67.3,-38.6,-57.3,-48.4C-47.2,-58.1,-32.4,-62.8,-18.1,-68.5C-3.9,-74.2,10,-81,23.3,-77.4C36.6,-73.9,49.1,-60.9,39.6,-68.2Z" transform="translate(100 100)" />
                        </svg>


                        <svg
                            className="absolute bottom-0 right-0 w-32 h-32 text-white opacity-20"
                            fill="currentColor"
                            viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M39.6,-68.2C50.7,-59.6,58.6,-49.3,66.6,-37.6C74.6,-25.8,82.8,-12.9,80.7,-1.3C78.5,10.3,66,20.7,57.4,32.4C48.8,44.1,43.9,57.1,34.2,63.7C24.4,70.3,9.8,70.5,-2.9,72.2C-15.7,73.9,-31.3,77.1,-43.4,71.3C-55.6,65.4,-64.4,50.6,-69.6,35.7C-74.8,20.9,-76.3,5.9,-74.5,-9C-72.6,-23.9,-67.3,-38.6,-57.3,-48.4C-47.2,-58.1,-32.4,-62.8,-18.1,-68.5C-3.9,-74.2,10,-81,23.3,-77.4C36.6,-73.9,49.1,-60.9,39.6,-68.2Z" transform="translate(100 100)" />
                        </svg>


                        {/* QR Code */}
                        <div className="flex justify-center py-4">
                            <div className="bg-white p-4 rounded-xl shadow-md">
                                <QRCodeGenerator value={user.userName} />
                            </div>
                        </div>

                        {/* User Code */}
                        <h1 className="text-[22px] font-bold leading-tight tracking-tight px-4 text-center pb-3 pt-5">
                            Code: {user.userName}
                        </h1>

                        {/* Cancel Button */}
                        <div className="flex px-4 py-3 justify-center">
                            <button onClick={() => navigate('/send', { replace: true })} className="cursor-pointer flex min-w-[84px] max-w-[480px] items-center justify-center rounded-xl h-10 px-4 bg-[#f0f2f5] text-sm font-bold shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {!hide && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.5, type: "tween" }}
                        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full  px-4 max-w-md"
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
