const {app, BrowserWindow, ipcMain} = require("electron");
const fs = require("fs");

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
	window = new BrowserWindow({width:1000, height:1000, frame: false, show:false})
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



ipcMain.on("get-data", function(e, team){
	fs.readFile("C:\\Users\\kellygr\\Downloads\\Ontario Champs Tech\\Ontario Champs Tech\\2708.csv", 'utf-8', (err, data) => {
		console.log(err);
		console.log(data);
		
		var autoStart = 3;
		var teleStart = 10;
		var endgameStart = 19;
		var otherStart = 21;
		var lines = input.split("\n");
		
		var header = lines[0].split(",");
		var out = {
		  "robot":lines[1].split(",")[0],
		  "matches":[]};
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

		console.log(out);
		event.sender.set("set-data", out);
	});
})


