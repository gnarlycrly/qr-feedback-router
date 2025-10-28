import React from "react";
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate } from "react-router-dom";

export default function FeedbackPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_#eef2ff_0%,_#e0e7ff_40%,_#c7d2fe_80%)] px-4 py-8 relative">
      {/* optional "back" button in corner */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-sm text-indigo-600 hover:underline"
      >
        ← Back
      </button>

      <FeedbackForm />
    </div>
  );
}
