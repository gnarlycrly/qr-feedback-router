import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Absolutely Brilliant</h1>
      <p className="mb-6">Welcome to our frontend prototype!</p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate("/reward")}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Go to Rewards
        </button>
        <button
          onClick={() => navigate("/portal")}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
        >
          Go to Management Portal
        </button>
      </div>
    </div>
  );
}

export default Home;
