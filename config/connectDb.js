const mongoose = require("mongoose");
const colors = require("colors");


const connectDb = async () => {
  try {
    // Get current DB env name
    const currentDbEnv = process.env.CURRENT_DB;

    if (!currentDbEnv) {
      throw new Error("CURRENT_DB environment variable not set");
    }

    // Get actual DB URI from that env name (e.g., process.env["R3701"])
    const dbUrl = process.env[currentDbEnv];

    if (!dbUrl) {
      throw new Error(`Environment variable '${currentDbEnv}' is not defined`);
    }

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Connected to MongoDB: ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`.bgRed);
    process.exit(1);
  }
};
module.exports = connectDb;