import { useNavigate } from "react-router-dom";

// NotificationToSender.jsx
export function NotificationToSender({ senderId, receiverId, socket, setHide, files, instance }) {
    const navigate = useNavigate()
    async function handleApproval(e) {
        const { name } = e.target;

        if (name === "accept") {
            const metaData = files.map((item) => {
                return { name: item.name, size: item.size }
            })


            socket.emit('approve-receiver', { senderId, receiverId, approved: true });

            await instance.createOffer(senderId, receiverId);

        } else {
            socket.emit('approve-receiver', { senderId, receiverId, approved: false });
        }
        setHide(true)
    }

    return (
        <div className="w-full max-w-md mx-auto p-4  rounded-2xl shadow-md bg-white space-y-4">
            <p className="text-base text-center"><b>{receiverId}</b> wants to receive your file.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                    name="accept"
                    className="cursor-pointer w-full sm:w-auto px-4 py-2 border-2 rounded-2xl bg-[#f59d78] font-medium text-white transition-all"
                    onClick={handleApproval}
                >
                    Accept
                </button>
                <button
                    name="reject"
                    className="cursor-pointer w-full sm:w-auto px-4 py-2  rounded-2xl bg-[#f7b58f] text-white font-medium transition-all"
                    onClick={handleApproval}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}

// NotificationToReceiver.jsx
export function NotificationToReceiver({ senderId, approval }) {
    return (
        <div className="w-full max-w-md mx-auto p-4 border rounded shadow-md bg-white space-y-4 text-center">
            <p className="text-base">
                <b>{senderId}</b> has {approval ? "approved" : "rejected"} to share with you.
            </p>
        </div>
    );
}
