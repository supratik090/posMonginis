const express = require("express");
const {
  addBillsController,
  getBillsController,
  addReturnsController,
  getTop20ReturnedItems,
  addCustomer,
  getCustomer,
  updateCustomerNotes,
  getTotalMonthlySales,
  getDailySalesByCategory,
  getTop20SalesItems,
  getDailySalesTrend,
  addReceiptsController,
  getTotalMonthlyReceipts,
  getCustomCakeSales,
  getDailyReturnByCategory,
  getTodaysReturns,
} = require("./../controllers/billsController");

const router = express.Router();

//routes

//MEthod - POST
router.post("/add-bills", addBillsController);

//MEthod - GET
router.get("/get-bills", getBillsController);

//MEthod - POST
router.post("/add-return", addReturnsController);

//MEthod - GET
router.get("/get-top20-returns", getTop20ReturnedItems);
router.get("/total-return-category", getDailyReturnByCategory);
router.get("/get-todays-returns", getTodaysReturns);

//MEthod - POST
router.post("/add-ros-receipts", addReceiptsController);


//MEthod - POST
router.post("/add-customer", addCustomer);
//MEthod - GET
router.get("/get-customer", getCustomer);

// Update Customer Notes
router.put("/editCustomer/:id", updateCustomerNotes);

// analytics get total sales
router.get("/total-sales", getTotalMonthlySales);

// analytics get total sales
router.get("/total-receipts", getTotalMonthlyReceipts);


router.get("/total-sales-category", getDailySalesByCategory);

router.get("/total-sales-customCake", getCustomCakeSales);


router.get("/top-products",getTop20SalesItems);

router.get("/5minLineChart",getDailySalesTrend);



module.exports = router;