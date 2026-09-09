import db, { databaseReady } from "./database.js";
import { hashPassword } from "../auth/password.js";

// user table
function createUsersTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                userId INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                saltedPassword TEXT NOT NULL,
                salt TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// seed users
async function seedUsers() {
    const users = [
        { username: "tomhanks", password: "forrestGump1994" },
        { username: "harry", password: "potter" },
        { username: "rachelMcAdams", password: "BURNBOOK" }
    ];

    for (const user of users) {
        const { saltedPassword, salt } = await hashPassword(user.password);

        await new Promise((resolve, reject) => {
            db.run(
                `
                    INSERT OR IGNORE INTO users (
                        username,
                        saltedPassword,
                        salt
                    )
                    VALUES (?, ?, ?)
                `,
                [user.username, saltedPassword, salt],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}

// locations table
function createLocationsTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS locations (
                locationId INTEGER PRIMARY KEY AUTOINCREMENT,
                locationName TEXT NOT NULL UNIQUE
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// clues table
function createCluesTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS clues (
                clueId INTEGER PRIMARY KEY AUTOINCREMENT,
                clueText TEXT NOT NULL,
                locationId INTEGER NOT NULL UNIQUE,
                FOREIGN KEY (locationId) REFERENCES locations(locationId)
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// games table
function createGamesTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS games (
                gameId INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'intermediate', 'hard')),
                startedAt INTEGER NOT NULL,
                expiresAt INTEGER NOT NULL,
                treasureCoins INTEGER NOT NULL,
                gameStatus TEXT NOT NULL CHECK (gameStatus IN ('playing', 'won', 'lost')),
                currentStep INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (userId) REFERENCES users(userId)
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// gameLocations table
function createGameLocationsTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS gameLocations (
                gameId INTEGER NOT NULL,
                locationId INTEGER NOT NULL,
                positionIndex INTEGER NOT NULL,
                routeOrder INTEGER,
                PRIMARY KEY (gameId, locationId),
                UNIQUE (gameId, positionIndex),
                UNIQUE (gameId, routeOrder),
                FOREIGN KEY (gameId) REFERENCES games(gameId),
                FOREIGN KEY (locationId) REFERENCES locations(locationId)
            )
        `, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// seed locations and clues
function seedLocationsAndClues() {
    return new Promise((resolve, reject) => {
        const locations = [
            {
                name: "Russia",
                clue: "Which country has the largest total area in the world?"
            },
            {
                name: "Vatican City",
                clue: "Which is the smallest independent country in the world by area?"
            },
            {
                name: "Pacific Ocean",
                clue: "Which is the largest ocean on Earth?"
            },
            {
                name: "Mount Everest",
                clue: "What is the highest mountain above sea level?"
            },
            {
                name: "Egypt",
                clue: "Which country is home to the Great Pyramid of Giza?"
            },
            {
                name: "Australia",
                clue: "Which country is also a continent?"
            },
            {
                name: "Canada",
                clue: "Which country has the longest coastline in the world?"
            },
            {
                name: "Japan",
                clue: "Which country is known as the \"Land of the Rising Sun\"?"
            },
            {
                name: "Italy",
                clue: "Which country is shaped roughly like a boot?"
            },
            {
                name: "China",
                clue: "Which country is home to the Great Wall?"
            },
            {
                name: "United States",
                clue: "Which country is home to the Grand Canyon?"
            },
            {
                name: "Greece",
                clue: "Which country is the birthplace of the Olympic Games?"
            },
            {
                name: "South Africa",
                clue: "Which country has three capital cities?"
            },
            {
                name: "Turkey",
                clue: "Which country lies between Europe and Asia and contains Istanbul?"
            },
            {
                name: "United Kingdom",
                clue: "Which country is home to Stonehenge?"
            },
            {
                name: "Peru",
                clue: "Which country is home to the ancient city of Machu Picchu?"
            },
            {
                name: "Netherlands",
                clue: "Which country is famous for its canals, windmills and tulips?"
            },
            {
                name: "Morocco",
                clue: "Which country is home to the city of Marrakech?"
            },
            {
                name: "Spain",
                clue: "Which country is home to the Sagrada Família?"
            },
            {
                name: "Thailand",
                clue: "Which country is home to Bangkok?"
            },
            {
                name: "Kenya",
                clue: "Which country is famous for the Maasai Mara wildlife reserve?"
            },
            {
                name: "Portugal",
                clue: "Which country has Lisbon as its capital?"
            },
            {
                name: "Indonesia",
                clue: "Which country is made up of thousands of islands and has Jakarta as its capital?"
            },
            {
                name: "Switzerland",
                clue: "Which country is famous for its Alps, watches and chocolate?"
            }
        ];

        function insertLocation(index) {
            if (index >= locations.length) {
                resolve();
                return;
            }

            const location = locations[index];

            db.run(
                `
                    INSERT OR IGNORE INTO locations (
                        locationName
                    )
                    VALUES (?)
                `,
                [location.name],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    db.get(
                        `
                            SELECT locationId
                            FROM locations
                            WHERE locationName = ?
                        `,
                        [location.name],
                        (err, row) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            db.run(
                                `
                                    INSERT OR IGNORE INTO clues (
                                        clueText,
                                        locationId
                                    )
                                    VALUES (?, ?)
                                `,
                                [location.clue, row.locationId],
                                (err) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    insertLocation(index + 1);
                                }
                            );
                        }
                    );
                }
            );
        }

        insertLocation(0);
    });
}

// seed games
async function seedGames() {
    const users = await new Promise((resolve, reject) => {
        db.all(
            `
                SELECT userId, username
                FROM users
                WHERE username IN (?, ?)
            `,
            ["tomhanks", "harry"],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });

    const userIds = {};

    for (const user of users) {
        userIds[user.username] = user.userId;
    }

    if (!userIds.tomhanks || !userIds.harry) {
        throw new Error("Seed users not found");
    }

    const games = [
        {
            username: "tomhanks",
            difficulty: "easy",
            treasureCoins: 75,
            gameStatus: "won",
            currentStep: 2
        },
        {
            username: "tomhanks",
            difficulty: "easy",
            treasureCoins: 60,
            gameStatus: "lost",
            currentStep: 1
        },
        {
            username: "harry",
            difficulty: "intermediate",
            treasureCoins: 90,
            gameStatus: "won",
            currentStep: 4
        },
        {
            username: "harry",
            difficulty: "intermediate",
            treasureCoins: 40,
            gameStatus: "lost",
            currentStep: 2
        }
    ];

    for (const game of games) {
        const userId = userIds[game.username];

        const startedAt = Date.now() - 86400000;
        const expiresAt = startedAt + 120000;

        await new Promise((resolve, reject) => {
            db.run(
                `
                    INSERT INTO games (
                        userId,
                        difficulty,
                        startedAt,
                        expiresAt,
                        treasureCoins,
                        gameStatus,
                        currentStep
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    game.difficulty,
                    startedAt,
                    expiresAt,
                    game.treasureCoins,
                    game.gameStatus,
                    game.currentStep
                ],
                function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const gameId = this.lastID;

                    const locationCount =
                        game.difficulty === "easy" ? 4 : 8;

                    const routeCount = locationCount / 2;

                    const assignments = [];

                    for (let i = 1; i <= locationCount; i++) {
                        assignments.push({
                            locationId: i,
                            positionIndex: i,
                            routeOrder: i <= routeCount ? i : null
                        });
                    }

                    function insertLocation(index) {
                        if (index >= assignments.length) {
                            resolve();
                            return;
                        }

                        const assignment = assignments[index];

                        db.run(
                            `
                                INSERT INTO gameLocations (
                                    gameId,
                                    locationId,
                                    positionIndex,
                                    routeOrder
                                )
                                VALUES (?, ?, ?, ?)
                            `,
                            [
                                gameId,
                                assignment.locationId,
                                assignment.positionIndex,
                                assignment.routeOrder
                            ],
                            (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                insertLocation(index + 1);
                            }
                        );
                    }

                    insertLocation(0);
                }
            );
        });
    }
}

async function initDatabase() {
    try {
        await databaseReady;
        
        await createUsersTable();
        await seedUsers();
        await createLocationsTable();
        await createCluesTable();
        await createGamesTable();
        await createGameLocationsTable();
        // TEST, CHANGE LATER
        await seedLocationsAndClues();
        await seedGames();

    } catch (err) {
        console.error("Database initialization failed:", err);
        throw err;
    }
}

export default initDatabase;