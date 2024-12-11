import { User } from "../models/user.js";
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import tokenhelper from "../utils/tokenhelper.js";
import jwt from "jsonwebtoken";


export const createUser = async (req, res) => {
    try {
        const { name, email, contactNumber, username, password } = req.body;

        console.log(name);

        let user = await User.findOne({ $or: [{ email }, { username }] })

        if (user) {
            return res.json({
                error: "User already exists",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
            contactNumber
        })

        await user.save();

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                contactNumber: user.contactNumber,
            })
        } else {
            res.status(400).json({ error: "Invalid user details" })
        }

    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    const isPwCorrect = await bcrypt.compare(password, user.password || "");

    if (!isPwCorrect) {
        return res.json({
            success: false,
            message: "Wrong password"
        })
    }

    tokenhelper(user._id, res);

    res.status(200).json({
        success: true,
        message: "logged in",
        name: user.name,
        _id: user._id,
        email: user.email,
        username: user.username,
    })
}

export const logout = async (req, res) => {
    try {

        res.clearCookie('jwt');

        return res.json({
            success: true,
            message: "Logged out",
        });
    } catch (error) {
        console.log("Error during logout", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during logout.",
        });
    }
};


export const getProfile = async (req, res, next) => {
    //WE WILL FETCH USER USING EITHER USERID OR USERNAME
    //  query CAN BE EITHER USERID OR USERNAME      
    const { query } = req.params;
    try {

        let user;

        //query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt")
        } else {
            //query is a username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt")
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res, next) => {
    const { name, email, username, password } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);

        if (!user) return res.status(400).json({ error: "User not found" });

        if (req.params.id != userId.toString())
            return res
                .status(400)
                .json({ error: "You cant update others' profile" });

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;

        user = await user.save();

        user.password = null;        //Password should be null in response

        res.status(200).json({ message: "Profile updated succesfully", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
        console.log("Error in updateUser: ", err.message);
    }
};

export const deleteProfile = async (req, res) => {
    const { email, password } = req.body;
    const userId = req.user._id;

    try {

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("useridparam = ", userId);
        console.log("userIdfound = ", user._id);


        if (user._id.toString() != userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete someone else's account"
            });
        }


        if (!bcrypt.compare(password, user.password)) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }


        await User.findByIdAndDelete(user._id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error in delete user endpoint :: ", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        });
    }
};


export const getName = async (req, res) => {          //TO BE SEEN
    try {
        // const { userId } = req.body;
        const userId = req.params.userid;

        const objectId = new mongoose.Types.ObjectId(userId);

        console.log(objectId);

        const user = await User.findById(objectId);

        console.log(user);



        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        console.log("Reached here...");

        return res.json({
            success: true,
            message: "User found",
            user
        });
    } catch (error) {
        console.error("Error in getting user :: ", error);
        return res.json({
            success: false,
            message: "Error in processing request"
        });
    }
};
