require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.collection("users").updateMany(
    { isVerified: { $exists: false } },
    { $set: { isVerified: true } }
  );
  console.log("Existing users marked verified:", result.modifiedCount);
  await mongoose.disconnect();
}); 