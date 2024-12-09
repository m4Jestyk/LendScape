import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
 
export const isAuthenticated = async (req, res, next) => { 

    try {
        const token = req.cookies.jwt;
        // console.log(req);
        // console.log("TOKEN =====", token);

        if(!token){
            console.log("Token not found")
            return res.status(401).json({message: "Unauthorised User"})
        }

        // console.log("Found token");

        const decoded = jwt.verify(token, "lendscapekey");


        const user = await User.findById(decoded.userId).select("-password");

        req.user = user;

        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
		console.log("Error in auth middleware: ");
    }

}