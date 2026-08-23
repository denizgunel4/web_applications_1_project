import db from "./database.js";

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

// locations table
function createLocationsTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS locations (
                locationId INTEGER PRIMARY KEY AUTOINCREMENT,
                locationName TEXT NOT NULL UNIQUE,
                xPosition INTEGER NOT NULL,
                yPosition INTEGER NOT NULL
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
                routeOrder INTEGER,
                PRIMARY KEY (gameId, locationId),
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


async function initDatabase() {
    try {
        await createUsersTable();
        await createLocationsTable();
        await createCluesTable();
        await createGamesTable();
        await createGameLocationsTable();
    } catch (err) {
        console.error("Database initialization failed:", err);
        throw err;
    }
}

export default initDatabase;