import { Link } from "react-router-dom";
import { ShieldCheck, FileText, Mail, ArrowUp } from "lucide-react";

function Footer() {
  const date = new Date();

  return (
    <footer
      className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 border-t border-[#e5e7eb]"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">

          {/* Brand Section */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111418]">Sanchaya</h2>
            <p className="text-sm text-[#60758a] max-w-xs">
              Secure, fast and simple file sharing platform. No signup. No limits. Just transfer.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex flex-col sm:flex-row gap-6 text-sm text-[#60758a]">

            <Link
              to="/privacypolicy"
              className="flex items-center gap-2 hover:text-[#111418] transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Privacy Policy
            </Link>

            <Link
              to="/termsandcondtion"
              className="flex items-center gap-2 hover:text-[#111418] transition"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>

            <Link
              to="/contactus"
              className="flex items-center gap-2 hover:text-[#111418] transition"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>

          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[#e5e7eb]" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#8a96a3]">

          <p>
            © {date.getUTCFullYear()} <span className="font-semibold text-[#111418]">Sanchaya</span>. All rights reserved.
          </p>

          {/* Scroll To Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#dbe0e6] hover:bg-[#f0f2f5] transition"
          >
            <ArrowUp className="w-3 h-3" />
            Back to top
          </button>

        </div>

      </div>
    </footer>
  );
}

export default Footer;