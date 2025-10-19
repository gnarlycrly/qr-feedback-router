import { useState, type ReactNode } from "react";
import { useGoogleLogin } from '@react-oauth/google';

type UserProfile = {
  name: string;
  email: string;
};

type RewardDetails = {
  customerReview: {
    rating: number;
    comment: string;
  };
  businessName: string;
  reward: {
    title: string;
    description: string;
    promoCode: string;
    validityDays: number;
    terms: string;
  };
};

type FlowStep = "prompt" | "reward" | "declined";

const ratingScale = 5;

const mockRewardData: RewardDetails = {
  customerReview: {
    rating: 5,
    comment: "amazing food amazing service!",
  },
  businessName: "Bella Vista Restaurant",
  reward: {
    title: "Special Thank You Offer!",
    description: "20% off your next meal",
    promoCode: "BELLAMKØL",
    validityDays: 30,
    terms: "Valid for 30 days. Cannot be combined with other offers.",
  },
};

const mockGoogleProfile: UserProfile = {
  name: "Avery Collins",
  email: "avery.collins@gmail.com",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 3) || "AB";

const RewardLayout = ({
  user,
  step,
  children,
}: {
  user: UserProfile | null;
  step: FlowStep;
  children: ReactNode;
}) => {
  const isSignedIn = step === "reward" && Boolean(user);

  const statusStyles = {
    prompt: "bg-blue-50 text-blue-600",
    reward: "bg-green-50 text-green-600",
    declined: "bg-amber-50 text-amber-600",
  } as const;

  const statusLabels = {
    prompt: "Sign in required",
    reward: "Signed in with Google",
    declined: "Reward declined",
  } as const;

  const headerName = isSignedIn ? user!.name : "Guest Visitor";
  const headerEmail = isSignedIn
    ? user!.email
    : step === "declined"
    ? "Reward was declined"
    : "Sign in to claim your reward";

  return (
    <div className="flex min-h-screen flex-col bg-[#E8EDF2]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-gray-800">
              Absolutely Brilliant
            </p>
            <p className="text-xs text-gray-400">
              Bella Vista Restaurant · Customer Rewards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[step]}`}
            >
              {statusLabels[step]}
            </span>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {headerName}
              </p>
              <p className="text-xs text-gray-500">{headerEmail}</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold uppercase ${
                isSignedIn
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {isSignedIn ? getInitials(user!.name) : "?"}
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
};

const SignInPrompt = ({
  onContinue,
  isLoading,
  onDecline,
}: {
  onContinue: () => void;
  isLoading: boolean;
  onDecline: () => void;
}) => (
  <article className="w-full max-w-md rounded-3xl bg-white px-6 py-10 text-center shadow-lg sm:px-10">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
        <svg
          className="h-10 w-10 text-blue-500"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            fill="#4285f4"
            d="M44.5 20H24v8.5h11.8C34.8 32 30.1 35 24 35c-7 0-12.8-5.7-12.8-12.8S17 9.5 24 9.5c3.2 0 6.1 1.2 8.3 3.2l6-6C34.3 3.4 29.5 1.5 24 1.5 11 1.5 0.5 12 0.5 25S11 48.5 24 48.5 47.5 38 47.5 25c0-1.7-.2-3.3-.5-5z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Unlock Your Reward
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with Google to save your reward and redeem it on your next
          visit.
        </p>
      </div>
    </div>

    <section className="mt-6 rounded-2xl bg-gray-50 p-5 text-left">
      <p className="text-sm font-semibold text-gray-800">
        You&apos;re moments away from:
      </p>
      <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5">
        <h3 className="text-lg font-semibold text-blue-600">
          {mockRewardData.reward.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {mockRewardData.reward.description}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Sign in so we can attach this reward to your profile. You&apos;ll see
          the details instantly after confirming.
        </p>
      </div>
    </section>

    <div className="mt-8 space-y-3">
      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.6 31.9 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.2 1.2 8.5 3.2l5.7-5.7C34.6 3.5 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22 22-9.8 22-22c0-1.1-.1-2.1-.4-3z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.4 15.2 18.8 12 24 12c3.3 0 6.2 1.2 8.5 3.2l5.7-5.7C34.6 3.5 29.6 1 24 1 15.3 1 8 5.5 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.2 0 9.9-1.7 13.6-4.7l-6.3-5.3C29 36.5 26.7 37 24 37c-5.2 0-9.5-3.3-11.1-7.9l-6.5 5C8 39.5 15.3 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.6-4.2 6.4-7.6 7.8l6.3 5.3C36.6 38.8 41 34 43 27.5c.5-1.8.7-3.7.7-5.5 0-1.1-.1-2.1-.4-3z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onDecline}
        className="w-full rounded-lg border border-transparent px-6 py-3 text-sm font-medium text-gray-500 transition duration-150 hover:text-gray-700"
      >
        No thanks, just post my review
      </button>
    </div>
  </article>
);

const RewardContent = ({
  copied,
  onCopy,
  user,
}: {
  copied: boolean;
  onCopy: () => Promise<void>;
  user: UserProfile;
}) => {
  const renderStars = (rating: number) => (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${rating} out of ${ratingScale}`}
    >
      {Array.from({ length: ratingScale }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`text-lg ${
            index < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-500">
        ({rating}/{ratingScale})
      </span>
    </div>
  );

  return (
    <article className="w-full max-w-md rounded-3xl bg-white px-6 py-10 shadow-lg sm:px-10">
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-green-600">Thank You!</h2>
          <p className="mt-2 text-sm text-gray-500">
            {user.name.split(" ")[0]}, your feedback has been submitted
            successfully.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Your Review</h3>
          {renderStars(mockRewardData.customerReview.rating)}
        </div>
        <p className="mt-2 text-sm italic text-gray-600">
          &ldquo;{mockRewardData.customerReview.comment}&rdquo;
        </p>
      </section>

      <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
        We truly appreciate you taking the time to share your experience with{" "}
        <span className="font-semibold text-gray-700">
          {mockRewardData.businessName}
        </span>
        . Enjoy this thank-you offer on us!
      </p>

      <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-blue-600">
            {mockRewardData.reward.title}
          </h3>
          <p className="mt-1 text-base text-gray-700">
            {mockRewardData.reward.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <div className="rounded-xl border border-gray-300 bg-white px-5 py-3">
            <p className="text-xl font-bold tracking-[0.35em] text-gray-900">
              {mockRewardData.reward.promoCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-xl border border-gray-300 bg-white p-3 transition duration-150 hover:bg-gray-50 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            aria-label={
              copied ? "Promo code copied to clipboard" : "Copy promo code"
            }
          >
            {copied ? (
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? "Promo code copied to clipboard" : ""}
        </span>

        <p className="mt-3 text-center text-xs text-gray-500">
          {mockRewardData.reward.terms}
        </p>

        <div className="mt-5 flex flex-col items-center">
          <div className="mb-3 rounded-2xl border-2 border-dashed border-blue-200 bg-white p-6">
            <svg
              className="h-28 w-28 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm11-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
            </svg>
          </div>
          <p className="text-center text-xs text-gray-500">
            Show this code or scan QR at checkout
          </p>
        </div>
      </section>

      <footer className="mt-6 space-y-4 text-center">
        <p className="flex items-center justify-center gap-1 text-sm text-gray-500">
          We look forward to
          <span className="inline-flex items-center gap-1 font-medium text-gray-600">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </span>
          serving you again soon!
        </p>
        <button
          type="button"
          className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          Leave Another Review
        </button>
      </footer>
    </article>
  );
};

const DeclinedState = ({ onRestart }: { onRestart: () => void }) => (
  <article className="w-full max-w-md rounded-3xl bg-white px-6 py-10 text-center shadow-lg sm:px-10">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-10 w-10 text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 14h4m-5-4l-5-5m10 10l-5 5m-2-6h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v7a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Review Posted, Reward Skipped
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Thanks again for sharing your experience. You can still claim your{" "}
          {mockRewardData.reward.description.toLowerCase()} later—just sign in
          to unlock it.
        </p>
      </div>
    </div>

    <section className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6">
      <p className="text-sm text-gray-600">
        Want to save the reward after all? It takes just a moment:
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-4 w-full rounded-lg border border-blue-500 bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition duration-150 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        Sign in &amp; unlock reward
      </button>
    </section>

    <footer className="mt-6 space-y-3 text-sm text-gray-500">
      <p>Your feedback still helps other guests choose Bella Vista.</p>
      <p className="text-xs text-gray-400">
        Rewards are only stored for signed-in guests so we can keep track of
        redemptions.
      </p>
    </footer>
  </article>
);

function RewardPage() {
  const [flowStep, setFlowStep] = useState<FlowStep>("prompt");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mockRewardData.reward.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy promo code:", error);
    }
  };

  // Real Google OAuth sign-in
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSigningIn(true);
      try {
        // Fetch user info from Google using the access token
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();

        // Set user data
        setUser({
          name: userInfo.name,
          email: userInfo.email,
        });

        setFlowStep("reward");
        setCopied(false);

        // TODO: Send token to your backend for verification and session creation
        console.log('Access token:', tokenResponse.access_token);
        console.log('User info:', userInfo);

      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setIsSigningIn(false);
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: (error) => {
      console.error('Google sign-in failed:', error);
      setIsSigningIn(false);
    },
  });

  const handleGoogleSignIn = () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    googleLogin();
  };

  const handleDecline = () => {
    setFlowStep("declined");
    setUser(null);
    setCopied(false);
  };

  const handleRestart = () => {
    setFlowStep("prompt");
    setCopied(false);
  };

  return (
    <RewardLayout user={user} step={flowStep}>
      {flowStep === "prompt" && (
        <SignInPrompt
          onContinue={handleGoogleSignIn}
          isLoading={isSigningIn}
          onDecline={handleDecline}
        />
      )}
      {flowStep === "reward" && user && (
        <RewardContent copied={copied} onCopy={handleCopyCode} user={user} />
      )}
      {flowStep === "declined" && <DeclinedState onRestart={handleRestart} />}
    </RewardLayout>
  );
}

export default RewardPage;
