import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/treasure_hunt.db", (err) => {
    if (err) throw err;
});

const databaseReady = new Promise((resolve, reject) => {
    db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

export { databaseReady };
export default db;