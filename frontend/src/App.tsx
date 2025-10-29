import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RewardPage from "./pages/RewardPage";
import BusinessPortal from "./pages/BusinessPortal";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reward" element={<RewardPage />} />
      <Route path="/portal" element={<BusinessPortal/>} />
    </Routes>
  );
}

export default App;
