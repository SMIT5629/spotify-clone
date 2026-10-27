const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")
const uploadFile = require("../services/storage.service")

const JWT_SECRET = process.env.JWT_SECRET || "spotify_jwt_secret_token_key_2026";

async function RegisterUser(req, res) {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }
        const isUserExist = await userModel.findOne({
            $or: [
                { username }, { email }]
        })
        if (isUserExist) {
            return res.status(409).json({ message: "User already exists" })
        }
        const hash = await bcryptjs.hash(password, 10)
        const user = await userModel.create({
            username,
            email,
            password: hash,
            role: role || 'user',
            avatar: req.body.avatar || ""
        })
        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, JWT_SECRET)

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar || ""
        };
        res.status(201).json({
            message: "User registered successfully", token, user: userResponse
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

async function LoginUser(req, res) {
    try {
        const { username, email, password } = req.body
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Identifier and password are required" });
        }
        const query = [];
        if (email) query.push({ email });
        if (username) query.push({ username });
        const user = await userModel.findOne({
            $or: query
        })

        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            })
        }

        const isvalidPassword = await bcryptjs.compare(password, user.password)
        if (!isvalidPassword) {
            return res.status(401).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, JWT_SECRET)

        res.cookie("token", token, { httpOnly: true, sameSite: "lax" })
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar || ""
        };
        return res.status(200).json({
            message: "Login successful", token, user: userResponse
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

async function LogoutUser(req, res) {
    res.clearCookie("token")
    res.status(200).json({
        message: "Logout successful"
    })
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { username, avatar } = req.body;
        let avatarUrl = avatar;

        if (req.file) {
            const uploadRes = await uploadFile(req.file.buffer.toString("base64"), "/spotify/avatars", "_avatar");
            avatarUrl = uploadRes.url;
        }

        const updateData = {};
        if (username && username.trim()) {
            const existing = await userModel.findOne({ username: username.trim(), _id: { $ne: userId } });
            if (existing) {
                return res.status(409).json({ message: "Username is already taken" });
            }
            updateData.username = username.trim();
        }

        if (avatarUrl !== undefined) {
            updateData.avatar = avatarUrl;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar || ""
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
}

module.exports = { RegisterUser, LoginUser, LogoutUser, getMe, updateProfile }
