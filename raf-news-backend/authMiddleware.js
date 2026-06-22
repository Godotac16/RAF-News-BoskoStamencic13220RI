const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

    console.log("=================================");
    console.log("AUTH HEADER:");
    console.log(req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        console.log("Nema Authorization headera");

        return res.status(401).json({
            message: "Nema tokena"
        });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:");
    console.log(token);

    try {

        const decoded =
            jwt.verify(token, "moja_tajna_sifra");

        console.log("TOKEN VALIDAN:");
        console.log(decoded);

        req.user = decoded;

        next();

    } catch (err) {

        console.log("JWT GRESKA:");
        console.log(err);

        return res.status(401).json({
            message: "Neispravan token"
        });
    }
}

module.exports = authMiddleware;