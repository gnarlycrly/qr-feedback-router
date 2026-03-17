interface RatingStarsProps {
  value: number;
  onChange: (newValue: number) => void;
  max?: number;
}

export default function RatingStars({ value, onChange, max = 5 }: RatingStarsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starNumber = i + 1;
        const filled = starNumber <= value;

        return (
          <button
            key={i}
            type="button"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => onChange(starNumber)}
            aria-label={`Rate ${starNumber} star${starNumber !== 1 ? "s" : ""}`}
          >
            <span
              className={`text-4xl leading-none ${
                filled
                  ? "text-yellow-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}
