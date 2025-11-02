import React, { useState } from "react";
import RatingStars from "./RatingStars";

export default function FeedbackForm() {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      businessName: "Bella Vista Restaurant",
      rating,
      comments,
    };

    console.log("submit:", payload);

    // reset form (you can remove this if you don't want auto clear)
    setRating(0);
    setComments("");
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-[0_15px_25px_rgba(0,0,0,0.08)] border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-indigo-600 font-medium text-lg">
            Bella Vista Restaurant
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            How was your experience?
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center text-center">
          <RatingStars value={rating} onChange={setRating} />
          <p className="text-gray-700 text-sm mt-3">
            Rate your experience
          </p>
        </div>

        {/* Text area */}
        <div className="text-left">
          <label
            htmlFor="comments"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            Tell us more about your experience (optional)
          </label>

          <textarea
            id="comments"
            className="w-full rounded-md border border-gray-300 bg-gray-100 text-gray-800 text-sm p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white min-h-[90px]"
            placeholder="What did you like most? Any suggestions for improvement?"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-500 text-white text-sm font-medium py-3 text-center shadow-sm hover:bg-indigo-600 active:scale-[.99] transition"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
