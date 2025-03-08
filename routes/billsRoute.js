const express = require("express");
const {
  addBillsController,
  getBillsController,
  addReturnsController,
} = require("./../controllers/billsController");

const router = express.Router();

//routes

//MEthod - POST
router.post("/add-bills", addBillsController);

//MEthod - GET
router.get("/get-bills", getBillsController);

//MEthod - POST
router.post("/add-return", addReturnsController);



module.exports = router;