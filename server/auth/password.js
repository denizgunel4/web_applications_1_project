import crypto from "crypto";

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        // convert binary data to hex string
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, calculatedSaltedPsw) => {
            if (err) {
                reject(err);
                return;
            }

            const saltedPassword = calculatedSaltedPsw.toString("hex");

            resolve({
                saltedPassword,
                salt
            });
        });
    });
}

function verifyPassword(password, salt, saltedPassword) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, calculatedSaltedPsw) => {
            if (err) {
                reject(err);
                return;
            }

            const storedSaltedPsw = Buffer.from(saltedPassword, "hex");

            if (calculatedSaltedPsw.length !== storedSaltedPsw.length) {
                resolve(false);
                return;
            }

            resolve(crypto.timingSafeEqual(calculatedSaltedPsw, storedSaltedPsw));
        });
    });
}

export { hashPassword, verifyPassword };