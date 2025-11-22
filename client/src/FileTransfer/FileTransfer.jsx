import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebRTC } from "../context/WebRTCContext";
import { useEffect, useState } from "react";

const FileTransfer = () => {
  const location = useLocation();
  const [metaData, setMetaData] = useState(location?.state?.metaData || []);
  const navigate = useNavigate()
  const [activeFile, setActiveFile] = useState(null);

  const {
    percentMap,
    estimatedTimes,
    hasError,
    resetTransfer
  } = useWebRTC();

  useEffect(() => {
    if (!metaData || metaData?.length === 0) {
      navigate('/sendinfo', { replace: true })
    }
  }, [metaData, navigate])

  useEffect(() => {
    return () => {
      resetTransfer();
      setMetaData([]);
    };
  }, [resetTransfer]);

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
    <div
      className="relative flex min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: `Inter, "Noto Sans", sans-serif` }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container w-full max-w-[960px] flex-1 flex flex-col">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-center pt-5 pb-3">
              Transferring Files
            </h2>
            <p className="text-sm sm:text-base text-center px-2 sm:px-4 pb-3">
              Your files are being securely transferred. Please keep this window open until the process is complete.
            </p>

            <h3 className="text-base sm:text-lg font-bold px-2 sm:px-4 pt-4 pb-2">Files in Progress</h3>

            {metaData?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white px-4 py-2 min-h-[72px]"
              >
                <div className="flex flex-col">
                  <p className="text-sm sm:text-base font-medium text-[#121416] truncate">{item.name}</p>
                  <p className="text-xs sm:text-sm text-[#6a7581]">
                    {`${formatBytes(item.size)} | Estimated time remaining: ${estimatedTimes[item.name] || 0}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-full sm:w-[88px] bg-[#dde0e3] rounded-sm overflow-hidden">
                    <div
                      className={`h-1 ${hasError[item.name] ? 'bg-red-500' : 'bg-[#121416]'}`}

                      style={{ width: `${percentMap[item.name] || 0}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#121416]">
                    {percentMap[item.name] || 0}%
                  </p>
                </div>
              </div>
            ))}

            {/* Example Screenshot / Preview Image */}
            <div className="flex w-full grow p-4 bg-white">
              <div className="w-full aspect-[3/2] rounded-xl overflow-hidden">
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAG1aAhWW_uJDjzjvhspRCcGm82pwQxxcY4SVD-dU8lDMn406Ujj7_HalBs6o-3LMvS04bI7gJZbICskLr9Hkvr3KdPmR7cZwUJ-4xSDr1g2xVWUyFqK_6QZbnI5LUDUgFoUQAZafk8uMbXaMc9XQsJdEqavW35LSMLcXGbGmmiYQm_oX02MXqdrgoim9BYSVIf-D83yHb5HR3Z1_HS-fTT4pZvYdyHsk6eoemBnMvLTN3QprAdOhnwbfCBPoEjR8izriZ3QHOK0Qw')",
                  }}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <Footer />
          </div>
        </main>
      </div>
    </div>

  );
};

export default FileTransfer;
