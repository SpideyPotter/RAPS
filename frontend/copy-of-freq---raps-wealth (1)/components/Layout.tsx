import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Phone } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Mutual Funds', path: '/funds' },
    { name: 'RAPS Calculator', path: '/calculator' },
    { name: 'SIP NAV Movement', path: '/sip-movement' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-20 py-4 md:py-0 gap-4 md:gap-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
              <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">RAPS<span className="text-secondary">Wealth</span></h1>
                <p className="text-xs text-slate-500 font-medium tracking-widest">FINANCIAL SERVICES</p>
              </div>
            </Link>

            {/* Nav Options - Always Visible */}
            <nav className="flex items-center gap-4 md:gap-8 overflow-x-auto max-w-full pb-2 md:pb-0 w-full md:w-auto justify-center md:justify-end">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    isActive(link.path) ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center">
              <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-slate-300 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white font-bold">R</div>
                <h2 className="text-xl font-bold text-white">RAPS<span className="text-secondary">Wealth</span></h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 mb-6">
                Empowering investors with data-driven insights and AI-powered tools for smarter mutual fund investments.
              </p>
              <div className="flex gap-4">
                {/* Social Placeholders */}
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">in</div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">fb</div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">x</div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
                <li><Link to="/funds" className="hover:text-secondary transition-colors">Mutual Funds</Link></li>
                <li><Link to="/calculator" className="hover:text-secondary transition-colors">RAPS Calculator</Link></li>
                <li><Link to="/sip-movement" className="hover:text-secondary transition-colors">SIP Insights</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Services</h3>
              <ul className="space-y-3 text-sm">
                <li className="hover:text-secondary cursor-pointer transition-colors">Portfolio Analysis</li>
                <li className="hover:text-secondary cursor-pointer transition-colors">Tax Planning</li>
                <li className="hover:text-secondary cursor-pointer transition-colors">Retirement Planning</li>
                <li className="hover:text-secondary cursor-pointer transition-colors">Risk Assessment</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone size={18} className="text-secondary mt-0.5" />
                  <div>
                    <p className="text-white">+91 98765 43210</p>
                    <p className="text-xs text-slate-500">Mon-Fri 9am-6pm</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center text-[10px]">@</div>
                  <p>support@rapswealth.com</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-xs text-slate-500 text-center">
            <p>&copy; {new Date().getFullYear()} RAPS Wealth Management. All rights reserved. Mutual Fund investments are subject to market risks, read all scheme related documents carefully.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;