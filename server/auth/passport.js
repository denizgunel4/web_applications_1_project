import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { findUserByUsername, findUserById } from "../dao.js";
import { verifyPassword } from "./password.js";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        // done(error, user)
        try {
            const user = await findUserByUsername(username);

            if (!user) {
                return done(null, false);
            }

            const validPassword = await verifyPassword(
                password,
                user.salt,
                user.saltedPassword
            );

            if (!validPassword) {
                return done(null, false);
            }

            return done(null, {
                userId: user.userId,
                username: user.username
            });
        } catch (err) {
            return done(err);
        }
    })
);

// store userId in session
passport.serializeUser((user, done) => {
    done(null, user.userId);
});

// find user by userId when restoring session
passport.deserializeUser(async (userId, done) => {
    try {
        const user = await findUserById(userId);

        if (!user) {
            return done(null, false);
        }

        return done(null, {
            userId: user.userId,
            username: user.username
        });
    } catch (err) {
        return done(err);
    }
});

export default passport;