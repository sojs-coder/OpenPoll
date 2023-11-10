const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require("cors");
const nunjucks = require("nunjucks")
const { latlongIP } = require("./helpers.js")
const { createPoll, getPolls, addVote, getPollByID, getPollsSafe } = require("./database.js")

const app = express();
const port = 3000

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(session({
  secret: process.env.EXPRESS_SESSION,
  resave: true,
  saveUninitialized: true 
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

nunjucks.configure('views', {
    autoescape: true,
    express: app
});



app.get('/', (req, res) => {
  res.sendFile(__dirname+'/views/index.html');
});
app.get("/poll",async (req,res,next)=>{
  var poll = req.query.pollID;
  if(!poll) return next();
  poll = await getPollByID(poll)
  if(!poll) return next();
  res.render("pollView.html", { poll });
})
app.get("/create",async (req,res)=>{
  res.sendFile(__dirname+"/views/create.html")
})
app.post('/create',async (req, res) => {
  const { pollName, pollDes, options: pollOptions } = req.body;
  if(!pollName || !pollDes || !pollOptions){
    return res.status(401).json({ error: "Malformed request... missing either pollName, pollDescription, or options" });
  }
  try{
    var pollID = await createPoll({ pollName, pollDes, pollOptions });
    return res.status(200).json({ pollID });
  }catch(err){
    return res.status(500).send({ error: err.message });
  }
  
});
app.get("/polls",async (req,res)=>{
  try{
    var polls = await getPollsSafe();
    res.json({polls});
  }catch(err){
    return res.status(500).json({ error: err.message })
  }
});
app.post("/vote", async (req,res)=>{
  try{
    const { optionID } = req.body;
    if(!optionID) res.status(401).json({ error: "Malformed request"})
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var response = await addVote(optionID,ip);
    if(!response) return res.json({ error: "Something went wrong" });
    var { poll } =response;
    res.redirect("/poll?pollID="+poll.pollID)
  }catch(err){
    res.status(500).json({ error: err.message })
  }
});
app.post("/getPollData", async (req,res)=>{
  try{
    if(!req.body.pollID) return res.status(401).json({ error: "Malformed request" });
    var poll = await getPollByID(req.body.pollID);
    if(!poll) return res.status(404).json({ error: "Poll does not exist" })
    res.status(200).json({ poll });
  }catch(err){
    return res.status(500).json({ error: err.message })
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});