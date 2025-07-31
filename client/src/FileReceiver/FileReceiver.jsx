import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useLocation } from "react-router-dom";
import { useWebRTC } from "../context/WebRTCContext";
import { useRef } from "react";

const FileReceiver = () => {
  const location = useLocation();
  const metaData = location?.state?.metaData || [];

  const {
    instance,
    writableRef,
    currentFileRef,
    percentMap,
    estimatedTimes
  } = useWebRTC();

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async function handleAcceptFile(file) {
    const fileData = JSON.stringify({ type: "file-name", name: file.name, size: file.size });

    // Close previous stream if active
    if (writableRef.current) {
      try {
        await writableRef.current.close();
        await new Promise((r) => setTimeout(r, 100));
        console.log("✅ Previous stream closed.");
      } catch (err) {
        console.warn("Writable already closed:", err.message);
      }
    }

    writableRef.current = null;
    currentFileRef.current = null;

    try {
      const dirHandle = await window.showDirectoryPicker();
      const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
      const writable = await fileHandle.createWritable({ keepExistingData: false });

      writableRef.current = writable;
      currentFileRef.current = file.name;

      // Let sender know we're ready to receive this file
      instance.acceptFileName(fileData);
      console.log(" Accept message sent for file:", file.name);
    } catch (err) {
      console.error("Error during writable setup:", err);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden">
      <div className="flex flex-col grow w-full">
        <Header />

        <main className="px-4 sm:px-8 md:px-16 lg:px-40 py-5 flex flex-1 justify-center">
          <div className="w-full max-w-[960px] flex flex-col">
            <h2 className="text-[22px] sm:text-[28px] font-bold text-center pt-5 pb-3">
              Receiving Files
            </h2>
            <p className="text-base text-center px-2 pb-3">
              Your files are being securely received. Please keep this window open until the process is complete.
            </p>

            <h3 className="text-lg font-bold px-2 pt-4 pb-2">Files in Progress</h3>

            {metaData?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-4 py-4 my-2 rounded-md shadow-sm"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-base font-medium text-[#121416] truncate">{item.name}</p>
                  <p className="text-sm text-[#6a7581]">
                    {`${formatBytes(item.size)} | Estimated time remaining: ${estimatedTimes[item.name] || 0}`}
                  </p>
                  <div className="space-x-4 mt-2">
                    <button className="underline cursor-pointer" onClick={() => handleAcceptFile(item)}>
                      accept
                    </button>
                    <button className="underline cursor-pointer">Reject</button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-full sm:w-[200px] bg-[#dde0e3] rounded-sm overflow-hidden">
                    <div className="h-1 bg-[#121416]" style={{ width: `${percentMap[item.name] || 0}%` }} />
                  </div>
                  <p className="text-sm font-medium text-[#121416] min-w-[40px] text-right">
                    {percentMap[item.name] || 0}%
                  </p>
                </div>
              </div>
            ))}

            <div className="w-full p-4">
              <div className="aspect-[3/2] rounded-xl overflow-hidden w-full">
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDe6E7AZ80Eukt6BO4FZKRdZ5V2GVkFqz0G2cYNAw1PKCGjrjbXoSyV-SsWwNGC4R-ZqFnIFefLEtaVqRBK6vDY3ocMlPsxJk6SH9et1c6YuqrIyrtG3MoOvz01o1WM8HSLCiR2XlgZVluOQ3yLWF4REEh4hd1ANQBJgKsD_uhy16RYYn0tYQWSfL9cASU0Bpw9XxxbGk1sAS2fj_lxOm58qMS7UtDdFWiwmgqFQyVKsHONhfa2jQy949sc-W1ZW-KLTxQzzNCJBvE')",
                  }}
                />
              </div>
            </div>

            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FileReceiver;
