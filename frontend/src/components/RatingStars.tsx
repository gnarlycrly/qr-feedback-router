import React from "react";

interface RatingStarsProps {
  value: number;
  onChange: (newValue: number) => void;
  max?: number;
}

export default function RatingStars({ value, onChange, max = 5 }: RatingStarsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: max }).map((_, i) => {
        const starNumber = i + 1;
        const filled = starNumber <= value;

        return (
          <button
            key={i}
            type="button"
            className="text-2xl leading-none"
            onClick={() => onChange(starNumber)}
            aria-label={`Rate ${starNumber} star${starNumber !== 1 ? "s" : ""}`}
          >
            <span
              className={
                filled
                  ? "text-yellow-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                  : "text-gray-300"
              }
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}
