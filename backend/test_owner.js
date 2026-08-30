const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const oldOwner = await User.findById('5a742f2853c6ad4e2d625ea1');
    console.log("Old Owner Found:", oldOwner);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
