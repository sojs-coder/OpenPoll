const { MongoClient } = require('mongodb'); 
const uri = "mongodb+srv://sojs:"+process.env.mongo_p+"@cluster0.h7jvr99.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);
const db = client.db("openpolls");
const polls = db.collection("polls");
const options = db.collection("options");


module.exports = {
  db, polls, options
}