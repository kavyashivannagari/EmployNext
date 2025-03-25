import React from 'react';
import { FaLinkedin, FaTwitter, FaGithub, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Grid Background */}
      <div className="grid-background-footer absolute top-0 left-0 w-full h-full"></div>
      
      {/* Footer Content */}
      <footer className="relative bg-gray-900/80 text-gray-300 py-12 px-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
                EmployNext
              </h2>
              <p className="text-sm">Connecting talent with opportunity. Your next career move starts here.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedin size={18} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaGithub size={18} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaEnvelope size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Features</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Case Studies</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">API Docs</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Community</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Webinars</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-sm hover:text-indigo-300 transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} EmployNext. All rights reserved.
            </div>
            <div className="text-xs text-gray-500">
              Made with ❤️ for better hiring experiences
            </div>
          </div>
        </div>
      </footer>

      {/* Add this to your global CSS */}
      <style jsx>{`
        .grid-background-footer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        .grid-background-footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, transparent, rgba(0, 0, 0, 0.7));
        }
      `}</style>
    </div>
  );
};

export default Footer;