import jwt from "jsonwebtoken";

// const tokenhelper = (userId, res) => {
//     const token = jwt.sign({ userId }, "lendscapekey", { expiresIn: "15d" });

//     res.cookie("jwt", token, {
//         httpOnly: true,
//         sameSite: "strict",
//         maxAge: 15 * 24 * 60 * 60 * 1000,
//         path: "/"
//     });
// };

const tokenhelper = (userId, res) => {
    const token = jwt.sign({userId}, "lendscapekey", {
        expiresIn: "15d",
    });

    res.cookie("jwt", token, {
        httpOnly: true, //for more security
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
		sameSite: "strict", // CSRF
    });

    return token;
}

export default tokenhelper;