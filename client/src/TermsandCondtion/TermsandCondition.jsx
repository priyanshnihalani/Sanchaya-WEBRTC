import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const TermsAndConditions = () => {
    return (
        <>
            <Header />
            <div className="px-4 md:px-20 lg:px-40  xl:px-70 flex  justify-center py-10 " style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-wrap justify-between gap-3 p-4">
                        <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight min-w-72">
                            Terms and Conditions
                        </p>
                    </div>

                    {/* Section 1 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        1. Acceptance of Terms
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        By accessing or using Sanchaya , you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
                    </p>

                    {/* Section 2 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        2. Service Description
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        Sanchaya  provides a peer-to-peer file transfer service that allows users to send files directly to each other without storing files on our servers. We do not guarantee the availability or reliability of the service.
                    </p>

                    {/* Section 3 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        3. User Responsibilities
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        You are responsible for the content of the files you transfer and must ensure that you have the right to share them. You agree not to use Sanchaya  for any illegal or unauthorized purpose.
                    </p>

                    {/* Section 4 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        4. Liabilities
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        Sanchaya  is not liable for any damages or losses resulting from your use of the service, including but not limited to data loss, security breaches, or service interruptions. Use Sanchaya  at your own risk.
                    </p>

                    {/* Section 5 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        5. Modifications to Terms
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We reserve the right to modify these Terms and Conditions at any time. Your continued use of Sanchaya  after any changes constitutes your acceptance of the new terms.
                    </p>

                    {/* Section 6 */}
                    <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                        6. Governing Law
                    </h3>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        These Terms and Conditions are governed by the laws of the jurisdiction in which Sanchaya  operates. Any disputes will be resolved in accordance with these laws.
                    </p>
                </div>
            </div>
            <div className="flex-1">
                <Footer />
            </div>
        </>
    );
};

export default TermsAndConditions;
