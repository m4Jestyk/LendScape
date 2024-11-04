import mongoose from "mongoose";


const userSchema = mongoose.Schema(
    {
        name: {
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
        contactNumber: {
            type: Number,
            required: true,
        },
        totalEarning: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        itemsOnSale: [
            {
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
                name: String,
                category: String,
                priceByTenure: Number,
                age: Number,
                description: String,
                condition: Number,
                stars: Number,
                timesRented: Number
            }
        ],
        itemsLended: [
            {
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
                name: String,
                category: String,
                priceByTenure: Number,
                age: Number,
                description: String,
                condition: Number,
                stars: Number,
                timesRented: Number,
                dateLended: Date,
            }
        ],
        itemsBorrowed: [
            {
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
                name: String,
                category: String,
                priceByTenure: Number,
                age: Number,
                description: String,
                condition: Number,
                stars: Number,
                timesRented: Number,
                dateBorrowed: Date,
            }
        ]
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);
