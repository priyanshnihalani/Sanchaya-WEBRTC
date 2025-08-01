import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const hasSeen = localStorage.getItem("sanchayaDisclaimerSeen");
    if (hasSeen) setIsOpen(false);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("sanchayaDisclaimerSeen", "true");
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-yellow-300">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-yellow-500" />
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Thank you for using Sanchaya!
            </Dialog.Title>
          </div>

          <div className="text-sm text-gray-800 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <p>
              We're glad you're using <span className="font-semibold text-blue-600">Sanchaya</span>, a real-time file-sharing app built on WebRTC.
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                If the <strong>Receiving Files</strong> page misbehaves or doesn’t load properly, return to the <strong>User ID</strong> entry page and refresh it to re-sync.
              </li>
              <li>
                File transfer performance depends on both your internet connection and physical distance between users. Longer distances may reduce speed.
              </li>
              <li>
                Some mobile browsers (e.g., Samsung Internet) might block required features. Prefer Chrome or Firefox for full support.
              </li>
              <li>
                Sanchaya uses a direct peer-to-peer connection — no files are stored on any server. Ensure the receiver is ready before sending.
              </li>
              <li>
                Avoid refreshing or closing the tab during a file transfer. It can interrupt the process.
              </li>
            </ul>

            <p className="italic text-gray-700">
              We're constantly improving. If you face issues, feel free to share feedback. 💙
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Got it!
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
