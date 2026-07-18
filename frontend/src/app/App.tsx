import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./components/pages/landingpage";
import ChatbotPage from "./components/pages/chatbot";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/sections/SignIn";
import Register from "./components/sections/Register";
import ProtectedRoute from "./components/protectedroutes";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatbotPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/Login" element={<Navigate to="/login" replace />} />
            <Route path="/Register" element={<Navigate to="/register" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}