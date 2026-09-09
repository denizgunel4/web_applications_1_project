
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Instructions from "./pages/Instructions";
import Game from "./pages/Game";
import Ranking from "./pages/Ranking";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/sessions/current", {
        credentials: "include",
    })
        .then(async (response) => {
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        })
        .catch((error) => {
            console.error("Failed to check session:", error);
        });
}, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route
          path="/game"
          element={user ? <Game /> : <Navigate to="/login" />}
        />
        <Route
          path="/ranking"
          element={user ? <Ranking /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
