import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, HelpCircle, Send, Download } from "lucide-react";

function Header() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header
            className="w-full bg-white/80 backdrop-blur border-b border-[#e5e7eb] sticky top-0 z-50"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

                {/* Logo + Brand */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                    >
                        <rect
                            x="0"
                            y="0"
                            width="32"
                            height="32"
                            rx="6"
                            ry="6"
                            fill="#2f80ed"
                        />

                        <svg
                            x="6"
                            y="6"
                            width="20"
                            height="20"
                            viewBox="0 0 250 306"
                        >
                            <g transform="translate(0,306) scale(0.1,-0.1)" fill="#ffffff">
                                <path d="M979 2528 c-28 -7 -109 -83 -392 -366 -251 -252 -357 -364 -357 -379 0 -28 100 -139 373 -411 189 -188 218 -213 242 -210 31 3 135 103 890 857 379 378 445 447 445 472 0 18 -7 32 -19 39 -25 13 -1131 12 -1182 -2z" />
                                <path d="M1262 1421 c-164 -159 -447 -440 -629 -623 -352 -353 -359 -362 -313 -403 19 -17 49 -18 592 -11 527 7 575 9 608 26 40 21 670 649 670 669 0 29 -36 70 -294 331 -267 270 -298 299 -324 300 -8 0 -147 -130 -310 -289z" />
                            </g>
                        </svg>
                    </svg>

                    <h1 className="text-lg font-bold tracking-tight text-[#111418]">
                        Sanchaya
                    </h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">

                    <Link
                        to="/send"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#f0f2f5] transition"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </Link>

                    <Link
                        to="/receive"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#f0f2f5] transition"
                    >
                        <Download className="w-4 h-4" />
                        Receive
                    </Link>

                    <button
                        onClick={() => navigate("/help")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#2f80ed] text-white hover:bg-[#256bc3] transition"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Help
                    </button>
                </nav>

                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden px-4 pb-4 space-y-2 bg-white border-t">

                    <Link
                        to="/send"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#f0f2f5] transition"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </Link>

                    <Link
                        to="/receive"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#f0f2f5] transition"
                    >
                        <Download className="w-4 h-4" />
                        Receive
                    </Link>

                    <button
                        onClick={() => {
                            navigate("/help");
                            setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2f80ed] text-white w-full"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Help
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;