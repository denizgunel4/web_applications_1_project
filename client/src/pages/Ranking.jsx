

import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function Ranking() {
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/api/ranking", {
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                setRanking(data);
            })
            .catch((error) => {
                console.error("Failed to load ranking:", error);
            });
    }, []);

    return (
        <Layout>
            <div className="ranking-page">

                <div className="ranking-header">
                    <h2>Ranking</h2>
                    <p>The greatest treasure hunters in Gold Digger.</p>
                </div>

                <div className="ranking-card">
                    <div className="ranking-table-header">
                        <span>Position</span>
                        <span>Player</span>
                        <span>Coins</span>
                    </div>

                    <ol className="ranking-list">
                        {ranking.map((player, index) => (
                            <li key={player.username}>
                                <span className="ranking-position">
                                    {index + 1}
                                </span>

                                <span className="ranking-player">
                                    {player.username}
                                </span>

                                <span className="ranking-coins">
                                    {player.totalCoins} coins
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

            </div>
        </Layout>
    );
}

export default Ranking;