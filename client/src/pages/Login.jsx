

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
      <div className="login-page">

        <div className="login-card">
          <div className="login-header">
            <h2>Login</h2>
            <p>Enter your credentials to begin your expedition.</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="login-button" type="submit">
              Login
            </button>

          </form>

          {error && <p className="login-error">{error}</p>}
        </div>

      </div>
    </Layout>
  );
}

export default Login;