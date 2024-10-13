import mongoose from "mongoose";
import Item from "../models/item.js";
import { User } from "../models/user.js";

export const addItem = async(req, res) => {
    const userId = req.user._id;

    console.log("User id is =========", userId);

    const {name, category, priceByTenure, age, description, condition} = req.body;

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

    if(!user)
    {
        return res.json({
            success: false,
            message: "User not found"
        })
    }

    user.itemsOnSale.push(item);

    user.save();

    return res.json({
        success:true,
        message:"Item published"
    })
}

export const updateItem = async(req, res) => {
    const userId = req.user._id;

    console.log("Logged in user ===", userId);

    const itemId = req.params.itemid;

    const {name, category, priceByTenure, age, description, condition} = req.body;

    const item = await Item.findById(itemId);

    console.log("Item id ==== " , itemId);

    if(!item)
    {
        return res.json({
            success: false,
            message: "Item not found"
        })
    }


    if(item.sellerID.toString() !== userId.toString())
    {
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

//getItem
export const getItem = async(req, res) => {
    const itemId = req.params.itemid;

    const item = await Item.findById(itemId);

    if(!item)
    {
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
}

//retrieve all items on sale

export const getSaleItems = async(req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if(!user)
    {
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

export const getLendedItems = async(req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if(!user)
    {
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

export const getBorrowedItems = async(req, res) => {
    const userId = req.params.userid;

    console.log(userId);

    const user = await User.findById(userId);

    if(!user)
    {
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

export const rentItem = async(req, res) => {

    const userId = req.user._id;

    const borrowUser = await User.findById(userId);

    if(!borrowUser)
    {
        return res.json({
            succses: false,
            message: "Borrowing user not found in DB"
        })
    }

    const itemId = req.params.itemid;

    const item = await Item.findById(itemId);

    if(!item)
    {
        return res.json({
            success: false,
            message: "Item not found"
        })
    }

    const lendUser = await User.findById(item.sellerID);

    if(!lendUser)
    {
        return res.json({
            success: false,
            message: "Lend User not found in DB"
        })
    }

    lendUser.itemsOnSale = lendUser.itemsOnSale.filter(
        thisItem => thisItem.toString() !== itemId
    );

    borrowUser.itemsBorrowed = [
        ...borrowUser.itemsBorrowed,
        itemId
    ];

    lendUser.itemsLended = [
        ...lendUser.itemsLended,
        itemId
    ];

    await borrowUser.save();
    await lendUser.save();

    return res.status(200).json({
        success: true,
        message: "SOLD!!"
    })
}

//returnItem


export const returnItem = async(req, res) => {

    const userId = req.user._id;

    const borrowUser = await User.findById(userId);

    if(!borrowUser)
    {
        return res.json({
            succses: false,
            message: "Borrowing user not found in DB"
        })
    }

    const itemId = req.params.itemid;

    const item = await Item.findById(itemId);

    if(!item)
    {
        return res.json({
            success: false,
            message: "Item not found"
        })
    }

    const lendUser = await User.findById(item.sellerID);

    if(!lendUser)
    {
        return res.json({
            success: false,
            message: "Lend User not found in DB"
        })
    }

    lendUser.itemsOnSale = [
        ...lendUser.itemsOnSale,
        itemId
    ]

    borrowUser.itemsBorrowed = borrowUser.itemsBorrowed.filter(
        thisItem => thisItem.toString() !== itemId
    )

    lendUser.itemsLended = lendUser.itemsLended.filter(
        thisItem => thisItem.toString() !== itemId
    )

    await borrowUser.save();
    await lendUser.save();

    return res.status(200).json({
        success: true,
        message: "returned!!"
    })
}