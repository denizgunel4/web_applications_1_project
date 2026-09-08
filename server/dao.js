import db from "./database/database.js";

// find a user by username for password verification
function findUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(user);
            }
        );
    });
}

// find a user by userId for session management
function findUserById(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT userId, username FROM users WHERE userId = ?",
            [userId],
            (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(user);
            }
        );
    });
}

// get all locations available for creating games
function getAllLocations() {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT locationId, locationName FROM locations",
            [],
            (err, locations) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(locations);
            }
        );
    });
}

// create a new game
function createGame(userId, difficulty, startedAt, expiresAt, treasureCoins) {
    return new Promise((resolve, reject) => {
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
                VALUES (?, ?, ?, ?, ?, 'playing', 0)
            `,
            [userId, difficulty, startedAt, expiresAt, treasureCoins],
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this.lastID);
            }
        );
    });
}

// add a location to a game
function addGameLocation(gameId, locationId, positionIndex, routeOrder) {
    return new Promise((resolve, reject) => {
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
            [gameId, locationId, positionIndex, routeOrder],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
}

// start a database transaction
function beginTransaction() {
    return new Promise((resolve, reject) => {
        db.run("BEGIN TRANSACTION", (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

// commit a database transaction
function commitTransaction() {
    return new Promise((resolve, reject) => {
        db.run("COMMIT", (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

// rollback a database transaction
function rollbackTransaction() {
    return new Promise((resolve, reject) => {
        db.run("ROLLBACK", (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

// find the clue belonging to a location
function findClueByLocationId(locationId) {
    return new Promise((resolve, reject) => {
        db.get(
            `
                SELECT clueId, clueText
                FROM clues
                WHERE locationId = ?
            `,
            [locationId],
            (err, clue) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(clue);
            }
        );
    });
}

// find a user's active game
function findActiveGameByUserId(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `
                SELECT gameId, difficulty, expiresAt, treasureCoins, currentStep
                FROM games
                WHERE userId = ? AND gameStatus = 'playing'
            `,
            [userId],
            (err, game) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(game);
            }
        );
    });
}

// find expected location for current route step
function findExpectedLocation(gameId, currentStep) {
    return new Promise((resolve, reject) => {
        db.get(
            `
                SELECT locationId, routeOrder
                FROM gameLocations
                WHERE gameId = ? AND routeOrder = ?
            `,
            [gameId, currentStep + 1],
            (err, location) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(location);
            }
        );
    });
}

// update the current step of a game
function updateGameStep(gameId, currentStep) {
    return new Promise((resolve, reject) => {
        db.run(
            `
                UPDATE games
                SET currentStep = ?
                WHERE gameId = ?
            `,
            [currentStep, gameId],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
}

// find all locations belonging to a game
function findGameLocations(gameId) {
    return new Promise((resolve, reject) => {
        db.all(
            `
                SELECT
                    gameLocations.locationId,
                    locations.locationName,
                    gameLocations.positionIndex,
                    gameLocations.routeOrder
                FROM gameLocations
                JOIN locations
                    ON gameLocations.locationId = locations.locationId
                WHERE gameLocations.gameId = ?
                ORDER BY gameLocations.positionIndex
            `,
            [gameId],
            (err, locations) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(locations);
            }
        );
    });
}

// mark a game as won
function markGameAsWon(gameId) {
    return new Promise((resolve, reject) => {
        db.run(
            `
                UPDATE games
                SET gameStatus = 'won'
                WHERE gameId = ?
            `,
            [gameId],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
}

// mark a game as lost
function markGameAsLost(gameId) {
    return new Promise((resolve, reject) => {
        db.run(
            `
                UPDATE games
                SET gameStatus = 'lost'
                WHERE gameId = ?
            `,
            [gameId],
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
}

export { findUserByUsername,
         findUserById, 
         getAllLocations, 
         createGame,
         addGameLocation,
         findClueByLocationId,
         findActiveGameByUserId,
         findExpectedLocation,
         updateGameStep,
         findGameLocations,
         markGameAsWon,
         markGameAsLost,
         beginTransaction,
         commitTransaction,
         rollbackTransaction };