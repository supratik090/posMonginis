const itemModel = require("../models/itemModels");
const inventoryModel = require("../models/inventoryModels");

// get items
const getItemController = async (req, res, next) => {
    try {
      const items = await itemModel.find().lean();

         // 1. Aggregate inventory quantities grouped by code
          const inventorySums = await inventoryModel.aggregate([
            {
              $group: {
                _id: "$code",                  // Group by the code field
                totalQuantity: { $sum: "$quantity" }  // Sum all quantities for that code
              }
            }
          ]);
           const inventoryLookup = {};
              inventorySums.forEach(inv => {
                inventoryLookup[inv._id] = inv.totalQuantity;
              });
              console.log("Inventory Lookup:", inventoryLookup);

  // Update each item: if a matching code is found in the inventory, update the quantity.
    const updatedItems = items.map(item => {
      if (item.code && inventoryLookup[item.code] !== undefined) {
        return { ...item, quantity: inventoryLookup[item.code] };
      }
      return item;
    });
//    console.log("Output ,", updatedItems)
    updatedItems.sort((a, b) => b.quantity - a.quantity);
    res.status(200).json(updatedItems);

//    res.status(200).json(items);
    } catch (error) {
      console.error(error);
      next(error); // pass the error to the error handler middleware
    }
  };
  

//add items
const addItemController = async (req, res, next) => {
    try {
      const newItem = await itemModel.create(req.body);
      res.status(201).send("Item created successfully!");
    } catch (error) {
      console.error(error);
      next(error); // pass the error to the error handler middleware
    }
  };

//add items if not present n collection
const postItemController = async (req, res, next) => {
 try {

    console.log(req.body);
     const  itemData= req.body;
    const updatedItem = await itemModel.findOneAndUpdate(
      { code: itemData.code }, // Find by unique code
      { $set: itemData }, // Update existing fields
      { upsert: true, new: true } // Insert if not found, return updated doc
    );

    console.log("Item updated or inserted:", updatedItem);
      res.status(200).send("Item updated successfully!");

  } catch (error) {
    console.error("Error updating/inserting item:", error);
  }
  };


//update item
const editItemController = async (req, res) => {
  try {
  console.log(req.body);
    const { itemId } = req.body;
    console.log(itemId);
    await itemModel.findOneAndUpdate({ _id: itemId }, req.body, {
      new: true,
    });

    res.status(201).json("item Updated");
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
//delete item
const deleteItemController = async (req, res) => {
  try {
    const { itemId } = req.body;
    console.log(itemId);
    await itemModel.findOneAndDelete({ _id: itemId });
    res.status(200).json("item Deleted");
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};

function addDaysToDate(date, daysToAdd) {
   const result = new Date(date);
     result.setDate(result.getDate() + daysToAdd-1);
     return result;
}



//add inventory
const addInventoryController = async (req, res, next) => {
    try {
    const items = await itemModel.find().lean(); // .lean() returns plain JS objects
     const itemLookup = {};
       items.forEach(item => {
         if (item.code) {
           itemLookup[item.code] = item.shelfLife;
         }
       });
        const inv = req.body;

        console.log("date", new Date())
        console.log("shelf life", itemLookup[inv.code])
        inv.returnDate =addDaysToDate(new Date(),itemLookup[inv.code]);
        console.log("updated ", inv  );
        console.log("old ", req.body  );

      const newItem = await inventoryModel.create(inv);
      res.status(200).send("Inventory created successfully!");
    } catch (error) {
      res.status(400).send(error);
      console.log(error); // pass the error to the error handler middleware
    }
  };

// get items
const getInventoryController = async (req, res, next) => {
    try {
//      const items = await inventoryModel.find();
//      res.status(200).json(items);
 const items = await itemModel.find().lean(); // .lean() returns plain JS objects
    // Get all inventory records from inventoryModel
    const inventoryItems = await inventoryModel.find().lean();

     const itemLookup = {};
       items.forEach(item => {
         if (item.code) {
           itemLookup[item.code] = item.name;
         }
       });

    // Update each item: if a matching code is found in the inventory, update the name
    const updatedItems = inventoryItems.map(item => {
      if (item.code && itemLookup[item.code]) {
        return { ...item, name: itemLookup[item.code] };
      }
      return item;
    });

    res.status(200).json(updatedItems);



    } catch (error) {
      console.error(error);
      next(error); // pass the error to the error handler middleware
    }
  };

  //delete item
  const deleteInventoryController = async (req, res) => {
    try {
      const { itemId } = req.body;
      console.log(itemId);
      await inventoryModel.findOneAndDelete({ _id: itemId });
      res.status(200).json("item Deleted");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  };

//update item
const editInventoryController = async (req, res) => {
  try {
  console.log(req.body);
    const { itemId } = req.body;
    console.log(itemId);
    await inventoryModel.findOneAndUpdate({ _id: itemId }, req.body, {
      new: true,
    });

    res.status(201).json("item Updated");
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};

module.exports = {
  getItemController,
  addItemController,
  postItemController,
  editItemController,
  deleteItemController,
  addInventoryController,
  getInventoryController,
  editInventoryController,
  addInventoryController,
  deleteInventoryController
};