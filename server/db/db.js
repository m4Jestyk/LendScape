import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect("mongodb://127.0.0.1:27017", {
        dbName: "lendscape_api"
    })
    .then(()=>{
        console.log("DB Connected")
    })
    .catch((err) => {
        console.log(err)
    })
}