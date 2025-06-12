import { useState, useRef, useEffect } from "react";

// Mock Header and Footer components for demo
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import QrScanner from "qr-scanner";

const Receive = () => {
    
    const [activeTab, setActiveTab] = useState("code");
    const [code, setCode] = useState("");
    const [qrError, setQrError] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const qrScannerRef = useRef(null)

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


    const handleConnect = () => {
        if (code.length > 0) {
            alert(`Connecting with code name: ${code}`);
        } else {
            alert('Please enter a valid User code');
        }
    };

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
                                        maxLength={20}
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


                            {/* <div className="flex gap-2">
                                <button
                                    onClick={startCamera}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                    disabled={isScanning}
                                >
                                    Start Camera
                                </button>
                                <button
                                    onClick={stopCamera}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                    disabled={!isScanning}
                                >
                                    Stop Camera
                                </button>
                            </div> */}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Receive;