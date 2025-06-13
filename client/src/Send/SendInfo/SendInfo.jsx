import { Navigate, useLocation } from "react-router-dom";
import Footer from "../../Footer/Footer";
import Header from "../../Header/Header";
import { useState } from "react";
import { useUserId } from "../../context/UserIdContext";
import QRCodeGenerator from "../../Components/QRCodeGenerator";

function SendInfo() {
    const user = useUserId();
    const location = useLocation();
    const { fromSend } = location.state || {};
    if (!fromSend) {
        return <Navigate to={"/send"} />;
    }

    const [activeTab, setActiveTab] = useState("userId");

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 flex justify-center items-center px-4 py-12 bg-white">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border">
                    {/* Tabs */}
                    <div className="flex justify-center mb-6">
                        <button
                            className={`px-4 py-2 mx-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                                activeTab === "userId"
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-500 hover:text-black"
                            }`}
                            onClick={() => setActiveTab("userId")}
                        >
                            User ID
                        </button>
                        <button
                            className={`px-4 py-2 mx-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                                activeTab === "qr"
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
            </main>

            <Footer />
        </div>
    );
}

export default SendInfo;    