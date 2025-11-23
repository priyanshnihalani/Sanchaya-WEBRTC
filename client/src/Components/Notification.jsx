import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Send, UserCheck } from "lucide-react";

// NotificationToSender.jsx
export function NotificationToSender({ senderId, receiverId, socket, setHide, files, instance }) {
    const navigate = useNavigate();

    async function handleApproval(e) {
        const { name } = e.target;

        if (name === "accept") {
            const metaData = files.map((item) => ({
                name: item.name,
                size: item.size,
            }));

            socket.emit("approve-receiver", { senderId, receiverId, approved: true });
            await instance.createOffer(senderId, receiverId);
        } else {
            socket.emit("approve-receiver", { senderId, receiverId, approved: false });
        }
        setHide(true);
    }

    return (
        <div className="w-full max-w-md mx-auto p-5 rounded-2xl shadow-lg bg-white space-y-4">
            <p className="text-center text-[#111418]  gap-2 font-semibold">
                <div className="flex space-x-2 items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#2f80ed]" />
                    <b>{receiverId}</b>
                </div>
                <h1>wants to receive your file</h1>
            </p>

            <div className="flex gap-3 justify-center">
                <button
                    name="accept"
                    onClick={handleApproval}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2f80ed] text-white font-semibold hover:bg-[#256bc3] transition"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept
                </button>

                <button
                    name="reject"
                    onClick={handleApproval}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#f0f2f5] text-[#111418] font-semibold hover:bg-[#e2e5e9] transition"
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
            </div>
        </div>
    );
}

// NotificationToReceiver.jsx
export function NotificationToReceiver({ senderId, approval }) {
    return (
        <div className="w-full max-w-md mx-auto p-5 rounded-2xl shadow-lg bg-white text-center space-y-2">
            <p className="text-[#111418] flex justify-center items-center gap-2 font-medium">
                {approval ? (
                    <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <b>{senderId}</b> approved your connection
                    </>
                ) : (
                    <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <b>{senderId}</b> rejected your connection
                    </>
                )}
            </p>
        </div>
    );
}

export function ErrorNotificationToReceiver() {
    return (
        <div className="w-full max-w-md mx-auto p-5 rounded-2xl shadow-lg bg-white text-center space-y-2">
            <p className="flex justify-center items-center gap-2 text-red-500 font-semibold">
                <AlertTriangle className="w-5 h-5" />
                Please enter a valid sender ID
            </p>
        </div>
    );
}

export function ConnectionNotificationToSender() {
    return (
        <div className="w-full max-w-md mx-auto p-5 rounded-2xl shadow-lg bg-white text-center space-y-2">
            <p className="flex justify-center items-center gap-2 text-[#111418] font-semibold">
                <Send className="w-5 h-5 text-[#2f80ed]" />
                Request sent to sender successfully
            </p>
        </div>
    );
}