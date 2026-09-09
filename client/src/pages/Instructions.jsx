

import Layout from "../components/Layout";

function Instructions() {
    return (
        <Layout>
            <h2>Instructions</h2>

            <p>
                Gold Digger is a treasure hunt game. Follow the clues and find
                the correct locations to reach the treasure.
            </p>

            <h3>How to play</h3>
            <ul>
                <li>Choose a difficulty and start a game.</li>
                <li>A clue will tell you which location to choose.</li>
                <li>Choose the location you think matches the clue.</li>
                <li>A correct answer reveals the location on the map and gives you the next clue.</li>
                <li>A wrong answer ends the game.</li>
                <li>If the timer reaches zero, you lose the game.</li>
                <li>Reach the treasure before time runs out to win coins.</li>
            </ul>

            <h3>Difficulty</h3>
            <ul>
                <li>Easy: 4 locations, 120 seconds</li>
                <li>Intermediate: 8 locations, 80 seconds</li>
                <li>Hard: 12 locations, 60 seconds</li>
            </ul>

            <h3>Scoring</h3>
            <p>
                Winning a game adds the treasure coins to your total score.
                Losing a game gives you 0 coins for that game.
            </p>
        </Layout>
    );
}

export default Instructions;