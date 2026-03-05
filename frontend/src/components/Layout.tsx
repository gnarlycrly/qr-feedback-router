// Simple app layout used by all pages. Keeps header/footer and applies theme tokens.
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../firebaseHelpers/AuthContext";

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
  // Customer-facing flow (QR -> feedback -> reward) should be independent and not show the app header
  const isCustomerFlow = loc.pathname === "/feedback" || loc.pathname.startsWith("/feedback") || loc.pathname === "/reward" || loc.pathname.startsWith("/reward");
  const isPortal = loc.pathname === "/portal" || loc.pathname.startsWith("/portal/");
  useAuth();

  return (
  <div className={isLanding ? "min-h-screen text-app-foreground flex flex-col" : isAuthPage ? "min-h-screen text-app-foreground flex flex-col" : "min-h-screen text-app-foreground flex flex-col"} style={!isLanding && !isAuthPage && !isCustomerFlow ? { backgroundColor: '#ffb133' } : {}}>
  {/* Hide header on the public landing page, auth pages, and customer-facing feedback/reward pages */}
  {!isLanding && !isAuthPage && !isCustomerFlow && (
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
            </div>
            <nav className="flex items-center gap-6 ml-auto">
              {/* Only show Sign Out button when not on login page */}
              {loc.pathname !== "/login" && (
                <button
                  onClick={handleSignOut}
                  className="text-lg font-semibold transition-all px-5 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
        // For landing/auth/customer flow, render as a standalone centered page without the header
        isLanding || isAuthPage || isCustomerFlow
          ? "w-full p-0 flex-1 flex items-center justify-center"
          : isPortal
          ? "w-full flex-1 px-6 py-6"
          : "w-full flex-1 flex items-center justify-center px-6 py-6"
      }
      style={{ minHeight: "0" }}
    >
    <div
      className={isLanding || isAuthPage || isCustomerFlow ? "w-full" : "w-full max-w-3xl mx-auto"}
      style={isLanding || isAuthPage || isCustomerFlow ? {} : { maxHeight: "calc(100vh - 96px)", overflow: "auto" }}
    >
      {children}
    </div>
  </main>
    </div>
  );
};

export default Layout;
