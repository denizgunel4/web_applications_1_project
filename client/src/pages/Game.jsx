

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Map from "../components/Map";

function Game() {
    const location = useLocation();
    const gameData = location.state;

    const [timeLeft, setTimeLeft] = useState(0);
    const [currentClue, setCurrentClue] = useState(gameData?.clue);
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [treasureCoins, setTreasureCoins] = useState(0);
    const [revealedLocations, setRevealedLocations] = useState([]);

    const handleTimeout = async () => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/games/current/answer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({}),
                }
            );

            const result = await response.json();

            if (result.gameStatus === "lost") {
                setGameResult("lost");
                setTreasureCoins(result.treasureCoins);
                setRevealedLocations(result.locations);
                setGameOver(true);
            }
        } catch (error) {
            console.error("Failed to process timeout:", error);
        }
    };

    useEffect(() => {
        if (!gameData || gameOver) {
            return;
        }

        let timeoutSent = false;

        const updateTimer = () => {
            const remaining = gameData.expiresAt - Date.now();

            if (remaining <= 0) {
                setTimeLeft(0);

                if (!timeoutSent) {
                    timeoutSent = true;
                    handleTimeout();
                }

                return;
            }

            setTimeLeft(Math.ceil(remaining / 1000));
        };

        updateTimer();

        const timer = setInterval(updateTimer, 250);

        return () => clearInterval(timer);
    }, [gameData, gameOver]);

    const handleAnswer = async (locationId) => {
        try {
            const response = await fetch(
                "http://localhost:3001/api/games/current/answer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        locationId,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok && result.clue) {
                setCurrentClue(result.clue);
            }

            if (response.ok && result.location) {
                setRevealedLocations((previous) => [
                    ...previous,
                    result.location,
                ]);
            }

            if (result.gameStatus === "lost" || result.gameStatus === "won") {
                setGameResult(result.gameStatus);
                setTreasureCoins(result.treasureCoins);
                setRevealedLocations(result.locations);
                setGameOver(true);
            }

        } catch (error) {
            console.error("Failed to submit answer:", error);
        }
    };

    if (!gameData) {
        return (
            <Layout>
                <h2>No game data found.</h2>
            </Layout>
        );
    }

    return (
        <Layout>

            <div className="game-layout">

                <div className="game-info">

                {gameResult === "won" && <h2>You won!</h2>}
                {gameResult === "lost" && <h2>You lost!</h2>}

                {gameOver && (
                    <p>
                        {gameResult === "won"
                            ? `Well dug, Gold Digger! You uncovered ${treasureCoins} coins!`
                            : `Keep digging! ${treasureCoins} coins were just out of reach.`}
                    </p>
                )}

                {gameOver && (
                    <>
                        <h3>Route to the treasure</h3>

                        <ol>
                            {revealedLocations
                                .filter((location) => location.routeOrder !== null)
                                .sort((a, b) => a.routeOrder - b.routeOrder)
                                .map((location) => (
                                    <li key={location.locationId}>
                                        {location.locationName}
                                    </li>
                                ))}
                        </ol>
                    </>
                )}

            <p>Time left: {timeLeft} seconds</p>

            <p>Difficulty: {gameData.difficulty}</p>
            <p>Clue: {currentClue.clueText}</p>

            <h3>Locations</h3>

            <ul>
                {gameData.locations.map((location) => (
                    <li key={location.locationId}>
                        <button
                            disabled={gameOver}
                            onClick={() => handleAnswer(location.locationId)}
                        >
                            {location.locationName}
                        </button>
                    </li>
                ))}
            </ul>

                </div>

                <Map
                    difficulty={gameData.difficulty}
                    revealedLocations={revealedLocations}
                />
            
            </div>

        </Layout>
    );
}

export default Game;