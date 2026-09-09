

import Layout from "../components/Layout";

function Instructions() {
    return (
        <Layout>
            <div className="instructions-page">

                <div className="instructions-header">
                    <h2>Instructions</h2>
                    <p>
                        Everything you need to know before starting your
                        treasure hunt.
                    </p>
                </div>

                <div className="instructions-card">
                    <h3>How to play</h3>

                    <ul>
                        <li>Choose a difficulty and start a game.</li>
                        <li>A clue will tell you which location to choose.</li>
                        <li>Choose the location you think matches the clue.</li>
                        <li>
                            A correct answer reveals the location on the map
                            and gives you the next clue.
                        </li>
                        <li>A wrong answer ends the game.</li>
                        <li>If the timer reaches zero, you lose the game.</li>
                        <li>
                            Reach the treasure before time runs out to win
                            coins.
                        </li>
                    </ul>
                </div>

                <div className="instructions-card">
                    <h3>Difficulty</h3>

                    <div className="difficulty-info">
                        <div>
                            <strong>Easy</strong>
                            <span>4 locations · 120 seconds</span>
                        </div>

                        <div>
                            <strong>Intermediate</strong>
                            <span>8 locations · 80 seconds</span>
                        </div>

                        <div>
                            <strong>Hard</strong>
                            <span>12 locations · 60 seconds</span>
                        </div>
                    </div>
                </div>

                <div className="instructions-card">
                    <h3>Scoring</h3>

                    <p>
                        Winning a game adds the treasure coins to your total
                        score. Losing a game gives you 0 coins for that game.
                    </p>
                </div>

            </div>
        </Layout>
    );
}

export default Instructions;