import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/CustomerServiceDashboardPage";
import RewardPage from "./pages/RewardPage";
import FeedbackPage from "./pages/FeedbackPage";
import BusinessPortal from "./pages/BusinessPortal";
import Layout from "./components/Layout";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./firebaseHelpers/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/reward" element={<RewardPage />} />
          <Route path="/feedback" element={<FeedbackPage />} /> 
          <Route path="/portal" element={<ProtectedRoute><BusinessPortal/></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
