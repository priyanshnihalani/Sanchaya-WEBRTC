import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import './Home.css'
import { useSocket } from "../context/SocketContext";
import { useEffect } from "react";
import { useUserId } from "../context/UserIdContext";
import DisclaimerModal from "../Disclamer/Disclamer";

const Home = () => {


  
  const navigate = useNavigate();

  const userId = useUserId()
  const socket = useSocket()

  useEffect(() => {

    { userId && socket.emit("register", { userId }) }

  }, [socket])


  return (
    <div
      className="relative flex min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <DisclaimerModal />

      <div className="layout-container flex h-full grow flex-col">
        {/* Header Component */}
        <Header />

        {/* Main Content */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1024px] w-full flex-1">
            {/* Hero Section */}
            <div className="flex min-h-[360px] sm:min-h-[480px] aspect-[16/9] flex-col gap-6 sm:gap-8 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 sm:p-6 md:p-8"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5nCDbD-HNQXfXHbjV9Z4Y3bueApIP_HsGAoplIGjBZIiGQvS2y9vR_mY19foPFeHCLAe31zTdL-HgVF0Q5Rjy-VS5tvSxSuQwlrUGUjDGY_gms-WCX_dRI1xP9ktcJU2JqwRG-_-y5k4oLoFuvWtEA3oj3ABYWuH8kNB-Hx7p8adMnwMbMgVnl1BcGv8dPFTf9dIzIT_VDK-f6Z57Xn-JXitGOjfHyxfYoxf6nCr1gieEqmu-Y3MaFYMd3LDEAmLWFN0Uh0TZ9eA=s4096')",
              }}
            >
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Share files with anyone, anywhere
                </h1>
                <h2 className="text-white text-sm sm:text-base font-normal leading-normal">
                  Sanchaya is a simple way to send files to friends, family, and colleagues. No sign-up required.
                </h2>
              </div>
              <button
                onClick={() => navigate("/send")}
                className="flex min-w-[120px] max-w-[300px] h-10 sm:h-12 px-4 sm:px-6 items-center justify-center rounded-xl bg-[#3d98f4] text-white text-sm sm:text-base font-bold leading-normal tracking-wide"
              >
                <span className="truncate">Send a file</span>
              </button>
            </div>

            {/* Why FileDrop Section */}
            <div className="flex flex-col gap-10 px-2 sm:px-4 py-10">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#111418] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-[720px]">
                  Why Sanchaya?
                </h1>
                <p className="text-[#111418] text-base font-normal leading-normal max-w-[720px]">
                  Sanchaya is the easiest way to send files of any size to anyone, anywhere. Whether you're sending a single file or a large collection, Sanchaya makes it simple and secure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Feature 1 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4">
                  <div className="text-[#111418]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M160,40A88.09,88.09,0,0,0,81.29,88.67A64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Simple</h2>
                    <p className="text-[#60758a] text-sm font-normal leading-normal">
                      Drag and drop files to send them instantly. No sign-up required.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4">
                  <div className="text-[#111418]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Secure</h2>
                    <p className="text-[#60758a] text-sm font-normal leading-normal">
                      Files are encrypted in transit and at rest. You control who can access your files.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4">
                  <div className="text-[#111418]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Collaborative (soon)</h2>
                    <p className="text-[#60758a] text-sm font-normal leading-normal">
                      Share files with multiple people at once. Get notified when files are downloaded.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </div>

  );
};

export default Home;
