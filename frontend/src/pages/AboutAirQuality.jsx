import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import clouds from "../assets/clouds.png";
import indoorPollution from "../assets/indoorpollution.png";
import outdoorPollution from "../assets/outdoorpollution.png";
import PM25 from "../assets/PM2.5.png";
import PM25PM10 from "../assets/PM2.5PM10.png";
import PM10 from "../assets/PM10.png";
import CO2 from "../assets/CO2.png";
import Ozone from "../assets/Ozone.png";
import NO2 from "../assets/NO2.png";
import SO2 from "../assets/SO2.png";
import aqiChart from "../assets/aqi_chart.png";
import healthImpact from "../assets/healthimpact.png";
import poll1 from "../assets/poll1.png";
import poll2 from "../assets/poll2.png";
import whatWeCanDo from "../assets/whatwecando.png";
import HouseholdCookingIcon from "../assets/icons/house-heart.svg";
import TrashBurningIcon from "../assets/icons/trash.svg";
import IndustrialTechIcon from "../assets/icons/gear-fill.svg";
import CleanerVehiclesIcon from "../assets/icons/car-front.svg";
import AgricultureBurningIcon from "../assets/icons/flower2.svg";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, type: "spring", stiffness: 200 } },
};

const rotate = {
  hidden: { opacity: 0, rotate: -90 },
  visible: { opacity: 1, rotate: 0, transition: { duration: 0.8, type: "spring" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Animated Section Component
const AnimatedSection = ({ children, variants, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
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

const AirQualityInfo = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 py-16 px-5 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 animate-float">
        <img
          src={clouds}
          alt="Floating clouds"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Intro Section */}
      <AnimatedSection variants={fadeIn} className="text-center mb-12">
        <h2 className="font-bold text-4xl md:text-4xl uppercase mb-6 drop-shadow-lg">
          <i className="bi bi-cloud-sun text-blue-400 mr-2"></i> What Is{" "}
          <span className="text-blue-700">Air Quality?</span>
        </h2>
      </AnimatedSection>

      {/* Background Image Section */}
      <AnimatedSection variants={zoomIn} className="mb-16">
        <div className="relative h-[500px] overflow-hidden rounded-xl shadow-2xl">
          <motion.img
            src={clouds}
            alt="Clouds background"
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: 1.05 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10 bg-black bg-opacity-40 backdrop-blur-sm">
            <motion.p
              className="font-medium text-xl md:text-2xl max-w-5xl mx-auto leading-relaxed text-white drop-shadow-md"
              variants={fadeIn}
            >
              Air quality refers to the cleanliness or pollution levels in the air we breathe. It
              directly impacts health, the environment, and overall quality of life.
            </motion.p>
          </div>
        </div>
      </AnimatedSection>

      {/* Types of Air Pollution Section */}
      <AnimatedSection variants={staggerContainer} className="p-8 rounded-xl bg-gray-100/90 backdrop-blur-md mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          There are two types of <span className="text-blue-700">Air Pollution</span>
        </h3>

        {/* Indoor Air Pollution */}
        <motion.div variants={slideLeft} className="flex flex-col md:flex-row items-center mb-12">
          <motion.img
            src={indoorPollution}
            alt="Indoor Air Pollution"
            className="w-full md:w-1/3 mb-4 md:mb-0 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.05, rotate: 2, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="md:ml-10 text-center md:text-left">
            <h4 className="font-bold text-2xl mb-3 text-blue-600">01 Indoor Air Pollution</h4>
            <p className="text-gray-600 text-lg">
              According to the WHO, when dust, gases, and allergens contaminate the air in indoor
              spaces like homes, offices, schools, etc., it is known as indoor air pollution.
            </p>
          </div>
        </motion.div>

        {/* Outdoor Air Pollution */}
        <motion.div variants={slideRight} className="flex flex-col md:flex-row-reverse items-center mb-12">
          <motion.img
            src={outdoorPollution}
            alt="Outdoor Air Pollution"
            className="w-full md:w-1/3 mb-4 md:mb-0 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.05, rotate: -2, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="md:mr-10 text-center md:text-left">
            <h4 className="font-bold text-2xl mb-3 text-blue-600">02 Outdoor Air Pollution</h4>
            <p className="text-gray-600 text-lg">
              This type of pollution occurs in open environments and is primarily caused by human
              activities such as vehicle emissions, industrial processes, power plants, and
              agricultural practices.
            </p>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Common Air Contaminants Section */}
      <AnimatedSection variants={staggerContainer} className="p-8 rounded-xl bg-gray-100/90 backdrop-blur-md mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          Some common but extremely dangerous <span className="text-blue-700">air contaminants</span>
        </h3>

        {/* Particulate Matter Section */}
        <motion.div variants={slideUp} className="text-center mb-12">
          <h4 className="font-bold text-2xl text-blue-600 mb-4">01 Particulate Matter</h4>
          <p className="text-gray-600 mb-6 text-lg max-w-3xl mx-auto">
            These tiny particles, smaller than a human hair, can penetrate deep into the lungs and
            even enter the bloodstream. PM2.5 is more dangerous as it can cause respiratory and
            cardiovascular diseases.
          </p>
          <motion.div variants={staggerContainer} className="flex justify-center flex-wrap gap-4">
            {[PM25, PM25PM10, PM10].map((img, index) => (
              <motion.img
                key={index}
                src={img}
                alt={`Particulate Matter ${index + 1}`}
                className="h-36 rounded-lg shadow-lg"
                variants={zoomIn}
                whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Harmful Gases Section */}
        <motion.div variants={slideUp} className="text-center">
          <h4 className="font-bold text-2xl text-blue-600 mb-4">02 Harmful Gases</h4>
          <p className="text-gray-600 mb-6 text-lg max-w-3xl mx-auto">
            Pollutants like Carbon Monoxide (CO), Ozone (O3), Nitrogen Dioxide (NO2), and Sulfur
            Dioxide (SO2) reduce air quality, causing respiratory issues, smog formation, and
            environmental damage.
          </p>
          <motion.div variants={staggerContainer} className="flex justify-center flex-wrap gap-4">
            {[CO2, Ozone, NO2, SO2].map((img, index) => (
              <motion.img
                key={index}
                src={img}
                alt={`Harmful Gas ${index + 1}`}
                className="h-36 rounded-lg shadow-lg"
                variants={zoomIn}
                whileHover={{ scale: 1.1, rotate: -5, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* AQI Section */}
      <AnimatedSection variants={slideUp} className="mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          Understanding the <span className="text-blue-700">Air Quality Index (AQI)</span>
        </h3>
        <motion.div variants={staggerContainer} className="flex flex-col md:flex-row items-center">
          <motion.img
            src={aqiChart}
            alt="AQI Chart"
            className="w-full md:w-1/2 mb-4 md:mb-0 rounded-lg shadow-lg"
            variants={slideLeft}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.div variants={slideRight} className="md:ml-6 text-center md:text-left">
            <p className="text-gray-600 text-lg mb-4">
              High levels of air pollution indicate that the air is heavily contaminated. Low air
              pollution levels imply fewer health risks. The AQI measures air quality by calculating
              the average pollutant concentration over a given period.
            </p>
            <p className="text-gray-600 text-lg">
              For example, an AQI value of 45 is considered good, but levels above 300 represent
              hazardous air quality.
            </p>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Clean Air Urgency Section */}
      <AnimatedSection variants={staggerContainer} className="mb-16">
        <h2 className="font-bold text-3xl md:text-4xl uppercase mb-8 text-center">
          Understanding the Urgency of <span className="text-blue-500">Clean Air</span>
        </h2>
        <motion.p
          className="font-light text-lg md:text-xl text-gray-600 text-center mb-8 mx-auto"
          style={{ maxWidth: "750px", lineHeight: "1.8" }}
          variants={fadeIn}
        >
          Clean air is essential for a healthy life and sustainable environment. Discover why
          addressing air quality is crucial for humanity and our planet.
        </motion.p>
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Card */}
          <motion.div
            variants={zoomIn}
            className="shadow-lg rounded-lg overflow-hidden bg-white"
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative group">
              <motion.img
                src={poll1}
                alt="Air Pollution Mortality"
                className="w-full h-72 object-cover"
                animate={{ scale: 1.05 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-3 backdrop-blur-sm">
                <h5 className="mb-0">Air Pollution Mortality</h5>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-700 mb-3">
                How many people die from air pollution?
              </h4>
              <p className="text-xl text-blue-600 font-semibold mb-2">7 Million</p>
              <p className="text-gray-600">
                Deaths annually occur due to exposure to fine particles in polluted air.
              </p>
              <p className="text-right text-sm text-gray-400 mt-3">Source: WHO</p>
            </div>
          </motion.div>

          {/* Second Card */}
          <motion.div
            variants={zoomIn}
            className="shadow-lg rounded-lg overflow-hidden bg-white"
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative group">
              <motion.img
                src={poll2}
                alt="Global Air Quality Crisis"
                className="w-full h-72 object-cover"
                animate={{ scale: 1.05 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-3 backdrop-blur-sm">
                <h5 className="mb-0">Global Air Quality Crisis</h5>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-700 mb-3">
                How many people breathe unhealthy air?
              </h4>
              <p className="text-xl text-blue-600 font-semibold mb-2">91%</p>
              <p className="text-gray-600">
                Of the global population lives in areas where air pollution exceeds WHO limits.
              </p>
              <p className="text-right text-sm text-gray-400 mt-3">Source: WHO</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Health Impacts Section */}
      <AnimatedSection variants={slideUp} className="mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          Health <span className="text-blue-700">Impacts By Air Pollution</span>
        </h3>
        <motion.img
          src={healthImpact}
          alt="Health Impact"
          className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </AnimatedSection>

      {/* Solutions Section */}
      <AnimatedSection variants={staggerContainer} className="mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          Solutions for <span className="text-blue-700">Cleaner Air</span>
        </h3>
        <motion.div variants={staggerContainer} className="flex flex-wrap justify-center gap-8">
          <SolutionCard
            icon={<img src={HouseholdCookingIcon} alt="Household Cooking" className="h-12 w-12 animate-bounce-slow" />}
            text="Household Cooking"
            description="Switch to cleaner fuels for cooking to reduce emissions."
          />
          <SolutionCard
            icon={<img src={TrashBurningIcon} alt="Trash Burning" className="h-12 w-12 animate-bounce-slow" />}
            text="Trash Burning"
            description="Avoid burning trash to prevent harmful air pollution."
          />
          <SolutionCard
            icon={<img src={IndustrialTechIcon} alt="Industrial Tech" className="h-12 w-12 animate-bounce-slow" />}
            text="Industrial Tech"
            description="Adopt cleaner technologies in industries to minimize emissions."
          />
          <SolutionCard
            icon={<img src={CleanerVehiclesIcon} alt="Cleaner Vehicles" className="h-12 w-12 animate-bounce-slow" />}
            text="Cleaner Vehicles"
            description="Use cleaner fuels and vehicles to reduce pollution."
          />
          <SolutionCard
            icon={<img src={AgricultureBurningIcon} alt="Agriculture Burning" className="h-12 w-12 animate-bounce-slow" />}
            text="Agriculture Burning"
            description="Reduce agricultural burning to improve air quality."
          />
        </motion.div>
      </AnimatedSection>

      {/* What We Can Do Section */}
      <AnimatedSection variants={slideUp} className="mb-16">
        <h3 className="font-bold text-3xl uppercase mb-8 text-center">
          What <span className="text-blue-700">We Can Do?</span>
        </h3>
        <motion.img
          src={whatWeCanDo}
          alt="What can we do"
          className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </AnimatedSection>
    </div>
  );
};

const SolutionCard = ({ icon, text, description }) => (
  <motion.div
    variants={zoomIn}
    className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 w-64"
    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="p-4 border rounded-full flex justify-center items-center mx-auto bg-blue-100 w-16 h-16">
      {icon}
    </div>
    <h6 className="font-bold mt-3 text-xl text-blue-600">{text}</h6>
    <p className="text-gray-600 text-sm mt-2">{description}</p>
  </motion.div>
);

export default AirQualityInfo;