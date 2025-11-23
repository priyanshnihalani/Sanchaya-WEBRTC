import { motion } from "framer-motion";
import { UploadCloud, File, Download } from "lucide-react";

const FileTransferAnimation = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-48 mt-10 flex items-center justify-between">

      {/* Sender */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center text-white"
      >
        <UploadCloud size={64} />
        <span className="mt-2 text-sm opacity-80">Sender</span>
      </motion.div>

      {/* Flying Files */}
      <motion.div
        className="absolute left-1/4 flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="text-white"
            animate={{
              x: [0, 200, 400],
              y: [0, -30, 0],
              rotate: [0, 15, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <File size={28} />
          </motion.div>
        ))}
      </motion.div>

      {/* Receiver */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center text-white"
      >
        <Download size={64} />
        <span className="mt-2 text-sm opacity-80">Receiver</span>
      </motion.div>
    </div>
  );
};

export default FileTransferAnimation;
