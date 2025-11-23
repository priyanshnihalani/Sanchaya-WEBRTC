import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebRTC } from "../context/WebRTCContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { FileUp } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

const FileTransfer = () => {
  const location = useLocation();
  const [metaData, setMetaData] = useState(location?.state?.metaData || []);
  const navigate = useNavigate();
  const [activeFile, setActiveFile] = useState(null);

  const {
    percentMap,
    estimatedTimes,
    hasError,
    connectionStatus
  } = useWebRTC();

  const allCompleted = metaData.length > 0 && metaData.every(file => (percentMap[file.name] || 0) === 100);
  const hasAnyError =
  connectionStatus === "failed" ||
  metaData.some(file => hasError[file.name]);

  useEffect(() => {
    if (!metaData || metaData?.length === 0) {
      navigate('/sendinfo', { replace: true });
    } else {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [metaData, navigate]);

  useEffect(() => {
    if (!activeFile && metaData.length > 0) {
      const nextFile = metaData.find(
        file => (percentMap[file.name] || 0) === 0
      );

      if (nextFile) {
        setActiveFile(nextFile.name);
      }
    }
  }, [metaData, percentMap, activeFile]);

  useEffect(() => {
    if (!activeFile) return;

    if (percentMap[activeFile] === 100) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Header />

      <main className="flex-1 flex justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white rounded-2xl shadow p-6 sm:p-8 space-y-8">

            {/* Header */}
            <div className="text-center space-y-2">
              <motion.h2
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl font-bold text-[#111418]"
              >
                Transferring Files
              </motion.h2>

              <p className="text-sm text-[#6a7581]">
                Your files are being securely transferred. Please keep this window open.
              </p>

              {connectionStatus === "failed" && (
                <p className="text-center text-red-600 font-semibold">
                  Connection lost. Please retry.
                </p>
              )}
            </div>

            {/* Files List */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#111418]">Files in Progress</h3>

              {metaData?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 120 }}
                  className="rounded-xl border border-[#e5e8ec] bg-[#fafafa] p-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col min-w-0">
                      <p className="font-medium text-sm text-[#121416] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBytes(item.size)} • ETA: {estimatedTimes[item.name] || 'calculating...'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#121416]">
                      {percentMap[item.name] || 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {/* Unique Throwing Progress Bar with Lucide Icon */}
                  <div className="mt-4 w-full relative h-8 flex items-center">

                    {/* Track */}
                    <div className="absolute w-full h-2 rounded-full bg-gradient-to-r from-slate-200 to-slate-300" />

                    {/* Active Glow Path */}
                    <motion.div
                      className="absolute h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentMap[item.name] || 0}%` }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Flying File Icon */}
                    <motion.div
                      className="absolute -top-3"
                      animate={{
                        left: `${percentMap[item.name] || 0}%`,
                        rotate: [0, 8, -8, 0]
                      }}
                      transition={{
                        left: { duration: 0.6, ease: "easeInOut" },
                        rotate: { repeat: Infinity, duration: 0.9 }
                      }}
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <div className="bg-white border border-blue-200 shadow-lg rounded-full p-1.5">
                        <FileUp className="w-4 h-4 text-blue-600" />
                      </div>
                    </motion.div>

                  </div>

                </motion.div>
              ))}
            </div>

            {/* Transfer State */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-xl p-5 text-center transition-colors duration-300 ${allCompleted
                ? "bg-green-100"
                : hasAnyError
                  ? "bg-red-100"
                  : "bg-gradient-to-r from-blue-100 to-blue-50"
                }`}
            >

              {allCompleted && (
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  All files transferred successfully
                </p>
              )}

              {!allCompleted && hasAnyError && (
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-red-700">
                  <XCircle className="w-5 h-5" />
                  Transfer failed for one or more files
                </p>
              )}

              {!allCompleted && !hasAnyError && connectionStatus !== "failed" && (
                <>
                  <p className="text-sm text-[#60758a] font-medium">
                    Secure transfer in progress...
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="mt-4 flex justify-center"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500" />
                  </motion.div>
                </>
              )}

            </motion.div>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FileTransfer;
