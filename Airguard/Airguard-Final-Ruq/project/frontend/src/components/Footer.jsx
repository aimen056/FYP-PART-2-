import React from "react"; 
import { NavLink } from "react-router-dom"; // Import NavLink for SPA navigation
import FacebookIcon from "../assets/icons/facebook.svg";
import TwitterIcon from "../assets/icons/twitter.svg";
import LinkedInIcon from "../assets/icons/linkedin.svg";
import InstagramIcon from "../assets/icons/instagram.svg";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      {/* Container */}
      <div className="w-full px-0 py-8 grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-12">
        <div className="footer-section px-4">
          <h5 className="text-lg font-bold mb-2">AIRGUARD</h5>
          <p>
            Empowering communities with real-time air quality data and insights
            to create a cleaner and healthier environment.
          </p>
        </div>
        <div className="footer-section px-4"> 
          <h5 
            className="text-lg font-bold mb-2 transition-all duration-300 group-hover:text-white"
          >
            QUICK LINKS
          </h5>
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about-air-quality" 
                className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
              >
                About Air Quality
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about-us" 
                className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
              >
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/faqs" 
                className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
              >
                FAQs
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="footer-section px-4">
          <h5 
            className="text-lg font-bold mb-2 transition-all duration-300 group-hover:text-white"
          >
            CONTACT US
          </h5>
          <p>
            Email:{" "}
            <a 
              href="mailto:support@airguard.com" 
              className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
            >
              support@airguard.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a 
              href="tel:+123-456-7890" 
              className="transition-all duration-300 transform text-[rgb(10,132,255)] hover:text-white hover:-translate-y-1"
            >
              +123-456-7890
            </a>
          </p>
        </div>

        <div className="footer-section px-4"> 
          <h5 className="text-lg font-bold mb-2">FOLLOW US</h5>
          <div className="flex space-x-4">
            {/* Facebook */}
            <a 
              href="#" 
              className="group transition-transform transform hover:-translate-y-1"
            >
              <img 
                src={FacebookIcon} 
                alt="Facebook" 
                className="h-6 w-6 transition-all duration-300"
                style={{
                  filter: 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'invert(100%)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)'}
              />
            </a>
            {/* Twitter */}
            <a 
              href="#" 
              className="group transition-transform transform hover:-translate-y-1"
            >
              <img 
                src={TwitterIcon} 
                alt="Twitter" 
                className="h-6 w-6 transition-all duration-300"
                style={{
                  filter: 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'invert(100%)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)'}
              />
            </a>
            {/* LinkedIn */}
            <a 
              href="#" 
              className="group transition-transform transform hover:-translate-y-1"
            >
              <img 
                src={LinkedInIcon} 
                alt="LinkedIn" 
                className="h-6 w-6 transition-all duration-300"
                style={{
                  filter: 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'invert(100%)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)'}
              />
            </a>
            {/* Instagram */}
            <a 
              href="#" 
              className="group transition-transform transform hover:-translate-y-1"
            >
              <img 
                src={InstagramIcon} 
                alt="Instagram" 
                className="h-6 w-6 transition-all duration-300"
                style={{
                  filter: 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)',
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'invert(100%)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'invert(34%) sepia(99%) saturate(2345%) hue-rotate(194deg) brightness(100%) contrast(97%)'}
              />
            </a>
          </div>
        </div>
      </div>
      {/* Footer bottom section */}
      <div className="w-full bg-gray-900 py-4 text-center">
        <p className="text-sm">© 2025 AirGuard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;