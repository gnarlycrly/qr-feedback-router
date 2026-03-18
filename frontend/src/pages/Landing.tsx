import React from "react";
import { useNavigate } from "react-router-dom";
import Grainient from "../components/Grainient";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <Grainient
        className="-z-10"
        color1="#f2c125"
        color2="#f49d0d"
  color3="#ff8c1a"
        timeSpeed={0.35}
        colorBalance={0}
        // stronger, more energetic warp
        warpStrength={1.4}
        warpFrequency={6}
        warpSpeed={2.2}
        warpAmplitude={60}
        blendAngle={0}
        // sharp transitions to keep bands vivid
        blendSoftness={0.5}
        rotationAmount={600}
        noiseScale={2.2}
        // slightly more grain for texture
        grainAmount={0.12}
        grainScale={2}
        grainAnimated={false}
        // boosted contrast and saturation for vivid colors
        contrast={1.3}
        gamma={0.95}
        saturation={1.2}
        centerX={0}
        centerY={0}
        zoom={0.88}
      />

      <main className="w-full max-w-2xl px-6 py-16 sm:py-24">
        <section className="p-8 sm:p-12">
          <div className="text-center">
            <div className="relative inline-block">
              {/* five white stars above the title */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-24 sm:-top-32 flex items-center gap-6" aria-hidden>
                {[0,1,2,3,4].map((i) => (
                  // slightly darker star drop-shadow to match updated text emphasis
                  <svg key={i} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white w-14 h-14 sm:w-20 sm:h-20" style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.16))' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.5l2.59 5.25 5.79.84-4.19 4.08.99 5.76L12 16.9l-5.18 2.53.99-5.76L3.62 8.59l5.79-.84L12 2.5z" fill="#ffffff" />
                  </svg>
                ))}
              </div>
              {/* decorative gradient removed to avoid orange smudge behind the title */}
              <h1
                className="relative z-10 text-4xl sm:text-6xl font-extrabold text-white leading-tight"
                // soft, diffused halo made from blended shadows (larger blur, lower alpha) + soft drop for depth
                style={{
                  textShadow: [
                    '0 0 15px rgba(0,0,0,0.08)',
                    '0 0 24px rgba(0,0,0,0.08)',
                    '0 10px 25px rgba(0,0,0,0.15)'
                  ].join(', ')
                } as React.CSSProperties}
              >
                StarBoard
              </h1>
            </div>
            <p
              className="mt-1 text-2xl sm:text-3xl font-semibold leading-tight tracking-tight"
              // matching diffused halo + soft drop so the tagline reads as part of the same unit
              style={{
                color: '#ffffff',
                textShadow: [
                  '0 0 15px rgba(0,0,0,0.08)',
                  '0 0 22px rgba(0,0,0,0.06)',
                  '0 8px 24px rgba(0,0,0,0.16)'
                ].join(', ')
              } as React.CSSProperties}
            >
              Stop guessing what your customers think.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-black text-lg sm:text-xl font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Get started
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-black text-lg sm:text-xl font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/pricing")}
              className="text-white/90 hover:text-white text-base sm:text-lg font-medium underline underline-offset-4 transition-colors"
            >
              View Pricing
            </button>
          </div>

          <p className="mt-8 text-base sm:text-lg text-white/80 text-center">By Absolutely Brilliant Concepts Inc.</p>
        </section>
      </main>
    </div>
  );
};

export default Landing;
