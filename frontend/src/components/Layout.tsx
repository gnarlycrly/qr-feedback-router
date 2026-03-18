// Simple app layout used by all pages. Keeps header/footer and applies theme tokens.
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import { Sparkles } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const navigate = useNavigate();

  // keep theme hook available for future dynamic behavior; currently applied via CSS variables
  useTheme();


  const handleSignOut = async () => {
    await signOut(auth);
    // After signing out, return users to the public landing page instead of the login form
    navigate("/");
  };

  const isLanding = loc.pathname === "/";
  const isAuthPage = loc.pathname === "/signup" || loc.pathname === "/login";
  const isPricingPage = loc.pathname === "/pricing";
  const isSuccessPage = loc.pathname === "/subscription/success";
  // Customer-facing flow (QR -> feedback -> reward) should be independent and not show the app header
  const isCustomerFlow = loc.pathname === "/feedback" || loc.pathname.startsWith("/feedback") || loc.pathname === "/reward" || loc.pathname.startsWith("/reward");
  const isPortal = loc.pathname === "/portal" || loc.pathname.startsWith("/portal/");
  const isFullScreenPage = isLanding || isAuthPage || isCustomerFlow || isPricingPage || isSuccessPage;
  useAuth();
  const { isPro } = useSubscription();

  return (
  <div className="min-h-screen text-app-foreground flex flex-col" style={!isFullScreenPage ? { backgroundColor: '#ffb133' } : {}}>
  {/* Hide header on the public landing page, auth pages, pricing, success, and customer-facing feedback/reward pages */}
  {!isFullScreenPage && (
        <header className="border-b border-gray-200 backdrop-blur-sm bg-white/80 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f2c125] to-[#ff8c1a] flex items-center justify-center shadow-sm">
                {/* white star icon (larger) */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2.5l2.5 5.06 5.59.81-4.04 3.94.95 5.56L12 15.77 7.0 18.87l.95-5.56L3.9 9.37l5.59-.81L12 2.5z" fill="white"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-3xl">StarBoard</span>
              </div>
              {isPro && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white text-xs font-bold rounded-full">
                  <Sparkles size={12} /> PRO
                </span>
              )}
            </div>
            <nav className="flex items-center gap-4 ml-auto">
              {!isPro && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
                >
                  <Sparkles size={14} />
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => navigate("/account")}
                className="text-sm font-semibold transition-all px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Account
              </button>
              {loc.pathname !== "/login" && (
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold transition-all px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main
      className={
        // For landing/auth/customer flow/pricing/success, render as a standalone centered page without the header
        isFullScreenPage
          ? "w-full p-0 flex-1 flex items-center justify-center"
          : isPortal
          ? "w-full flex-1 px-6 py-6"
          : "w-full flex-1 flex items-center justify-center px-6 py-6"
      }
      style={{ minHeight: "0" }}
    >
    <div
      className={isFullScreenPage ? "w-full" : "w-full max-w-3xl mx-auto"}
      style={isFullScreenPage ? {} : { maxHeight: "calc(100vh - 96px)", overflow: "auto" }}
    >
      {children}
    </div>
  </main>
    </div>
  );
};

export default Layout;
