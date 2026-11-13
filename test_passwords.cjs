const mongoose = require("./server/node_modules/mongoose");
const bcrypt = require("./server/node_modules/bcryptjs");

const candidatePasswords = [
  'password123',
  '123456',
  '12345678',
  'admin',
  'admin123',
  'kenenisa',
  'kenenisa123',
  'keno',
  'testuser',
  'clientflow',
  'password'
];

mongoose.connect("mongodb://localhost:27017/clientflow").then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  for (const user of users) {
    let matched = null;
    for (const pass of candidatePasswords) {
      if (await bcrypt.compare(pass, user.password)) {
        matched = pass;
        break;
      }
    }
    console.log(`User: ${user.email} (${user.role}) => Password: ${matched ? matched : '[Custom Hash: ' + user.password.substring(0, 10) + '...]'}`);
  }
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});