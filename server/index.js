// imports
import express from "express";
import "./database/database.js";
import initDatabase from "./database/init.js";

// init express
const app = new express();
const port = 3001;

// activate the server
async function startServer() {
    try {
        await initDatabase();

        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    } catch (err) {
        process.exit(1);
    }
}

startServer();