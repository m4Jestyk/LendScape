import jwt from "jsonwebtoken";

const tokenhelper = (userId, res) => {
    const token = jwt.sign({ userId }, "lendscapekey", { expiresIn: "15d" });

    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 24 * 60 * 60 * 1000,
        path: "/"
    });
};

export default tokenhelper;