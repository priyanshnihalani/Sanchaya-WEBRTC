import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFile } from "../context/FileContext";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

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
        console.log("Selected files:", files);
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
        console.log("Dropped files:", dropped);
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
            className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
            style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
        >
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="px-6 md:px-40 flex flex-1 justify-center py-5">
                <div className="flex flex-col max-w-[960px] flex-1">
                    <h2 className="text-[#111418] text-[28px] font-bold text-center pb-3 pt-5">
                        Send files
                    </h2>
                    <p className="text-[#111418] text-base font-normal text-center pb-3">
                        Select files to send. A code will be generated for the recipient to use.
                    </p>

                    {/* Drop Area */}
                    <div className="flex flex-col px-4 py-0 ">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`flex flex-col items-center gap-6 rounded-xl px-6 py-14 transition-all duration-200 ${isDragActive ? "bg-blue-50" : ""
                                }`}
                        >
                            <div
                                className="bg-center bg-no-repeat aspect-video bg-cover rounded-xl w-full max-w-[360px]"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsMr95vsXhxrMzy1o16-k569pgJmc0F8cGgR6JtSXFajOcZIVAqfa0CdNWoIfUqEg6uldo4DTbsk8BPe7jS97ZDyVy3G1l-pD8lzoevZrg1ebCb3C4wjKX4R0xZQmXZgeltZyt51j7GZPIKqPshPw3NPrjvzFb9VulajdYo9i9E0HwbIhlyDZLY4oYPBhn_BRg7av8ZLB5nYQEGn8JOWzoq1RzKXuXvlbdWeMAK4Nis-Kf7O7rEpvYrBeZ9G10wP-n5E6uQbVJ-3M')",
                                }}
                            ></div>

                            <div className="flex max-w-[480px] flex-col items-center gap-2">
                                <p className="text-[#111418] text-lg font-bold text-center">
                                    Drag and drop files here
                                </p>
                                <p className="text-[#111418] text-sm font-normal text-center">
                                    Or click below to select files
                                </p>
                            </div>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileInputChange}
                            />

                            {/* Select Files Button */}
                            <button
                                onClick={handleButtonClick}
                                className="cursor-pointer flex min-w-[84px] max-w-[480px] items-center justify-center rounded-xl h-10 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-bold"
                            >
                                Select Files
                            </button>
                            {droppedFiles.length > 0 && (
                                <div className="flex px-4 justify-center">
                                    <button
                                        onClick={() =>
                                            navigate("/sendinfo", { state: { fromSend: true } })
                                        }
                                        className="cursor-pointer flex min-w-[84px] max-w-[480px] items-center justify-center rounded-xl h-10 px-4 bg-[#3d98f4] text-white text-sm font-bold"
                                    >
                                        Generate Code
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Selected Files Listing */}
                    {droppedFiles.length > 0 && (
                        <div className="mt-4 px-4">
                            <h3 className="text-md font-bold mb-2">Selected Files:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {droppedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <p className="font-semibold line-clamp-1">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatBytes(file.size)}
                                        </p>
                                        <p className="text-xs text-gray-500">{file.type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Send;
