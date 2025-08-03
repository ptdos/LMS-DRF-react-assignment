import React from "react";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./hooks/useAuth";

function AppContent() {
  const { token, page, goTo } = useAuth();

  return (
    <div className="min-h-screen w-full">
      {token ? (
        <DashboardPage />
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
            {page === "login" ? (
              <>
                <LoginPage />
                
              </>
            ) : page === "forgot-password" ? (
              <>
                <ForgotPasswordPage />
                <div className="mt-6 flex gap-2 justify-center">
                  <span className="text-gray-500">Remember your password?</span>
                  <button onClick={() => goTo("login")} className="text-blue-600 font-semibold hover:underline transition">Back to Login</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
