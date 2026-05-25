import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-white font-extrabold text-xl flex items-center gap-2">
            <span>⚕️</span> PharmaCare
          </span>
          <p className="text-sm text-slate-500 mt-2">© {new Date().getFullYear()} PharmaCare Ltd. All rights reserved.</p>
        </div>
        <div className="flex gap-8 text-sm">
          <a href="#" className="hover:text-emerald-500 transition">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-500 transition">Terms of Service</a>
          <a href="#" className="hover:text-emerald-500 transition">Contact Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
