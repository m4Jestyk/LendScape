import mongoose from "mongoose";
import Item from "../models/item.js";
import { User } from "../models/user.js";
import {v2 as cloudinary} from "cloudinary";

export const addItem = async (req, res) => {

    const userId = req.user._id;


    const { name, category, priceByTenure, age, description, condition } = req.body;

    let { imgUrl } = req.body;

    console.log(imgUrl);

    try {
        if (imgUrl) {
            const uploadedResponse = await cloudinary.uploader.upload(imgUrl);
            imgUrl = uploadedResponse.secure_url;
            console.log(uploadedResponse);
        }
    } catch (error) {
        console.log("Error while uploading the photo :: ", error);
    }
    
    


    const item = await Item.create({
        name,
        category,
        priceByTenure,
        age,
        description,
        condition,
        imgUrl,
        sellerID: userId,
        timesRented : 0
    })

    await item.save();

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

    // Find the borrowing user
    const borrowUser = await User.findById(userId);
    if (!borrowUser) {
        return res.json({
            success: false,
            message: "Borrowing user not found in DB"
        });
    }

    // const itemId = req.params.itemid;
    const itemId = await req.body.itemid;

    console.log(req.itemid);
    // Find the item to be rented
    const item = await Item.findById(itemId);
    if (!item) {
        return res.json({
            success: false,
            message: "Item not found"
        });
    }

    // Check if the borrowing user is trying to rent their own item
    if (item.sellerID.toString() === userId.toString()) {
        return res.json({
            success: false,
            message: "You cannot rent your own item"
        });
    }

    // Find the lending user (seller of the item)
    const lendUser = await User.findById(item.sellerID);
    if (!lendUser) {
        return res.json({
            success: false,
            message: "Lend user not found in DB"
        });
    }

    // Remove the item from itemsOnSale for the lending user
    lendUser.itemsOnSale = lendUser.itemsOnSale.filter(
        thisItem => thisItem._id.toString() !== itemId
    );

    // Mark the item as unavailable for rent
    item.availableToRent = false;
    await item.save();

    // Create item details to record in both borrower's itemsBorrowed and lender's itemsLended
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

    // Add item to borrower's itemsBorrowed list with the borrow date
    borrowUser.itemsBorrowed.push({
        ...itemDetails,
        dateBorrowed: new Date(),
    });

    // Add item to lender's itemsLended list with the lend date
    lendUser.itemsLended.push({
        ...itemDetails,
        dateLended: new Date(),
    });

    // Save updates to both users
    await borrowUser.save();
    await lendUser.save();

    return res.status(200).json({
        success: true,
        message: "SOLD!!"
    });
};


// Return Item
// export const returnItem = async (req, res) => {

//     //ADD FEATURE OF PROFIT CALCULATION!!!

//     const userId = req.user._id;

//     const borrowUser = await User.findById(userId);

//     if (!borrowUser) {
//         return res.json({
//             success: false,
//             message: "Borrowing user not found in DB"
//         });
//     }

//     // const itemId = req.params.itemid;

//     const itemId = req.body.itemid;
//     console.log(itemId);

//     const item = await Item.findById(itemId);

//     if (!item) {
//         return res.json({
//             success: false,
//             message: "Item not found"
//         });
//     }

//     item.availableToRent = true;

//     const lendUser = await User.findById(item.sellerID);

//     if (!lendUser) {
//         return res.json({
//             success: false,
//             message: "Lend User not found in DB"
//         });
//     }

//     if (typeof item.timesRented !== 'number' || isNaN(item.timesRented)) {
//         item.timesRented = 0; // Initialize to 0 if not a number
//     }

//     // Increment timesRented when the item is returned
//     item.timesRented += 1;
//     await item.save();

//     // Updated item details after incrementing timesRented
//     const itemDetails = {
//         itemId: item._id,
//         name: item.name,
//         category: item.category,
//         priceByTenure: item.priceByTenure,
//         age: item.age,
//         description: item.description,
//         condition: item.condition,
//         stars: item.stars,
//         timesRented: item.timesRented,   // Updated count
//         availableToRent: item.availableToRent
//     };

//     // Add the item back to itemsOnSale
//     lendUser.itemsOnSale.push(itemDetails);

//     // Remove the item from itemsBorrowed for the borrowing user
//     borrowUser.itemsBorrowed = borrowUser.itemsBorrowed.filter(
//         thisItem => thisItem.itemId.toString() !== itemId
//     );

//     // Remove the item from itemsLended for the lending user
//     lendUser.itemsLended = lendUser.itemsLended.filter(
//         thisItem => thisItem.itemId.toString() !== itemId
//     );

//     await borrowUser.save();
//     await lendUser.save();

//     return res.status(200).json({
//         success: true,
//         message: "Item returned!"
//     });
// };

export const returnItem = async (req, res) => {
    const userId = req.user._id;
    const borrowUser = await User.findById(userId);

    if (!borrowUser) {
        return res.json({
            success: false,
            message: "Borrowing user not found in DB"
        });
    }

    const itemId = req.body.itemid;
    console.log("Item ID received:", itemId);

    let item;
    try {
        const objectId = new mongoose.Types.ObjectId(itemId);
        console.log("Converted ObjectId:", objectId);
        item = await Item.findById(objectId);
    } catch (error) {
        console.error("Error converting itemId to ObjectId:", error);
        return res.json({
            success: false,
            message: "Invalid item ID format"
        });
    }


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


export const getItemByCategory = async (req, res) => {
    try {
      const { category } = req.body; // Get the category from the request body
  
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }
  
      // Search for items where the category matches the provided keyword
      const items = await Item.find({ category: { $regex: category, $options: "i" } });
  
      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No items found for the given category",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Items found",
        items,
      });
    } catch (error) {
      console.error("Error in getItemByCategory :: ", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching items",
      });
    }
  };


export const getItemByName = async (req, res) => {
    try {
      const { label } = req.body; 
  
      if (!label) {
        return res.status(400).json({
          success: false,
          message: "Label is required",
        });
      }
  
      const items = await Item.find({ name: { $regex: label, $options: "i" } });
  
      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No items found for the given category",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Items found",
        items,
      });
    } catch (error) {
      console.error("Error in getItemByName :: ", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching items",
      });
    }
  };


export const feedback = async(req, res) => {
    const {stars} = req.body;

    try {
        const {itemId} = req.body;

        let item = await Item.findById(itemId);

        if (!item) return res.status(400).json({ error: "Item not found" });

        const prevStars = item.stars;

        const updatedStars = Math.floor((prevStars + stars)/2);

        console.log(`${prevStars} + ${stars} / 2`);

        item.stars = updatedStars;

        item = await item.save();

        res.status(200).json({
            success: true,
            message: "Successfully updated stars",
            item
        })
    } catch (error) {
        console.log("Error in stars :: ", error);
        res.status(500);
    }
}

export const likeItem = async (req, res) => {
    try {
        console.log("HIT================")
        const itemId = req.body.itemId; // Extract itemId from the request body
        if (!itemId) {
            console.log("id not found")
            return res.status(400).json({ success: false, message: "Item ID is required." });
        }

        // const item = await Item.findById(itemId);

        const objectId = new mongoose.Types.ObjectId(itemId);
        console.log("Converted ObjectId:", objectId);
        const item = await Item.findById(objectId);
        
        if (!item) {
            console.log("Item not found");
            return res.status(404).json({ success: false, message: "Item not found." });
        }

        item.numberLiked = (item.numberLiked || 0) + 1; // Increment numberLiked
        await item.save();

        res.status(200).json({ success: true, message: "Item liked successfully.", item });
    } catch (error) {
        console.error("Error in likingItem:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const dislikeItem = async (req, res) => {
    try {
        const { itemId } = req.body; // Extract itemId from the request body
        if (!itemId) {
            return res.status(400).json({ success: false, message: "Item ID is required." });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found." });
        }

        item.numberDisliked = (item.numberDisliked || 0) + 1; // Increment numberDisliked
        await item.save();

        res.status(200).json({ success: true, message: "Item disliked successfully.", item });
    } catch (error) {
        console.error("Error in dislikingItem:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

  
