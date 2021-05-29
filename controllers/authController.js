const User = require("../models/userModel");

const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            password: hashPassword,
        });

        req.session.user = newUser;

        res.status(201).json({
            status: "Success",
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "Error",
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(404).json({
                status: "Error",
                message: "User not found",
            });
        }

        const isCorrect = await bcrypt.compare(password, user.password);

        if (isCorrect) {
            req.session.user = user;

            res.status(200).json({
                status: "Success",
            });
        } else {
            res.status(400).json({
                status: "Fail",
                message: "Incorrect username or password",
            });
        }
    } catch (err) {
        res.status(400).json({
            status: "Error",
            message: err.message,
        });
    }
};
