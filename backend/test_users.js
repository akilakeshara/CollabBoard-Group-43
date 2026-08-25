const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ username: 'akilakeshara' });
    console.log("Users found:", users);
    
    // Also get all boards
    const Board = mongoose.model('Board', new mongoose.Schema({}, { strict: false }));
    const boards = await Board.find({});
    console.log("Boards found:", boards.length);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
