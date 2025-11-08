import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Absolutely Brilliant</h1>
      <p className="mb-6 text-app-muted">Welcome to our frontend prototype!</p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/login", { state: { next: "/portal" } })}
          className="bg-app-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Start Business Flow
        </button>

        <button
          onClick={() => navigate("/feedback")}
          className="bg-app-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          Start User Flow
        </button>

        <button
          onClick={() => navigate("/portal")}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition">
            Management Portal
        </button>
      </div>
    </div>
  );
}

export default Home;
