const { db, polls, options } = require("./m_connect.js");
const { guid, latlongIP } = require("./helpers.js")

async function getPoll(pollID){
  try{
    const poll = await polls.findOne({ pollID });
    return poll;
  }catch(err){
    throw err;
  }
}
async function getOption(optionID){
  try{
    const option = await options.findOne({ optionID });
    return option;
  }catch(err){
    throw err;
  }
}
async function getPolls(){
  try{
    const p = await polls.find().toArray();
    return p;
  }catch(err){
    throw err;
  }
}
async function getPollsSafe(){
  var polls = await getPolls();
  // remove the voted_ips field
  polls = polls.map(poll=>{
    delete poll.voted_ips;
    return poll;
  });
  return polls;
}
async function getPollFromOptionID(optionID){
  try{
    const poll = await polls.findOne({ "pollOptions.optionID": optionID });
    return poll;
  }catch(err){
    throw err;
  }
}
async function getPollByID(pollID){
  try {
    const poll = await polls.aggregate([
      { $match: { pollID } },
      { $unwind: "$pollOptions" },
      {
        $lookup: {
          from: "options",
          localField: "pollOptions.optionID",
          foreignField: "optionID",
          as: "pollOptions.option"
        }
      },
      {
        $addFields: {
          "pollOptions.option": { $arrayElemAt: ["$pollOptions.option", 0] }
        }
      },
      {
        $group: {
          _id: "$_id",
          pollID: { $first: "$pollID" },
          pollName: { $first: "$pollName" },
          pollDes: { $first: "$pollDes" },
          pollOptions: { $push: "$pollOptions" }
        }
      }
    ]).toArray();
  
    return poll.length > 0 ? poll[0] : null;
  } catch (err) {
    throw err;
  }
}
  
async function addVote(optionID,ip){
  try{
    const poll = await getPollFromOptionID(optionID);
    if(!poll) return { error: "Poll not found" }
    const option = await getOption(optionID);
    if(poll.voted_ips.indexOf(ip) !== -1) return { error: "IP adress has already voted" }
    if(!option) return { error: "Option does not exist"};
    option.votes++;
    
    var location = latlongIP(ip);
    option.voted_ips.push(location);
    poll.voted_ips.push(ip);
    await polls.updateOne({ pollID: poll.pollID }, { $set: { voted_ips: poll.voted_ips } });
    await options.updateOne({ optionID }, { $set: option });
    return { option, poll };
  }catch(err){
    throw err;
  }
}
async function createPoll({pollName, pollDes,pollOptions}){
  try{
    var possibleColors = ["#37FA68","#FA3742","#FACE37","#364DFA","#FAF537"];
    const pollID = guid();
    let f_options = [];
    for(var i = 0; i < pollOptions.length; i++){
      if(i > 4) return { error: "Too many options" };
      var pollOption = pollOptions[i];
      const optionID = guid();
      const option = await getOption(optionID);
      if (option){
        throw new Error("Option already exists");
      }
      await options.insertOne({
        optionID,
        optionContent: pollOption,
        voted_ips: [],
        votes: 0,
        color: possibleColors[i]
      });
      f_options.push({
        optionID,
        optionContent: pollOption
      })
    }
    const poll = {
      pollID,
      pollName,
      pollDes,
      pollOptions: f_options,
      voted_ips: []
    }
    await polls.insertOne(poll);
    return pollID;
  }catch(err){
    throw err;
  }
}

module.exports = { getPoll, getOption, createPoll, getPolls, addVote, getPollByID, getPollsSafe }