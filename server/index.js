process.loadEnvFile();
// imports
import express from "express";
import session from "express-session";
import passport from "./auth/passport.js";
import "./database/database.js";
import initDatabase from "./database/init.js";
import cors from "cors";
import {
    getAllLocations,
    getRanking,
    createGame,
    addGameLocation,
    findClueByLocationId,
    findActiveGameByUserId,
    findExpectedLocation,
    updateGameStep,
    findGameLocation,
    findGameLocations,
    markGameAsWon,
    markGameAsLost,
    beginTransaction,
    commitTransaction,
    rollbackTransaction
} from "./dao.js";

// init express
const app = new express();
const port = 3001;

// game settings for each difficulty
const difficultySettings = {
    easy: {
        locationCount: 4,
        timeLimit: 120,
        positions: [
            { positionIndex: 1, x: 20, y: 75, routeOrder: 1 },
            { positionIndex: 2, x: 80, y: 25, routeOrder: 2 },
            { positionIndex: 3, x: 25, y: 25, routeOrder: null },
            { positionIndex: 4, x: 75, y: 75, routeOrder: null }
        ]
    },
    intermediate: {
        locationCount: 8,
        timeLimit: 80,
        positions: [
            { positionIndex: 1, x: 20, y: 75, routeOrder: 1 },
            { positionIndex: 2, x: 40, y: 60, routeOrder: 2 },
            { positionIndex: 3, x: 60, y: 40, routeOrder: 3 },
            { positionIndex: 4, x: 80, y: 25, routeOrder: 4 },
            { positionIndex: 5, x: 20, y: 25, routeOrder: null },
            { positionIndex: 6, x: 40, y: 30, routeOrder: null },
            { positionIndex: 7, x: 60, y: 75, routeOrder: null },
            { positionIndex: 8, x: 80, y: 70, routeOrder: null }
        ]
    },
    hard: {
        locationCount: 12,
        timeLimit: 60,
        positions: [
            { positionIndex: 1, x: 15, y: 80, routeOrder: 1 },
            { positionIndex: 2, x: 29, y: 69, routeOrder: 2 },
            { positionIndex: 3, x: 43, y: 58, routeOrder: 3 },
            { positionIndex: 4, x: 57, y: 47, routeOrder: 4 },
            { positionIndex: 5, x: 71, y: 36, routeOrder: 5 },
            { positionIndex: 6, x: 85, y: 25, routeOrder: 6 },
            { positionIndex: 7, x: 15, y: 25, routeOrder: null },
            { positionIndex: 8, x: 30, y: 40, routeOrder: null },
            { positionIndex: 9, x: 45, y: 80, routeOrder: null },
            { positionIndex: 10, x: 60, y: 75, routeOrder: null },
            { positionIndex: 11, x: 75, y: 65, routeOrder: null },
            { positionIndex: 12, x: 85, y: 55, routeOrder: null }
        ]
    }
};

// validate difficulty configuration
function validateDifficultySettings() {
    for (const [difficulty, settings] of Object.entries(difficultySettings)) {
        if (settings.positions.length !== settings.locationCount) {
            throw new Error(
                `${difficulty}: number of positions must equal locationCount`
            );
        }

        const routePositions = settings.positions.filter(
            (position) => position.routeOrder !== null
        );

        if (routePositions.length !== settings.locationCount / 2) {
            throw new Error(
                `${difficulty}: number of route positions must equal locationCount / 2`
            );
        }

        const routeOrders = routePositions
            .map((position) => position.routeOrder)
            .sort((a, b) => a - b);

        for (let i = 0; i < routeOrders.length; i++) {
            if (routeOrders[i] !== i + 1) {
                throw new Error(
                    `${difficulty}: routeOrder values must be consecutive starting from 1`
                );
            }
        }
    }
}

// randomly select a given number of locations
function selectRandomLocations(locations, count) {
    const shuffledLocations = [...locations];

    for (let i = shuffledLocations.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffledLocations[i], shuffledLocations[randomIndex]] =
            [shuffledLocations[randomIndex], shuffledLocations[i]];
    }

    return shuffledLocations.slice(0, count);
}

// assign route order to selected route locations
function createRoute(locations) {
    return locations.map((location, index) => ({
        ...location,
        routeOrder: index + 1
    }));
}

// generate a random treasure value, min: 10 and max: 100
function generateTreasureCoins() {
    // 100 - 10 + 1 = 91
    return Math.floor(Math.random() * 91) + 10;
}

// get settings for a difficulty level
function getDifficultySettings(difficulty) {
    return difficultySettings[difficulty];
}

// assign selected locations to predefined map positions
function assignLocationsToPositions(gameLocations, route, positions) {
    const assignments = [];

    const routePositions = positions.filter(
        (position) => position.routeOrder !== null
    );

    const decoyPositions = positions.filter(
        (position) => position.routeOrder === null
    );

    const decoyLocations = gameLocations.filter(
        (location) => !route.some(
            (routeLocation) => routeLocation.locationId === location.locationId
        )
    );

    for (const routeLocation of route) {
        const position = routePositions.find(
            (position) => position.routeOrder === routeLocation.routeOrder
        );

        assignments.push({
            locationId: routeLocation.locationId,
            positionIndex: position.positionIndex,
            routeOrder: routeLocation.routeOrder
        });
    }

    const shuffledDecoyPositions = selectRandomLocations(
        decoyPositions,
        decoyPositions.length
    );

    decoyLocations.forEach((location, index) => {
        assignments.push({
            locationId: location.locationId,
            positionIndex: shuffledDecoyPositions[index].positionIndex,
            routeOrder: null
        });
    });

    return assignments;
}

// allow requests from react client
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// parse json request bodies
app.use(express.json());

// manage login sessions with session cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
// connect passport to session
app.use(passport.authenticate("session"));

// get general ranking
app.get("/api/ranking", async (req, res) => {
    try {
        const ranking = await getRanking();

        res.json(ranking);
    } catch (err) {
        console.error("Error getting ranking:", err);

        res.status(500).json({
            error: "Could not get ranking"
        });
    }
});

// start a new game
app.post("/api/games", async (req, res) => {
    const { difficulty } = req.body;

    const settings = getDifficultySettings(difficulty);

    if (!settings) {
        return res.status(400).json({
            error: "Invalid difficulty"
        });
    }

    if (!req.isAuthenticated()) {
    return res.status(401).json({
        error: "Not authenticated"
    });
    }

    let transactionStarted = false;

    try {
        const activeGame = await findActiveGameByUserId(req.user.userId);

        if (activeGame) {
            const gameExpired = Date.now() >= activeGame.expiresAt;

            if (gameExpired) {
                await markGameAsLost(activeGame.gameId);
            } else {
                return res.status(409).json({
                    error: "You already have an active game"
                });
            }
        }

        const allLocations = await getAllLocations();

        if (allLocations.length < settings.locationCount) {
            return res.status(500).json({
                error: "Not enough locations available"
            });
        }

        const gameLocations = selectRandomLocations(
            allLocations,
            settings.locationCount
        );

        const routeLocations = selectRandomLocations(
            gameLocations,
            settings.locationCount / 2
        );

        const route = createRoute(routeLocations);

        const treasureCoins = generateTreasureCoins();

        const startedAt = Date.now();
        // convert time limit from seconds to milliseconds
        const expiresAt = startedAt + settings.timeLimit * 1000;

        const firstRouteLocation = route.find(
            (location) => location.routeOrder === 1
        );

        const firstClue = await findClueByLocationId(
            firstRouteLocation.locationId
        );

        if (!firstClue) {
            return res.status(500).json({
                error: "Could not find starting clue"
            });
        }

        let gameId;

        await beginTransaction();
        transactionStarted = true;

        gameId = await createGame(
            req.user.userId,
            difficulty,
            startedAt,
            expiresAt,
            treasureCoins
        );

        const assignments = assignLocationsToPositions(
            gameLocations,
            route,
            settings.positions
        );

        for (const assignment of assignments) {
            await addGameLocation(
            gameId,
            assignment.locationId,
            assignment.positionIndex,
            assignment.routeOrder
            );
        }

        await commitTransaction();
        transactionStarted = false;

        const availableLocations = gameLocations.map((location) => ({
            locationId: location.locationId,
            locationName: location.locationName
        }));

        return res.status(201).json({
            gameId,
            difficulty,
            expiresAt,
            currentStep: 0,
            clue: {
                clueText: firstClue.clueText

            },
            locations: availableLocations
        });

    } catch (err) {
        console.error("Could not create game:", err);
        if (transactionStarted) {
            try {
                await rollbackTransaction();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr);
            }
        }

        return res.status(500).json({
            error: "Could not create game"
        });
    }

});

// submit an answer for current game
app.post("/api/games/current/answer", async (req, res) => {
    try {

        if (!req.isAuthenticated()) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }

        const activeGame = await findActiveGameByUserId(req.user.userId);

        if (!activeGame) {
            return res.status(404).json({
                error: "No active game"
            });
        }

        if (Date.now() >= activeGame.expiresAt) {
            await markGameAsLost(activeGame.gameId);

            const gameLocations = await findGameLocations(activeGame.gameId);

            const revealedLocations = gameLocations.map((location) => {
                const position = difficultySettings[activeGame.difficulty].positions.find(
                    (position) => position.positionIndex === location.positionIndex
                );

                return {
                    locationId: location.locationId,
                    locationName: location.locationName,
                    x: position.x,
                    y: position.y,
                    routeOrder: location.routeOrder
                };
            });

            return res.status(409).json({
                error: "Game has expired",
                gameStatus: "lost",
                treasureCoins: activeGame.treasureCoins,
                locations: revealedLocations
            });
        }

        const { locationId } = req.body;

        if (!Number.isInteger(locationId) || locationId <= 0) {
            return res.status(400).json({
                error: "Invalid locationId"
            });
        }

        const gameLocation = await findGameLocation(
            activeGame.gameId,
            locationId
        );

        if (!gameLocation) {
            return res.status(400).json({
                error: "Location is not part of this game"
            });
        }

        const expectedLocation = await findExpectedLocation(
            activeGame.gameId,
            activeGame.currentStep
        );

        if (!expectedLocation) {
            return res.status(500).json({
                error: "Could not find expected location"
            });
        }

        const isCorrect = locationId === expectedLocation.locationId;

        if (!isCorrect) {
            await markGameAsLost(activeGame.gameId);

            const gameLocations = await findGameLocations(activeGame.gameId);

            const revealedLocations = gameLocations.map((location) => {
                const position = difficultySettings[activeGame.difficulty].positions.find(
                    (position) => position.positionIndex === location.positionIndex
                );

                return {
                    locationId: location.locationId,
                    locationName: location.locationName,
                    x: position.x,
                    y: position.y,
                    routeOrder: location.routeOrder
                };
            });

            return res.json({
                correct: false,
                gameStatus: "lost",
                treasureCoins: activeGame.treasureCoins,
                locations: revealedLocations
            });
        }

        const newCurrentStep = activeGame.currentStep + 1;

        const routeLength = difficultySettings[activeGame.difficulty].positions.filter(
            (position) => position.routeOrder !== null
        ).length;

        const isFinalAnswer = newCurrentStep === routeLength;

        if (isFinalAnswer) {
            await updateGameStep(
                activeGame.gameId,
                newCurrentStep
            );

            await markGameAsWon(activeGame.gameId);

            const gameLocations = await findGameLocations(activeGame.gameId);

            const revealedLocations = gameLocations.map((location) => {
                const position = difficultySettings[activeGame.difficulty].positions.find(
                    (position) => position.positionIndex === location.positionIndex
                );

                return {
                    locationId: location.locationId,
                    locationName: location.locationName,
                    x: position.x,
                    y: position.y,
                    routeOrder: location.routeOrder
                };
            });

            return res.json({
                correct: true,
                gameStatus: "won",
                currentStep: newCurrentStep,
                treasureCoins: activeGame.treasureCoins,
                locations: revealedLocations
            });

        } else {
            const gameLocations = await findGameLocations(activeGame.gameId);

            const selectedLocation = gameLocations.find(
                (location) => location.locationId === expectedLocation.locationId
            );

            if (!selectedLocation) {
                return res.status(500).json({
                    error: "Could not find selected location"
                });
            }

            const position = difficultySettings[activeGame.difficulty].positions.find(
                (position) => position.positionIndex === selectedLocation.positionIndex
            );

            if (!position) {
                return res.status(500).json({
                    error: "Could not find location position"
                });
            }

            const nextLocation = await findExpectedLocation(
                activeGame.gameId,
                newCurrentStep
            );

            if (!nextLocation) {
                return res.status(500).json({
                    error: "Could not find next location"
                });
            }

            const nextClue = await findClueByLocationId(
                nextLocation.locationId
            );

            if (!nextClue) {
                return res.status(500).json({
                    error: "Could not find next clue"
                });
            }

            await updateGameStep(
                activeGame.gameId,
                newCurrentStep
            );

            return res.json({
                correct: true,
                gameStatus: "playing",
                currentStep: newCurrentStep,
                location: {
                    locationId: selectedLocation.locationId,
                    locationName: selectedLocation.locationName,
                    x: position.x,
                    y: position.y
                },
                clue: {
                    clueText: nextClue.clueText
                }
            });
        }
    } catch (err) {
        console.error("Error processing answer:", err);

        return res.status(500).json({
            error: "Could not process answer"
        });
    }

});

// login
app.post("/api/sessions", passport.authenticate("local"), (req, res) => {
    res.status(201).json(req.user);
});

// get currently authenticated user
app.get("/api/sessions/current", (req, res) => {
    // passport provides isAuthenticated()
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
});

// log out current user
app.delete("/api/sessions/current", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }

        res.status(204).end();
    });
});

// activate the server
async function startServer() {
    try {
        validateDifficultySettings();

        await initDatabase();

        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    } catch (err) {
        process.exit(1);
    }
}

startServer();