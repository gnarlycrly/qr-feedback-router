import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/CustomerServiceDashboardPage";
import RewardPage from "./pages/RewardPage";
import FeedbackPage from "./pages/FeedbackPage";
import BusinessPortal from "./pages/BusinessPortal";
import Layout from "./components/Layout";
import { ThemeProvider } from "./theme/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reward" element={<RewardPage />} />
          <Route path="/feedback" element={<FeedbackPage />} /> 
          <Route path="/portal" element={<BusinessPortal/>} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
