import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Company Info */}
          <div className="mb-8 md:mb-0">
            <img src="/logo.png" alt="Hitty Deliveries" className="h-12 mb-4" />
            <p className="mb-6 text-sm md:text-base">Your trusted partner for fast and reliable LPG gas delivery services in Kenya. We deliver cooking gas to your doorstep in minutes.</p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 hover:bg-[#663399] w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#663399] w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#663399] w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#663399] w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link to="/about" className="hover:text-[#663399] transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-[#663399] transition-colors">Products</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#663399] transition-colors">How It Works</Link></li>
              <li><Link to="/track-order" className="hover:text-[#663399] transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-[#663399] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link to="/faq" className="hover:text-[#663399] transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-[#663399] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#663399] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-[#663399] transition-colors">Refund Policy</Link></li>
              <li><Link to="/support" className="hover:text-[#663399] transition-colors">Support Center</Link></li>
            </ul>
          </div>
          
          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 mb-6 text-sm md:text-base">
              <div className="flex items-start">
                <FaPhone className="mt-1 mr-2 text-[#663399] flex-shrink-0" />
                <div className="flex flex-col">
                  <p className="leading-snug">+254 712 345 678</p>
                  <p className="leading-snug">+254 712 345 679</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="mt-1 mr-2 text-[#663399] flex-shrink-0" />
                <div className="flex flex-col">
                  <p className="leading-snug break-all">info@hittydeliveries.com</p>
                  <p className="leading-snug break-all">support@hittydeliveries.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 text-[#663399] flex-shrink-0" />
                <p className="leading-snug">123 Business District, Nairobi, Kenya</p>
              </div>
            </div>
            
            <h3 className="text-white text-lg font-semibold mb-3">Newsletter</h3>
            <form className="flex flex-col sm:flex-row gap-2 mb-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-3 py-2 rounded-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-[#663399] text-gray-800 text-sm"
              />
              <button 
                type="submit"
                className="bg-[#663399] hover:bg-[#4a235a] text-white px-4 py-2 rounded-lg sm:rounded-l-none transition-colors whitespace-nowrap text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="mb-3 md:mb-0">&copy; {new Date().getFullYear()} Hitty Deliveries. All rights reserved.</p>
            <div>
              <ul className="flex space-x-4">
                <li><Link to="/terms" className="hover:text-[#663399] transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-[#663399] transition-colors">Privacy</Link></li>
                <li><Link to="/cookies" className="hover:text-[#663399] transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;