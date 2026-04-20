import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔥 LIVE BACKEND URL
  const API = "https://productivity-backend-ccxh.onrender.com";

  const handleLogin = () => {

    fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })
    .then(res => res.json())
    .then(data => {

      if (data.token) {
        // ✅ SAVE TOKEN
        localStorage.setItem("token", data.token);

        // ✅ REDIRECT
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Login failed");
      }

    })
    .catch(err => {
      console.log(err);
      setError("Server error");
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">

      <div className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-2xl mb-4 text-center">Login</h2>

        {/* ❌ Error Message */}
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;