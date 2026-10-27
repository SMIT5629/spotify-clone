const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "spotify_jwt_secret_token_key_2026";

function getToken(req) {
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
}

async function authArtist(req, res, next) {
    const token = getToken(req)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (decoded.role !== "artist") {
            return res.status(403).json({ message: "Only artists can perform this action" })
        }
        req.user = decoded
        return next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: "Unauthorized" })
    }
}

async function authUser(req, res, next) {
    const token = getToken(req)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (decoded.role !== "user" && decoded.role !== "artist") {
            return res.status(403).json({ message: "you don't have access to this resource" })
        }
        req.user = decoded
        return next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: "Unauthorized" })
    }
}

async function optionalAuth(req, res, next) {
    const token = getToken(req)
    if (!token) {
        req.user = null
        return next()
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
    } catch (error) {
        req.user = null
    }
    return next()
}

module.exports = {
    authArtist,
    authUser,
    optionalAuth,
    getToken
}