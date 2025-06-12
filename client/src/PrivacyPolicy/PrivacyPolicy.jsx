import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const PrivacyPolicy = () => {
    return (
        <>
        <Header/>
            <div className="px-4 md:px-20 lg:px-40 xl:px-70 flex flex-1 justify-center py-10" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-wrap justify-between gap-3 p-4">
                        <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight min-w-72">
                            Privacy Policy
                        </p>
                    </div>

                    {/* Section: Information We Collect */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Information We Collect
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We collect information that you provide directly to us when you use our services. This includes your email address, which is required to create an account and use our file transfer service. We also collect information about your usage of the service, such as the files you send and receive, the size of the files, and the timestamps of your transfers.
                    </p>

                    {/* Section: How We Use Your Information */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        How We Use Your Information
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We use the information we collect to operate and improve our services. Specifically, we use your email address to identify you, manage your account, and communicate with you about your use of the service. We use information about your file transfers to ensure the proper delivery of files and to monitor the performance of our service. We do not store the content of the files you transfer; we only retain metadata about the transfers.
                    </p>

                    {/* Section: Data Security */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Data Security
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We take the security of your information seriously. We implement appropriate technical and organizational measures to protect your data from unauthorized access, use, or disclosure. These measures include encryption of data in transit and at rest, access controls, and regular security assessments. However, no method of transmission over the internet or method of electronic storage is completely secure, so we cannot guarantee absolute security.
                    </p>

                    {/* Section: Data Retention */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Data Retention
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We retain your personal information only for as long as necessary to provide you with our services and for legitimate and essential business purposes, such as maintaining the performance of the services, making data-driven business decisions about new features and offerings, complying with our legal obligations, and resolving disputes. We retain metadata about your file transfers for a limited period to ensure the proper functioning of our service and to comply with legal requirements.
                    </p>

                    {/* Section: Your Rights */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Your Rights
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        You have the right to access, correct, or delete your personal information. You can manage your account information through your account settings. If you have any questions or requests regarding your personal information, please contact us at privacy@sanchaya .com.
                    </p>

                    {/* Section: Changes to This Policy */}
                    <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                        Changes to This Policy
                    </h2>
                    <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
                        We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the effective date. Your continued use of the service after any changes indicates your acceptance of the updated policy.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
