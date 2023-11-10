// Check if geolocation is supported by the browser
if ("geolocation" in navigator) {
  // Prompt user for permission to access their location
  navigator.geolocation.getCurrentPosition(
    // Success callback function
    (position) => {
      // Get the user's latitude and longitude coordinates
      window.lat = position.coords.latitude;
      window.lng = position.coords.longitude;

      // Do something with the location data, e.g. display on a map
      console.log(`Latitude: ${lat}, longitude: ${lng}`);
      setMap(lat,lng)
    },
    // Error callback function
    (error) => {
      setMap(51.505, -0.09)
      // Handle errors, e.g. user denied location sharing permissions
      console.error("Error getting user location:", error);
    }
  );
} else {
  // Geolocation is not supported by the browser
  console.error("Geolocation is not supported by this browser.");
}
async function setMap(lat,lng,x){
  document.getElementById("map").height = window.innerHeight;
  
  var map = L.map('map').setView([lat,lng], (x) ? 13 : 1600);
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  extractSearchParams()
  var data = await getData();
  if(data.error) throw error;

  var options = data.poll.pollOptions;

  options.forEach(option=>{
    var { voted_ips: voted_locations } = option;

    voted_locations.forEach(([lat,long,radius])=>{
      console.log(data)
      var circle = L.circle([lat,long], {
          color: option.color,
          fillColor: option.color,
          fillOpacity: 0.5,
          radius: radius * 1500
      }).addTo(map);
    })
  })
}

async function getData(){
  try{
    var pollID = window.search.pollID;
  
    var res = await fetch("/getPollData",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pollID
      })
    });
    var resJSON = await res.json();
    return resJSON;
  }catch(err){
    throw err
  }
}
function extractSearchParams() {
  // Get the current URL's search string (everything after the '?')
  const searchParams = window.location.search;

  // Parse the search string into an object
  const searchObj = {};
  searchParams
    .slice(1) // Remove the leading '?'
    .split('&') // Split into key-value pairs
    .forEach(param => {
      const [key, value] = param.split('=');
      searchObj[decodeURIComponent(key)] = decodeURIComponent(value);
    });

  // Assign the search object to window.search
  window.search = searchObj;
  addVoteField();
}
async function addVoteField(){
  var res = await fetch("/getPollData",{
    method: "POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      pollID: window.search.pollID
    })
  });
  var data = await res.json()
  var form = document.createElement("form");
  form.action = "/vote";
  form.method = "POST";
  var { pollName, pollDes, pollID, pollOptions } = poll;
  var h1 = document.createElement("h1");
  h1.innerHTML = pollName
  var p = document.createElement("p");
  p.innerHTML = pollDes;
  var div = document.createElement("div");
  div.className = "options";
  var pollOptions_html = pollOptions.map((option) => {
    var { optionContent, optionID } = option;
    var optionGroup = document.createElement("div");
    optionGroup.className = "optGroup";
    var label = document.createElement("label");
    // create radio buttons for each poll
    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "optionID";
    radio.value = optionID;
    label.innerHTML = optionContent;
    label.for = optionID;
    optionGroup.appendChild(label);
    optionGroup.appendChild(radio);
    div.appendChild(optionGroup)
  });
  var submit = document.createElement("button")
  submit.type = "submit";
  submit.innerHTML = "Vote"
  form.appendChild(h1);
  form.appendChild(p);
  form.appendChild(div);
  form.appendChild(submit)
  document.body.appendChild(form);
}