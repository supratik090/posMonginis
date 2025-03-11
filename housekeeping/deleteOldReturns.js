const cron = require('node-cron');
const mongoose = require('mongoose');

// ✅ Connect to MongoDB Without Timeout
mongoose.connect('mongodb+srv://houseofsupr:m0JyvZmxsEKi4CMK@clusterhos.4ifj7.mongodb.net/database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 0,
  socketTimeoutMS: 0,
}).then(async () => {
  console.log('✅ Connected to MongoDB');

  // ✅ Run Cron Job Daily at 1:30 AM
  cron.schedule('30 1 * * *', async () => {
    await updateExpiredInventory();
  });

  // ✅ Manually Trigger Cron Job Immediately After Startup
  await updateExpiredInventory();

}).catch(err => {
  console.error('❌ Failed to connect to MongoDB', err);
});

// ✅ Function to Execute Raw Aggregation Query
const updateExpiredInventory = async () => {
  console.log('✅ Cron Job Started: Running Expiry Check...');

  try {
    const itemsCollection = mongoose.connection.db.collection('items');
    const inventoriesCollection = mongoose.connection.db.collection('inventories');

    // ✅ Step 1: Run Aggregation Query
    const expiredItems = await itemsCollection.aggregate([
      {
        $lookup: {
          from: "inventories",
          localField: "code",
          foreignField: "code",
          as: "inventoryDetails"
        }
      },
      { $unwind: "$inventoryDetails" },
      {
        $addFields: {
          shelfLifeDate: {
            $toDate: {
              $add: [
                { $toLong: "$inventoryDetails.createdAt" },
                { $multiply: ["$shelfLife", 86400000] }
              ]
            }
          },
          todaysDate: {
            $dateTrunc: {
              date: new Date(),
              unit: "day"
            }
          },
          shelfLifeDayOnly: {
            $dateTrunc: {
              date: "$shelfLifeDate",
              unit: "day"
            }
          }
        }
      },
      {
        $match: {
          $expr: {
            $lt: ["$shelfLifeDayOnly", "$todaysDate"]
          }
        }
      },
      { $project: { code: 1, _id: 0 } }
    ]).toArray();

    // ✅ Step 2: Extract Expired Codes
    const expiredCodes = expiredItems.map(item => item.code);

    if (expiredCodes.length === 0) {
      console.log('✅ No expired items found today');
      return;
    }

    // ✅ Step 3: Update Inventory to Quantity 0
    const result = await inventoriesCollection.updateMany(
      {
        code: { $in: expiredCodes },
        quantity: { $gt: 0 }
      },
      {
        $set: { quantity: 0 }
      }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} expired items to quantity 0`);
  } catch (error) {
    console.error('❌ Failed to update expired items:', error);
  }
};
