import { useState } from "react"
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { motion } from "framer-motion";

function ContactUs() {
    const [showModal, setShowModal] = useState(false);

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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Form submitted:", formData);
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
    };


    return (

        <>
            <Header />
            {showModal && (
                <DisclaimerModal
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
                                    Send
                                </button>
                            </div>
                        </form>

                        {/* Support Info */}
                        <p className="text-[#6a7681] text-sm text-center px-4 pt-2">
                            Or contact us at <a href="mailto:support@filedrop.com" className="underline">support@sanchaya.com</a> or call us at (555) 123-4567
                        </p>
                    </div>


                </div>
            </div>
            <Footer />
        </>
    )
}

export default ContactUs

const DisclaimerModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-3xl bg-gradient-to-br from-white via-white to-[#e6faff] rounded-3xl shadow-2xl p-6 sm:p-10 text-center font-sans relative"
      >
        {/* Success icon container */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5 bg-[#dce8f3] rounded-full shadow-lg">
          <svg width="36" height="36" fill="none" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="none" />
            <path
              d="M10.5 16.5L15 21L22 14"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mb-2">Success!</h2>

        {/* Message */}
        <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-base sm:text-lg rounded-full bg-gradient-to-r from-[#6a7681] to-[#dce8f3] text-white font-semibold shadow hover:from-[#4b5563] hover:to-[#cbd5e1] transition-all duration-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};


