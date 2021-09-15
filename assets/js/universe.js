var gameReadContract = undefined;
var gameWriteContract = undefined;

var planetReadContract = undefined;

$( document ).ready(function() {
    

    initializeWalletState(function(){
		initialize();
	});

	$( "#accountView" ).click(function() {
		location.href = "planets.html";
	});

	$( "#connectWalletView" ).click(function() {
  		connectToMetamask();
	});

	setTimeout(function(){ 
		dismissLoader();
	}, 3000);

});

async function initialize() {
	planetReadContract = new readerWeb3.eth.Contract(
       PlanetContractABI,
       PlanetContractAddress
    );
	gameReadContract = new readerWeb3.eth.Contract(
       GameContractABI,
       gameContractAddress
    );
    gameWriteContract = new writerWeb3.eth.Contract(
       GameContractABI,
       gameContractAddress
    );
    loadPage();
	if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', function(chainId){
        loadPage();
      });
    }
}

async function loadPage(){
  try {
    readerWeb3.eth.clearSubscriptions();


    loadPlanets();
    loadStructures();

  }catch(error){
    console.log(error);
  }
}
var globalPlanets = [];
async function loadPlanets(){
	showLoader();
	try {
		var blockNumber = await readerWeb3.eth.getBlockNumber();

		const transferEvents = await planetReadContract.getPastEvents("Transfer", {  fromBlock: blockNumber - 20000, toBlock: 'latest' ,filter: { }});
		var planets = [];
		for(var i=0; i < transferEvents.length; i++){
			var event = transferEvents[i];
			var tx = event.transactionHash;
			var tokenId = event.returnValues.tokenId;
			var owner = event.returnValues.to;
			planets.push({
				"no": tokenId,
				"owner" : owner,
				"tx" : tx,
				"image": "https://novaxgame.com/planetImages/planet"+i+".png"
			})

		}

		displayPlanets(planets);
		dismissLoader();
	}catch(error){
    console.log(error);
    dismissLoader();
  }
}



function displayPlanets(planets){

	var html = '';
	var cCount = 0;
	for (var i=planets.length - 1  ; i >= 0; i--){

		var planet = planets[i];
		var planetNo = planet.no;
		var txString = planet.tx.substring(0, 6) + "..." + planet.tx.substring(planet.tx.length-4, planet.tx.length);
		var ownerString = planet.owner.substring(0, 6) + "..." + planet.owner.substring(planet.owner.length-4, planet.owner.length);
		html += '<tr>';
		html += '<td style="cursor: pointer;" onclick="openDetail('+planetNo+')"> <img src="https://novaxgame.com/planetImages/planet'+planetNo+'.png" alt=""> #'+planetNo+' </td>';
		html += '<td style="cursor: pointer;" onclick="openLink1(\''+planet.tx+'\')"> '+txString+' </td>';
		html += '<td style="cursor: pointer;" onclick="openLink2(\''+planet.owner+'\')"> '+ownerString+' </td>';
		html += '</tr>';
		cCount += 1;
		if(cCount >= 200){
			break;
		}

	}

	document.getElementById("planetTable").innerHTML = html;
	
}

async function loadStructures(){

	const transferEvents = await gameReadContract.getPastEvents("LevelUp", {  fromBlock: 0, toBlock: 'latest' ,filter: { }});
	var structures = [];
	for(var i=0; i < transferEvents.length; i++){
		var event = transferEvents[i];
		var tx = event.transactionHash;
		var user = event.returnValues._user;
		var level = event.returnValues._level;
		var structure = event.returnValues._structure;
		var planetNo = event.returnValues._planetNo;

		var name = "";
		var image = "";
		switch(structure){
			case 's': name = "Solar Plant"; image = "assets/images/buildings/s.png"; break;
			case 'm': name = "Metal Mine"; image = "assets/images/buildings/m.png"; break;
			case 'c': name = "Crystal Laboratory";image = "assets/images/buildings/c.png"; break;
			default: break;
		}
		structures.push({
			"name": name,
			"user" : user,
			"level" : level,
			"planetNo" : planetNo,
			"tx" : tx,
			"image": image
		})

	}

	displayStructures(structures);
}



function displayStructures(structures){

	var html = '';
	var cCount = 0;
	for (var i=structures.length - 1  ; i >= 0; i--){

		var structure = structures[i];
		var txString = structure.tx.substring(0, 6) + "..." + structure.tx.substring(structure.tx.length-4, structure.tx.length);
		html += '<tr>';
		html += '<td "> <img src="'+structure.image+'" alt=""> #'+structure.name+' </td>';
		
		html += '<td style="cursor: pointer;" onclick="openDetail('+structure.planetNo+')"> <img src="https://novaxgame.com/planetImages/planet'+structure.planetNo+'.png" alt=""> #'+structure.planetNo+' </td>';
		html += '<td style="color:white;"> '+structure.level+' </td>';
		html += '<td style="cursor: pointer;" onclick="openLink3(\''+structure.tx+'\')"> '+txString+' </td>';
		html += '</tr>';
		cCount += 1;
		if (cCount > 150){
			break;
		}

	}

	document.getElementById("structureTable").innerHTML = html;
	
}

function openDetail(no){
	window.open("planetDetail.html?planetNo="+no);
}


function openLink1(tx){
	window.open("https://cchain.explorer.avax.network/tx/"+tx+"/internal-transactions", '_blank');
}

function openLink2(tx){
	window.open("https://cchain.explorer.avax.network/address/"+tx, '_blank');
}

function openLink3(tx){
	window.open("https://cchain.explorer.avax.network/tx/"+tx+"/token-transfers", '_blank');
}

function accountChanged(){
	loadPage();
}

