import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { addItem, getBorrowedItems, getItem, getLendedItems, getSaleItems, rentItem, returnItem, updateItem } from "../controllers/item.js";


const router = express.Router();

router.post("/add", isAuthenticated, addItem);

router.put("/update/:itemid", isAuthenticated, updateItem);

router.get("/get/:itemid", getItem);

router.get("/getlendeditems/:userid", getLendedItems);

router.get("/getsaleitems/:userid", getSaleItems);

router.get("/getborroweditems/:userid", getBorrowedItems);

router.post("/rentitem/:itemid", isAuthenticated, rentItem);

router.post("/return/:itemid", isAuthenticated, returnItem);


export default router;