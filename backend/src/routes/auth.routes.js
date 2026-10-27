const express = require('express');
const router = express.Router();
const authControllers = require("../controllers/auth.controllers")
const { authUser } = require("../middlewares/auth")
const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage()
})

router.post("/register", authControllers.RegisterUser)
router.post("/login", authControllers.LoginUser)
router.post("/logout", authControllers.LogoutUser)
router.get("/me", authUser, authControllers.getMe)
router.patch("/profile", authUser, upload.single("avatar"), authControllers.updateProfile)

module.exports = router;