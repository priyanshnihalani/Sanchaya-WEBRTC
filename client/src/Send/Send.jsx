import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFile } from "../context/FileContext";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { motion } from "framer-motion";
import {
    UploadCloud,
    FolderArchive,
    FileText,
    CheckCircle2
} from "lucide-react";
const Send = () => {
    const { droppedFiles, setDroppedFiles } = useFile();
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files).map((file) => ({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
        }));
        setDroppedFiles([...droppedFiles, ...files]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const dropped = Array.from(e.dataTransfer.files).map((file) => ({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
        }));
        setDroppedFiles([...droppedFiles, ...dropped]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    function formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    return (
        <div
            className="min-h-screen bg-[#f5f6f8] flex flex-col"
            style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
        >
            <Header />

            <div className="flex justify-center items-center flex-1 px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md rounded-2xl shadow p-6 space-y-6 bg-white"
                >

                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#111418] flex items-center justify-center gap-2">
                            <UploadCloud className="w-6 h-6 text-[#2f80ed]" />
                            Send files
                        </h2>
                        <p className="text-sm text-[#8a96a3] mt-1">
                            Select files to send. A code will be generated for the recipient.
                        </p>
                    </div>

                    {/* Drop Area */}
                    <motion.div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        animate={{ scale: isDragActive ? 1.03 : 1 }}
                        className={`flex flex-col items-center gap-5 rounded-xl border-2 border-dashed px-6 py-10 transition ${isDragActive
                                ? "bg-blue-50 border-blue-400"
                                : "bg-[#f0f2f5] border-[#dbe0e6]"
                            }`}
                    >

                        {/* Floating Upload Icon */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow"
                        >
                            <UploadCloud className="w-10 h-10 text-[#2f80ed]" />
                        </motion.div>

                        <div className="text-center space-y-1">
                            <p className="text-[#111418] font-semibold flex items-center justify-center gap-2">
                                Drag and drop files here
                            </p>
                            <p className="text-sm text-[#60758a] flex items-center justify-center gap-2">
                                <FolderArchive className="w-4 h-4" />
                                Or select files / zip folder
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            className="hidden"
                            onChange={handleFileInputChange}
                        />

                        <button
                            onClick={handleButtonClick}
                            className="h-10 px-6 rounded-lg bg-white border border-[#dbe0e6] font-semibold text-sm hover:border-blue-400 transition flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Select Files or Zip
                        </button>

                        {droppedFiles.length > 0 && (
                            <button
                                onClick={() => navigate("/sendinfo", { state: { fromSend: true } })}
                                className="h-10 px-6 rounded-lg bg-[#2f80ed] text-white font-semibold hover:bg-[#256bc3] transition flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Generate Code
                            </button>
                        )}
                    </motion.div>

                    {/* Selected Files */}
                    {droppedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="text-sm font-bold text-[#111418] mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#2f80ed]" />
                                Selected Files
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                {droppedFiles.map((file, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex justify-between items-center border rounded-lg p-3 bg-[#fafafa]"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm truncate max-w-[180px] flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatBytes(file.size)} • {file.type || "Unknown"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default Send;
