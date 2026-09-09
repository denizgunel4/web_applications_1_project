

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Home({ user, setUser }) {
    const [difficulty, setDifficulty] = useState(null);
    const navigate = useNavigate();

    const handleStartGame = async () => {
        console.log("Starting game with difficulty:", difficulty);
        try {
            const response = await fetch("http://localhost:3001/api/games", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    difficulty,
                }),
            });

            if (!response.ok) {
                console.error("Failed to start game.");
                return;
            }

            const gameData = await response.json();

            navigate("/game", {
                state: gameData,
            });
        } catch (error) {
            console.error("Failed to start game:", error);
        }
    };

    return (
        <Layout user={user} setUser={setUser}>
            <h2>Welcome to Gold Digger!</h2>

            {user ? (
            <>
                <h3>Choose difficulty</h3>

                <div>
                    <button onClick={() => setDifficulty("easy")}>
                        Easy
                    </button>

                    <button onClick={() => setDifficulty("intermediate")}>
                        Intermediate
                    </button>

                    <button onClick={() => setDifficulty("hard")}>
                        Hard
                    </button>
                </div>

                <button
                    disabled={!difficulty}
                    onClick={handleStartGame}
                >
                    Start Game
                </button>

                <div>
                    <Link to="/instructions">Instructions</Link>
                    <Link to="/ranking">Ranking</Link>
                </div>
            </>
            ) : (
            <>
                <div>
                    <Link to="/login">Login</Link>
                </div>

                <div>
                    <Link to="/instructions">Instructions</Link>
                </div>
            </>
            )}
        </Layout>
    );
}

export default Home;