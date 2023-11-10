const { randomUUID, randomBytes } = require("crypto");
const IPData = require('ipdata').default;

const ipdata = new IPData(process.env.IPDATA_KEY);

async function latlongIP(ip){
  var geo = await ipdata.lookup(ip)
  if(!geo.latitude || !geo.longitude) return []
  return [geo.latitude,geo.longitude,1]
}
function guid(){
    return randomUUID();
};
module.exports = { guid, latlongIP }