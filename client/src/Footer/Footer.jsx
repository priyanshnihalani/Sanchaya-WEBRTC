import { Link } from "react-router-dom";

function Footer() {
    const date = new Date()
    
    return (
        <footer className="w-full bg-gray-50 text-center py-8 border-t" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="max-w-6xl mx-auto flex flex-col gap-6 px-4">
                <div className="flex flex-col sm:flex-row justify-center sm:justify-around gap-4 text-sm text-gray-600">
                    <Link to={'/privacypolicy'} className="hover:underline">Privacy Policy</Link>
                    <Link to={'/termsandcondtion'} className="hover:underline">Terms of Service</Link>
                    <Link to={'/contactus'} className="hover:underline">Contact Us</Link>
                </div>
                <p className="text-sm text-gray-500">© {date.getUTCFullYear()} Sanchaya. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
