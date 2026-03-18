import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Dashboard from "./pages/CustomerServiceDashboardPage";
import RewardPage from "./pages/RewardPage";
import FeedbackPage from "./pages/FeedbackPage";
import BusinessPortal from "./pages/BusinessPortal";
import AllReviewsPage from "./pages/AllReviewsPage";
import PricingPage from "./pages/PricingPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import Layout from "./components/Layout";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./firebaseHelpers/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/reward" element={<RewardPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/portal" element={<ProtectedRoute><BusinessPortal/></ProtectedRoute>} />
            <Route path="/portal/reviews" element={<ProtectedRoute><AllReviewsPage/></ProtectedRoute>} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
