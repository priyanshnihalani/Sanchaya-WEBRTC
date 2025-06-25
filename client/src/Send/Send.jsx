import React, { useContext, useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react"; // Optional icon
import { useFile } from "../context/FileContext";

const Send = () => {
    const {droppedFiles, setDroppedFiles} = useFile();
    const [isDragActive, setIsDragActive] = useState(false);
    const navigate = useNavigate();

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files).map((file) => {
            return {
                file: file,
                name: file.name,
                type: file.type,
                size: file.size
            };
        });

        setDroppedFiles([...droppedFiles,...files]);
        console.log("Selected files/folders:", files);
    };

    const handleFolderInputChange = (e) => {
        const files = Array.from(e.target.files);

        const folderTree = {};

        files.forEach((file) => {
            const pathParts = file.webkitRelativePath.split("/");
            console.log(pathParts)
            let current = folderTree;

            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];

                if (i === pathParts.length - 1) {
                    // It's a file
                    if (!current.children) current.children = [];
                    current.children.push({
                        name: part,
                        type: "file",
                        file: file
                    });
                } else {
                    // It's a folder
                    if (!current.children) current.children = [];

                    let folder = current.children.find(
                        (child) => child.name === part && child.type === "directory"
                    );

                    if (!folder) {
                        folder = {
                            name: part,
                            type: "directory",
                            children: []
                        };
                        current.children.push(folder);
                    }

                    current = folder;
                }
            }
        });


        const tree = folderTree.children || [];

        setDroppedFiles([...droppedFiles, ...tree]);
        console.log("Full folder tree:", tree);
    };



    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const items = e.dataTransfer.items;
        const files = [];

        const readEntries = async (entry) => {
            return new Promise((resolve) => {
                if (entry.isFile) {
                    entry.file((file) => {
                        resolve({
                            name: file.name,
                            type: "file",
                            fullPath: entry.fullPath,
                            file: file,
                        });
                    });
                } else if (entry.isDirectory) {
                    const dirReader = entry.createReader();
                    const readAllEntries = () => {
                        const entries = [];

                        const read = () => {
                            dirReader.readEntries(async (results) => {
                                if (!results.length) {
                                    const children = await Promise.all(
                                        entries.map((ent) => readEntries(ent))
                                    );
                                    resolve({
                                        name: entry.name,
                                        type: "directory",
                                        fullPath: entry.fullPath,
                                        children,
                                    });
                                } else {
                                    entries.push(...results);
                                    read();
                                }
                            });
                        };

                        read();
                    };
                    readAllEntries();
                }
            });
        };


        const getAllFiles = async () => {
            const promises = [];
            for (let i = 0; i < items.length; i++) {
                const entry = items[i].webkitGetAsEntry();
                if (entry) {
                    promises.push(readEntries(entry));
                }
            }
            const results = await Promise.all(promises);
            return results;
        };

        const allFiles = await getAllFiles();
        setDroppedFiles([...droppedFiles, ...allFiles]);
        console.log("Dropped files/folders:", allFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = () => {
        setIsDragActive(false);
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                <Header />

                <div className="px-6 md:px-40 flex flex-1 justify-center py-5">
                    <div className="flex flex-col max-w-[960px] flex-1 ">
                        <h2 className="text-[28px] font-bold leading-tight text-center pb-3 pt-10 my-5">
                            Select files or folders to transfer
                        </h2>

                        {/* Drop and Select Area */}
                        <div className="flex flex-col p-4">
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`transition-all duration-200 flex flex-col items-center gap-6 rounded-lg border-2 border-dashed px-6 py-14 
                                ${isDragActive ? "border-blue-400 bg-blue-50" : "border-[#dbe0e6]"}`}
                            >
                                <div className="flex flex-col items-center gap-2 max-w-[480px]">
                                    <UploadCloud size={40} className="text-black animate-bounce" />
                                    <p className="text-lg font-bold text-center">Drag and drop files here</p>
                                    <p className="text-sm font-normal text-center">Or click to select files from your computer</p>
                                </div>

                                <div className="md:flex space-x-10">
                                    <input
                                        type="file"
                                        id="files"
                                        name="files"
                                        className="hidden"
                                        multiple
                                        onChange={handleFileInputChange}
                                    />

                                    <label htmlFor="files">
                                        <p className="flex items-center h-10 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-bold rounded-lg cursor-pointer">
                                            Select Files
                                        </p>
                                    </label>

                                    <input
                                        type="file"
                                        id="folder"
                                        name="folder"
                                        className="hidden"
                                        multiple
                                        webkitdirectory="true"
                                        directory="true"
                                        onChange={handleFolderInputChange}
                                    />

                                    <label htmlFor="folder">
                                        <p className="flex items-center h-10 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-bold rounded-lg cursor-pointer">
                                            Select Folders
                                        </p>
                                    </label>

                                    {droppedFiles.length > 0 && (
                                        <button
                                            onClick={() => navigate('/sendinfo', { state: { fromSend: true } })}
                                            className="flex items-center h-10 px-4 bg-black hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            Send
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Show Selected Files */}
                        {droppedFiles.length > 0 && (
                            <div className="mt-4 px-4">
                                <h3 className="text-md font-bold">Selected Files:</h3>
                                <ul className="text-sm list-disc list-inside">
                                    {droppedFiles.map((file, idx) => (
                                        <li key={idx}>{`/${file.fullPath || file.name}`}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-[#60758a] text-sm text-center px-4 pt-1 pb-3">
                            Files are transferred directly between devices and are not stored on our servers.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Send;
