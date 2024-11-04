import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { addItem, deleteItem, getAllItems, getBorrowedItems, getItem, getLendedItems, getSaleItems, rentItem, returnItem, updateItem } from "../controllers/item.js";


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


router.post("/return/:itemid", isAuthenticated, returnItem);


export default router;