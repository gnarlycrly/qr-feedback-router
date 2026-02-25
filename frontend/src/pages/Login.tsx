"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Login() {
  const navigate = useNavigate();
  const next = "/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

  <form className="flex flex-col gap-5 overflow-auto min-h-0" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" placeholder="you@example.com" className="input-modern" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="input-modern" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Signing in..." : "Sign In"}</button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Don't have an account?</span></div>
          </div>

          <button type="button" onClick={() => navigate('/signup')} className="btn-secondary w-full">Create Account</button>

          <div className="mt-3 text-center">
            <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-blue-600 underline">Back to home</button>
          </div>
        </form>
      </div>
    </div>
  );
}






