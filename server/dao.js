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

export { findUserByUsername, findUserById };