import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import image from "../assets/image.png";
import aimen from "../assets/aimen.png";
import ruquiya from "../assets/ruquiya.jpg";
import laiba from "../assets/laiba.jpg";
import poll1 from '../assets/poll1.png';
import poll2 from '../assets/poll2.png';
import poll3 from '../assets/poll3.png';
import user from '../assets/user.png';
import admin from '../assets/admin.png';
import publicdashboard from '../assets/public.png';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const slideRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Animated Section Component
const AnimatedSection = ({ children, variants, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-orange-400 text-white py-16 pt-16 ">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <AnimatedSection variants={fadeIn}>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            About <span className="text-orange-300">AirGuard</span>
          </h1>
        </AnimatedSection>

        {/* Mission Section */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
          <AnimatedSection variants={slideLeft} className="w-full md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg">
              At AirGuard, our mission is to create a healthier and more sustainable urban
              environment through real-time air quality monitoring and actionable insights.
              We empower communities, agencies, and developers with the data they need to
              combat pollution and improve public health.
            </p>
          </AnimatedSection>
          <AnimatedSection variants={zoomIn} className="w-full md:w-1/2">
            <img src={image} alt="Mission" className="w-full rounded-lg shadow-lg" />
          </AnimatedSection>
        </div>

        {/* Vision Section */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 mb-16">
          <AnimatedSection variants={zoomIn} className="w-full md:w-1/2">
            <img src={poll3} alt="Vision" className="w-full rounded-lg shadow-lg" />
          </AnimatedSection>
          <AnimatedSection variants={slideRight} className="w-full md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
            <p className="text-lg">
              We aim to be the most reliable and community-focused air quality monitoring
              platform in Pakistan, setting the standard for environmental awareness and
              proactive urban health solutions.
            </p>
          </AnimatedSection>
        </div>

        {/* Our Product Section */}
        <AnimatedSection variants={slideUp} className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-6">Our Product</h2>
          <p className="text-lg mb-8">
            AirGuard provides a comprehensive air quality monitoring platform with real-time
            data visualization, sensor integration, and actionable insights. Users can access
            detailed air pollution metrics, customize alerts, and make informed decisions to
            protect their health.
          </p>
          <div className="relative overflow-hidden w-full h-96">
            <div className="flex w-max animate-loopScroll">
              {/* Individual Image Cards */}
              {[publicdashboard, user, admin, poll2, poll1, publicdashboard, user,admin, poll2, poll1,].map((img, index) => (
                <div key={index} className="relative w-96 h-96 rounded-lg shadow-lg overflow-hidden mx-4 flex-shrink-0">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                    {["Public Dashboard", "User Dashboard", "Admin Dashboard", "Sensor Devices", "Sensor", "Public Dashboard","User Dashboard", "Admin Dashboard", "Sensor Devices", "Sensor"][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Who We Are */}
        <AnimatedSection variants={slideUp} className="text-center mb-16 relative">
          <h2 className="text-3xl font-semibold mb-6">Who We Are?</h2>
          <div className="relative w-4/5 h-96 mx-auto overflow-hidden rounded-lg shadow-lg">
            <img
              src={poll2}
              alt="Who We Are"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <p className="bg-white/20 backdrop-blur-md text-white text-lg font-medium p-6 rounded-lg max-w-3xl">
                AirGuard is an IoT-based air quality monitoring system founded by a team of
                environmental enthusiasts and technology experts passionate about tackling
                pollution with cutting-edge technology.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Team Section */}
      <AnimatedSection variants={slideUp} className="text-center mb-16"> 
  <h2 className="text-3xl font-semibold mb-6">Our Team</h2>
  <div className="flex flex-wrap justify-center gap-8">
    {[
      { name: "Laiba Shahzadi", img: laiba },
      { name: "Ruquiya Nasir", img: ruquiya },
      { name: "Umm-e-Aimen", img:aimen },
    ].map((member, index) => (
      <div key={index} className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-64">
        <img src={member.img} alt={member.name} className="w-24 h-24 mx-auto rounded-full mb-4" />
        <h3 className="text-xl font-semibold">{member.name}</h3>
        <p className="text-sm">Co-founder & Environmental Expert</p>
      </div>
    ))}
  </div>
</AnimatedSection>


        {/* Join Us */}
        <AnimatedSection variants={slideUp} className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Join Us in the Fight Against Air Pollution</h2>
          <p className="text-lg">
            By using AirGuard, you contribute to reducing air pollution, improving public health,
            and making cities more sustainable.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default AboutUs;