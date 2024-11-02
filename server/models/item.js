import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
        },
        priceByTenure: {
            type: Number,
        },
        age: {
            type: Number
        },
        description: {
            type: String
        },
        availableToRent: {
            type: Boolean,
            default: true
        },
        timesRented: {
            type: Number
        },
        condition:{
            type: Number
        },
        sellerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stars: {
            type: Number,
            default: 0
        },
        reviews: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                title: {
                    type: String
                },
                description: {
                    type: String
                }
            }
        ]
    }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;