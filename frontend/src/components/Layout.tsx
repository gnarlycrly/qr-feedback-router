// Simple app layout used by all pages. Keeps header/footer and applies theme tokens.
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();

  // keep theme hook available for future dynamic behavior; currently applied via CSS variables
  useTheme();

  return (
    <div className="min-h-screen bg-app-bg text-app-foreground">
      <header className="bg-app-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/login" className="font-bold text-xl">Absolutely Brilliant</Link>
          <nav className="space-x-4">
            {/* Only show Portal link when not on login page */}
            {loc.pathname !== "/login" && (
              <Link to="/portal" className={`hover:underline ${loc.pathname === "/portal" ? "underline" : ""}`}>
                Business Portal
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>

      <footer className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Absolutely Brilliant</div>
      </footer>
    </div>
  );
};

export default Layout;
