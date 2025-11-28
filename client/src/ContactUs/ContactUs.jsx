import { useState } from "react"
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

function ContactUs() {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Email is not valid";
        }
        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message should be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear error when typing
        setErrors({
            ...errors,
            [e.target.name]: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {   
            setLoading(true)
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Hello")
                setFormData({ name: "", email: "", message: "" });
                setErrors({});
                setShowModal(true);
            } else {
                const result = await response.json();
                alert("Failed to send message: " + result.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong.");
        }
        finally{
            setLoading(false)
        }
    };


    return (

        <>
            <Header />
            {showModal && (
                <ImprovedDisclaimerModal
                    message="Your message was sent successfully!"
                    onClose={() => setShowModal(false)}
                />
            )}
            <div className="w-full  px-10 flex justify-center items-center py-5">
                <div className="flex flex-col-reverse md:flex-row space-x-8 gap-10 max-w-[960px] w-full justify-center items-center">

                    {/* Form Section */}
                    <div className="flex-1 lg:w-3/4 lg:flex-none ">
                        <h2 className="text-[#121416] tracking-light text-[28px] font-bold leading-tight text-center pb-3 pt-5">
                            Contact Us
                        </h2>

                        <form onSubmit={handleSubmit}>
                            {/* Name Field */}
                            <div className="px-4 py-3">
                                <label className="flex flex-col">
                                    <p className="text-[#121416] font-medium pb-2">Name</p>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Your name"
                                        className="form-input w-full rounded-xl bg-[#f1f2f4] h-14 p-4 text-base focus:outline-0 border-none"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </label>
                            </div>

                            {/* Email Field */}
                            <div className="px-4 py-3">
                                <label className="flex flex-col">
                                    <p className="text-[#121416] font-medium pb-2">Email</p>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Your email"
                                        className="form-input w-full rounded-xl bg-[#f1f2f4] h-14 p-4 text-base focus:outline-0 border-none"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </label>
                            </div>

                            {/* Message Field */}
                            <div className="px-4 py-3">
                                <label className="flex flex-col">
                                    <p className="text-[#121416] font-medium pb-2">Message</p>
                                    <textarea
                                        name="message"
                                        placeholder="Your message"
                                        className="form-input w-full rounded-xl bg-[#f1f2f4] min-h-36 p-4 text-base focus:outline-0 border-none"
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="px-4 py-3">
                                <button
                                    type="submit"
                                    className="cursor-pointer w-full rounded-full h-10 bg-[#dce8f3] text-[#121416] text-sm font-bold"
                                >
                                    {loading ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </form>

                        {/* Support Info */}
                        <p className="text-[#6a7681] text-sm text-center px-4 pt-2">
                            Or contact us at <a href="mailto:sanchaya.space@gmail.com" className="underline">sanchaya.space@gmail.com</a>
                        </p>
                    </div>


                </div>
            </div>
            <Footer />
        </>
    )
}

export default ContactUs;

const ImprovedDisclaimerModal = ({ message, onClose }) => {
return (
<div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
<motion.div
initial={{ opacity: 0, y: 30, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.95 }}
transition={{ duration: 0.4, ease: "easeOut" }}
className="w-full max-w-xl rounded-full bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-8 sm:p-10 text-center relative"
>
{/* Animated Glow Ring */}
<div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-blue-400/30 blur-2xl" />


{/* Icon */}
<div className="relative w-20 h-20 flex items-center justify-center mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl">
<CheckCircle className="w-10 h-10 text-white" />
</div>


{/* Title */}
<h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">
Action Completed
</h2>


{/* Message */}
<p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-8">
{message}
</p>


{/* Divider */}
<div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-8" />


{/* Button Section */}
<div className="flex justify-center">
<button
onClick={onClose}
className="group relative inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none"
>
<span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition" />
Close
</button>
</div>
</motion.div>
</div>
);
};




