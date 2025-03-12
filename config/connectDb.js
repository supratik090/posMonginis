const mongoose = require("mongoose");
const colors = require("colors");

const connectDb = async () => {
  try {
  process.env.DB_URL="mongodb+srv://houseofsupr:m0JyvZmxsEKi4CMK@clusterhos.4ifj7.mongodb.net/database"

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Server running on ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.error(`Error connecting to database: ${error}`.bgRed);
    process.exit(1); // Exit the process with an error code
  }
};

module.exports = connectDb;