"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig.ts";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCred.user.uid);
      alert(userCred.user.uid);
      navigate("/portal", { replace: true });

    } catch (err: any) {
      console.error("Login failed:", err.message);
      alert(err.message);
    }
  };
  // Step 1: Login page
  if (step === "login") {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Login</h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="border rounded-lg p-2"
              onChange={(e)=> setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border rounded-lg p-2"
              onChange={(e)=> setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => handleLogin()}
              className="btn-app-primary py-2 rounded-lg"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setStep("signup")}
              className="bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Create Account</h2>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded-lg p-2"
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded-lg p-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="border rounded-lg p-2"
            />

            <button
              type="button"
              // proceed to the business customization step
              onClick={() => setStep("business")}
              className="btn-app-primary py-2 rounded-lg"
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="text-blue-500 underline"
            >
              Back to Login
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
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Brand Customization</h2>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Business Name"
              className="border rounded-lg p-2"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Business Address"
              className="border rounded-lg p-2"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border rounded-lg p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Brand Color (e.g. #3498db)"
                className="border rounded-lg p-2 flex-1"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
              />
              <input
                aria-label="brand color picker"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 p-0 border-0"
              />
            </div>

            {/* Image Upload Section */}
            <div className="flex flex-col items-center">
              <label className="text-gray-700 mb-2 font-medium">
                Upload Brand Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border rounded-lg p-2 w-full"
              />

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              // apply the brand customization to the app theme and then go to the next page
              onClick={() => {
                // normalize color
                const color = brandColor.startsWith("#") ? brandColor : `#${brandColor}`;
                try {
                  document.documentElement.style.setProperty("--app-primary", color);
                  document.documentElement.style.setProperty("--app-accent", color);
                  // persist theme to localStorage so Layout can reapply on reload
                  localStorage.setItem(
                    "ab_theme",
                    JSON.stringify({ appPrimary: color, appAccent: color })
                  );
                } catch (e) {
                  // ignore failures
                }

                // optionally persist business info as well
                localStorage.setItem(
                  "ab_business",
                  JSON.stringify({ businessName, businessAddress, phone })
                );

                navigate(next);
              }}
              className="btn-app-accent py-2 rounded-lg mt-4"
            >
              Submit
            </button>
          </form>

          <button
            onClick={() => setStep("signup")}
            className="mt-4 text-blue-500 underline"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}






