import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            minLength: 6,
            required: true,
        },
        itemsOnSale:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
           } 
        ],
        itemsLended:[
           {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
           } 
        ],
        itemsBorrowed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ]
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);