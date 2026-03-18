"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const navigate = useNavigate();
  const next = "/portal";

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phone, setPhone] = useState("");
  // default brand color now matches the signup page background
  const [brandColor, setBrandColor] = useState<string>("#ffbb33");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combined flow: create auth user (or sign in if already exists) and persist business info
  const handleCompleteSetup = async () => {
    setError(null);
    setLoading(true);

    try {
      let uid: string | null = null;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCred.user.uid;
      } catch (err: any) {
        // If the email is already in use, try signing in with the provided credentials to complete setup
        if (err?.code === "auth/email-already-in-use") {
          try {
            const signIn = await signInWithEmailAndPassword(auth, email, password);
            uid = signIn.user.uid;
          } catch (signinErr: any) {
            console.error("Sign in after existing email failed:", signinErr?.message || signinErr);
            throw new Error("Email already exists. Please sign in with your account to complete setup.");
          }
        } else {
          throw err;
        }
      }

      if (!uid) throw new Error("Failed to obtain user id.");

      const color = brandColor.startsWith("#") ? brandColor : `#${brandColor}`;

      // Create or overwrite business document in Firestore
      await setDoc(doc(db, "businesses", uid), {
        ownerIds: [uid],
        name: businessName,
        address: businessAddress,
        phone_number: phone,
        email,
        customer_businessName: businessName,
        customer_primaryColor: color,
        customer_accentColor: color,
        customer_headerText: "How was your experience?",
        customer_ratingPrompt: "Rate your experience",
        customer_feedbackPrompt: "Tell us more about your experience (optional)",
        customer_submitButtonText: "Submit Review",
        subscription: {
          status: "free",
          plan: "free",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Apply theme and persist small local preview state
      document.documentElement.style.setProperty("--app-primary", color);
      document.documentElement.style.setProperty("--app-accent", color);
      localStorage.setItem("ab_theme", JSON.stringify({ appPrimary: color, appAccent: color }));
      localStorage.setItem("ab_business", JSON.stringify({ businessName, businessAddress, phone }));

      navigate(next);
    } catch (err: any) {
      console.error("Complete setup failed:", err?.message || err);
      setError(err?.message || "Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  };

  // Two-step layout: first credentials, then business details
  return (
    <div className="min-h-screen w-full bg-[#ffb133] flex items-center justify-center py-12 px-4">
  <div className="w-full max-w-xl lg:max-w-2xl p-10 rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white/95 max-h-[calc(100vh-6rem)] overflow-auto flex flex-col">
        <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4" aria-hidden>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5l2.59 5.25 5.79.84-4.19 4.08.99 5.76L12 16.9l-5.18 2.53.99-5.76L3.62 8.59l5.79-.84L12 2.5z" fill="#f2c125" />
                </svg>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5l2.59 5.25 5.79.84-4.19 4.08.99 5.76L12 16.9l-5.18 2.53.99-5.76L3.62 8.59l5.79-.84L12 2.5z" fill="#f2c125" />
                </svg>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5l2.59 5.25 5.79.84-4.19 4.08.99 5.76L12 16.9l-5.18 2.53.99-5.76L3.62 8.59l5.79-.84L12 2.5z" fill="#f2c125" />
                </svg>
              </div>
          <h2 className="text-3xl font-bold text-black mb-2">Get Started</h2>
          <p className="text-gray-600">Create your StarBoard account</p>
        </div>

  <form className="flex flex-col gap-5 overflow-auto min-h-0" onSubmit={(e) => { e.preventDefault(); handleCompleteSetup(); }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input type="text" placeholder="John Smith" className="input-modern" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" placeholder="you@example.com" className="input-modern" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="input-modern" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {/* Submit will create user (or sign in if already exists) and then persist business details below */}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Business details</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
            <input type="text" placeholder="Your Business Name" className="input-modern" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input type="text" placeholder="(555) 123-4567" className="input-modern" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
            <input type="text" placeholder="123 Main St, City, State" className="input-modern" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer" />
              <input type="text" placeholder="#2563eb" className="input-modern flex-1" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => navigate('/login')} className="btn-secondary flex-1" disabled={loading}>Back to Login</button>
            <button type="submit" className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Setting up...' : 'Complete Setup'}</button>
          </div>

          <div className="mt-3 text-center">
            <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-blue-600 underline">Back to home</button>
          </div>
        </form>
      </div>
    </div>
  );
}
