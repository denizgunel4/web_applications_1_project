

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
            <h2>Ranking</h2>

            <ol>
                {ranking.map((player) => (
                    <li key={player.username}>
                        {player.username} - {player.totalCoins} coins
                    </li>
                ))}
            </ol>
        </Layout>
    );
}

export default Ranking;