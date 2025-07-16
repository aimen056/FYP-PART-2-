import React, { useRef, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BsFillMoonFill,
  BsFillSunFill,
  BsList,
  BsHouseDoorFill,
  BsShieldFill,
  BsInfoCircleFill,
} from "react-icons/bs";
import { motion } from "framer-motion";
import logo from "../assets/logoonly.png";
import "./Usernavbar.css";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    setSelectedTab(location.pathname);
    localStorage.setItem("selectedTab", location.pathname);
  }, [location.pathname]);

  const handleChangeTab = (tab) => {
    setSelectedTab(tab);
    localStorage.setItem("selectedTab", tab);
  };

  const darkModeHandler = () => {
    setDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === "ur" ? "rtl" : "ltr";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/", icon: <BsHouseDoorFill />, label: t("nav.home") },
    { to: "/about-air-quality", icon: <BsShieldFill />, label: t("nav.about_air_quality") },
    { to: "/about-us", icon: <BsInfoCircleFill />, label: t("nav.About_us") },
  ];

  const languages = [
    { code: "en", label: t("language.en") },
    { code: "es", label: t("language.es") },
    { code: "ur", label: t("language.ur") },
  ];

  return (
    <nav className="bg-navBarbg dark:bg-navBarbg text-primaryText backdrop-blur-md dark:text-primaryText flex fixed top-0 left-0 w-full justify-between p-px border-gray-400/35 border-b-[1px] h-16 font-semibold z-20">
      {/* Logo Section */}
      <div className="flex items-center justify-center rounded-3xl w-1/2 md:w-1/6 p-2 font-bold gap-2">
        <img className="object-scale-down h-10" src={logo} alt="Logo" />
        <NavLink to="/">
          <span>AIR</span>
          <span className="text-[#FFD41E]">GUARD</span>
        </NavLink>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-row justify-evenly items-center rounded-3xl md:w-2/3 p-2 relative">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => handleChangeTab(to)}
            className={`relative z-10 flex flex-row items-center gap-2 px-3 py-1.5 text-sm uppercase cursor-pointer transition-colors ${
              selectedTab === to
                ? "text-primaryBtnText dark:text-primaryBtnText font-bold"
                : "text-primaryText hover:text-primaryBtnBg hover:dark:text-primaryBtnBg dark:text-primaryText"
            }`}
          >
            {icon}
            <p>{label}</p>
            {selectedTab === to && (
              <motion.div
                layoutId="tab-highlight"
                className="absolute inset-0 rounded-full bg-primaryBtnBg"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              />
            )}
          </NavLink>
        ))}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="md:hidden flex flex-col text-base bg-white dark:bg-background absolute top-16 left-0 w-full border-t border-gray-200 dark:border-gray-600"
          id="navbar-sticky"
        >
          {navLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className="py-2 px-4 flex font-normal text-sm items-center gap-5 bg:text-white dark:text-primaryText text-primaryText/80 bg-surfaceColor w-full border-b border-b-gray-400/30 md:bg-transparent uppercase"
              onClick={() => {
                setSelectedTab(to);
                setIsMenuOpen(false);
              }}
            >
              {icon}
              <p>{label}</p>
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="py-2 px-4 flex font-normal text-sm items-center gap-5 bg:text-white dark:text-primaryText text-primaryText/80 bg-surfaceColor w-full border-b border-b-gray-400/30 md:bg-transparent uppercase"
            onClick={() => setIsMenuOpen(false)}
          >
            <p>{t("nav.login")}</p>
          </NavLink>
          {/* Language Selector in Mobile Menu */}
          <div className="py-2 px-4 flex font-normal text-sm items-center gap-5 bg-surfaceColor w-full border-b border-b-gray-400/30 uppercase">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-primaryText/80 dark:text-primaryText focus:outline-none"
            >
              {languages.map(({ code, label }) => (
                <option key={code} value={code} className="bg-surfaceColor dark:bg-background">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Right-side Items */}
      <div className="flex flex-row justify-evenly items-center rounded-3xl w-1/2 md:w-1/6 p-3">
        {/* Dark Mode Toggle */}
        <button onClick={darkModeHandler}>
          {dark ? (
            <BsFillSunFill className="h-5 w-5" />
          ) : (
            <BsFillMoonFill className="h-5 w-5" />
          )}
        </button>

        {/* Language Selector (Desktop) */}
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="hidden md:block bg-transparent text-primaryText dark:text-primaryText text-sm rounded-lg focus:outline-none hover:text-primaryBtnBg dark:hover:text-primaryBtnBg"
        >
          {languages.map(({ code, label }) => (
            <option key={code} value={code} className="bg-surfaceColor dark:bg-background">
              {label}
            </option>
          ))}
        </select>

        {/* Login Button (Desktop) */}
        <NavLink
          to="/login"
          className="hidden md:block bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition no-underline text-sm"
        >
          {t("nav.login")}
        </NavLink>

        {/* Mobile Menu Toggle */}
        <button
          ref={hamburgerRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden focus:outline-none dark:text-primaryText/60"
          aria-controls="navbar-sticky"
          aria-expanded={isMenuOpen ? "true" : "false"}
        >
          <BsList className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;