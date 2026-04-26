const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then(async (result) => {
    console.log("Connected to DB");
    await initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany();
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: '69df57606c43558f4926d0be',
  }));
  await Listing.insertMany(initData.data);
  console.log("data inserted successfully");
};
