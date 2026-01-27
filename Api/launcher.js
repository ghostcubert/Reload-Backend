const express = require("express");
const app = express.Router();
const User = require("../model/user.js");
const log = require("../structs/log.js");
const bcrypt = require("bcrypt");

//Api for launcher login (If u want a POST requesto just replace "app.get" to "app.post" and "req.query" to "req.body")
app.get("/api/launcher/login", async (req, res) => {
    const { email, password } = req.query;

    if (!email || !password) return res.status(400).send('Missing email or password.');

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send('User not found.');

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).send('Invalid password.');

        let avatarHash = null;
        try {
            if (user.discordId) {
                const discordUser = await req.client.users.fetch(user.discordId);
                avatarHash = discordUser.avatar;
            }
        } catch (discordErr) {
            log.error('Discord Fetch Error:', discordErr.message);
        }

        return res.status(200).json({
            username: user.username,
            discordId: user.discordId,
            avatarHash: avatarHash
        });

    } catch (err) {
        log.error('Launcher Api Error:', err);
        return res.status(500).send('Internal Server Error');
    }
});
module.exports = app;