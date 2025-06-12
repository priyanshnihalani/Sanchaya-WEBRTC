import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";

function Help() {
    const navigate = useNavigate()
    return (
        <div
            className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
             style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <Header />
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Header */}
                        <div className="flex flex-wrap justify-between gap-3 p-4">
                            <div className="flex min-w-72 flex-col gap-3">
                                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
                                    Help Center
                                </p>
                                <p className="text-[#60758a] text-sm font-normal leading-normal">
                                    Find answers to common questions or contact us for further assistance.
                                </p>
                            </div>
                        </div>

                        {/* FAQs */}
                        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            Frequently Asked Questions
                        </h2>
                        <div className="flex flex-col p-4 gap-3">
                            {[
                                {
                                    question: "How does the file transfer work?",
                                    answer:
                                        "Our service uses peer-to-peer technology to directly transfer files between devices without storing them on a server. This ensures your files remain private and secure.",
                                    open: true,
                                },
                                {
                                    question: "Is there a limit to the file size I can transfer?",
                                    answer:
                                        "Our service uses peer-to-peer technology to directly transfer files between devices without storing them on a server. This ensures your files remain private and secure.",
                                },
                                {
                                    question: "What happens if the connection is interrupted during a transfer?",
                                    answer:
                                        "Our service uses peer-to-peer technology to directly transfer files between devices without storing them on a server. This ensures your files remain private and secure.",
                                },
                            ].map((item, index) => (
                                <details
                                    key={index}
                                    className="flex flex-col rounded-lg border border-[#dbe0e6] bg-white px-[15px] py-[7px] group"
                                    open={item.open || false}
                                >
                                    <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                                        <p className="text-[#111418] text-sm font-medium leading-normal">{item.question}</p>
                                        <div className="text-[#111418] group-open:rotate-180 transition-transform duration-200">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20px"
                                                height="20px"
                                                fill="currentColor"
                                                viewBox="0 0 256 256"
                                            >
                                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <p className="text-[#60758a] text-sm font-normal leading-normal pb-2">{item.answer}</p>
                                </details>
                            ))}
                        </div>

                        {/* Contact Section */}
                        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                            Contact Us
                        </h2>
                        <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">
                            If you have any other questions or need further assistance, please don't hesitate to reach out to our
                            support team.
                        </p>
                        <div className="flex px-4 py-3 justify-start">
                            <button onClick={() => navigate('/contactus')} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-sm font-bold leading-normal tracking-[0.015em]">
                                <span className="truncate">Contact Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Help;
