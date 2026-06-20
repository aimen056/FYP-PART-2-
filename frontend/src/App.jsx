import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import AboutAirQuality from "./pages/AboutAirQuality";
import LoginPage from "./pages/LoginPage";
import AboutUs from "./pages/AboutUs";
import Dashboard from "./pages/Dashboard";
import FullscreenMapPage from "./components/map/FullscreenMapPage";
import UserDashboard from "./pages/UserDashboard";
import HistoricalReport from "./pages/HistoricalReport";
import HistoricalReportAdmin from "./pages/HistoricalReportAdmin";
import ManageAlert from "./pages/ManageAlert";
import ReportPollution from "./pages/ReportPollution";
import HomeMap from "./components/map/HomeMap";
import FAQsPage from "./components/FAQsPage";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import UserNavBar from "./components/layout/usernavbar";
import AdminNavBar from "./components/layout/Adminnavbar";
import EditProfile from "./components/EditProfile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { AnimatePresence } from "framer-motion";

function Layout({ children }) {
  const location = useLocation();
  const { user, token } = useAuth();
  const hideHeaderFooter = location.pathname === "/login";
  const noFooterPages = ["/dashboard"];
  const userPages = ["/userdashboard", "/historicalReport", "/manageAlert", "/report", "/edit-profile"];
  const adminPages = ["/dashboard", "/historicalReportAdmin"];

  const isUserPage = userPages.includes(location.pathname);
  const isAdminPage = adminPages.includes(location.pathname);

  // Redirect authenticated users away from login page
  if (token && user?.loggedIn && location.pathname === "/login") {
    const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;
    return <Navigate to={isAdmin ? "/dashboard" : "/userdashboard"} replace />;
  }

  return (
    <>
      {!hideHeaderFooter && !isUserPage && !isAdminPage && <Navbar />}
      {!hideHeaderFooter && isUserPage && <UserNavBar />}
      {!hideHeaderFooter && isAdminPage && <AdminNavBar />}
      <AnimatePresence mode="wait">
        {React.cloneElement(children, { key: location.pathname })}
      </AnimatePresence>
      {!hideHeaderFooter && !isUserPage && !isAdminPage && !noFooterPages.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about-air-quality" element={<Layout><AboutAirQuality /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/about-us" element={<Layout><AboutUs /></Layout>} />
            <Route path="/fullscreenMap" element={<Layout><FullscreenMapPage /></Layout>} />
            <Route path="/faqs" element={<Layout><FAQsPage /></Layout>} />
            <Route path="/homemap" element={<Layout><HomeMap /></Layout>} />
            <Route path="/dashboard" element={
              <ProtectedRoute adminOnly={true}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/historicalReportAdmin" element={
              <ProtectedRoute adminOnly={true}>
                <Layout><HistoricalReportAdmin /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/userdashboard" element={
              <ProtectedRoute>
                <Layout><UserDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/historicalReport" element={
              <ProtectedRoute>
                <Layout><HistoricalReport /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/manageAlert" element={
              <ProtectedRoute>
                <Layout><ManageAlert /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/manageAlert/:id" element={
              <ProtectedRoute>
                <Layout><ManageAlert /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <Layout><ReportPollution /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <Layout><EditProfile /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reset-password/:token" element={<Layout><ResetPassword /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
