init();

async function init() {
  var res = await fetch("/polls");
  var data = await res.json();
  polls = data.polls;
  var polls_html = polls.map((poll) => {
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
  });
}