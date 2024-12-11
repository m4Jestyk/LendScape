import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { addItem, deleteItem, dislikeItem, feedback, getAllItems, getBorrowedItems, getItem, getItemByCategory, getItemByName, getLendedItems, getSaleItems, likeItem, rentItem, returnItem, updateItem } from "../controllers/item.js";


const router = express.Router();

router.post("/add", isAuthenticated, addItem);

// router.post("/rentitem/:itemid", isAuthenticated, rentItem);

router.post("/rentitem", isAuthenticated, rentItem);


router.get("/allitems", getAllItems);

router.put("/update/:itemid", isAuthenticated, updateItem);

router.delete("/delete/:itemid", isAuthenticated, deleteItem);

router.get("/get/:itemid", getItem);

router.get("/getlendeditems/:userid", getLendedItems);

router.get("/getsaleitems/:userid", getSaleItems);

router.get("/getborroweditems/:userid", getBorrowedItems);

router.post("/getbycategory", getItemByCategory);

router.post("/getbylabel", getItemByName);

router.post("/return", isAuthenticated, returnItem);

router.put("/feedback", feedback);

router.post("/like", likeItem);;

router.post("/dislike", dislikeItem);


export default router;