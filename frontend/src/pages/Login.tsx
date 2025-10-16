import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      <p className="mb-6">This is where users will log in.</p>
      <button
        onClick={() => navigate("/")}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
}

export default Login;
