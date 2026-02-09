"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Image as ImageIcon } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  // Always navigate to portal after login/signup since that's our main flow now
  const next = "/portal";
  const [step, setStep] = useState<"login" | "signup" | "business">("login");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [brandColor, setBrandColor] = useState<string>("#1A3673");
  
  // Authentication state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase login handler
  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(next);
    } catch (err: any) {
      console.error("Login failed:", err.message);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Firebase signup handler
  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Store user info temporarily to create business in next step
      localStorage.setItem("pendingUser", JSON.stringify({ uid: userCred.user.uid, email, fullName }));
      setStep("business");
    } catch (err: any) {
      console.error("Signup failed:", err.message);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
      handleBusinessSetup()
    }
  };

  // Complete business setup
  const handleBusinessSetup = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const pendingUserRaw = localStorage.getItem("pendingUser");
      if (!pendingUserRaw) throw new Error("No user session found");
      
      const pendingUser = JSON.parse(pendingUserRaw);
      const color = brandColor.startsWith("#") ? brandColor : `#${brandColor}`;

      // Create business document in Firestore
      await setDoc(doc(db, "businesses", pendingUser.uid), {
        ownerIds: [pendingUser.uid],
        name: businessName,
        address: businessAddress,
        phone_number: phone,
        email: pendingUser.email,
        customer_businessName: businessName,
        customer_primaryColor: color,
        customer_accentColor: color,
        customer_headerText: "How was your experience?",
        customer_ratingPrompt: "Rate your experience",
        customer_feedbackPrompt: "Tell us more about your experience (optional)",
        customer_submitButtonText: "Submit Review",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Apply theme
      document.documentElement.style.setProperty("--app-primary", color);
      document.documentElement.style.setProperty("--app-accent", color);
      localStorage.setItem("ab_theme", JSON.stringify({ appPrimary: color, appAccent: color }));
      localStorage.setItem("ab_business", JSON.stringify({ businessName, businessAddress, phone }));
      localStorage.removeItem("pendingUser");

      navigate(next);
    } catch (err: any) {
      console.error("Business setup failed:", err.message);
      setError(err.message || "Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Login page
  if (step === "login") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-modern"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-modern"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("signup")}
              className="btn-secondary w-full"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Sign Up (user credentials)
  if (step === "signup") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Get started with your business</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Smith"
                className="input-modern"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-modern"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-modern"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors text-center"
            >
              ← Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Business Info (Brand Customization)
  if (step === "business") {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Customize Your Brand
            </h2>
            <p className="text-gray-600">Tell us about your business</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleBusinessSetup(); }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="Your Business Name"
                  className="input-modern"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  placeholder="(555) 123-4567"
                  className="input-modern"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
              <input
                type="text"
                placeholder="123 Main St, City, State"
                className="input-modern"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="#2563eb"
                  className="input-modern flex-1"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <span className="text-sm text-blue-600 font-medium">Change logo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Upload logo</span>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep("signup")}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}






