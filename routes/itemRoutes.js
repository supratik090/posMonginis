const express = require("express");
const {
  getItemController,
  addItemController,
  postItemController,
  editItemController,
  deleteItemController,
  addInventoryController,
  editInventoryController,
  deleteInventoryController,
  getInventoryController,
} = require("./../controllers/itemControllers");

const router = express.Router();

//routes
//Method - get
router.get("/get-item", getItemController);

//MEthod - POST
router.post("/add-item", addItemController);


//MEthod - POST
router.post("/post-item", postItemController);


//MEthod - POST
router.post("/post-inventory", addInventoryController);


//MEthod - POST
router.post("/post-edit-inventory", editInventoryController);

router.get("/get-inventory", getInventoryController);

//MEthod - POST
router.post("/post-delete-inventory", deleteInventoryController);

//method - PUT
router.put("/edit-item",    editItemController);

//method - DELETE
router.post("/delete-item", deleteItemController);

module.exports = router;