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

// seed placeholder users
// FOR TESTING, CHANGE LATER
async function seedUsers() {
    const users = [
        { username: "username1", password: "password1" },
        { username: "username2", password: "password2" },
        { username: "username3", password: "password3" },
        { username: "username4", password: "password4" }
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
                difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Intermediate', 'Hard')),
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

// seed placeholder locations and clues
// FOR TESTING, CHANGE LATER
function seedLocationsAndClues() {
    return new Promise((resolve, reject) => {
        const locations = [];

        for (let i = 1; i <= 24; i++) {
            locations.push({
                name: `location${i}`
            });
        }

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
                                [`clue${index + 1}`, row.locationId],
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

    } catch (err) {
        console.error("Database initialization failed:", err);
        throw err;
    }
}

export default initDatabase;