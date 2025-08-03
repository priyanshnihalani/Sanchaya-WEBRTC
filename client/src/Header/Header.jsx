import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Lucide icons

function Header() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="w-full border-b border-[#f0f2f5] px-6 md:px-10 py-4" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="flex items-center justify-between">
                {/* Logo and Brand */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-6 h-6">
                        {/* SVG Logo */}
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="250.000000pt" height="306.000000pt" viewBox="0 0 250.000000 306.000000" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,306.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                                <path d="M979 2528 c-28 -7 -109 -83 -392 -366 -251 -252 -357 -364 -357 -379 0 -28 100 -139 373 -411 189 -188 218 -213 242 -210 31 3 135 103 890 857 379 378 445 447 445 472 0 18 -7 32 -19 39 -25 13 -1131 12 -1182 -2z" />
                                <path d="M1262 1421 c-164 -159 -447 -440 -629 -623 -352 -353 -359 -362 -313 -403 19 -17 49 -18 592 -11 527 7 575 9 608 26 40 21 670 649 670 669 0 29 -36 70 -294 331 -267 270 -298 299 -324 300 -8 0 -147 -130 -310 -289z" />
                            </g>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Sanchaya</h1>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden  md:flex gap-6  items-center">
                    <Link className="text-sm font-medium hover:underline" to={'/send'}>Send</Link>
                    <Link className="text-sm font-medium hover:underline" to={'/receive'}>Receive</Link>
                    <button onClick={() => navigate('/help')} className="h-10 px-4 bg-gray-100 rounded-full text-sm font-semibold hover:bg-gray-200 transition">
                        Help
                    </button>
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="flex flex-col mt-4 gap-4 md:hidden">
                    <Link to={'/send'} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:underline">Send</Link>
                    <Link to={'/receive'} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium hover:underline">Receive</Link>
                    <button onClick={() => { navigate('/help'); setMobileMenuOpen(false); }} className="h-10 px-4 bg-gray-100 rounded-full text-sm font-semibold hover:bg-gray-200 transition">
                        Help
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
