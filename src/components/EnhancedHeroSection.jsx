import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaStar } from 'react-icons/fa';

// This is an enhanced hero section component with right-aligned text
// You can include this in your ModernHomePage.jsx file
const EnhancedHeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/heroimg.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlay with texture */}
      <div className="absolute inset-0 bg-gradient-to-l from-purple-900/95 via-purple-800/90 to-purple-700/80 z-0" 
          style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E')"}}
      ></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/10 rounded-full blur-3xl"></div>
      
      {/* Wave Shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg 
          className="absolute bottom-0 left-0 w-full" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            fill="#f9fafb" 
            fillOpacity="1" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="flex flex-col md:flex-row-reverse items-center">
          {/* Text Content - Right Aligned */}
          <div className="md:w-1/2 mb-10 md:mb-0 text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white tracking-tight">
              Cooking Gas <span className="text-orange-300 relative inline-block">Delivered
                <svg className="absolute -bottom-2 left-0 w-full h-2 text-orange-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 9, 50 5 Q 75 0, 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
                </svg>
              </span> To Your Doorstep
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-lg ml-auto tracking-wide">
              Fast, safe and reliable LPG delivery service. Order in minutes and get your gas cylinder delivered within the hour.
            </p>
            
            {/* CTA Buttons - Right Aligned */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/products" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
              >
                Order Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link 
                to="/how-it-works" 
                className="bg-transparent hover:bg-white/10 text-white font-medium py-3 px-8 rounded-lg border-2 border-white flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                How It Works
              </Link>
            </div>
            
            {/* Trust Indicators - Right Aligned */}
            <div className="mt-10 flex items-center justify-end space-x-4">
              <div>
                <div className="flex items-center justify-end">
                  <span className="mr-1 font-medium text-xl">4.9</span>
                  <div className="text-orange-400 flex">
                    {[1, 2, 3, 4, 5].map(num => (
                      <svg key={num} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-200">from 2,000+ happy customers</p>
              </div>
              
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(num => (
                  <div key={num} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-purple-800 overflow-hidden shadow-lg transform hover:scale-105 transition-transform" style={{zIndex: 10-num}}>
                    <img src={`/api/placeholder/40/40?text=${num}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Fast Delivery Badge - Left */}
          <div className="md:w-1/2 flex justify-center md:justify-start">
            <div className="relative">
              {/* Fast Delivery Badge matching the provided image */}
              <div className="bg-white text-purple-900 rounded-lg p-6 shadow-xl inline-flex items-center transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-orange-500 p-3 rounded-lg mr-4">
                  <FaTruck className="text-white text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-purple-800 text-xl">Fast Delivery</p>
                  <p className="text-gray-600 text-lg">Within 60 minutes</p>
                </div>
              </div>
              
              {/* Additional floating elements for visual interest */}
              <div className="absolute -top-6 -right-6 bg-purple-100 rounded-full p-4 shadow-lg animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="absolute -bottom-10 -left-10 bg-orange-100 rounded-full p-3 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
