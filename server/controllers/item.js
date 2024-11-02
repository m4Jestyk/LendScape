import mongoose from "mongoose";
import Item from "../models/item.js";
import { User } from "../models/user.js";

export const addItem = async (req, res) => {
    const userId = req.user._id;

    console.log("User id is =========", userId);

    const { name, category, priceByTenure, age, description, condition } = req.body;

    const item = await Item.create({
        name,
        category,
        priceByTenure,
        age,
        description,
        condition,
        sellerID: userId
    })

    item.save();

    console.log("Item created");

    let user;

    user = await User.findById(userId);

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    user.itemsOnSale.push(item);

    user.save();

    return res.json({
        success: true,
        message: "Item published"
    })
}

export const updateItem = async (req, res) => {
    const userId = req.user._id;

    console.log("Logged in user ===", userId);

    const itemId = req.params.itemid;

    const { name, category, priceByTenure, age, description, condition } = req.body;

    const item = await Item.findById(itemId);

    console.log("Item id ==== ", itemId);

    if (!item) {
        return res.json({
            success: false,
            message: "Item not found"
        })
    }


    if (item.sellerID.toString() !== userId.toString()) {
        return res.json({
            success: false,
            message: "You cannot update someone else's item"
        })
    }

    item.name = name || item.name;
    item.category = category || item.category;
    item.priceByTenure = priceByTenure || item.priceByTenure;
    item.age = age || item.age;
    item.description = description || item.description;
    item.condition = condition || item.condition;

    item.save();

    return res.status(200).json({
        success: true,
        item
    })
}

export const getAllItems = async (req, res) => {
    const items = await Item.find();
    return res.json({
        items
    })
}


//Remove item from sale
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemid;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.json({
                success: false,
                message: "Item not found"
            })
        }

        await Item.findByIdAndDelete(itemId);

        await User.updateMany(
            {},
            {
                $pull: {
                    itemsOnSale: itemId,
                    itemsLended: itemId,
                    itemsBorrowed: itemId
                }
            }
        );

        return res.json({
            success: true,
            message: "Item removed"
        })

    } catch (error) {
        console.log("Error in removing item :: " + error);
    }
}

//getItem
export const getItem = async (req, res) => {
    try {
        const itemId = req.params.itemid;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.json({
                success: false,
                message: "Item not found"
            })
        }

        return res.json({
            success: true,
            message: "Item found",
            item
        })
    } catch (error) {
        console.log("Error in getting item :: ", error);
    }
}

//retrieve all items on sale

export const getSaleItems = async (req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    console.log(user.itemsOnSale);

    return res.status(200).json({
        success: true,
        itemsOnSale: user.itemsOnSale
    })
}

//retrieve all lended items

export const getLendedItems = async (req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    console.log(user.itemsLended);

    return res.status(200).json({
        success: true,
        itemsLended: user.itemsLended
    })
}


//retrieve all borrowed items

export const getBorrowedItems = async (req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if (!user) {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    console.log(user.itemsBorrowed);

    return res.status(200).json({
        success: true,
        itemsBorrowed: user.itemsBorrowed
    })
}


//borrow item <-> lend item

export const rentItem = async (req, res) => {

    const userId = req.user._id;

    const borrowUser = await User.findById(userId);

    if (!borrowUser) {
        return res.json({
            success: false,
            message: "Borrowing user not found in DB"
        });
    }

    const itemId = req.params.itemid;

    const item = await Item.findById(itemId);

    if (!item) {                                           //ADD A CHECK TO SEE IF PRESENT IN SALEiTEMS
        return res.json({
            success: false,
            message: "Item not found"
        });
    }

    const lendUser = await User.findById(item.sellerID);

    if (!lendUser) {
        return res.json({
            success: false,
            message: "Lend User not found in DB"
        });
    }


    // Remove the item from itemsOnSale
    lendUser.itemsOnSale = lendUser.itemsOnSale.filter(
        thisItem => thisItem._id.toString() !== itemId
    );

    item.availableToRent = false;

    item.save();


    // Append the item details to itemsBorrowed for the borrowing user
    const itemDetails = {
        itemId: item._id,
        name: item.name,
        category: item.category,
        priceByTenure: item.priceByTenure,
        age: item.age,
        description: item.description,
        condition: item.condition,
        stars: item.stars,
        timesRented: item.timesRented,
        availableToRent: item.availableToRent,
    };

    borrowUser.itemsBorrowed.push({
        ...itemDetails,
        dateBorrowed: new Date(),
    });

    // Append the item details to itemsLended for the lending user
    lendUser.itemsLended.push({
        ...itemDetails,
        dateLended: new Date(),
    });

    await borrowUser.save();
    await lendUser.save();

    return res.status(200).json({
        success: true,
        message: "SOLD!!"
    });
};

// Return Item
export const returnItem = async (req, res) => {

    //ADD FEATURE OF PROFIT CALCULATION!!!

    const userId = req.user._id;

    const borrowUser = await User.findById(userId);

    if (!borrowUser) {
        return res.json({
            success: false,
            message: "Borrowing user not found in DB"
        });
    }

    const itemId = req.params.itemid;

    const item = await Item.findById(itemId);

    if (!item) {
        return res.json({
            success: false,
            message: "Item not found"
        });
    }

    item.availableToRent = true;

    const lendUser = await User.findById(item.sellerID);

    if (!lendUser) {
        return res.json({
            success: false,
            message: "Lend User not found in DB"
        });
    }

    if (typeof item.timesRented !== 'number' || isNaN(item.timesRented)) {
        item.timesRented = 0; // Initialize to 0 if not a number
    }

    // Increment timesRented when the item is returned
    item.timesRented += 1;
    await item.save();

    // Updated item details after incrementing timesRented
    const itemDetails = {
        itemId: item._id,
        name: item.name,
        category: item.category,
        priceByTenure: item.priceByTenure,
        age: item.age,
        description: item.description,
        condition: item.condition,
        stars: item.stars,
        timesRented: item.timesRented,   // Updated count
        availableToRent: item.availableToRent
    };

    // Add the item back to itemsOnSale
    lendUser.itemsOnSale.push(itemDetails);

    // Remove the item from itemsBorrowed for the borrowing user
    borrowUser.itemsBorrowed = borrowUser.itemsBorrowed.filter(
        thisItem => thisItem.itemId.toString() !== itemId
    );

    // Remove the item from itemsLended for the lending user
    lendUser.itemsLended = lendUser.itemsLended.filter(
        thisItem => thisItem.itemId.toString() !== itemId
    );

    await borrowUser.save();
    await lendUser.save();

    return res.status(200).json({
        success: true,
        message: "Item returned!"
    });
};

