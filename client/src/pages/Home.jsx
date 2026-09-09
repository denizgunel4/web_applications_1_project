

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
            <div className="home-page">

                <div className="home-hero">
                    <div className="treasure-icon">$</div>

                    <h2>Welcome to Gold Digger!</h2>

                    <p>
                        Follow the clues, find the hidden path,
                        and uncover the treasure before time runs out.
                    </p>
                </div>

                {user ? (
                    <div className="home-content">

                        <h3>Choose your expedition</h3>

                        <div className="difficulty-options">
                            <button
                                className={`difficulty-card ${
                                    difficulty === "easy" ? "selected" : ""
                                }`}
                                onClick={() => setDifficulty("easy")}
                            >
                                <span>Easy</span>
                            </button>

                            <button
                                className={`difficulty-card ${
                                    difficulty === "intermediate" ? "selected" : ""
                                }`}
                                onClick={() => setDifficulty("intermediate")}
                            >
                                <span>Intermediate</span>
                            </button>

                            <button
                                className={`difficulty-card ${
                                    difficulty === "hard" ? "selected" : ""
                                }`}
                                onClick={() => setDifficulty("hard")}
                            >
                                <span>Hard</span>
                            </button>
                        </div>

                        <button
                            className="start-game-button"
                            disabled={!difficulty}
                            onClick={handleStartGame}
                        >
                            Start Game
                        </button>

                        <div className="home-links">
                            <Link to="/instructions">Instructions</Link>
                            <Link to="/ranking">Ranking</Link>
                        </div>

                    </div>
                ) : (
                    <div className="home-content anonymous-home">

                        <Link className="main-home-button" to="/login">
                            Login
                        </Link>

                        <Link className="secondary-home-button" to="/instructions">
                            Instructions
                        </Link>

                    </div>
                )}

            </div>
        </Layout>
    );
}

export default Home;