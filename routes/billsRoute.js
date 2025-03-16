const express = require("express");
const {
  addBillsController,
  getBillsController,
  addReturnsController,
  addCustomer,
  getCustomer,
  updateCustomerNotes,
  getTotalMonthlySales,
} = require("./../controllers/billsController");

const router = express.Router();

//routes

//MEthod - POST
router.post("/add-bills", addBillsController);

//MEthod - GET
router.get("/get-bills", getBillsController);

//MEthod - POST
router.post("/add-return", addReturnsController);


//MEthod - POST
router.post("/add-customer", addCustomer);
//MEthod - GET
router.get("/get-customer", getCustomer);

// Update Customer Notes
router.put("/editCustomer/:id", updateCustomerNotes);

// analytics get total sales
router.get("/total-sales", getTotalMonthlySales);

router.get("/total-sales-category", getDailySalesByCategory);



module.exports = router;