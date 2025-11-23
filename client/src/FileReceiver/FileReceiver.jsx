import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { replace, useLocation, useNavigate } from "react-router-dom";
import { useWebRTC } from "../context/WebRTCContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, DownloadCloud } from "lucide-react";

const FileReceiver = () => {
  const location = useLocation();
  const [metaData, setMetaData] = useState(location?.state?.metaData || []);
  const [fileStatus, setFileStatus] = useState({});
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState(null);

  const {
    instance,
    writableRef,
    currentFileRef,
    percentMap,
    estimatedTimes,
    hasError,
  } = useWebRTC();

  useEffect(() => {
    if (!metaData || metaData.length === 0) {
      navigate('/receive', { replace: true });
    } else {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [navigate, metaData]);

  useEffect(() => {
    if (!activeFile) return;

    if (percentMap[activeFile] === 100) {
      setFileStatus(prev => ({
        ...prev,
        [activeFile]: "received"
      }));

      setActiveFile(null);
    }
  }, [percentMap, activeFile]);

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async function handleAcceptFile(file) {
    setActiveFile(file.name);

    setFileStatus(prev => ({
      ...prev,
      [file.name]: "receiving"
    }));

    try {
      const dirHandle = await window.showDirectoryPicker();
      const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
      const writable = await fileHandle.createWritable({ keepExistingData: false });

      if (writableRef.current) {
        try {
          await writableRef.current.close();
        } catch { }
      }

      writableRef.current = writable;
      currentFileRef.current = file.name;

      instance.acceptFileName(JSON.stringify({
        type: "file-name",
        name: file.name,
        size: file.size,
      }));

    } catch (err) {
      console.error(err);
      setFileStatus(prev => ({
        ...prev,
        [file.name]: "error"
      }));
    }
  }

  function handleReject(name) {
    const newMetaData = metaData.filter(item => item.name !== name);
    setMetaData(newMetaData);

    if (activeFile === name) {
      setActiveFile(null);
    }
  }

  const allCompleted =
    metaData.length > 0 &&
    metaData.every(file => (percentMap[file.name] || 0) === 100);

  const hasAnyError =
    metaData.some(file => fileStatus[file.name] === "error" || hasError[file.name]);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <main className="flex-1 flex justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-10 space-y-8 shadow">

            {/* ===== Receiving Header ===== */}
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="w-3 h-3 rounded-full bg-blue-500"
                />
                <h2 className="text-3xl font-bold text-[#111418]">
                  Receiving Files
                </h2>
              </div>

              <p className="text-sm text-[#6a7581]">
                Live secure transfer in progress. Keep this window open.
              </p>
            </div>

            {/* ===== Files ===== */}
            <div className="space-y-5">
              {metaData?.map((item, index) => {
                const percent = percentMap[item.name] || 0;
                const status = fileStatus[item.name];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl p-5 border border-[#e5e8ec] bg-[#fafafa]  flex flex-col gap-3

        `}
                  >

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#121416] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(item.size)} • ETA: {estimatedTimes[item.name] || "calculating..."}
                        </p>

                        {status === "receiving" && (
                          <span className="text-xs text-blue-600 font-semibold animate-pulse">
                            Capturing...
                          </span>
                        )}
                      </div>

                      <span className="text-sm font-bold text-blue-700">
                        {percent}%
                      </span>
                    </div>

                    {/* === RECEIVING ANIMATION BAR === */}
                    <div className="mt-4 w-full relative h-10 flex items-center">

                      {/* Track */}
                      <div className="absolute w-full h-2 rounded-full bg-gradient-to-r from-slate-200 to-slate-300" />

                      {/* Active Progress */}
                      <motion.div
                        className="absolute h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6 }}
                      />

                      {/* Capturing File Icon */}
                      <motion.div
                        className="absolute -top-3"
                        animate={{
                          left: `${percent}%`,
                          scale: status === "receiving" ? [1, 1.3, 1] : 1,
                          y: [0, -4, 0]
                        }}
                        transition={{
                          left: { duration: 0.6, ease: "easeInOut" },
                          scale: { repeat: Infinity, duration: 0.9 },
                          y: { repeat: Infinity, duration: 0.9 }
                        }}
                        style={{ transform: "translateX(-50%)" }}
                      >
                        <div className="bg-white border border-blue-300 shadow-xl rounded-full p-2">
                          <DownloadCloud className="w-4 h-4 text-blue-600" />
                        </div>
                      </motion.div>

                    </div>

                    {/* Buttons */}
                    {status !== "received" && (
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => handleAcceptFile(item)}
                          disabled={status === "receiving" || (activeFile && activeFile !== item.name)}
                          className="px-4 py-1.5 text-sm rounded-lg border hover:border-blue-500 transition disabled:opacity-50"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(item.name)}
                          disabled={status === "receiving" || (activeFile && activeFile !== item.name)}
                          className="px-4 py-1.5 text-sm rounded-lg border hover:border-red-500 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>


            {/* ===== Footer Status Area ===== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`rounded-2xl p-6 text-center transition-all
              ${allCompleted ? "bg-green-100" :
                  hasAnyError ? "bg-red-100" :
                    "bg-gradient-to-r from-blue-100 to-blue-50"}
            `}
            >
              {allCompleted && (
                <p className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                  <CheckCircle2 /> All files received successfully
                </p>
              )}

              {!allCompleted && hasAnyError && (
                <p className="flex items-center justify-center gap-2 text-red-700 font-semibold">
                  <XCircle /> One or more files failed
                </p>
              )}

              {!allCompleted && !hasAnyError && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-blue-700">
                    Receiving files securely...
                  </p>
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </motion.div>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );

};

export default FileReceiver;