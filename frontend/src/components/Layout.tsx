// Simple app layout used by all pages. Keeps header/footer and applies theme tokens.
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../firebaseHelpers/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const navigate = useNavigate();

  // keep theme hook available for future dynamic behavior; currently applied via CSS variables
  useTheme();

  const handleLogoClick = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // After signing out, return users to the public landing page instead of the login form
    navigate("/");
  };

  const isLanding = loc.pathname === "/";
  const isAuthPage = loc.pathname === "/signup" || loc.pathname === "/login";
  const { user } = useAuth();

  return (
  <div className={isLanding ? "min-h-screen text-app-foreground flex flex-col" : isAuthPage ? "min-h-screen text-app-foreground flex flex-col" : "min-h-screen text-app-foreground flex flex-col"} style={!isLanding && !isAuthPage ? { backgroundColor: '#f3ba5f' } : {}}>
      {/* Hide header on the public landing page and auth pages (signup/login) */}
      {!isLanding && !isAuthPage && (
        <header className="border-b border-gray-200 backdrop-blur-sm bg-white/80 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleLogoClick}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f2c125] to-[#ff8c1a] flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">AB</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-[#f2c125] to-[#ff8c1a] bg-clip-text text-transparent">
                Absolutely Brilliant Concepts Inc.
              </span>
            </div>
            <nav className="flex items-center gap-6">
              {/* Only show Sign Out button when not on login page */}
              {loc.pathname !== "/login" && (
                <button 
                  onClick={handleSignOut}
                  className="text-sm font-semibold transition-all px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

  <main className={isLanding || isAuthPage ? "w-full p-0 flex-1" : "max-w-7xl mx-auto px-6 py-12 flex-1"}>
        {children}
      </main>

      {!isLanding && !isAuthPage && (
        <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Absolutely Brilliant. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
