async function go(){
  var pollName = document.getElementById("n").value;
  var pollDes = document.getElementById("d").value;

  var pollOpts = document.getElementById("opts").value;

  var options = pollOpts.split(",");
  var res = await fetch("/create",{
    method: "POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      pollName,
      pollDes,
      options
    })
  });
  var data = await res.json();

  if(data.error) return alert(data.error);
  window.location.href = "/poll?pollID="+data.pollID;
}

document.getElementById("sub").onclick = go;