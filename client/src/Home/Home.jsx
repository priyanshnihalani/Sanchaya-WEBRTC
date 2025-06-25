import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import './Home.css'
import { useSocket } from "../context/SocketContext";
import { lazy, useEffect } from "react";
import { useUserId } from "../context/UserIdContext";

const Home = () => {


    const navigate = useNavigate();

    const userId = useUserId()
    const socket = useSocket()

    useEffect(() => {

        { userId && socket.emit("register", { userId }) }

    }, [socket])


    return (
        <div
            className="relative min-h-screen w-full flex flex-col bg-white text-[#111518] font-sans overflow-hidden"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            {/* Floating Bubbles Background */}
            {/* <div className="absolute inset-0 overflow-hidden z-0">
                {Array.from({ length: 12 }).map((_, i) => (
                    <span
                        key={i}
                        className="animate absolute block w-40 h-40 bg-blue-400/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${4 + Math.random() * 6}s`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div> */}

            {/* Header */}
            <div className="relative z-10">
                <Header />
            </div>

            {/* Main Content (Hero Section) */}
            <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-16 py-10 min-h-screen">
                <div className="max-w-7xl w-full flex flex-col-reverse lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <motion.div
                        className="flex-1 flex flex-col gap-6 text-center lg:text-left"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-snug md:leading-tight">
                            The simplest way to send your files around the world
                        </h2>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                            Sanchaya lets you send files of any size to anyone, anywhere. No sign-up required.
                        </p>
                        <div className="justify-center lg:justify-start">
                            <motion.button
                                onClick={() => navigate('/send')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="cursor-pointer px-6 py-3 w-full sm:w-auto md:w-1/2 lg:w-2/3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-100 transition shadow-sm"
                            >
                                Send a file
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        className="flex-1 w-full"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                        <div
                            className="w-full h-64 sm:h-80 md:h-96 lg:h-[30rem] xl:h-[32rem] bg-cover bg-center rounded-xl shadow-md"
                            style={{
                                
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCk3BLjeG8Rzk3U7SQa762wMEJ63a_F2y8-vg2nfsIgJeyNDUiiLT3hFVLVa07Qii1tm0ffh0o1VOS7IUFbfk7tKmkZ2Bhn20B87Cu0ptE7_wgfOT9wqSA2UapFqeSGHGLoXeKZ8tZLR92TO4vEnprTMNHozUTUtkjB7J5EvtyruIKgvIWbCBb21T-l-DFuusQueLXHpRttEfefQK-KYISROZXJD7vsGDEeeozdreYW1HQLmSBv9UrEqxpJUKxQcMlvnufpSEoaqarG")',
                            }}
                        />
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    );
};

export default Home;
