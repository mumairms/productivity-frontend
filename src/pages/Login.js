import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    fetch("http://localhost:5000/api/auth/login", {
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

      // 🔥 IMPORTANT LINE (PUT HERE)
      localStorage.setItem("token", data.token);

      // 👉 optional: redirect
      window.location.href = "/dashboard";

    })
    .catch(err => console.log(err));
  };

  return (
    <div className="flex justify-center items-center h-screen">

      <div className="bg-white p-6 rounded shadow w-80">

        <h2 className="text-2xl mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;