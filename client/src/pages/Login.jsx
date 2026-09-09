

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        setError("Invalid username or password.");
        return;
      }

      const userData = await response.json();
      setUser(userData);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Unable to connect to the server.");
    }
  };

  return (
    <Layout>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        <button type="submit">Login</button>
      </form>

      {error && <p>{error}</p>}
    </Layout>
  );
}

export default Login;