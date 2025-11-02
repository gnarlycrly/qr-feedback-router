"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"login" | "signup" | "business">("login");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 1: Login page
  if (step === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Login</h2>

          <form className="flex flex-col gap-4">
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
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
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
              onClick={() => setStep("business")}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Brand Customization</h2>

          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Business Name"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Business Address"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Brand Color (e.g. #3498db)"
              className="border rounded-lg p-2"
            />

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
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-4"
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






