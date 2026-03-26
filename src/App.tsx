import { useEffect, useState } from "react";
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
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={transitionStage === "fadeIn" ? "page-transition" : "opacity-0 -translate-y-[10px] transition-all duration-250"}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
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
