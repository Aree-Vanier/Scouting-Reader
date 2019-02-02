const {app, BrowserWindow, ipcMain} = require("electron");
const fs = require("fs");

const PATH = "C:\\Users\\kellygr\\Downloads\\Ontario Champs Tech\\Ontario Champs Tech\\";

var windows = {
	"index":null,
	"auto":null
}

app.on('ready', function(){
	window = new BrowserWindow({width:1000, height:1000, frame: false})
	window.loadFile("index.html")
	window.show;
	window.toggleDevTools();
	windows["index"] = window


})

app.on("browser-window-created",function(e,window) {
	window.setMenu(null);
	// window.toggleDevTools();
});

/*IPC window functions*/
ipcMain.on('window-min', function (e, window){
   windows[window].minimize();
});

ipcMain.on('window-max', function (e, window){
   if (!windows[window].isMaximized()) {
	   windows[window].maximize();
   } else {
	   windows[window].unmaximize();
   }
});

ipcMain.on('window-close', function(e,window){
   windows[window].close();
});

ipcMain.on("start-window", function(e, window){
	console.log("Starting "+window);
	window2 = new BrowserWindow({width:1000, height:1000, frame: false})
	window2.loadFile(window+".html")
	window2.show();

	windows[window] = window2;
})

ipcMain.on("get-teams", function(e){
	console.log("teams");
	e.sender.send("get-teams", [{"number":"2708"},{"number":"2706"},{"number":"2702"},{"number":"2767"}]);
});

ipcMain.on("show-team", function(e, team){
	window = new BrowserWindow({width:800, height:600, frame: false, show:false})
	window.loadFile("team.html")
	window.once('ready-to-show', function() {
		window.webContents.send("set-team", team);
		window.show();
	})
	window.toggleDevTools();
	windows["team:"+team] = window;
	console.log(team);
})

ipcMain.on("show-alliance", function(e, teams){
	window = new BrowserWindow({width:1000, height:1000, frame: false, show:false})
	window.loadFile("alliance.html")
	window.once('ready-to-show', function() {
		window.webContents.send("set-teams", teams);
		window.show();
	})
	window.toggleDevTools();
	windows["team:"+teams[0]+","+teams[1]+","+teams[2]] = window;
	console.log(team);
})



ipcMain.on("get-data", function(event, team){
	fs.readFile(PATH+"2708"+".csv", 'utf-8', (err, data) => {
		console.log(err);
		console.log(data);

		var autoStart = 3;
		var teleStart = 10;
		var endgameStart = 19;
		var otherStart = 21;
		var lines = data.split("\n");

		var header = lines[0].split(",");
		var out = {
		  "general":{},
		  "averages":{},
		  "matches":[]};

		out["general"]["number"]=lines[1].split(",")[0];
		out["general"]["name"]="team name here";
		out["general"]["rank"]=1;
		out["general"]["rpa"]=4;
		out["general"]["opr"]=100;
		out["general"]["dpr"]=100;
		out["general"]["matchCount"] = lines.length-1;

		for(var m=1; m<lines.length; m++){
		  data=lines[m].split(",");
		  console.log(m+"\t"+data[1])
		  var match = {};
		  var auto = {};
		  var tele = {};
		  var endgame = {};
		  var other = {};

		  for(var i=1; i<data.length; i++){
			if(header[i]=="") continue;
			if(i<autoStart){
			  match[header[i]]=data[i];
			}
			else if(i<teleStart){
			  auto[header[i]]=data[i];
			}
			else if(i<endgameStart){
			  tele[header[i]]=data[i];
			}
			else if(i<otherStart){
			  endgame[header[i]]=data[i];
			}
			else{
			  other[header[i]]=data[i];
			}
		  }
		  match["auto"]=auto;
		  match["tele"]=tele;
		  match["endgame"]=endgame;
		  match["other"]=other;
		  out["matches"].push(match);
		}

		var maxScale = 0;
		var maxSwitch = 0;
		var maxVault = 0;
		var maxTotal = 0;
		var sumScale = 0;
		var sumSwitch = 0;
		var sumVault = 0;
		var sumTotal = 0;
		var sumScaleMiss = 0;
		var sumSwitchMiss = 0;
		var sumVaultMiss = 0;


		var matchCount = out["general"]["matchCount"]

		var matches = out.matches;

		for(var i = 0; i<matches.length; i++){
		  let scale = parseInt(matches[i]["tele"]["Scale Cubes"])
		  let sw = parseInt(matches[i]["tele"]["Own Switch Cubes"])
			  +parseInt(matches[i]["tele"]["Other Switch Cubes"])
		  let vault = parseInt(matches[i]["tele"]["Vault Cubes"])
		  let total = parseInt(scale+sw+vault)

		  console.log(scale+"\t"+sw+"\t"+vault)

		  let scaleMiss = parseInt(matches[i]["tele"]["Scale Miss"])
		  let swMiss = parseInt(matches[i]["tele"]["Own Switch Miss"])
			  +parseInt(matches[i]["tele"]["Other Switch Miss"])
		  let vaultMiss = parseInt(matches[i]["tele"]["Vault Miss"])

		  maxScale = scale>maxScale?scale:maxScale;
		  maxSwitch = sw>maxSwitch?sw:maxSwitch;
		  maxVault = vault>maxVault?vault:maxVault;
		  maxTotal = total>maxTotal?total:maxTotal;

		  sumScale += scale;
		  sumSwitch += sw;
		  sumVault += vault;
		  sumTotal += total;

		  sumScaleMiss += scaleMiss;
		  sumSwitchMiss += swMiss;
		  sumVaultMiss += vaultMiss;

		}

		var averages = {};

		averages["Max Scale"] = maxScale;
		averages["Average Scale"] = sumScale/matchCount;
		averages["Scale Accuracy"] = sumScale/(sumScale+sumScaleMiss)

		averages["Max Switch"] = maxSwitch;
		averages["Average Switch"] = sumSwitch/matchCount;
		averages["Switch Accuracy"] = sumSwitch/(sumSwitch+sumSwitchMiss)

		averages["Max Vault"] = maxVault;
		averages["Average Vault"] = sumVault/matchCount;
		averages["Vault Accuracy"] = sumVault/(sumVault+sumVaultMiss)

		averages["Max Total"] = maxTotal;
		averages["Average Total"] = sumTotal/matchCount;

		out["averages"] = averages;

		console.log(out);
		event.sender.send("set-data", out);
	});
})
