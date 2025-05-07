import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Company Info */}
          <div>
            <img src="/logo.png" alt="Hitty Deliveries" className="h-12 mb-6" />
            <p className="mb-6">Your trusted partner for fast and reliable LPG gas delivery services in Kenya. We deliver cooking gas to your doorstep in minutes.</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link to="/products" className="hover:text-purple-400 transition-colors">Products</Link></li>
              <li><Link to="/how-it-works" className="hover:text-purple-400 transition-colors">How It Works</Link></li>
              <li><Link to="/track-order" className="hover:text-purple-400 transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-purple-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/support" className="hover:text-purple-400 transition-colors">Support Center</Link></li>
            </ul>
          </div>
          
          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-purple-400" />
                <div>
                  <p>+254 712 345 678</p>
                  <p>+254 712 345 679</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-purple-400" />
                <div>
                  <p>info@hittydeliveries.com</p>
                  <p>support@hittydeliveries.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-purple-400" />
                <p>123 Business District, Nairobi, Kenya</p>
              </div>
            </div>
            
            <h3 className="text-white text-lg font-semibold mb-3">Newsletter</h3>
            <form className="flex mb-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-r-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Hitty Deliveries. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li><Link to="/terms" className="hover:text-purple-400 transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link></li>
                <li><Link to="/cookies" className="hover:text-purple-400 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
