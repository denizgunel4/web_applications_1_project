process.loadEnvFile();
// imports
import express from "express";
import session from "express-session";
import passport from "./auth/passport.js";
import "./database/database.js";
import initDatabase from "./database/init.js";
import cors from "cors";

// init express
const app = new express();
const port = 3001;

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

// connect passport to session
app.use(passport.authenticate("session"));

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
        await initDatabase();

        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    } catch (err) {
        process.exit(1);
    }
}

startServer();