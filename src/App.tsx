import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import SkillGapPage from "./pages/SkillGapPage.tsx";

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
      
      // Fallback timer in case onTransitionEnd doesn't fire
      const timer = setTimeout(() => {
        handleTransitionEnd();
      }, 350);
      
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  const handleTransitionEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`transition-all duration-300 ease-in-out ${
        transitionStage === "fadeOut" 
          ? "opacity-0 -translate-y-4" 
          : "opacity-100 translate-y-0"
      }`}
    >
      {/* Pass the displayLocation to Routes to handle exit transitions correctly */}
      <div className="page-wrapper-inner">
        {React.cloneElement(children as React.ReactElement, { location: displayLocation })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </PageWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}
