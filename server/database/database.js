import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/treasure_hunt.db", (err) => {
    if (err) throw err;
});

export default db;