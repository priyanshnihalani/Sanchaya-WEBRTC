import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { useSocket } from "../context/SocketContext";
import { useEffect } from "react";
import { useUserId } from "../context/UserIdContext";
import DisclaimerModal from "../Disclamer/Disclamer";
import {
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  File,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

const floating = {
  animate: {
    y: [0, -12, 0],
  },
  transition: {
    duration: 2.5,
    repeat: Infinity,
  },
};

const Home = () => {
  const navigate = useNavigate();
  const userId = useUserId();
  const socket = useSocket();

  useEffect(() => {
    if (userId) socket.emit("register", { userId });
  }, [socket, userId]);

  const steps = [
    { title: "Select Files", desc: "Choose files or folders" },
    { title: "Generate Code", desc: "Share with receiver" },
    { title: "Approve Request", desc: "Verify receiver" },
    { title: "Transfer", desc: "Direct live transfer" },
  ];

  const limitations = [
    "Transfer speed depends on network",
    "Browser must stay open",
    "Not meant for permanent storage",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <DisclaimerModal />
      <Header />

      <main className="flex-1">

        {/* ========== HERO ========== */}
        <section className="min-h-screen flex items-center justify-center text-center px-8">
          <div className="max-w-5xl space-y-8">

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold"
            >
              Real-time File Sharing Without Compromise
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Direct device-to-device file transfer with full control, no storage, no surveillance.
            </motion.p>

            {/* Animated transfer */}
            <div className="flex justify-between items-center mt-14">

              {/* Sender */}
              <motion.div {...floating} className="flex flex-col items-center">
                <UploadCloud size={64} className="text-blue-500" />
                <span className="text-sm mt-2">Sender</span>
              </motion.div>

              {/* Flying Files */}
              <div className="relative flex gap-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      x: [0, 200, 400],
                      y: [0, -30, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.4,
                      repeat: Infinity,
                    }}
                  >
                    <File size={28} className="text-blue-400" />
                  </motion.div>
                ))}
              </div>

              {/* Receiver */}
              <motion.div {...floating} className="flex flex-col items-center">
                <Download size={64} className="text-green-500" />
                <span className="text-sm mt-2">Receiver</span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate?.("/send")}
              className="mt-10 px-12 py-4 rounded-full font-semibold text-white bg-blue-500 shadow-lg"
            >
              Start Sending
            </motion.button>
          </div>
        </section>

        <section className="py-24">
          <h2 className="text-4xl font-bold text-center mb-16">Technology Powering It</h2>


          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
            {[
              { icon: Cpu, title: "WebRTC", desc: "Direct peer-to-peer real-time streaming" },
              { icon: Lock, title: "Encrypted Channels", desc: "Military-grade secure transport" },
              { icon: Layers, title: "Chunk Streaming", desc: "Optimized large file delivery" },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12, rotate: -1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl"
              >
                <Icon size={42} className="text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ========== LIMITATIONS - HONEST DESIGN ========== */}
        <section className="max-w-6xl mx-auto py-24 px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Transparency & Limitations</h2>


          <div className="grid md:grid-cols-3 gap-6">
            {limitations.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex gap-4 p-6 rounded-xl border border-orange-200 shadow-sm"
              >
                <span className="w-10 h-10 rounded-full border-2 border-orange-400 flex items-center justify-center font-semibold text-orange-500">
                  {i + 1}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ========== FINAL CTA - PREMIUM LOOK ========== */}
        <section className="py-28 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Experience Honest File Sharing
          </motion.h2>


          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Designed for real humans. No storage. No tracking. Just fast, secure transfer.
          </p>


          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate?.("/send")}
            className="mt-10 px-12 py-4 rounded-full font-semibold text-white  bg-blue-500  shadow-lg"
          >
            Start Transfer
          </motion.button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
